import asyncio
import time

from card.Card import Card


class ST14_07_Baalmon(Card):

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-07 Baalmon [When Digivolving] effect: I trash the top 3 cards of my deck.')
        await self.bot.send_message(ws, 'ST14-07 Baalmon [When Digivolving] effect: Gains [On Deletion] If there are 10 or more cards in your trash, you may play 1 Beelzemon from trash without paying the cost until the end of opponent\'s turn.')
        await self.bot.trash_top_cards_of_deck(ws, 3)
        self.bot.gained_baalmon_effect.add(self.extra_args['card_id'])