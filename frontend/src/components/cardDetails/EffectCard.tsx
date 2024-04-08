import styled from "@emotion/styled";
import {Lock as SecurityIcon, CallMade as InheritedIcon} from '@mui/icons-material';
import {useLocation} from "react-router-dom";
import { JSX } from "react";
import {EffectVariant} from "./CardDetails.tsx";
import inheritArrow from "../../assets/lotties/inherit-arrow.json";
import Lottie from "lottie-react";

type Props = {
    variant: EffectVariant
    children: (JSX.Element | JSX.Element[])[]
}

export default function EffectCard({children, variant}: Props) {

    const location = useLocation();
    const inGame = location.pathname === "/game";
    const isInheritCardInfo = variant === EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS;
    // The Lottie animation causese a bug in Chrome Browser, where the whole component is blurry
    const usingChrome = /Chrome/.test(navigator.userAgent);

    return (
        <Wrapper>
            {variant !== EffectVariant.SPECIAL
                ? <EffectText inGame={inGame}>
                    <EffectHeader inherited={isInheritCardInfo}>
                        <span>{variant.toUpperCase()} {!isInheritCardInfo && "EFFECT"}</span>
                        {isInheritCardInfo && !usingChrome && <StyledLottie animationData={inheritArrow} loop={true}/>}
                        {variant === EffectVariant.SECURITY && <SecurityIcon sx={{width: 16, position: "absolute", transform: "translate(2px, -11px)"}}/>}
                        {variant === EffectVariant.INHERITED && <InheritedIcon sx={{width: 17, position: "absolute", transform: "translate(2px, -11px)"}}/>}
                    </EffectHeader>
                    <hr style={{transform: "translateY(2px)", opacity: 0.75}}/>
                    {...children}
                </EffectText>
                : <EffectText style={{padding: "3px 5px 0 5px"}} inGame={inGame}>
                    {...children}
                </EffectText>}
        </Wrapper>
    );
}

const Wrapper = styled.div`
  width: 99.25%;
  background: #0c0c0c;
  filter: drop-shadow(0 0 1px ghostwhite);
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
    filter: ${({inherited}) => inherited ? "drop-shadow(1px 1px 1px #386ff0)" : "unset"};
  }
`;

const StyledLottie = styled(Lottie)`
  position: absolute;
  width: 53px;
  left: 300px;
  top: -5px;
  transform: scaleX(1.25);
`;
