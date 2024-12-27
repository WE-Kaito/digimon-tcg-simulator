import styled from "@emotion/styled";
import {Lock as SecurityIcon, CallMade as InheritedIcon} from '@mui/icons-material';
import {useLocation} from "react-router-dom";
import { JSX } from "react";
import {EffectVariant} from "./constants.ts";

type Props = {
    variant: EffectVariant
    children: JSX.Element;
}

export default function EffectCard({children, variant}: Props) {
    const location = useLocation();
    const inGame = location.pathname === "/game";
    const isInheritCardInfo = variant === EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS;

    return (
        <Wrapper inherited={isInheritCardInfo}>
            {variant !== EffectVariant.SPECIAL
                ? <EffectText inGame={inGame}>
                    <EffectHeader inherited={isInheritCardInfo}>
                        <span>{variant.toUpperCase()} {!isInheritCardInfo && "EFFECT"}</span>
                        {variant === EffectVariant.SECURITY && <SecurityIcon sx={{width: 16, position: "absolute", transform: "translate(2px, -11px)"}}/>}
                        {variant === EffectVariant.INHERITED && <InheritedIcon sx={{width: 17, position: "absolute", transform: "translate(2px, -11px)"}}/>}
                    </EffectHeader>
                    <hr style={{transform: "translateY(2px)", opacity: 0.75}}/>
                    {children}
                </EffectText>
                : <EffectText style={{padding: "3px 5px 0 5px"}} inGame={inGame}>
                    {children}
                </EffectText>}
        </Wrapper>
    );
}

const Wrapper = styled.div<{ inherited: boolean }>`
  width: 99.25%;
  background: ${({inherited}) => inherited ? "linear-gradient(to right top, #0d0d0d, #0d0d0f, #0d0d11, #0d0e12, #0d0e14, #0e1018, #0e111d, #0d1321, #0c1529, #0b1731, #0b1939, #0c1a41)" : "#0c0c0c"};
  border: 1px solid rgba(248, 248, 255, 0.4);
`;

export const EffectText = styled.div<{ inGame?: boolean }>`
  font-family: League Spartan, sans-serif;
  font-weight: 300;
  font-size: ${({inGame}) => inGame ? "1.25em" : "1rem"};
  text-align: left;
  padding: 5px;

  @media (max-width: 767px) {
    font-size: ${({inGame}) => inGame ? "1.5rem" : "1rem"};
  }
`;

const EffectHeader = styled.div<{ inherited: boolean }>`
  width: 100%;
  text-align: start;
  line-height: 0.4;
  transform: translateY(0.35rem);
  position: relative;
  z-index: 2;
  span {
    font-weight: ${({inherited}) => inherited ? "400" : "unset"};
    filter: ${({inherited}) => inherited ? "drop-shadow(1px 1px 1px #2916d2)" : "unset"};
  }
`;
