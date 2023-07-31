import takatoImage from "../assets/profile_pictures/takato.jpg";
import aibaImage from "../assets/profile_pictures/aiba.jpg";
import arataImage from "../assets/profile_pictures/arata.jpg";
import eriImage from "../assets/profile_pictures/eri.jpg";
import haruImage from "../assets/profile_pictures/haru.jpg";
import hiroImage from "../assets/profile_pictures/hiro.jpg";
import mattImage from "../assets/profile_pictures/matt.jpg";
import minoruImage from "../assets/profile_pictures/minoru.jpg";
import rinaImage from "../assets/profile_pictures/rina.jpg";
import sakiImage from "../assets/profile_pictures/saki.jpg";
import taiImage from "../assets/profile_pictures/tai.jpg";
import takumiImage from "../assets/profile_pictures/takumi.jpg";
import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import styled from "@emotion/styled";

export default function ChooseAvatar() {

    const getAvatar = useStore((state) => state.getAvatar);
    const avatarName = useStore((state) => state.avatarName);
    const setAvatar = useStore((state) => state.setAvatar);

    useEffect(() => {
        getAvatar();
    }, [getAvatar, avatarName]);

    function profilePicture(avatarName : string) {
        switch (avatarName) {
            case "takato":
                return takatoImage;
            case "aiba":
                return aibaImage;
            case "arata":
                return arataImage;
            case "eri":
                return eriImage;
            case "haru":
                return haruImage;
            case "hiro":
                return hiroImage;
            case "matt":
                return mattImage;
            case "minoru":
                return minoruImage;
            case "rina":
                return rinaImage;
            case "saki":
                return sakiImage;
            case "tai":
                return taiImage;
            case "takumi":
                return takumiImage;
            default:
                return takatoImage;
        }
    }

    function setNextAvatar(avatarName : string) {
        switch (avatarName) {
            case "takato":
                setAvatar("aiba");
                break;
            case "aiba":
                setAvatar("arata");
                break;
            case "arata":
                setAvatar("eri");
                break;
            case "eri":
                setAvatar("haru");
                break;
            case "haru":
                setAvatar("hiro");
                break;
            case "hiro":
                setAvatar("matt");
                break;
            case "matt":
                setAvatar("minoru");
                break;
            case "minoru":
                setAvatar("rina");
                break;
            case "rina":
                setAvatar("saki");
                break;
            case "saki":
                setAvatar("tai");
                break;
            case "tai":
                setAvatar("takumi");
                break;
            case "takumi":
                setAvatar("takato");
                break;
            default:
                setAvatar("takato");
                break;
        }
    }

    function setPreviousAvatar(avatarName : string) {

        switch (avatarName) {
            case "takato":
                setAvatar("takumi");
                break;
            case "aiba":
                setAvatar("takato");
                break;
            case "arata":
                setAvatar("aiba");
                break;
            case "eri":
                setAvatar("arata");
                break;
            case "haru":
                setAvatar("eri");
                break;
            case "hiro":
                setAvatar("haru");
                break;
            case "matt":
                setAvatar("hiro");
                break;
            case "minoru":
                setAvatar("matt");
                break;
            case "rina":
                setAvatar("minoru");
                break;
            case "saki":
                setAvatar("rina");
                break;
            case "tai":
                setAvatar("saki");
                break;
            case "takumi":
                setAvatar("tai");
                break;
            default:
                setAvatar("takato");
                break;
        }
    }

    return (
        <Container>
            <StyledButton style={{padding:"0px 8px 6px 0px"}} onClick={() => setPreviousAvatar(avatarName)}>{`❮`}</StyledButton>
            <StyledImage alt="avatar" src={profilePicture(avatarName)}></StyledImage>
            <StyledButton style={{padding:"0px 0px 6px 8px"}} onClick={() => setNextAvatar(avatarName)}>{`❯`}</StyledButton>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100vw;
  
    @media (max-width: 766px) {
      transform: scale(0.8)
    }
`;

const StyledImage = styled.img`
    border-radius: 50%;
`;

const StyledButton = styled.button`
  margin: 20px;
  font-size: 50px;
  height: 100px;
  color: ghostwhite;
  background: none;
  border: 1px solid ghostwhite;
  width: 100px;
  border-radius: 50%;
  transition: border 0.2s ease, filter 0.1s ease;

  :focus {
    outline: none;
  }

  :hover {
    cursor: pointer;
    border: 4px solid ghostwhite;
  }
  
  :active {
    border-width: 3px;
    filter: drop-shadow(0px 0px 2px ghostwhite);
  }

  @media (max-width: 766px) {
    border: none;
    padding: 0;
    margin: 0;
  }
`;