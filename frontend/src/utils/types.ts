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

export type FetchCards = (name: string | null,
                          color: string | null,
                          type: string | null,
                          stage: string | null,
                          attribute: string | null,
                          digi_type: string | null,
                          dp: number | null,
                          play_cost: number | null,
                          evolution_cost: number | null,
                          level: number | null) => void;
