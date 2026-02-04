import { GameState } from "./GameState";
import { reduceIntent } from "./reducer";
import { applyEvent } from "./StateManager";
import { AgentIntent } from "./Event";
import { npcAgent } from "@/lib/agents/npcAgent";
import { worldAgent } from "../agents/worldAgent";

/**
 * Runs one full deterministic turn cycle if possible.
 * No loops. No recursion. No randomness.
 */
export function runTurnCycle(
    state: GameState,
    initialIntent: AgentIntent
): GameState {
    let nextState = state;

    // 1. Apply initial intent (PLAYER)
    const initialEvents = reduceIntent(nextState, initialIntent);

    //  GUARD: no-op intent
    if (initialEvents.length === 0) {
        return state; // absolutely nothing advances
    }

    nextState = applyAll(nextState, initialEvents);


    // 2. Advance phase: START -> ACTION -> RESOLVE
    nextState = advance(nextState, "ADVANCE_PHASE");
    nextState = advance(nextState, "ADVANCE_PHASE");

    // 3. Advance turn: PLAYER -> NPC
    nextState = advance(nextState, "ADVANCE_TURN");

    // 4. NPC ACTION phase
    nextState = advance(nextState, "ADVANCE_PHASE"); // START -> ACTION

    const npcIntent = npcAgent(nextState);
    if (npcIntent) {
        nextState = applyAll(nextState, reduceIntent(nextState, npcIntent));
    }

    // 5. NPC RESOLVE
    nextState = advance(nextState, "ADVANCE_PHASE");

    // 6. Advance turn: NPC -> WORLD
    nextState = advance(nextState, "ADVANCE_TURN");

    // WORLD ACTION phase
    nextState = advance(nextState, "ADVANCE_PHASE"); // START -> ACTION

    const worldIntents = worldAgent(nextState);
    for (const intent of worldIntents) {
        nextState = applyAll(nextState, reduceIntent(nextState, intent));
    }


    // WORLD RESOLVE
    nextState = advance(nextState, "ADVANCE_PHASE");

    // 7. Advance turn: WORLD -> PLAYER
    nextState = advance(nextState, "ADVANCE_TURN");


    return nextState;
}

/* ------------------ helpers ------------------ */

function advance(state: GameState, intentType: string): GameState {
    const events = reduceIntent(state, {
        actorId: "system",
        intentType,
        payload: {},
        confidence: 1
    });

    return applyAll(state, events);
}

function applyAll(state: GameState, events: any[]): GameState {
    return events.reduce((s, e) => applyEvent(s, e), state);
}
