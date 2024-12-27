import styled from '@emotion/styled';
import {useEffect, useState} from "react";
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

    const [name, setName] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [color2, setColor2] = useState<string>("");
    const [color3, setColor3] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [playcost, setPlaycost] = useState<number | null>(null);
    const [dp, setDp] = useState<number | null>(null);
    const [digivolutioncost, setDigivolutioncost] = useState<number | null>(null);
    const [level, setLevel] = useState<number | null>(null);
    const [stage, setStage] = useState<string>("");
    const [digitype, setDigitype] = useState<string>("");
    const [attribute, setAttribute] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [illustrator, setIllustrator] = useState<string>("");
    const [effect, setEffect] = useState<string>("");
    const [hasAce, setHasAce] = useState<boolean>(false);
    const [altArtsEnabled, setAltArtsEnabled] = useState<boolean>(true);

    function handleClear() {
        setName("");
        setColor("");
        setColor2("");
        setColor3("");
        setType("");
        setPlaycost(null);
        setDp(null);
        setDigivolutioncost(null);
        setLevel(null);
        setStage("");
        setDigitype("");
        setAttribute("");
        setNumber("");
        setIllustrator("");
        setEffect("");
        setHasAce(false);
        filterCards("", "", "", "", "", "", "", "", "", null, null, null, "", "", false, true);
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            filterCards(name, type, color, color2, color3, attribute, number, stage, digitype, dp, playcost, level, illustrator, effect, hasAce, altArtsEnabled);
        }, 1400); // prevent too many requests on text inputs
        return () => clearTimeout(timeout);
        // eslint-disable-next-line
    }, [name, number, effect, illustrator, dp]);

    useEffect(() => {
        filterCards(name, type, color, color2, color3, attribute, number, stage, digitype, dp, playcost, level, illustrator, effect, hasAce, altArtsEnabled);
        // eslint-disable-next-line
    }, [type, color, color2, color3, attribute, stage, digitype, playcost, level, hasAce, altArtsEnabled]);

    return (
        <StyledDiv>

            <SetNumberInput placeholder={"Set Number"} value={number ?? undefined} onChange={(e) => {
                setNumber(e.target.value)
            }}/>

            <NameInput placeholder={"Name"} value={name ?? undefined} onChange={(e) => setName(e.target.value)}/>

            <ColorSelectionContainer>
                <ColorSelect value={color ?? ""} style={{gridArea: "one"}}
                             onChange={(e) => setColor(e.target.value ?? "")}>
                    <ColorOptions/>
                </ColorSelect>
                <ColorSelect value={color2 ?? ""} style={{gridArea: "two"}}
                             onChange={(e) => setColor2(e.target.value ?? "")}>
                    <ColorOptions/>
                </ColorSelect>
                <ColorSelect value={color3 ?? ""} style={{gridArea: "three"}}
                             onChange={(e) => setColor3(e.target.value ?? "")}>
                    <ColorOptions/>
                </ColorSelect>
            </ColorSelectionContainer>

            <TypeSelect value={type ?? "Type"} onChange={(e) => setType(e.target.value ?? "")}>
                <option value={""}>Type</option>
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

            <StageSelect value={stage ?? "Stage"} onChange={(e) => setStage(e.target.value ?? "")}>
                <option value={""}>Stage</option>
                <option>In-Training</option>
                <option>Rookie</option>
                <option>Champion</option>
                <option>Ultimate</option>
                <option>Mega</option>
                <option>Armor Form</option>
                <option>Hybrid</option>
                <option>D-Reaper</option>
            </StageSelect>

            <DigitypeInput placeholder={"Digi-Type"} value={digitype ?? []} onChange={(e) => {setDigitype(e.target.value)}}/>

            <AttributeSelect value={attribute ?? "Attr."} onChange={(e) => setAttribute(e.target.value ?? "")}>
                <option value={""}>Attr.</option>
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

            <CheckBoxContainerAce>
            <FormControlLabel control={<Checkbox
                size={"small"}
                value={hasAce}
                checked={hasAce}
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
            />} label="ACE" componentsProps={{ typography: {fontFamily: "Sakana", lineHeight: 1, color: "silver", margin: 0.5} }}/>
            </CheckBoxContainerAce>

            <CheckBoxContainerAltArt>
            <FormControlLabel control={<Checkbox
                size={"small"}
                value={altArtsEnabled}
                checked={altArtsEnabled}
                onChange={(e) => setAltArtsEnabled(e.target.checked)}
                sx={{
                    color: pink[800],
                    '&.Mui-checked': {
                        color: pink[600],
                    },
                    maxWidth: "7px",
                    maxHeight: "7px",
                    transform: "translateY(-2px)"
                }}
            />} label="Alt. Arts" componentsProps={{ typography: {fontFamily: "League Spartan", fontWeight: "bold", lineHeight: 1, color: "lightgrey", margin: 0.5} }}/>
        </CheckBoxContainerAltArt>
            <ClearButton type={"button"} onClick={handleClear}>CLEAR</ClearButton>

        </StyledDiv>
    );
}

const StyledDiv = styled.div`
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
    "setnumber setnumber name name name name color color"
    "type type attribute attribute level dp playcost digivolutioncost"
    "stage stage digitype digitype digitype digitype illustrator illustrator"
    "effect effect effect effect effect ace alt clear";
  
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

const NameInput = styled(StyledInput)`
  grid-area: name;
`;

const SetNumberInput = styled(StyledInput)`
  grid-area: setnumber;
`;

const EffectInput = styled(StyledInput)`
  grid-area: effect;
  @media (max-width: 500px) {
    transform: translateY(-4px);
  }
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

const DigitypeInput = styled(StyledInput)`
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

const CheckboxContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  place-items: center;
  
  @media (max-width: 500px) {
  scale: 0.6;
  }
`;

const CheckBoxContainerAce = styled(CheckboxContainer)`
  grid-area: ace;
  transform: translate(33%, -1px);
  @media (max-width: 500px) {
    transform: translate(5%, -6px);
  }
`;

const CheckBoxContainerAltArt = styled(CheckboxContainer)`
  grid-area: alt;
  transform: translate(10%, -1px);
  @media (max-width: 500px) {
    transform: translate(-70%, -6px);
    .MuiTypography-root { position: absolute; width: 70px; transform: translateX(10px); }
  }
`;
