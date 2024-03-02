import MenuButton from "../components/MenuButton.tsx";
import Header from "../components/Header.tsx";
import PatchnotesAndDisclaimer from "../components/PatchnotesAndDisclaimer.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import {Stack} from "@mui/material";

export default function MainMenu() {

    return (
        <MenuBackgroundWrapper>
            <Stack gap={5}>
                <Header/>
                <MenuButton name={"Find game"} path={"/lobby"}/>
                <MenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
                <MenuButton name={"Profile"} path={"/profile"}/>
                <MenuButton name={"LOGOUT"} path={"/login"}/>
            </Stack>
            <PatchnotesAndDisclaimer/>
        </MenuBackgroundWrapper>
    );
}
