// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import type { ChatMessage } from "./Chat.tsx";

const contextMenuMock = vi.hoisted(() => ({
    message: {
        id: "message-1",
        author: "other-player",
        message: "hello",
        timestamp: new Date().toISOString(),
    } as ChatMessage,
}));

vi.mock("react-contexify", () => ({
    Item: ({
        children,
        hidden,
        onClick,
    }: {
        children: ReactNode;
        hidden?: (params: { props: ChatMessage }) => boolean;
        onClick?: (params: { props: ChatMessage }) => void;
    }) => {
        if (hidden?.({ props: contextMenuMock.message })) return null;
        return <div onClick={() => onClick?.({ props: contextMenuMock.message })}>{children}</div>;
    },
    Separator: () => <hr />,
}));

vi.mock("../game/ContextMenus/ContextMenus.tsx", () => ({
    StyledMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../hooks/useMutation.ts", () => ({
    default: () => ({ mutate: vi.fn(), isPending: false }),
}));

import ChatContextMenu from "./ChatContextMenu.tsx";

function renderMenu(pendingGameInvites = new Set<string>()) {
    const sendMessage = vi.fn();
    const onInviteSent = vi.fn();
    const onInviteCancelled = vi.fn();

    render(
        <ChatContextMenu
            isAdmin={false}
            sendMessage={sendMessage}
            onInviteSent={onInviteSent}
            onInviteCancelled={onInviteCancelled}
            pendingGameInvites={pendingGameInvites}
        />
    );

    return { sendMessage, onInviteSent, onInviteCancelled };
}

describe("ChatContextMenu game invitations", () => {
    afterEach(cleanup);

    beforeEach(() => {
        useGeneralStates.setState({ user: "current-player" });
        contextMenuMock.message = {
            id: "message-1",
            author: "other-player",
            message: "hello",
            timestamp: new Date().toISOString(),
        };
    });

    it("shows Invite to Game and sends an invitation when no invite is pending", () => {
        const { sendMessage, onInviteSent, onInviteCancelled } = renderMenu();

        expect(screen.getByText("Invite to Game")).toBeInTheDocument();
        expect(screen.queryByText("Cancel Invite")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Invite to Game"));

        expect(sendMessage).toHaveBeenCalledWith("/inviteToGame:other-player");
        expect(onInviteSent).toHaveBeenCalledWith("other-player");
        expect(onInviteCancelled).not.toHaveBeenCalled();
    });

    it("shows Cancel Invite and cancels an existing invitation", () => {
        const { sendMessage, onInviteSent, onInviteCancelled } = renderMenu(new Set(["other-player"]));

        expect(screen.getByText("Cancel Invite")).toBeInTheDocument();
        expect(screen.queryByText("Invite to Game")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Cancel Invite"));

        expect(sendMessage).toHaveBeenCalledWith("/cancelGameInvite:other-player");
        expect(onInviteCancelled).toHaveBeenCalledWith("other-player");
        expect(onInviteSent).not.toHaveBeenCalled();
    });

    it.each(["current-player", "【SERVER】"])("hides invitation actions for %s", (author) => {
        contextMenuMock.message = { ...contextMenuMock.message, author };

        renderMenu();

        expect(screen.queryByText("Invite to Game")).not.toBeInTheDocument();
        expect(screen.queryByText("Cancel Invite")).not.toBeInTheDocument();
    });
});
