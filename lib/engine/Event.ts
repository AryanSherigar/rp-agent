
/* =========================
   Event Turn(NOT IMPLEMENTED YET)
   ========================= */

export type SystemIntentType =
    | "ADVANCE_PHASE"
    | "ADVANCE_TURN";


/* =========================
   Event System (Canonical)
   ========================= */

export interface GameEvent {
    id: string;
    schemaVersion: "1.0.0";

    type: "player" | "character" | "world" | "director";

    actorId: string;
    description: string;

    intent?: AgentIntent;

    stateChanges: StateChange[];

    tick: number;
    createdAt: string;
}

/* =========================
   State Change (Patch Model)
   ========================= */

export interface StateChange {
    path: string;
    before: any;
    after: any;
    reason: string;
}

/* =========================
   Agent Intent (AI Boundary)
   ========================= */

export interface AgentIntent {
    actorId: string;
    intentType: string; // stays generic
    payload: Record<string, any>;
    confidence: number;
}

