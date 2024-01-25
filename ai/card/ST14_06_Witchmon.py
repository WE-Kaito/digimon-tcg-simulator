import time

from card.Card import Card


class ST14_06_Witchmon(Card):

    def __init__(self, bot):
        self.bot = bot

    async def when_digivolving_effect(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_cards:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            await card_obj.when_trashed_effect(ws)
