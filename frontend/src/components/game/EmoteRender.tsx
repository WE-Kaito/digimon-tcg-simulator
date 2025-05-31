import { Emote } from "../../hooks/useGameUIStates.ts";
import SadFaceIcon from "@mui/icons-material/SentimentVeryDissatisfiedTwoTone";
import WaveIcon from "@mui/icons-material/WavingHandTwoTone";
import WaitIcon from "@mui/icons-material/PanToolTwoTone";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAltTwoTone";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function EmoteRender({ emote }: { emote: Emote | null }) {
    const emoteWidth = useGeneralStates((state) => state.cardWidth);

    if (!emote) return <></>;
    if (emote === Emote.HELLO) return <WaveIcon sx={{ fontSize: emoteWidth }} />;
    if (emote === Emote.GOOD) return <ThumbUpIcon sx={{ fontSize: emoteWidth }} />;
    if (emote === Emote.WAIT) return <WaitIcon sx={{ fontSize: emoteWidth }} />;
    if (emote === Emote.BAFFLED) return <SadFaceIcon sx={{ fontSize: emoteWidth }} />;
}
