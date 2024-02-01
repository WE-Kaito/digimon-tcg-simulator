import time

from card.Card import Card


class ST14_01_Yaamon(Card):

    def __init__(self, bot, **kwargs):
        super().__init__()
        self.bot = bot
        self.extra_args = kwargs

    async def inherited_when_attacking_once_per_turn(self, ws):
        trashed_cards = []
        attacking_digimon = self.extra_args['attacking_digimon']
        if 'Evil' in attacking_digimon['digiType'] or 'Wizard' in attacking_digimon['digiType'] or 'Demon Lord' in attacking_digimon['digiType']:
            for i in range(2):
                if len(self.bot.game['player2DeckField']) > 0:
                    time.sleep(0.3)
                    trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
            for i in range(len(trashed_cards)):
                card_obj = self.bot.card_factory.get_card(trashed_cards[i]['uniqueCardNumber'], trash_index=i)
                await card_obj.when_trashed_effect(ws)
