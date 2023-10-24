from decouple import config

from RedHybridBot import RedHybridBot

def main():
    
    bot = RedHybridBot(config('BOT_USERNAME'))
    login_response = bot.login()
    print(login_response)
    if not login_response:
        print('Login failed, registering the bot')
        register_response = bot.register()
        if not register_response:
            exit(1)
        login_response = bot.login()
        if not login_response:
            raise Exception ('Login failed after registration!')

    ## Import Deck
    import_deck_response = bot.import_deck()
    if not import_deck_response:
        exit(1)

    ## Set deck as active
    set_active_deck_response = bot.set_active_deck()
    if not set_active_deck_response:
        exit(1)

    ## Access Lobby and become available for a match
    bot.join_lobby()

if __name__ == "__main__":
    main()