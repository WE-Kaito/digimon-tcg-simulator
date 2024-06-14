import asyncio
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
                if self.bot.card_has_name_in_trash('Beelzemon'):
                    await self.bot.bt12_073_impmon_x_antibody_strategy(ws)

    ## TODO: Make optional to trash up to three cards
    async def on_play_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'BT12-073 Impmon (X Antibody) [On Play] effect):')
        return await self.effect(ws)

    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'BT12-073 Impmon (X Antibody) [When Digivolving] effect):')
        return await self.effect(ws)
    
    async def inherited_when_attacking_once_per_turn(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'BT12-073 Impmon (X Antibody) inherited effect: I trash the top 3 cards of my deck.')
        await self.bot.trash_top_cards_of_deck(ws, 3)
