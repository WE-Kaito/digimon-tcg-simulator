import styled from "@emotion/styled";
import {Lock as SecurityIcon, CallMade as InheritedIcon} from '@mui/icons-material';
import {useLocation} from "react-router-dom";

type Props = {
    variant: "main" | "inherited" | "security" | "special"
    children: (JSX.Element | JSX.Element[])[]
}

export default function EffectCard({children, variant}: Props) {

    const location = useLocation();
    const inGame = location.pathname === "/game";

    return (
        <Wrapper>
            {variant !== "special"
                ? <EffectText inGame={inGame}>
                    <EffectHeader>
                        {variant.toUpperCase()} EFFECT
                        {variant === "security"
                            ? <SecurityIcon sx={{width: 16, position: "absolute", transform: "translate(2px, -11px)"}}/>
                            : variant === "inherited"
                                ? <InheritedIcon
                                    sx={{width: 17, position: "absolute", transform: "translate(2px, -11px)"}}/>
                                : null}
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

const EffectHeader = styled.div`
  width: 100%;
  text-align: start;
  line-height: 0.4;
  transform: translateY(0.35rem);
`;
