import asyncio
import math
import time
from pprint import pprint

import websockets
from decouple import config

from Bot import Bot
from cheat.Cheater import Cheater

class BeelzemonXBot(Bot):

    def __init__(self, username):
        super().__init__(username)
        self.turn_counter = 0
        self.preferred_trigger_order = ['P-077', 'ST14-01', 'BT12-073', 'ST14-02', 'ST14-06', 'ST14-07', 'EX2-044', 'EX2-039', 'BT2-068', 'BT10-081', 'BT12-085', 'EX2-044', 'ST14-08']
        self.blockers_priority_list = ['BT10-081', 'ST14-07', 'BT2-068', 'BT12-085', 'ST14-01', 'BT12-073', 'ST14-02', 'ST14-06', 'EX2-044', 'EX2-039', 'ST14-08', 'P-077']
        self.gained_baalmon_effect = set()

    async def play_card(self, ws, card_location, card_index, cost, back=False):
        card = await super().play_card(ws, card_location, card_index, cost, back)
        card_obj = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
        await card_obj.on_play_effect(ws)

    async def digivolve(self, ws, digimon_location, digimon_card_index, digivolution_card_location, digivolution_card_index, cost):
        await super().digivolve(ws, digimon_location, digimon_card_index, digivolution_card_location, digivolution_card_index, cost)
        if digimon_location == 'BreedingArea':
            card = self.game[f'player2{digimon_location}'][-2]
            digivolution_card = self.game[f'player2{digimon_location}'][-1]
            return
        card = self.game[f'player2{digimon_location}'][digimon_card_index][-2]
        digivolution_card = self.game[f'player2{digimon_location}'][digimon_card_index][-1]
        if card['id'] in self.gained_baalmon_effect:
            self.gained_baalmon_effect.add(digivolution_card['id'])
        if 'Purple' in digivolution_card['color']:
            ai_and_mako_card_indices = self.cards_in_battle_area('ST14-11', 'Ai & Mako')
            self.logger.info(ai_and_mako_card_indices)
            for ai_and_mako_card_index in ai_and_mako_card_indices:
                ai_and_mako_card = self.game['player2Digi'][ai_and_mako_card_index][-1]
                if not ai_and_mako_card['isTilted']:
                    self.logger.info(ai_and_mako_card)
                    st14_11_ai_and_mako = self.card_factory.get_card(ai_and_mako_card['uniqueCardNumber'], card_id=ai_and_mako_card['id'])
                    await st14_11_ai_and_mako.your_turn_effect(ws)

    async def when_cards_are_trashed_from_deck(self, ws, trashed_cards):
        for trashed_card in trashed_cards:
            card_obj = self.card_factory.get_card(trashed_card['uniqueCardNumber'], card_id=trashed_card['id'])
            await card_obj.when_trashed_effect(ws)
        self.logger.info('Checking if any ST14-08 trigger from trashing card.')
        st14_08_beelzemons_indices = self.cards_in_battle_area('ST14-08', 'Beelzemon')
        for st14_08_beelzemons_index in st14_08_beelzemons_indices:
            card = self.game['player2Digi'][st14_08_beelzemons_index][-1]
            if card['id'] not in self.triggered_already_this_turn:
                st14_08_beelzemon = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
                await st14_08_beelzemon.all_turns_effect(ws)
                self.triggered_already_this_turn.add(card['id'])
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                for j in range(len(self.game['player2Digi'][i]) - 1):
                    card = self.game['player2Digi'][i][j]
                    if card['uniqueCardNumber'] == 'ST14-02' and card['name'] == 'Impmon' and card['id'] not in self.triggered_already_this_turn:
                        st14_02_impmon = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
                        await st14_02_impmon.inherited_your_turn_effect(ws)
                        self.triggered_already_this_turn.add(card['id'])

    async def delete_stack_from_battle_area(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        card = self.game['player2Digi'][card_index][-1]
        card_obj = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
        await super().delete_stack_from_battle_area(ws, card_id)
        await card_obj.on_deletion_effect(ws)
        if card['id'] in self.gained_baalmon_effect and len(self.game['player2Trash']) >= 10:
            await self.st14_07_baalmon_deleted_strategy(ws)
            self.gained_baalmon_effect.remove(card['id'])

    async def trashed_card_effect(self, ws, card):
        card_obj = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
        await card_obj.when_trashed_effect(ws)

    async def st14_07_baalmon_gained_on_deletion_effect(self, ws):
        await super().animate_effect(ws)
        if len(self.game['player2Trash']) >= 10:
            await self.st14_07_baalmon_deleted_strategy(ws)

    # TODO: Take into account attacker when deiciding blocker
    async def collision_strategy(self, ws, attacker_id):
        potential_blockers = [(c[-1]['uniqueCardNumber'], c) for c in self.game['player2Digi'] if len(c) > 0 and c[-1]['cardType'] == 'Digimon' and not c[-1]['isTilted']]
        potential_blockers = [c for c in potential_blockers if c[1][-1]['id'] not in self.cant_suspend_until_end_of_turn and c[1][-1]['id'] not in self.cant_block_until_end_of_opponent_turn]
        potential_blockers.sort(key=lambda x:self.blockers_priority_list.index(x[0]))
        blocker_index = -1
        self.logger.debug(potential_blockers)
        for digimon in [c[1] for c in potential_blockers]:
            if digimon[-1]['uniqueCardNumber'] == 'BT10-081' or (digimon[-1]['uniqueCardNumber'] == 'ST14-07' and 'ST14-07' in self.gained_baalmon_effect):
                blocker_index, _ = self.find_card_index_by_id_in_battle_area(digimon[-1]['id'])
                if len(self.game['player2Trash']) >= 10 and (self.card_in_trash('ST14-08', 'Beelzemon') or self.card_in_trash('EX2-044', 'Beelzemon')):
                    break
                else:
                    continue
            elif digimon[-1]['uniqueCardNumber'] == 'BT2-068':
                blocker_index, _ = self.find_card_index_by_id_in_battle_area(digimon[-1]['id'])
                if len(self.game['player2DeckField']) > 3:
                    break
                else:
                    continue
            blocker_index, _ = self.find_card_index_by_id_in_battle_area(digimon[-1]['id'])
            break
        await self.declare_blocker(ws, blocker_index)

    def mulligan_strategy(self):
        for card in self.game['player2Hand']:
            if card['cardType'] == 'Digimon' and card['level'] == 3:
                self.logger.info(f'Will not mulligan as have a level 3 digimon in hand: {card}')
                return False
        self.logger.info(f"I will mulligan, no rookies in my hand: {self.game['player2Hand']}")
        return True

    def not_egg_in_breeding_and_can_digivolve(self):
        self.logger.info(f"No egg in breeding:")
        not_egg = False
        has_digivolution_in_hand = False
        breeding = self.game['player2BreedingArea'][-1]
        if breeding['level'] != 2:
            self.logger.info(f"Digimon in breeding area is level >= 2:{self.game['player2BreedingArea'][-1]}")
            not_egg = True
        else:
            self.logger.info(f"Digimon in breeding area is level 2:{self.game['player2BreedingArea'][-1]}")
            return False
        target_level = breeding['level'] + 1
        for i in range(len(self.game['player2Hand'])):
            if self.game['player2Hand'][i]['level'] == target_level:
                has_digivolution_in_hand = True
                self.logger.info(f"Digimon in breeding can digivolve into:{self.game['player2Hand'][i]['level']}")
                break
        return not_egg and has_digivolution_in_hand

    async def breeding_phase_strategy(self, ws):
        if len(self.game['player2BreedingArea']) == 0:
            self.logger.info("No digimon in breeding area.")
            if len(self.game['player2EggDeck']) > 0:
                self.logger.info("There are still digi eggs I can hatch. I hatch one.")
                await self.hatch(ws)
        elif self.not_egg_in_breeding_and_can_digivolve():
            self.logger.info("Digimon in breeding is level >=2 and can digivolve into a card in my hand.")
            await self.promote_strategy(ws)

    async def prepare_rookies(self, ws):
        breeding = self.game['player2BreedingArea']
        if len(breeding) == 0 or breeding[-1]['level'] > 2:
            self.logger.info("Cannot prepare rookies as no level 2 in breeding.")
            return
        self.logger.info("Checking for rookies in hand...")
        rookie_in_hand_index = self.digimon_of_level_in_hand(3)
        if rookie_in_hand_index >= 0:
            card = self.game['player2Hand'][rookie_in_hand_index]
            self.logger.info(f'Will digivolve in breed into {card}')
            await self.digivolve(ws, 'BreedingArea', 0, 'Hand', rookie_in_hand_index, self.digivolution_cost(card))
    
    async def digivolve_in_breed_strategy(self, ws):
        card_in_hand_index = -1
        breeding = self.game['player2BreedingArea']
        if len(breeding) == 0:
            self.logger.info("Cannot digivolve in breed as no level 2 Digimon is there.")
            return False
        if breeding[-1]['level'] == 3:
            if breeding[-1]['name'] == 'Impmon':
                card_in_hand_index = self.card_in_hand('BT12-073', 'Impmon (X Antibody)')
            if card_in_hand_index < 0:
                card_in_hand_index = self.card_in_hand('P-077','Wizardmon')
            if card_in_hand_index < 0:
                return False
        elif breeding[-1]['level'] == 4:
            card_in_hand_index = self.card_in_hand('BT10-081','Baalmon')
            if card_in_hand_index < 0:
                return False
        else:
            card_in_hand_index = self.digimon_of_level_in_hand(breeding[-1]['level'] + 1)
        if card_in_hand_index >= 0:
            card = self.game['player2Hand'][card_in_hand_index]
            self.logger.info(f"Can digivolve in breed into {card}")
            await self.digivolve(ws, 'BreedingArea', 0, 'Hand', card_in_hand_index, self.digivolution_cost(card))
            return True
        return False
    
    async def play_digimon_strategy(self, ws):
        digimon_in_hand_index = self.card_in_hand('BT2-068', 'Impmon')
        if digimon_in_hand_index >= 0:
            self.logger.info(f'Have BT2-068 impmon in hand index {digimon_in_hand_index}')
            self.logger.info(f'Will play it.')
            digimon = self.game['player2Hand'][digimon_in_hand_index]
            await self.play_card(ws, 'Hand', digimon_in_hand_index, digimon['playCost'])
            return True
        n_digimon_on_my_field = 0
        for i in range(5):
            if len(self.game['player2Digi'][i]) > 0:
                n_digimon_on_my_field += 1
        if n_digimon_on_my_field == 0:
            self.logger.info(f'Trying to play cheapest digimon.')
            digimon_in_hand_index = self.cheap_digimon_in_hand_to_play(5)
            if digimon_in_hand_index >= 0:
                digimon = self.game['player2Hand'][digimon_in_hand_index]
                self.logger.info(f"I play {digimon['name']}")
                await self.play_card(ws, 'Hand', digimon_in_hand_index, digimon['playCost'])
                return True
        return False

    async def promote_strategy(self, ws):
        if len(self.game['player2BreedingArea']) == 0:
            self.logger.info(f'Cannot promote: no digimon in breeding area.')
            return False
        breed_level = self.game['player2BreedingArea'][-1]['level']
        if breed_level < 3:
            self.logger.info(f"Cannot promote: Digimon is of level < 3 in breeding area: {self.game['player2BreedingArea'][-1]}")
            return False
        digimon_of_level_in_hand_index = self.digimon_of_level_in_hand(breed_level + 1)
        if digimon_of_level_in_hand_index < 0 and len(self.digimons_in_battle_area()) < 1:
            self.logger.info(f"Won't promote: No digimon to digivolve to in hand: {self.game['player2Hand']} or no digimon in battle area.")
            return False
        await self.promote(ws)
        return True

    async def use_memory_boost_if_possible_and_needed(self, ws, cost):
        purple_memory_boost_in_battle_area_indices = self.cards_in_battle_area('P-040', 'Purple Memory Boost!')
        if len(purple_memory_boost_in_battle_area_indices) == 0:
            return
        if cost <= self.game['memory']:
            return
        card = self.game['player2Digi'][purple_memory_boost_in_battle_area_indices[0]][-1]
        if card['id'] in self.placed_this_turn:
            return
        purple_memory_boost = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
        await purple_memory_boost.delay_effect(ws)
        time.sleep(2)

    async def use_seventh_full_cluster_trash_if_possible(self, ws):
        sevent_full_cluster_in_trash_index = self.card_in_trash('BT12-110', 'Seventh Full Cluster')
        if sevent_full_cluster_in_trash_index < 0:
            return
        card = self.game['player2Trash'][sevent_full_cluster_in_trash_index]
        sevent_full_cluster = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
        await sevent_full_cluster.trash_effect(ws)
        time.sleep(2)

    async def digivolve_strategy(self, ws):
        self.logger.info('Check if I have Beelzemon (X Antibody) in my hand.')
        beelzemon_x_antibody_in_hand_index = self.card_in_hand('BT12-085', 'Beelzemon (X Antibody)')
        if beelzemon_x_antibody_in_hand_index >= 0:
            self.logger.info('Have Beelzemon (X Antibody) in my hand. Checking for Beelzemon on the field.')
            beelzemon_on_field_index = self.card_in_battle_area_with_name('Beelzemon')
            if beelzemon_on_field_index >= 0 and len(self.game['player2Trash']) >=10:
                await self.use_memory_boost_if_possible_and_needed(ws, 1)
                beelzemon_x_antibody_card_id = self.game['player2Hand'][beelzemon_x_antibody_in_hand_index]['id']
                digivolution_card_obj = self.card_factory.get_card(
                    self.game['player2Hand'][beelzemon_x_antibody_in_hand_index]['uniqueCardNumber'],
                    digimon_index=beelzemon_on_field_index,
                    card_id=beelzemon_x_antibody_card_id
                )
                await self.digivolve(
                    ws, 'Digi', beelzemon_on_field_index, 'Hand',
                    beelzemon_x_antibody_in_hand_index, 1
                )
                await digivolution_card_obj.when_digivolving_effect(ws)
                await self.use_seventh_full_cluster_trash_if_possible(ws)
                return True
            self.logger.info('No Beelzemon on fields, won\'t digivolve to Beelzemon (X Antibody).')

        self.logger.info('Check if I can digivolve Impmon in Impmon (X Antibody).')
        for digimon_index in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][digimon_index]) > 0:
                card = self.game['player2Digi'][digimon_index][-1]
                if card['name'] == 'Impmon':
                    digivolution_index = self.card_in_hand('BT12-073', 'Impmon (X Antibody)')
                    if digivolution_index >= 0:
                        digivolution_card = self.game['player2Hand'][digivolution_index]
                        self.logger.info(f'Found digivolution: {digivolution_card}')
                        await self.digivolve(
                            ws, 'Digi', digimon_index, 'Hand',
                            digivolution_index, 0
                        )
                        digivolution_card_obj = self.card_factory.get_card(
                            digivolution_card['uniqueCardNumber'],
                            digimon_index=digimon_index,
                            card_id=digivolution_card['id']
                        )
                        await digivolution_card_obj.when_digivolving_effect(ws)
                        return True
        self.logger.info('Checking for other possible digivolutions on the field...')
        for digimon_index in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][digimon_index]) > 0:
                card = self.game['player2Digi'][digimon_index][-1]
                if card['cardType'] == 'Digimon':
                    self.logger.info(f'Checking digivolutions in hand for card on the field: {card}')
                    level = card['level']
                    digivolution_index = self.digimon_of_level_in_hand(level + 1)
                    if digivolution_index >= 0:
                        digivolution_card = self.game['player2Hand'][digivolution_index]
                        self.logger.info(f'Found digivolution: {digivolution_card}')
                        await self.use_memory_boost_if_possible_and_needed(ws, 1)
                        await self.digivolve(
                            ws, 'Digi', digimon_index, 'Hand',
                            digivolution_index, self.digivolution_cost(digivolution_card)
                        )
                        digivolution_card_obj = self.card_factory.get_card(
                            digivolution_card['uniqueCardNumber'],
                            digimon_index=digimon_index,
                            card_id=digivolution_card['id']
                        )
                        await digivolution_card_obj.when_digivolving_effect(ws)
                        return True
        return False
    
    async def when_attacking_effects_strategy(self, ws, digimon_index):
        self.logger.info('Choosing effect trigger order for attack.')
        attacking_stack= self.game['player2Digi'][digimon_index]
        attacking_stack_objs = [(c['uniqueCardNumber'], self.card_factory.get_card(c['uniqueCardNumber'], attacking_digimon=attacking_stack[-1], card_id=c['id'])) for c in attacking_stack[:-1]]
        attacking_stack_objs.sort(key=lambda x:self.preferred_trigger_order.index(x[0]))
        self.logger.info(f'Order decided: {[c[0] for c in attacking_stack_objs]}')
        attacking_digimon_obj = self.card_factory.get_card(
            attacking_stack[-1]['uniqueCardNumber'],
            card_id=attacking_stack[-1]['id']
        )
        for attacking_card_obj in attacking_stack_objs[:-1]:
            await attacking_card_obj[1].inherited_when_attacking_once_per_turn(ws)
            time.sleep(0.5)
        await attacking_digimon_obj.when_attacking_effect(ws)

    # TODO: Check for blockers, this is complex as needs to determine when an opponent digimon has gained blocker
    # TODO: Use id, not index of digimon card
    async def attack_strategy(self, ws):
        digimon_index = -1
        can_attack_digimons_index = self.can_attack_digimons()
        if len(can_attack_digimons_index) >= 2:
            for digimon_index in can_attack_digimons_index:
                self.logger.info(f"Trying to attack with {self.game['player2Digi'][digimon_index]}")
                if digimon_index < len(self.game['player2Digi']):
                    await self.suspend_card(ws, digimon_index)
                    await self.when_attacking_effects_strategy(ws, digimon_index)
                    await self.attack_with_digimon(ws, digimon_index)
                    return True
        if self.no_digimon_in_battle_area():
            self.logger.info('Cannot perform attack: No digimon to attack with.')
            return False
        if len(self.game['player1Security']) == 0:
            self.logger.info('No cards left in opponent\'s security, attacking with any digimon.')
            digimon_index = await self.find_can_attack_any_digimon(ws)
        if digimon_index < 0:
            self.logger.info('Checking for level 6 digimons to attack with...')
            digimon_index = self.find_can_attack_digimon_of_level(6)
        if digimon_index < 0:
            self.logger.info('Not found. Checking for level 5 digimons to attack with...')
            digimon_index = self.find_can_attack_digimon_of_level(5)
        if digimon_index < 0:
            self.logger.info('Not found. Won\'t attack...')
            return False
        self.logger.info(f"Attacking with {self.game['player2Digi'][digimon_index][-1]['name']}")
        await self.suspend_card(ws, digimon_index)
        await self.when_attacking_effects_strategy(ws, digimon_index)
        await self.attack_with_digimon(ws, digimon_index)
        return True

    # TODO: More clever choice of Beelzemon to evolve to
    async def st14_02_impmon_strategy(self, ws, card_id):
        impmon_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
        if card_in_trash_index >= 0:
            digivolution_card_obj = self.card_factory.get_card(
                self.game['player2Trash'][card_in_trash_index]['uniqueCardNumber'],
                digimon_index=impmon_index,
                card_id=self.game['player2Trash'][card_in_trash_index]['id']
            )
            await self.digivolve(
                ws, 'Digi', impmon_index, 'Trash',
                card_in_trash_index, 4
            )
            await digivolution_card_obj.when_digivolving_effect(ws)
            return
        card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
        if card_in_trash_index >= 0:
            digivolution_card_obj = self.card_factory.get_card(
                self.game['player2Trash'][card_in_trash_index]['uniqueCardNumber'],
                digimon_index=impmon_index,
                card_id=self.game['player2Trash'][card_in_trash_index]['id']
            )
            await self.digivolve(
                ws, 'Digi', impmon_index, 'Trash',
                card_in_trash_index, 4
            )
            await digivolution_card_obj.when_digivolving_effect(ws)
            

    ## TODO: Currently only searching for Beelzemons. Can make strategy to help avoid bricking.
    async def bt12_073_impmon_x_antibody_strategy(self, ws):
        option_trashed = False
        seventh_full_cluster_in_hand_index = self.card_in_hand('BT12-110', 'Seventh Full Cluster')
        memory_boost_in_hand_index = self.card_in_hand('P-040', 'Purple Memory Boost!')
        rivals_barrage_in_hand_index = self.card_in_hand('ST14-12', 'Rivals\' Barrage')
        if seventh_full_cluster_in_hand_index >= 0:
            self.trash_card_from_hand(ws, seventh_full_cluster_in_hand_index)
            option_trashed = True
        elif memory_boost_in_hand_index >= 0 and len(self.cards_in_battle_area('P-040', 'Purple Memory Boost!')) > 0:
            self.trash_card_from_hand(ws, memory_boost_in_hand_index)
            option_trashed = True
        elif rivals_barrage_in_hand_index >= 0:
            self.trash_card_from_hand(ws, rivals_barrage_in_hand_index)
            option_trashed = True
        if option_trashed:
            card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
            if card_in_trash_index >= 0:
                self.return_card_from_trash_to_hand(ws, card_in_trash_index)
                return
            card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
            if card_in_trash_index >= 0:
                self.return_card_from_trash_to_hand(ws, card_in_trash_index)
                return
            card_in_trash_index = self.card_in_trash('BT12-085', 'Beelzemon (X Antibody)')
            if card_in_trash_index >= 0:
                self.return_card_from_trash_to_hand(ws, card_in_trash_index)

    async def bt10_081_baalmon_attacking_strategy(self, ws):
        trashed_cards = await self.trash_top_cards_of_deck(ws, 3)
    
    async def bt10_081_baalmon_deleted_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
    
    async def st14_07_baalmon_deleted_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-08', 'Beelzemon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('EX2-044', 'Beelzemon')
        if card_in_trash_index >= 0:
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
                digimon.append((card['level'], i))
                if card['level'] in target_levels:
                    candidates.append((card['level'], i))
        if len(digimon) == 0:
            time.sleep(2)
            await self.put_cards_to_bottom_of_deck(ws, 'Reveal')
            return
        if len(candidates) == 0:
            card_index = min(digimon)[1]
        else:
            card_index = min(candidates)[1]
        card_id = self.game['player2Reveal'][card_index]['id']
        await self.add_card_from_reveal_to_hand(ws, card_id)
        time.sleep(2)
        await self.put_cards_to_bottom_of_deck(ws, 'Reveal')
    
    async def st14_012_rivals_barrage_delay_strategy(self, ws, rivals_barrage_card):
        candidates = []
        digimon = []
        target_levels = set([3,4,5,6])
        for i in range(len(self.game['player2Hand'])):
                c = self.game['player2Hand'][i]
                if c['cardType'] == 'Digimon':
                    target_levels.discard(c['level'])
        for i in range(len(self.game['player2Trash'])):
            card = self.game['player2Trash'][i]
            if card['cardType'] == 'Digimon' and 'Purple' in card['color']:
                digimon.append(i)
                if card['level'] in target_levels:
                    candidates.append((card['level'], card['id']))
        self.logger.info('Rivals barrage, can\'t find digimons so will search for tamers.')
        if len(digimon) == 0:
            for i in range(len(self.game['player2Trash'])):
                card = self.game['player2Trash'][i]
                if card['cardType'] == 'Tamer' and 'Purple' in card['color']:
                    if card['level'] in target_levels:
                        candidates.append((card['level'], card['id']))
        if len(candidates) == 0:
            self.logger.info('No useful card found in trash.')
            return False
        target_card_id = min(candidates)[1]
        rivals_barrage = self.card_factory.get_card(
            rivals_barrage_card['uniqueCardNumber'],
            card_id=rivals_barrage_card['id'],
            target_card_id=target_card_id
        )
        await rivals_barrage.delay_effect(ws)
        return True
    
    async def ex2_044_beelzemon_when_digivolving_when_attacking_strategy(self, ws):
        max_level_can_delete = 3 + math.floor(len(self.game['player2Trash'])/10)
        opponent_digimons = []
        for i in range(len(self.game['player1Digi'])):
            if len(self.game['player1Digi'][i]) > 0:
                digimon = self.game['player1Digi'][i][-1]
                if digimon['level'] is not None:
                    opponent_digimons.append((digimon['level'], i, digimon['name']))
        for opponent_digimon in sorted(opponent_digimons, reverse=True):
            if max_level_can_delete >= opponent_digimon[0]:
                await self.delete_card_from_opponent_battle_area(ws, opponent_digimon[1])
                return True
        return False

    async def ex2_044_beelzemon_when_trashed_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-02', 'Impmon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('BT2-068', 'Impmon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('EX2-039', 'Impmon')
        if card_in_trash_index >= 0:
            card_id = self.game['player2Trash'][card_in_trash_index]['id']
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            impmon = self.card_factory.get_card('EX2-039', card_id=card_id)
            return
        await self.send_message(ws, f"No Impmon to play from trash.")

    async def bt12_085_beelzemon_x_antibody_on_deletion_strategy(self, ws):
        card_in_trash_index = self.card_in_trash('ST14-02', 'Impmon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('BT2-068', 'Impmon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('EX2-039', 'Impmon')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        card_in_trash_index = self.card_in_trash('BT12_073', 'Impmon (X Antibody)')
        if card_in_trash_index >= 0:
            await self.play_card(ws, 'Trash', card_in_trash_index, 0)
            return
        await self.send_message(ws, f"No digimon with [Impmon] in its name in trash.")
    
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
            if card['cardType'] == 'Digimon' and len(set(card['digiType']).intersection(target_traits)) > 0:
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
        card_id = self.game['player2Reveal'][card_index]['id']
        await self.add_card_from_reveal_to_hand(ws, card_id)
        time.sleep(2)
        await self.put_cards_to_bottom_of_deck(ws, 'Reveal')
    
    async def st14_011_ai_and_mako_your_turn_strategy(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        ai_and_mako_card = self.game['player2Digi'][card_index][-1]
        self.logger.info('Check if Death Slinger in hand')
        death_slinger_index = self.card_in_hand('EX2-071', 'Death Slinger')
        if death_slinger_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', death_slinger_index)
            await self.increase_memory_by(ws, 1)
            await self.suspend_card(ws, card_index)
            return
        self.logger.info('Check if Wizardmon in hand')
        p_077_wizardmon_index = self.card_in_hand('P-077', 'Wizardmon')
        if p_077_wizardmon_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', p_077_wizardmon_index)
            await self.increase_memory_by(ws, 1)
            await self.suspend_card(ws, card_index)
            return
        self.logger.info('Check if EX2 Impmon in hand')
        ex2_039_impmon_index = self.card_in_hand('EX2-039', 'Impmon')
        if ex2_039_impmon_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', ex2_039_impmon_index)
            await self.increase_memory_by(ws, 1)
            await self.suspend_card(ws, card_index)
            return
        self.logger.info('Check if EX2 Beelzemon in hand')
        ex2_044_beelzemon_index = self.card_in_hand('EX2-044', 'Beelzemon')
        if ex2_044_beelzemon_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', ex2_044_beelzemon_index)
            await self.increase_memory_by(ws, 1)
            await self.suspend_card(ws, card_index)
            return
    
    async def p_077_inherited_when_attacking_once_per_turn_strategy(self, ws):
        death_slinger_index = self.card_in_hand('EX2-071', 'Death Slinger')
        if death_slinger_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', death_slinger_index)
            return
        p_077_wizardmon_index = self.card_in_hand('P-077', 'Wizardmon')
        if p_077_wizardmon_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', p_077_wizardmon_index)
            return
        ex2_039_impmon_index = self.card_in_hand('EX2-039', 'Impmon')
        if ex2_039_impmon_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', ex2_039_impmon_index)
            return
        ex2_044_beelzemon_index = self.card_in_hand('EX2-044', 'Beelzemon')
        if ex2_044_beelzemon_index >= 0:
            await self.put_card_on_top_of_deck(ws, 'Hand', ex2_044_beelzemon_index)
            return
        await self.send_message(ws, f"Won't put a card from my hand on top of deck.")

    async def avoid_brick(self, ws):
        rivals_barrage_in_battle_area_indices = self.cards_in_battle_area('ST14-12', 'Rivals\' Barrage')
        if len(rivals_barrage_in_battle_area_indices) > 0:
            rivals_barrage_card = self.game['player2Digi'][rivals_barrage_in_battle_area_indices[0]][-1]
            self.logger.info(self.placed_this_turn)
            if not self.is_placed_this_turn(rivals_barrage_card['id']):
                if await self.st14_012_rivals_barrage_delay_strategy(ws, rivals_barrage_card):
                    return True
        memory_boost_in_hand_index = self.card_in_hand('P-040', 'Purple Memory Boost!')
        if memory_boost_in_hand_index >= 0:
            card = self.game['player2Hand'][memory_boost_in_hand_index]
            purple_memory_boost = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
            await self.play_card(ws, 'Hand', memory_boost_in_hand_index, card['playCost'], back=True)
            time.sleep(2)
            await purple_memory_boost.main_effect(ws)
            return True
        ai_and_mako_in_hand_index = self.card_in_hand('ST14-11', 'Ai & Mako')
        if ai_and_mako_in_hand_index >= 0:
            card = self.game['player2Hand'][ai_and_mako_in_hand_index]
            ai_and_mako = self.card_factory.get_card(card['uniqueCardNumber'], card_id=card['id'])
            await self.play_card(ws, 'Hand', ai_and_mako_in_hand_index, card['playCost'], back=True)
            time.sleep(2)
            return True
        return False

    async def attack_loop(self, ws):
        self.logger.info('Attack loop')
        some_action = False
        attacked = True
        while attacked:
            attacked = False
            if self.game['memory'] >= 0 and await self.attack_strategy(ws):
                attacked = True
                some_action = True
        return some_action

    async def start_main_phase_strategy(self, ws):
        must_attack = []
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['cardType'] == 'Digimon' and self.can_attack(card) and card['id'] in self.start_mp_attack:
                    must_attack.append((card['level'], i))
        for digimon in sorted(must_attack, reverse=True):
            await self.when_attacking_effects_strategy(ws, digimon[1])
            await self.attack_with_digimon(ws, digimon[1])

    async def main_phase_strategy(self, ws):
        self.logger.info('Prepare rookies in breed...')
        await self.prepare_rookies(ws)
        some_action = True
        ## TODO: Action class/method that checks memory at every action
        while(some_action):
            some_action = False
            self.logger.info('Avoid brick strategy...')
            if self.game['memory'] >= 0 and await self.avoid_brick(ws):
                some_action = True
            self.logger.info('Digivolve strategy...')
            if self.game['memory'] >= 0 and await self.digivolve_strategy(ws):
                some_action = True
            self.logger.info('Attack strategy...')
            if self.game['memory'] >= 0 and await self.attack_loop(ws):
                some_action = True
            self.logger.info('Digivolve in breed strategy...')
            if self.game['memory'] >= 0 and await self.digivolve_in_breed_strategy(ws):
                some_action = True
            self.logger.info('Attack strategy...')
            if self.game['memory'] >= 0 and await self.attack_loop(ws):
                some_action = True
            self.logger.info('Play digimon strategy...')
            if self.game['memory'] >= 0 and await self.play_digimon_strategy(ws):
                some_action = True
            self.logger.info('Attack strategy...')
            if self.game['memory'] >= 0 and await self.attack_loop(ws):
                some_action = True

    async def end_turn(self, ws):
        await super().end_turn()
        self.logger.debug(self.game['player2Hand'])
        if self.game['memory'] >= 0:
            await self.set_memory_to(ws, -3)
        await self.send_game_chat_message(ws, 'I end my turn!')
        if self.first_turn:
            self.first_turn = False
        self.my_turn = False
        await self.pass_turn(ws)
        self.turn_counter += 1

    async def turn(self, ws):
        self.logger.info(f'-----------------------------------------------------------------')
        self.logger.info(f'---------------------TURN {self.turn_counter}---------------------')
        await self.start_turn()
        self.logger.info(f'-----------------------------------------------------------------')
        if not self.first_turn:
            self.logger.info(f'---------------------UNSUSPEND PHASE---------------------')
            # Unsuspend phase
            if self.any_suspended_card_on_field():
                await self.unsuspend_all(ws)
            await self.update_phase(ws)

            # Draw phase
            self.logger.info(f'---------------------DRAW PHASE---------------------')
            await self.draw_for_turn(ws, 1)
            await self.update_phase(ws)
        
        # Breeding phase
        self.logger.info(f'---------------------BREEDING PHASE---------------------')
        await self.breeding_phase_strategy(ws)
        await self.update_phase(ws)

        # Start of Main Phase
        self.logger.info(f'---------------------START OF MAIN PHASE---------------------')
        await self.start_main_phase_strategy(ws)

        # Main
        self.logger.info(f'---------------------MAIN PHASE---------------------')
        await self.main_phase_strategy(ws)

        # End turn
        await self.end_turn(ws)
        self.logger.info(f'---------------------END TURN---------------------')

        time.sleep(1)
