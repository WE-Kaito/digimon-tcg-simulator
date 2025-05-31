import styled from "@emotion/styled";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";
import { IconButton } from "@mui/material";
import TokenIcon from "@mui/icons-material/GeneratingTokens";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

export default function TokenButton() {
    const setTokenModal = useGameUIStates((state) => state.setTokenModal);
    const cardWidth = useGeneralStates((state) => state.cardWidth);

    return (
        <StyledIconButton onClick={() => setTokenModal(true)}>
            <TokenIcon style={{ fontSize: cardWidth / 2 }} />
        </StyledIconButton>
    );
}

const StyledIconButton = styled(IconButton)`
    grid-area: tokens;
    width: 50%;
    height: 50%;
    margin: 25%;
    transition: all 0.1s ease;
    opacity: 0.7;
    cursor: pointer;

    &:hover {
        opacity: 1;
        filter: drop-shadow(0 0 3px rgb(245, 190, 87));
    }
`;
