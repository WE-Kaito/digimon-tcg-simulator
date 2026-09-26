import styled from "@emotion/styled";
import KeywordTooltip from "./KeywordTooltip.tsx";
import { JSX } from "react";
import { uid } from "uid";
import { useLocation } from "react-router-dom";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { tamerLocations, useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import {
    EFFECT_TIMINGS,
    EffectTimingGroup,
    parseEffectTimingGroups,
} from "../../utils/effectTiming.ts";
import type { CardTypeGame } from "../../utils/types.ts";

const EMPTY_SOURCE_CARDS: CardTypeGame[] = [];

export default function HighlightedKeyWords({
    text,
    effectSourceCardId,
}: {
    text: string;
    effectSourceCardId?: string;
}): JSX.Element | JSX.Element[] {
    const location = useLocation();
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const getCardLocationById = useGameBoardStates((state) => state.getCardLocationById);
    const effectTargeting = useGameUIStates((state) => state.effectTargeting);
    const startEffectTargeting = useGameUIStates((state) => state.startEffectTargeting);
    const cancelEffectTargeting = useGameUIStates((state) => state.cancelEffectTargeting);

    const sourceLocation = getCardLocationById(selectedCard?.id ?? "");
    const sourceCards = useGameBoardStates(
        (state) =>
            (sourceLocation
                ? (state[sourceLocation as keyof typeof state] as unknown)
                : EMPTY_SOURCE_CARDS) as CardTypeGame[]
    );
    const sourceIsTamer = tamerLocations.includes(sourceLocation);
    const sourceIsInHand = sourceLocation === "myHand";
    const sourceIsTopCard = sourceIsInHand
        ? sourceCards.some((card) => card.id === selectedCard?.id)
        : selectedCard?.id === (sourceIsTamer ? sourceCards.at(0)?.id : sourceCards.at(-1)?.id);
    const sourceIsFaceUp = Boolean(selectedCard && "isFaceUp" in selectedCard && selectedCard.isFaceUp);
    const sourceIsOnMyField =
        sourceIsInHand || sourceLocation === "myBreedingArea" || /^myDigi(?:[1-9]|1\d|2[01])$/.test(sourceLocation);
    const detailsMatchSelection = !hoverCard || hoverCard.id === selectedCard?.id;
    const canStartTargeting =
        (location.pathname === "/game" || location.pathname === "/test") &&
        Boolean(selectedCard) &&
        sourceIsFaceUp &&
        sourceIsTopCard &&
        sourceIsOnMyField &&
        detailsMatchSelection;

    const effectGroups = parseEffectTimingGroups(text);
    const timingGroupAt = (index: number) =>
        effectGroups.find((group) => group.timingTokens.some((token) => token.start === index && token.actionable));

    function handleTimingSelection(group: EffectTimingGroup, timing: string) {
        if (!canStartTargeting || !selectedCard) return;
        const effectSourceCard = effectSourceCardId
            ? sourceCards.find((card) => card.id === effectSourceCardId && card.isFaceUp)
            : sourceCards.find(
                  (card) =>
                      card.id !== selectedCard.id &&
                      card.isFaceUp &&
                      card.inheritedEffect === text
              );

        if (
            effectTargeting?.sourceCardId === selectedCard.id &&
            effectTargeting.timing === timing &&
            effectTargeting.effectText === group.effectText
        ) {
            cancelEffectTargeting();
            return;
        }

        startEffectTargeting({
            sourceCardId: selectedCard.id,
            effectSourceCardId: effectSourceCard?.id,
            sourceLocation,
            sourceName: selectedCard.name,
            timing,
            effectText: group.effectText,
        });
    }

    let highlightedText = text;

    if (text.startsWith("[DNA Digivolve]"))
        highlightedText = text
            ?.split(" ")
            ?.map((word) => getDnaColor(word))
            .join(" ");

    if (text.startsWith("＜Burst Digivolve:")) {
        const burstEffect = text.substring(17, text.length - 1);
        return [
            <HighlightedSpecialEffect key={"burstEffectKey"}>Burst Digivolve</HighlightedSpecialEffect>,
            <HighlightedKeyWords key={"burstEffect"} text={burstEffect} />,
        ];
    }

    const regex = /(\[([^\]]+)\]|＜([^＞]+)＞)/g;
    let match;
    let lastIndex = 0;
    const highlightedParts = [];

    while ((match = regex.exec(highlightedText)) !== null) {
        const prefix = highlightedText.slice(lastIndex, match.index);
        const bracketedWord = match[0];
        const id = uid();

        highlightedParts.push(prefix);

        if (bracketedWord[0] === "[") {
            // [keywords]

            if (timings.includes(match[2])) {
                const timingLabel = match[2];
                const effectGroup = timingGroupAt(match.index);
                const clickable = Boolean(effectGroup && canStartTargeting);
                const active =
                    effectTargeting?.sourceCardId === selectedCard?.id &&
                    effectTargeting?.timing === timingLabel &&
                    effectTargeting?.effectText === effectGroup?.effectText;
                const selectTiming = () => {
                    if (effectGroup) handleTimingSelection(effectGroup, timingLabel);
                };

                highlightedParts.push(
                    <HighlightedSquare
                        // workaround for BT19-100
                        word={
                            text.includes(
                                "When an opponent's Digimon attacks, if all of your Digimon and Tamers have the"
                            ) && highlightedParts.length === 1
                                ? "Per Turn"
                                : match[2]
                        }
                        key={id}
                        $clickable={clickable}
                        $active={active}
                        data-effect-timing={clickable ? timingLabel : undefined}
                        role={clickable ? "button" : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        title={clickable ? `Target a card with ${timingLabel}` : undefined}
                        onClick={
                            clickable
                                ? (event) => {
                                      event.stopPropagation();
                                      selectTiming();
                                  }
                                : undefined
                        }
                        onKeyDown={
                            clickable
                                ? (event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault();
                                          selectTiming();
                                      }
                                  }
                                : undefined
                        }
                    >
                        {match[2]}
                    </HighlightedSquare>
                );
            } else if (match[2] === "Rule") {
                highlightedParts.push(
                    <HighlightedRule word={match[2]} key={id}>
                        {match[2]}
                    </HighlightedRule>
                );
            } else if (isTrait(match[2])) {
                highlightedParts.push(<HighlightedTrait key={id}>{match[2]}</HighlightedTrait>);
            } else if (specialEffects.includes(match[2])) {
                highlightedParts.push(<HighlightedSpecialEffect key={id}>{match[2]}</HighlightedSpecialEffect>);
            } else if (evolutionEffects.includes(match[2]) || /^Assembly\s*[-+]?\d*$/.test(match[2])) {
                highlightedParts.push(<HighglightedEvolutionEffect key={id}>{match[2]}</HighglightedEvolutionEffect>);
            } else {
                highlightedParts.push(<HighlightedDigimonName key={id}>{match[2]}</HighlightedDigimonName>);
            }
        } else {
            // <keywords>
            highlightedParts.push(
                <KeywordTooltip key={id} keyword={match[1]}>
                    <HighlightedAngle>{match[3]}</HighlightedAngle>
                </KeywordTooltip>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < highlightedText.length) {
        highlightedParts.push(highlightedText.slice(lastIndex));
    }

    // convert "\n" to <br />
    return highlightedParts.flatMap((item) => {
        if (typeof item === "string") {
            const lines = item.split("\n");
            return lines.flatMap((line, index) => {
                const lineParts = [<span key={uid()}>{line}</span>];
                if (index !== lines.length - 1) lineParts.push(<br key={uid()} />);
                return lineParts;
            });
        }
        return [item];
    });
}

const HighlightedSquare = styled.span<{ word: string; $clickable?: boolean; $active?: boolean }>`
    color: ghostwhite;
    background: ${({ word }) =>
        word === "Hand" || word.includes("Per Turn") || word === "Breeding" || word === "Trash"
            ? "linear-gradient(to top, #5e173c, #b5485d)"
            : "linear-gradient(to top, #292E96FF, #454dd9)"};
    border-radius: 3px;
    padding: 4px 3px 2px 3px;
    margin-right: 2px;
    cursor: ${({ $clickable }) => ($clickable ? "crosshair" : "inherit")};
    outline: ${({ $active }) => ($active ? "2px solid #ff5252" : "none")};
    outline-offset: 2px;
    filter: ${({ $active }) => ($active ? "drop-shadow(0 0 4px #ff1744)" : "none")};

    &:hover {
        filter: ${({ $clickable, $active }) =>
            $clickable || $active ? "brightness(1.2) drop-shadow(0 0 4px #ff5252)" : "none"};
    }
`;

const HighlightedAngle = styled.span`
    color: ghostwhite;
    background: linear-gradient(to top, #883b09, #ce570d);
    border-radius: 25px;
    padding: 4px 5px 2px 5px;
    margin-right: 2px;
    cursor: help;
`;

const HighlightedDigimonName = styled.span`
    color: ghostwhite;
    font-weight: 400;
    background: rgba(15, 0, 30, 0.5);
    padding: 3px 2px 0 2px;
    border: 1px solid #e7e7e7;
`;

const HighlightedTrait = styled(HighlightedDigimonName)`
    border: 1px solid #8c6b23ff;
    border-radius: 4px;
`;

const HighlightedRule = styled(HighlightedSquare)`
    color: ghostwhite;
    background: linear-gradient(to top, #0c0c0c, #2a2a2a);
    font-weight: 500;
    letter-spacing: 1px;
    position: relative;
    margin-right: 8px;
    line-height: 0.5;
    &:after {
        content: " ";
        position: absolute;
        z-index: -1;
        right: -3px;
        top: 7px;
        width: 8px;
        height: 8px;
        transform: rotate(45deg);
        background: linear-gradient(320deg, #151515, #212121);
    }
`;

const HighlightedSpecialEffect = styled.span`
    font-weight: 400;
    background: linear-gradient(0deg, rgb(35, 140, 81) 0%, rgb(11, 105, 68) 100%);
    padding: 4px 3px 2px 3px;
    border-radius: 2px;
    color: ghostwhite;
    margin-right: 4px;
`;

const HighglightedEvolutionEffect = styled(HighlightedSpecialEffect)`
    background: linear-gradient(0deg, rgb(4, 76, 94) 0%, rgb(6, 164, 159) 100%);
`;

const specialEffects = [
    "DigiXros -1",
    "DigiXros -2",
    "DigiXros -3",
    "DigiXros -4",
    "Burst Digivolve",
    "DNA Digivolve",
    "Link",
];

const evolutionEffects = ["Digivolve", "App Fusion", "Arts Digivolve"];

const timings: readonly string[] = EFFECT_TIMINGS;

function isTrait(trait: string) {
    switch (trait) {
        case "Rookie":
        case "Champion":
        case "Ultimate":
        case "Mega":
        case "Hybrid":
        case "Armor Form":
        case "In-Training":
        case "Baby":
        case "D-Reaper":
        case "Free":
        case "Variable":
        case "Virus":
        case "Vaccine":
        case "9000":
        case "AA Defense Agent":
        case "Ability Synthesis Agent":
        case "Abnormal":
        case "ACCEL":
        case "AE Corp.":
        case "Abadin Electronics":
        case "ADVENTURE":
        case "Alien":
        case "Alien Humanoid":
        case "Amphibian":
        case "Ancient":
        case "Ancient Animal":
        case "Ancient Aquabeast":
        case "Ancient Bird":
        case "Ancient Birdkin":
        case "Ancient Crustacean":
        case "Ancient Dragon":
        case "Ancient Dragonkin":
        case "Ancient Fairy":
        case "Ancient Fish":
        case "Ancient Holy Warrior":
        case "Ancient Insectoid":
        case "Ancient Mineral":
        case "Ancient Mutant":
        case "Ancient Mythical Beast":
        case "Ancient Plant":
        case "Android":
        case "Angel":
        case "Animal":
        case "Ankylosaur":
        case "App Driver":
        case "Appmon":
        case "Aqua":
        case "Aquabeast":
        case "Aquatic":
        case "Archangel":
        case "Armor":
        case "Authority":
        case "Avian":
        case "Baby Dragon":
        case "Base Defense Agent":
        case "Beast":
        case "Beast Dragon":
        case "Beast Knight":
        case "Beastkin":
        case "BEATBREAK":
        case "Bird":
        case "Bird Dragon":
        case "Birdkin":
        case "Blue Flare":
        case "Bulb":
        case "Carnivorous Plant":
        case "Ceratopsian":
        case "Cherub":
        case "Chronicle":
        case "Commander Agent":
        case "Composite":
        case "Composition":
        case "CRT":
        case "Crustacean":
        case "CS":
        case "Cyborg":
        case "D-Brigade":
        case "Dark Animal":
        case "Dark Dragon":
        case "Dark Knight":
        case "Dark Masters":
        case "Data":
        case "DATA SQUAD":
        case "Demon":
        case "Demon Lord":
        case "Deva":
        case "Device":
        case "DigiPolice":
        case "Dinosaur":
        case "Dragon":
        case "Dragon Warrior":
        case "Dragonkin":
        case "DM":
        case "DS":
        case "Earth Dragon":
        case "Enhancement":
        case "Espionage Agent":
        case "Evil":
        case "Evil Dragon":
        case "Fairy":
        case "Fallen Angel":
        case "Fire":
        case "Fire Dragon":
        case "Flame":
        case "Food":
        case "Four Great Dragons":
        case "Four Sovereigns":
        case "Game":
        case "General":
        case "Ghost":
        case "Giant Bird":
        case "Glowing Dawn":
        case "God Beast":
        case "Grappling Agent":
        case "Ground Combat Agent":
        case "Hero":
        case "Holy Beast":
        case "Holy Bird":
        case "Holy Dragon":
        case "Holy Sword":
        case "Holy Warrior":
        case "Hudie":
        case "Hunter":
        case "Ice-Snow":
        case "Icy":
        case "Iliad":
        case "Insectoid":
        case "Intel Acquisition Agent":
        case "Invader":
        case "Larva":
        case "LCD":
        case "Legend-Arms":
        case "Lesser":
        case "LIBERATOR":
        case "Light Dragon":
        case "Light Fang":
        case "Machine":
        case "Machine Dragon":
        case "Magic Knight":
        case "Magic Warrior":
        case "Major":
        case "Mammal":
        case "Marine Man":
        case "Mine":
        case "Mineral":
        case "Mini Angel":
        case "Mini Bird":
        case "Mini Dragon":
        case "Minor":
        case "Mollusk":
        case "Monk":
        case "Mothership Agent":
        case "Musical Instrument":
        case "Mutant":
        case "Mysterious Beast":
        case "Mysterious Bird":
        case "Mythical":
        case "Mythical Animal":
        case "Mythical Beast":
        case "Mythical Dragon":
        case "Night Claw":
        case "NSo":
        case "NSp":
        case "NO DATA":
        case "Olympos XII":
        case "Parasite":
        case "Perfect":
        case "Pixie":
        case "Plant":
        case "Plesiosaur":
        case "Puppet":
        case "Rare Animal":
        case "Reconnaissance Agent":
        case "Reptile":
        case "Reptile Man":
        case "Rock":
        case "Rock Dragon":
        case "Royal Base":
        case "Royal Knight":
        case "Sea Animal":
        case "Sea Beast":
        case "SEEKERS":
        case "Seraph":
        case "Seven Great Demon Lords":
        case "Shaman":
        case "SoC":
        case "Social":
        case "Sovereign":
        case "Skeleton":
        case "Sky Dragon":
        case "Super Major":
        case "Ten Warriors":
        case "Titan":
        case "Three Great Angels":
        case "Three Musketeers":
        case "Throne":
        case "Tool":
        case "Tropical Fish":
        case "TS":
        case "Twilight":
        case "Unanalyzable":
        case "Undead":
        case "Unidentified":
        case "Unique":
        case "Unknown":
        case "Vegetation":
        case "Ver.1":
        case "Ver.2":
        case "Ver.3":
        case "Ver.4":
        case "Ver.5":
        case "Virtue":
        case "Vortex Warriors":
        case "Warrior":
        case "Weapon":
        case "Wicked God":
        case "Witchelny":
        case "WG":
        case "Wizard":
        case "X Antibody":
        case "Xros Heart":
        case "Zaxon": {
            return true;
        }
        default: {
            return false;
        }
    }
}

function getDnaColor(word: string): string {
    switch (word) {
        case "red":
            return "🔴";
        case "yellow":
            return "🟡";
        case "green":
            return "🟢";
        case "blue":
            return "🔵";
        case "purple":
            return "🟣";
        case "black":
            return "⚫";
        case "white":
            return "⚪";
        case "all":
            return "🌈";
        default:
            return word;
    }
}
