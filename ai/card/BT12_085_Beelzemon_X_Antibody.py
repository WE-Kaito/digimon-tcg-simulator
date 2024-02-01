import math

from card.Card import Card


class BT12_085_Beelzemon_X_Antibody(Card):

    def __init__(self, bot, **kwargs):
        super().__init__()
        self.bot = bot
        self.extra_args = kwargs

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        digimon_index = self.extra_args['digimon_index']
        for c in self.bot.game['player2Digi'][digimon_index][:-1]:
            if c['name'] == 'Beelzemon' or c['name'] == 'Beelzemon':
                n_sec_trash = min(math.floor(len(self.bot.game['player2Trash'])/10), self.bot.game['player1Security'])
                await self.bot.send_game_chat_message(f"Beelzemon (X Antibody) when digivolving effect. Cards in trash: {len(self.bot.game['player2Trash'])}, {n_sec_trash} get trashed from your security stack.")

    async def on_deletion_effect(self, ws):
        self.bt12_085_beelzemon_x_antibody_on_deletion_strategy(ws)