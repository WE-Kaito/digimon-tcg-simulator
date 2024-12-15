import styled from "@emotion/styled";
import Card from "../Card.tsx";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {CardTypeGame, OpenedCardModal} from "../../utils/types.ts";
import {useContextMenu} from "react-contexify";
import {useEffect} from "react";
import {WSUtils} from "../../pages/GamePage.tsx";
import {useSound} from "../../hooks/useSound.ts";
import {Button} from "@mui/material";
import {useGameUIStates} from "../../hooks/useGameUIStates.ts";

export default function CardModal({ wsUtils }: { wsUtils?: WSUtils }) {
    const [openedCardModal, setOpenedCardModal] = useGameUIStates((state) => [state.openedCardModal, state.setOpenedCardModal]);
    const locationCards = useGameBoardStates((state) => openedCardModal ? state[(openedCardModal) as keyof typeof state] as CardTypeGame[] : []);
    const shuffleSecurity = useGameBoardStates((state) => state.shuffleSecurity);
    const cardWidth = useGeneralStates((state) => state.cardWidth) * 1.07;
    const playShuffleDeckSfx = useSound((state) => state.playShuffleDeckSfx);

    const cardsToRender = locationCards.slice().reverse();

    const {show: showTrashCardMenu} = useContextMenu({id: "modalMenu", props: {index: -1, location: "", id: ""}});

    useEffect(() => {
        if (openedCardModal && !locationCards.length) setOpenedCardModal(false); // correctly close the modal if there are no cards
    }, [locationCards, openedCardModal, setOpenedCardModal]);

    function handleCloseSecurity() {
        setOpenedCardModal(false);
        shuffleSecurity();
        playShuffleDeckSfx();
        wsUtils?.sendUpdate?.();
        wsUtils?.sendChatMessage?.(`[FIELD_UPDATE]≔【Closed Security】`);
        wsUtils?.sendChatMessage?.(`[FIELD_UPDATE]≔【↻ Security Stack】`);
        wsUtils?.sendSfx?.("playShuffleDeckSfx");
    }

    if (!openedCardModal) return <></>;

    return (
        <Container modal={openedCardModal}>
            <InnerContainer modal={openedCardModal} onMouseOver={(e) => e.stopPropagation()}>
                {cardsToRender.map((card, index) =>
                    <Card card={card} location={openedCardModal} style={{ width: cardWidth }} key={card.id}
                          onContextMenu={(e) => {
                              if (openedCardModal === OpenedCardModal.MY_SECURITY) return;
                              showTrashCardMenu?.({
                                  event: e, props: {index, location: openedCardModal, id: card.id, name: card.name}
                              });
                          }}/>)
                }
                {openedCardModal === OpenedCardModal.MY_SECURITY &&
                    <StyledMuiButton variant="contained" onClick={handleCloseSecurity}>
                        Shuffle & Close
                    </StyledMuiButton>
                }
            </InnerContainer>
        </Container>
    );
}

const Container = styled.div<{ modal: OpenedCardModal }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 299;
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  align-items: ${({modal}) => modal === OpenedCardModal.OPPONENT_TRASH ? "flex-end" : "flex-start"};
  cursor: ${({modal}) => modal === OpenedCardModal.MY_SECURITY ? "not-allowed" : "default"};
  pointer-events: ${({modal}) => modal === OpenedCardModal.MY_SECURITY ? "auto" : "none"};
`;

const InnerContainer = styled.div<{ modal: OpenedCardModal }>`
  position: relative;
  pointer-events: auto;
  cursor: default;
  width: 30%;
  height: 62%;
  padding: 6px 4px 6px 6px;
  background: rgba(2, 1, 1, 0.95);
  display: flex;
  flex-flow: row wrap;
  place-content: flex-start;
  gap: 1.5%;
  overflow-y: scroll;
  border-radius: 5px;
  border: 4px solid rgba(${({modal}) => modal === OpenedCardModal.OPPONENT_TRASH ? "220, 20, 65" : "117, 34, 245"}, 0.56);
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
  height: 10%;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
  border-radius: 0;
  font-family: Naston, sans-serif;
  background: rgba(117, 34, 245, 0.8);

  &:hover {
    background: rgb(34, 69, 245);
  }
;`
