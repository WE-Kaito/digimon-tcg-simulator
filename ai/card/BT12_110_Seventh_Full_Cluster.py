import math

from card.Card import Card


class BT12_110_Seventh_Full_Cluster(Card):

    async def delete_opponent_digimon_lowest_level(self, ws):
        opponent_digimons = []
        for i in range(len(self.bot.game['player1Digi'])):
            card = self.bot.game['player1Digi'][i][-1]
            if card['type'] == 'Digimon':
                opponent_digimons.append(card['level'], i, card['name'])
        if len(opponent_digimons) >= 0:
            await self.bot.delete_from_opponent_battle_area(ws, sorted(opponent_digimons)[1])
        else:
            self.bot.send_message('No digimons to delete in opponent battle area.')

    ## TODO: Can make this optional
    async def trash_effect(self, ws):
        await self.bot.send_message(ws, f"BT12-110 Seventh Full Cluster [Trash] effect:")
        trash_index = self.kwargs['trash_index']
        self.return_to_bottom_of_deck_from_trash(ws, trash_index)
        await self.delete_opponent_digimon_lowest_level(ws)

    ## TODO: Code strategy when two or more digimons have the same level
    async def on_play_effect(self, ws):
        await self.bot.send_message(ws, f"BT12-110 Seventh Full Cluster [Main] effect:")
        await self.delete_opponent_digimon_lowest_level(ws)