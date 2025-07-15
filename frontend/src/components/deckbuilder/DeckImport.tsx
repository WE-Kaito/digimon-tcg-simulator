import styled from "@emotion/styled";
import { ChangeEvent, useState } from "react";
import UpIcon from "@mui/icons-material/KeyboardDoubleArrowUpSharp";
import DownIcon from "@mui/icons-material/KeyboardDoubleArrowDownSharp";
import { useMediaQuery } from "@mui/material";
import { useDeckStates } from "../../hooks/useDeckStates.ts";

export default function DeckImport({ deckName }: { deckName: string }) {
    const [deckString, setDeckString] = useState<string>("");
    const importDeck = useDeckStates((state) => state.importDeck);
    const exportDeck = useDeckStates((state) => state.exportDeck);
    const [copyButton, setCopyButton] = useState<boolean>(false);
    const [invalidButton, setInvalidButton] = useState<boolean>(false);
    const fetchedCards = useDeckStates((state) => state.fetchedCards);
    const [exportFormat, setExportFormat] = useState("pd");

    function handleImport() {
        if (exportFormat === "text") {
            importDeck(deckString, exportFormat);
            return;
        }

        try {
            const deckToImport = JSON.parse(deckString);
            if (
                !deckToImport.every((cardNumber: string) => fetchedCards.some((card) => card.cardNumber === cardNumber))
            ) {
                invalidImport();
            }
            if (Array.isArray(deckToImport) && deckToImport.every((item) => typeof item === "string")) {
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
        navigator.clipboard.writeText(newDeckString).then(() => {
            setCopyButton(true);
            setTimeout(() => {
                setCopyButton(false);
            }, 3500);
        });
    }
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setExportFormat(event.target.value);

    const isMobile = useMediaQuery("(max-width:499px)");

    return (
        <Container>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    gap: isMobile ? 12 : 28,
                    padding: "0 8px 0 8px",
                    width: "calc(100% - 16px)",
                }}
            >
                {!invalidButton && (
                    <ImportButton className={"button"} onClick={handleImport}>
                        {!isMobile && <UpIcon />}
                        <span>IMPORT</span>
                        {!isMobile && <UpIcon />}
                    </ImportButton>
                )}
                {invalidButton && <ImportButton style={{ background: "crimson" }}>INVALID!</ImportButton>}

                <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
                    <div style={{ display: "flex" }}>
                        <input
                            type="radio"
                            value="pd"
                            id="pd"
                            name="radio-buttons"
                            className="button"
                            checked={exportFormat === "pd"}
                            onChange={handleChange}
                        />
                        <StyledLabel
                            htmlFor="pd"
                            className="button"
                            checked={exportFormat === "pd"}
                            title={"Project Drasil:  ['BT1-001_P1', ...] (includes Alternate Arts)"}
                        >
                            PD
                        </StyledLabel>
                    </div>

                    <div style={{ display: "flex" }}>
                        <input
                            type="radio"
                            value="tts"
                            id="tts"
                            name="radio-buttons"
                            className="button"
                            checked={exportFormat === "tts"}
                            onChange={handleChange}
                        />
                        <StyledLabel
                            htmlFor="tts"
                            className="button"
                            checked={exportFormat === "tts"}
                            title={"Tabletop Simulator: ['BT1-001', 'BT1-001', 'EX5-023', ...]"}
                        >
                            TTS
                        </StyledLabel>
                    </div>

                    <div style={{ display: "flex" }}>
                        <input
                            type="radio"
                            value="text"
                            id="text"
                            name="radio-buttons"
                            className="button"
                            checked={exportFormat === "text"}
                            onChange={handleChange}
                        />
                        <StyledLabel
                            htmlFor="text"
                            className="button"
                            checked={exportFormat === "text"}
                            title={"Text: digimoncard.dev text format"}
                        >
                            Text
                        </StyledLabel>
                    </div>
                </div>

                {!copyButton && (
                    <ExportButton className={"button"} onClick={handleExport}>
                        {!isMobile && <DownIcon />}
                        <span>EXPORT</span>
                        {!isMobile && <DownIcon />}
                    </ExportButton>
                )}
                {copyButton && <ExportButton style={{ background: "#32e7b7" }}>COPIED!</ExportButton>}
            </div>

            <TextArea
                value={deckString}
                // placeholder={
                //     'PD:  ["BT1-001_P1", ...] (includes Alternate Arts)\nTTS: ["BT1-001", "BT1-001", "EX5-023", ...]\nText: digimoncard.dev text format'
                // }
                onChange={(e) => setDeckString(e.target.value)}
            />
        </Container>
    );
}

const Container = styled.div`
    width: 100%;
    padding-top: 8px;
    height: 112px;
    background: linear-gradient(
        to bottom,
        var(--blue) 0%,
        var(--blue) 1%,
        rgba(14, 37, 91, 0.5) 25%,
        rgba(11, 30, 73, 0.25) 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;

    box-shadow: inset 0 -5px 20px var(--blue);
`;

const TextArea = styled.textarea`
    resize: none;
    border-radius: 5px;
    border: none;
    font-size: 0.95em;
    width: calc(100% - 20px);
    height: calc(100% - 55px);
    background: rgba(9, 9, 9, 0.5);

    &:focus {
        outline: 1px solid #646cffa3;
        box-shadow: inset 0 0 2px ghostwhite;
    }

    &::-webkit-scrollbar {
        width: 3px;
        background-color: transparent;
        border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #c5c5c5;
        border-radius: 2px;
    }
`;

const ImportButton = styled.div`
    height: 30px;
    width: 100%;
    max-width: 180px;
    min-width: 130px;
    border-radius: 5px;
    border: none;
    background: rgba(199, 65, 23, 0.8);
    box-shadow:
        inset -2px 2px 5px rgba(255, 255, 255, 0.3125),
        /* light top-right */ inset 2px -2px 5px rgba(0, 0, 0, 0.55); /* dark bottom-left */
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "League Spartan", sans-serif;
    font-size: 20px;
    letter-spacing: 0.2rem;

    span {
        transform: translateY(2px);
    }

    &:hover {
        background: #e34e1f;
    }

    &:active {
        background-color: #1ae1e8 !important;
        box-shadow:
            inset 1px -1px 5px rgba(255, 255, 255, 0.3125),
            /* light top-right */ inset -1px 1px 5px rgba(0, 0, 0, 0.55); /* dark bottom-left */
    }

    @media (max-width: 499px) {
        min-width: 95px;
    }
`;

const ExportButton = styled(ImportButton)`
    background: rgba(46, 146, 245, 0.8);

    &:hover {
        background: #2fb1ea;
    }
`;

const StyledLabel = styled.label<{ checked?: boolean }>`
    font-family: "League Spartan", sans-serif;
    font-size: 18px;
    margin-left: 3px;
    transform: translateY(2px);
    color: ${({ checked }) => (checked ? "#00ffc3" : "ghostwhite")};
    text-decoration: ${({ checked }) => (checked ? "double underline" : "none")};
`;
