import asyncio
import time

from card.Card import Card


class ST14_07_Baalmon(Card):

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-07 Baalmon [When Digivolving] effect: I trash the top 3 cards of my deck.')
        await self.bot.send_message(ws, 'ST14-07 Baalmon [When Digivolving] effect: Gains [On Deletion] Play 1 Beelzemon from trash without paying the cost until the end of opponent\'s turn.')
        trashed_cards = []
        for i in range(3):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_cards:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'], card_id=trashed_card['id'])
            await card_obj.when_trashed_effect(ws)
        await self.bot.when_card_is_trashed_from_deck(ws)
        self.bot.gained_baalmon_effect.add(self.extra_args['card_id'])