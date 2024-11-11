import {Button, DialogContent, DialogTitle} from "@mui/material";
import MenuDialog from "../MenuDialog.tsx";
import {useTutorialStates} from "../../hooks/useTutorialStates.ts";

export default function TermsAndConditionsDialog() {
    const [hasAcceptedRules, setHasAcceptedRules] = useTutorialStates((state) => [
        state.hasAcceptedRules, state.hasAcceptedRules]);

    return (
        <MenuDialog open={!hasAcceptedRules} >
            <DialogTitle sx={{ color: "crimson", fontFamily: "League Spartan, sans-serif", fontSize: 26, textAlign: "center"}}>
                Terms & Conditions
            </DialogTitle>
            <DialogContent sx={{ color: "ghostwhite", fontFamily: "League Spartan, sans-serif" }}>
                <ul>
                    <li>NO harrasment</li>
                    <li>NO racism dasdsafsaf  safsfsaf fsasafsa fsafsasafafsafsa</li>
                </ul>
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <Button>I accept the rules</Button>
                </div>
            </DialogContent>
        </MenuDialog>
    );
}
