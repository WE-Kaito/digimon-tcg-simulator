import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import styled from "@emotion/styled";
import {useSound} from "../../hooks/useSound.ts";
export default function ChooseDeckImage() {

    const selectedSleeveOrImage = useGeneralStates((state) => state.selectedSleeveOrImage);
    const setCardImage = useGeneralStates((state) => state.setCardImage);
    const imageUrls = useGeneralStates((state) => state.getCardImagesInDeck());
    const rows = Math.ceil(imageUrls.length / 10);
    const mobileRows = Math.ceil(imageUrls.length / 5);

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    return (
        <GridContainer rows={rows} mobileRows={mobileRows}>
            {imageUrls?.map((url, index) => {
                return <SleeveButton key={url} alt={index.toString()} src={url}
                                     chosen={selectedSleeveOrImage === url}
                                     onClick={() => {
                                         playButtonClickSfx();
                                         setCardImage(url);
                                     }}
                />
            })}
        </GridContainer>
    );
}

const GridContainer = styled.div<{rows: number, mobileRows: number}>`
  width: fit-content;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(10, 73px);
  grid-template-rows: repeat(${({rows}) => rows}, 97px);
  gap: 2px;
  position: relative;
  padding: 3px;
  margin: 8px;
  border: 1px solid #1d7dfc;
  border-radius: 5px;
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }
  
  ::-webkit-scrollbar {
    width: 3px;
    background: rgba(139, 200, 255, 0.5);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: #1e77ea;
    border-radius: 3px;
  }

  @media (max-width: 1050px) {
    grid-template-columns: repeat(5, 50px);
    grid-template-rows: repeat(${({mobileRows}) => mobileRows}, 65px);
    gap: 1px;
    padding: 2px;
    margin: 10px 2px 0 2px;
    max-width: 97.24vw;
    overflow-y: hidden;
    overflow-x: scroll;
  }
`;

const SleeveButton = styled.img<{chosen: boolean}>`
  width: 73px;
  height: 97px;
  opacity: ${({chosen}) => chosen ? "1" : "0.4"};
  background: ${({chosen}) => chosen ? "ghostwhite" : "none"};
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease-in-out;
  :hover {
    width: 79px;
    height: 105px;
    opacity: 1;
    z-index: 100;
    filter: drop-shadow(0 0 5px #57a0ff);
    transform: translate(-4px, -6px);
  }
  @media (max-width: 1050px) {
    width: 50px;
    height: 65px;
    :hover {
      width: 50px;
      height: 65px;
      transform: translate(-1px, -1px);
    }
  }
`;
