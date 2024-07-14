import asyncio
import time

from card.Card import Card


class EX2_039_Impmon(Card):

    async def put_cards_to_bottom_of_deck(self, ws):
        time.sleep(2)
        for i in range(len(self.bot.game['player2Reveal'])):
            await self.bot.put_card_to_bottom_of_deck(ws, 'Reveal', 0)

    ## TODO: Make optional to trash up to three cards
    async def when_trashed_effect(self, ws):
        await self.bot.send_message(ws, f"EX2-039 Impmon effect when trashed: I trash 3 cards from top of deck.")
        await self.bot.trash_top_cards_of_deck(ws, 3)

    async def on_play_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, f"EX2-039 Impmon [On Play] effect: Reveal 4.")
        await self.bot.reveal_card_from_top_of_deck(ws, 4)
        time.sleep(3)
        beelzemon_candidates = []
        ai_and_mako_candidates = []
        for i in range(len(self.bot.game['player2Reveal'])):
            card = self.bot.game['player2Reveal'][i]
            if 'Beelzemon' in card['name']:
                beelzemon_candidates.append(i)
            elif 'Ai & Mako' in card['name']:
                ai_and_mako_candidates.append(i)
        ## Better strategy on which Beelzemon and which Ai & Mako to get can be implemented here
        if len(beelzemon_candidates) > 0:
            card_index = beelzemon_candidates[0]
            await self.bot.send_message(ws, f"Can add {card['uniqueCardNumber']}-{card['name']} in my hand.")
            card_id = self.bot.game['player2Reveal'][card_index]['id']
            await self.bot.add_card_from_reveal_to_hand(ws, card_id)
        if len(ai_and_mako_candidates) > 0:
            card_index = ai_and_mako_candidates[0]
            await self.bot.send_message(ws, f"Can add {card['uniqueCardNumber']}-{card['name']} in my hand.")
            card_id = self.bot.game['player2Reveal'][card_index]['id']
            await self.bot.add_card_from_reveal_to_hand(ws, card_id)
        time.sleep(2)
        await self.put_cards_to_bottom_of_deck(ws)   
