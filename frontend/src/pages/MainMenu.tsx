import MainMenuButton from "../components/MainMenuButton.tsx";
import Header from "../components/Header.tsx";
import PatchnotesLink from "../components/PatchnotesLink.tsx";
import { Stack } from "@mui/material";
import SoundBar from "../components/SoundBar.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { ReactNode } from "react";

export type AppNotification = {
    id: string;
    title: string;
    message: string;
    indicatorColor?: string;
    actions?: NotificationAction[];
};

type NotificationAction = {
    label: string;
    ariaLabel?: string;
    icon?: ReactNode;
    variant?: "primary" | "secondary" | "danger";
    onClick: () => void;
};

type NotificationBellProps = {
    notifications: AppNotification[];
};

export function NotificationBell({ notifications }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen]);

    return (
        <NotificationContainer ref={containerRef}>
            <BellButton
                type="button"
                aria-label={`Notifications${notifications.length ? ` (${notifications.length} unread)` : ""}`}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                onClick={() => setIsOpen((open) => !open)}
            >
                <FontAwesomeIcon icon={faBell} />
                {!!notifications.length && <NotificationCount>{notifications.length}</NotificationCount>}
            </BellButton>

            {isOpen && (
                <NotificationPanel role="dialog" aria-label="Notifications">
                    <NotificationHeading>Notifications</NotificationHeading>
                    {!notifications.length ? (
                        <EmptyState>No notifications</EmptyState>
                    ) : (
                        <NotificationList>
                            {notifications.map((notification) => (
                                <NotificationItem key={notification.id}>
                                    <NotificationAvatar aria-hidden="true">
                                        {notification.title.charAt(0).toUpperCase()}
                                    </NotificationAvatar>
                                    <NotificationDetails>
                                        <NotificationTitle>{notification.title}</NotificationTitle>
                                        <NotificationMessage>
                                            {notification.indicatorColor && (
                                                <StatusIndicator color={notification.indicatorColor} />
                                            )}
                                            {notification.message}
                                        </NotificationMessage>
                                    </NotificationDetails>
                                    {!!notification.actions?.length && (
                                        <NotificationActions>
                                            {notification.actions.map((action) => (
                                                <NotificationActionButton
                                                    key={action.label}
                                                    type="button"
                                                    variant={action.variant}
                                                    aria-label={action.ariaLabel ?? action.label}
                                                    title={action.ariaLabel ?? action.label}
                                                    onClick={action.onClick}
                                                >
                                                    {action.icon ?? action.label}
                                                </NotificationActionButton>
                                            ))}
                                        </NotificationActions>
                                    )}
                                </NotificationItem>
                            ))}
                        </NotificationList>
                    )}
                </NotificationPanel>
            )}
        </NotificationContainer>
    );
}

export default function MainMenu() {
    return (
        <MenuBackgroundWrapper>
            <div style={{ position: "absolute", left: 20, top: 20 }}>
                <SoundBar opened />
            </div>
            <Stack gap={5}>
                <Header />
                <MainMenuButton name={"Find game"} path={"/lobby"} />
                <MainMenuButton name={"Decks"} path={"/decks"} />
                <MainMenuButton name={"Profile"} path={"/profile"} />
                <MainMenuButton name={"LOGOUT"} path={"/login"} />
            </Stack>
            <PatchnotesLink />
        </MenuBackgroundWrapper>
    );
}

const NotificationContainer = styled.div`
    position: relative;
    z-index: 20;
`;

const BellButton = styled.button`
    position: relative;
    display: grid;
    width: 36px;
    height: 38px;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: ghostwhite;
    font-size: 24px;

    &:hover,
    &:focus-visible {
        color: var(--lobby-accent);
        outline: none;
    }
`;

const NotificationCount = styled.span`
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    padding: 0 3px;
    border: 2px solid #101418;
    border-radius: 10px;
    background: var(--lobby-accent);
    color: white;
    font:
        700 11px/18px "Cousine",
        monospace;
`;

const NotificationPanel = styled.div`
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: min(360px, calc(100vw - 32px));
    max-height: min(520px, calc(100vh - 100px));
    overflow-y: auto;
    border: 1px solid rgba(124, 124, 118, 0.45);
    border-radius: 6px;
    background: #111;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
    color: ghostwhite;
    text-align: left;
`;

const NotificationHeading = styled.h2`
    margin: 0;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(124, 124, 118, 0.25);
    font:
        500 20px "League Spartan",
        sans-serif;
`;

const NotificationList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin: 0;
    padding: 20px;
    list-style: none;
`;

const NotificationItem = styled.li`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const NotificationAvatar = styled.div`
    display: grid;
    flex: 0 0 54px;
    height: 54px;
    place-items: center;
    border-radius: 50%;
    background: #858585;
    color: #161616;
    font:
        400 27px "Cousine",
        monospace;
`;

const NotificationDetails = styled.div`
    min-width: 0;
    flex: 1;
`;

const NotificationTitle = styled.div`
    overflow: hidden;
    font:
        500 21px "League Spartan",
        sans-serif;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const NotificationMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 3px;
    color: #bcbcbc;
    font:
        400 16px "League Spartan",
        sans-serif;
`;

const StatusIndicator = styled.span<{ color: string }>`
    width: 10px;
    height: 10px;
    border: 1px solid #e4e4e4;
    border-radius: 50%;
    background: ${({ color }) => color};
`;

const NotificationActions = styled.div`
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
`;

const NotificationActionButton = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 50%;
    color: white;
    font-size: 16px;

    ${({ variant }) =>
        variant === "primary"
            ? `
                background: #347c43;
                &:hover, &:focus-visible { background: #409a52; }
            `
            : variant === "danger"
              ? `
                background: #8c2f3d;
                &:hover, &:focus-visible { background: #ad3a4b; }
            `
              : `
                border-color: #626262;
                background: transparent;
                &:hover, &:focus-visible {
                    border-color: #999;
                    background: #292929;
                }
            `}

    &:focus-visible {
        outline: 2px solid var(--lobby-accent);
        outline-offset: 2px;
    }
`;

const EmptyState = styled.p`
    margin: 0;
    padding: 28px 20px;
    color: #aaa;
    font:
        400 16px "League Spartan",
        sans-serif;
    text-align: center;
`;
