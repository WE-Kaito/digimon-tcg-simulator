import styled from "@emotion/styled";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {Dispatch, SetStateAction} from "react";

type AddDeckButtonProps = {
    deckName: string;
    currentDeckLength: number;
    setCurrentDeckLength: Dispatch<SetStateAction<number>>;
}

export default function AddDeckButton(props: AddDeckButtonProps) {

    const {deckName, currentDeckLength, setCurrentDeckLength} = props;

    const decks = useGeneralStates((state) => state.decks);
    const saveDeck = useGeneralStates((state) => state.saveDeck);
    const isSaving = useGeneralStates((state) => state.isSaving);

    const handleSaveDeck = () => saveDeck(deckName, setCurrentDeckLength);

    return (
        <StyledButton disabled={(isSaving || decks.length >= 16)} onClick={handleSaveDeck}>
            <StyledSpanSaveDeck>
                {decks.length >= 16 ? "16/16 Decks" : `SAVE [${currentDeckLength}/16]`}
            </StyledSpanSaveDeck>
        </StyledButton>
    );
}

const StyledButton = styled.button<{ disabled: boolean }>`
  height: 40px;
  width: 95%;
  padding: 0;
  padding-top: 2px;
  margin-left: 5px;
  background: ${(props) => props.disabled ? "grey" : "mediumaquamarine"};
  color: black;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
  filter: drop-shadow(1px 2px 2px #346ab6);

  :hover {
    background: ${(props) => props.disabled ? "grey" : "aquamarine"};
  }

  &:active {
    background-color: ${(props) => props.disabled ? "grey" : "aquamarine"};
    border: none;
    filter: none;
    transform: translateY(1px);
    box-shadow: inset 0 0 3px #000000;
  }

  &:focus {
    outline: none;
  }
`;

export const StyledSpanSaveDeck = styled.span`
  font-family: 'League Spartan', sans-serif;
  font-weight: bold;
  font-size: 1.1em;
  margin: 0;
  letter-spacing: 2px;
  color: #0e1625;
`;
