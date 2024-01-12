import math

from Card import Card


class EX2_071_Death_Slinger(Card):

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game

    async def when_trashed_effect(self, ws):
        self.bot.increase_memory_by(ws, 1)
    
    ## TODO: Can code strategy
    async def on_play_effect(self, ws):
        max_level_can_delete = 4 + math.floor(len(self.game['player2Trash'])/10)
        opponent_digimons = []
        for i in range(len(self.game['player1Digi'])):
            digimon = self.game['player1Digi'][i][-1]
            opponent_digimons.append(digimon['level'], i, digimon['name'])
        for opponent_digimon in sorted(opponent_digimons, reverse=True):
            if max_level_can_delete <= opponent_digimon[0]:
                self.delete_from_opponent_battle_area(ws, opponent_digimon[1])
                self.send_game_chat_message(f"EX2 Beelzemon effect: Delete {opponent_digimon[2]['name']} in position {opponent_digimon[1]}")
