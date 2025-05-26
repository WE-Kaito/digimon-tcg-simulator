import { useNavigate } from "react-router-dom";
import { useSound } from "../../hooks/useSound.ts";
import styled from "@emotion/styled";
import axios from "axios";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function LogoutButton() {
    const navigate = useNavigate();

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    const me = useGeneralStates((state) => state.me);

    function handleClick() {
        playButtonClickSfx();

        axios
            .post("/api/user/logout")
            .catch(console.error)
            .then(() => me())
            .finally(() => navigate("/login"));
    }

    return (
        <StyledButton className={"button"} onClick={handleClick}>
            LOGOUT➤
        </StyledButton>
    );
}

const StyledButton = styled.button`
    height: 38px;
    width: 105px;

    font-family: "Pixel Digivolve", sans-serif;
    font-weight: bold;
    font-size: 0.9em;
    text-align: center;
    margin: 0 3px 0 0;
    letter-spacing: 2px;
    color: #e1e1e0;
    padding: 0 0 0 5px;

    border-bottom: 1px solid #131313;
    border-right: 1px solid #131313;

    cursor: pointer;
    border-radius: 0;
    background: #640c21;
    box-shadow: 3px 6px 1px 0 rgb(0, 0, 0);
    transition: all 0.15s ease;

    &:hover {
        background: #b6163c;
        transform: translateY(1px);
        box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.9);
    }

    &:focus {
        outline: none;
    }

    &:active {
        background: #c50f25;
        transform: translateY(2px);
        box-shadow: 1px 2px 1px 0 rgba(0, 0, 0, 0.8);
    }
`;
