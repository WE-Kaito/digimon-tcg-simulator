import time
from pprint import pprint

import websockets

from Bot import Bot
from cheat.Cheater import Cheater
from ai.card.P_040_PurpleMemoryBoost import P_040_PurpleMemoryBoost
from ai.card.CardFactory import CardFactory

class BeelzemonXBot(Bot):

    def __init__(self, username):
        super().__init__(username)
        self.card_factory = CardFactory(self, self.game)

    def mulligan_strategy(self):
        for card in self.game['player2Hand']:
            if card['cardType'] == 'Digimon' and card['level'] == 3:
                return False
        return True

    def not_egg_in_breeding_and_can_digivolve(self):
        not_egg = False
        has_digivolution_in_hand = False
        breeding = self.game['player2BreedingArea'][-1]
        if breeding['level'] != 2:
            not_egg = True
        else:
            return False
        target_level = breeding['level'] + 1
        for i in range(len(self.game['player2Hand'])):
            if self.game['player2Hand'][i]['level'] == target_level:
                has_digivolution_in_hand = True
                break
        return not_egg and has_digivolution_in_hand

    async def breeding_phase_strategy(self, ws):
        if len(self.game['player2BreedingArea']) == 0:
            await self.hatch(ws)
        elif self.not_egg_in_breeding_and_can_digivolve():
            await self.promote(ws)

    async def prepare_rookies(self, ws):
        breeding = self.game['player2BreedingArea']
        if len(breeding) == 0 or breeding[-1]['level'] > 2:
            return
        rookie_in_hand_index = self.digimon_of_level_in_hand(3)
        card = self.game['player2Hand'][rookie_in_hand_index]
        if rookie_in_hand_index:
            await self.digivolve(ws, 'BreedingArea', 0, 'Hand', rookie_in_hand_index, self.digivolution_cost(card))

    async def promote_strategy(self, ws):
        if len(self.game['player2BreedingArea']) == 0:
            return False
        breed_level = self.game['player2BreedingArea'][-1]['level']
        if breed_level < 3:
            return False
        if not self.digimon_of_level_in_hand(breed_level + 1):
            return False
        await self.promote(ws)
        return True

    async def digivolve_strategy(self, ws):
        for digimon_index in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][digimon_index]) > 0:
                card = self.game['player2Digi'][digimon_index][-1]
                if card['cardType'] == 'Digimon':
                    level = card['level']
                    digivolution_index = self.digimon_of_level_in_hand(level + 1)
                    if digivolution_index:
                        digivolution_card = self.game['player2Hand'][digivolution_index]
                        await self.digivolve(
                            ws, 'Digi', digimon_index, 'Hand',
                            digivolution_index, self.digivolution_cost(digivolution_card)
                        )
                        digivolution_card_obj = self.card_factory.get_card(digivolution_card['uniqueCardNumber'])
                        digivolution_card_obj.when_digivolving_effect()
                        return True
        return False

    # TODO: Check for blockers, this is complex as needs to determine when an opponent digimon has gained blocker
    async def attack_strategy(self, ws):
        if self.no_digimon_in_battle_area():
            return False
        if len(self.game['player1Security']) == 0:
            self.attack_with_any_digimon()
        digimon_index = self.digimon_of_level_in_battle_area(6)
        if not digimon_index:
            digimon_index = self.digimon_of_level_in_battle_area(5)
        if not digimon_index:
            return False
        self.attack_with_digimon(ws, digimon_index)

    async def avoid_brick(self, ws):
        memory_boost_in_hand_index = self.card_in_hand('P-040', 'Purple Memory Boost!')
        if memory_boost_in_hand_index is None:
            return False
        else:
            card = self.game['player2Hand'][memory_boost_in_hand_index]
            memory_boost = P_040_PurpleMemoryBoost(self, self.game)
            target_levels = set([3,4,5,6])
            for i in range(len(self.game['player2Hand'])):
                c = self.game['player2Hand'][i]
                if c['cardType'] == 'Digimon':
                    target_levels.discard(c['level'])
            await self.play_card_from_hand(ws, memory_boost_in_hand_index, card['playCost'])
            time.sleep(2)
            await memory_boost.main_effect(ws, target_levels)
            return True

    async def main_phase_strategy(self, ws):
        pprint([c['name'] for c in self.game['player2Hand']])
        await self.promote_strategy(ws)
        await self.prepare_rookies(ws)
        some_action = True
        while(self.game['memory'] >= 0 and some_action):
            some_action = await self.avoid_brick(ws)
            some_action = await self.attack_strategy(ws)
            some_action = await self.digivolve_strategy(ws)
        return

    async def end_turn(self, ws):
        await self.send_game_chat_message(ws, 'I end my turn!')
        if self.first_turn:
            self.first_turn = False
        self.my_turn = False

    async def turn(self, ws):
        # Unsuspend phase
        await self.unsuspend_all(ws)

        # Draw phase
        if not self.first_turn:
            await self.draw(ws, 1)
        
        # Breeding phase
        await self.breeding_phase_strategy(ws)

        # Cheat for testing
        cheater = Cheater(self, self.game)
        await cheater.get_card_from_deck_in_hand(ws, 'BT12-073', 'Impmon (X Antibody)')
        await cheater.get_card_from_deck_in_hand(ws, 'ST14-06', 'Witchmon')

        # Main phase
        await self.main_phase_strategy(ws)

        # End turn
        await self.end_turn(ws)

        time.sleep(1)
