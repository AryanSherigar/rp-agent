import { GameState } from "./GameState";
import { reduceIntent } from "./reducer";
import { applyEvent } from "./StateManager";
import { AgentIntent } from "./Event";
import { npcAgent } from "@/lib/agents/npcAgent";
import { worldAgent } from "../agents/worldAgent";
import { runDirectorAgent } from "@/lib/agents/directorAgent";
import { runCharacterAgent } from "@/lib/agents/characterAgent";

/**
 * Runs one full deterministic turn cycle if possible.
 * No loops. No recursion. No randomness.
 */
export async function runTurnCycle(
    state: GameState,
    initialIntent: AgentIntent | null
): Promise<GameState> {
    let nextState = state;

    /* ---------- 0. Director Agent ---------- */

    const directorDecision = await runDirectorAgent({
        state: nextState,
        playerIntent: initialIntent,
    });

    nextState = logDirectorDecision(nextState, directorDecision);
    console.log("Director constraints:", directorDecision.constraints);

    /* ---------- 1. Player Intent ---------- */

    if (initialIntent) {
        const initialEvents = reduceIntent(nextState, initialIntent);

        // Guard: intent produced no events → nothing happens
        if (initialEvents.length === 0) {
            return state;
        }

        nextState = applyAll(nextState, initialEvents);
    }

    /* ---------- 2. Advance phase: START → ACTION → RESOLVE ---------- */

    nextState = advance(nextState, "ADVANCE_PHASE");
    nextState = advance(nextState, "ADVANCE_PHASE");

    /* ---------- 3. Advance turn: PLAYER → NPC ---------- */

    nextState = advance(nextState, "ADVANCE_TURN");

    /* ---------- 4. NPC ACTION phase ---------- */

    nextState = advance(nextState, "ADVANCE_PHASE"); // START → ACTION

    let npcIntents: AgentIntent[] = [];

    // 4a. Try Gemini-backed Character Agents
    for (const character of nextState.characters) {
        if (character.role === "player") continue;

        const intent = await runCharacterAgent({
            state: nextState,
            characterId: character.id,
            directorDecision,
        });

        if (intent && intent.confidence >= 0.5) {
            npcIntents.push(intent);
        }
    }

    // 4b. Fallback to deterministic NPC agent
    if (npcIntents.length === 0) {
        const fallbackIntent = npcAgent(nextState);
        if (fallbackIntent) {
            npcIntents.push(fallbackIntent);
        }
    }

    // 4c. Apply NPC intents
    for (const intent of npcIntents) {
        nextState = applyAll(nextState, reduceIntent(nextState, intent));
    }

    /* ---------- 5. NPC RESOLVE ---------- */

    nextState = advance(nextState, "ADVANCE_PHASE");

    /* ---------- 6. Advance turn: NPC → WORLD ---------- */

    nextState = advance(nextState, "ADVANCE_TURN");

    /* ---------- 7. WORLD ACTION ---------- */

    nextState = advance(nextState, "ADVANCE_PHASE");

    const worldIntents = worldAgent(nextState);
    for (const intent of worldIntents) {
        nextState = applyAll(nextState, reduceIntent(nextState, intent));
    }

    /* ---------- 8. WORLD RESOLVE ---------- */

    nextState = advance(nextState, "ADVANCE_PHASE");

    /* ---------- 9. Advance turn: WORLD → PLAYER ---------- */

    nextState = advance(nextState, "ADVANCE_TURN");

    return nextState;
}

/* ------------------ helpers ------------------ */

function advance(state: GameState, intentType: string): GameState {
    const events = reduceIntent(state, {
        actorId: "system",
        intentType,
        payload: {},
        confidence: 1,
    });

    return applyAll(state, events);
}

function applyAll(state: GameState, events: any[]): GameState {
    return events.reduce((s, e) => applyEvent(s, e), state);
}

function logDirectorDecision(
    state: GameState,
    decision: any
): GameState {
    const event = {
        id: crypto.randomUUID(),
        schemaVersion: "1.0.0",
        type: "director",
        actorId: "director",
        description: "Director decision for turn",
        intent: decision,
        stateChanges: [],
        tick: state.meta.tick + 1,
        createdAt: new Date().toISOString(),
    };

    return {
        ...state,
        history: [...state.history, event],
    };
}
