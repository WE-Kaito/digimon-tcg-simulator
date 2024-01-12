import math

from Card import Card


class BT12_110_Seventh_Full_Cluster(Card):

    def __init__(self, bot, game, **kwargs):
        self.bot = bot
        self.game = game

    def delete_opponent_digimon_lowest_level(self, ws):
        opponent_digimons = []
        for i in range(len(self.game['player1Digi'])):
            digimon = self.game['player1Digi'][i][-1]
            opponent_digimons.append(digimon['level'], i, digimon['name'])
        self.bot.delete_from_opponent_battle_area(ws, sorted(opponent_digimons)[1])

    ## TODO: Can make this optional
    async def trash_effect(self, ws):
        trash_index = self.kwargs['trash_index']
        self.return_to_bottom_of_deck_from_trash(ws, trash_index)
        self.delete_opponent_digimon_lowest_level(ws)


    ## TODO: Code strategy when two or more digimons have the same level
    async def on_play_effect(self, ws):
        self.delete_opponent_digimon_lowest_level(ws)