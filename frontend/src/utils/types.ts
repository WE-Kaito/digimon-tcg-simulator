export type CardType = {

    name: string,
    type: string,
    color: string,
    image_url: string,
    cardnumber: string,
    stage?: string | null,
    attribute?: string | null,
    digi_type?: string | null,
    dp?: number | null,
    play_cost?: number | null,
    evolution_cost?: number | null,
    level?: number | null,
    maineffect?: string | null,
    soureeffect?: string | null,

}

export type CardTypeWithId = {

    name: string,
    type: string,
    color: string,
    image_url: string,
    cardnumber: string,
    stage?: string | null,
    attribute?: string | null,
    digi_type?: string | null,
    dp?: number | null,
    play_cost?: number | null,
    evolution_cost?: number | null,
    level?: number | null,
    maineffect?: string | null,
    soureeffect?: string | null,
    id: string

}

export type CardTypeGame = {
    name: string,
    type: string,
    color: string,
    image_url: string,
    cardnumber: string,
    stage: string | null,
    attribute: string | null,
    digi_type: string | null,
    dp: number | null,
    play_cost: number | null,
    evolution_cost: number | null,
    level: number | null,
    maineffect: string | null,
    soureeffect: string | null,
    id: string,
    isTilted: boolean
}

export type SearchCards = (
    name: string | null,
    color: string | null,
    type: string | null,
    stage: string | null,
    attribute: string | null,
    digi_type: string | null,
    dp: number | null,
    play_cost: number | null,
    evolution_cost: number | null,
    level: number | null,
    cardnumber: string | null) => void;

export type DeckType = {
    id: string,
    name: string,
    color: string,
    decklist: string[],
    deckStatus: string,
}

export type Player = {
    username: string,
    avatarName: string,
    sleeveName: string,
}

export type GameDistribution = {
    player1Memory?: number,
    player2Memory?: number,

    player1Reveal?: CardTypeGame[],
    player2Reveal?: CardTypeGame[],

    player1Hand: CardTypeGame[],
    player1DeckField: CardTypeGame[],
    player1EggDeck: CardTypeGame[],
    player1Trash?: CardTypeGame[],
    player1Security: CardTypeGame[],
    player1Tamer?: CardTypeGame[],
    player1Delay?: CardTypeGame[],

    player1Digi1?: CardTypeGame[],
    player1Digi2?: CardTypeGame[],
    player1Digi3?: CardTypeGame[],
    player1Digi4?: CardTypeGame[],
    player1Digi5?: CardTypeGame[],
    player1Digi6?: CardTypeGame[],
    player1Digi7?: CardTypeGame[],
    player1Digi8?: CardTypeGame[],
    player1Digi9?: CardTypeGame[],
    player1Digi10?: CardTypeGame[],
    player1BreedingArea?: CardTypeGame[],

    player2Hand: CardTypeGame[],
    player2DeckField: CardTypeGame[],
    player2EggDeck: CardTypeGame[],
    player2Trash?: CardTypeGame[],
    player2Security: CardTypeGame[],
    player2Tamer?: CardTypeGame[],
    player2Delay?: CardTypeGame[],

    player2Digi1?: CardTypeGame[],
    player2Digi2?: CardTypeGame[],
    player2Digi3?: CardTypeGame[],
    player2Digi4?: CardTypeGame[],
    player2Digi5?: CardTypeGame[],
    player2Digi6?: CardTypeGame[],
    player2Digi7?: CardTypeGame[],
    player2Digi8?: CardTypeGame[],
    player2Digi9?: CardTypeGame[],
    player2Digi10?: CardTypeGame[],
    player2BreedingArea?: CardTypeGame[]
}

export type OneSideDistribution = {
    playerReveal?: CardTypeGame[],

    playerHand: CardTypeGame[],
    playerDeckField: CardTypeGame[],
    playerEggDeck: CardTypeGame[],
    playerTrash?: CardTypeGame[],
    playerSecurity: CardTypeGame[],
    playerTamer?: CardTypeGame[],
    playerDelay?: CardTypeGame[],

    playerDigi1?: CardTypeGame[],
    playerDigi2?: CardTypeGame[],
    playerDigi3?: CardTypeGame[],
    playerDigi4?: CardTypeGame[],
    playerDigi5?: CardTypeGame[],
    playerDigi6?: CardTypeGame[],
    playerDigi7?: CardTypeGame[],
    playerDigi8?: CardTypeGame[],
    playerDigi9?: CardTypeGame[],
    playerDigi10?: CardTypeGame[],
    playerBreedingArea?: CardTypeGame[],
}

export type DraggedItem = {
    id: string,
    location: string,
    cardnumber: string,
    type: string,
    name: string,
}

export type DraggedStack = {
    index: number,
    location: string,
}

export type HandCardContextMenuItemProps = {
    index: number;
}

export type Picture = {
    name: string,
    imagePath: string,
}
