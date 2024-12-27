import { useState } from 'react';
import styled from "@emotion/styled";
import hackmonButton from "../../assets/hackmon-chip.png";
import { uid } from "uid";
import { List, ListItem, ListItemButton, ListItemText, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { useGame } from "../../hooks/useGame.ts";
import { tokenCollection } from "../../utils/tokens.ts";
import { CardType } from "../../utils/types.ts";
import { styled as muiStyled } from "@mui/material/styles";
import {useSound} from "../../hooks/useSound.ts";

function TokenList({ handleCreateToken, onClose }: { handleCreateToken: (token: CardType) => void; onClose: () => void; }) {
    return (
        <List sx={{ p: 0.5 }}>
            {tokenCollection.map((token) => (
                <ListItem disablePadding key={token.uniqueCardNumber}>
                    <StyledListItemButton onClick={() => { handleCreateToken(token); onClose(); }}>
                        <ListItemText primary={token.name} />
                    </StyledListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default function TokenButton({ sendTokenMessage }: { sendTokenMessage: (tokenName: string, id: string) => void; }) {
    const [isOpen, setIsOpen] = useState(false);
    const createToken = useGame((state) => state.createToken);

    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);

    function handleCreateToken(token: CardType) {
        const id = "TOKEN-" + uid();
        createToken(token, "my", id);
        sendTokenMessage(token.name, id);
        playPlaceCardSfx();
    }

    return (
        <CustomTooltip
            open={isOpen}
            onClose={() => setIsOpen(false)}
            onOpen={() => setIsOpen(true)}
            title={<TokenList handleCreateToken={handleCreateToken} onClose={() => setIsOpen(false)} />}
        >
            <StyledImg alt="create token" src={hackmonButton} />
        </CustomTooltip>
    );
}

const CustomTooltip = muiStyled(({ className, ...props }: TooltipProps & { open: boolean; onClose: () => void; onOpen: () => void; }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.arrow}`]: { color: "#f6c72e" },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#0c0c0c", borderRadius: 6, boxShadow: "inset 0 0 0 2px #f6c72e",
        filter: "drop-shadow(1px 2px 3px black)", padding: 0, minWidth: 180, maxWidth: 400,
    },
    [`& .MuiTypography-root`]: { fontFamily: "League Spartan, sans-serif", filter: "drop-shadow(0 0 3px purple)",paddingTop:5 }
}));

const StyledImg = styled.img`
  position: absolute;
  width: 50px;
  height: 50px;
  z-index: 5;
  left: 49px;
  bottom: 17px;
  transition: all 0.15s ease;
  opacity: 0.8;

  &:hover {
    opacity: 1;
    cursor: pointer;
    width: 52px;
    height: 52px;
    transform: translateX(-1px);
  }
`;

const StyledListItemButton = styled(ListItemButton)`
  padding: 1px 10px 2px 10px;
  font-family: Naston, sans-serif!important;

  &:hover {
    background: linear-gradient(90deg, transparent, rgba(224, 255, 255, 0.16) 50%, transparent);
  }

  &:active {
    background-color: rgba(100, 108, 255, 0.07);
  }
`;
