export type CardType = {
    uniqueCardNumber: string;
    name: string;
    imgUrl: string;
    cardType: string;
    color: string[];
    attribute?: string;
    cardNumber: string;
    digivolveConditions?: DigivolveCondition[];
    specialDigivolve?: string;
    stage?: string;
    digiType?: string[];
    dp?: number;
    playCost?: number;
    level?: number;
    mainEffect?: string;
    inheritedEffect?: string;
    aceEffect?: string;
    burstDigivolve?: string;
    digiXros?: string;
    dnaDigivolve?: string;
    securityEffect?: string;
    rule?: string;
    linkDP?: number;
    linkEffect?: string;
    linkRequirement?: string;
    restrictions: Restrictions;
    illustrator: string;
};

type DigivolveCondition = {
    color: string;
    cost: number;
    level: number;
};

export type CardTypeWithId = CardType & { id: string };

export type CardTypeGame = CardTypeWithId & { modifiers: CardModifiers; isTilted: boolean; inSecurityFaceUp?: boolean };

export type CardModifiers = {
    plusDp: number;
    plusSecurityAttacks: number;
    keywords: string[];
    colors: string[];
};

type Restrictions = {
    chinese: string;
    english: string;
    japanese: string;
    korean: string;
};

export type SearchCards = (
    name: string | null,
    cardType: string | null,
    color: string | null,
    color2: string | null,
    color3: string | null,
    attribute: string | null,
    cardNumber: string | null,
    stage: string | null,
    digiType: string | null,
    dp: number | null,
    playCost: number | null,
    level: number | null,
    illustrator: string | null,
    effect: string | null,
    ace: boolean,
    altArtsEnabled: boolean
) => void;

export type DeckType = {
    id: string;
    name: string;
    decklist: string[];
    deckImageCardUrl: string;
    isAllowed_en: boolean | undefined;
    isAllowed_jp: boolean | undefined;
    sleeveName: string;
};

export type Player = {
    username: string;
    avatarName: string;
    sleeveName: string;
};

export type GameDistribution = {
    player1Hand: CardTypeGame[];
    player1DeckField: CardTypeGame[];
    player1EggDeck: CardTypeGame[];
    player1Trash?: CardTypeGame[];
    player1Security: CardTypeGame[];

    player1Digi1?: CardTypeGame[];
    player1Digi2?: CardTypeGame[];
    player1Digi3?: CardTypeGame[];
    player1Digi4?: CardTypeGame[];
    player1Digi5?: CardTypeGame[];
    player1Digi6?: CardTypeGame[];
    player1Digi7?: CardTypeGame[];
    player1Digi8?: CardTypeGame[];
    player1Digi9?: CardTypeGame[];
    player1Digi10?: CardTypeGame[];
    player1Digi11?: CardTypeGame[];
    player1Digi12?: CardTypeGame[];
    player1Digi13?: CardTypeGame[];
    player1BreedingArea?: CardTypeGame[];

    player1Link1?: CardTypeGame[];
    player1Link2?: CardTypeGame[];
    player1Link3?: CardTypeGame[];
    player1Link4?: CardTypeGame[];
    player1Link5?: CardTypeGame[];
    player1Link6?: CardTypeGame[];
    player1Link7?: CardTypeGame[];
    player1Link8?: CardTypeGame[];

    player2Hand: CardTypeGame[];
    player2DeckField: CardTypeGame[];
    player2EggDeck: CardTypeGame[];
    player2Trash?: CardTypeGame[];
    player2Security: CardTypeGame[];

    player2Digi1?: CardTypeGame[];
    player2Digi2?: CardTypeGame[];
    player2Digi3?: CardTypeGame[];
    player2Digi4?: CardTypeGame[];
    player2Digi5?: CardTypeGame[];
    player2Digi6?: CardTypeGame[];
    player2Digi7?: CardTypeGame[];
    player2Digi8?: CardTypeGame[];
    player2Digi9?: CardTypeGame[];
    player2Digi10?: CardTypeGame[];
    player2Digi11?: CardTypeGame[];
    player2Digi12?: CardTypeGame[];
    player2Digi13?: CardTypeGame[];
    player2BreedingArea?: CardTypeGame[];

    player2Link1?: CardTypeGame[];
    player2Link2?: CardTypeGame[];
    player2Link3?: CardTypeGame[];
    player2Link4?: CardTypeGame[];
    player2Link5?: CardTypeGame[];
    player2Link6?: CardTypeGame[];
    player2Link7?: CardTypeGame[];
    player2Link8?: CardTypeGame[];
};

export type OneSideDistribution = {
    playerReveal?: CardTypeGame[];

    playerHand: CardTypeGame[];
    playerDeckField: CardTypeGame[];
    playerEggDeck: CardTypeGame[];
    playerTrash?: CardTypeGame[];
    playerSecurity: CardTypeGame[];

    playerDigi1?: CardTypeGame[];
    playerDigi2?: CardTypeGame[];
    playerDigi3?: CardTypeGame[];
    playerDigi4?: CardTypeGame[];
    playerDigi5?: CardTypeGame[];
    playerDigi6?: CardTypeGame[];
    playerDigi7?: CardTypeGame[];
    playerDigi8?: CardTypeGame[];
    playerDigi9?: CardTypeGame[];
    playerDigi10?: CardTypeGame[];
    playerDigi11?: CardTypeGame[];
    playerDigi12?: CardTypeGame[];
    playerDigi13?: CardTypeGame[];
    playerBreedingArea?: CardTypeGame[];

    playerLink1?: CardTypeGame[];
    playerLink2?: CardTypeGame[];
    playerLink3?: CardTypeGame[];
    playerLink4?: CardTypeGame[];
    playerLink5?: CardTypeGame[];
    playerLink6?: CardTypeGame[];
    playerLink7?: CardTypeGame[];
    playerLink8?: CardTypeGame[];

    playerMemory?: number;
    playerPhase?: Phase;
    isPlayerTurn?: boolean;
};

export type DraggedItem = {
    id: string;
    location: string;
    cardnumber: string;
    type: string;
    name: string;
};

export type DraggedStack = {
    location: string;
};

export type FieldCardContextMenuItemProps = {
    index: number;
    location: string;
    id: string;
    name: string;
};

export type Picture = {
    name: string;
    imagePath: string;
    artist: string;
};

export enum Phase {
    UNSUSPEND = "UNSUSPEND",
    DRAW = "DRAW",
    BREEDING = "BREEDING",
    MAIN = "MAIN",
}

export enum AttackPhase {
    WHEN_ATTACKING = "WHEN ATTACKING",
    COUNTER_BLOCK = "COUNTER ＋ BLOCK",
    RESOLVE_ATTACK = "RESOLVE ATTACK",
}

export enum BootStage {
    CLEAR = 0,
    SHOW_STARTING_PLAYER = 1,
    MULLIGAN = 2,
    MULLIGAN_DONE = 3,
    GAME_IN_PROGRESS = 4,
}

export type BoardState = {
    myMemory: number;
    myReveal: CardTypeGame[];

    myHand: CardTypeGame[];
    myDeckField: CardTypeGame[];
    myEggDeck: CardTypeGame[];
    myTrash: CardTypeGame[];
    mySecurity: CardTypeGame[];

    myDigi1: CardTypeGame[];
    myDigi2: CardTypeGame[];
    myDigi3: CardTypeGame[];
    myDigi4: CardTypeGame[];
    myDigi5: CardTypeGame[];
    myDigi6: CardTypeGame[];
    myDigi7: CardTypeGame[];
    myDigi8: CardTypeGame[];
    myDigi9: CardTypeGame[];
    myDigi10: CardTypeGame[];
    myDigi11: CardTypeGame[];
    myDigi12: CardTypeGame[];
    myDigi13: CardTypeGame[];
    myBreedingArea: CardTypeGame[];

    myLink1: CardTypeGame[];
    myLink2: CardTypeGame[];
    myLink3: CardTypeGame[];
    myLink4: CardTypeGame[];
    myLink5: CardTypeGame[];
    myLink6: CardTypeGame[];
    myLink7: CardTypeGame[];
    myLink8: CardTypeGame[];

    opponentMemory: number;
    opponentReveal: CardTypeGame[];

    opponentHand: CardTypeGame[];
    opponentDeckField: CardTypeGame[];
    opponentEggDeck: CardTypeGame[];
    opponentTrash: CardTypeGame[];
    opponentSecurity: CardTypeGame[];

    opponentDigi1: CardTypeGame[];
    opponentDigi2: CardTypeGame[];
    opponentDigi3: CardTypeGame[];
    opponentDigi4: CardTypeGame[];
    opponentDigi5: CardTypeGame[];
    opponentDigi6: CardTypeGame[];
    opponentDigi7: CardTypeGame[];
    opponentDigi8: CardTypeGame[];
    opponentDigi9: CardTypeGame[];
    opponentDigi10: CardTypeGame[];
    opponentDigi11: CardTypeGame[];
    opponentDigi12: CardTypeGame[];
    opponentDigi13: CardTypeGame[];
    opponentBreedingArea: CardTypeGame[];

    opponentLink1: CardTypeGame[];
    opponentLink2: CardTypeGame[];
    opponentLink3: CardTypeGame[];
    opponentLink4: CardTypeGame[];
    opponentLink5: CardTypeGame[];
    opponentLink6: CardTypeGame[];
    opponentLink7: CardTypeGame[];
    opponentLink8: CardTypeGame[];
};

export type SendToStackFunction = (
    topOrBottom: "Top" | "Bottom",
    cardId: string,
    cardLocation: string,
    to: string,
    sendFaceUp?: boolean
) => void;

export enum SIDE {
    MY = "my",
    OPPONENT = "opponent",
}
