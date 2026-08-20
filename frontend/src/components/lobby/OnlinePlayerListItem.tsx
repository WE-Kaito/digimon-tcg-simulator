import styled from "@emotion/styled";

type OnlinePlayerListItemProps = {
    name: string;
    status: string;
};

export default function OnlinePlayerListItem({ name, status }: OnlinePlayerListItemProps) {
    return (
        <ListItem>
            <span>{name}</span>
            <PlayerStatus>{status}</PlayerStatus>
        </ListItem>
    );
}

const ListItem = styled.li`
    padding: 9px 16px;
    color: ghostwhite;
    font-size: 17px;
`;

const PlayerStatus = styled.span`
    display: block;
    color: rgba(255, 239, 213, 0.62);
    font-family: "Cousine", monospace;
    font-size: 0.6em;
    margin-right: 6px;
    white-space: nowrap;
`;
