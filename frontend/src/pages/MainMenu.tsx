import MainMenuButton from "../components/MainMenuButton.tsx";
import Header from "../components/Header.tsx";
import PatchnotesLink from "../components/PatchnotesLink.tsx";
import {Stack} from "@mui/material";
import SoundBar from "../components/SoundBar.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export default function MainMenu() {

    return (
        <MenuBackgroundWrapper>
            <div style={{ position: "absolute", left: 20, top: 20 }}>
                <SoundBar/>
            </div>
            <Stack gap={5}>
                <Header/>
                <MainMenuButton name={"Find game"} path={"/lobby"}/>
                <MainMenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
                <MainMenuButton name={"Profile"} path={"/profile"}/>
                <MainMenuButton name={"LOGOUT"} path={"/login"}/>
            </Stack>
            <PatchnotesLink/>
        </MenuBackgroundWrapper>
    );
}
