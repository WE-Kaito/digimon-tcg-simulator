import math

from card.Card import Card


class BT12_110_Seventh_Full_Cluster(Card):

    def __init__(self, bot, **kwargs):
        self.bot = bot
        self.extra_args = kwargs

    async def delete_opponent_digimon_lowest_level(self, ws):
        opponent_digimons = []
        for i in range(len(self.bot.game['player1Digi'])):
            digimon = self.bot.game['player1Digi'][i][-1]
            opponent_digimons.append(digimon['level'], i, digimon['name'])
        await self.bot.delete_from_opponent_battle_area(ws, sorted(opponent_digimons)[1])

    ## TODO: Can make this optional
    async def trash_effect(self, ws):
        trash_index = self.kwargs['trash_index']
        self.return_to_bottom_of_deck_from_trash(ws, trash_index)
        await self.delete_opponent_digimon_lowest_level(ws)


    ## TODO: Code strategy when two or more digimons have the same level
    async def on_play_effect(self, ws):
        await self.delete_opponent_digimon_lowest_level(ws)