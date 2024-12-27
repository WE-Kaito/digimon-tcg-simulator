import styled from "@emotion/styled";
import Card from "../Card.tsx";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {CardTypeGame} from "../../utils/types.ts";
import {useContextMenu} from "react-contexify";
import {useEffect} from "react";
import {Button} from "@mui/material";
import {useGameUIStates} from "../../hooks/useGameUIStates.ts";

const tamerLocations = ["myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15",
    "opponentDigi11", "opponentDigi12", "opponentDigi13", "opponentDigi14", "opponentDigi15"];

/**
 * Modal that shows the stack of cards in a location and closes autimatically if the trash or security is opened.
 * It is only an alternative display of the cards in the location, and does not have any functionality.
 * A possible future improvement would be to add Sortable of dnd-kit.
 */
export default function StackModal() {
    const [openedCardModal, stackModal, setStackModal] = useGameUIStates((state) => [
        state.openedCardModal, state.stackModal, state.setStackModal]);
    const locationCards = useGameBoardStates((state) => stackModal ? state[(stackModal) as keyof typeof state] as CardTypeGame[] : []);
    const cardWidth = useGeneralStates((state) => state.cardWidth) * 1.07;

    const cardsToRender = (!!stackModal && tamerLocations.includes(stackModal)) ? locationCards : locationCards.slice().reverse();

    const {show: showCardMenu } = useContextMenu({
        id: (stackModal !== false && stackModal.includes("opponent")) ? "modalMenuOpponent" : "modalMenu",
        props: { index: -1, location: "", id: "" }
    });

    useEffect(() => {
        if (openedCardModal) setStackModal(false);
    }, [openedCardModal, setStackModal]);

    if (!stackModal) return <></>;

    return (
        <Container id={stackModal + "_stackModal"}>
            <InnerContainer onMouseOver={(e) => e.stopPropagation()}>
                {cardsToRender.map((card, index) =>
                    <Card card={card} location={stackModal} style={{ width: cardWidth }} key={card.id}
                          onContextMenu={(e) => {
                              showCardMenu?.({
                                  event: e, props: {index, location: openedCardModal, id: card.id, name: card.name}
                              });
                          }}/>)
                }
                <StyledMuiButton variant="contained" onClick={() => setStackModal(false)}>Close</StyledMuiButton>
            </InnerContainer>
        </Container>
    );
}

const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 299;
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  align-items: flex-start;
  pointer-events: none;
`;

const InnerContainer = styled.div`
  position: relative;
  pointer-events: auto;
  cursor: default;
  width: 30%;
  margin-top: 0.5%;
  height: 61.5%;
  padding: 6px 4px 6px 6px;
  background: rgba(2, 1, 1, 0.95);
  display: flex;
  flex-flow: row wrap;
  place-content: flex-start;
  gap: 1.5%;
  overflow-y: scroll;
  border-radius: 5px;
  border: 4px solid rgba(245, 210, 105, 0.56);
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.75);
  z-index: 10;
  
  scrollbar-width: none;

  ::-webkit-scrollbar {
    visibility: hidden;
    width: 0;
  }
`;

const StyledMuiButton = styled(Button)`
  position: absolute;
  color: black;
  height: 10%;
  left: 0;
  bottom: 0;
  z-index: 20;
  border-radius: 0;
  border-top-right-radius: 5%;
  font-family: Naston, sans-serif;
  background: rgba(245, 210, 105, 0.8);
  &:hover {
    background: rgb(245, 190, 87);
  }
;`
