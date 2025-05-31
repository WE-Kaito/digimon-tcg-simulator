import styled from "@emotion/styled";
import { CallMade as InheritedIcon, Lock as SecurityIcon, InsertLinkRounded as LinkIcon } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { JSX } from "react";
import HighlightedKeyWords from "./HighlightedKeyWords.tsx";

export enum EffectVariant {
    MAIN = "main",
    INHERITED = "inherited",
    SECURITY = "security",
    SPECIAL = "special",
    INHERITED_FROM_DIGIVOLUTION_CARDS = "digivolution cards",
    LINK = "link",
}

type Props = {
    variant: EffectVariant;
    children: JSX.Element;
};

export function EffectCard({ children, variant }: Props) {
    const location = useLocation();
    const inGame = location.pathname === "/game";
    const isInheritCardInfo = variant === EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS;

    return (
        <Wrapper inherited={isInheritCardInfo} style={variant === EffectVariant.SPECIAL ? specialStyle : undefined}>
            {variant !== EffectVariant.SPECIAL && variant !== EffectVariant.LINK ? (
                <EffectText inGame={inGame}>
                    <EffectHeader>
                        <span>
                            {variant.toUpperCase()} {!isInheritCardInfo && "EFFECT"}
                        </span>
                        {variant === EffectVariant.SECURITY && (
                            <SecurityIcon
                                sx={{ width: 16, position: "absolute", transform: "translate(2px, -11px)" }}
                            />
                        )}
                        {variant === EffectVariant.INHERITED && (
                            <InheritedIcon
                                sx={{ width: 17, position: "absolute", transform: "translate(2px, -11px)" }}
                            />
                        )}
                        {isInheritCardInfo && (
                            <InheritedIcon
                                sx={{
                                    width: 20,
                                    position: "absolute",
                                    transform: "translate(2px, -9px) scale(-1)",
                                    filter: "drop-shadow(0 0 2px #0000ff)",
                                }}
                            />
                        )}
                    </EffectHeader>
                    <hr style={{ transform: "translateY(2px) scaleX(1.025)", opacity: 0.4 }} />
                    {children}
                </EffectText>
            ) : (
                <EffectText style={{ padding: "3px 5px 0 5px" }} inGame={inGame}>
                    {children}
                </EffectText>
            )}
        </Wrapper>
    );
}

export function RuleEffectCard({ ruleText }: { ruleText: string }) {
    const inGame = location.pathname === "/game";

    return (
        <Wrapper style={{ background: "rgba(255, 255, 255, 0.675)" }}>
            <EffectText inGame={inGame} style={{ color: "black", fontWeight: 500 }}>
                <HighlightedKeyWords text={ruleText} />
            </EffectText>
        </Wrapper>
    );
}

export function LinkEffectCard({ linkCardInfo }: { linkCardInfo: { dp: number; effect: string }[] }) {
    const totalDp = linkCardInfo.reduce((sum, card) => sum + card.dp, 0);
    const effects = linkCardInfo.map((card) => card.effect).join("\n");

    return (
        <Wrapper
            style={{
                background:
                    "linear-gradient(to right top, rgba(47,225,172,0.15) 0%, rgba(67,245,192,0.15) 20%, rgba(67,245,192,0.15) 75%, rgba(77,255, 200,0.1) 100%)",
            }}
        >
            <EffectText inGame={true}>
                <EffectHeader>
                    <span>LINKED CARDS</span>
                    <LinkIcon
                        sx={{
                            fontSize: 30,
                            position: "absolute",
                            transform: "translate(5px, -12px)",
                            filter: "drop-shadow(0 0 1px #00ff00)",
                        }}
                    />
                    <span style={{ position: "absolute", right: 0, fontWeight: "bolder" }}>{`+ ${totalDp} DP`}</span>
                </EffectHeader>
                <hr style={{ transform: "translateY(2px) scaleX(1.025)", opacity: 0.4 }} />
                <span style={{ textShadow: "0 0 3px #000000" }}>
                    <HighlightedKeyWords text={effects} />
                </span>
            </EffectText>
        </Wrapper>
    );
}

const Wrapper = styled.div<{ inherited?: boolean }>`
    width: 99.25%;
    position: relative;
    color: ghostwhite;
    background: ${({ inherited }) =>
        inherited
            ? "linear-gradient(to right top, rgba(37,170,225,0.2) 0%, rgba(57,190,255,0.2) 20%, rgba(67,190,255,0.2) 75%, rgba(67,200,250,0.15) 100%)"
            : "rgba(12, 21, 16, 0.25)"};
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-radius: 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
`;

export const EffectText = styled.div<{ inGame?: boolean }>`
    font-family:
        League Spartan,
        sans-serif;
    font-weight: 300;
    font-size: ${({ inGame }) => (inGame ? "1.25em" : "1rem")};
    text-align: left;
    padding: 5px 5px 2px 5px;

    @media (max-width: 767px) {
        font-size: ${({ inGame }) => (inGame ? "1.5rem" : "1rem")};
    }
`;

const EffectHeader = styled.div`
    width: 100%;
    text-align: start;
    line-height: 0.4;
    transform: translateY(0.35rem);
    position: relative;
    z-index: 2;
`;

export const specialStyle = {
    backgroundImage: `
    radial-gradient(circle at 0%   0%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 5%   0%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 10%  0%, rgba(0, 220, 255, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 15%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 20%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 25%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 30%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 35%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 40%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 45%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 50%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 55%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 60%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 65%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 70%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 75%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 80%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 85%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 90%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 95%  0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 100% 0%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    
    radial-gradient(circle at 0%   25%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 5%   25%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 10%  25%, rgba(0, 220, 255, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 15%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 20%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 25%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 30%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 35%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 40%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 45%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 50%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 55%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 60%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 65%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 70%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 75%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 80%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 85%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 90%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 95%  25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 100% 25%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    
    radial-gradient(circle at 0%   50%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 5%   50%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 10%  50%, rgba(0, 220, 255, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 15%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 20%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 25%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 30%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 35%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 40%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 45%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 50%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 55%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 60%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 65%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 70%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 75%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 80%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 85%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 90%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 95%  50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 100% 50%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    
    radial-gradient(circle at 0%   75%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 5%   75%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 10%  75%, rgba(0, 220, 255, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 15%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 20%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 25%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 30%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 35%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 40%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 45%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 50%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 55%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 60%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 65%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 70%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 75%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 80%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 85%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 90%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 95%  75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 100% 75%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    
    radial-gradient(circle at 0%   100%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 5%   100%, rgba(0, 255, 180, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 10%  100%, rgba(0, 220, 255, 0.125) 0%, transparent 3%),
    radial-gradient(circle at 15%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 20%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 25%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 30%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 35%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 40%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 45%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 50%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 55%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 60%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 65%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 70%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 75%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 80%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 85%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 90%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 95%  100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    radial-gradient(circle at 100% 100%, rgba(100, 255, 200, 0.1) 0%, transparent 3%),
    linear-gradient(135deg, rgba(10, 20, 25, 0.1), rgba(5, 15, 20, 0.05))
  `,
    border: "1px solid rgba(6, 164, 159, 0.55)",
    boxShadow: "inset 0 0 5px rgba(0, 255, 255, 0.25)",
    backgroundSize: "20% 20%",
};
