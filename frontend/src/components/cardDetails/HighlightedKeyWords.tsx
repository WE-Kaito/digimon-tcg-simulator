import styled from "@emotion/styled";
import {getDnaColor} from "../../utils/functions.ts";
import KeywordTooltip from "./KeywordTooltip.tsx";
import {JSX} from "react";
import {uid} from "uid";


export default function HighlightedKeyWords({text}: { text: string }): (JSX.Element | JSX.Element[])[] {

    const specialEffects = ["DigiXros -1", "DigiXros -2", "DigiXros -3", "DigiXros -4", "Digivolve", "Burst Digivolve", "DNA Digivolution"];
    if (text.startsWith("[DNA Digivolve]")) return text?.split(" ")?.map((word, index) => {
        if (index === 0) return <HighlightedSpecialEffect key={word + index}>DNA Digivolution</HighlightedSpecialEffect>;
        if (index === 1) return <></>;
        return <span key={word + index}>{getDnaColor(word)}</span>;
    });

    if (text.startsWith("＜Burst Digivolve:")) {
        const burstEffect = text.substring(17, text.length - 1);
        return [<HighlightedSpecialEffect key={"burst"}>Burst Digivolve</HighlightedSpecialEffect>, <HighlightedKeyWords key={"burstEffect"} text={burstEffect}/>]
    }

    const regex = /(\[([^\]]+)\]|＜([^＞]+)＞)/g;
    let match;
    let lastIndex = 0;
    const highlightedParts = [];

    while ((match = regex.exec(text)) !== null) {
        const prefix = text.slice(lastIndex, match.index);
        const bracketedWord = match[0];
        const id = uid();

        highlightedParts.push(prefix);

        if (bracketedWord[0] === '[') { // [keywords]

            if (timings.includes(match[2])) {
                highlightedParts.push(
                    <HighlightedSquare word={match[2]} key={id}>{match[2]}</HighlightedSquare>
                );
            } else if (match[2] === "Rule") {
                highlightedParts.push(
                    <HighlightedRule word={match[2]} key={id}>{match[2]}</HighlightedRule>
                );
            } else if (isTrait(match[2])) {
                highlightedParts.push(
                    <HighlightedTrait key={id}>{match[2]}</HighlightedTrait>
                );
            } else if (specialEffects.includes(match[2])) {
                highlightedParts.push(
                <HighlightedSpecialEffect key={id}>{match[2]}</HighlightedSpecialEffect>
                );
            } else {
                highlightedParts.push(
                    <HighlightedDigimonName key={id}>{match[2]}</HighlightedDigimonName>
                );
            }

        } else { // <keywords>
            highlightedParts.push(
                <KeywordTooltip keyword={match[1]} >
                    <HighlightedAngle key={id}>{match[3]}</HighlightedAngle>
                </KeywordTooltip>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        highlightedParts.push(text.slice(lastIndex));
    }

    // convert "\n" to <br />
    return highlightedParts.map(item => {
        if (typeof item === 'string') {
            return item.split('\n').map((line, index) => (
                <span key={item.length + uid()}>
                    {line}
                    {index !== item.split('\n').length - 1 && <br/>}
                </span>
            ));
        }
        return item;
    });
}

const HighlightedSquare = styled.span<{ word: string }>`
  color: ghostwhite;
  background: ${({word}) => ((word === "Hand") || word.includes("Per Turn") || word === "Breeding") ? "linear-gradient(to top, #b5485d, #5e173c)" : "linear-gradient(to top, #454dd9, #292E96FF)"};
  border-radius: 3px;
  padding: 4px 3px 2px 3px;
  margin-right: 2px;
`;

const HighlightedAngle = styled.span`
  color: ghostwhite;
  background: linear-gradient(to top, #ce570d, #883b09);
  border-radius: 25px;
  padding: 4px 5px 2px 5px;
  margin-right: 2px;
  cursor: help;
`;

const HighlightedDigimonName = styled.span`
  font-weight: 400;
  background: rgba(15, 0, 30, 0.3);
  padding: 3px 2px 0 2px;
  border: 1px solid #e7e7e7;
`;

const HighlightedTrait = styled(HighlightedDigimonName)`
  border: 1px solid #8C6B23FF;
  border-radius: 4px;
`;

const HighlightedRule = styled(HighlightedSquare)`
  color: black;
  background: ghostwhite;
  font-weight: 700;
`;

const HighlightedSpecialEffect = styled.span`
  font-weight: 400;
  background: linear-gradient(0deg, rgb(35, 140, 81) 0%, rgb(11, 105, 68) 100%);
  padding: 4px 3px 2px 3px;
  border-radius: 2px;
  color: ghostwhite;
  margin-right: 4px;
`;

const timings = ["On Play", "When Digivolving", "When Attacking", "End of Attack", "On Deletion", "Your Turn", "All Turns",
    "Opponent's Turn", "Start of Your Turn", "End of Your Turn", "Enf of Opponent's Turn", "Security", "Main",
    "Start of Your Main Phase", "Start of Opponent's Main Phase", "Once Per Turn", "Twice Per Turn", "Hand", "Breeding",
    "Counter", "End of All Turns"];

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
        case "AE Corp.":
        case "Abadin Electronics":
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
        case "Bird":
        case "Bird Dragon":
        case "Birdkin":
        case "Blue Flare":
        case "Bulb":
        case "Carnivorous Plant":
        case "Ceratopsian":
        case "Cherub":
        case "Commander Agent":
        case "Composite":
        case "Composition":
        case "CRT":
        case "Crustacean":
        case "Cyborg":
        case "D-Brigade":
        case "Dark Animal":
        case "Dark Dragon":
        case "Dark Knight":
        case "Data":
        case "Demon":
        case "Demon Lord":
        case "Deva":
        case "DigiPolice":
        case "Dinosaur":
        case "Dragon":
        case "Dragon Warrior":
        case "Dragonkin":
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
        case "General":
        case "Ghost":
        case "Giant Bird":
        case "God Beast":
        case "Grappling Agent":
        case "Ground Combat Agent":
        case "Holy Beast":
        case "Holy Bird":
        case "Holy Dragon":
        case "Holy Sword":
        case "Holy Warrior":
        case "Hunter":
        case "Ice-Snow":
        case "Icy":
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
        case "NO DATA":
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
        case "Royal Knight":
        case "Sea Animal":
        case "Sea Beast":
        case "Seraph":
        case "Seven Great Demon Lords":
        case "Shaman":
        case "SoC":
        case "Skeleton":
        case "Sky Dragon":
        case "Super Major":
        case "Throne":
        case "Tropical Fish":
        case "Twilight":
        case "Unanalyzable":
        case "Undead":
        case "Unidentified":
        case "Unique":
        case "Unknown":
        case "Vegetation":
        case "Virtue":
        case "Vortex Warriors":
        case "Warrior":
        case "Weapon":
        case "Wizard":
        case "X Antibody":
        case "Xros Heart": {
            return true;
        }
        default: {
            return false;
        }
    }
}
