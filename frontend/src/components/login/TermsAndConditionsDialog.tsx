import {Button, Checkbox, DialogContent, DialogTitle} from "@mui/material";
import MenuDialog from "../MenuDialog.tsx";
import {useTutorialStates} from "../../hooks/useTutorialStates.ts";
import {useState} from "react";

export default function TermsAndConditionsDialog() {
    const [hasAcceptedRules, setHasAcceptedRules] = useTutorialStates((state) => [
        state.hasAcceptedRules, state.setHasAcceptedRules]);

    const [checked, setChecked] = useState(false);

    return (
        <MenuDialog open={!hasAcceptedRules} >
            <DialogTitle sx={{ color: "crimson", fontFamily: "League Spartan, sans-serif", fontSize: 26, textAlign: "center"}}>
                Terms of use
            </DialogTitle>
            <DialogContent sx={{ color: "ghostwhite", fontFamily: "League Spartan, sans-serif" }}>
                <p>
                    NO insults or harassment of any kind directed at other users.
                    <br />
                    NO usernames that are indicative of group hatred, abuse or any other form of encouragement of violence.
                    <br />
                    NO gossip about other users on our discord server. Please use the report function or settle things privately.
                    <br />
                    NO spamming or flooding the chat with messages.
                    <br />
                    NO sharing of links to harmful or inappropriate websites.
                    <br />
                    NO hacking, cheating, or exploiting bugs in the game.
                    <br />
                    If you can't agree on rulings, stay peaceful. You will often find helpful judges on the discord server.
                </p>
                <hr />
                <p>
                    Breaking these rules will result in a warning, a temporary ban, or a permanent ban from the game and/or the discord server.
                    <br />
                    <br />
                    This is a non-commercial fan-made project and is not affiliated with the Digimon brand or Bandai Co., Ltd.
                    The purpose of this project is to celebrate and advertise the Digimon Card Game.
                </p>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between"}}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <Checkbox sx={!checked && { svg: {color: "ghostwhite" }}} checked={checked} onChange={() => setChecked(!checked)}/>
                        <span style={{ transform: "translateY(1px)"}}>I have read and acknowledged the terms of use</span>
                    </div>
                    <Button sx={{fontWeight: 600}} variant={"outlined"} disabled={!checked} onClick={() => setHasAcceptedRules(true)}>START ››</Button>
                </div>
            </DialogContent>
        </MenuDialog>
    );
}
