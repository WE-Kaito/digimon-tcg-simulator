import { IconButton, DialogTitle } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styled from "@emotion/styled";

export default function CustomDialogTitle({ handleOnClose, title }: { handleOnClose: () => void; title: string }) {
    return (
        <DialogTitle sx={{ height: 0, position: "relative" }}>
            <AvatarSpan>{title}</AvatarSpan>
            <StyledIconButton onClick={handleOnClose} sx={{ right: 0 }}>
                <CloseIcon fontSize={"large"} color={"primary"} />
            </StyledIconButton>
        </DialogTitle>
    );
}

const AvatarSpan = styled.span`
    position: absolute;
    top: 5px;
    left: 10px;
    color: #1d7dfc;
    font-size: 22px;
    font-family: Naston, sans-serif;
    transition: all 0.2s ease-in-out;
    @media (max-width: 1050px) {
        visibility: hidden;
    }
`;

const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: -5px;
`;
