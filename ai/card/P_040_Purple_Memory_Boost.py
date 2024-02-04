import time

from card.Card import Card


class P_040_Purple_Memory_Boost(Card):

    async def main_effect(self, ws):
        await self.bot.send_message(ws, f"P-040 Purple Memory Boost [Main] effect: Reveal 4.")
        await self.bot.reveal_top_from_deck(ws, 4)
        time.sleep(3)
        await self.bot.p_040_purple_memory_boost_strategy(ws)
    
    async def delay_effect(self, ws):
        await self.bot.send_message(ws, f"P-040 Purple Memory Boost [Delay] effect: Gain 2 memory.")
        await self.bot.increase_memory_by(ws, 2)
