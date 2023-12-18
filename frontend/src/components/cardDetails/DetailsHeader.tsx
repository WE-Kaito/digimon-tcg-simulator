import {useStore} from "../../hooks/useStore.ts";
import {Divider, Stack} from "@mui/material";
import ColorSpan from "./ColorSpan.tsx";
import styled from "@emotion/styled";
import {getAttributeImage, getCardTypeImage} from "../../utils/functions.ts";

export default function DetailsHeader() {

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const name = hoverCard?.name ?? selectedCard?.name;
    const isNameLong = Boolean(hoverCard ? (hoverCard.name?.length >= 30) : (selectedCard && (selectedCard?.name.length >= 30)));
    const cardType = hoverCard?.cardType ?? selectedCard?.cardType;
    const attribute = hoverCard?.attribute ?? (!hoverCard ? selectedCard?.attribute : null);
    const digiTypes = hoverCard?.digiType ?? (!hoverCard ? selectedCard?.digiType : null);

    const aceEffect = hoverCard?.aceEffect ?? (!hoverCard ? selectedCard?.aceEffect : null);
    const aceIndex = aceEffect?.indexOf("-") ?? -1;
    const aceOverflow = aceEffect ? aceEffect[aceIndex + 1] : null;

    return (
        <Wrapper>
            <FirstRowContainer aceEffect={!!aceEffect}>
                <TypeStack>
                    {!!cardType && <Icon width={30} alt={"cardType"} src={getCardTypeImage(cardType)}/>}
                </TypeStack>
                <ColorSpan/>
                <TypeStack>
                    {!!attribute && <Icon width={30} alt={"attribute"} src={getAttributeImage(attribute)}/>}
                </TypeStack>
                {!!aceEffect && <TypeStack><AceSpan>ACE-{aceOverflow}</AceSpan></TypeStack>}
            </FirstRowContainer>

            <TypeStack p={0}>
                {!!name && <NameSpan isLong={isNameLong}>{name}</NameSpan>}
            </TypeStack>

            <TypeStack direction="row"
                       spacing={2.5}
                       divider={<Divider orientation="vertical" sx={{transform: "scaleY(0.75) translateY(1px)", borderColor: "whitesmoke"}} flexItem/>}
            >
                {digiTypes?.map((type: string) => <TypeSpan key={type}>{type}</TypeSpan>)}
            </TypeStack>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: default;
  margin-bottom: 10px;
  gap: 7px;
`;

const FirstRowContainer = styled.div<{ aceEffect: boolean }>`
  width: 100%;
  display: grid;
  gap: 15px;
  grid-template-columns: 30px 1fr 30px ${({aceEffect}) => aceEffect ? "70px" : null};
  transform: translateX(-4px);
`;

export const StyledSpan = styled.span`
  display: inline-block;
  font-family: League Spartan, sans-serif;
  font-weight: 400;
  font-size: 1.5rem; 
  transform: translateY(0.175rem);
  line-height: 1;
  color: whitesmoke;
`;

const TypeSpan = styled(StyledSpan)`
  font-weight: 300;
  font-size: 1.25rem;
`;

export const TypeStack = styled(Stack)`
  position: relative;
  padding: 0.15rem;
  background: linear-gradient(0deg, #0d0d0d 5%, #090909 95%);
  border-radius: 5px;
  border: 1px solid rgba(248, 246, 255, 0.05) !important;
  filter: drop-shadow(1px 1px 1px #386ff0);
  width: 100% !important;
  justify-content: space-evenly !important;
`;

const Icon = styled.img`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const AceSpan = styled.span`
  font-family: Sakana, sans-serif;
  background-image: linear-gradient(320deg, #b6b6b6, #595858);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.3rem;
  line-height: 1;
  transform: translateY(0.175rem);
`;

const NameSpan = styled.span<{ isLong: boolean}>`
  display: inline-block;
  font-family: League Spartan, sans-serif;
  font-weight: 400;
  font-size: ${({isLong}) => isLong ? "1.25rem" : "1.8rem"};
  transform: translateY(0.2rem);
  line-height: 1;
  color: ghostwhite;
`;
