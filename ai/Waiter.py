import logging
from decouple import config

DIGI_MIN_INDEX=1
DIGI_MAX_INDEX=15

class Waiter:
    
    def __init__(self, bot):
        self.bot = bot

        self.logger = logging.getLogger(__class__.__name__)
        self.logger.setLevel(config('LOGLEVEL'))
        fmt = '%(asctime)s %(filename)-1s %(lineno)-8d %(levelname)-8s: %(message)s'
        fmt_date = '%Y-%m-%dT%T%Z'
        formatter = logging.Formatter(fmt, fmt_date)
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

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

    async def filter_target_security_card_action(self, ws, message):
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

    async def check_for_action(self, ws, message):
        chat_message_prefix = f'[CHAT_MESSAGE]:{self.bot.opponent}﹕'
        if not message.startswith(chat_message_prefix):
            return
        message = message.replace(chat_message_prefix, '', 1).strip().lower()
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
                await self.bot.return_(ws, card_id)
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
        prefix = 'reveal top deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            await self.bot.reveal_card_from_top_of_deck(ws, 1)
        prefix = 'trash top deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix) and len(self.game['player2DeckField']) > 0:
            await self.bot.trash_top_card_of_deck(ws)
        prefix = 'play reveal'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_reveal_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_reveal(card_id)
                await self.bot.play_card(ws, 'Reveal', card_index, 0)
        prefix = 'trash reveal'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_reveal_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_reveal(card_id)
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
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_unsuspend_until_end_of_turn.add(card['id'])
                card = self.bot.game['player2Digi'][card_index][-1]
                self.logger.info(f'{card_id} can\'t attack until end of turn.')
                await self.bot.send_message(ws, f"{card['name']} can\'t attack until end of turn.")
        prefix = 'cant block'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                card_index, _ = self.bot.find_card_index_by_id_in_battle_area(card_id)
                for card in self.bot.game['player2Digi'][card_index]:
                    self.bot.cant_unsuspend_until_end_of_turn.add(card['id'])
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

    async def wait_for_actions(self, ws):
        message = None
        while message != f'ok':
            message = await ws.recv()
            await self.check_for_action(ws, message)
            chat_message_prefix = f'[CHAT_MESSAGE]:{self.bot.opponent}﹕'
            if message.startswith(chat_message_prefix):
                message = message.replace(chat_message_prefix, '', 1).strip().lower()
