DIGI_MIN_INDEX=1
DIGI_MAX_INDEX=15

class Waiter:
    
    def __init__(self, bot):
        self.bot = bot

    async def wait_for_opponent_counter_blocking(self, ws):
        await self.bot.send_message(ws, 'Perform Counter and Blocking time, then type "Ok" in Chat')
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

    async def filter_trash_digivolution_action(self, ws, message):
        message = message.split(' ')
        if len(message) == 3 and message[1].isdigit() and message[2].isdigit():
            card_id = await self.filter_target_digimon_action(ws, ' '.join(message[:-1]))
            if not card_id:
                return False, False
            target_digimon = self.bot.game['player2Digi'][self.bot.find_card_index_by_id_in_battle_area(card_id)]
            digivolution_card_index = int(message[2])
            if digivolution_card_index > 0 and digivolution_card_index <= len(target_digimon[:-1]):
                return target_digimon[-1]['id'], digivolution_card_index-1
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
                await self.bot.delete_card_from_battle_area(ws, card_id)
        prefix = 'return bottom deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.return_from_battle_area_to_bottom_of_deck(ws, card_id)
        if message.startswith('return hand'):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.return_from_battle_area_to_hand(ws, card_id)
        if message.startswith('stun'):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                self.bot.cant_attack_until_end_of_turn.add(card_id)
                self.bot.cant_block_until_end_of_turn.add(card_id)
        if message.startswith('suspend'):
            card_id = await self.filter_target_digimon_action(ws, message)
            if card_id:
                await self.bot.suspend_digimon(ws, card_id)
        prefix = 'cannot unsuspend'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                self.bot.cant_unsuspend_until_end_of_turn.add(ws, card_id)
        prefix = 'cannot suspend'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                self.bot.cant_suspend_until_end_of_turn.add(ws, card_id)
        prefix = 'trash digivolution card'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id, digivolution_card_index  = await self.filter_trash_digivolution_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.trash_digivolution_card(ws, card_id, digivolution_card_index)
        prefix = 'trash all digivolution cards'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.trash_all_digivolution_card(ws, card_id)
        prefix = 'trash top security'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.trash_top_card_of_security(ws, card_id)
        prefix = 'trash bottom security'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
        prefix = 'place on top of security stack'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.place_card_from_battle_area_on_top_of_security(ws, card_id)
        prefix = 'place to bottom security stack'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.place_card_from_battle_area_to_bottom_of_security(ws, card_id)
        prefix = 'reveal from top of deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            await self.bot.reveal_card_from_top_from_deck(ws, 0)
        prefix = 'trash from top of deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            await self.bot.trash_top_card_of_deck(ws)
        prefix = 'return to bottom of deck'
        prefix_with_delimiter = prefix.replace(' ', '_')
        if message.startswith(prefix):
            card_id = await self.filter_target_digimon_action(ws, message.replace(prefix, prefix_with_delimiter))
            if card_id:
                await self.bot.place_card_from_battle_area_to_bottom_of_security(ws, card_id)

    async def wait_for_actions(self, ws):
        message = None
        while message != f'ok':
            message = await ws.recv()
            chat_message_prefix = f'[CHAT_MESSAGE]:{self.bot.opponent}﹕'
            if message.startswith(chat_message_prefix):
                message = message.replace(chat_message_prefix, '', 1).strip().lower()
                await self.check_for_action(ws, message)
