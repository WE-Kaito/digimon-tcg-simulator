import math

from card.Card import Card


class BT12_085_Beelzemon_X_Antibody(Card):
    
    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        digimon_index = self.extra_args['digimon_index']
        for c in self.bot.game['player2Digi'][digimon_index][:-1]:
            if c['name'] == 'Beelzemon' or c['name'] == 'Beelzemon':
                n_sec_trash = min(math.floor(len(self.bot.game['player2Trash'])/10), len(self.bot.game['player1Security']))
                await self.bot.send_message(ws, f"Beelzemon (X Antibody) [When Digivolving] effect: Cards in trash: {len(self.bot.game['player2Trash'])}, {n_sec_trash} cards get trashed from your security stack. Resolve the effect and press ok to continue.")
                await self.bot.waiter.wait_for_actions(ws)
    async def on_deletion_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, f"Beelzemon (X Antibody) [On Deletion] effect:")
        self.bt12_085_beelzemon_x_antibody_on_deletion_strategy(ws)