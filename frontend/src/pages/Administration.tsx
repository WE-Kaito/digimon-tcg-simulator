import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import SectionHeadline from "../components/SectionHeadline.tsx";
import BackButton from "../components/BackButton.tsx";
import BannedUsers from "../components/administration/BannedUsers.tsx";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import useQuery from "../hooks/useQuery.ts";
import { Navigate } from "react-router-dom";
import ServerMessageInput from "../components/administration/ServerMessageInput.tsx";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lotties/loading.json";

export default function Administration() {
    const user = useGeneralStates((state) => state.user);
    const { data: admins, isFetching } = useQuery<string[]>("/api/admin/admins");

    if (!isFetching && admins && !admins.includes(user)) return <Navigate to="/" />;

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
                <SectionHeadline headline={"Administration"} rightElement={<BackButton />} />

                {isFetching ? (
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Lottie animationData={loadingAnimation} loop={true} style={{ width: "50%" }} />
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <BannedUsers />
                        <ServerMessageInput />
                    </div>
                )}
            </div>
        </MenuBackgroundWrapper>
    );
}
