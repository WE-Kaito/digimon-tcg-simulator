import json
import time
import asyncio
import requests

from decouple import config
import websockets

username = config('BOT_USERNAME')
password = config('BOT_PASSWORD')

def login(s, headers, username, password):
    login = s.get('http://localhost:8080/api/user/me', headers=headers, auth=(username, password))
    return login

def register(s, headers, username, password):
    data={'username': username, 'password': password}
    register = s.post('http://localhost:8080/api/user/register', headers=headers, data=json.dumps(data))
    return register

s = requests.Session()
cookies = s.get('http://localhost:8080/login').cookies.get_dict()
headers = {
    'Content-Type': 'application/json',
    'Cookie': f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}",
    'Host': 'localhost:8080',
    'Referer': 'http://localhost:8080/login',
    'X-Xsrf-Token': cookies['XSRF-TOKEN']
}
login = login(s, headers, username, password)
if login.status_code == 401:
    print('Login failed, registering the bot')
    register = register(s, headers, username, password)
    if register.status_code == 200:
        print(f'Successfully registered bot {username}')
else:
    print('Succesfully logged in!')
