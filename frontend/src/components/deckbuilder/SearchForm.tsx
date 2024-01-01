import styled from '@emotion/styled';
import {useState} from "react";
import {useStore} from "../../hooks/useStore.ts";
import {Checkbox, FormControlLabel} from "@mui/material";
import {pink} from "@mui/material/colors";

function ColorOptions() {
    return (
        <>
            <option value="">🌈</option>
            <option value="Red">🟥</option>
            <option value="Yellow">🟨</option>
            <option value="Green">🟩</option>
            <option value="Blue">🟦</option>
            <option value="Purple">🟪</option>
            <option value="Black">⬛</option>
            <option value="White">⬜</option>
        </>
    )
}

export default function SearchForm() {

    const filterCards = useStore((state) => state.filterCards);

    const [cardname, setCardname] = useState<string | null>(null);
    const [color, setColor] = useState<string | null>(null);
    const [color2, setColor2] = useState<string | null>(null);
    const [color3, setColor3] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [playcost, setPlaycost] = useState<number | null>(null);
    const [dp, setDp] = useState<number | null>(null);
    const [digivolutioncost, setDigivolutioncost] = useState<number | null>(null);
    const [level, setLevel] = useState<number | null>(null);
    const [stage, setStage] = useState<string | null>(null);
    const [digitype, setDigitype] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [cardnumber, setCardnumber] = useState<string | null>(null);
    const [illustrator, setIllustrator] = useState<string | null>(null);
    const [effect, setEffect] = useState<string | null>(null);
    const [hasAce, setHasAce] = useState<boolean>(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        filterCards(cardname, type, color, color2, color3, attribute, cardnumber, stage, digitype, dp, playcost, level, illustrator, effect, hasAce);
    }

    function handleClear() {
        setCardname(null);
        setColor(null);
        setColor2(null);
        setColor3(null);
        setType(null);
        setPlaycost(null);
        setDp(null);
        setDigivolutioncost(null);
        setLevel(null);
        setStage(null);
        setDigitype(null);
        setAttribute(null);
        setCardnumber(null);
        setIllustrator(null);
        setEffect(null);
        setHasAce(false);
        filterCards(null, null, null, null, null, null, null, null, null, null, null, null, null, null, false);
    }

    return (
        <StyledForm onSubmit={handleSubmit}>

            <CardNumberInput placeholder={"Card Number"} value={cardnumber ?? undefined} onChange={(e) => {
                setCardnumber(e.target.value)
            }}/>

            <CardNameInput placeholder={"Card Name"} value={cardname ?? undefined} onChange={(e) => {
                setCardname(e.target.value)
            }}/>

            <ColorSelectionContainer>
                <ColorSelect value={color ?? ""} style={{gridArea: "one"}}
                             onChange={(e) => setColor(e.target.value !== "" ? e.target.value : null)}>
                    <ColorOptions/>
                </ColorSelect>
                <ColorSelect value={color2 ?? ""} style={{gridArea: "two"}}
                             onChange={(e) => setColor2(e.target.value !== "" ? e.target.value : null)}>
                    <ColorOptions/>
                </ColorSelect>
                <ColorSelect value={color3 ?? ""} style={{gridArea: "three"}}
                             onChange={(e) => setColor3(e.target.value !== "" ? e.target.value : null)}>
                    <ColorOptions/>
                </ColorSelect>
            </ColorSelectionContainer>

            <TypeSelect value={type ?? "Type"} onChange={(e) => {
                setType(e.target.value !== "Type" ? e.target.value : null)
            }}>
                <option>Type</option>
                <option>Digimon</option>
                <option>Digi-Egg</option>
                <option>Option</option>
                <option>Tamer</option>
            </TypeSelect>

            <PlayCostSelect value={playcost ?? ""} onChange={(e) => {
                setPlaycost(e.target.value === "-1" ? null : parseInt(e.target.value))
            }}>
                <option value={-1}>Cost</option>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
                <option value={11}>11</option>
                <option value={12}>12</option>
                <option value={13}>13</option>
                <option value={14}>14</option>
                <option value={15}>15</option>
                <option value={16}>16</option>
                <option value={20}>20</option>
            </PlayCostSelect>

            <DPInput min={-1000} max={17000} step={1000} type="number" placeholder={"DP"} value={dp ?? ""} onChange={(e) => {
                setDp(e.target.value === "-1000" ? null : parseInt(e.target.value))
            }}/>

            <DigivolutionCostSelect  value={digivolutioncost ?? -1} onChange={(e) => {
                setDigivolutioncost(e.target.value === "-1" ? null : parseInt(e.target.value))
            }}>
                <option value={-1}>Digiv. Cost</option>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
            </DigivolutionCostSelect>

            <LevelSelect value={level ?? -1} onChange={(e) => {
                setLevel(e.target.value === "-1" ? null : parseInt(e.target.value));
            }}>
                <option value={-1}>Lvl</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
            </LevelSelect>

            <StageSelect value={stage ?? "Stage"} onChange={(e) => {
                setStage(e.target.value !== "Stage" ? e.target.value : null)
            }}>
                <option>Stage</option>
                <option>In-Training</option>
                <option>Rookie</option>
                <option>Champion</option>
                <option>Ultimate</option>
                <option>Mega</option>
                <option>Armor Form</option>
                <option>Hybrid</option>
                <option>D-Reaper</option>
            </StageSelect>

            <DigitypeSelect value={digitype ?? "Digi-Type"} onChange={(e) => {
                setDigitype(e.target.value !== "Digi-Type" ? e.target.value : null)
            }}>
                <option>Digi-Type</option>
                <option>9000</option>
                <option>AA Defense Agent</option>
                <option>Ability Synthesis Agent</option>
                <option>Abnormal</option>
                <option>Alien</option>
                <option>Alien Humanoid</option>
                <option>Amphibian</option>
                <option>Ancient</option>
                <option>Ancient Animal</option>
                <option>Ancient Aquabeast</option>
                <option>Ancient Bird</option>
                <option>Ancient Birdkin</option>
                <option>Ancient Crustacean</option>
                <option>Ancient Dragon</option>
                <option>Ancient Dragonkin</option>
                <option>Ancient Fish</option>
                <option>Ancient Holy Warrior</option>
                <option>Ancient Insectoid</option>
                <option>Ancient Mineral</option>
                <option>Ancient Mutant</option>
                <option>Ancient Mythical Beast</option>
                <option>Ancient Plant</option>
                <option>Android</option>
                <option>Angel</option>
                <option>Animal</option>
                <option>Ankylosaur</option>
                <option>Aquabeast</option>
                <option>Aquatic</option>
                <option>Archangel</option>
                <option>Armor</option>
                <option>Authority</option>
                <option>Avian</option>
                <option>Baby Dragon</option>
                <option>Base Defense Agent</option>
                <option>Beast</option>
                <option>Beast Dragon</option>
                <option>Beast Knight</option>
                <option>Beastkin</option>
                <option>Bird</option>
                <option>Bird Dragon</option>
                <option>Birdkin</option>
                <option>Blue Flare</option>
                <option>Bulb</option>
                <option>Carnivorous Plant</option>
                <option>Ceratopsian</option>
                <option>Cherub</option>
                <option>Commander Agent</option>
                <option>Composite</option>
                <option>Composition</option>
                <option>CRT</option>
                <option>Crustacean</option>
                <option>Cyborg</option>
                <option>D-Brigade</option>
                <option>Dark Animal</option>
                <option>Dark Dragon</option>
                <option>Dark Knight</option>
                <option>Data</option>
                <option>Demon</option>
                <option>Demon Lord</option>
                <option>Deva</option>
                <option>DigiPolice</option>
                <option>Dinosaur</option>
                <option>Dragon</option>
                <option>Dragon Warrior</option>
                <option>Dragonkin</option>
                <option>Earth Dragon</option>
                <option>Enhancement</option>
                <option>Espionage Agent</option>
                <option>Evil</option>
                <option>Evil Dragon</option>
                <option>Fairy</option>
                <option>Fallen Angel</option>
                <option>Fire</option>
                <option>Fire Dragon</option>
                <option>Flame</option>
                <option>Food</option>
                <option>Four Great Dragons</option>
                <option>General</option>
                <option>Ghost</option>
                <option>Giant Bird</option>
                <option>God Beast</option>
                <option>Grappling Agent</option>
                <option>Ground Combat Agent</option>
                <option>Holy Beast</option>
                <option>Holy Bird</option>
                <option>Holy Dragon</option>
                <option>Holy Sword</option>
                <option>Holy Warrior</option>
                <option>Hunter</option>
                <option>Ice-Snow</option>
                <option>Icy</option>
                <option>Insectoid</option>
                <option>Intel Acquisition Agent</option>
                <option>Invader</option>
                <option>Larva</option>
                <option>LCD</option>
                <option>Legend-Arms</option>
                <option>Lesser</option>
                <option>Light Dragon</option>
                <option>Light Fang</option>
                <option>Machine</option>
                <option>Machine Dragon</option>
                <option>Magic Knight</option>
                <option>Magic Warrior</option>
                <option>Major</option>
                <option>Mammal</option>
                <option>Marine Man</option>
                <option>Mine</option>
                <option>Mineral</option>
                <option>Mini Angel</option>
                <option>Mini Bird</option>
                <option>Mini Dragon</option>
                <option>Minor</option>
                <option>Mollusk</option>
                <option>Monk</option>
                <option>Mothership Agent</option>
                <option>Musical Instrument</option>
                <option>Mutant</option>
                <option>Mysterious Beast</option>
                <option>Mysterious Bird</option>
                <option>Mythical</option>
                <option>Mythical Animal</option>
                <option>Mythical Beast</option>
                <option>Mythical Dragon</option>
                <option>Night Claw</option>
                <option>NO DATA</option>
                <option>Parasite</option>
                <option>Perfect</option>
                <option>Pixie</option>
                <option>Plesiosaur</option>
                <option>Puppet</option>
                <option>Rare Animal</option>
                <option>Reconnaissance Agent</option>
                <option>Reptile</option>
                <option>Reptile Man</option>
                <option>Rock</option>
                <option>Rock Dragon</option>
                <option>Royal Knight</option>
                <option>Sea Animal</option>
                <option>Sea Beast</option>
                <option>Seraph</option>
                <option>Seven Great Demon Lords</option>
                <option>Shaman</option>
                <option>Skeleton</option>
                <option>Sky Dragon</option>
                <option>Sky Dragon</option>
                <option>Super Major</option>
                <option>Throne</option>
                <option>Tropical Fish</option>
                <option>Twilight</option>
                <option>Unanalyzable</option>
                <option>Undead</option>
                <option>Unidentified</option>
                <option>Unique</option>
                <option>Unknown</option>
                <option>Vegetation</option>
                <option>Virtue</option>
                <option>Warrior</option>
                <option>Weapon</option>
                <option>Wizard</option>
                <option>X Antibody</option>
                <option>X Program</option>
                <option>Xros Heart</option>
            </DigitypeSelect>

            <AttributeSelect value={attribute ?? "Attr."} onChange={(e) => {
                setAttribute(e.target.value !== "Attr." ? e.target.value : null);
            }}>
                <option>Attr.</option>
                <option>Free</option>
                <option>Variable</option>
                <option>Unknown</option>
                <option>Data</option>
                <option>Virus</option>
                <option>Vaccine</option>
            </AttributeSelect>

            <EffectInput placeholder={"Effect Text"} value={effect ?? undefined}
                         onChange={(e) => setEffect(e.target.value)}/>

            <IllustratorInput placeholder={"Illustrator"} value={illustrator ?? undefined}
                         onChange={(e) => setIllustrator(e.target.value)}/>

            <div style={{ gridArea: "ace", height: "100%", width: "100%", display: "flex", placeItems: "center", transform: "translate(25%, -1px)"}}>
            <FormControlLabel control={<Checkbox
                size={"small"}
                value={hasAce}
                onChange={(e) => setHasAce(e.target.checked)}
                sx={{
                    color: pink[800],
                    '&.Mui-checked': {
                        color: pink[600],
                    },
                    maxWidth: "7px",
                    maxHeight: "7px",
                    transform: "translateY(-1px)"
                }}
            />} label="ACE" componentsProps={{ typography: {fontFamily: "Sakana", lineHeight: 1, color: "silver"} }}/>
            </div>

            <SubmitButton>SEARCH</SubmitButton>
            <ClearButton type={"button"} onClick={handleClear}>CLEAR</ClearButton>

        </StyledForm>
    );
}

const StyledForm = styled.form`
  grid-area: searchform;
  background-color: rgba(102, 62, 71, 0.75);
  width: 96.5%;
  height: 97%;
  max-height: 125px;
  min-height: 95px;
  padding: 1.75%;
  border-radius: 5px;
  margin-top: 5px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-gap: 5px;
  grid-template-areas:
    "cardnumber cardnumber cardname cardname cardname cardname color color"
    "type type attribute attribute level dp playcost digivolutioncost"
    "stage stage digitype digitype digitype digitype illustrator illustrator"
    "effect effect effect effect ace submit submit clear";
  
  @media (max-height: 1080px) {
    height: 82%;
    transform: translateY(-1%);
  }
`;


const StyledInput = styled.input`
  height: 20px;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 1px solid #D32765;
  border-radius: 4px;
  background-color: #1a1a1a;
  
  font-family: 'Naston', sans-serif;
  text-align: center;

  &:focus {
    outline: none;
  }
  @container (max-width: 449px) {
    font-size: 0.7rem;
  }
`;

const CardNameInput = styled(StyledInput)`
  grid-area: cardname;
`;

const CardNumberInput = styled(StyledInput)`
  grid-area: cardnumber;
`;

const EffectInput = styled(StyledInput)`
  grid-area: effect;
`;

const IllustratorInput = styled(StyledInput)`
  grid-area: illustrator;
`;

const DPInput = styled(StyledInput)`
  grid-area: dp;
`;

const StyledSelect = styled.select`
  height: 16px;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 1px solid #D32765;
  border-radius: 4px;
  background-color: #1a1a1a;
  font-family: 'Naston', sans-serif;
  box-shadow: inset 0 2px 5px rgba(211,39,101, 0.2);
  transition: box-shadow 0.3s ease;

  text-align: center;

  &:focus {
    outline: none;
  }

  @media (max-width: 767px) {
    font-size: 0.64rem;
  }

  @media (min-width: 768px) {
    height: 20px;
  }
`;

const ColorSelect = styled(StyledSelect)`
  grid-area: color;
`;

const PlayCostSelect = styled(StyledSelect)`
  grid-area: playcost;
`;

const DigivolutionCostSelect = styled(StyledSelect)`
  grid-area: digivolutioncost;
`;

const LevelSelect = styled(StyledSelect)`
  grid-area: level;
`;

const StageSelect = styled(StyledSelect)`
  grid-area: stage;
`;

const DigitypeSelect = styled(StyledSelect)`
  grid-area: digitype;
`;


const AttributeSelect = styled(StyledSelect)`
  grid-area: attribute;
`;

const TypeSelect = styled(StyledSelect)`
    grid-area: type;
`;

const SubmitButton = styled.button`

  grid-area: submit;
  margin-left: 1px;
  height: 17px;
  width: 100%;
  padding: 0;
  border-radius: 5px;
  border: none;
  background: #D32765;

  font-family: 'Naston', sans-serif;
  text-align: center;
  font-size: 0.7rem;
  filter: drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.25));
  letter-spacing: 0.2rem;

  &:hover {
    background: #e81a69;
    filter: drop-shadow(0.5px 1px 1px rgba(255, 255, 255, 0.25));
  }

  &:active {
    background-color: #1ae1e8 !important;
    border: none;
    filter: none;
    transform: translateY(1px);
  }
  
  &:focus {
    outline: none;
  }

  @media (min-width: 768px) {
    height: 20px;
  }

  @media (max-width: 700px) {
    font-size: 0.5rem;
  }
`;

const ClearButton = styled(SubmitButton)`
  grid-area: clear;
  background: #aa5af6;

  &:hover {
    background: #a34ee8;
    filter: drop-shadow(0.5px 1px 1px rgba(255, 255, 255, 0.325));
  }
`;

const ColorSelectionContainer = styled.div`
  grid-area: color;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "one two three";
  gap: 3px;
`;
