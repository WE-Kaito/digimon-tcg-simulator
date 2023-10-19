import json
from decouple import config
import time
import asyncio
import requests

from decouple import config
import websockets


host = 'localhost:8080'
username = config('BOT_USERNAME')
password = config('BOT_PASSWORD')

def login(s, host, headers, username, password):
    login = s.get(f'http://{host}/api/user/me', headers=headers, auth=(username, password))
    return login

def register(s, host, headers, username, password):
    data={'username': username, 'password': password}
    register = s.post(f'http://{host}/api/user/register', headers=headers, data=json.dumps(data))
    return register

def lobby(s, host, headers, username, password):
    lobby = s.get(f'http://{host}/lobby', headers, auth=(username, password))
    return lobby

def set_cookies(headers, cookies):
    cookies = cookies.get_dict()
    headers['Cookie'] = f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}"
    headers['X-Xsrf-Token'] = cookies['XSRF-TOKEN']
    return headers

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
if login_response.status_code == 401:
    print('Login failed, registering the bot')
    register = register(s, host,  headers, username, password)
    if register.status_code == 200:
        print(f'Successfully registered bot {username}')
    login_response = login(s, host, headers, username, password)
if login_response.status_code == 200:
    print('Succesfully logged in!')
    headers = set_cookies(headers, login_response.cookies)
else:
    print('Login failed')
    exit(1)

lobby_response = s.get(f'http://{host}/lobby', auth=(username, password))
if lobby_response.status_code == 200:
    print('Accessed lobby, saying Hi')
    asyncio.run(enter_lobby_message(host, headers, "Ciao everyone! I'm the first bot working here!"))
    
    asyncio.run(wait_in_lobby(host, headers))
else:
    print('Error when accessing lobby')
