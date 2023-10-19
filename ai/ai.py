import json
from decouple import config
import time
import asyncio
import requests

from decouple import config
import websockets


host = config('HOST')
username = config('BOT_USERNAME')
password = config('BOT_PASSWORD')
deck_path = config('DECK_PATH')

def handle_response(response, expected_status_code, success_message, error_message ):
    if response.status_code == expected_status_code:
        print(success_message)
        return response
    print(error_message)
    return False

def login(s, host, headers, username, password):
    login = s.get(f'http://{host}/api/user/me', headers=headers, auth=(username, password))
    return handle_response(login, 200, 'Login succeded!', f'Login failed with status code {login.status_code}')

def register(s, host, headers, username, password):
    data={'username': username, 'password': password}
    register = s.post(f'http://{host}/api/user/register', headers=headers, data=json.dumps(data))
    return handle_response(register, 200, 'Registration succeded!', f'Registration failed with status code {register.status_code}, exiting...')

def lobby(s, host, headers, username, password):
    lobby = s.get(f'http://{host}/lobby', headers, auth=(username, password))
    return handle_response(lobby, 200, 'Accessed lobby!', f'Failed to access lobby with status code {lobby.status_code}, exiting...')


def set_cookies(headers, cookies):
    cookies = cookies.get_dict()
    headers['Cookie'] = f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}"
    headers['X-Xsrf-Token'] = cookies['XSRF-TOKEN']
    return headers

def import_deck(s, host, headers, deck_path, username, password):
    deck = json.load(open(deck_path))
    import_deck = s.post(f'http://{host}/api/profile/decks', auth=(username, password), headers=headers, data=json.dumps(deck))
    return handle_response(import_deck, 200, 'Imported deck successfully', f'Failed importing deck with status code {import_deck.status_code}, exiting...')

def set_active_deck(s, host, headers, deck_path, username, password):
    deck = json.load(open(deck_path))
    decks = s.get(f'http://{host}/api/profile/decks', auth=(username, password), headers=headers)
    response = handle_response(decks, 200, 'Successfully retrieved decks', f'Could not retrieve decks. Status code: {decks.status_code}')
    if not response:
        exit(1)
    decks = decks.json()
    for d in decks:
        if d['name'] == deck['name']:
            deck_id = d['id']

    active_deck = s.put(f'http://{host}/api/user/active-deck/{deck_id}', auth=(username, password), headers=headers, data=json.dumps(deck))
    return handle_response(active_deck, 200, 'Deck set succesfully to active', f'Failed to set deck as active with status code {active_deck.status_code}, exiting...')


async def enter_lobby_message(host, headers, message):
    async with websockets.connect(f'ws://{host}/api/ws/chat', extra_headers=[('Cookie', headers['Cookie'])]) as ws:
        await ws.send(message)
        await ws.recv()

async def wait_in_lobby(host, headers):
    async with websockets.connect(f'ws://{host}/api/ws/chat', extra_headers=[('Cookie', headers['Cookie'])]) as ws:
        while 1:
            await ws.send("/heartbeat/")
            message = await ws.recv()
            print(f"Received: {message}")
            if(message.startswith('[INVITATION]:')):
                challenger = message.removeprefix('[INVITATION]:')
                print(f'Challenger: {challenger}')
                await ws.send(f'/acceptInvite:{challenger}')
                message = await ws.recv()
            time.sleep(1)


def main():
    s = requests.Session()
    cookies = s.get(f'http://{host}/login').cookies.get_dict()
    headers = {
        'Content-Type': 'application/json',
        'Cookie': f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}",
        'Host': host,
        'Referer': f'http://{host}/login',
        'X-Xsrf-Token': cookies['XSRF-TOKEN']
    }
    login_response = login(s, host, headers, username, password)
    if not login_response:
        print('Login failed, registering the bot')
        register_response = register(s, host,  headers, username, password)
        if not register_response:
            exit(1)
        login_response = login(s, host, headers, username, password)
    if login_response:
        headers = set_cookies(headers, login_response.cookies)
    else:
        exit(1)

    ## Import Deck
    import_deck_response = import_deck(s, host, headers, deck_path, username, password)
    if not import_deck_response:
        exit(1)

    ## Set deck as active
    set_active_deck_response = set_active_deck(s, host, headers, deck_path, username, password)
    if not set_active_deck_response:
        exit(1)

    ## Access Lobby and become available for a match
    lobby_response = s.get(f'http://{host}/lobby', auth=(username, password))
    if lobby_response.status_code == 200:
        print('Accessed lobby, saying Hi')
        asyncio.run(enter_lobby_message(host, headers, "Ciao everyone! I'm the first bot working here!"))
        asyncio.run(wait_in_lobby(host, headers))
    else:
        print('Error when accessing lobby')

if __name__ == "__main__":
    main()