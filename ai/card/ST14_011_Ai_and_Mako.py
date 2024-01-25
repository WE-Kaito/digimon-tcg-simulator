import time

from Card import Card

## TODO: Keep coding from here
class ST14_011_Ai_and_Mako(Card):

    def __init__(self, bot, game, **kwargs):
        self.bot = bot
        self.game = game

    async def on_play_effect(self, ws):
        await self.bot.reveal_top_from_deck(ws, 4)
        time.sleep(3)
        self.bot.st14_011_ai_and_mako_on_play_strategy(ws)
    
    async def your_turn_effect(self, ws):
        self.bot.st14_011_ai_and_mako_your_turn_strategy(ws)
