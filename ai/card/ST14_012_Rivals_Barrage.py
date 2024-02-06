import math

from card.Card import Card

## TODO: Keep coding from here
class ST14_012_Rivals_Barrage(Card):

    async def delete_opponent_digimon_highest_level(self, ws):
        await self.bot.send_message(ws, 'ST14-12 Rivals\' Barrage [Main] effect:')
        if len(self.bot.game['player1Digi']) == 0:
            return False
        opponent_digimons = []
        for i in range(len(self.bot.game['player1Digi'])):
            digimon = self.bot.game['player1Digi'][i][-1]
            opponent_digimons.append(digimon['level'], i, digimon['name'])
        await self.bot.delete_card_from_opponent_battle_area(ws, sorted(opponent_digimons, reverse=True)[0])

    ## TODO: Can make this optional
    async def when_trashed_effect(self, ws):
        await self.bot.send_message(ws, 'ST14-12 Rivals\' Barrage when trashed effect:')
        card_id = self.extra_args['card_id']
        ## TODO: Use id instead of trash_index
        await self.bot.move_card_from_trash_to_battle_area(ws, card_id)
        self.bot.placed_this_turn.add(card_id)

    async def delay_effect(self, ws):
        await self.bot.send_message(ws, 'ST14-12 Rivals\' Barrage [Delay] effect:')
        await self.bot.add_card_from_trash_to_hand(ws, self.extra_args['target_card_id'])
        await self.bot.delete_card_from_battle_area(ws, self.extra_args['card_id'])

    ## TODO: Code strategy when two or more digimons have the same level
    async def on_play_effect(self, ws):
        await self.delete_opponent_digimon_highest_level(ws)