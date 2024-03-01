from decouple import config

from BeelzemonXBot import BeelzemonXBot

def main():
    
    bot = BeelzemonXBot(config('BOT_USERNAME'))
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

    ## Set avatar
    set_avatar = bot.set_avatar(config('BOT_AVATAR'))
    if not set_avatar:
        exit(1)

    ## List Imported Decks
    imported_decks = bot.list_imported_decks()
    if not imported_decks:
        exit(1)
    imported_decks = imported_decks.json()

    ## Import Deck if not imported already
    import_deck_response = bot.import_deck(imported_decks)
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