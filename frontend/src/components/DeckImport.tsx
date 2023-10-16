import styled from "@emotion/styled";
import {useState} from "react";
import {useStore} from "../hooks/useStore.ts";
export default function DeckImport() {

    const [deckString, setDeckString] = useState<string>("");
    const importDeck = useStore((state) => state.importDeck);
    const exportDeck = useStore((state) => state.exportDeck);
    const [copyButton, setCopyButton] = useState<boolean>(false);
    const [invalidButton, setInvalidButton] = useState<boolean>(false);
    const fetchedCards = useStore((state) => state.fetchedCards);

    function handleImport() {
        try {
            const deckToImport = JSON.parse(deckString);
            if (!deckToImport.every((cardnumber: string) => fetchedCards.some((card) => card.cardnumber === cardnumber))) {
                invalidImport();
            }
            if (Array.isArray(deckToImport) && deckToImport.every(item => typeof item === 'string')) {
                console.log(deckToImport);
                importDeck(deckToImport);
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
        const newDeckString = exportDeck();
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

    return (
        <Container>
            <StyledFieldset>
                <TextArea value={deckString} placeholder={'["BT1-001", "BT1-001", "EX5-023", ...]'}
                          onChange={(e) => setDeckString(e.target.value)}/>
                {!invalidButton && <ImportButton onClick={handleImport}>IMPORT</ImportButton>}
                {invalidButton && <ImportButton style={{background:"crimson"}}>INVALID!</ImportButton>}
                {!copyButton && <ExportButton onClick={handleExport}>EXPORT</ExportButton>}
                {copyButton && <ExportButton style={{background:"#32e7b7"}}>COPIED!</ExportButton>}
            </StyledFieldset>
        </Container>
    );
}

const Container = styled.div`
  width: 97%;
  border-radius: 5px;
  height: 150px;
  background: rgba(100, 108, 255, 0.64);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledFieldset = styled.fieldset`
  width: 90%;
  height: 96px;
  border-radius: 5px;
  display: grid;
  grid-template-columns: 4.2fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: "input import"
                       "input export";
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
  margin-top: 6px;
  height: 32px;
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
