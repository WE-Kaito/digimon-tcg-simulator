from Card import Card


class BT10_081_Baalmon(Card):

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game

    ## TODO: Can target strategy to 
    async def when_attacking_effect(self, ws):
        self.bt10_081_baalmon_attacking_strategy(ws)

    ## TODO: Make optional to trash up to three cards
    async def on_deletion_effect(self, ws):
        if len(self.game['player2Trash']) >= 10:
            if self.card_has_name_in_trash('Beelzemon'):
                self.bt10_081_baalmon_deleted_strategy(ws)
