from card.Card import Card


class BT10_081_Baalmon(Card):

    ## TODO: Make optional to trash up to three cards
    async def when_attacking_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'BT10-081 Baalmon when attacking effect: I may trash 3 cards from top of deck.')
        await self.bot.bt10_081_baalmon_attacking_strategy(ws)

    async def on_deletion_effect(self, ws):
        await self.bot.send_message(ws, 'BT10-081 Baalmon [On Deletion] effect:')
        if len(self.bot.game['player2Trash']) >= 10:
            if self.bot.card_has_name_in_trash('Beelzemon') >= 0:
                await self.bot.send_message(ws, 'Found Beelzemon in trash and have 10 or more cards in trash:')
                await self.bot.bt10_081_baalmon_deleted_strategy(ws)
        else:
            await self.bot.send_message(ws, 'Not enough cards in trash (<= 10)')
