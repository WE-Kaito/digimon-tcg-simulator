import styled from "@emotion/styled";
import hackmonButton from "../../assets/hackmon-chip.png";
import {uid} from "uid";
import {playPlaceCardSfx} from "../../utils/sound.ts";
import {List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import {useGame} from "../../hooks/useGame.ts";
import {tokenCollection} from "../../assets/tokens/tokens.ts";
import {CardType} from "../../utils/types.ts";

function TokenList({ handleCreateToken }: { handleCreateToken: (token: CardType) => void }) {
    return (
        <List>
            {tokenCollection.map((token) => (
                <ListItem disablePadding key={token.uniqueCardNumber}>
                    <ListItemButton onClick={() => handleCreateToken(token)}>
                        <ListItemText primary={token.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default function TokenButton({ sendTokenMessage }: { sendTokenMessage: (tokenName: string, id: string) => void }) {
    const createToken = useGame((state) => state.createToken);

    function handleCreateToken(token: CardType) {
        const id = uid();
        createToken(token, "my", id);
        sendTokenMessage(token.name, id);
        playPlaceCardSfx();
    }

    return (
        <Tooltip title={<TokenList handleCreateToken={handleCreateToken} />} >
            <StyledImg alt="create token" src={hackmonButton} />
        </Tooltip>
    );
}

const StyledImg = styled.img`
  position: absolute;
  width: 50px;
  height: 50px;
  z-index: 5;
  left: 49px;
  bottom: 17px;
  transition: all 0.15s ease;
  opacity: 0.5;

  &:hover {
    opacity: 1;
    cursor: pointer;
    width: 52px;
    height: 52px;
    transform: translateX(-1px);
  }
`;
