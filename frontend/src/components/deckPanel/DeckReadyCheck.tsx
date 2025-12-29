import { Check as CheckIcon, Close as CrossIcon, PriorityHigh as ExclamationIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import { DeckType } from "../../utils/types.ts";
import { Tooltip } from "@mui/material";
import { DeckReadySate, useGeneralStates } from "../../hooks/useGeneralStates.ts";

const bannedCards = new Set(["BT5-109", "BT2-090", "EX5-065"]);

const limitedToOne = new Set([
    "BT1-090",
    "BT6-104",
    "BT13-110",
    "BT16-011",
    "EX3-057",
    "EX4-006",
    "EX1-021",
    "BT19-040",
    "EX2-070",
    "BT4-111",
    "BT17-069",
    "BT4-104",
    "P-029",
    "P-030",
    "BT11-033",
    "ST9-09",
    "EX4-030",
    "P-123",
    "P-130",
    "BT15-057",
    "BT9-098",
    "ST2-13",
    "BT14-084",
    "BT14-002",
    "BT15-102",
    "EX5-015",
    "EX5-018",
    "EX5-062",
    "BT13-012",
    "EX4-019",
    "BT2-069",
    "BT7-069",
    "BT3-054",
    "EX2-039",
    "P-008",
    "P-025",
    "BT11-064",
    "BT7-107",
    "BT9-099",
    "BT10-009",
    "BT7-038",
    "BT7-064",
    "BT2-047",
    "BT3-103",
    "BT6-100",
    "EX1-068",
    "BT7-072",
]);

function normalize(card: string) {
    return card.split("_")[0];
}

function countCards(cards: string[]) {
    return cards.reduce<Record<string, number>>((acc, rawCard) => {
        const card = normalize(rawCard);
        acc[card] = (acc[card] || 0) + 1;
        return acc;
    }, {});
}

function violatesRestrictions(deck: DeckType): boolean {
    const allCards = [...deck.mainDeckList, ...deck.eggDeckList];
    const count = countCards(allCards);

    for (const card of bannedCards) {
        if (count[card]) return true;
    }

    for (const card of limitedToOne) {
        if ((count[card] || 0) > 1) return true;
    }

    if (count["EX2-007"] && count["EX7-064"]) return true; // choice restriction

    return !!(count["BT20-037"] && (count["BT17-035"] || count["EX8-037"])); // choice restriction
}

export default function DeckReadyCheck({ deck, isLobbyView }: { deck: DeckType; isLobbyView: boolean }) {
    const setActiveDeckReadyState = useGeneralStates((state) => state.setActiveDeckReadyState);

    // 1. main deck size check
    if (deck.mainDeckList.length !== 50) {
        if (isLobbyView) setActiveDeckReadyState(DeckReadySate.NOT_FULL);
        return (
            <Tooltip title={`Main Deck only has ${deck.mainDeckList.length} / 50 cards. Must be full to play.`} arrow>
                <Chip style={{ backgroundColor: "#7a2d2d" }}>
                    <CrossIcon />
                </Chip>
            </Tooltip>
        );
    }

    // 2. restriction compliance check
    if (violatesRestrictions(deck)) {
        if (isLobbyView) setActiveDeckReadyState(DeckReadySate.VIOLATES_RESTRICTIONS);
        return (
            <Tooltip title={`Ready to play but violates current bans / restrictions.`} arrow>
                <Chip style={{ backgroundColor: "#9c8a2f" }}>
                    <ExclamationIcon />
                </Chip>
            </Tooltip>
        );
    }

    // 3. all good
    if (isLobbyView) setActiveDeckReadyState(DeckReadySate.OK);
    return (
        <Tooltip title={`Ready to play.`} arrow>
            <Chip style={{ backgroundColor: "#30603e" }}>
                <CheckIcon />
            </Chip>
        </Tooltip>
    );
}

const Chip = styled.div`
    grid-area: ready;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    height: 28px;
    width: 28px;
    font-weight: bolder;
    box-shadow: inset 0 0 3px 0 rgba(0, 0, 0, 1);
    top: 0;
    left: 0;
    transform: translate(12px, -12px);
`;
