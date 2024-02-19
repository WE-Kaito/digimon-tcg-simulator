import time

from card.Card import Card


class BT12_073_Impmon_X_Antibody(Card):

    def target_type(self, card):
        if card['cardType'] != 'Digimon':
            return False    
        if 'digiTrait' not in card:
            return False
        if 'Evil' not in card['digiTraits']:
            return False
        if 'Wizard' not in card ['digiTraits']:
            return False
        if 'Demon Lord' not in card ['digiTraits']:
            return False
        return True

    async def effect(self, ws):
        if self.bot.card_of_type_in_hand('Option'):
            for i in range(len(self.bot.game['player2Trash'])):
                card = self.bot.game['player2Trash'][i]
                if self.card_has_name_in_trash('Beelzemon'):
                    await self.bot.bt12_073_impmon_x_antibody_strategy(ws)
        else:
            self.bot.send_message(ws, 'Won\'t trash any option card from my hand.')

    ## TODO: Make optional to trash up to three cards
    async def on_play_effect(self, ws):
        await super().on_play_effect(ws)
        await self.bot.send_message(ws, 'BT12-073 Impmon (X Antibody) [On Play] effect):')
        return await self.effect(ws)

    async def on_when_digivolving(self, ws):
        await self.bot.send_message(ws, 'BT12-073 Impmon (X Antibody) [When Digivolving] effect):')
        return await self.effect(ws)
    
    async def inherited_when_attacking_once_per_turn(self, ws):
        self.bot.send_message(ws, 'BT12-073 Impmon (X Antibody) inherited effect: I trash the top 3 cards of my deck.')
        trashed_cards = []
        for i in range(2):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_cards:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'], card_id=trashed_card['id'])
            await card_obj.when_trashed_effect(ws)
