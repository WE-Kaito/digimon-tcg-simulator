import styled from "@emotion/styled";
import {ChangeEvent, useState} from "react";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {Radio} from "@mui/material";

export default function DeckImport({ deckName }:{ deckName: string}) {

    const [deckString, setDeckString] = useState<string>("");
    const importDeck = useGeneralStates((state) => state.importDeck);
    const exportDeck = useGeneralStates((state) => state.exportDeck);
    const [copyButton, setCopyButton] = useState<boolean>(false);
    const [invalidButton, setInvalidButton] = useState<boolean>(false);
    const fetchedCards = useGeneralStates((state) => state.fetchedCards);
    const [exportFormat, setExportFormat] = useState('pd');

    function handleImport() {
        if (exportFormat === 'text') {
            importDeck(deckString, exportFormat);
            return;
        }

        try {
            const deckToImport = JSON.parse(deckString);
            if (!deckToImport.every((cardNumber: string) => fetchedCards.some((card) => card.cardNumber === cardNumber))) {
                invalidImport();
            }
            if (Array.isArray(deckToImport) && deckToImport.every(item => typeof item === 'string')) {
                importDeck(deckToImport, exportFormat);
                setDeckString("");
            } else {
                invalidImport();
            }
        } catch (error) {
            invalidImport();
        }
    }

    function invalidImport() {
        setInvalidButton(true);
        const timer = setTimeout(() => {
            setInvalidButton(false);
        }, 3500);
        return () => clearTimeout(timer);
    }

    function handleExport() {
        const newDeckString = exportDeck(exportFormat, deckName);
        setDeckString(newDeckString);
        navigator.clipboard.writeText(newDeckString)
            .then(() => {
                setCopyButton(true);
                const timer = setTimeout(() => {
                    setCopyButton(false);
                }, 3500);
                return () => clearTimeout(timer);
            });
    }
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setExportFormat(event.target.value);

    return (
        <Container>
            <StyledFieldset>
                <TextArea value={deckString} placeholder={'PD:  ["BT1-001_P1", ...] (includes Alternate Arts)\nTTS: ["BT1-001", "BT1-001", "EX5-023", ...]\nText: digimoncard.dev text format'}
                          onChange={(e) => setDeckString(e.target.value)}/>
                {!invalidButton && <ImportButton onClick={handleImport}>IMPORT</ImportButton>}
                {invalidButton && <ImportButton style={{background: "crimson"}}>INVALID!</ImportButton>}

                <ExportContainer>
                    {!copyButton && <ExportButton onClick={handleExport}>EXPORT</ExportButton>}
                    {copyButton && <ExportButton style={{background: "#32e7b7"}}>COPIED!</ExportButton>}

                    <div style={{display: "flex", gap: 12}}>
                        <div style={{position: "relative"}}>
                            <span style={{ fontFamily: "League Spartan, sans-serif" }}>PD</span>
                            <Radio
                                checked={exportFormat === 'pd'}
                                onChange={handleChange}
                                value="pd"
                                name="radio-buttons"
                                size="small"
                                sx={{position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)" , width: 5}}
                            />
                        </div>

                        <div style={{position: "relative", marginLeft: 3}}>
                            <span style={{ fontFamily: "League Spartan, sans-serif" }}>TTS</span>
                            <Radio
                                checked={exportFormat === 'tts'}
                                onChange={handleChange}
                                value="tts"
                                name="radio-buttons"
                                size="small"
                                sx={{position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)" , width: 5}}
                            />
                        </div>

                            <div style={{position: "relative"}}>
                                <span style={{ fontFamily: "League Spartan, sans-serif" }}>Text</span>
                                <Radio
                                    checked={exportFormat === 'text'}
                                    onChange={handleChange}
                                    value="text"
                                    name="radio-buttons"
                                    size="small"
                                    sx={{position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)" , width: 5}}
                                />
                            </div>
                        </div>

                </ExportContainer>

            </StyledFieldset>
        </Container>
);
}

const Container = styled.div`
width: 97%;
margin: 0 1.5% 0 1.5%;
border-radius: 5px;
height: 150px;
background: rgba(100, 108, 255, 0.64);
display: flex;
justify-content: center;
align-items: center;
grid-area: import-export-area;
transform: translateY(2px);
`;

const StyledFieldset = styled.fieldset`
width: 90%;
height: 96px;
border-radius: 5px;
display: grid;
grid-template-columns: 4.2fr 1fr;
grid-template-rows: 1fr 3fr;
grid-template-areas: "input import"
                     "input export";

@container (max-width: 449px) {
    width: 92%;
}
`;

const TextArea = styled.textarea`
grid-area: input;
resize: none;
border-radius: 5px;
border: none;
transform: translate(-2px, 2px);
font-size: 0.95em;
line-height: 1.24em;

  &:focus {
    outline: 1px solid #646CFFA3;
    box-shadow: inset 0 0 2px ghostwhite;
  }
  
  &::-webkit-scrollbar {
    width: 3px;
    background-color: rgba(28, 58, 47, 0.98);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #C5C5C5;
    border-radius: 2px;
  }
`;

const ImportButton = styled.div`
grid-area: import;
margin-left: 10px;
margin-top: 2px;
height: 26px;
width: 95%;
padding: 0;
border-radius: 5px;
border: none;
background: #c74117;

display: flex;
justify-content: center;
align-items: center;

font-family: 'Naston', sans-serif;
text-align: center;
filter: drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.25));
letter-spacing: 0.2rem;

&:hover {
    cursor: pointer;
    background: #e34e1f;
    filter: drop-shadow(0.5px 1px 1px rgba(255, 255, 255, 0.25));
  }

  &:active {
    background-color: #1ae1e8 !important;
    transform: translateY(1px);
  }
`;

const ExportButton = styled(ImportButton)`
  grid-area: export;
  margin-top: 11px;
  background: #2e92f5;

  &:hover {
    background: #2fb1ea;
  }
`;

const ExportContainer = styled.div`
grid-area: export;
height: 100%;
width: 100%;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
  transform: translate(2px, -10px);
`;
