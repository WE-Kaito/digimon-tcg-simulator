import asyncio
import time

from card.Card import Card


class BT2_068_Impmon(Card):

    ## TODO: Make optional to trash up to three cards
    async def on_deletion_effect(self, ws):
        await self.bot.send_message(ws, 'BT2-068 Impmon [On Deletion] effect: I trash 3 cards from top of deck.')
        await self.bot.trash_top_cards_of_deck(ws, 3)
