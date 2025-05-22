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
    const preparedKeyword = keyword.replace("＜", "").replace("＞", "").split(" ")[0];
    const rulingsUrl = `https://digimoncardgame.fandom.com/wiki/${getKeywordForLink(preparedKeyword)}#Rulings`;

    return (
        <CustomTooltip title={<TooltipContent explanation={getExplanation(preparedKeyword)} url={rulingsUrl} />}>
            {children}
        </CustomTooltip>
    );
}

function getExplanation(keyword: string) {
    if (keyword.startsWith("De-Digivolve"))
        return "Trash up to X cards from the top of one of your opponent's Digimon. If it has no digivolution cards, or becomes a level 3 Digimon, you can't trash any more cards.";

    switch (keyword) {
        case "Blocker":
            return "This Digimon can block in the blocker timing";
        case "Security":
            return "This Digimon checks X additional/fewer security card(s).";
        case "Recovery":
            return "Place the top X card(s) of your deck on top of your Security Stack.";
        case "Piercing":
            return "When this Digimon attacks and deletes your opponent's Digimon in battle, it checks security before the attack ends.";
        case "Jamming":
            return "This Digimon can't be deleted in battles against Security Digimon.";
        case "Draw":
            return "Draw X card(s) from your deck.";
        case "Digisorption":
            return "When this card in your hand would be digivolved into, by suspending 1 of your Digimon, reduce the digivolution cost by X";
        case "Reboot":
            return "Unsuspend this Digimon during your opponent's unsuspend phase.";
        case "Retaliation":
            return "When this Digimon is deleted after losing a battle, delete the Digimon it was battling.";
        case "Digi-Burst":
            return "Trash X of this Digimon's digivolution cards to activate the effect below.";
        case "Rush":
            return "This Digimon can attack the turn it comes into play.";
        case "Blitz":
            return "This Digimon can attack when your opponent has 1 or more memory.";
        case "Delay":
            return "After this card is placed, by trashing it next turn or later, activate the effect below.";
        case "Decoy":
            return "When your opponent's effects would delete any of your other X Digimon, by deleting this Digimon, 1 of those Digimon isn't deleted.";
        case "Armor":
            return "When this Digimon would be deleted, you may trash the top card of this Digimon to prevent that deletion.";
        case "Save":
            return "You may place this card under one of your tamers.";
        case "Material":
            return "When this Digimon would be deleted, you may place X digivolution cards from its DigiXros requirements under one of your Tamers.";
        case "Evade":
            return "When this Digimon would be deleted, you may suspend it to prevent that deletion.";
        case "Raid":
            return "When this Digimon attacks, you may switch the target of attack to 1 of your opponent's unsuspended Digimon with the highest DP.";
        case "Alliance":
            return "When this Digimon attacks, by suspending 1 of your other Digimon, add the suspended Digimon's DP to this Digimon and it gains ＜Security Attack +1＞ for the attack.";
        case "Barrier":
            return "When this Digimon would be deleted in battle, by trashing the top card of your security stack, prevent that deletion.";
        case "Blast":
            return "Your Digimon may digivolve into this card without paying the cost.";
        case "Mind":
            return "Place this Tamer under 1 of your Digimon without a Tamer in its digivolution cards.";
        case "Fortitude":
            return "When this Digimon with Digivolution cards is deleted, play this card without paying the cost.";
        case "Scapegoat":
            return "When this Digimon would be deleted other than by one of your effects, by deleting 1 of your other Digimon, prevent that deletion";
        case "Partition":
            return "When this Digimon that has 1 of each specified cards in its digivolution cards would leave the battle area other than by your own effects or by battle, you may play 1 of each card without paying their costs.";
        case "Overclock":
            return "At the end of your turn, by deleting 1 of your tokens or 1 of your other [X] trait Digimon, this Digimon attacks a player without suspending.";
        case "Vortex":
            return "At the end of your turn, this Digimon may attack an opponent's Digimon. With this effect it can attack the turn it was played.";
        case "Ice":
            return "Other than against Security Digimon, compare the number of digivolution cards instead of DP in this Digimon's battles.";
        case "Collision":
            return "During this Digimon's attack, all of your opponent's Digimon gain ＜Blocker＞, and the opponent blocks if able.";
        case "Fragment":
            return "When this Digimon would be deleted, by trashing any X of its digivolution cards, it isn't deleted.";
        case "Execute":
            return "At the end of the turn, this Digimon may attack. At the end of that attack, delete this Digimon. Your opponent's unsuspended Digimon can also be attacked with this effect.";
        case "Decode":
            return "When this Digimon would leave the battle area other than in battle, you may play 1 specified Digimon card from its digivolution cards without paying the cost.";
        case "Progress":
            return "While attacking, your opponent's effects don't affect this Digimon.";
        case "Link":
            return "Add X to this Digimon's maximum links.";
        case "Training":
            return "In the main phase, by suspending this Digimon, place your deck's top card face down as this Digimon's bottom digivolution card. This effect can also activate in the breeding area.";
        default:
            return "";
    }
}

function getKeywordForLink(keyword: string) {
    switch (keyword) {
        case "Blocker":
            return "Blocker";
        case "Security":
            return "Security_Attack";
        case "Recovery":
            return "Recovery";
        case "Piercing":
            return "Piercing";
        case "Jamming":
            return "Jamming";
        case "Draw":
            return "Draw";
        case "Digisorption":
            return "Digisorption";
        case "Reboot":
            return "Reboot";
        case "De-Digivolve":
            return "De-Digivolve";
        case "Retaliation":
            return "Retaliation";
        case "Digi-Burst":
            return "Digi-Burst";
        case "Rush":
            return "Rush";
        case "Blitz":
            return "Blitz";
        case "Delay":
            return "Delay";
        case "Decoy":
            return "Decoy";
        case "Armor":
            return "Armor_Purge";
        case "Save":
            return "Save";
        case "Material":
            return "Material_Save";
        case "Evade":
            return "Evade";
        case "Raid":
            return "Raid";
        case "Alliance":
            return "Alliance";
        case "Barrier":
            return "Barrier";
        case "Blast":
            return "Blast_Digivolve";
        case "Mind":
            return "Mind_Link";
        case "Fortitude":
            return "Fortitude";
        case "Partition":
            return "Partition";
        case "Overclock":
            return "Overclock";
        case "Vortex":
            return "Vortex";
        case "Ice":
            return "Ice_Armor";
        case "Collision":
            return "Collision";
        case "Fragment":
            return "Fragment";
        case "Execute":
            return "Execute";
        case "Decode":
            return "Decode";
        case "Progress":
            return "Progress";
        case "Link":
            return "Link";
        case "Training":
            return "Training";
        default:
            return "";
    }
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
