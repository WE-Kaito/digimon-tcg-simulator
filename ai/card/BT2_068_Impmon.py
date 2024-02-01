import time

from card.Card import Card


class BT2_068_Impmon(Card):

    def __init__(self, bot, **kwargs):
        self.bot = bot
        self.extra_args = kwargs

    ## TODO: Make optional to trash up to three cards
    async def on_deletion_effect(self, ws):
        self.logger.info('BT2-068 Impmon on deletion effect: Trash 3 cards from top of deck.')
        trashed_cards = []
        for i in range(3):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_card:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            await card_obj.when_trashed_effect(ws)
