import asyncio
import math
import time

from card.Card import Card


class EX2_044_Beelzemon(Card):
    
    async def when_trashed_effect(self, ws):
        await self.bot.send_message(ws, f"EX2-044 Beelzemon when trashed effect:")
        if self.bot.card_has_name_in_trash('Impmon'):
            await self.bot.ex2_044_beelzemon_when_trashed_strategy(ws)

    async def when_digivolving_when_attacking_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.trash_top_cards_of_deck(ws, 3)
        await self.bot.ex2_044_beelzemon_when_digivolving_when_attacking_strategy(ws)

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, f"EX2-044 Beelzemon [When Digivolving] effect:")
        await self.when_digivolving_when_attacking_effect(ws)
    
    async def when_attacking_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, f"EX2-044 Beelzemon [When Attacking] effect:")
        await self.when_digivolving_when_attacking_effect(ws)
