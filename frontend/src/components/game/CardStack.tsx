import {CardTypeGame} from "../../utils/types.ts";
import styled from "@emotion/styled";
import Card from "../Card.tsx";
import {Fade} from "react-awesome-reveal";
import {useState} from "react";
type CardStackProps = {
    cards: CardTypeGame[],
    location: string,
    sendUpdate?: () => void,
    sendSfx?: (sfx: string) => void
    opponentSide?: boolean
    handleDropToStackBottom?: (cardId: string, from: string, to: string, name: string) => void
}

export default function CardStack({cards, location, sendUpdate, sendSfx, opponentSide, handleDropToStackBottom}: CardStackProps) {

    const [draggedCards, setDraggedCards] = useState<CardTypeGame[]>([]);

    const tamerLocations = ["myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15"];

    if (tamerLocations.includes(location)) {
        return <div style={{position: "absolute", width: "100%", height: "100%"}}>
            {!opponentSide

                ? cards?.map((card, index) =>
                    <TamerCardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                                   id={index === cards.length - 1 ? location : ""}>
                        <Card card={card} location={location} sendSfx={sendSfx} sendUpdate={sendUpdate}
                              index={index} draggedCards={draggedCards} setDraggedCards={setDraggedCards}
                              handleDropToStackBottom={handleDropToStackBottom} />
                    </TamerCardContainer>)

                : cards?.map((card, index) =>
                    <TamerCardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                                   id={index === cards.length - 1 ? location : ""}>
                        <Fade direction={"down"} duration={500}>
                            <Card card={card} location={location}/>
                        </Fade></TamerCardContainer>)
            }
        </div>
    }

    return <div style={{position: "absolute", width: "100%", height: "100%"}}>
        {!opponentSide

            ? cards?.map((card, index) =>
                <CardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                               id={index === cards.length - 1 ? location : ""}>
                    <Card card={card} location={location} sendSfx={sendSfx} sendUpdate={sendUpdate}
                          index={index} draggedCards={draggedCards} setDraggedCards={setDraggedCards}
                          handleDropToStackBottom={handleDropToStackBottom} />
                </CardContainer>)

            : cards?.map((card, index) =>
                <CardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                               id={index === cards.length - 1 ? location : ""}>
                    <Fade direction={"down"} duration={500}>
                        <Card card={card} location={location}/>
                    </Fade></CardContainer>)
        }
    </div>
}

const CardContainer = styled.div<{ cardIndex: number, cardCount: number }>`
  position: absolute;
  bottom: ${({cardIndex}) => cardIndex > 5 ? ((cardIndex - 6) * 20) + 5 : (cardIndex * 20) + 5}px;
  left: ${({cardIndex, cardCount}) => cardCount > 6 ? `${cardIndex > 5 ? 50 : 5}px` : "50%"};
  transform: ${({cardCount}) => cardCount > 6 ? "translateX(-3%)" : "translate(-50%, 0)"};
`;

const TamerCardContainer = styled.div<{ cardIndex: number, cardCount: number }>`
  position: absolute;
  top: ${({cardIndex, cardCount}) =>  (cardIndex * (cardCount > 6 ? 10 : 20)) + 5}px;
  z-index: 20 - cardIndex;
  left: 50%;
  transform: translateX(-50%);
`;
