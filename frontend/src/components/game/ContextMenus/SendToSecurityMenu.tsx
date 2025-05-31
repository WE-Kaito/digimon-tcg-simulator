import arrowsAnimation from "../../../assets/lotties/arrows.json";
import { Item, Separator, Submenu } from "react-contexify";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import {
    VerticalAlignTopOutlined as TopIcon,
    VerticalAlignBottomOutlined as BottomIcon,
    VisibilityOffOutlined as FaceDownIcon,
    VisibilityOutlined as FaceUpIcon,
} from "@mui/icons-material";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { CardTypeGame } from "../../../utils/types.ts";
import { convertForLog } from "../../../utils/functions.ts";
import { useSound } from "../../../hooks/useSound.ts";
import { WSUtils } from "../../../pages/GamePage.tsx";

type SendToSecurityMenuProps = {
    wsUtils?: WSUtils;
    card?: CardTypeGame;
    location: string;
};

export default function SendToSecurityMenu({ wsUtils, card, location }: SendToSecurityMenuProps) {
    const getOpponentReady = useGameBoardStates((state) => state.getOpponentReady);
    const moveCardToStack = useGameBoardStates((state) => state.moveCardToStack);
    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);

    function sendCardToSecurityStack(topOrBottom: "Top" | "Bottom", facing: "up" | "down") {
        if (!getOpponentReady() || !card || card.id.startsWith("TOKEN")) return;

        moveCardToStack(topOrBottom, card.id, location, "mySecurity", facing);
        wsUtils?.sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" && facing === "down" ? `???…${card.id.slice(-5)}` : card.name}】﹕${convertForLog(location)} ➟ SS﹕${topOrBottom}${facing === "up" ? " (face up)" : ""}`
        );
        wsUtils?.sendMessage(
            `${wsUtils.matchInfo.gameId}:/moveCardToStack:${wsUtils.matchInfo.opponentName}:${topOrBottom}:${card.id}:${location}:mySecurity:${facing}`
        );
        playPlaceCardSfx();
    }

    return (
        <Submenu
            style={{ background: "#0c0c0c", border: "2px solid rgba(65, 135, 211, 0.72)" }}
            label={"Send to Sec. Stack"}
            arrow={<StyledLottie animationData={arrowsAnimation} />}
        >
            <Item
                onClick={() => sendCardToSecurityStack("Top", "up")}
                style={{ background: "#42001b", borderRadius: 5 }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Top (face-up)</span>{" "}
                    <span>
                        <FaceUpIcon />
                        <TopIcon />
                    </span>
                </div>
            </Item>
            <Item
                onClick={() => sendCardToSecurityStack("Bottom", "up")}
                style={{ background: "#42001b", borderRadius: 5 }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Bottom (face-up)</span>{" "}
                    <span>
                        <FaceUpIcon />
                        <BottomIcon />
                    </span>
                </div>
            </Item>
            <Separator />
            <Item onClick={() => sendCardToSecurityStack("Top", "down")}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Top (face-down)</span>{" "}
                    <span>
                        <FaceDownIcon />
                        <TopIcon />
                    </span>
                </div>
            </Item>
            <Item onClick={() => sendCardToSecurityStack("Bottom", "down")}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Bottom (face-down)</span>{" "}
                    <span>
                        <FaceDownIcon />
                        <BottomIcon />
                    </span>
                </div>
            </Item>
        </Submenu>
    );
}

const StyledLottie = styled(Lottie)`
    width: 50px;
    margin-right: 1px;
    background: none !important;
`;
