import time

from Card import Card


class BT2_068_Impmon(Card):

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game

    ## TODO: Make optional to trash up to three cards
    async def on_deletion_effect(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_card:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            card_obj.when_trashed_effect()
