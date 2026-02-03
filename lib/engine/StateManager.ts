import { GameState } from "./GameState";
import { GameEvent, StateChange } from "./Event";

/**
 * Pure function.
 * Same input -> same output.
 */
export function applyEvent(
    state: GameState,
    event: GameEvent
): GameState {
    const nextState: GameState = structuredClone(state);

    for (const change of event.stateChanges) {
        applyStateChange(nextState, change);
    }

    nextState.history.push(event);

    nextState.meta.tick = event.tick;
    nextState.meta.lastUpdatedAt = event.createdAt;

    return nextState;
}

/**
 * Applies a single patch to state using a dot-path.
 */
function applyStateChange(
    state: any,
    change: StateChange
) {
    const pathParts = change.path.split(".");
    let cursor = state;

    for (let i = 0; i < pathParts.length - 1; i++) {
        cursor = cursor[pathParts[i]];
        if (cursor === undefined) {
            throw new Error(`Invalid state path: ${change.path}`);
        }
    }

    const finalKey = pathParts[pathParts.length - 1];
    cursor[finalKey] = change.after;
}
