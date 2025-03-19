import json
import logging
from datetime import datetime, timedelta
from decouple import config
import re

DIGI_MIN_INDEX=1
DIGI_MAX_INDEX=15

class Waiter:
    
    def __init__(self, bot):
        self.bot = bot
        self.timestamp = None
        self.TIMEOUT_INTERVAL = config('TIMEOUT_INTERVAL', cast=int)
        self.ignore_next_move_action = False # Helper for avoiding process_move_action to trigger when cards has been already moved to the bottom of the stack

        self.logger = logging.getLogger(__class__.__name__)
        self.logger.setLevel(config('LOGLEVEL'))
        fmt = '%(asctime)s %(filename)-1s %(lineno)-8d %(levelname)-8s: %(message)s'
        fmt_date = '%Y-%m-%dT%T%Z'
        formatter = logging.Formatter(fmt, fmt_date)
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def get_opponent_location(self, s):
        location = None
        if s.startswith('Digi'):
            index = self.bot.get_first_digit_index(s)
            index = int(s[index:])
            location = self.bot.game['player1Digi'][index-1]
        elif s=='Hand' or s == 'Trash' or s == 'Security' or \
            s == 'DeckField' or s == 'EggDeck' or s == 'BreedingArea' or \
            s == 'Reveal':
                location = self.bot.game[f'player1{s}']
        else:
            raise RuntimeError(f'Error in determining location:{s}')
        return location

    def process_move_action(self, message):
        record = message.split(':')
        card_id = record[0]
        source = record[1].replace('opponent', '')
        source_location = self.get_opponent_location(source)
        destination = record[2].replace('opponent', '')
        destination_location = self.get_opponent_location(destination)
        source_card_index = -1
        for i in range(len(source_location)):
            if source_location[i]['id'] == card_id:
                source_card_index = i
                break
        if source_card_index < 0:
            raise RuntimeError(f'Card with id {card_id} not found in {source}')
        destination_location.append(source_location.pop(source_card_index))
    
    def process_move_to_deck_action(self, message):
        record = message.split(':')
        where = record[0]
        card_id = record[1]
        source = record[2].replace('opponent', '')
        source_location = self.get_opponent_location(source)
        destination = record[3].replace('opponent', '')
        if destination.startswith('Digi'):
            self.ignore_next_move_action = True
        destination_location = self.get_opponent_location(destination)
        source_card_index = -1
        for i in range(len(source_location)):
            if source_location[i]['id'] == card_id:
                source_card_index = i
                break
        if source_card_index < 0:
            raise RuntimeError(f'Card with id {card_id} not found in {source}')
        if where == 'Top':
            destination_location.insert(0, source_location.pop(source_card_index))
        elif where == 'Bottom':
            destination_location.append(source_location.pop(source_card_index))

    async def wait_for_opponent_counter_blocking(self, ws):
        await self.bot.send_message(ws, 'Perform Counter, Blocking time and Security Checks, then type "Ok" in Chat')
        await self.wait_for_actions(ws)

    async def send_invalid_command_message(self, ws):
        await self.bot.send_message(ws, 'Invalid command.')

    async def filter_target_digimon_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 2 and message[1].isdigit():
            card_index = int(message[1])
            if card_index >= DIGI_MIN_INDEX and card_index <= DIGI_MAX_INDEX and len(self.bot.game['player2Digi'][card_index-1]) > 0:
                return self.bot.game['player2Digi'][card_index-1][-1]['id']
        await self.send_invalid_command_message(ws)
        return False

    async def filter_attacker_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 2 and message[1].isdigit():
            card_index = int(message[1])
            if card_index >= DIGI_MIN_INDEX and card_index <= DIGI_MAX_INDEX and len(self.bot.game['player1Digi'][card_index-1]) > 0:
                return self.bot.game['player1Digi'][card_index-1][-1]['id']
        await self.send_invalid_command_message(ws)
        return False

    async def filter_security_check_action(self, ws, message):
        if len(self.bot.game['player2Security']) == 0:
            await self.bot.surrender(ws, "Oh no! Direct attack, you win!")
            return False
        message = message.split(' ')
        if len(message) == 1:
            return self.bot.game['player2Security'][0]['id']
        await self.send_invalid_command_message(ws)
        return False
    
    async def filter_target_security_card_action(self, ws, message):
        if message == 'security_check' and len(self.bot.game['player2Security']) == 0:
            await self.bot.surrender(ws, "Oh no! Direct attack, you win!")
            return False
        message = message.split(' ')
        if len(message) == 2 and message[1].isdigit():
            card_index = int(message[1])
            if card_index >= 1 and card_index <= len(self.bot.game['player2Security']):
                return self.bot.game['player2Security'][card_index-1]['id']
        await self.send_invalid_command_message(ws)
        return False
    
    async def filter_target_reveal_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 2 and message[1].isdigit():
            card_index = int(message[1])
            if card_index >= 1 and card_index <= len(self.bot.game['player2Reveal']):
                return self.bot.game['player2Reveal'][card_index-1]['id']
        await self.send_invalid_command_message(ws)
        return False
    
    async def filter_target_trash_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 2 and message[1].isdigit():
            card_index = int(message[1])
            trash_size = len(self.bot.game['player2Trash'])
            if card_index >= 1 and card_index <= trash_size:
                return self.bot.game['player2Trash'][trash_size-card_index]['id']
        await self.send_invalid_command_message(ws)
        return False

    async def filter_trash_digivolution_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 3 and message[1].isdigit() and message[2].isdigit():
            card_id = await self.filter_target_digimon_action(ws, ' '.join(message[:-1]))
            if not card_id:
                return False, False
            target_digimon = self.bot.game['player2Digi'][self.bot.find_card_index_by_id_in_battle_area(card_id)[0]]
            digivolution_card_index = int(message[2])
            if digivolution_card_index > 0 and digivolution_card_index <= len(target_digimon[:-1]):
                return target_digimon[-1]['id'], target_digimon[digivolution_card_index-1]['id']
        await self.send_invalid_command_message(ws)
        return False, False
    
    async def filter_de_digivolve_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 3 and message[1].isdigit() and message[2].isdigit():
            card_id = await self.filter_target_digimon_action(ws, ' '.join(message[:-1]))
            if not card_id:
                return False, False
            target_digimon = self.bot.game['player2Digi'][self.bot.find_card_index_by_id_in_battle_area(card_id)[0]][-1]
            if target_digimon['cardType'] != 'Digimon':
                return False, False
            n = int(message[2])
            return target_digimon['id'], n
        await self.send_invalid_command_message(ws)
        return False, False

    async def filter_from_deck_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 2 and message[-1].isdigit():
            n = int(message[-1])
            return n
        await self.send_invalid_command_message(ws)
        return False
    
    async def reset_timestamp(self):
        self.timestamp = datetime.now()
        self.logger.info('Player\'s still online.')

    async def check_for_action(self, ws, message):
        create_token_prefix = '[CREATE_TOKEN]:'
        if message.startswith(create_token_prefix):
            card_id, card_name = message.replace(create_token_prefix, '').split(':')
            self.bot.spawn_token(card_id, card_name)
        if message.startswith(f'[OPPONENT_ONLINE]') or message.startswith('[OPPONENT_RECONNECTED]'):
            await self.reset_timestamp()
        if not await self.check_timestamp():
            return False
        update_memory_prefix = '[UPDATE_MEMORY]'
        if message.startswith(update_memory_prefix):
            self.bot.game['memory'] = int(message.replace('[UPDATE_MEMORY]:', ''))
        move_message_prefix = '[MOVE_CARD]:'
        if message.startswith(move_message_prefix) and not self.ignore_next_move_action:
            self.process_move_action(message.replace(move_message_prefix, '', 1))
        elif self.ignore_next_move_action:
            self.ignore_next_move_action = False
        move_message_prefix = '[MOVE_CARD_TO_STACK]:'
        if message.startswith(move_message_prefix):
            self.process_move_to_deck_action(message.replace(move_message_prefix, '', 1))
        shuffle_security_prefix = '【↻ Security Stack】'
        if message.startswith('[UPDATE_OPPONENT]'):
            updated_game = ''
            while message.startswith('[UPDATE_OPPONENT]'):
                updated_game += message.replace('[UPDATE_OPPONENT]:', '')
                await self.bot.loaded_ping(ws)
                message = await ws.recv()
                self.logger.debug(f'Received: {message}')
            await self.bot.update_opponent_game(ws, json.loads(updated_game))
        chat_message_prefix = f'[CHAT_MESSAGE]:{self.bot.opponent}﹕'
        message = message.replace(chat_message_prefix, '', 1).strip().lower()
        prefix = 'suspend'
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                card_index, _  = self.bot.find_card_index_by_id_in_battle_area(card_id)
                await self.bot.suspend_card(ws, card_index)
        prefix = 'unsuspend'
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                card_index, _  = self.bot.find_card_index_by_id_in_battle_area(card_id)
                await self.bot.unsuspend_card(ws, card_index)
        prefix = 'delete'
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                await self.bot.delete_stack_from_battle_area(ws, card_id)
        prefix = 'return bottom deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.return_from_battle_area_to_bottom_of_deck(ws, card_id)
        prefix = 'return top deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.return_from_battle_area_to_top_of_deck(ws, card_id)
        prefix = 'return hand'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.return_from_battle_area_to_hand(ws, card_id)
        prefix = 'trash digivolution card'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id, digivolution_card_id  = await self.filter_trash_digivolution_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.trash_digivolution_card(ws, card_id, digivolution_card_id)
        prefix = 'trash all digivolution cards'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.trash_all_digivolution_cards(ws, card_id)
        prefix = 'trash top security'
        if message.startswith(prefix):
            await self.bot.trash_top_card_of_security(ws)
        prefix = 'trash bottom security'
        if message.startswith(prefix):
            await self.bot.trash_bottom_card_of_security(ws)
        prefix = 'place top security'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.place_card_from_battle_area_on_top_of_security(ws, card_id)
        prefix = 'place bottom security'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.place_card_from_battle_area_to_bottom_of_security(ws, card_id)
        prefix = 'reveal security'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_security_card_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.reveal_card_from_security(ws, card_id)
        prefix = 'security check'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_security_check_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.security_check(ws, card_id)
        prefix = 'reveal top deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix) and len(self.bot.game['player2DeckField']) > 0:
            await self.bot.reveal_card_from_top_of_deck(ws, 1)
        prefix = 'draw'
        if message.startswith(prefix) and len(self.bot.game['player2DeckField']) > 0:
            n = await self.filter_from_deck_action(ws, message.replace(prefix, prefix_with_delimiter))
            if n:
                await self.bot.draw(ws, n)
        prefix = 'trash top deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix) and len(self.bot.game['player2DeckField']) > 0:
            n = await self.filter_from_deck_action(ws, message.replace(prefix, prefix_with_delimiter))
            if n:
                await self.bot.trash_top_cards_of_deck(ws, n)
        prefix = 'play reveal'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_reveal_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index = self.bot.find_card_index_by_id_in_reveal(card_id)
                card = self.bot.game['player2Reveal'][card_index]
                back = False
                if card['cardType'] == 'Option' and 'Delay' in card['mainEffect'] or card['cardType'] == 'Tamer':
                    back = True
                await self.bot.play_card(ws, 'Reveal', card_index, 0, back)
        prefix = 'play trash'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_trash_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index = self.bot.find_card_index_by_id_in_trash(card_id)
                card = self.bot.game['player2Trash'][card_index]
                back = False
                if card['cardType'] == 'Option' and 'Delay' in card['mainEffect'] or card['cardType'] == 'Tamer':
                    back = True
                await self.bot.play_card(ws, 'Trash', card_index, 0, back)
        prefix = 'trash reveal'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_reveal_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index = self.bot.find_card_index_by_id_in_reveal(card_id)
                await self.bot.trash_card_from_reveal(ws, card_index)
        prefix = 'stun'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_attack_until_end_of_turn.add(card['id'])
                    self.bot.cant_block_until_end_of_opponent_turn.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'Stunned {card_id}')
                await self.bot.send_message(ws, f"{card['name']} can\'t attack or block until end of turn.")
        prefix = 'cant attack'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_attack_until_end_of_turn.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'{card_id} can\'t attack until end of turn.')
                await self.bot.send_message(ws, f"{card['name']} can\'t attack until end of turn.")
        prefix = 'cant block'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_block_until_end_of_opponent_turn.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'{card_id} can\'t block until end of turn.')
                await self.bot.send_message(ws, f"{card['name']} can\'t block until end of turn.")
        prefix = 'cant unsuspend'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_unsuspend_until_end_of_turn.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'{card_id} can\'t unsuspend until end of turn.')
                await self.bot.send_message(ws, f"{card['name']} can\'t unsuspend until end of turn.")
        prefix = 'start mp attack'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.start_mp_attack.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'{card_id} gains: Start of main phase, this digimon attacks.')
                await self.bot.send_message(ws, f"{card['name']} gains: Start of main phase, this digimon attacks.")
        prefix = 'cant suspend'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_suspend_until_end_of_turn.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'{card_id} can\'t suspend until end of turn.')
                await self.bot.send_message(ws, f"{card['name']} can\'t suspend until end of turn.")
        prefix = 'de-digivolve'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id, n  = await self.filter_de_digivolve_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.de_digivolve(ws, card_id, n)
        prefix = 'collision'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id  = await self.filter_attacker_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.collision_strategy(ws, card_id)
        return True
    
    async def check_timestamp(self):
        if self.timestamp is None:
            await self.reset_timestamp()
            return True
        if datetime.now() - self.timestamp > timedelta(seconds=self.TIMEOUT_INTERVAL):
            return False
        return True

    async def wait_for_actions(self, ws):
        message = None
        message_payload = None
        await self.reset_timestamp()
        while message_payload != f'ok':
            chat_message_prefix = f'[CHAT_MESSAGE]:{self.bot.opponent}﹕'
            message = await ws.recv()
            if message.startswith(chat_message_prefix):
                message_payload = message.replace(chat_message_prefix, '', 1).strip().lower()
            if not await self.check_for_action(ws, message):
                return False
        return True
