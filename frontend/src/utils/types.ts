export type CardType = {

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

}

export type CardTypeWithId = {

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
    id: string

}

export type FetchCards = (
    name: string | null,
    color: string | null,
    type: string | null,
    stage: string | null,
    attribute: string | null,
    digi_type: string | null,
    dp: number | null,
    play_cost: number | null,
    evolution_cost: number | null,
    level: number | null) => void;

export type DeckType = {
    id: string,
    name: string,
    cards: CardType[],
    deckStatus: string,
}

export type Player = {
    username: string,
    avatarName: string
}

export type GameDistribution = {
    player1Memory: number,
    player2Memory: number,

    player1Reveal: CardTypeWithId[],
    player2Reveal: CardTypeWithId[],

    player1Hand: CardTypeWithId[],
    player1DeckField: CardTypeWithId[],
    player1EggDeck: CardTypeWithId[],
    player1Trash: CardTypeWithId[],
    player1Security: CardTypeWithId[],
    player1Tamer: CardTypeWithId[],
    player1Delay: CardTypeWithId[],

    player1Digi1: CardTypeWithId[],
    player1Digi2: CardTypeWithId[],
    player1Digi3: CardTypeWithId[],
    player1Digi4: CardTypeWithId[],
    player1Digi5: CardTypeWithId[],
    player1BreedingArea: CardTypeWithId[],

    player2Hand: CardTypeWithId[],
    player2DeckField: CardTypeWithId[],
    player2EggDeck: CardTypeWithId[],
    player2Trash: CardTypeWithId[],
    player2Security: CardTypeWithId[],
    player2Tamer: CardTypeWithId[],
    player2Delay: CardTypeWithId[],

    player2Digi1: CardTypeWithId[],
    player2Digi2: CardTypeWithId[],
    player2Digi3: CardTypeWithId[],
    player2Digi4: CardTypeWithId[],
    player2Digi5: CardTypeWithId[],
    player2BreedingArea: CardTypeWithId[]
}

export type DraggedItem = {
    id: string,
    location: string,
    cardnumber: string,
    type: string
}
