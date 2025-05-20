import Card from "../../Card.tsx";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import { CSSProperties } from "react";
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
                {myHand.length > 7 && <StyledSpan>{myHand.length}</StyledSpan>}
            </Container>
        </>
    );
}

function HandCard({ card, index }: { card: CardTypeGame; index: number }) {
    const { show: showHandCardMenu } = useContextMenu({ id: "handCardMenu", props: { index } });

    const myHand = useGameBoardStates((state) => state.myHand);
    const cardWidth = useGeneralStates((state) => state.cardWidth * 1.25); // scale up the card width for hand

    const gap = 5; // gap between cards
    const maxCardSpace = cardWidth + gap;
    const maxHandWidth = maxCardSpace * 7 - gap;

    const effectiveSpacing = myHand.length <= 7 ? maxCardSpace : (maxHandWidth - cardWidth) / (myHand.length - 1);

    const currentHandWidth = cardWidth + effectiveSpacing * (myHand.length - 1);

    const offset = (maxHandWidth - currentHandWidth) / 2;

    const style: CSSProperties = {
        position: "absolute",
        left: offset + index * effectiveSpacing,
        bottom: "-15%",
        width: cardWidth,
        transition: "all 0.2s ease",
        filter: "drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.8))",
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
`;

const EyeButtonContainer = styled.div`
    grid-area: eye;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 20;
`;

const HideHandIconButton = styled.button<{ isActive: boolean; cardCount: number }>`
    position: absolute;
    right: 17%;
    bottom: ${({ cardCount }) => (cardCount > 7 ? "60%" : "15%")};
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

const StyledSpan = styled.span`
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    font-size: 20px;
    opacity: 0.4;
    position: absolute;
    bottom: -2%;
    left: -4.5%;
    pointer-events: none;
`;
