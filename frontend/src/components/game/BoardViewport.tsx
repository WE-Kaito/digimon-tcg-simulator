import styled from "@emotion/styled";

// Fit the full 35 × 20 board beside the details panel using whichever
// viewport dimension is limiting. Leave vertical room for raised hand cards.
// Dynamic height also follows mobile chrome.
export const Container = styled.div`
    --details-width: min(350px, 20vw);
    --board-width: min(calc(100vw - var(--details-width) - 13px), calc((100dvh - 8px) * 1.65));
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    box-sizing: border-box;
    padding: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    overflow: hidden;
`;

export const DetailsContainer = styled.div`
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    flex: 0 0 var(--details-width);
    min-width: 0;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    > * {
        flex-shrink: 0;
        max-width: 100%;
    }
`;

export const CardImg = styled.img`
    width: calc(100% - 10px);
    border-radius: 3.5%;
    aspect-ratio: 5 / 7;
    object-fit: contain;
    z-index: 1000;
`;

export const BoardLayout = styled.div`
    position: relative;
    align-self: flex-end;
    /* The enlarged hand extends below the last grid row. Reserve only its
       overhang instead of leaving half the unused viewport below the board. */
    margin-bottom: calc(var(--board-width) * 0.018);
    flex: 0 0 var(--board-width);
    width: var(--board-width);
    aspect-ratio: 35 / 20;
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(35, minmax(0, 1fr));
    grid-template-rows: repeat(20, minmax(0, 1fr));
    container-type: inline-size;
    container-name: board-layout;
    > * {
        min-width: 0;
        min-height: 0;
        font-size: 1.14cqw;
    }
`;
