import styled from "@emotion/styled";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import BackButton from "../components/BackButton.tsx";
import { Headline2 } from "../components/Header.tsx";
import ChooseAvatar from "../components/profile/ChooseAvatar.tsx";
import UserSettings from "../components/profile/UserSettings.tsx";
import { Stack } from "@mui/material";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export default function Profile() {
    const user = useGeneralStates((state) => state.user);

    return (
        <MenuBackgroundWrapper>
            <Stack minHeight={"100vh"} height={"100%"} pt={"20px"} justifyContent={"flex-start"}>
                <Header>
                    <Name>{user}</Name>
                    <BackButton />
                </Header>

                <UserSettings />

                <ChooseAvatar />
            </Stack>
        </MenuBackgroundWrapper>
    );
}

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    width: 1040px;
    @media (max-width: 1000px) {
        width: 96.5vw;
    }
`;

const Name = styled(Headline2)`
    font-family: "Amiga Forever Pro2", sans-serif;
`;
