import { GameState } from "./GameState";
import { GameEvent, StateChange, AgentIntent } from "./Event";

export function reduceIntent(
    state: GameState,
    intent: AgentIntent
): GameEvent[] {
    switch (intent.intentType) {
        case "MOVE":
            return handleMove(state, intent);

        default:
            throw new Error(`Unknown intent type: ${intent.intentType}`);
    }
}

/* =========================
   Intent Handlers
   ========================= */

function handleMove(
    state: GameState,
    intent: AgentIntent
): GameEvent[] {
    const actor = state.characters.find(c => c.id === intent.actorId);
    if (!actor) {
        throw new Error("Actor not found");
    }

    const targetLocation = intent.payload.locationId;
    const currentLocation = actor.status.locationId;

    if (currentLocation === targetLocation) {
        return [];
    }

    const stateChanges: StateChange[] = [
        {
            path: `characters.${state.characters.indexOf(actor)}.status.locationId`,
            before: currentLocation,
            after: targetLocation,
            reason: "Character moved locations"
        }
    ];

    const event: GameEvent = {
        id: crypto.randomUUID(),
        schemaVersion: "1.0.0",
        type: "character",
        actorId: actor.id,
        description: `${actor.name} moved from ${currentLocation} to ${targetLocation}`,
        intent,
        stateChanges,
        tick: state.meta.tick + 1,
        createdAt: new Date().toISOString()
    };

    return [event];
}
