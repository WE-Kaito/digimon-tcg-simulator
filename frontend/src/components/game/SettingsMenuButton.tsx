import { DialogContent, DialogTitle, IconButton, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import SettingsIcon from "@mui/icons-material/SettingsSharp";
import MenuDialog from "../MenuDialog.tsx";
import ResetIcon from "@mui/icons-material/SettingsBackupRestore";
import { MuiColorInput } from "mui-color-input";
import { DetailsView, useSettingStates } from "../../hooks/useSettingStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";

export default function SettingsMenuButton({ iconFontSize }: { iconFontSize: string }) {
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    return (
        <>
            <MenuDialog onClose={() => setIsSettingsDialogOpen(false)} open={isSettingsDialogOpen} hideBackdrop>
                <StyledDialogTitle>{"Settings"}</StyledDialogTitle>
                <DialogContent>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 24,
                            alignItems: "center",
                            width: 300,
                            maxWidth: "100vw",
                            padding: 5,
                        }}
                    >
                        <BackgroundColorSettings />
                        <ControlSettings />
                        <DetailsSettings />
                        <CloseButton onClick={() => setIsSettingsDialogOpen(false)}>CLOSE</CloseButton>
                    </div>
                </DialogContent>
            </MenuDialog>

            <IconButton onClick={() => setIsSettingsDialogOpen(true)} sx={{ color: "white", opacity: 0.6 }}>
                <SettingsIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
        </>
    );
}

function DetailsSettings() {
    const details = useSettingStates((state) => state.details);
    const setDetails = useSettingStates((state) => state.setDetails);

    return (
        <Stack gap={1} flexWrap={"wrap"} justifyContent={"center"} width={"100%"}>
            <SectionSpan>Details:</SectionSpan>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div>
                    <input
                        type="radio"
                        name="details"
                        id="showAll"
                        className="button"
                        checked={details === DetailsView.DEFAULT}
                        onChange={() => setDetails(DetailsView.DEFAULT)}
                    />
                    <StyledLabel htmlFor="showAll" className="button" checked={details === DetailsView.DEFAULT}>
                        Show All (default)
                    </StyledLabel>
                </div>
                <div>
                    <input
                        type="radio"
                        name="details"
                        id="inheritedOnly"
                        className="button"
                        checked={details === DetailsView.INHERIT_OR_LINK}
                        onChange={() => setDetails(DetailsView.INHERIT_OR_LINK)}
                    />
                    <StyledLabel
                        htmlFor="inheritedOnly"
                        className="button"
                        checked={details === DetailsView.INHERIT_OR_LINK}
                    >
                        Only Show Inherited / Linked
                    </StyledLabel>
                </div>
                <div>
                    <input
                        type="radio"
                        name="details"
                        id="noImage"
                        className="button"
                        checked={details === DetailsView.NO_IMAGE}
                        onChange={() => setDetails(DetailsView.NO_IMAGE)}
                    />
                    <StyledLabel htmlFor="noImage" className="button" checked={details === DetailsView.NO_IMAGE}>
                        Don't Show Card Image
                    </StyledLabel>
                </div>
            </div>
        </Stack>
    );
}

function ControlSettings() {
    const useToggleForStacks = useSettingStates((state) => state.useToggleForStacks);
    const setUseToggleForStacks = useSettingStates((state) => state.setUseToggleForStacks);
    const setIsStackDragMode = useGameUIStates((state) => state.setIsStackDragMode);

    return (
        <Stack gap={1} flexWrap={"wrap"} justifyContent={"center"} width={"100%"}>
            <SectionSpan>Dragging card stacks:</SectionSpan>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div>
                    <input
                        type="radio"
                        name="stackDrag"
                        id="default"
                        className="button"
                        checked={!useToggleForStacks}
                        onChange={() => {
                            setUseToggleForStacks(false);
                            setIsStackDragMode(false);
                        }}
                    />
                    <StyledLabel htmlFor="default" className="button" checked={!useToggleForStacks}>
                        Icon on hover (default)
                    </StyledLabel>
                </div>
                <div>
                    <input
                        type="radio"
                        name="stackDrag"
                        id="toggle"
                        className="button"
                        checked={useToggleForStacks}
                        onChange={() => setUseToggleForStacks(true)}
                    />
                    <StyledLabel htmlFor="toggle" className="button" checked={useToggleForStacks}>
                        Toggle (rec. for mobile)
                    </StyledLabel>
                </div>
            </div>
        </Stack>
    );
}

function BackgroundColorSettings() {
    const colors = useSettingStates((state) => state.backgroundColors);
    const setColors = useSettingStates((state) => state.setBackgroundColors);
    const resetBackgroundColors = useSettingStates((state) => state.resetBackgroundColors);

    const handleChange = useMemo(
        () => (newValue: string, key: string) => setColors({ ...colors, [key]: newValue }),
        [colors]
    );

    return (
        <Stack gap={1} flexWrap={"wrap"} justifyContent={"center"} width={"100%"}>
            <SectionSpan>Background colors:</SectionSpan>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <MuiColorInputStyled value={colors.color1} onChange={(v) => handleChange(v, "color1")} format={"hex"} />
                <MuiColorInputStyled value={colors.color2} onChange={(v) => handleChange(v, "color2")} format={"hex"} />
                <MuiColorInputStyled value={colors.color3} onChange={(v) => handleChange(v, "color3")} format={"hex"} />
                <div style={{ display: "flex", gap: 5, transform: "translateX(-4px)" }}>
                    <IconButton
                        color="primary"
                        sx={{ transform: "translateY(-9px)", lineHeight: 0.5 }}
                        onClick={resetBackgroundColors}
                    >
                        <ResetIcon />
                    </IconButton>
                    <span style={{ fontFamily: "League Spartan, sans-serif", fontSize: 18, color: "ghostwhite" }}>
                        RESET
                    </span>
                </div>
            </div>
        </Stack>
    );
}

const StyledDialogTitle = styled(DialogTitle)`
    font-family:
        League Spartan,
        sans-serif;
    font-size: 24px;
    color: ghostwhite;
    margin-left: 5px;
    padding-bottom: 0;
`;

const CloseButton = styled.button`
    width: fit-content;
    height: 2.5em;
    flex-shrink: 0;
    border-radius: 0;
    background: whitesmoke;
    pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};
    font-family:
        Pixel Digivolve,
        sans-serif;
    font-size: 20px;
    color: #0c0c0c;
    box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
    transition: all 0.15s ease;

    &:hover {
        background: ghostwhite;
        transform: translateY(1px);
        filter: contrast(1.15) saturate(1.25);
        box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
    }

    &:focus {
        outline: none;
    }

    &:active {
        background: ghostwhite;
        transform: translateY(2px);
        filter: contrast(1.3) saturate(1.25);
        box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
    }
`;

const MuiColorInputStyled = styled(MuiColorInput)`
    & .MuiOutlinedInput-root {
        height: 32px;
        width: 120px;
        border: none !important;
        color: ghostwhite !important;
        padding: 4px;
        transform: translateY(-3px);
    }
`;

const SectionSpan = styled.span`
    font-family: "League Spartan", sans-serif;
    font-size: 18px;
    color: ghostwhite;
    text-decoration: underline;
`;

const StyledLabel = styled.label<{ checked?: boolean }>`
    font-family: "League Spartan", sans-serif;
    font-size: 18px;
    margin-left: 3px;
    color: ${({ checked }) => (checked ? "#386ff0" : "ghostwhite")};
    font-weight: ${({ checked }) => (checked ? "bolder" : "none")};
`;
