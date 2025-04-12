import { CardTypeGame, FieldCardContextMenuItemProps } from "../../utils/types.ts";
import Card from "../Card.tsx";
import { Fade } from "react-awesome-reveal";
import { CSSProperties, useCallback } from "react";
import { ItemParams, ShowContextMenuParams } from "react-contexify";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { useMediaQuery } from "@mui/material";
import { WSUtils } from "../../pages/GamePage.tsx";
import { useDndContext } from "@dnd-kit/core";

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>;

type CardStackProps = {
    cards: CardTypeGame[];
    location: string;
    opponentSide?: boolean;
    wsUtils?: WSUtils;
    // only if opponentSide is false:
    sendTiltCard?: (cardId: string, location: string) => void;
    sendSfx?: (sfx: string) => void;
    activateEffectAnimation?: ({ props }: ItemParams<FieldCardContextMenuItemProps>) => void;
    showFieldCardMenu?: (params: MakeOptional<ShowContextMenuParams, "id">) => void;
    // only if opponentSide is true:
    showOpponentCardMenu?: (params: MakeOptional<ShowContextMenuParams, "id">) => void;
};

const tamerLocations = [
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "myDigi14",
    "myDigi15",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentDigi14",
    "opponentDigi15",
];

export default function CardStack(props: CardStackProps) {
    const { cards, location, wsUtils, opponentSide, showFieldCardMenu, showOpponentCardMenu } = props;

    const isSmallWindow = useMediaQuery("(max-height: 500px)");
    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const tamerWidth = cardWidth - cardWidth / 3.5;
    const { active } = useDndContext();

    const isDraggingThisArea = active && active?.data?.current?.content?.location === location;

    const getCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            const bottomPercentage = (cardIndex * 7.5) / (cardCount > 14 ? 3 : cardCount > 7 ? 2 : 1);

            return {
                height: isDraggingThisArea ? undefined : `${cardWidth * 1.4}px`,
                position: "absolute",
                bottom: `${bottomPercentage}%`,
                rotate: `${cards[cardIndex]?.isTilted ? 25 : 0}deg`,
                left: 0,
            };
        },
        [isDraggingThisArea, cardWidth]
    );

    const getTamerCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            const leftPercentage =
                (cardIndex * 9.5) / (cardCount > 13 ? 2.5 : cardCount > 10 ? 2 : cardCount > 7 ? 1.5 : 1);

            return {
                height: isDraggingThisArea ? undefined : `${tamerWidth * 1.4}px`,
                position: "absolute",
                left: `${leftPercentage}%`,
                rotate: `${cards[cardIndex]?.isTilted ? 25 : 0}deg`,
                zIndex: 50 - cardIndex,
            };
        },
        [isDraggingThisArea, tamerWidth]
    );

    if (tamerLocations.includes(location)) {
        return !opponentSide
            ? cards?.map((card, index) => (
                  <Card
                      style={{
                          ...getTamerCardContainerStyles(index, cards.length),
                          bottom: 0,
                          width: tamerWidth,
                      }}
                      card={card}
                      location={location}
                      wsUtils={wsUtils}
                      index={index}
                      key={card.id}
                      onContextMenu={(e) =>
                          showFieldCardMenu?.({
                              event: e,
                              props: { index, location, id: card.id, name: card.name },
                          })
                      }
                  />
              ))
            : cards?.map((card, index) => (
                  <Fade
                      direction={"down"}
                      duration={500}
                      key={card.id}
                      style={{
                          ...getTamerCardContainerStyles(index, cards.length),
                          bottom: isSmallWindow ? "-22%" : "-7%",
                      }}
                  >
                      <Card
                          style={{ width: tamerWidth }}
                          card={card}
                          location={location}
                          index={index}
                          onContextMenu={(e) =>
                              showOpponentCardMenu?.({
                                  event: e,
                                  props: { index, location, id: card.id, name: card.name },
                              })
                          }
                      />
                  </Fade>
              ));
    }

    return (
        <>
            {!opponentSide
                ? cards?.map((card, index) => (
                      <Card
                          style={{ ...getCardContainerStyles(index, cards.length), width: cardWidth }}
                          card={card}
                          location={location}
                          wsUtils={wsUtils}
                          index={index}
                          key={card.id}
                          onContextMenu={(e) =>
                              showFieldCardMenu?.({
                                  event: e,
                                  props: { index, location, id: card.id, name: card.name },
                              })
                          }
                      />
                  ))
                : cards?.map((card, index) => (
                      <Fade
                          direction={"down"}
                          duration={500}
                          key={card.id}
                          style={getCardContainerStyles(index, cards.length)}
                      >
                          <Card
                              style={{ width: cardWidth }}
                              card={card}
                              location={location}
                              index={index}
                              onContextMenu={(e) =>
                                  showOpponentCardMenu?.({
                                      event: e,
                                      props: { index, location, id: card.id, name: card.name },
                                  })
                              }
                          />
                      </Fade>
                  ))}
        </>
    );
}
