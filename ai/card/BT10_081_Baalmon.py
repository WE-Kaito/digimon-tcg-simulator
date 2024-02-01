from card.Card import Card


class BT10_081_Baalmon(Card):

    def __init__(self, bot, **kwargs):
        super().__init__()
        self.bot = bot
        self.extra_args = kwargs

    ## TODO: Can target strategy to 
    async def when_attacking_effect(self, ws):
        await self.bt10_081_baalmon_attacking_strategy(ws)

    ## TODO: Make optional to trash up to three cards
    async def on_deletion_effect(self, ws):
        if len(self.bot.game['player2Trash']) >= 10:
            if self.card_has_name_in_trash('Beelzemon'):
                await self.bt10_081_baalmon_deleted_strategy(ws)
