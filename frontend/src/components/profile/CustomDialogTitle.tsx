import Pen from "../../assets/profile_pictures/pen.tsx";
import {IconButton, DialogTitle} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styled from "@emotion/styled";

export default function CustomDialogTitle({handleOnClose, variant}: { handleOnClose: () => void, variant: "Sleeve" | "Image" }) {
    return (
        <DialogTitle sx={{ height: 0, position: "relative"}}>
            <AvatarSpan>{`Set ${variant === "Sleeve" ? variant : "deck's icon card"}:`}</AvatarSpan>
            {variant === "Sleeve" && <AvatarSpan2><Pen scale={0.285}/> Drak</AvatarSpan2>}
            <StyledIconButton onClick={handleOnClose} sx={{ right: 0 }}>
                <CloseIcon fontSize={"large"} color={"primary"}/>
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

const AvatarSpan2 = styled(AvatarSpan)`
  position: absolute;
  left: 482px;
  top: 10px;
  font-size: 18px;
`;

const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: -5px;
`;
