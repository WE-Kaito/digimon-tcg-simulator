import {useStore} from "../../hooks/useStore.ts";
import {Divider, Stack, Tooltip, tooltipClasses, TooltipProps} from "@mui/material";
import ColorSpan from "./ColorSpan.tsx";
import styled from "@emotion/styled";
import {getAttributeImage, getCardTypeImage} from "../../utils/functions.ts";
import {styled as muiStyled} from "@mui/material/styles";
import {indigo} from "@mui/material/colors";
export function StyledDivider({translation}: { translation?: number }) {
    return <Divider orientation="vertical"
                    sx={{transform: `scaleY(0.75) translateY(${translation ?? 0}px)`, borderColor: "whitesmoke", width: 2}}
                    flexItem/>;
}

const CustomTooltip = muiStyled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} arrow classes={{popper: className}}/>
))(() => ({
    [`& .${tooltipClasses.arrow}`]: {color: indigo[500]},
    [`& .${tooltipClasses.tooltip}`]: {backgroundColor: indigo[500]}
}));

function TooltipContent({explanation}: { explanation: string }) {
    return (
        <span style={{fontFamily: "League Spartan", color: "ghostwhite", fontSize: "1.2rem"}}>{explanation}</span>
    )
}

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

    function getTooltipTitle(keyword: string, overflow?: string | null) {
        if (keyword === "Overflow") {
                return `As this card moves from the battle area or under a card to another area, lose ${overflow} memory.`;
        }   else return keyword;
    }

    return (
        <Wrapper>
            <FirstRowContainer aceEffect={!!aceEffect}>
                <TypeStack>
                    {!!cardType &&
                        <CustomTooltip title={<TooltipContent explanation={getTooltipTitle(cardType)}/>}>
                            <Icon width={30} alt={"cardType"} src={getCardTypeImage(cardType)}/>
                        </CustomTooltip>}
                </TypeStack>

                <ColorSpan/>

                <TypeStack>
                    {!!attribute &&
                        <CustomTooltip title={<TooltipContent explanation={getTooltipTitle(attribute)}/>}>
                            <Icon width={30} alt={"attribute"} src={getAttributeImage(attribute)}/>
                        </CustomTooltip>}
                </TypeStack>

                {!!aceEffect &&
                    <CustomTooltip title={<TooltipContent explanation={getTooltipTitle("Overflow", aceOverflow)}/>}>
                        <TypeStack>
                            <AceSpan>ACE-{aceOverflow}</AceSpan>
                        </TypeStack>
                    </CustomTooltip>}
            </FirstRowContainer>

            <TypeStack p={0}>
                {!!name && <NameSpan isLong={isNameLong}>{name}</NameSpan>}
            </TypeStack>

            <TypeStack direction="row"
                       spacing={2.5}
                       divider={<StyledDivider translation={1}/>}
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

export const AceSpan = styled.span`
  font-family: Sakana, sans-serif;
  background-image: linear-gradient(320deg, #b6b6b6, #595858);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.3rem;
  line-height: 1;
  transform: translateY(0.175rem);
`;

const NameSpan = styled.span<{ isLong: boolean }>`
  display: inline-block;
  font-family: League Spartan, sans-serif;
  font-weight: 400;
  font-size: ${({isLong}) => isLong ? "1.25rem" : "1.8rem"};
  transform: translateY(0.2rem);
  line-height: 1;
  color: ghostwhite;
`;
