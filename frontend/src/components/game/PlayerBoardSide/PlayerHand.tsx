import Card from "../../Card.tsx";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import { CSSProperties } from "react";
import { calculateCardOffsetX, calculateCardOffsetY, calculateCardRotation } from "../../../utils/functions.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import { CardTypeGame } from "../../../utils/types.ts";
import { useDroppable } from "@dnd-kit/core";
import { useSettingStates } from "../../../hooks/useSettingStates.ts";
export default function PlayerHand() {
    const isHandHidden = useGameBoardStates((state) => state.isHandHidden);
    const toggleIsHandHidden = useGameBoardStates((state) => state.toggleIsHandHidden);
    const myHand = useGameBoardStates((state) => state.myHand);
    const cardWidth = useGeneralStates((state) => state.cardWidth);

    const isMobileUi = useSettingStates((state) => state.isMobileUI);

    const { setNodeRef } = useDroppable({ id: "myHand", data: { accept: ["card"] } });

    return (
        <>
            <EyeButtonContainer>
                <HideHandIconButton
                    onClick={toggleIsHandHidden}
                    isActive={isHandHidden}
                    title={"Hide hand"}
                    cardCount={myHand.length}
                >
                    {isHandHidden ? (
                        <VisibilityOffIcon sx={{ fontSize: cardWidth / 3.5 }} />
                    ) : (
                        <VisibilityIcon sx={{ fontSize: cardWidth / 3.5 }} />
                    )}
                </HideHandIconButton>
            </EyeButtonContainer>
            <Container ref={setNodeRef} cardCount={myHand.length} isMobileUi={isMobileUi}>
                {myHand.map((card, index) => (
                    <HandCard key={card.id} card={card} index={index} />
                ))}
                <StyledSpan cardCount={myHand.length}>{myHand.length}</StyledSpan>
            </Container>
        </>
    );
}

function HandCard({ card, index }: { card: CardTypeGame; index: number }) {
    const { show: showHandCardMenu } = useContextMenu({ id: "handCardMenu", props: { index } });

    const myHand = useGameBoardStates((state) => state.myHand);
    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const isMobileUi = useSettingStates((state) => state.isMobileUI);

    const transformY = isMobileUi ? 0 : calculateCardOffsetY(myHand.length, index);
    const rotation = isMobileUi ? 0 : calculateCardRotation(myHand.length, index);

    const style: CSSProperties = {
        position: "absolute",
        left: isMobileUi ? index * 30 : calculateCardOffsetX(myHand.length, index, cardWidth),
        bottom: isMobileUi ? "-20%" : myHand.length > 15 ? "5%" : "18%",
        width: cardWidth,
        transition: "all 0.2s ease",
        transformOrigin: "center",
        transform: `translateY(${transformY}) rotate(${rotation}) ${isMobileUi ? "scale(1.5)" : ""}`,
    };

    return (
        <Card
            card={card}
            location={"myHand"}
            style={style}
            onContextMenu={(e) => showHandCardMenu({ event: e, props: { index } })}
        />
    );
}

const Container = styled.div<{ cardCount: number; isMobileUi?: boolean }>`
    touch-action: none;
    grid-area: hand;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
    transform: translate(5%, ${({ cardCount, isMobileUi }) => (cardCount > 15 || isMobileUi ? 0 : 50)}%);
`;

const EyeButtonContainer = styled.div`
    grid-area: eye;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
`;

const HideHandIconButton = styled.button<{ isActive: boolean; cardCount: number }>`
    position: absolute;
    left: -5%;
    bottom: ${({ cardCount }) => (cardCount > 15 ? "-45%" : "-25%")};
    display: flex;
    opacity: ${({ isActive }) => (isActive ? 0.85 : 0.25)};
    color: ${({ isActive }) => (isActive ? "rgba(190,39,85,1)" : "unset")};
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    transition: all 0.15s ease;
    padding: 2px;

    &:hover {
        color: #d764c1;
        opacity: 0.5;
    }
`;

const StyledSpan = styled.span<{ cardCount: number }>`
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    font-size: 20px;
    opacity: 0.4;
    visibility: ${({ cardCount }) => (cardCount > 5 ? "visible" : "hidden")};
    position: absolute;
    bottom: ${({ cardCount }) => (cardCount > 15 ? "unset" : 0)};
    top: ${({ cardCount }) => (cardCount > 15 ? "-15%" : "unset")};
    left: ${({ cardCount }) => (cardCount > 15 ? "52%" : "50%")};
    pointer-events: none;
`;
