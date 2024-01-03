import asyncio
import json
import random
import time
from abc import ABC, abstractmethod
from pprint import pprint

import requests
import websockets
from decouple import config

from Digimon import Digimon

FIELD_UPDATE_MAP = {
    'myHand': 'Hand',
    'myDigi': 'BA ',
    'myDeckField': 'Deck',
    'myEggDeck': 'Egg-Deck',
    'myBreedingArea': 'Breeding',
    'myTamer': 'Tamers',
    'myDelay': 'Delay',
    'mySecurity': 'Security',
    'myReveal': 'Reveal'    
}

GAME_LOCATIONS_MAP = {
    'myHand': 'player2Hand',
    'myDeckField': 'player2DeckField',
    'myEggDeck': 'player2EggDeck',
    'myBreedingArea': 'Breeding',
    'myTamer': 'Tamers',
    'myDelay': 'Delay',
    'mySecurity': 'player2Security',
    'myReveal': 'player2Reveal'    
}

class Bot(ABC):

    host = config('HOST')
    password = config('BOT_PASSWORD')
    question = config('BOT_QUESTION')
    answer = config('BOT_ANSWER')
    deck_path = config('DECK_PATH')

    def __init__(self, username):
        self.s = requests.Session()
        cookies = self.s.get(f'http://{self.host}/login').cookies.get_dict()
        self.headers = {
            'Content-Type': 'application/json',
            'Cookie': f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}",
            'Host': self.host,
            'Referer': f'http://{self.host}/login',
            'X-Xsrf-Token': cookies['XSRF-TOKEN']
        }
        self.deck = json.load(open(self.deck_path))
        self.username = username
        self.game_ws = f'ws://{self.host}/api/ws/game'
        self.chat_ws = f'ws://{self.host}/api/ws/chat'
        self.my_turn = False
        self.first_turn = False

    def handle_response(self, response, expected_status_code, success_message, error_message):
        if response.status_code == expected_status_code:
            print(success_message)
            return response
        print(error_message)
        return False

    def login(self):
        login = self.s.get(f'http://{self.host}/api/user/me', headers=self.headers, auth=(self.username, self.password))
        cookies = self.s.cookies.get_dict()
        self.headers['Cookie'] = f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}"
        self.headers['X-Xsrf-Token'] = cookies['XSRF-TOKEN']
        return self.handle_response(login, 200, 'Login succeded!', f'Login failed with status code {login.status_code}')

    def register(self):
        data={'username': self.username, 'password': self.password, 'question': self.question, 'answer': self.answer}
        register = self.s.post(f'http://{self.host}/api/user/register', headers=self.headers, data=json.dumps(data))
        return self.handle_response(register, 200, 'Registration succeded!', f'Registration failed with status code {register.status_code}, exiting...')

    def lobby(self):
        lobby = self.s.get(f'http://{self.host}/lobby', self.headers, auth=(self.username, self.password))
        return self.handle_response(lobby, 200, 'Accessed lobby!', f'Failed to access lobby with status code {lobby.status_code}, exiting...')

    def import_deck(self):
        import_deck = self.s.post(f'http://{self.host}/api/profile/decks', auth=(self.username, self.password), headers=self.headers, data=json.dumps(self.deck))
        return self.handle_response(import_deck, 200, 'Imported deck successfully', f'Failed importing deck with status code {import_deck.status_code}, exiting...')

    def set_active_deck(self):
        decks = self.s.get(f'http://{self.host}/api/profile/decks', auth=(self.username, self.password), headers=self.headers)
        response = self.handle_response(decks, 200, 'Successfully retrieved decks', f'Could not retrieve decks. Status code: {decks.status_code}')
        if not response:
            exit(1)
        decks = decks.json()
        for d in decks:
            if d['name'] == self.deck['name']:
                deck_id = d['id']
        if deck_id is None:
            raise Exception('Deck not found!')
        active_deck = self.s.put(f'http://{self.host}/api/user/active-deck/{deck_id}', auth=(self.username, self.password), headers=self.headers)
        return self.handle_response(active_deck, 200, 'Deck set succesfully to active', f'Failed to set deck as active with status code {active_deck.status_code}, exiting...')

    def initialize_game(self, starting_game):
        self.game = starting_game
        self.game['player2Digi'] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
        self.game['player2BreedingArea'] = []
        self.game['player2Reveal'] = []
        self.game['memory'] = 0

    async def enter_lobby_message(self, message):
        async with websockets.connect(self.chat_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            await ws.send(message)
            await ws.recv()

    async def wait_in_lobby(self):
        async with websockets.connect(self.chat_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            while True:
                await ws.send("/heartbeat/")
                message = await ws.recv()
                print(f"Received: {message}")
                if(message.startswith('[INVITATION]:')):
                    challenger = message.removeprefix('[INVITATION]:')
                    print(f'Challenger: {challenger}')
                    await ws.send(f"/acceptInvite:{challenger}")
                    message = await ws.recv()
                    return challenger
                time.sleep(1)

    def join_lobby(self):
        ## Access Lobby and become available for a match
        lobby_response = self.s.get(f'http://{self.host}/lobby', auth=(self.username, self.password))
        if lobby_response.status_code == 200:
            print('Accessed lobby, saying Hi')
            asyncio.run(self.enter_lobby_message(f'Ciao everyone! I\'m {self.username}!'))
            self.opponent = asyncio.run(self.wait_in_lobby())
            asyncio.run(self.play())
        else:
            print('Error when accessing/waiting in lobby')

    async def send_game_chat_message(self, ws, message):
        await ws.send(f"{self.game_name}:/chatMessage:{self.opponent}:{message}")

    async def send_game_chat_update_memory(self, ws, message):
        await ws.send(f"{self.game_name}:/updateMemory:{self.opponent}:{message}")

    async def shuffle_deck(self, ws):
        self.game['player2DeckField'] += list(self.game['player2Hand'])
        random.shuffle(self.game['player2DeckField'])
        await self.play_shuffle_deck_sfx(ws)

    def get_card(self, location):
        index = int(location[-1])
        location = GAME_LOCATIONS_MAP[location[:-1]]
        return self.game[location][index]

    def get_empty_slot_in_battle_area(self):
        found = False
        for i in range(len(self.game['player2Digi'])):
            if len(self.game['player2Digi'][i]) == 0:
                return i
        if not found:
            raise RuntimeError('Field is full, cannot currently handle more than 15 digimon on battlefield!')

    async def field_update(self, ws, card_name, fr, to):
        if fr[-1].isdigit():
            fr = fr.replace(fr[:-1], FIELD_UPDATE_MAP[fr[:-1]])
        else:
            fr = FIELD_UPDATE_MAP[fr]
        if to[-1].isdigit():
            to = to.replace(to[:-1], FIELD_UPDATE_MAP[to[:-1]])
        else:
            to = FIELD_UPDATE_MAP[to]
        if fr == 'Deck' and to == 'Hand':
            await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【Draw Card】')
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card_name}】﹕{fr} ➟ {to}')

    async def move_card(self, ws, fr, to):
        card = self.get_card(fr)
        card_id = card['id']
        card_name = card['name']
        if fr.startswith('myHand'):
            fr = 'myHand'
        if to.startswith('myHand'):
            to = 'myHand'
        if fr.startswith('myReveal'):
            fr = 'myReveal'
        if fr.startswith('myEggDeck'):
            fr = 'myEggDeck'
        if to.startswith('myEggDeck'):
            to = 'myEggDeck'
        if fr.startswith('myBreedingArea'):
            fr = 'myBreedingArea'
        if to.startswith('myBreedingArea'):
            to = 'myBreedingArea'
        if fr.startswith('myDeckField'):
            fr = 'myDeckField'
        if to.startswith('myDeckField'):
            to = 'myDeckField'
        
        await ws.send(f"{self.game_name}:/moveCard:{self.opponent}:{card_id}:{fr}:{to}")
        await self.field_update(ws, card_name, fr, to)
        await self.play_place_card_sfx(ws)

    async def send_player_ready(self, ws):
        await ws.send(f"{self.game_name}:/playerReady:{self.opponent}")

    async def play_shuffle_deck_sfx(self, ws):
        await ws.send(f"{self.game_name}:/playShuffleDeckSfx:{self.opponent}")

    async def play_place_card_sfx(self, ws):
        await ws.send(f"{self.game_name}:/playPlaceCardSfx:{self.opponent}")

    async def play_button_click_sfx(self, ws):
        await ws.send(f"{self.game_name}:/playButtonClickSfx:{self.opponent}")

    async def hi(self, ws, message):
        if not message.startswith('[START_GAME]:'):
            raise Exception('Message does not contain [START_GAME] information to say hi!')
        players_info = json.loads(message.removeprefix('[START_GAME]:'))
        for player in players_info:
            if player['username'] != self.username:
                await self.send_game_chat_message(ws, f"Hi {player['username']}, good luck with the game!")
                break

    async def update_game(self, ws):
        update = {}
        update['playerHand'] = self.game['player2Hand']
        update['playerDeckField'] = self.game['player2DeckField']
        update['playerReveal'] = self.game['player2Reveal']
        for i in range(1, len(self.game['player2Digi']) + 1):
            update[f'playerDigi{i}'] = self.game['player2Digi'][i-1]
        update['playerBreedingArea'] = self.game['player2BreedingArea']
        update['playerEggDeck'] = self.game['player2EggDeck']
        update['playerSecurity'] = self.game['player2Security']
        update['playerTrash'] = []
        n = config('WS_CHUNK_SIZE', cast=int)
        g = json.dumps(update)
        chunks = [g[i:i+n] for i in range(0, len(g), n)]
        for chunk in chunks:
            await ws.send(f"{self.game_name}:/updateGame:{chunk}")

    async def mulligan(self, ws):
        await self.send_game_chat_message(ws, f"[FIELD_UPDATE]≔【MULLIGAN】")
        self.game['player2DeckField'].extend([self.game['player2Hand'].pop(0) for i in range(0,5)])
        random.shuffle(self.game['player2DeckField'])
        self.game['player2Hand']=[self.game['player2DeckField'].pop(0) for i in range(0,5)]
        await self.update_game(ws)

    async def hatch(self, ws):
        await self.move_card(ws, 'myEggDeck0', 'myBreedingArea0')
        self.game['player2BreedingArea'].append(self.game['player2EggDeck'].pop(0))

    def card_in_hand(self, unique_card_number, card_name):
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            if card['uniqueCardNumber']== unique_card_number and card['name'] == card_name:
                return i
        return None

    def digimon_of_level_in_hand(self, level):
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            if card['cardType'] == 'Digimon' and card['level'] == level:
                return i
        return False

    def digimon_of_level_in_battle_area(self, level):
        for i in range(len(self.game['player2Digi'])):
            card = self.game['player2Digi'][i][-1]
            if card['cardType'] == 'Digimon' and card['level'] == level:
                return i
        return False
    
    def no_digimon_in_battle_area(self):
        for digi in self.game['player2Digi']:
            if len(digi) > 0 and digi[-1]['cardType'] == 'Digimon':
                return False
        return True
    
    def attack_with_any_digimon(self):
        for i in range(len(self.game['player2Digi'])):
            card = self.game['player2Digi'][i][-1]
            if card['cardType'] == 'Digimon':
                self.attack_with_digimon(i)
        print('No Digimon to attack with')

    def attack_with_digimon(self):
        pass

    async def digivolve(self, ws, digimon_location, digivolution_card_location, digivolution_card_index, cost):
        await self.move_card(ws, f'my{digivolution_card_location}{digivolution_card_index}', f'my{digimon_location}')
        digivolution_card = self.game[f'player2{digivolution_card_location}'].pop(digivolution_card_index)
        self.game[f'player2{digimon_location}'].append(digivolution_card)
        await self.draw(ws, 1)

    async def play_card_from_hand(self, ws, card_index, cost):
        i = self.get_empty_slot_in_battle_area()
        await self.move_card(ws, f'myHand{card_index}', f'myDigi{i+1}')
        card = self.game['player2Hand'].pop(card_index)
        self.game['player2Digi'][i].append(card)
        self.game['memory'] -= cost
        await self.set_memory(ws, f"-{cost}")

    async def promote(self, ws):
        i = self.get_empty_slot_in_battle_area()
        self.move_card(ws, 'myBreedingArea', f'myDigi{i+1}')
        self.game[f'player2Digi{i}'].append(self.game['player2BreedingArea'])
        self.game['player2BreedingArea'] = []

    async def draw(self, ws, n_cards):
        for i in range(n_cards):
            await self.move_card(ws, 'myDeckField0', 'myHand0')
            self.game['player2Hand'].append(self.game['player2DeckField'].pop(0))

    async def reveal_top_from_deck(self, ws, n_cards):
        for i in range(n_cards):
            await self.move_card(ws, 'myDeckField0', 'myReveal')
            self.game['player2Reveal'].append(self.game['player2DeckField'].pop(0))

    async def put_card_to_bottom_of_deck(self, ws, card_location, card_index):
        card = self.game[f'player2{card_location}'].pop(card_index)
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【{card["name"]}】﹕ ➟ Deck Bottom')
        self.game['player2DeckField'].append(card)
        await self.update_game(ws)

    async def set_memory(self, ws, value):
        self.game['memory'] += int(value)
        await ws.send(f"{self.game_name}:/updateMemory:{self.opponent}:{value}")
        await self.send_game_chat_message(ws, f'[FIELD_UPDATE]≔【MEMORY】﹕{value}')

    async def play(self):
        self.game_name = f'{self.opponent}‗{self.username}'
        async with websockets.connect(self.game_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            await ws.send(f"/startGame:{self.game_name}")
            opponent_ready = False
            done_mulligan = False
            while True:
                await ws.send("/heartbeat/")
                message = await ws.recv()
                if message.startswith('[START_GAME]:'):
                    await self.hi(ws, message)
                if message.startswith('[DISTRIBUTE_CARDS]:'):
                    self.initialize_game(json.loads(message.removeprefix('[DISTRIBUTE_CARDS]:')))
                    if not done_mulligan:
                        if self.mulligan_strategy():
                            await self.mulligan(ws)
                            await self.send_game_chat_message(ws, "I mulligan my hand")
                        else:
                            await self.send_game_chat_message(ws, "I keep my hand")
                        await self.send_player_ready(ws)
                        done_mulligan = True
                if message.startswith('[STARTING_PLAYER]:'):
                    starting_player = message.removeprefix('[STARTING_PLAYER]:')
                    if starting_player == self.username:
                       self.first_turn = True
                       self.my_turn = True
                if message.startswith('[PLAYER_READY]'):
                    opponent_ready = True
                if message.startswith(f'[CHAT_MESSAGE]:{self.opponent}﹕Done'):
                    self.my_turn = True
                if self.my_turn and opponent_ready:
                    await self.turn(ws)

    @abstractmethod
    def mulligan_strategy(self):
        pass            
