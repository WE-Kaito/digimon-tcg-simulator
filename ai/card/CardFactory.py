import json

from decouple import config

from card.P_040_Purple_Memory_Boost import P_040_Purple_Memory_Boost
from card.BT2_068_Impmon import BT2_068_Impmon
from card.BT10_081_Baalmon import BT10_081_Baalmon
from card.BT12_073_Impmon_X_Antibody import BT12_073_Impmon_X_Antibody
from card.BT12_085_Beelzemon_X_Antibody import BT12_085_Beelzemon_X_Antibody
from card.BT12_110_Seventh_Full_Cluster import BT12_110_Seventh_Full_Cluster
from card.P_077_Wizardmon import P_077_Wizardmon
from card.ST14_01_Yaamon import ST14_01_Yaamon
from card.ST14_02_Impmon import ST14_02_Impmon
from card.ST14_06_Witchmon import ST14_06_Witchmon
from card.ST14_07_Baalmon import ST14_07_Baalmon
from card.ST14_08_Beelzemon import ST14_08_Beelzemon
from card.ST14_011_Ai_and_Mako import ST14_011_Ai_and_Mako
from card.ST14_012_Rivals_Barrage import ST14_012_Rivals_Barrage
from card.EX2_039_Impmon import EX2_039_Impmon
from card.EX2_044_Beelzemon import EX2_044_Beelzemon
from card.EX2_071_Death_Slinger import EX2_071_Death_Slinger




class CardFactory():

    def __init__(self, bot, **kwargs):
        self.cards =  {
            'BT2-068': BT2_068_Impmon,
            'BT10-081': BT10_081_Baalmon,
            'BT12-073': BT12_073_Impmon_X_Antibody,
            'BT12-085': BT12_085_Beelzemon_X_Antibody,
            'BT12-110': BT12_110_Seventh_Full_Cluster,
            'P-040': P_040_Purple_Memory_Boost,
            'P-077': P_077_Wizardmon,
            'ST14-01': ST14_01_Yaamon,
            'ST14-02': ST14_02_Impmon,
            'ST14-06': ST14_06_Witchmon,
            'ST14-07': ST14_07_Baalmon,
            'ST14-08': ST14_08_Beelzemon,
            'ST14-11': ST14_011_Ai_and_Mako,
            'ST14-12': ST14_012_Rivals_Barrage,
            'EX2-039': EX2_039_Impmon,
            'EX2-044': EX2_044_Beelzemon,
            'EX2-071': EX2_071_Death_Slinger
        }
        self.bot = bot
    
    def get_token_by_name(self, name, card_id):
        token_data = json.load(open(config('TOKENS_PATH')))
        token = token_data[name]
        token['id'] = card_id
        return token
    
    def get_card(self, unique_card_number, **kwargs):
        return self.cards[unique_card_number](self.bot, **kwargs)
