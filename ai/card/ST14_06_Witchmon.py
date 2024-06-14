import asyncio
import time

from card.Card import Card


class ST14_06_Witchmon(Card):

    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-06 Witchmon [When Digivolving] effect: I trash the top 3 cards of my deck.')
        await self.bot.trash_top_cards_of_deck(ws, 3)
