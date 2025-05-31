import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { Checkbox, FormControlLabel } from "@mui/material";

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
    );
}

export default function SearchForm() {
    const filterCards = useGeneralStates((state) => state.filterCards);

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
            filterCards(
                name,
                type,
                color,
                color2,
                color3,
                attribute,
                number,
                stage,
                digitype,
                dp,
                playcost,
                level,
                illustrator,
                effect,
                hasAce,
                altArtsEnabled
            );
        }, 1400); // prevent too many requests on text inputs
        return () => clearTimeout(timeout);
        // eslint-disable-next-line
    }, [name, number, effect, illustrator, dp]);

    useEffect(() => {
        filterCards(
            name,
            type,
            color,
            color2,
            color3,
            attribute,
            number,
            stage,
            digitype,
            dp,
            playcost,
            level,
            illustrator,
            effect,
            hasAce,
            altArtsEnabled
        );
        // eslint-disable-next-line
    }, [type, color, color2, color3, attribute, stage, digitype, playcost, level, hasAce, altArtsEnabled]);

    return (
        <Stack>
            <Row>
                <SetNumberInput
                    placeholder={"Set Number"}
                    value={number ?? undefined}
                    onChange={(e) => {
                        setNumber(e.target.value);
                    }}
                />

                <NameInput placeholder={"Name"} value={name ?? undefined} onChange={(e) => setName(e.target.value)} />

                <DPInput
                    min={-1000}
                    max={17000}
                    step={1000}
                    type="number"
                    placeholder={"DP"}
                    value={dp ?? ""}
                    onChange={(e) => {
                        setDp(e.target.value === "-1000" ? null : parseInt(e.target.value));
                    }}
                />
            </Row>

            <Row>
                <TypeSelect value={type ?? "Type"} onChange={(e) => setType(e.target.value ?? "")}>
                    <option value={""}>Type</option>
                    <option>Digimon</option>
                    <option>Digi-Egg</option>
                    <option>Option</option>
                    <option>Tamer</option>
                </TypeSelect>

                <AttributeSelect value={attribute ?? "Attr."} onChange={(e) => setAttribute(e.target.value ?? "")}>
                    <option value={""}>Attr.</option>
                    <option>Data</option>
                    <option>Free</option>
                    <option>Unknown</option>
                    <option>Variable</option>
                    <option>Vaccine</option>
                    <option>Virus</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Game</option>
                    <option style={{ background: "rgb(4,24,35)" }}>God</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Life</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Navi</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Social</option>
                    <option style={{ background: "rgb(4,24,35)" }}>System</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Tool</option>
                </AttributeSelect>

                <PlayCostSelect
                    value={playcost ?? ""}
                    onChange={(e) => {
                        setPlaycost(e.target.value === "-1" ? null : parseInt(e.target.value));
                    }}
                >
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

                <DigivolutionCostSelect
                    value={digivolutioncost ?? -1}
                    onChange={(e) => {
                        setDigivolutioncost(e.target.value === "-1" ? null : parseInt(e.target.value));
                    }}
                >
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

                <LevelSelect
                    value={level ?? -1}
                    onChange={(e) => {
                        setLevel(e.target.value === "-1" ? null : parseInt(e.target.value));
                    }}
                >
                    <option value={-1}>Lvl</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                </LevelSelect>
            </Row>

            <Row>
                <StageSelect value={stage ?? "Stage"} onChange={(e) => setStage(e.target.value ?? "")}>
                    <option value={""}>Stage</option>
                    <option>In-Training</option>
                    <option>Rookie</option>
                    <option>Champion</option>
                    <option>Ultimate</option>
                    <option>Mega</option>
                    <option>Armor Form</option>
                    <option>Hybrid</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Appmon</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Stnd./Appmon</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Sup./Appmon</option>
                    <option style={{ background: "rgb(4,24,35)" }}>Ult./Appmon</option>
                    <option style={{ background: "rgb(4,24,35)" }}>God/Appmon</option>
                    <option style={{ background: "rgb(54,54,54)" }}>D-Reaper</option>
                    <option style={{ background: "rgb(54,54,54)" }}>Eater</option>
                </StageSelect>

                <DigitypeInput
                    placeholder={"Digi-Type"}
                    value={digitype ?? []}
                    onChange={(e) => {
                        setDigitype(e.target.value);
                    }}
                />

                <IllustratorInput
                    placeholder={"Illustrator"}
                    value={illustrator ?? undefined}
                    onChange={(e) => setIllustrator(e.target.value)}
                />
            </Row>
            <Row>
                <EffectInput
                    placeholder={"Effect Text"}
                    value={effect ?? undefined}
                    onChange={(e) => setEffect(e.target.value)}
                />
            </Row>
            <Row style={{ marginTop: 5, justifyContent: "space-evenly" }}>
                <ColorSelectionContainer>
                    <ColorSelect
                        value={color ?? ""}
                        style={{ gridArea: "one", filter: `drop-shadow(0 0 3px ${getColor(color)})` }}
                        onChange={(e) => setColor(e.target.value ?? "")}
                    >
                        <ColorOptions />
                    </ColorSelect>
                    <ColorSelect
                        value={color2 ?? ""}
                        style={{ gridArea: "two", filter: `drop-shadow(0 0 3px ${getColor(color2)})` }}
                        onChange={(e) => setColor2(e.target.value ?? "")}
                    >
                        <ColorOptions />
                    </ColorSelect>
                    <ColorSelect
                        value={color3 ?? ""}
                        style={{ gridArea: "three", filter: `drop-shadow(0 0 3px ${getColor(color3)})` }}
                        onChange={(e) => setColor3(e.target.value ?? "")}
                    >
                        <ColorOptions />
                    </ColorSelect>
                </ColorSelectionContainer>

                <CheckBoxContainerAce>
                    <FormControlLabel
                        className={"button"}
                        control={
                            <Checkbox
                                size={"small"}
                                value={hasAce}
                                checked={hasAce}
                                onChange={(e) => setHasAce(e.target.checked)}
                                sx={{
                                    color: "var(--blue)",
                                    "&.Mui-checked": {
                                        color: "rgba(56, 111, 240, 1)",
                                    },
                                    maxWidth: "7px",
                                    maxHeight: "7px",
                                    transform: "translateY(-1px)",
                                }}
                            />
                        }
                        label="ACE"
                        componentsProps={{
                            typography: { fontFamily: "Sakana", lineHeight: 1, color: "silver", marginLeft: "6px" },
                        }}
                    />
                </CheckBoxContainerAce>

                <CheckBoxContainerAltArt>
                    <FormControlLabel
                        className={"button"}
                        control={
                            <Checkbox
                                size={"small"}
                                value={altArtsEnabled}
                                checked={altArtsEnabled}
                                onChange={(e) => setAltArtsEnabled(e.target.checked)}
                                sx={{
                                    color: "var(--blue)",
                                    "&.Mui-checked": {
                                        color: "rgba(56, 111, 240, 1)",
                                    },
                                    maxWidth: "7px",
                                    maxHeight: "7px",
                                    transform: "translateY(-2px)",
                                }}
                            />
                        }
                        label="Alt. Arts"
                        componentsProps={{
                            typography: {
                                fontFamily: "League Spartan",
                                fontWeight: "bold",
                                lineHeight: 1,
                                color: "lightgrey",
                                marginLeft: "6px",
                            },
                        }}
                    />
                </CheckBoxContainerAltArt>
                <Button type={"button"} onClick={handleClear}>
                    CLEAR
                </Button>
            </Row>
        </Stack>
    );
}

const Stack = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
`;

const Row = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const StyledInput = styled.input`
    height: 25px;
    flex: 1;
    margin: 0;
    padding: 0;
    border: 1px solid var(--blue);
    background-color: #1a1a1a;

    font-family: "Naston", sans-serif;
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
    max-width: 10.8125ch;
`;

const EffectInput = styled(StyledInput)`
    grid-area: effect;
`;

const IllustratorInput = styled(StyledInput)`
    grid-area: illustrator;
`;

const DPInput = styled(StyledInput)`
    max-width: 10.8125ch;
`;

const StyledSelect = styled.select`
    height: 27px !important;
    flex: 1;
    margin: 0;
    padding: 0;
    border: 1px solid var(--blue);
    background-color: #1a1a1a;
    font-family: "Naston", sans-serif;
    box-shadow: inset 0 2px 5px rgba(7, 70, 121, 0.2);
    transition: box-shadow 0.3s ease;

    text-align: center;

    &:focus {
        outline: none;
    }

    @media (max-width: 499px) {
        font-size: 0.64rem;
    }

    @media (min-width: 499px) {
        height: 20px;
    }
`;

const ColorSelect = styled(StyledSelect)`
    grid-area: color;
    border: none;
    box-shadow: none;
    border-radius: 5px;
    background: rgba(26, 26, 26, 0.75);
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

const ColorSelectionContainer = styled.div`
    grid-area: color;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "one two three";
    gap: 12px;
`;

const CheckboxContainer = styled.div`
    height: 100%;
    width: 100px;
    display: flex;
    place-items: center;
    justify-content: center;
`;

const CheckBoxContainerAce = styled(CheckboxContainer)`
    width: 75px;
    padding-left: 25px;

    @media (max-width: 499px) {
        width: 56px;
        padding-left: 12px;
    }
`;

const CheckBoxContainerAltArt = styled(CheckboxContainer)`
    width: 100px;
    padding-left: 25px;

    @media (max-width: 499px) {
        width: 80px;
        padding-left: 6px;
    }
`;

const Button = styled.button`
    grid-area: clear;

    margin-left: 1px;
    height: 25px;
    padding: 4px 6px 2px 6px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    outline: 1px solid #242424;
    border: 2px solid transparent;
    backdrop-filter: blur(1);

    font-family: "League Spartan", sans-serif;
    letter-spacing: 2px;

    border-image: linear-gradient(to bottom right, rgba(255, 255, 255, 0.7) 0%, rgba(157, 157, 157, 0.7) 100%) 1;

    background: var(--blue-button-bg);
    color: ghostwhite;

    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(9, 8, 8, 0.3);

    &:hover {
        color: ghostwhite;
        background: var(--blue-button-bg-hover);
    }

    &:active {
        background: var(--blue-button-bg-active);
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.6),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    &:disabled {
        background: #27292d;
        pointer-events: none;
    }
`;

function getColor(color: string): string {
    switch (color) {
        case "Red":
            return "#b02626";
        case "Yellow":
            return "#cbbc2f";
        case "Green":
            return "#0c8a3e";
        case "Blue":
            return "#017fc2";
        case "Purple":
            return "#7f2dbd";
        case "Black":
            return "#212121";
        case "White":
            return "#DBDBDB";
        default:
            return "transparent";
    }
}
