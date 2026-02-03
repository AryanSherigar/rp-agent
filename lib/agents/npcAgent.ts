import { GameState } from "@/lib/engine/GameState";
import { AgentIntent } from "@/lib/engine/Event";

/**
 * Deterministic NPC agent.
 * Reads state, outputs intent.
 * No randomness. No side effects.
 */
export function npcAgent(state: GameState): AgentIntent | null {
    // Only act during NPC turn and ACTION phase
    if (
        state.meta.currentTurn !== "NPC" ||
        state.meta.phase !== "ACTION"
    ) {
        return null;
    }

    // For now: pick the first non-player character
    const npc = state.characters.find(c => c.role !== "player");
    if (!npc) return null;

    // Very dumb but deterministic logic:
    // If not in village, move to village
    if (npc.status.locationId !== "village") {
        return {
            actorId: npc.id,
            intentType: "MOVE",
            payload: { locationId: "village" },
            confidence: 0.5
        };
    }

    // Otherwise do nothing
    return null;
}
