import {StyledSpanSaveDeck} from "./AddDeckButton.tsx";
import styled from "@emotion/styled";
import {useNavigate} from "react-router-dom";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {useState} from "react";

export default function UpdateDeleteDeckButtons({deckName}: { deckName: string }) {

    const deleteDeck = useGeneralStates((state) => state.deleteDeck);
    const idOfDeckToEdit = useGeneralStates(state => state.idOfDeckToEdit);
    const updateDeck = useGeneralStates(state => state.updateDeck);
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    function getDeleteString() {
        if (!isDeleting) return "🗑️";
        else return mobileSize ? "🗑️?" : "DELETE PERMANENTLY";
    }

    const mobileSize = window.innerWidth < 500;

    return (
        <>
            <UpdateDeckButton isDeleting={isDeleting}
                              onClick={() => idOfDeckToEdit && updateDeck(idOfDeckToEdit, deckName)}>
                <StyledSpanSaveDeck>
                    SAVE {`${!mobileSize ? "CHANGES" : ""}`}
                </StyledSpanSaveDeck>
            </UpdateDeckButton>
            <DeleteDeckButton isDeleting={isDeleting} onClick={() => {
                if (isDeleting && idOfDeckToEdit) deleteDeck(idOfDeckToEdit, navigate);
                setIsDeleting(!isDeleting)
            }}>{getDeleteString()}</DeleteDeckButton>
        </>
    );
}

type ButtonProps = {
    isDeleting: boolean;
}

const UpdateDeckButton = styled.button<ButtonProps>`
  height: 40px;
  width: ${props => props.isDeleting ? "200px" : "300px"};
  padding: 0;
  padding-top: 5px;
  background: mediumaquamarine;
  color: black;
  font-size: ${props => props.isDeleting ? "15px" : "23px"};
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
  filter: drop-shadow(1px 2px 3px #060e18);
  transition: all 0.3s ease;

  :hover {
    background: aquamarine;
  }

  &:active {
    background-color: aqua;
    border: none;
    filter: none;
    transform: translateY(1px);
    box-shadow: inset 0 0 3px #000000;
  }

  &:focus {
    outline: none;
  }
`;

const DeleteDeckButton = styled.button<ButtonProps>`
  font-weight: bold;
  max-height: 40px;
  min-width: 50px;
  font-size: 16px;
  background: ${props => props.isDeleting ? "ghostwhite" : "crimson"};
  color: crimson;
  padding: 0;
  width: ${props => props.isDeleting ? "40%" : "20%"};
  font-family: 'Sansation', sans-serif;
  transition: all 0.3s ease;

  &:active {
    border: none;
    filter: none;
    transform: translateY(1px);
    box-shadow: inset 0 0 3px #000000;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) and (max-height: 850px) {
    font-family: 'Pixel Digivolve', sans-serif;
    font-size: ${props => props.isDeleting ? "1.15em" : "1em"};
    width: ${props => props.isDeleting ? "30%" : "20%"};
  }
`;
