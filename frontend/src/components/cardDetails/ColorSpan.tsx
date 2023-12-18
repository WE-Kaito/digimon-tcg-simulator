import {useStore} from "../../hooks/useStore.ts";
import {getCardColor} from "../../utils/functions.ts";
import {Divider} from "@mui/material";
import { StyledSpan, TypeStack } from "./DetailsHeader.tsx";

export default function ColorSpan() {

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const currentColors = hoverCard?.color ?? selectedCard?.color;
    const aceEffect = hoverCard?.aceEffect ?? (!hoverCard ? selectedCard?.aceEffect : null);

    return <TypeStack direction="row"
                  spacing={currentColors?.length === 3 && !!aceEffect ? 1 : 2.5}
                  divider={<Divider orientation="vertical" sx={{transform: "scaleY(0.75)", borderColor: "whitesmoke"}} flexItem/>}
    >
        {currentColors?.map((color: string) => {

            return <div>
                <StyledSpan style={{fontSize: "1.2rem", transform: "translateY(0.09rem)"}}>{getCardColor(color)[1]}</StyledSpan>
                <StyledSpan style={{color: getCardColor(color)[0]}}>
                 {color}
            </StyledSpan></div>
        })}
    </TypeStack>

}