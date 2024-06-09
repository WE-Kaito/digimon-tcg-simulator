import {Tooltip, tooltipClasses, TooltipProps} from "@mui/material";
import { styled as muiStyled } from '@mui/material/styles';
import {deepOrange} from "@mui/material/colors";
import styled from "@emotion/styled";
import {JSX} from "react";

type Props = {
    keyword: string
    children: JSX.Element
}

const CustomTooltip = muiStyled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: deepOrange[100]
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: deepOrange[100],
    },
}));

function TooltipContent({explanation, url} : {explanation: string, url: string}) {
    return (
        <ContentContainer>
            {explanation + " "}
            <StyledLink href={url} target="_blank" rel="noopener noreferrer" title={"Rulings 🔗"}>🛈</StyledLink>
        </ContentContainer>
    )
}

export default function KeywordTooltip({children, keyword}: Props) {

    const preparedKeyword = keyword.replace("＜", "").replace("＞", "").split(" ")[0];
    const rulingsUrl = `https://digimoncardgame.fandom.com/wiki/${getKeywordForLink(preparedKeyword)}#Rulings`;

    return (
        <CustomTooltip title={<TooltipContent explanation={getExplanation(preparedKeyword)} url={rulingsUrl}/>}>
                {children}
        </CustomTooltip>
    );
}

function getExplanation(keyword: string) {

    if (keyword.startsWith("De-Digivolve")) return "Trash up to X cards from the top of one of your opponent's Digimon. If it has no digivolution cards, or becomes a level 3 Digimon, you can't trash any more cards."

    switch (keyword) {
        case "Blocker":
            return "When an opponent's Digimon attacks, you may suspend this Digimon to force the opponent to attack it instead.";
        case "Security":
            return "This Digimon checks X additional/fewer security card(s).";
        case "Recovery":
            return "Place the top X card(s) of your deck on top of your Security Stack.";
        case "Piercing":
            return "When this Digimon attacks and deletes an opponent's Digimon and survives the battle, it can proceed with its security check(s).";
        case "Jamming":
            return "This Digimon can't be deleted in battles against Security Digimon.";
        case "Draw":
            return "Draw X card(s) from your deck.";
        case "Digisorption":
            return "When one of your Digimon digivolves into this card from your hand, you may suspend of your 1 Digimon to reduce the memory cost of the digivolution by X.";
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
            return "Trash this card in your battle area to activate the effect below. You can't activate this effect the turn this card enters play.";
        case "Decoy":
            return "When one of your Digimon matching (X) characteristic would be deleted by an opponent’s effect, you can instead delete this Digimon to prevent that deletion.";
        case "Armor":
            return "When this Digimon would be deleted, you may trash the top card of this Digimon to prevent that deletion.";
        case "Save" :
            return "You may place this card under one of your tamers.";
        case "Material":
            return "When this Digimon would be deleted, you may place X digivolution cards from its DigiXros requirements under one of your Tamers.";
        case "Evade":
            return "When this Digimon would be deleted, you may suspend it to prevent that deletion.";
        case "Raid":
            return "When this Digimon attacks, you may switch the target of attack to 1 of your opponent's unsuspended Digimon with the highest DP.";
        case "Alliance":
            return "When this Digimon attacks, by suspending 1 of your other Digimon, add the suspended Digimon's DP to this Digimon and it gains ＜Security Attack +1＞ for the attack."
        case "Barrier":
            return "When this Digimon would be deleted in battle, by trashing the top card of your security stack, prevent that deletion.";
        case "Blast":
            return "Your Digimon may digivolve into a Digimon in your hand with this keyword without paying the cost.";
        case "Mind":
            return "Place this Tamer under 1 of your Digimon without a Tamer in its digivolution cards.";
        case "Fortitude":
            return "When this Digimon is deleted, if it had any Digivolution cards, it can be played again for no cost.";
        case "Partition":
            return "When this Digimon that has 1 of each specified cards in its digivolution cards would leave the battle area other than by your own effects or by battle, you may play 1 of each card without paying their costs.";
        case "Overclock":
            return "At the end of your turn, by deleting 1 of your tokens or 1 of your other Digimon with the [X] trait, this Digimon may attack a player without suspending."
        case "Vortex":
            return "At the end of your turn on which this Digimon was played, it may attack an opponent's Digimon."
        case "Ice":
            return "This Digimon compares its number of digivolution cards instead of DP in battles other than with security Digimon.";
        case "Collision":
            return "When this Digimon declares an attack, all of your opponent's Digimon gain ＜Blocker＞, and must block if possible.";
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
        case "Save" :
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
            return "Overclock"
        case "Vortex":
            return "Vortex"
        case "Ice":
            return "Ice_Armor"
        case "Collision":
            return "Collision"
        default:
            return "";
    }
}

const StyledLink = styled.a`
  display: inline-block;
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 800;
  text-align: right;
  transform: translateY(3px);
  color: #156cd0;
  &:hover {
    color: #14d591;
  }
`;

const ContentContainer = styled.div`
font-family: "League Spartan", sans-serif;
font-size: 1.1rem;
color: black;
`;
