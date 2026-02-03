import { GameState } from "@/lib/engine/GameState";
import { AgentIntent } from "@/lib/engine/Event";

/**
 * World agent observes state and history,
 * emits system-level intents.
 */
export function worldAgent(state: GameState): AgentIntent[] {
    if (
        state.meta.currentTurn !== "WORLD" ||
        state.meta.phase !== "ACTION"
    ) {
        return [];
    }

    const recentPlayerMove = [...state.history]
        .reverse()
        .find(
            e =>
                e.type === "character" &&
                e.actorId === "hero" &&
                e.description.includes("moved")
        );

    if (!recentPlayerMove) return [];

    const actor = state.characters.find(c => c.id === "hero");
    if (!actor) return [];

    const location = state.world.locations[actor.status.locationId];
    if (!location) return [];

    const intents: AgentIntent[] = [];

    // 1. Scene update
    if (state.scene.locationId !== actor.status.locationId) {
        intents.push({
            actorId: "world",
            intentType: "UPDATE_SCENE",
            payload: { focusCharacterId: actor.id },
            confidence: 1
        });
    }

    // 2. Story DNA mutation
    if (location.tags.includes("danger")) {
        intents.push({
            actorId: "world",
            intentType: "MUTATE_STORY_DNA",
            payload: {
                cause: `Entered dangerous location: ${location.name}`,
                delta: {
                    orderChaos: 0.1,
                    hopeDespair: -0.1
                }
            },
            confidence: 1
        });
    }

    return intents;
}


