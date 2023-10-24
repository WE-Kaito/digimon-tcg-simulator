from RedHybridBot import RedHybridBot

BOT_REGISTER = {
    'Red Hybrid': RedHybridBot 
}

def get_bot(deck):
    return BOT_REGISTER[deck]()
    