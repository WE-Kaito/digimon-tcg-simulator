import styled from "@emotion/styled";
import noiseBG from "../../assets/noiseBG.png";
import {getAttributeImage, getCardTypeImage} from "../../utils/functions.ts";
import cardBackSrc from "../../assets/cardBack.jpg";
import suspendedAnimation from "../../assets/lotties/square-sparkle-apng.png";

export default function GameBackground() {
    const color1 = localStorage.getItem("color1") ?? "#214d44";
    const color2 = localStorage.getItem("color2") ?? "#0b3d65";
    const color3 = localStorage.getItem("color3") ?? "#522170";

    return (
        <>
            {/* Workaround to preload asset images: */}
            <div style={{position: "absolute", pointerEvents: "none", visibility: "hidden"}}>
                <img width={30} alt={"cardType1"} src={getCardTypeImage("Digimon")}/>
                <img width={30} alt={"cardType2"} src={getCardTypeImage("Option")}/>
                <img width={30} alt={"cardType3"} src={getCardTypeImage("Tamer")}/>
                <img width={30} alt={"cardType4"} src={getCardTypeImage("DigiEgg")}/>

                <img width={30} alt={"attribute1"} src={getAttributeImage("Virus")}/>
                <img width={30} alt={"attribute2"} src={getAttributeImage("Data")}/>
                <img width={30} alt={"attribute3"} src={getAttributeImage("Vaccine")}/>
                <img width={30} alt={"attribute4"} src={getAttributeImage("Free")}/>
                <img width={30} alt={"attribute5"} src={getAttributeImage("Variable")}/>
                <img width={30} alt={"attribute6"} src={getAttributeImage("Unknown")}/>
                <img width={30} alt={"attribute7"} src={suspendedAnimation}/>
                <img width={30} alt={"attribute8"} src={cardBackSrc}/>
            </div>

            <BackGroundPattern/>
            <BackGround color1={color1} color2={color2} color3={color3}/>
        </>
    );
}

const BackGround = styled.div<{ color1: string, color2: string, color3: string }>`
  position: fixed;
  z-index: -10;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  background: linear-gradient(253deg, ${({color1}) => color1}, ${({color2}) => color2}, ${({color3}) => color3});
  background-size: 200% 200%;
  -webkit-animation: Background 25s ease infinite;
  -moz-animation: Background 25s ease infinite;
  animation: Background 25s ease infinite;
  
  @-webkit-keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }

  @-moz-keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }

  @keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }
`;

const BackGroundPattern = styled.div`
  position: fixed;
  top: -50vh;
  left: -50vw;
  width: 200vw;
  height: 200vh;
  background: transparent url(${noiseBG}) repeat 0 0;
  animation: bg-animation .2s infinite;
  opacity: .4;
  z-index: 0;
  overflow: hidden;

  @keyframes bg-animation {
    0% {
      transform: translate(0, 0)
    }
    10% {
      transform: translate(-1%, -1%)
    }
    20% {
      transform: translate(-2%, 1%)
    }
    30% {
      transform: translate(1%, -2%)
    }
    40% {
      transform: translate(-1%, 3%)
    }
    50% {
      transform: translate(-2%, 1%)
    }
    60% {
      transform: translate(3%, 0)
    }
    70% {
      transform: translate(0, 2%)
    }
    80% {
      transform: translate(-3%, 0)
    }
    90% {
      transform: translate(2%, 1%)
    }
    100% {
      transform: translate(1%, 0)
    }
  }
`;
