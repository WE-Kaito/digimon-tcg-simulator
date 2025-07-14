// import { useDroppable } from "@dnd-kit/core";
import { useDroppableReactDnd } from "../../../hooks/useDroppableReactDnd.ts";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import { getSleeve } from "../../../utils/sleeves.ts";
import { generalToken } from "../../../utils/tokens.ts";

export default function SecurityDropSections() {
    const { setNodeRef: dropTopFaceUpRef, isOver: isOverTopFaceUp } = useDroppableReactDnd({
        id: "mySecurity_top_faceUp",
        data: { accept: ["card"] },
    });
    const { setNodeRef: dropTopFaceDownRef, isOver: isOverTopFaceDown } = useDroppableReactDnd({
        id: "mySecurity_top_faceDown",
        data: { accept: ["card"] },
    });
    const { setNodeRef: dropBottomFaceDownRef, isOver: isOverBottomFaceDown } = useDroppableReactDnd({
        id: "mySecurity_bot_faceDown",
        data: { accept: ["card"] },
    });
    const { setNodeRef: dropBottomFaceUpRef, isOver: isOverBottomFaceUp } = useDroppableReactDnd({
        id: "mySecurity_bot_faceUp",
        data: { accept: ["card"] },
    });

    const width = useGeneralStates((state) => state.cardWidth) / 2.5;
    const height = width * (7 / 5); // prevents breaking layout

    const mySleeve = useGameBoardStates((state) => state.mySleeve);

    return (
        <>
            <DropSectionTopFaceUp ref={dropTopFaceUpRef as any} isOver={isOverTopFaceUp}>
                <img alt="top face up" src={generalToken.imgUrl} width={width} height={height} />
            </DropSectionTopFaceUp>
            <DropSectionTopFaceDown ref={dropTopFaceDownRef as any} isOver={isOverTopFaceDown}>
                <img alt="top face down" src={getSleeve(mySleeve)} width={width} height={height} />
            </DropSectionTopFaceDown>
            <DropSectionBottomFaceDown ref={dropBottomFaceDownRef as any} isOver={isOverBottomFaceDown}>
                <img alt="bottom face down" src={getSleeve(mySleeve)} width={width} height={height} />
            </DropSectionBottomFaceDown>
            <DropSectionBottomFaceUp ref={dropBottomFaceUpRef as any} isOver={isOverBottomFaceUp}>
                <img alt="bottom face up" src={generalToken.imgUrl} width={width} height={height} />
            </DropSectionBottomFaceUp>
        </>
    );
}

const DropSection = styled.div<{ isOver: boolean }>`
    border-radius: 2px;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(250, 250, 250, 0.2);
    opacity: ${({ isOver }) => (isOver ? 1 : 0)};
`;

const DropSectionTopFaceUp = styled(DropSection)`
    grid-area: SS-TFU;

    &:after {
        content: "➧";
        color: #e7e7e7;
        position: absolute;
        right: -5px;
        top: 0;
        font-size: 1.25em;
    }
`;

const DropSectionTopFaceDown = styled(DropSection)`
    grid-area: SS-TFD;

    &:after {
        content: "➧";
        color: #e7e7e7;
        position: absolute;
        left: -5px;
        top: 0;
        transform: scaleX(-1);
        font-size: 1.25em;
    }
`;

const DropSectionBottomFaceDown = styled(DropSection)`
    grid-area: SS-BFD;

    &:after {
        content: "➧";
        color: #e7e7e7;
        position: absolute;
        left: -5px;
        bottom: 0;
        transform: scaleX(-1);
        font-size: 1.25em;
    }
`;

const DropSectionBottomFaceUp = styled(DropSection)`
    grid-area: SS-BFU;

    &:after {
        content: "➧";
        color: #e7e7e7;
        position: absolute;
        right: -5px;
        bottom: 0;
        font-size: 1.25em;
    }
`;
