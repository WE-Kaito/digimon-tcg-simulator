import styled from "@emotion/styled";
import eggIcon from "../assets/cardtype_icons/egg.png";
import digimonIcon from "../assets/cardtype_icons/gammamon.png";
import tamerIcon from "../assets/cardtype_icons/tamer.png";
import optionIcon from "../assets/cardtype_icons/option.png";

export default function DeckSelection() {
    return (
        <DeckContainer>
            <Stats>
                <StatContainer>
                    <StyledIcon src={digimonIcon} alt="Digimon: "/>
                    <StyledSpan>22</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={tamerIcon} alt="Tamer: "/>
                    <StyledSpan>22</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={optionIcon} alt="Option: "/>
                    <StyledSpan>22</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={eggIcon} alt="Egg: "/>
                    <StyledSpan>5</StyledSpan>
                </StatContainer>
            </Stats>

            <DeckList>
                <legend>[06/50]</legend>

            </DeckList>

        </DeckContainer>
    );
}

const DeckContainer = styled.div`
  background-color: rgba(40, 82, 67, 0.985);
  width: 97%;
  margin-left: 1.5%;
  margin-right: 1.5%;
  border-radius: 5px;
  height: 99.5%;
  transform: translateY(3px);
  gap: 1px;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Stats = styled.div`
  width: 100%;
  margin-top: 7px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const StatContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled.img`
  width: 55px;
  @media (max-width: 766px) {
    width: 30px;
  };
`;

const StyledSpan = styled.span`
  font-size: 25px;
  font-family: 'AwsumSans', sans-serif;
`;

const DeckList = styled.fieldset`
  width: 90%;
  height: 82.25%;
  border-radius: 5px;
`;