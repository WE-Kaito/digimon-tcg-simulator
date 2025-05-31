import { Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { styled as muiStyled } from "@mui/material/styles";
import { deepOrange } from "@mui/material/colors";
import styled from "@emotion/styled";
import { JSX } from "react";

type Props = {
    keyword: string;
    children: JSX.Element;
};

const CustomTooltip = muiStyled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: deepOrange[100],
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: deepOrange[100],
    },
}));

function TooltipContent({ explanation, url }: { explanation: string; url: string }) {
    return (
        <ContentContainer>
            {explanation + " "}
            <StyledLink href={url} target="_blank" rel="noopener noreferrer">
                ℹ️ Rulings
            </StyledLink>
        </ContentContainer>
    );
}

export default function KeywordTooltip({ children, keyword }: Props) {
    const preparedKeyword = keyword.replace("＜", "").replace("＞", "");
    const rulingsUrl = `https://digimoncardgame.fandom.com/wiki/${getKeywordForLink(preparedKeyword)}#Rulings`;

    return (
        <CustomTooltip title={<TooltipContent explanation={getExplanation(preparedKeyword)} url={rulingsUrl} />}>
            {children}
        </CustomTooltip>
    );
}

function getExplanation(keyword: string) {
    if (keyword.startsWith("Blocker")) return "This Digimon can block in the blocker timing";
    if (keyword.startsWith("Security")) return "This Digimon checks X additional/fewer security card(s).";
    if (keyword.startsWith("Recovery")) return "Place the top X card(s) of your deck on top of your Security Stack.";
    if (keyword.startsWith("Piercing"))
        return "When this Digimon attacks and deletes your opponent's Digimon in battle, it checks security before the attack ends.";
    if (keyword.startsWith("Jamming")) return "This Digimon can't be deleted in battles against Security Digimon.";
    if (keyword.startsWith("Draw")) return "Draw X card(s) from your deck.";
    if (keyword.startsWith("Digisorption"))
        return "When this card in your hand would be digivolved into, by suspending 1 of your Digimon, reduce the digivolution cost by X";
    if (keyword.startsWith("Reboot")) return "Unsuspend this Digimon during your opponent's unsuspend phase.";
    if (keyword.startsWith("De-Digivolve"))
        return "Trash up to X cards from the top of one of your opponent's Digimon. If it has no digivolution cards, or becomes a level 3 Digimon, you can't trash any more cards.";
    if (keyword.startsWith("Retaliation"))
        return "When this Digimon is deleted after losing a battle, delete the Digimon it was battling.";
    if (keyword.startsWith("Digi-Burst"))
        return "Trash X of this Digimon's digivolution cards to activate the effect below.";
    if (keyword.startsWith("Rush")) return "This Digimon can attack the turn it comes into play.";
    if (keyword.startsWith("Blitz")) return "This Digimon can attack when your opponent has 1 or more memory.";
    if (keyword.startsWith("Delay"))
        return "After this card is placed, by trashing it next turn or later, activate the effect below.";
    if (keyword.startsWith("Decoy"))
        return "When your opponent's effects would delete any of your other X Digimon, by deleting this Digimon, 1 of those Digimon isn't deleted.";
    if (keyword.startsWith("Armor"))
        return "When this Digimon would be deleted, you may trash the top card of this Digimon to prevent that deletion.";
    if (keyword.startsWith("Save")) return "You may place this card under one of your tamers.";
    if (keyword.startsWith("Material"))
        return "When this Digimon would be deleted, you may place X digivolution cards from its DigiXros requirements under one of your Tamers.";
    if (keyword.startsWith("Evade"))
        return "When this Digimon would be deleted, you may suspend it to prevent that deletion.";
    if (keyword.startsWith("Raid"))
        return "When this Digimon attacks, you may switch the target of attack to 1 of your opponent's unsuspended Digimon with the highest DP.";
    if (keyword.startsWith("Alliance"))
        return "When this Digimon attacks, by suspending 1 of your other Digimon, add the suspended Digimon's DP to this Digimon and it gains ＜Security Attack +1＞ for the attack.";
    if (keyword.startsWith("Barrier"))
        return "When this Digimon would be deleted in battle, by trashing the top card of your security stack, prevent that deletion.";
    if (keyword.startsWith("Blast DNA")) return "Your Digimon may digivolve into this card without paying the cost.";
    if (keyword.startsWith("Blast")) return "Your Digimon may digivolve into this card without paying the cost.";
    if (keyword.startsWith("Mind"))
        return "Place this Tamer under 1 of your Digimon without a Tamer in its digivolution cards.";
    if (keyword.startsWith("Fortitude"))
        return "When this Digimon with Digivolution cards is deleted, play this card without paying the cost.";
    if (keyword.startsWith("Partition"))
        return "When this Digimon that has 1 of each specified cards in its digivolution cards would leave the battle area other than by your own effects or by battle, you may play 1 of each card without paying their costs.";
    if (keyword.startsWith("Overclock"))
        return "At the end of your turn, by deleting 1 of your tokens or 1 of your other [X] trait Digimon, this Digimon attacks a player without suspending.";
    if (keyword.startsWith("Vortex"))
        return "At the end of your turn, this Digimon may attack an opponent's Digimon. With this effect it can attack the turn it was played.";
    if (keyword.startsWith("Ice"))
        return "Other than against Security Digimon, compare the number of digivolution cards instead of DP in this Digimon's battles.";
    if (keyword.startsWith("Collision"))
        return "During this Digimon's attack, all of your opponent's Digimon gain ＜Blocker＞, and the opponent blocks if able.";
    if (keyword.startsWith("Fragment"))
        return "When this Digimon would be deleted, by trashing any X of its digivolution cards, it isn't deleted.";
    if (keyword.startsWith("Execute"))
        return "At the end of the turn, this Digimon may attack. At the end of that attack, delete this Digimon. Your opponent's unsuspended Digimon can also be attacked with this effect.";
    if (keyword.startsWith("Decode"))
        return "When this Digimon would leave the battle area other than in battle, you may play 1 specified Digimon card from its digivolution cards without paying the cost.";
    if (keyword.startsWith("Progress")) return "While attacking, your opponent's effects don't affect this Digimon.";
    if (keyword.startsWith("Link")) return "Add X to this Digimon's maximum links.";
    if (keyword.startsWith("Training"))
        return "In the main phase, by suspending this Digimon, place your deck's top card face down as this Digimon's bottom digivolution card. This effect can also activate in the breeding area.";
    if (keyword.startsWith("Scapegoat"))
        return "When this Digimon would be deleted other than by one of your effects, by deleting 1 of your other Digimon, prevent that deletion";
    return "";
}

function getKeywordForLink(keyword: string) {
    if (keyword.startsWith("Blocker")) return "Blocker";
    if (keyword.startsWith("Security")) return "Security_Attack";
    if (keyword.startsWith("Recovery")) return "Recovery";
    if (keyword.startsWith("Piercing")) return "Piercing";
    if (keyword.startsWith("Jamming")) return "Jamming";
    if (keyword.startsWith("Draw")) return "Draw";
    if (keyword.startsWith("Digisorption")) return "Digisorption";
    if (keyword.startsWith("Reboot")) return "Reboot";
    if (keyword.startsWith("De-Digivolve")) return "De-Digivolve";
    if (keyword.startsWith("Retaliation")) return "Retaliation";
    if (keyword.startsWith("Digi-Burst")) return "Digi-Burst";
    if (keyword.startsWith("Rush")) return "Rush";
    if (keyword.startsWith("Blitz")) return "Blitz";
    if (keyword.startsWith("Delay")) return "Delay";
    if (keyword.startsWith("Decoy")) return "Decoy";
    if (keyword.startsWith("Armor")) return "Armor_Purge";
    if (keyword.startsWith("Save")) return "Save";
    if (keyword.startsWith("Material")) return "Material_Save";
    if (keyword.startsWith("Evade")) return "Evade";
    if (keyword.startsWith("Raid")) return "Raid";
    if (keyword.startsWith("Alliance")) return "Alliance";
    if (keyword.startsWith("Barrier")) return "Barrier";
    if (keyword.startsWith("Blast DNA")) return "Blast_DNA_Digivolve";
    if (keyword.startsWith("Blast")) return "Blast_Digivolve";
    if (keyword.startsWith("Mind")) return "Mind_Link";
    if (keyword.startsWith("Fortitude")) return "Fortitude";
    if (keyword.startsWith("Partition")) return "Partition";
    if (keyword.startsWith("Overclock")) return "Overclock";
    if (keyword.startsWith("Vortex")) return "Vortex";
    if (keyword.startsWith("Ice")) return "Ice_Armor";
    if (keyword.startsWith("Collision")) return "Collision";
    if (keyword.startsWith("Fragment")) return "Fragment";
    if (keyword.startsWith("Execute")) return "Execute";
    if (keyword.startsWith("Decode")) return "Decode";
    if (keyword.startsWith("Progress")) return "Progress";
    if (keyword.startsWith("Link")) return "Link";
    if (keyword.startsWith("Training")) return "Training";
    if (keyword.startsWith("Scapegoat")) return "Scapegoat";
    return "";
}

const StyledLink = styled.a`
    display: flex;
    align-items: center;
    width: fit-content;
    height: 20px;
    font-weight: 500;
    color: ghostwhite;
    border: 1px solid rgb(22, 171, 255);
    background: rgb(56, 111, 240);
    box-shadow: inset 5px 5px 5px 5px rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    padding: 3px 3px 1px 0;

    span {
        pointer-events: none;
    }

    &:hover {
        color: ghostwhite;
        background: rgb(56, 111, 240);
        border: 1px solid rgb(22, 171, 255);
    }
`;

const ContentContainer = styled.div`
    font-family: "League Spartan", sans-serif;
    font-size: 1.1rem;
    color: black;
`;
