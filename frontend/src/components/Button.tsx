import styled from "@emotion/styled";

export const Button = styled.button`
    border-radius: 0;
    outline: 1px solid #242424;
    border: 2px solid transparent;

    border-image: linear-gradient(to bottom right, rgba(255, 255, 255, 0.7) 0%, rgba(157, 157, 157, 0.7) 100%) 1;

    width: 250px;
    height: 36px;
    background: var(--blue-button-bg);
    color: ghostwhite;
    padding: 0.5rem 1rem;
    font-family: "Frutiger", sans-serif;
    letter-spacing: 1px;

    text-shadow: 0 -2px 1px rgba(0, 0, 0, 0.25);
    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(0, 0, 0, 0.3);

    &:hover {
        color: ghostwhite;
        background: var(--blue-button-bg-hover);
    }

    &:active {
        background: var(--blue-button-bg-active);
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.6),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    &:disabled {
        background: #27292d;
        pointer-events: none;
    }

    @media (max-width: 600px) and (orientation: portrait) {
        width: 200px;
    }
    @media (max-width: 800px) and (orientation: landscape) {
        width: 200px;
    }
`;
