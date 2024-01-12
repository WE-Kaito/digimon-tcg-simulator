import time

from Card import Card


class P_040_PurpleMemoryBoost(Card):

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game

    async def main_effect(self, ws):
        await self.bot.reveal_top_from_deck(ws, 4)
        time.sleep(3)
        self.bot.p_040_purple_memory_boost_strategy(ws)

