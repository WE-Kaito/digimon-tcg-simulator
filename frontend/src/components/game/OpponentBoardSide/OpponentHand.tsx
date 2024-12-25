import {CardAnimationContainer} from "../../Card.tsx";
import Lottie from "lottie-react";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import {getSleeve} from "../../../utils/sleeves.ts";
import styled from "@emotion/styled";
import {calculateCardOffsetX, calculateCardOffsetY, calculateCardRotation} from "../../../utils/functions.ts";
import {useContextMenu} from "react-contexify";
import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import {useGeneralStates} from "../../../hooks/useGeneralStates.ts";

export default function OpponentHand() {
    const {show: showOpponentCardMenu} = useContextMenu({id: "opponentCardMenu", props: {index: -1}});

    const [opponentHand, opponentSleeve, getIsCardTarget] = useGameBoardStates((state) => [state.opponentHand, state.opponentSleeve, state.getIsCardTarget]);
    const cardWidth = useGeneralStates((state) => state.cardWidth);

    return (
        <Container>
            <StyledList cardCount={opponentHand.length}>
                {opponentHand.map((card, index) =>
                    <ListItem cardCount={opponentHand.length} cardIndex={index} cardWidth={cardWidth} key={card.id}
                              onContextMenu={(e) => showOpponentCardMenu({
                                  event: e,
                                  props: {
                                      index,
                                      location: "opponentHand",
                                      id: card.id,
                                      name: card.name
                                  }
                              })}>
                        <img alt="card" src={getSleeve(opponentSleeve)} style={{ width: cardWidth, borderRadius: 2 }} />
                        <div style={{
                            position: "relative",
                            filter: getIsCardTarget(card.id) ? "drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1)" : "unset"
                        }}>
                            {getIsCardTarget(card.id) &&
                                <CardAnimationContainer>
                                    <Lottie animationData={targetAnimation} loop={true}/>
                                </CardAnimationContainer>}
                        </div>
                    </ListItem>)}
            </StyledList>
            <StyledSpan cardCount={opponentHand.length}>{opponentHand.length}</StyledSpan>
        </Container>
    );
}

const Container = styled.div`
  grid-area: hand;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  transform: rotate(180deg);
`;

const StyledList = styled.ul<{ cardCount: number }>`
  position: absolute;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  list-style-type: none;
  transform: translateX(${({cardCount}) => cardCount > 15 ? "2%" : "10%"});
`;

const ListItem = styled.li<{ cardCount: number, cardIndex: number, cardWidth: number }>`
  position: absolute;
  margin: 0;
  padding: 0;
  list-style-type: none;
  left: 0;
  top: 0;
  transition: all 0.2s ease;
  transform: translateX(${({
                                                                                                                       cardCount,
                                                                                                                       cardIndex,
                                                                                                                       cardWidth
                                                                                                                   }) => calculateCardOffsetX(cardCount, cardIndex, cardWidth)}) translateY(${({
                                                                                                                                                                                                   cardCount,
                                                                                                                                                                                                   cardIndex
                                                                                                                                                                                               }) => calculateCardOffsetY(cardCount, cardIndex)}) rotate(${({
                                                                                                                                                                                                                                                                cardCount,
                                                                                                                                                                                                                                                                cardIndex
                                                                                                                                                                                                                                                            }) => calculateCardRotation(cardCount, cardIndex)});

  &:hover {
    z-index: 100;
  }
`;

const StyledSpan = styled.span<{ cardCount: number }>`
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  font-size: 20px;
  opacity: 0.4;
  visibility: ${({cardCount}) => cardCount > 5 ? "visible" : "hidden"};
  position: absolute;
  bottom: 5%;
  left: 45%;
  transform: rotate(180deg);
`;
