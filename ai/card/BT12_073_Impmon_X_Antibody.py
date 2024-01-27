import time

from card.Card import Card


class BT12_073_Impmon_X_Antibody(Card):

    def __init__(self, bot, **kwargs):
        self.bot = bot
        self.extra_args = kwargs

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

    ## TODO: Make optional to trash up to three cards
    async def on_play_effect(self, ws):
        return await self.effect(ws)

    async def on_play_effect(self, ws):
        return await self.effect(ws)
