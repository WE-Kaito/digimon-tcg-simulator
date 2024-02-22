import time

from card.Card import Card


class ST14_01_Yaamon(Card):

    async def inherited_when_attacking_once_per_turn(self, ws):
        await super().animate_effect(ws)
        trashed_cards = []
        attacking_digimon = self.extra_args['attacking_digimon']
        if 'Evil' in attacking_digimon['digiType'] or 'Wizard' in attacking_digimon['digiType'] or 'Demon Lord' in attacking_digimon['digiType']:
            await self.bot.send_message(ws, 'ST14-01 Yaamon inherited effect: I trash the top 2 cards of my deck.')
            for i in range(2):
                if len(self.bot.game['player2DeckField']) > 0:
                    time.sleep(0.3)
                    trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
            for trashed_card in trashed_cards:
                card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'], card_id=trashed_card['id'])
                await card_obj.when_trashed_effect(ws)
