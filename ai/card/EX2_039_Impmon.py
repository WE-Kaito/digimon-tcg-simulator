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
        trashed_cards = []
        for i in range(3):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_cards:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'], card_id=trashed_card['id'])
            await card_obj.when_trashed_effect(ws)
        await self.bot.when_card_is_trashed_from_deck(ws)

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
            await self.add_card_from_reveal_to_hand(ws, card_index)
            self.bot.game['player2Hand'].append(card)
        if len(ai_and_mako_candidates) > 0:
            card_index = ai_and_mako_candidates[0]
            await self.bot.send_message(ws, f"Can add {card['uniqueCardNumber']}-{card['name']} in my hand.")
            await self.add_card_from_reveal_to_hand(ws, card_index)
            self.bot.game['player2Hand'].append(card)
        time.sleep(2)
        await self.put_cards_to_bottom_of_deck(ws)   
