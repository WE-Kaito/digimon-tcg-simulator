import math

from Card import Card


class BT12_085_Beelzemon_X_Antibody(Card):

    def __init__(self, bot, game, **kwargs):
        self.bot = bot
        self.game = game

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        digimon_index = self.kwargs['digimon_index']
        for c in self.game['player2Digi'][digimon_index][:-1]:
            if c['name'] == 'Beelzemon' or c['name'] == 'Beelzemon':
                n_sec_trash = min(math.floor(len(self.game['player2Trash'])/10), self.game['player1Security'])
                self.bot.send_game_chat_message(f"Beelzemon (X Antibody) when digivolving effect. Cards in trash: {len(self.game['player2Trash'])}, {n_sec_trash} get trashed from your security stack.")

    async def on_deletion_effect():
        pass