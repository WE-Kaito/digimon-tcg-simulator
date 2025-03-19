import asyncio
import json
import random
import time
from abc import ABC, abstractmethod
from pprint import pprint

import logging
import requests
import websockets
from decouple import config

from card.CardFactory import CardFactory
from Waiter import Waiter

FIELD_UPDATE_MAP = {
    'myHand': 'Hand',
    'myDigi': 'BA ',
    'myDeckField': 'Deck',
    'myEggDeck': 'Egg-Deck',
    'myBreedingArea': 'Breeding',
    'myTamer': 'Tamers',
    'myDelay': 'Delay',
    'mySecurityTop': 'Security Top',
    'mySecurityBottom': 'Security Bottom',
    'mySecurity': 'Security',
    'myReveal': 'Reveal',
    'myTrash': 'Trash'
}

GAME_LOCATIONS_MAP = {
    'myHand': 'player2Hand',
    'myDeckField': 'player2DeckField',
    'myEggDeck': 'player2EggDeck',
    'myBreedingArea': 'player2BreedingArea',
    'myTamer': 'Tamers',
    'myDelay': 'Delay',
    'mySecurityTop': 'player2Security',
    'mySecurityBottom': 'player2Security',
    'mySecurity': 'player2Security',
    'myReveal': 'player2Reveal',
    'myDigi': 'player2Digi',
    'myTrash': 'player2Trash'
}

class Bot(ABC):

    host = config('HOST')
    password = config('BOT_PASSWORD')
    question = config('BOT_QUESTION')
    answer = config('BOT_ANSWER')
    deck_path = config('DECK_PATH')
    url_prefix = 'http' if not config('SSL_VERIFY', cast=bool) else 'https'
    ws_prefix = 'ws' if not config('SSL_VERIFY', cast=bool) else 'wss'

    def __init__(self, username):
        self.s = requests.Session()
        cookies = self.s.get(f'{self.url_prefix}://{self.host}/login').cookies.get_dict()
        self.headers = {
            'Content-Type': 'application/json',
            'Cookie': f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}",
            'Host': self.host,
            'Referer': f'{self.url_prefix}://{self.host}/login',
            'X-Xsrf-Token': cookies['XSRF-TOKEN']
        }
        self.loop = asyncio.get_event_loop()
        self.card_factory = CardFactory(self)
        self.deck = json.load(open(self.deck_path))
        self.username = username
        self.game_ws = f'{self.ws_prefix}://{self.host}/api/ws/game'
        self.chat_ws = f'{self.ws_prefix}://{self.host}/api/ws/chat'
        self.my_turn = False
        self.first_turn = False
        self.game = {}
        self.effects = {}
        self.placed_this_turn = set()
        self.start_mp_attack = set()
        self.cant_unsuspend_until_end_of_turn = set()
        self.cant_unsuspend_until_end_of_opponent_turn = set()
        self.cant_suspend_until_end_of_turn = set()
        self.cant_suspend_until_end_of_opponent_turn = set()
        self.cant_attack_until_end_of_turn = set()
        self.cant_attack_until_end_of_opponent_turn = set()
        self.cant_block_until_end_of_turn = set()
        self.cant_block_until_end_of_opponent_turn = set()
        self.stunned_until_end_of_opponent_turn = set()
        self.triggered_already_this_turn = set()
        self.effects['endOfOpponentTurnEffects'] = {}
        self.effects['endOfOpponentTurnEffects']['player2Digi'] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
        self.effects['endOfTurnEffect'] = {}
        self.effects['endOfTurnEffect']['player2Digi'] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]

        self.waiter = Waiter(self)
        
        self.logger = logging.getLogger(__class__.__name__)
        self.logger.setLevel(config('LOGLEVEL'))
        fmt = '%(asctime)s ' + self.username +  ' %(filename)-1s %(lineno)-8d %(levelname)-8s: %(message)s'
        fmt_date = '%Y-%m-%dT%T%Z'
        formatter = logging.Formatter(fmt, fmt_date)
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def handle_response(self, response, expected_status_code, success_message, error_message):
        if response.status_code == expected_status_code:
            self.logger.info(success_message)
            return response
        self.logger.info(error_message)
        return False

    def login(self):
        login = self.s.get(f'{self.url_prefix}://{self.host}/api/user/me', headers=self.headers, auth=(self.username, self.password), verify=config('SSL_VERIFY', cast=bool))
        cookies = self.s.cookies.get_dict()
        self.headers['Cookie'] = f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}"
        self.headers['X-Xsrf-Token'] = cookies['XSRF-TOKEN']
        return self.handle_response(login, 200, 'Login succeded!', f'Login failed with status code {login.status_code}')

    def register(self):
        data={'username': self.username, 'password': self.password, 'question': self.question, 'answer': self.answer}
        register = self.s.post(f'{self.url_prefix}://{self.host}/api/user/register', headers=self.headers, data=json.dumps(data), verify=config('SSL_VERIFY', cast=bool))
        return self.handle_response(register, 200, 'Registration succeded!', f'Registration failed with status code {register.status_code}, exiting...')

    def lobby(self):
        lobby = self.s.get(f'{self.url_prefix}://{self.host}/lobby', self.headers, auth=(self.username, self.password), verify=config('SSL_VERIFY', cast=bool))
        return self.handle_response(lobby, 200, 'Accessed lobby!', f'Failed to access lobby with status code {lobby.status_code}, exiting...')

    def list_imported_decks(self):
        imported_decks = self.s.get(f'{self.url_prefix}://{self.host}/api/profile/decks', headers=self.headers, data=json.dumps(self.deck), verify=config('SSL_VERIFY', cast=bool))
        return self.handle_response(imported_decks, 200, 'Listed imported decks successfully', f'Failed listing imported decks with status code {imported_decks.status_code}, exiting...')

    def set_avatar(self, avatar):
        set_avatar = self.s.put(f'{self.url_prefix}://{self.host}/api/user/avatar/{avatar}', auth=(self.username, self.password), headers=self.headers, data=json.dumps(self.deck), verify=config('SSL_VERIFY', cast=bool))
        return self.handle_response(set_avatar, 200, 'Set avatar successfully', f'Failed setting avatar with error {set_avatar.status_code}, exiting...')

    def import_deck(self, imported_decks=[]):
        deck_names = set([d['name'] for d in imported_decks])
        if self.deck['name'] not in deck_names:
            import_deck = self.s.post(f'{self.url_prefix}://{self.host}/api/profile/decks', auth=(self.username, self.password), headers=self.headers, data=json.dumps(self.deck), verify=config('SSL_VERIFY', cast=bool))
            return self.handle_response(import_deck, 200, 'Imported deck successfully', f'Failed listing decks with error {import_deck.status_code}, exiting...')
        self.logger.info(f"Deck {self.deck['name']} has been already imported.")
        return True

    def set_active_deck(self):
        decks = self.s.get(f'{self.url_prefix}://{self.host}/api/profile/decks', auth=(self.username, self.password), headers=self.headers, verify=config('SSL_VERIFY', cast=bool))
        response = self.handle_response(decks, 200, 'Successfully retrieved decks', f'Could not retrieve decks. Status code: {decks.status_code}')
        if not response:
            exit(1)
        decks = decks.json()
        for d in decks:
            if d['name'] == self.deck['name']:
                deck_id = d['id']
        if deck_id is None:
            raise Exception('Deck not found!')
        active_deck = self.s.put(f'{self.url_prefix}://{self.host}/api/user/active-deck/{deck_id}', auth=(self.username, self.password), headers=self.headers, verify=config('SSL_VERIFY', cast=bool))
        return self.handle_response(active_deck, 200, 'Deck set succesfully to active', f'Failed to set deck as active with status code {active_deck.status_code}, exiting...')

    def initialize_game(self, starting_game):
        self.game = starting_game
        self.game['player1Reveal'] = []
        self.game['player1BreedingArea'] = []
        self.game['player1Digi'] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
        self.game['player1Trash'] = []
        self.game['player2Digi'] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
        self.game['player2BreedingArea'] = []
        self.game['player2Reveal'] = []
        self.game['player2Trash'] = []
        self.game['memory'] = 0

    async def enter_lobby_message(self, message):
        self.logger.info('Entered lobby, greeting players.')
        async with websockets.connect(self.chat_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            await ws.send(message)
            await ws.recv()

    async def wait_in_lobby(self):
        async with websockets.connect(self.chat_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            while True:
                self.logger.debug('Waiting in lobby.')
                await ws.send("/heartbeat/")
                message = await ws.recv()
                self.logger.debug(f"Received: {message}")
                if(message.startswith('[INVITATION]:')):
                    challenger = message.removeprefix('[INVITATION]:')
                    self.game_name = f'{challenger}‗{self.username}'
                    self.logger.info(f'Challenger: {challenger}')
                    await ws.send(f"/acceptInvite:{challenger}")
                    self.loop.create_task(self.online_ping(ws))
                    return challenger
                time.sleep(1)

    def join_lobby(self):
        ## Access Lobby and become available for a match
        while True:
            self.logger.info('Entering lobby.')
            lobby_response = self.s.get(f'{self.url_prefix}://{self.host}/lobby', auth=(self.username, self.password), verify=config('SSL_VERIFY', cast=bool))
            if lobby_response.status_code == 200:
                self.logger.info('Accessed lobby, saying Hi')
                # Removed by now, can set cooldown later
                # asyncio.run(self.enter_lobby_message(f'Hi everyone! Let\'s play together!'))
                self.opponent = asyncio.run(self.wait_in_lobby())
                self.logger.info('Opponent found, starting game.')
                try:
                    asyncio.run(self.play())
                except RuntimeError as e:
                    # TODO: Better error handling
                    # asyncio.run(self.send_game_chat_message(ws, 'An error occurred, I am leaving the game and returning to Lobby. Please contact Project Drasil support team and report the issue.'))
                    raise e
            else:
                self.logger.error('Error when accessing/waiting in lobby')
                self.logger.error(lobby_response.text)
    
    async def send_message(self, ws, message):
        self.logger.info(message)
        await self.send_game_chat_message(ws, message)

    async def send_game_chat_message(self, ws, message):
        await ws.send(f"{self.game_name}:/chatMessage:{self.opponent}:{message}")

    async def send_game_chat_update_memory(self, ws, message):
        await ws.send(f"{self.game_name}:/updateMemory:{self.opponent}:{message}")
    
    async def update_phase(self, ws):
        self.logger.info('Go to next phase.')
        await ws.send(f"{self.game_name}:/updatePhase:{self.opponent}")
        await ws.send(f"{self.game_name}:/playNextPhaseSfx:{self.opponent}")
    
    async def activate_effect_on_battlefield(self, ws, card_id):
        card_index = self.find_card_index_by_id_in_battle_area(card_id)
        card = self.game['player2Digi'][card_index[0]][card_index[1]]
        await ws.send(f'{self.game_name}:/activateEffect:{self.opponent}:{card_id}')
        await self.send_game_chat_message(ws, f"[FIELD_UPDATE]≔【{card['name']} at BA {card_index[0] + 1}】﹕✨ EFFECT ✨")
        await ws.send(f'{self.game_name}:/playActivateEffectSfx:{self.opponent}')
    
    async def pass_turn(self, ws):
        self.logger.info('Pass turn.')
        await ws.send(f'{self.game_name}:/updatePhase:{self.opponent}')
        await ws.send(f'{self.game_name}:/playPassTurnSfx:{self.opponent}')

    async def shuffle_deck(self, ws):
        self.logger.info('Shuffling deck.')
        self.game['player2DeckField'] += list(self.game['player2Hand'])
        random.shuffle(self.game['player2DeckField'])
        await self.play_shuffle_deck_sfx(ws)
    
    def is_placed_this_turn(self, card_id):
        return card_id in self.placed_this_turn
    
    def find_card_index_by_id_in_stack(self, stack, id):
        for i in range(len(stack)):
            card = stack[i]
            if card['id'] == id:
                return i
        raise RuntimeError(f'Card with id {id} not found in {stack}')
    
    def find_card_index_by_id_in_reveal(self, id):
        for i in range(len(self.game['player2Reveal'])):
            card = self.game['player2Reveal'][i]
            if card['id'] == id:
                return i
        raise RuntimeError(f'Card with id {id} not found in trash.')
    
    def find_card_index_by_id_in_battle_area(self, id):
        for i in range(len(self.game[f'player2Digi'])):
            if len(self.game[f'player2Digi'][i]) > 0:
                for j in range(len(self.game[f'player2Digi'][i])):
                    card = self.game[f'player2Digi'][i][j]
                    if card['id'] == id:
                        return i, j
        raise RuntimeError(f'Card with id {id} not found in battle area.')
    
    def find_card_index_by_id_in_trash(self, id):
        for i in range(len(self.game['player2Trash'])):
            card = self.game['player2Trash'][i]
            if card['id'] == id:
                return i
        raise RuntimeError(f'Card with id {id} not found in trash.')

    def find_card_index_by_id_in_security(self, id):
        for i in range(len(self.game['player2Security'])):
            card = self.game['player2Security'][i]
            if card['id'] == id:
                return i
        raise RuntimeError(f'Card with id {id} not found in trash.')
    
    def spawn_token(self, card_id, card_name):
        empty_slot = self.get_empty_slot_in_battle_area(back=False, token=True, location='player1Digi')
        if empty_slot is None:
            return
        token = self.card_factory.get_token_by_name(card_name, card_id)
        self.game['player1Digi'][empty_slot] = [token]
        self.logger.debug(self.game['player1Digi'])
        

    def get_first_digit_index(self, s):
        for i in range(len(s)):
            if s[i].isdigit():
                return i

    def get_stack(self, location):
        stack = None
        if 'BreedingArea' in location:
            location = GAME_LOCATIONS_MAP[location]
            stack = self.game[location]
        else:
            first_digit_index = self.get_first_digit_index(location)
            index = int(location[first_digit_index:])
            if location.startswith('myDigi'):
                index -= 1
            self.logger.debug(f'Location index: {index}')
            location = GAME_LOCATIONS_MAP[location[:first_digit_index]]
            self.logger.debug(f'Location index: {index}')
            stack = self.game[location][index]
            self.logger.debug(f'STACK:{stack}')
        return stack

    def get_empty_slot_in_battle_area(self, back, token=False, location='player2Digi'):
        self.logger.debug('Searching for empty slot in my battle area.')
        if back:
            min_index=10
            max_index=15
        else:
            min_index=0
            max_index=10
        found = False
        for i in range(min_index, max_index):
            if len(self.game[location][i]) == 0:
                return i
        if not found:
            if token:
                return None
            if back:
                return 10
            else:
                return 0

    async def field_update(self, ws, card_name, fr, to):
        first_index_digit = self.get_first_digit_index(fr)
        if fr[first_index_digit:].isdigit():
            fr = fr.replace(fr[:first_index_digit], FIELD_UPDATE_MAP[fr[:first_index_digit]])
        else:
            fr = FIELD_UPDATE_MAP[fr]
        first_index_digit = self.get_first_digit_index(to)
        if to[first_index_digit:].isdigit():
            to = to.replace(to[:first_index_digit], FIELD_UPDATE_MAP[to[:first_index_digit]])
        else:
            to = FIELD_UPDATE_MAP[to]
        if fr == 'Deck' and to == 'Hand':
            await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【Draw Card】')
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card_name}】﹕{fr} ➟ {to}')
    
    async def move_card_to_deck(self, ws, to, card_id, card_index):
        await ws.send(f'{self.game_name}:/moveCardToStack:{self.opponent}:{to}:{card_id}:myDigi{card_index + 1}:myDeckField:false')

    async def move_card(self, ws, fr, to, target_card_id=None, field_update=True):
        self.logger.debug(self.game['player1Digi'])
        self.logger.debug(f'Moving card from {fr} to {to}.')
        stack = self.get_stack(fr)
        if type(stack) == dict:
            stack = [stack]
        if target_card_id is not None:
            card_index = self.find_card_index_by_id_in_stack(stack, target_card_id)
            stack = [stack[card_index]]
        for card in stack:
            card_id = card['id']
            card_name = card['name']
            move_fr = fr
            move_to = to
            if fr.startswith('myHand'):
                fr = move_fr = 'myHand'
            if to.startswith('myHand'):
                to = move_to = 'myHand'
            if fr.startswith('myReveal'):
                fr = move_fr = 'myReveal'
            if fr.startswith('myEggDeck'):
                fr = move_fr = 'myEggDeck'
            if to.startswith('myEggDeck'):
                to = move_to = 'myEggDeck'
            if fr.startswith('myBreedingArea'):
                fr = move_fr = 'myBreedingArea'
            if to.startswith('myBreedingArea'):
                to = move_to = 'myBreedingArea'
            if fr.startswith('myDeckField'):
                fr = move_fr = 'myDeckField'
            if to.startswith('myDeckField'):
                to = move_to = 'myDeckField'
            if fr.startswith('myTrash'):
                fr = move_fr = 'myTrash'
            if to.startswith('myTrash'):
                to = move_to = 'myTrash'
            if fr.startswith('mySecurityBottom'):
                fr = 'mySecurityBottom'
                move_fr = 'mySecurity'
            if to.startswith('mySecurityBottom'):
                to = 'mySecurityBottom'
                move_to = 'mySecurity'
            if fr.startswith('mySecurityTop'):
                fr = 'mySecurityTop'
                move_fr = 'mySecurity'
            if to.startswith('mySecurityTop'):
                to = 'mySecurityTop'
                move_to = 'mySecurity'
            if fr.startswith('mySecurity'):
                fr = move_fr = 'mySecurity'
            if to.startswith('mySecurity'):
                to = move_to = 'mySecurity'
            if fr.startswith('mySecurity'):
                fr = move_fr = 'mySecurity'
            if to.startswith('mySecurity'):
                to = move_to = 'mySecurity'
            if fr.startswith('myReveal'):
                fr = move_fr = 'myReveal'
            if to.startswith('myReveal'):
                to = move_to = 'myReveal'
            await ws.send(f'{self.game_name}:/moveCard:{self.opponent}:{card_id}:{move_fr}:{move_to}')
            if field_update:
                await self.field_update(ws, card_name, fr, to)
            await self.play_place_card_sfx(ws)
            time.sleep(0.5)

    async def send_player_ready(self, ws):
        await ws.send(f'{self.game_name}:/playerReady:{self.opponent}')

    async def play_shuffle_deck_sfx(self, ws):
        await ws.send(f'{self.game_name}:/playShuffleDeckSfx:{self.opponent}')

    async def play_place_card_sfx(self, ws):
        await ws.send(f'{self.game_name}:/playPlaceCardSfx:{self.opponent}')

    async def play_button_click_sfx(self, ws):
        await ws.send(f'{self.game_name}:/playButtonClickSfx:{self.opponent}')

    async def play_suspend_card_sfx(self, ws):
        await ws.send(f'{self.game_name}:/playSuspendCardSfx:{self.opponent}')

    async def play_unsuspend_card_sfx(self, ws):
        await ws.send(f'{self.game_name}:/playUnsuspendCardSfx:{self.opponent}')

    async def hi(self, ws, message):
        self.logger.info('Greeting player.')
        if not message.startswith('[START_GAME]:'):
            raise Exception('Message does not contain [START_GAME] information to say hi!')
        players_info = json.loads(message.removeprefix('[START_GAME]:'))
        for player in players_info:
            if player['username'] != self.username:
                await self.send_game_chat_message(ws, f"Hi {player['username']}, good luck with the game!")
                break

    async def surrender(self, ws, message):
        self.logger.info(message)
        await self.send_message(ws, message)
        await ws.send(f'{self.game_name}:/surrender:{self.opponent}')

    async def update_game(self, ws):
        self.logger.debug('Send whole game status.')
        update = {}
        update['playerHand'] = self.game['player2Hand']
        update['playerDeckField'] = self.game['player2DeckField']
        update['playerReveal'] = self.game['player2Reveal']
        for i in range(1, len(self.game['player2Digi']) + 1):
            update[f'playerDigi{i}'] = self.game['player2Digi'][i-1]
        update['playerBreedingArea'] = self.game['player2BreedingArea']
        update['playerEggDeck'] = self.game['player2EggDeck']
        update['playerSecurity'] = self.game['player2Security']
        update['playerTrash'] = self.game['player2Trash']
        update['playerPhase'] = 'Breeding'
        update['playerMemory'] = 0
        update['isPlayerTurn'] = not self.my_turn
        n = config('WS_CHUNK_SIZE', cast=int)
        g = json.dumps(update)
        chunks = [g[i:i+n] for i in range(0, len(g), n)]
        for chunk in chunks:
            await ws.send(f'{self.game_name}:/updateGame:{chunk}')
            message = ""
            wait_for = 0
            while not message.startswith('[LOADED]'):
                message = await asyncio.wait_for(ws.recv(), timeout=config('TIMEOUT_INTERVAL', cast=int))
                self.logger.debug(f'Received: {message}')
                if wait_for >= config('TIMEOUT_INTERVAL', cast=int):
                    raise RuntimeError('Error while communicating updated game to player.')
                wait_for += 1
    
    async def update_opponent_game(self, ws, updated_game):
        self.game['player1Hand'] = updated_game['playerHand']
        self.game['player1DeckField'] = updated_game['playerDeckField']
        self.game['player1Security'] = updated_game['playerSecurity']

    async def mulligan(self, ws):
        self.logger.info('I mulligan.')
        await self.send_game_chat_message(ws, '[FIELD_UPDATE]≔【MULLIGAN】')
        self.game['player2DeckField'].extend([self.game['player2Hand'].pop(0) for i in range(0,5)])
        random.shuffle(self.game['player2DeckField'])
        self.game['player2Hand']=[self.game['player2DeckField'].pop(0) for i in range(0,5)]
        await self.update_game(ws)        

    async def hatch(self, ws):
        self.logger.info('Hatch from breeding area.')
        await self.move_card(ws, 'myEggDeck0', 'myBreedingArea0')
        self.game['player2BreedingArea'].append(self.game['player2EggDeck'].pop(0))
        time.sleep(2)

    def card_in_hand(self, unique_card_number, card_name):
        self.logger.info(f'Searching for card {unique_card_number}-{card_name} in hand.')
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            if card['uniqueCardNumber']== unique_card_number and card['name'] == card_name:
                self.logger.info(f'Card {unique_card_number}-{card_name} found in hand at position {i}.')
                return i
        self.logger.info(f'Card {unique_card_number}-{card_name} not found in hand.')
        return -1
    
    def cards_in_battle_area(self, unique_card_number, card_name):
        self.logger.info(f'Searching for card {unique_card_number}-{card_name} in my battle area.')
        card_indices = []
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['uniqueCardNumber']== unique_card_number and card['name'] == card_name:
                    self.logger.info(f'Card {unique_card_number}-{card_name} found in my battle area at position {i}.')
                    card_indices.append(i)
        self.logger.info(f'Card {unique_card_number}-{card_name} not found in my battle area.')
        return card_indices
    
    def card_in_battle_area_with_name(self, card_name):
        self.logger.info(f'Searching for a {card_name} in my battle area.')
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['name'] == card_name:
                    self.logger.info(f"Card {card['uniqueCardNumber']}-{card_name} found in my battle area at position {i}.")
                    return i
        self.logger.info(f'No {card_name} not found in my battle area.')
        return -1
    
    def card_in_trash(self, unique_card_number, card_name):
        self.logger.info(f'Searching for card {unique_card_number} {card_name} in trash.')
        for i in range(len(self.game['player2Trash'])):
            card = self.game['player2Trash'][i]
            if card['uniqueCardNumber'] == unique_card_number and card['name'] == card_name:
                self.logger.info(f'Card {unique_card_number}-{card_name} found in trash area at position {i}.')
                return i
        self.logger.info(f'Card {unique_card_number}-{card_name} not found in trash.')
        return -1
    
    def card_has_name_in_trash(self, card_name):
        self.logger.info(f'Searching for a {card_name} in trash.')
        for i in range(len(self.game['player2Trash'])):
            card = self.game['player2Trash'][i]
            if card['name'] == card_name:
                self.logger.info(f"Card {card['uniqueCardNumber']}-{card_name} found in trash area at position {i}.")
                return i
        self.logger.info(f'No {card_name} not found in trash.')
        return -1

    def digivolution_cost(self, card):
        # EX2-039 and EX2-044 Beelzemon cards do not contain digivolution cost information
        self.logger.debug('Get digivolution cost from card.')
        if card['uniqueCardNumber'] == 'EX2-039':
            return 0
        if card['uniqueCardNumber'] == 'EX2-044':
            return 3
        return card['digivolveConditions'][0]['cost']

    def digimon_of_level_in_hand(self, level):
        self.logger.info(f'Searching for a digimon in hand of level {level}.')
        self.logger.debug(self.game['player2Hand'])
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            if card['cardType'] == 'Digimon' and card['level'] == level:
                self.logger.info(f"Found digimon {card['uniqueCardNumber']}-{card['name']} in hand at position {i}.")
                return i
        self.logger.info(f'No digimon of level {level} found in hand.')
        return -1

    def digimons_in_battle_area(self):
        self.logger.info('Finding all digimons that can attack')
        digimon_indices = []
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['cardType'] == 'Digimon':
                    self.logger.info(f"{card['uniqueCardNumber']}-{card['name']} can attack")
                    digimon_indices.append(i)
        return digimon_indices

    def can_attack(self, card):
        if card['isTilted']:
            return False
        if card['id'] in self.placed_this_turn:
            return False
        if card['id'] in self.cant_attack_until_end_of_turn:
            return False
        if card['id'] in self.cant_attack_until_end_of_opponent_turn:
            return False
        if card['id'] in self.cant_suspend_until_end_of_turn:
            return False
        if card['id'] in self.cant_suspend_until_end_of_opponent_turn:
            return False
        return True

    def can_attack_digimons(self):
        self.logger.info('Finding all digimons that can attack')
        digimon_indices = []
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['cardType'] == 'Digimon' and self.can_attack(card):
                    self.logger.info(f"{card['uniqueCardNumber']}-{card['name']} can attack")
                    digimon_indices.append(i)
        return digimon_indices

    async def find_can_attack_any_digimon(self, ws):
        self.logger.info('Finding any digimons that can attack.')
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['cardType'] == 'Digimon' and self.can_attack(card):
                    self.logger.info(f"{card['uniqueCardNumber']}-{card['name']} can attack")
                    return i
        self.logger.info('No Digimon to attack with')
        return -1

    async def attack_with_digimon(self, ws, digimon_index):
        card = self.game['player2Digi'][digimon_index][-1]
        card_index, _ = self.find_card_index_by_id_in_battle_area(card['id'])
        self.logger.info(f"Attacking with {card['uniqueCardNumber']}-{card['name']}")
        await self.send_message(ws, f"Attacking with {card['uniqueCardNumber']}-{card['name']}")
        await self.suspend_card(ws, card_index)
        await ws.send(f"{self.game_name}:/attack:{self.opponent}:myDigi{card_index+1}:opponentSecurity:true")
        await ws.send(f'{self.game_name}:/playSuspendCardSfx:{self.opponent}')
        await self.waiter.wait_for_opponent_counter_blocking(ws)
    
    async def declare_blocker(self, ws, digimon_index):
        if digimon_index == -1:
            await self.send_message(ws, f"No Digimon to block with.")
            return
        card = self.game['player2Digi'][digimon_index][-1]
        card_index, _ = self.find_card_index_by_id_in_battle_area(card['id'])
        self.logger.info(f"Blocking with {card['uniqueCardNumber']}-{card['name']}")
        await self.send_message(ws, f"Blocking with {card['uniqueCardNumber']}-{card['name']}")
        await self.suspend_card(ws, card_index)
        await ws.send(f'{self.game_name}:/playSuspendCardSfx:{self.opponent}')

    def find_can_attack_digimon_of_level(self, level):
        self.logger.info(f'Searching for a digimon in my battle area of {level} that cab attack.')
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['cardType'] == 'Digimon' and card['level'] == level and self.can_attack(card):
                    self.logger.info(f"Found unsuspended digimon {card['uniqueCardNumber']}-{card['name']} in my battle area at position {i}.")
                    return i
        self.logger.info(f'No digimon of level {level} found that can attack.')
        return -1

    def cheap_digimon_in_hand_to_play(self, max_memory_to_opponent):
        candidates = []
        self.logger.info(f'Searching for a digimon in hand of that would give max {max_memory_to_opponent} if played.')
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            final_memory_value = self.game['memory'] - card['playCost']
            if card['cardType'] == 'Digimon' and (final_memory_value >= 0 or (final_memory_value <0 and abs(final_memory_value) <= max_memory_to_opponent)):
                self.logger.info(f"Found digimon {card['uniqueCardNumber']}-{card['name']} in hand at position {i}.")
                candidates.append((card['playCost'], i))
        if len(candidates) > 0:
            return sorted(candidates)[0][1]
        self.logger.info('No digimon cheap enough found in hand.')
        return -1

    def card_of_type_in_hand(self, type):
        self.logger.info(f'Searching for {type} card in hand.')
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            if card['cardType'] == type:
                self.logger.info(f"Found {card['uniqueCardNumber']}-{card['name']} in hand at position {i}.")
                return i
        self.logger.info(f'No card of type {type} found')
        return -1
    
    def no_digimon_in_battle_area(self):
        self.logger.info('Checking that there isn\'t any digimon in my battle area.')
        for digi in self.game['player2Digi']:
            if len(digi) > 0 and digi[-1]['cardType'] == 'Digimon':
                self.logger.info(f"Found {digi[-1]['uniqueCardNumber']}-{digi[-1]['name']}")
                return False
        self.logger.info(f'No digimon found in my battle area.')
        return True
    
    def any_suspended_card_on_field(self):
        self.logger.info('Checking if there is any suspended card in my battle area.')
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['isTilted']:
                    self.logger.info(f"Found {card['uniqueCardNumber']}-{card['name']}.")
                    return True
        self.logger.info('Checking that there isn\'t any digimon in my battle area.')
        return False

    async def unsuspend_all(self, ws):
        self.logger.info('Unsuspending all cards in my battle area.')
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) > 0:
                card = self.game['player2Digi'][i][-1]
                if card['id'] not in self.cant_unsuspend_until_end_of_turn and card['isTilted']:
                    await self.unsuspend_card(ws, i)

    async def suspend_card(self, ws, card_index):
        card = self.game['player2Digi'][card_index][-1]
        self.logger.info(f"Suspending {card['uniqueCardNumber']}-{card['name']}.")
        if not card['isTilted']:
            card['isTilted'] = True
            await ws.send(f"{self.game_name}:/tiltCard:{self.opponent}:{card['id']}:myDigi{card_index+1}")
            await ws.send(f'{self.game_name}:/playSuspendCardSfx:{self.opponent}')

    async def unsuspend_card(self, ws, card_index):
        card = self.game['player2Digi'][card_index][-1]
        self.logger.info(f"Suspending {card['uniqueCardNumber']}-{card['name']}.")
        if card['isTilted']:
            card['isTilted'] = False
            await ws.send(f"{self.game_name}:/tiltCard:{self.opponent}:{card['id']}:myDigi{card_index+1}")
            await ws.send(f'{self.game_name}:/playSuspendCardSfx:{self.opponent}')


    ## TODO: Potentially split this into two methods, one for breeding area and one for battle area
    async def digivolve(self, ws, digimon_location, digimon_card_index, digivolution_card_location, digivolution_card_index, cost):
        if digimon_location == 'BreedingArea':
            dest = f'my{digimon_location}'
        else:
            dest = f'my{digimon_location}{digimon_card_index+1}'
        await self.move_card(ws, f'my{digivolution_card_location}{digivolution_card_index}', dest)
        if digimon_location == 'BreedingArea':
            digimon = self.game[f'player2{digimon_location}'][-1]
        else:
            digimon = self.game[f'player2{digimon_location}'][digimon_card_index][-1]
        digivolution_card = self.game[f'player2{digivolution_card_location}'].pop(digivolution_card_index)
        digivolution_card['isTilted'] = digimon['isTilted']
        digimon['isTilted'] = False
        await self.send_message(ws, f"Digivolving {digimon['uniqueCardNumber']}-{digimon['name']} into {digivolution_card['uniqueCardNumber']}-{digivolution_card['name']} from {digivolution_card_location}")
        self.logger.info(f"Digivolving {digimon['uniqueCardNumber']}-{digimon['name']} into {digivolution_card['uniqueCardNumber']}-{digivolution_card['name']} at position {digimon_card_index} in {digimon_location}.")
        if digimon_location == 'BreedingArea':
            self.game[f'player2{digimon_location}'].append(digivolution_card)
        else:
            self.game[f'player2{digimon_location}'][digimon_card_index].append(digivolution_card)
        if digimon['id'] in self.cant_unsuspend_until_end_of_turn:
            self.cant_unsuspend_until_end_of_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_unsuspend_until_end_of_opponent_turn:
            self.cant_unsuspend_until_end_of_opponent_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_suspend_until_end_of_turn:
            self.cant_suspend_until_end_of_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_suspend_until_end_of_opponent_turn:
            self.cant_suspend_until_end_of_opponent_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_attack_until_end_of_turn:
            self.cant_attack_until_end_of_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_attack_until_end_of_opponent_turn:
            self.cant_attack_until_end_of_opponent_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_block_until_end_of_turn:
            self.cant_block_until_end_of_turn.add(digivolution_card['id'])
        if digimon['id'] in self.cant_block_until_end_of_opponent_turn:
            self.cant_block_until_end_of_opponent_turn.add(digivolution_card['id'])
        if digimon['id'] in self.start_mp_attack:
            self.start_mp_attack.add(digivolution_card['id'])
        if digimon['id'] in self.placed_this_turn:
            self.placed_this_turn.add(digivolution_card['id'])
        if cost > 0:
            await self.decrease_memory_by(ws, cost)
        await self.draw(ws, 1)
        time.sleep(2)

    async def play_card(self, ws, card_location, card_index, cost, back=False):
        i = self.get_empty_slot_in_battle_area(back)
        await self.move_card(ws, f'my{card_location}{card_index}', f'myDigi{i+1}')
        card = self.game[f'player2{card_location}'].pop(card_index)
        await self.send_message(ws, f"I play {card['uniqueCardNumber']}-{card['name']} with cost {cost}")
        self.game['player2Digi'][i].append(card)
        self.placed_this_turn.add(card['id'])
        if cost > 0:
            await self.decrease_memory_by(ws, cost)
        return card

    async def trash_card_from_hand(self, ws, card_index):
        await self.move_card(ws, f'myHand{card_index}', 'myTrash')
        card = self.game['player2Hand'].pop(card_index)
        await self.send_message(ws, f"Trashing {card['uniqueCardNumber']}-{card['name']}")
        self.game['player2Trash'].insert(0, card)
    
    async def trash_card_from_reveal(self, ws, card_index):
        await self.move_card(ws, f'myReveal{card_index}', 'myTrash')
        card = self.game['player2Reveal'].pop(card_index)
        await self.send_message(ws, f"Trashing {card['uniqueCardNumber']}-{card['name']}")
        self.game['player2Trash'].insert(0, card)

    async def trash_top_card_of_security(self, ws):
        if len(self.game['player2Security']) > 0:
            await self.move_card(ws, f'mySecurityTop0', 'myTrash')
            card = self.game['player2Security'].pop(0)
            await self.send_message(ws, f"Trashing {card['uniqueCardNumber']}-{card['name']} from security")
            self.game['player2Trash'].insert(0, card)
            return
        self.send_message('No card left in security stack.')

    async def trash_bottom_card_of_security(self, ws):
        if len(self.game['player2Security']) > 0:
            card_index = len(self.game['player2Security']) - 1
            await self.move_card(ws, f"mySecurityBottom{card_index}", 'myTrash')
            card = self.game['player2Security'].pop(card_index)
            await self.send_message(ws, f"Trashing {card['uniqueCardNumber']}-{card['name']} from security")
            self.game['player2Trash'].insert(0, card)
            return
        self.send_message('No card left in security stack.')

    async def place_card_from_battle_area_on_top_of_security(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        await self.move_card(ws, f'myDigi{card_index+1}', 'mySecurityTop0', target_card_id=card_id)
        card = self.game['player2Digi'][card_index].pop(-1)
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Security Top')
        await self.send_message(ws, f"Place {card['uniqueCardNumber']}-{card['name']} on top of security stack.")
        self.game['player2Security'].insert(0, card)
        stack = self.game['player2Digi'][card_index]
        if len(stack) > 0:
            await self.delete_stack_from_battle_area(ws, stack[-1]['id'])

    async def place_card_from_battle_area_to_bottom_of_security(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        await self.move_card(ws, f'myDigi{card_index+1}', f"mySecurityBottom{len(self.game['player2Security']) - 1}", target_card_id=card_id)
        card = self.game['player2Digi'][card_index].pop(-1)
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Security Bottom')
        await self.send_message(ws, f"Place {card['uniqueCardNumber']}-{card['name']} to bottom of security stack.")
        self.game['player2Security'].append(card)
        stack = self.game['player2Digi'][card_index]
        if len(stack) > 0:
            await self.delete_stack_from_battle_area(ws, stack[-1]['id'])
    
    async def trash_digivolution_card(self, ws, card_id, digivolution_card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        stack = self.game['player2Digi'][card_index]
        digivolution_card_index = self.find_card_index_by_id_in_stack(stack, digivolution_card_id)
        await self.move_card(ws, f'myDigi{card_index+1}', 'myTrash', target_card_id=digivolution_card_id)
        card = self.game['player2Digi'][card_index].pop(digivolution_card_index)
        await self.send_message(ws, f"Trashing {card['uniqueCardNumber']}-{card['name']}")
        self.game['player2Trash'].insert(0, card)
    
    async def de_digivolve(self, ws, card_id, n):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        for _ in range(n):
            stack = self.game['player2Digi'][card_index]
            if len(stack) >= 2 and stack[-2]['level'] >= 3:
                tilted = stack[-1]['isTilted']
                card_id = stack[-1]['id']
                await self.move_card(ws, f'myDigi{card_index+1}', 'myTrash', target_card_id=card_id)
                card = self.game['player2Digi'][card_index].pop(-1)
                await self.send_message(ws, f"Trashing {card['uniqueCardNumber']}-{card['name']}")
                self.game['player2Trash'].insert(0, card)
                if tilted:
                    await self.suspend_card(ws, card_index)
    
    async def trash_all_digivolution_cards(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        stack = self.game['player2Digi'][card_index]
        for digivolution_card in stack[:-1]:
            await self.trash_digivolution_card(ws, stack[-1]['id'], digivolution_card['id'])

    async def return_from_battle_area_to_bottom_of_deck(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        await self.move_card_to_deck(ws, 'Bottom', card_id, card_index)
        card = self.game['player2Digi'][card_index].pop(-1)
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Deck Bottom')
        await self.send_message(ws, f"Return {card['uniqueCardNumber']}-{card['name']} to bottom of deck.")
        self.game['player2DeckField'].insert(0, card)
        stack = self.game['player2Digi'][card_index]
        await self.move_card(ws, f'myDigi{card_index+1}', f'myTrash')
        for i in range(len(stack)):
            card = self.game['player2Digi'][card_index].pop(-1)
            await self.send_message(ws, f"Move {card['uniqueCardNumber']}-{card['name']} from battle area to trash.")
            self.game['player2Trash'].insert(0, card)

    async def return_from_battle_area_to_top_of_deck(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        await self.move_card_to_deck(ws, 'Top', card_id, card_index)
        card = self.game['player2Digi'][card_index].pop(-1)
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Deck Top')
        await self.send_message(ws, f"Return {card['uniqueCardNumber']}-{card['name']} to top of deck.")
        self.game['player2DeckField'].insert(0, card)
        stack = self.game['player2Digi'][card_index]
        await self.move_card(ws, f'myDigi{card_index+1}', f'myTrash')
        for i in range(len(stack)):
            card = self.game['player2Digi'][card_index].pop(-1)
            await self.send_message(ws, f"Move {card['uniqueCardNumber']}-{card['name']} from battle area to trash.")
            self.game['player2Trash'].insert(0, card)

    async def return_from_battle_area_to_hand(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        await self.move_card(ws, f'myDigi{card_index+1}', 'myHand0', target_card_id=card_id)
        card = self.game['player2Digi'][card_index].pop(-1)
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Hand')
        await self.send_message(ws, f"Return {card['uniqueCardNumber']}-{card['name']}.")
        self.game['player2Hand'].append(card)
        stack = self.game['player2Digi'][card_index]
        await self.move_card(ws, f'myDigi{card_index+1}', f'myTrash')
        for i in range(len(stack)):
            card = self.game['player2Digi'][card_index].pop(-1)
            await self.send_message(ws, f"Move {card['uniqueCardNumber']}-{card['name']} from battle area to trash.")
            self.game['player2Trash'].insert(0, card)
    
    async def return_from_trash_to_bottom_of_deck(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_trash(card_id)
        card = self.game['player2Trash'].pop(card_index)
        self.logger.info(f"Return {card['uniqueCardNumber']}-{card['name']} to bottom of deck from trash.")
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Deck Bottom')
        self.game['player2DeckField'].append(card)
        return card
    
    async def move_card_from_trash_to_battle_area(self, ws, card_id, back=False):
        i = self.get_empty_slot_in_battle_area(back)
        card_index = self.find_card_index_by_id_in_trash(card_id)
        await self.move_card(ws, f'myTrash{card_index}', f'myDigi{i+1}')
        card = self.game['player2Trash'][card_index]
        await self.send_message(ws, f"Move {card['uniqueCardNumber']}-{card['name']} to battle area from trash.")
        self.game['player2Digi'][i].append(card)
        return card

    async def delete_stack_from_battle_area(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        stack = self.game['player2Digi'][card_index]
        cards_to_delete_ids = [c['id'] for c in reversed(stack)]
        for card_id in cards_to_delete_ids:
            await self.delete_card_from_battle_area(ws, card_id)

    async def delete_card_from_battle_area(self, ws, card_id):
        card_index, _ = self.find_card_index_by_id_in_battle_area(card_id)
        await self.move_card(ws, f'myDigi{card_index+1}', 'myTrash', target_card_id=card_id)
        card = self.game['player2Digi'][card_index][-1]
        await self.send_message(ws, f"Deleting {card['uniqueCardNumber']}-{card['name']}.")
        card['isTilted'] = False
        self.game['player2Trash'].insert(0, self.game['player2Digi'][card_index].pop(-1))     
        if card['id'] in self.cant_unsuspend_until_end_of_turn:
            self.cant_unsuspend_until_end_of_turn.remove(card['id'])
        if card['id'] in self.cant_unsuspend_until_end_of_opponent_turn:
            self.cant_unsuspend_until_end_of_opponent_turn.remove(card['id'])
        if card['id'] in self.cant_suspend_until_end_of_turn:
            self.cant_suspend_until_end_of_turn.remove(card['id'])
        if card['id'] in self.cant_suspend_until_end_of_opponent_turn:
            self.cant_suspend_until_end_of_opponent_turn.remove(card['id'])
        if card['id'] in self.cant_attack_until_end_of_turn:
            self.cant_attack_until_end_of_turn.remove(card['id'])
        if card['id'] in self.cant_attack_until_end_of_opponent_turn:
            self.cant_attack_until_end_of_opponent_turn.remove(card['id'])
        if card['id'] in self.cant_block_until_end_of_turn:
            self.cant_block_until_end_of_turn.remove(card['id'])
        if card['id'] in self.cant_block_until_end_of_opponent_turn:
            self.cant_block_until_end_of_opponent_turn.remove(card['id'])
        if card['id'] in self.start_mp_attack:
            self.start_mp_attack.remove(card['id'])
        return card
    
    async def delete_card_from_opponent_battle_area(self, ws, card_index):
        card_name = self.game['player1Digi'][card_index][-1]['name']
        await self.send_message(ws, f'I\'d like to delete the {card_name} in position {card_index + 1}')
        await self.send_message(ws, 'Resolve effects and type Ok to continue.')
        await self.waiter.wait_for_actions(ws)

    async def promote(self, ws):
        self.logger.info('Promoting from breed area.')
        i = self.get_empty_slot_in_battle_area(False)
        await self.move_card(ws, 'myBreedingArea', f'myDigi{i+1}')
        self.game['player2Digi'][i].extend(self.game['player2BreedingArea'])
        self.game['player2BreedingArea'] = []
    
    async def draw_for_turn(self, ws, n_cards):
        if len(self.game['player2DeckField']) == 0:
            await self.surrender(ws, 'Oh no, I milled! Congratulations, you won!')
            exit(1)
        else:
            await self.draw(ws, n_cards)

    async def draw(self, ws, n_cards):
        self.logger.info(f'I draw {n_cards}.')
        for i in range(min(n_cards, len(self.game['player2DeckField']))):
            await self.move_card(ws, 'myDeckField0', 'myHand0', field_update=False)
            self.game['player2Hand'].insert(0, self.game['player2DeckField'].pop(0))

    async def return_card_from_trash_to_hand(self, ws, card_index):
        await self.move_card(ws, f'myDeckField{card_index}', 'myHand0')
        card = self.game['player2Trash'].pop(card_index)
        self.logger.info(f"Returning {card['uniqueCardNumber']}-{card['name']} from trash to hand.")
        self.game['player2Hand'].insert(0, card)
    
    async def reveal_card_from_security(self, ws, card_id):
        card_index = self.find_card_index_by_id_in_security(card_id)
        self.logger.info(f'Revealing security card at position {card_index} from security.')
        await self.move_card(ws, f'mySecurity{card_index}', 'myReveal', target_card_id=card_id)
        self.game['player2Reveal'].append(self.game['player2Security'].pop(card_index))
    
    async def security_check(self, ws, card_id):
        card_index = self.find_card_index_by_id_in_security(card_id)
        self.logger.info(f'Security check.')
        await self.move_card(ws, f'mySecurity{card_index}', 'myReveal', target_card_id=card_id)
        self.game['player2Reveal'].append(self.game['player2Security'].pop(card_index))

    async def reveal_card_from_top_of_deck(self, ws, n_cards):
        self.logger.info(f'Revealing top {n_cards} from deck.')
        for i in range(n_cards):
            if len(self.game['player2DeckField']) > 0:
                await self.move_card(ws, 'myDeckField0', 'myReveal')
                self.game['player2Reveal'].append(self.game['player2DeckField'].pop(0))
                time.sleep(0.2)
    
    async def add_card_from_reveal_to_hand(self, ws, card_id):
        card_index = self.find_card_index_by_id_in_reveal(card_id)
        await self.move_card(ws, f'myReveal{card_index}', 'myHand0')
        card = self.game['player2Reveal'].pop(card_index)
        await self.send_message(ws, f"I add {card['uniqueCardNumber']}-{card['name']} in my hand.")
        self.logger.info(f"Returning {card['uniqueCardNumber']}-{card['name']} from reveal to hand.")
        self.game['player2Hand'].insert(0, card)
    
    async def add_card_from_trash_to_hand(self, ws, card_id):
        card_index = self.find_card_index_by_id_in_trash(card_id)
        await self.move_card(ws, f'myTrash{card_index}', 'myHand0')
        card = self.game['player2Trash'].pop(card_index)
        self.logger.info(f"Returning {card['uniqueCardNumber']}-{card['name']} from trash to hand.")
        self.game['player2Hand'].insert(0, card)

    async def put_cards_to_bottom_of_deck(self, ws, cards_location):
        await self.send_message(ws, f'Put cards from {cards_location} to bottom of deck.')
        for i in range(len(self.game[f'player2{cards_location}'])):
            await self.put_card_to_bottom_of_deck(ws, cards_location, 0)

    async def put_card_to_bottom_of_deck(self, ws, card_location, card_index):
        card = self.game[f'player2{card_location}'].pop(card_index)
        await self.send_message(ws, f"Put {card['uniqueCardNumber']}-{card['name']} to bottom of deck.")
        await ws.send(f"{self.game_name}:/moveCardToStack:{self.opponent}:Bottom:{card['id']}:my{card_location}:myDeckField:false")
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Deck Bottom')
        self.game['player2DeckField'].append(card)

    async def put_cards_on_top_of_deck(self, ws, cards_location):
        self.logger.info(f'Put cards from {cards_location} on top of deck.')
        for i in range(len(self.game[f'player2{cards_location}'])):
            await self.put_card_on_top_of_deck(ws, cards_location, 0)

    async def put_card_on_top_of_deck(self, ws, card_location, card_index):
        card = self.game[f'player2{card_location}'].pop(card_index)
        await ws.send(f"{self.game_name}:/moveCardToStack:{self.opponent}:Top:{card['id']}:my{card_location}:myDeckField:false")
        await self.send_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Deck Top')
        self.game['player2DeckField'].insert(0, card)
        self.logger.info(f"Put {card['uniqueCardNumber']} {card['name']} on top of deck.")

    async def trash_top_cards_of_deck(self, ws, n):
        trashed_cards = []
        for i in range(n):
            if len(self.game['player2DeckField']) > 0:
                await self.move_card(ws, 'myDeckField0', 'myTrash')
                card = self.game['player2DeckField'].pop(0)
                self.game['player2Trash'].insert(0, card)
                trashed_cards.append(card)
        await self.when_cards_are_trashed_from_deck(ws, trashed_cards)
        return trashed_cards

    async def set_memory_to(self, ws, value):
        self.logger.info(f'Set memory to {value}')
        old_memory = self.game['memory']
        self.game['memory'] = int(value)
        await ws.send(f"{self.game_name}:/updateMemory:{self.opponent}:{self.game['memory']}")
        await self.send_game_chat_message(ws, f"[FIELD_UPDATE]≔【MEMORY】﹕{old_memory}±{self.game['memory']}")

    async def increase_memory_by(self, ws, value):
        self.logger.info(f'Increase memory by {value}')
        old_memory = self.game['memory']
        self.game['memory'] += int(value)
        if self.game['memory'] > 10:
            self.game['memory'] = 10
        await ws.send(f"{self.game_name}:/updateMemory:{self.opponent}:{self.game['memory']}")
        await self.send_game_chat_message(ws, f"[FIELD_UPDATE]≔【MEMORY】﹕{old_memory}±{self.game['memory']}")

    async def decrease_memory_by(self, ws, value):
        self.logger.info(f'Decrease memory by {value}')
        old_memory = self.game['memory']
        self.game['memory'] -= int(value)
        await ws.send(f"{self.game_name}:/updateMemory:{self.opponent}:{self.game['memory']}")
        await self.send_game_chat_message(ws, f"[FIELD_UPDATE]≔【MEMORY】﹕{old_memory}±{self.game['memory']}")

    async def start_turn(self):
        self.placed_this_turn.clear()
        self.cant_unsuspend_until_end_of_opponent_turn.clear()
        self.cant_suspend_until_end_of_opponent_turn.clear()
        self.cant_attack_until_end_of_opponent_turn.clear()
        self.cant_block_until_end_of_opponent_turn.clear()
        self.triggered_already_this_turn.clear()
        self.gained_baalmon_effect.clear()

    async def end_turn(self):
        self.placed_this_turn.clear()
        self.cant_unsuspend_until_end_of_turn.clear()
        self.cant_suspend_until_end_of_turn.clear()
        self.cant_attack_until_end_of_turn.clear()
        self.cant_block_until_end_of_turn.clear()
        self.start_mp_attack.clear()
        self.triggered_already_this_turn.clear()
        await self.waiter.reset_timestamp()

    async def loaded_ping(self, ws):
        await ws.send(f'{self.game_name}:/loaded:{self.opponent}')

    async def online_ping(self, ws):
        while True:
            await ws.send(f'{self.game_name}:/online:{self.opponent}')
            await asyncio.sleep(1)

    async def play(self):
        starting_game = ''
        async with websockets.connect(self.game_ws, timeout=5, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            try:
                opponent_ready = False
                done_mulligan = False
                await ws.send(f'/joinGame:{self.game_name}')
                message = ""
                self.logger.debug(f'Received: {message}')

                # Wait for player to be ready, return to lobby if timeout
                wait_for = 0
                while not message.startswith('[PLAYERS_READY]'):
                    message = await asyncio.wait_for(ws.recv(), timeout=config('TIMEOUT_INTERVAL', cast=int))
                    self.logger.debug(f'Received: {message}')
                    if wait_for >= config('TIMEOUT_INTERVAL', cast=int):
                        return False
                    wait_for += 1
                # await ws.send(f'/startGame:{self.game_name}')
                wait_for = 0
                while not message.startswith('[START_GAME]'):
                    message = await asyncio.wait_for(ws.recv(), timeout=config('TIMEOUT_INTERVAL', cast=int))
                    self.logger.debug(f'Received: {message}')
                    if wait_for >= config('TIMEOUT_INTERVAL', cast=int):
                        return False
                    wait_for += 1

                # Get player name information
                wait_for = 0
                while not message.startswith('[STARTING_PLAYER]'):
                    message = await asyncio.wait_for(ws.recv(), timeout=config('TIMEOUT_INTERVAL', cast=int))
                    self.logger.debug(f'Received: {message}')
                    if wait_for >= config('TIMEOUT_INTERVAL', cast=int):
                        return False
                    wait_for += 1
                starting_player = message.removeprefix('[STARTING_PLAYER]:')
                if starting_player == self.username:
                    self.first_turn = True
                    self.my_turn = True

                # Wait for cards to be distributed
                wait_for = 0
                while not message.startswith('[DISTRIBUTE_CARDS]:'):
                    message = await asyncio.wait_for(ws.recv(), timeout=config('TIMEOUT_INTERVAL', cast=int))
                    self.logger.debug(f'Received: {message}')
                    if wait_for >= config('TIMEOUT_INTERVAL', cast=int):
                        return False
                    wait_for += 1
                while True:
                    if message.startswith('[DISTRIBUTE_CARDS]:'):
                        starting_game += message.removeprefix('[DISTRIBUTE_CARDS]:')
                    else:
                        if starting_game != '':
                            self.initialize_game(json.loads(starting_game))
                        break
                    message = await ws.recv()
                await self.loaded_ping(ws)
                while not message.startswith('[LOADED]'):
                    message = await ws.recv()
                    self.logger.debug(f'Received: {message}')                

                # Wait for player to be ready
                starting_game = ''
                opponent_ready = True
                opponent_mulligan = False
                await self.waiter.reset_timestamp()
                while not message.startswith('[PLAYER_READY]'):
                    if message.startswith(f'[OPPONENT_ONLINE]') or message.startswith('[OPPONENT_RECONNECTED]'):
                        await self.waiter.reset_timestamp()
                    if not await self.waiter.check_timestamp():
                        return False
                    message = await ws.recv()
                    if message.endswith('【MULLIGAN】'):
                        opponent_mulligan = True
                    self.logger.debug(f'Received: {message}')
                
                # Check for opponent mulligan
                if opponent_mulligan:
                    updated_game = ""
                    message = await ws.recv()
                    while message.startswith('[UPDATE_OPPONENT]') or message.startswith('[HEARTBEAT]'):
                        updated_game += message.replace('[UPDATE_OPPONENT]:', '')
                        await self.loaded_ping(ws)
                        message = await ws.recv()
                        self.logger.debug(f'Received: {message}')
                    await self.update_opponent_game(ws, json.loads(updated_game))
                await self.send_player_ready(ws)
                
                # Mulligan if you need
                if self.mulligan_strategy():
                    await self.mulligan(ws)
                    await self.play_shuffle_deck_sfx(ws)
                    await self.send_game_chat_message(ws, 'I mulligan my hand')
                else:
                    await self.send_game_chat_message(ws, 'I keep my hand')

                # Begin the game loop
                while True:
                    message = await ws.recv()
                    self.logger.debug(f'Received: {message}')
                    if message.startswith('[UPDATE_MEMORY]:'):
                        self.game['memory'] = int(message.replace('[UPDATE_MEMORY]:', ''))
                    if message.startswith('[PASS_TURN_SFX]'):
                        self.my_turn = True
                    if self.my_turn and opponent_ready:
                        await self.turn(ws)
                    if not await self.waiter.check_for_action(ws, message):
                        return False
                        
            except RuntimeError as e:
                await self.send_game_chat_message(ws, 'An error occurred, I am leaving the game and returning to Lobby. Please contact Project Drasil support team and report the issue.')
                raise e

    @abstractmethod
    def mulligan_strategy(self):
        pass

    @abstractmethod
    def collision_strategy(self):
        pass

    @abstractmethod
    def when_cards_are_trashed_from_deck(self):
        pass

