import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import BackButton from "../components/BackButton.tsx";
import ChooseAvatar from "../components/profile/ChooseAvatar.tsx";
import SafetyQuestion from "../components/profile/SafetyQuestion.tsx";
import BlockedUsers from "../components/profile/BlockedUsers.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import SectionHeadline from "../components/SectionHeadline.tsx";

export default function Profile() {
    const user = useGeneralStates((state) => state.user);

    return (
        <MenuBackgroundWrapper>
            <div
                style={{
                    paddingTop: 20,
                    maxWidth: 1204,
                    minHeight: "100vh",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                }}
            >
                <SectionHeadline headline={"Profile Settings for " + user} rightElement={<BackButton />} />

                <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                    <SafetyQuestion />
                    <BlockedUsers />
                </div>

                <SectionHeadline headline={"Avatar"} />

                <ChooseAvatar />
            </div>
        </MenuBackgroundWrapper>
    );
}
