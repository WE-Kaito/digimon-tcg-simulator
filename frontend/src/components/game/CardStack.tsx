import { CardTypeGame, FieldCardContextMenuItemProps } from "../../utils/types.ts";
import Card from "../Card.tsx";
import { Fade } from "react-awesome-reveal";
import { CSSProperties, useCallback } from "react";
import { ItemParams, ShowContextMenuParams } from "react-contexify";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
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
    "myDigi9",
    "myDigi10",
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "opponentDigi9",
    "opponentDigi10",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
];

const linkLocations = [
    "myLink1",
    "myLink2",
    "myLink3",
    "myLink4",
    "myLink5",
    "myLink6",
    "myLink7",
    "myLink8",
    "opponentLink1",
    "opponentLink2",
    "opponentLink3",
    "opponentLink4",
    "opponentLink5",
    "opponentLink6",
    "opponentLink7",
    "opponentLink8",
];

export default function CardStack(props: CardStackProps) {
    const { cards, location, wsUtils, opponentSide, showFieldCardMenu, showOpponentCardMenu } = props;

    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const tamerWidth = cardWidth - cardWidth / 3.5;
    const isLinkCard = linkLocations.includes(location);
    const { active } = useDndContext();

    const isCardBeingDragged = useCallback(
        (cardIndex: number) => {
            return active && active?.data?.current?.content?.id === cards[cardIndex]?.id;
        },
        [active, cards]
    );

    const getCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            const bottomPercentage = (cardIndex * 7.5) / (cardCount > 14 ? 3 : cardCount > 7 ? 2 : 1);
            const isBeingDragged = isCardBeingDragged(cardIndex);

            return {
                height: isBeingDragged ? undefined : `${cardWidth * 1.4}px`,
                position: "absolute",
                bottom: `${isLinkCard ? bottomPercentage - 7.5 : bottomPercentage}%`,
                rotate: isLinkCard ? "-90deg" : `${cards[cardIndex]?.isTilted ? 30 : 0}deg`,
                left: isLinkCard ? "-160%" : 0,
            };
        },
        [isCardBeingDragged, cardWidth, cards]
    );

    const getTamerCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            const leftPercentage =
                (cardIndex * 9.5) / (cardCount > 13 ? 2.5 : cardCount > 10 ? 2 : cardCount > 7 ? 1.5 : 1);
            const isBeingDragged = isCardBeingDragged(cardIndex);

            return {
                height: isBeingDragged ? undefined : `${tamerWidth * 1.4}px`,
                position: "absolute",
                left: `${leftPercentage}%`,
                rotate: `${cards[cardIndex]?.isTilted ? 30 : 0}deg`,
                zIndex: 50 - cardIndex,
            };
        },
        [isCardBeingDragged, tamerWidth, cards]
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
                      style={{ ...getTamerCardContainerStyles(index, cards.length) }}
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
                          direction={isLinkCard ? "up" : "down"}
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
