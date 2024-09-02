import {CardTypeGame, FieldCardContextMenuItemProps} from "../../utils/types.ts";
import Card from "../Card.tsx";
import {Fade} from "react-awesome-reveal";
import {CSSProperties, useCallback, useState} from "react";
import {ItemParams, ShowContextMenuParams} from "react-contexify";
import {useStore} from "../../hooks/useStore.ts";
import {useMediaQuery} from "@mui/material";

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

const tamerLocations = ["myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15"];

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

    const cardWidth = useStore((state) => state.cardWidth);

    const isSmallWindow = useMediaQuery('(max-height: 500px)');
    const isSmallerWindow = useMediaQuery('(max-height: 400px)');

    const getCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            const bottom = (cardIndex * 15) - (isSmallerWindow ? 7 : isSmallWindow ? 6 : 5);
            const left = cardCount > 6 ? `${cardIndex > 5 ? 50 : 5}px` : "50%";
            const transform = cardCount > 6 ? "translateX(-3%)" : "translate(-50%, 0)";

            return {
                position: 'absolute',
                bottom: `${bottom}px`,
                left: left,
                transform: transform,
            };
        },
        [isSmallWindow, isSmallerWindow]
    );

    const getTamerCardContainerStyles = useCallback(
        (cardIndex: number): CSSProperties => {
            const left = `${cardIndex * 15}px`;
            const bottom = isSmallerWindow ? '-12%' : isSmallWindow ? '-10%' : '-7%';

            return {
                position: 'absolute',
                left: left,
                bottom: bottom,
            };
        },
        [isSmallWindow, isSmallerWindow]
    );

    if (tamerLocations.includes(location)) {
        return !opponentSide
                ? cards?.map((card, index) =>
                    <Card style={{...getTamerCardContainerStyles(index), width: cardWidth - 7}}
                          card={card} location={location} sendSfx={sendSfx} sendTiltCard={sendTiltCard}
                          index={index} draggedCards={draggedCards} setDraggedCards={setDraggedCards}
                          handleDropToStackBottom={handleDropToStackBottom} key={card.id}
                          onContextMenu={(e) => showFieldCardMenu?.({
                              event: e,
                              props: {index, location, id: card.id, name: card.name}
                          })}
                    />)

                : cards?.map((card, index) =>
                    <Fade direction={"down"} duration={500} key={card.id}>
                        <Card style={{...getTamerCardContainerStyles(index), width: cardWidth - 7}}
                              card={card} location={location} index={index}
                              onContextMenu={(e) => showOpponentCardMenu?.({
                                  event: e,
                                  props: {index, location, id: card.id, name: card.name}
                              })}
                        />
                    </Fade>)
    }

    return <>
        {!opponentSide
            ? cards?.map((card, index) =>
                    <Card style={{...getCardContainerStyles(index, cards.length), width: cardWidth}}
                          card={card} location={location} sendSfx={sendSfx} sendTiltCard={sendTiltCard}
                          index={index} draggedCards={draggedCards} setDraggedCards={setDraggedCards}
                          handleDropToStackBottom={handleDropToStackBottom} key={card.id}
                          onContextMenu={(e) => showFieldCardMenu?.({
                              event: e,
                              props: {index, location, id: card.id, name: card.name}
                          })}
                    />)

            : cards?.map((card, index) =>
                    <Fade direction={"down"} duration={500} key={card.id}>
                        <Card style={{...getCardContainerStyles(index, cards.length), width: cardWidth}}
                              card={card} location={location} index={index}
                              onContextMenu={(e) => showOpponentCardMenu?.({
                                  event: e,
                                  props: {index, location, id: card.id, name: card.name}
                              })}
                        />
                    </Fade>)
        }
    </>
}
