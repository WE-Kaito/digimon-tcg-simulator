import {CardTypeGame, FieldCardContextMenuItemProps} from "../../utils/types.ts";
import styled from "@emotion/styled";
import Card from "../Card.tsx";
import {Fade} from "react-awesome-reveal";
import {useState} from "react";
import {ItemParams, ShowContextMenuParams} from "react-contexify";
import {useStore} from "../../hooks/useStore.ts";

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> &
    Partial<Pick<Type, Key>>;

type CardStackProps = {
    cards: CardTypeGame[],
    location: string,
    sendTiltCard?: (cardId: string, location: string) => void,
    sendSfx?: (sfx: string) => void
    opponentSide?: boolean
    handleDropToStackBottom?: (cardId: string, from: string, to: string, name: string) => void,
    activateEffectAnimation?: ({props}: ItemParams<FieldCardContextMenuItemProps>) => void,
    showFieldCardMenu?: (params: MakeOptional<ShowContextMenuParams, "id">) => void
    showOpponentCardMenu?: (params: MakeOptional<ShowContextMenuParams, "id">) => void
}

export default function CardStack(props: CardStackProps) {
    const {
        cards,
        location,
        sendTiltCard,
        sendSfx,
        opponentSide,
        handleDropToStackBottom,
        showFieldCardMenu,
        showOpponentCardMenu
    } = props;
    const [draggedCards, setDraggedCards] = useState<CardTypeGame[]>([]);

    const tamerLocations = ["myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15"];

    const cardWidth = useStore((state) => state.cardWidth);

    if (tamerLocations.includes(location)) {
        return !opponentSide
                ? cards?.map((card, index) =>
                    <TamerCardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                                        id={index === cards.length - 1 ? location : ""}
                                        onContextMenu={(e) => showFieldCardMenu?.({
                                            event: e,
                                            props: {index, location, id: card.id, name: card.name}
                                        })}>
                        <Card card={card} location={location} sendSfx={sendSfx} sendTiltCard={sendTiltCard}
                              index={index} draggedCards={draggedCards} setDraggedCards={setDraggedCards}
                              handleDropToStackBottom={handleDropToStackBottom} width={cardWidth - 7}/>
                    </TamerCardContainer>)

                : cards?.map((card, index) =>
                    <TamerCardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                                        id={index === cards.length - 1 ? location : ""}
                                        onContextMenu={(e) => showOpponentCardMenu?.({
                                            event: e,
                                            props: {index, location, id: card.id, name: card.name}
                                        })}>
                        <Fade direction={"down"} duration={500}>
                            <Card card={card} location={location} index={index} width={cardWidth - 7}/>
                        </Fade></TamerCardContainer>)
    }

    return <>
        {!opponentSide
            ? cards?.map((card, index) =>
                <CardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                               id={index === cards.length - 1 ? location : ""}
                               onContextMenu={(e) => showFieldCardMenu?.({
                                   event: e,
                                   props: {index, location, id: card.id, name: card.name}
                               })}>
                    <Card card={card} location={location} sendSfx={sendSfx} sendTiltCard={sendTiltCard}
                          index={index} draggedCards={draggedCards} setDraggedCards={setDraggedCards}
                          handleDropToStackBottom={handleDropToStackBottom} width={cardWidth}/>
                </CardContainer>)

            : cards?.map((card, index) =>
                <CardContainer cardCount={cards.length} key={card.id} cardIndex={index}
                               id={index === cards.length - 1 ? location : ""}
                               onContextMenu={(e) => showOpponentCardMenu?.({
                                   event: e,
                                   props: {index, location, id: card.id, name: card.name}
                               })}>
                    <Fade direction={"down"} duration={500}>
                        <Card card={card} location={location} index={index} width={cardWidth}/>
                    </Fade></CardContainer>)
        }
    </>
}

const CardContainer = styled.div<{ cardIndex: number, cardCount: number }>`
  position: absolute;
  bottom: ${({cardIndex}) => (cardIndex * 15) - 5}px;
  left: ${({cardIndex, cardCount}) => cardCount > 6 ? `${cardIndex > 5 ? 50 : 5}px` : "50%"};
  transform: ${({cardCount}) => cardCount > 6 ? "translateX(-3%)" : "translate(-50%, 0)"};
  @media (max-height: 500px) { bottom: ${({cardIndex}) => (cardIndex * 15) - 6}px; }
  @media (max-height: 400px) { bottom: ${({cardIndex}) => (cardIndex * 15) - 7}px; }
`;

const TamerCardContainer = styled.div<{ cardIndex: number, cardCount: number }>`
  position: absolute;
  left: ${({cardIndex}) => (cardIndex * 15)}px;
  bottom: -7%;
  @media (max-height: 500px) { bottom: -10%; }
  @media (max-height: 400px) { bottom: -12%; }
`;
