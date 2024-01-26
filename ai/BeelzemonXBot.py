import math
import time
from pprint import pprint

import websockets

from Bot import Bot
from cheat.Cheater import Cheater
from card.CardFactory import CardFactory

class BeelzemonXBot(Bot):

    def __init__(self, username):
        super().__init__(username)
        self.card_factory = CardFactory(self)

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
            if len(self.game['player2EggDeck']) > 0:
                await self.hatch(ws)
        elif self.not_egg_in_breeding_and_can_digivolve():
            await self.promote_strategy(ws)

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
        beelzemon_x_antibody_in_hand_index = self.card_in_hand('BT12-085', 'Beelzemon (X Antibody)')
        if beelzemon_x_antibody_in_hand_index:
            beelzemon_on_field_index = self.card_on_battle_area_with_name('Beelzemon')
            if beelzemon_on_field_index and len(self.game['player2Trash']) >=10:
                await self.digivolve(
                    ws, 'Digi', beelzemon_on_field_index, 'Hand',
                    beelzemon_x_antibody_in_hand_index, 1
                )
                digivolution_card_obj = self.card_factory.get_card(self.game['player2Hand'][beelzemon_x_antibody_in_hand_index]['uniqueCardNumber'])
                await digivolution_card_obj.when_digivolving_effect(ws)

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
                        await digivolution_card_obj.when_digivolving_effect(ws)
                        return True
        return False
    
    async def when_attacking_effects_strategy(self, digimon_index):
        preferred_trigger_order = ['P-077', 'ST14-01', 'BT12-073', 'ST14-02', 'ST14-06', 'ST14-06', 'ST14-07', 'EX2-044', 'EX2-039', 'BT2-068', 'BT10-081', 'BT12-085', 'EX2-044', 'ST14-08']
        attacking_stack_objs = [(c['uniqueCardNumber'], CardFactory.get_card(c['uniqueCardNumber'])) for c in self.game['player2Digi'][digimon_index]]
        attacking_stack_objs.sort(key=lambda x:preferred_trigger_order.index(x[0]))
        for attacking_card in attacking_stack_objs:
            await attacking_card.when_attacking_effect()

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
        await self.attack_with_digimon(ws, digimon_index)
        await self.when_attacking_effects_strategy()

    # TODO: More clever choice of Beelzemon to evolve to
    async def st14_02_impmon_strategy(self, ws, digimon_index):
        card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
        if card_in_trash_index:
            await self.digivolve(
                ws, 'Digi', digimon_index, 'Trash',
                card_in_trash_index, 4
            )
            return
        card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
        if card_in_trash_index:
            await self.digivolve(
                ws, 'Digi', digimon_index, 'Trash',
                card_in_trash_index, 4
            )

    ## TODO: Currently only searching for Beelzemons. Can make strategy to help avoid bricking.
    async def bt12_073_impmon_x_antibody_strategy(self, ws):
        option_trashed = False
        seventh_full_cluster_in_hand_index = self.card_in_hand('BT12-110', 'Seventh Full Cluster')
        memory_boost_in_hand_index = self.card_in_hand('P-040', 'Purple Memory Boost!')
        rivals_barrage_in_hand_index = self.card_in_hand('ST14-12', 'Rivals\' Barrage')
        if seventh_full_cluster_in_hand_index:
            self.trash_top_card_of_deck(seventh_full_cluster_in_hand_index)
            option_trashed = True
        elif memory_boost_in_hand_index and self.card_on_battle_area('P-040', 'Purple Memory Boost!'):
            self.trash_top_card_of_deck(memory_boost_in_hand_index)
            option_trashed = True
        elif rivals_barrage_in_hand_index:
            self.trash_top_card_of_deck(rivals_barrage_in_hand_index)
            option_trashed = True
        if option_trashed:
            card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
            if card_in_trash_index:
                self.return_card_from_trash_to_hand(ws, card_in_trash_index)
                return
            card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
            if card_in_trash_index:
                self.return_card_from_trash_to_hand(ws, card_in_trash_index)
                return
            card_in_trash_index = self.card_in_trash('BT12-085', 'Beelzemon (X Antibody)')
            if card_in_trash_index:
                self.return_card_from_trash_to_hand(ws, card_in_trash_index)

    async def bt10_081_baalmon_attacking_strategy(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_card:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            await card_obj.when_trashed_effect(ws)
    
    async def bt10_081_baalmon_deleted_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
    
    async def st14_07_baalmon_baalmon_deleted_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)

    # TODO: Reorder cards according to bot strategy
    async def p_040_purple_memory_boost_strategy(self, ws):
        candidates = []
        digimon = []
        target_levels = set([3,4,5,6])
        for i in range(len(self.game['player2Hand'])):
                c = self.game['player2Hand'][i]
                if c['cardType'] == 'Digimon':
                    target_levels.discard(c['level'])
        for i in range(len(self.game['player2Reveal'])):
            card = self.game['player2Reveal'][i]
            if card['cardType'] == 'Digimon' and 'Purple' in card['color']:
                digimon.append(i)
                if card['level'] in target_levels:
                    candidates.append((card['level'], i))
        if len(digimon) == 0:
            time.sleep(2)
            await self.put_cards_to_bottom_of_deck(ws, 'Reveal')
            return
        if len(candidates) == 0:
            card_index = digimon[0]
        else:
            card_index = min(candidates)[1]
        await self.move_card(ws, f'myReveal{card_index}', f'myHand')
        self.game['player2Hand'].append(self.game['player2Reveal'].pop(card_index))
        time.sleep(2)
        await self.put_cards_to_bottom_of_deck(ws, 'Reveal')
    
    async def ex2_044_beelzemon_when_digivolving_when_attacking_stategy(self, ws):
        if len(self.game['player1Digi']) == 0:
            return False
        max_level_can_delete = 3 + math.floor(len(self.game['player2Trash'])/10)
        opponent_digimons = []
        for i in range(len(self.game['player1Digi'])):
            digimon = self.game['player1Digi'][i][-1]
            opponent_digimons.append(digimon['level'], i, digimon['name'])
        for opponent_digimon in sorted(opponent_digimons, reverse=True):
            if max_level_can_delete <= opponent_digimon[0]:
                self.delete_from_opponent_battle_area(ws, opponent_digimon[1])
                self.send_game_chat_message(f"EX2 Beelzemon effect: Delete {opponent_digimon[2]['name']} in position {opponent_digimon[1]}")

    async def ex2_044_beelzemon_when_trashed_stategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-02', 'Impmon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('BT2-068', 'Impmon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
        card_in_trash_index = self.card_in_trash('EX2-039', 'Impmon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)

    async def bt12_085_beelzemon_on_deletion_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-02', 'Impmon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('BT2-068', 'Impmon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
        card_in_trash_index = self.card_in_trash('EX2-039', 'Impmon')
        if card_in_trash_index:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
    
    async def st14_011_ai_and_mako_on_play_strategy(self, ws):
        candidates = []
        digimon = []
        target_levels = set([3,4,5,6])
        target_traits = set(['Evil','Wizard', 'Demon Lord'])
        for i in range(len(self.game['player2Hand'])):
                c = self.game['player2Hand'][i]
                if c['cardType'] == 'Digimon':
                    target_levels.discard(c['level'])
        for i in range(len(self.game['player2Reveal'])):
            card = self.game['player2Reveal'][i]
            if card['cardType'] == 'Digimon' and len(set(card['digiTraits']).intersection(target_traits)) > 0:
                digimon.append(i)
                if card['level'] in target_levels:
                    candidates.append((card['level'], i))
        if len(digimon) == 0:
            time.sleep(2)
            await self.put_cards_to_bottom_of_deck(ws)
        if len(candidates) == 0:
            card_index = digimon[0]
        else:
            card_index = min(candidates)[1]
        await self.move_card(ws, f'myReveal{card_index}', f'myHand')
        self.game['player2Hand'].append(self.game['player2Reveal'].pop(card_index))
        time.sleep(2)
        await self.put_cards_to_bottom_of_deck(ws)
    
    async def st14_011_ai_and_mako_your_turn_strategy(self, ws):
        death_slinger_index = self.card_in_hand('EX2-071', 'Death Slinger')
        if death_slinger_index:
            self.put_card_on_top_of_deck(ws, 'Hand', death_slinger_index)
            self.increase_memory_by(1)
        p_077_wizardmon_index = self.card_in_hand('P-077', 'Wizardmon')
        if p_077_wizardmon_index:
            self.put_card_on_top_of_deck(ws, 'Hand', p_077_wizardmon_index)
            self.increase_memory_by(1)
        ex2_039_impmon_index = self.card_in_hand('EX2-039', 'Impmon')
        if ex2_039_impmon_index:
            self.put_card_on_top_of_deck(ws, 'Hand', ex2_039_impmon_index)
            self.increase_memory_by(1)
        ex2_044_beelzemon_index = self.card_in_hand('EX2-044', 'Beelzemon')
        if ex2_044_beelzemon_index:
            self.put_card_on_top_of_deck(ws, 'Hand', ex2_044_beelzemon_index)
            self.increase_memory_by(1)

    async def avoid_brick(self, ws):
        memory_boost_in_hand_index = self.card_in_hand('P-040', 'Purple Memory Boost!')
        if not memory_boost_in_hand_index:
            return False
        else:
            card = self.game['player2Hand'][memory_boost_in_hand_index]
            memory_boost = self.card_factory.get_card(card['uniqueCardNumber'])
            await self.play_card(ws, 'Hand', memory_boost_in_hand_index, card['playCost'])
            time.sleep(2)
            await memory_boost.main_effect(ws)
            return True

    async def main_phase_strategy(self, ws):
        print([c['name'] for c in self.game['player2Hand']])
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
        await self.pass_turn(ws)

    async def turn(self, ws):
        if not self.first_turn:
            # Unsuspend phase
            if self.any_suspended_card_on_field():
                await self.unsuspend_all(ws)
            await self.update_phase(ws)

            # Draw phase
            await self.draw(ws, 1)
            await self.update_phase(ws)
        
        # Breeding phase
        await self.breeding_phase_strategy(ws)
        await self.update_phase(ws)

        # Cheat for testing
        cheater = Cheater(self)
        await cheater.get_card_from_deck_in_hand(ws, 'BT12-073', 'Impmon (X Antibody)')
        await cheater.get_card_from_deck_in_hand(ws, 'ST14-06', 'Witchmon')

        # Main phase
        await self.main_phase_strategy(ws)

        # End turn
        await self.end_turn(ws)

        time.sleep(1)
