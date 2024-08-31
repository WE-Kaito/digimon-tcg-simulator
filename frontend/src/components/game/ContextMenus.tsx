import styled from "@emotion/styled";
import {Item, ItemParams, Menu, Separator} from "react-contexify";
import {
    AdsClick as TargetIcon, BackHand as HandIcon,
    Backspace as ClearIcon,
    Curtains as RevealIcon, DeleteForever as TrashIcon,
    LocalFireDepartment as EffectIcon, Pageview as OpenSecurityIcon, ShuffleOnOutlined as ShuffleIcon
} from "@mui/icons-material";
import {CSSProperties} from "react";
import ModifierMenu from "./ModifierMenu.tsx";
import {numbersWithModifiers} from "../../utils/functions.ts";
import {useGame} from "../../hooks/useGame.ts";
import {
    CardModifiers,
    CardTypeGame,
    FieldCardContextMenuItemProps,
    HandCardContextMenuItemProps
} from "../../utils/types.ts";
import {useStore} from "../../hooks/useStore.ts";
import "react-contexify/dist/ReactContexify.css";

type ContextMenusProps = {
    moveDeckCard: (to: string, bottomCard?: boolean) => void;
    revealHandCard: (item: ItemParams<HandCardContextMenuItemProps>) => void;
    activateEffectAnimation: (item: ItemParams<FieldCardContextMenuItemProps>) => void;
    activateTargetAnimation: (item: ItemParams<FieldCardContextMenuItemProps>) => void;
    resetModifiers: (item: ItemParams<FieldCardContextMenuItemProps>) => void;
    sendSetModifiers: (cardId: string, location: string, modifiers: CardModifiers) => void;
    handleOpenSecurity: (onOpenOrClose: "onOpen" | "onClose") => void;
    moveSecurityCard: (to: "myTrash" | "myHand", bottomCard?: boolean) => void;
    handleShuffleSecurity: () => void;
}

export default function ContextMenus(props: ContextMenusProps) {
    const {
        moveDeckCard,
        revealHandCard,
        activateTargetAnimation,
        activateEffectAnimation,
        resetModifiers,
        sendSetModifiers,
        handleOpenSecurity,
        moveSecurityCard,
        handleShuffleSecurity
    } = props;

    const selectedCard = useStore((state) => state.selectedCard);
    const cardToSend = useGame((state) => state.cardToSend);
    const contextCard = useGame((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[])?.find(card => card.id === cardToSend.id));

    const hasModifierMenu = contextCard?.cardType === "Digimon" || numbersWithModifiers.includes(String(contextCard?.cardNumber));
    const hideMenuItemStyle = hasModifierMenu ? {} : { visibility: "hidden", position: "absolute"};

    return (
        <>
            <StyledMenu id={"deckMenu"} theme="dark">
                <Item onClick={() => moveDeckCard("myReveal", true)}>Reveal Bottom Deck Card ↺</Item>
            </StyledMenu>

            <StyledMenu id={"handCardMenu"} theme="dark">
                <Item onClick={revealHandCard}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Reveal Card</span> <RevealIcon/></div>
                </Item>
            </StyledMenu>

            <StyledMenu id={"fieldCardMenu"} theme="dark">
                <Item onClick={activateEffectAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Activate Effect</span> <EffectIcon/></div>
                </Item>
                <Item onClick={activateTargetAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Target Card</span> <TargetIcon/></div>
                </Item>
                {hasModifierMenu && <Separator/>}
                <Item onClick={resetModifiers} style={(hideMenuItemStyle as CSSProperties | undefined)}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Clear Modifiers</span> <ClearIcon/></div>
                </Item>
                <ModifierMenu sendSetModifiers={sendSetModifiers}/>
            </StyledMenu>

            <StyledMenu id={"opponentCardMenu"} theme="dark">
                <Item onClick={activateTargetAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Target Card</span> <TargetIcon/></div>
                </Item>
            </StyledMenu>

            <StyledMenu id={"securityStackMenu"} theme="dark">
                <Item onClick={() => handleOpenSecurity("onOpen")}>
                    <StyledOpenSecurityIcon color={"warning"} sx={{marginRight: 1}}/>
                    Open Security Stack
                </Item>
                <Item onClick={() => moveSecurityCard("myTrash")}>
                    <div style={{position: "relative", marginRight: 8, transform: "translate(-1px, 2px)"}}>
                        <StyledTrashIcon color={"error"}/><MiniArrowSpan>▲</MiniArrowSpan>
                    </div>
                    Trash Top Card
                </Item>
                <Item onClick={() => moveSecurityCard("myTrash", true)}>
                    <div style={{position: "relative", marginRight: 8, transform: "translate(-1px, 2px)"}}>
                        <StyledTrashIcon color={"error"}/><MiniArrowSpan>▼</MiniArrowSpan>
                    </div>
                    Trash Bot Card
                </Item>
                <Item onClick={() => moveSecurityCard("myHand")}>
                    <div style={{position: "relative", marginLeft: 2, marginRight: 14}}>
                        <StyledHandIcon fontSize="inherit"/>
                        <MiniArrowSpanHand>▲</MiniArrowSpanHand>
                    </div>
                    Take Top Card
                </Item>
                <Item onClick={() => moveSecurityCard("myHand", true)}>
                    <div style={{position: "relative", marginLeft: 2, marginRight: 14}}>
                        <StyledHandIcon fontSize="inherit"/>
                        <MiniArrowSpanHand>▼</MiniArrowSpanHand>
                    </div>
                    Take Bot Card
                </Item>
                <Item onClick={handleShuffleSecurity}>
                    <StyledShuffleIcon sx={{color: "#42a5f5", fontSize: 20, marginRight: 1.6}}/>
                    Shuffle Security Stack
                </Item>
            </StyledMenu>

            {selectedCard && <StyledMenu id={"detailsImageMenu"} theme="dark">
                <Item onClick={() => window.open(selectedCard.imgUrl, '_blank')}>Open Image in new Tab ↗</Item>
            </StyledMenu>}
        </>
    );
}

export const StyledMenu = styled(Menu)`
  border: 2px solid rgba(65, 135, 211, 0.72);

  .contexify_submenu {
    background-color: transparent;
    transform: translateX(-6px);
    box-shadow: none;
  }
  .contexify_submenu-arrow {
    background: none;
  }
  .contexify_separator {
    border-bottom: 2px solid rgba(65, 135, 211, 0.72);
  }
  .contexify_item:hover {
    font-weight: 600;
  }
`;

const MiniArrowSpan = styled.span`
  position: absolute;
  left: 14px;
  top: 0;
  font-size: 10px;
  color: #646cff;
  filter: drop-shadow(0 0 2px #000000);
`;

const MiniArrowSpanHand = styled(MiniArrowSpan)`
  left: 11px;
`;

const StyledShuffleIcon = styled(ShuffleIcon)`
    border-radius: 6px;
`;

const StyledTrashIcon = styled(TrashIcon)`
    border-radius: 6px;  
    filter: drop-shadow( 0px 0px 1px var(--contexify-menu-bgColor));
`;

const StyledOpenSecurityIcon = styled(OpenSecurityIcon)`
    border-radius: 6px;
`;

const StyledHandIcon = styled(HandIcon)`
    border-radius: 8px;
    filter: drop-shadow(0px 0px 1px var(--contexify-menu-bgColor));
    transform: rotateY(180deg);
    color: #ffccbc;
`;
