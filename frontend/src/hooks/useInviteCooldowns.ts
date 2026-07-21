import { useEffect, useState } from "react";

export const INVITE_COOLDOWN_MS = 10_000;

export default function useInviteCooldowns() {
    const [inviteCooldowns, setInviteCooldowns] = useState<Map<string, number>>(() => new Map());

    useEffect(() => {
        if (!inviteCooldowns.size) return;

        const interval = window.setInterval(() => {
            const now = Date.now();
            setInviteCooldowns((cooldowns) =>
                new Map([...cooldowns].filter(([, expiresAt]) => expiresAt > now))
            );
        }, 250);

        return () => window.clearInterval(interval);
    }, [inviteCooldowns.size]);

    function startInviteCooldown(player: string) {
        setInviteCooldowns((cooldowns) => new Map(cooldowns).set(player, Date.now() + INVITE_COOLDOWN_MS));
    }

    function isInviteCoolingDown(player: string) {
        return (inviteCooldowns.get(player) ?? 0) > Date.now();
    }

    function getInviteCooldownSeconds(player: string) {
        return Math.max(0, Math.ceil(((inviteCooldowns.get(player) ?? 0) - Date.now()) / 1000));
    }

    return {
        getInviteCooldownSeconds,
        inviteCooldownPlayers: new Set(inviteCooldowns.keys()),
        isInviteCoolingDown,
        startInviteCooldown,
    };
}
