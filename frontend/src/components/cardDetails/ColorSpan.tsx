import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { getCardColor } from "../../utils/functions.ts";
import styled from "@emotion/styled";

export default function ColorSpan() {
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const currentColors = hoverCard?.color ?? selectedCard?.color;

    return (
        <div style={{ display: "flex", background: "goldenrod", width: "100%" }}>
            {currentColors?.map((color: string, index) => {
                return (
                    <div
                        key={color + index}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: getCardColor(color)[0],
                            textShadow: getCardColor(color)[1] === "black" ? undefined : "0 0 3px #000000",
                        }}
                    >
                        <StyledSpan style={{ color: getCardColor(color)[1] }}>{color}</StyledSpan>
                    </div>
                );
            })}
        </div>
    );
}

const StyledSpan = styled.span`
    display: inline-block;
    font-family:
        League Spartan,
        sans-serif;
    font-weight: 400;
    font-size: 1.5rem;
    transform: translateY(0.175rem);
    line-height: 1;
    color: whitesmoke;
`;
