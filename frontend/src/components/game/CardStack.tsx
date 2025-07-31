import { CardTypeGame, FieldCardContextMenuItemProps } from "../../utils/types.ts";
import Card from "../Card.tsx";
import { Fade } from "react-awesome-reveal";
import { CSSProperties, useCallback } from "react";
import { ItemParams, ShowContextMenuParams } from "react-contexify";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { WSUtils } from "../../pages/GamePage.tsx";

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
    "myDigi21",
    "myDigi22",
    "myDigi23",
    "myDigi24",
    "myDigi25",
    "opponentDigi21",
    "opponentDigi22",
    "opponentDigi23",
    "opponentDigi24",
    "opponentDigi25",
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
    "myLink9",
    "myLink10",
    "myLink11",
    "myLink12",
    "myLink13",
    "myLink14",
    "myLink15",
    "myLink16",
    "myLink17",
    "myLink18",
    "myLink19",
    "myLink20",
    "opponentLink1",
    "opponentLink2",
    "opponentLink3",
    "opponentLink4",
    "opponentLink5",
    "opponentLink6",
    "opponentLink7",
    "opponentLink8",
    "opponentLink9",
    "opponentLink10",
    "opponentLink11",
    "opponentLink12",
    "opponentLink13",
    "opponentLink14",
    "opponentLink15",
    "opponentLink16",
    "opponentLink17",
    "opponentLink18",
    "opponentLink19",
    "opponentLink20",
];

export default function CardStack(props: CardStackProps) {
    const { cards, location, wsUtils, opponentSide, showFieldCardMenu, showOpponentCardMenu } = props;

    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const tamerWidth = cardWidth - cardWidth / 3.5;
    const isLinkCard = linkLocations.includes(location);

    const getCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            const bottomPercentage = cardIndex * getMultiplier(cardCount);
            return {
                aspectRatio: "7 / 9.75",
                position: "absolute",
                bottom: `${isLinkCard ? bottomPercentage - 7.5 : bottomPercentage}%`,
                rotate: isLinkCard
                    ? opponentSide
                        ? "-270deg"
                        : "-90deg"
                    : `${cards[cardIndex]?.isTilted ? 30 : 0}deg`,
                [opponentSide ? "right" : "left"]: isLinkCard ? "-160%" : 0,
            };
        },
        [cardWidth, cards]
    );

    const getTamerCardContainerStyles = useCallback(
        (cardIndex: number, cardCount: number): CSSProperties => {
            return {
                position: "absolute",
                left: `${cardIndex * getMultiplierTamer(cardCount)}%`,
                rotate: `${cards[cardIndex]?.isTilted ? 30 : 0}deg`,
                zIndex: 50 - cardIndex,
            };
        },
        [tamerWidth, cards]
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
                      triggerOnce
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
                          triggerOnce
                      >
                          <Card
                              style={{ width: cardWidth, height: cardWidth * 1.4 }}
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

function getMultiplier(cardCount: number): number {
    if (cardCount >= 30) return 2.3 - (cardCount - 17) * 0.0625;
    if (cardCount >= 27) return 2.3 - (cardCount - 17) * 0.07;
    if (cardCount >= 22) return 2.3 - (cardCount - 17) * 0.075;
    if (cardCount >= 17) return 2.3 - (cardCount - 17) * 0.1;
    if (cardCount === 16) return 2.3;
    if (cardCount === 15) return 2.5;
    if (cardCount === 14) return 2.75;
    if (cardCount === 13) return 3;
    if (cardCount === 12) return 3.25;
    if (cardCount === 11) return 3.5;
    if (cardCount === 10) return 3.95;
    if (cardCount === 9) return 4.4;
    if (cardCount === 8) return 5;
    if (cardCount === 7) return 5.8;
    if (cardCount === 6) return 7;
    return 8.5;
}

function getMultiplierTamer(cardCount: number): number {
    if (cardCount >= 21) return 3.85 - (cardCount - 20) * (0.175 - 0.003 * (cardCount - 20));
    if (cardCount === 20) return 3.85;
    if (cardCount === 19) return 4.05;
    if (cardCount === 18) return 4.3;
    if (cardCount === 17) return 4.575;
    if (cardCount === 16) return 4.875;
    if (cardCount === 15) return 5.25;
    if (cardCount === 14) return 5.625;
    if (cardCount === 13) return 6.1;
    if (cardCount === 12) return 6.62;
    if (cardCount === 11) return 7.3;
    if (cardCount === 10) return 8.125;
    if (cardCount === 9) return 9.125;
    if (cardCount === 8) return 10.5;
    return 12.25;
}
