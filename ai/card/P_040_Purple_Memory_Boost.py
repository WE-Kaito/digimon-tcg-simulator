import time

from card.Card import Card


class P_040_Purple_Memory_Boost(Card):

    def __init__(self, bot, **kwargs):
        self.bot = bot
        self.extra_args = kwargs

    async def main_effect(self, ws):
        await self.bot.reveal_top_from_deck(ws, 4)
        time.sleep(3)
        await self.bot.p_040_purple_memory_boost_strategy(ws)
