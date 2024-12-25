import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {getCardColor} from "../../utils/functions.ts";
import {StyledSpan, TypeStack, StyledDivider} from "./DetailsHeader.tsx";

export default function ColorSpan() {

    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const currentColors = hoverCard?.color ?? selectedCard?.color;
    const aceEffect = hoverCard?.aceEffect ?? (!hoverCard ? selectedCard?.aceEffect : null);

    return <TypeStack direction="row"
                      spacing={currentColors?.length === 3 && !!aceEffect ? 1 : 2.5}
                      divider={<StyledDivider translation={1}/>}
    >
        {currentColors?.map((color: string, index) => {

            return <div key={color + index}>
                <StyledSpan
                    style={{fontSize: "1.2rem", transform: "translateY(0.09rem)"}}>{getCardColor(color)[1]}</StyledSpan>
                <StyledSpan style={{color: getCardColor(color)[0]}}>
                    {color}
                </StyledSpan>
            </div>
        })}
    </TypeStack>

}