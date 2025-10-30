import { ReportOutlined as ReportIcon } from "@mui/icons-material";
import { WSUtils } from "../../pages/GamePage.tsx";
import { useState } from "react";
import styled from "@emotion/styled";
import ReportDialog from "./ModalDialog/ReportDialog.tsx";

type ReportButtonProps = {
    matchInfo: WSUtils["matchInfo"];
    iconFontSize: string;
};

export default function ReportButton({ matchInfo, iconFontSize }: ReportButtonProps) {
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

    const isDisabled = localStorage.getItem("isReported") === "true";

    return (
        <>
            <ReportDialog isOpen={isReportDialogOpen} setIsOpen={setIsReportDialogOpen} matchInfo={matchInfo} />
            <PanelButton
                disabled={isDisabled}
                className={"button"}
                onClick={() => setIsReportDialogOpen(true)}
                style={{ gridArea: "report", fontSize: iconFontSize, transform: "translate(-4px, 0.15em)" }}
            >
                <ReportIcon className={"button"} sx={{ fontSize: iconFontSize, color: "indianred" }} />
            </PanelButton>
        </>
    );
}

const PanelButton = styled.div<{ disabled?: boolean }>`
    width: 100%;
    height: 80%;
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-left: none;
    border-radius: 0 3px 3px 0;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5)) ${({ disabled }) => (disabled ? "grayscale(1)" : "none")};
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;

    pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};

    &:hover {
        background: rgba(26, 179, 201, 0.35);
    }
`;
