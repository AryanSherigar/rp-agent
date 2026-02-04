import { GameState } from "./GameState";
import { GameEvent, StateChange, AgentIntent } from "./Event";

export function reduceIntent(
    state: GameState,
    intent: AgentIntent
): GameEvent[] {
    switch (intent.intentType) {
        case "ADVANCE_PHASE":
            return handleAdvancePhase(state);
        case "ADVANCE_TURN":
            return handleAdvanceTurn(state);
        case "MOVE":
            return handleMove(state, intent);
        case "UPDATE_SCENE":
            return handleUpdateScene(state, intent);
        case "MUTATE_STORY_DNA":
            return handleStoryDNAMutation(state, intent);
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

    const worldLocation = state.world.locations[targetLocation];

    //  Location does not exist → request discovery instead of moving
    if (!worldLocation) {
        const event: GameEvent = {
            id: crypto.randomUUID(),
            schemaVersion: "1.0.0",
            type: "world",
            actorId: "world",
            description: `Discovery requested for location: ${targetLocation}`,
            intent: {
                actorId: "world",
                intentType: "DISCOVER_LOCATION",
                payload: {
                    locationId: targetLocation,
                    fromLocationId: currentLocation
                },
                confidence: 0.8
            },
            stateChanges: [],
            tick: state.meta.tick + 1,
            createdAt: new Date().toISOString()
        };

        return [event];
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

function handleAdvancePhase(state: GameState): GameEvent[] {
    const nextPhase =
        state.meta.phase === "START"
            ? "ACTION"
            : state.meta.phase === "ACTION"
                ? "RESOLVE"
                : "START";

    const event: GameEvent = {
        id: crypto.randomUUID(),
        schemaVersion: "1.0.0",
        type: "world",
        actorId: "system",
        description: `Phase advanced to ${nextPhase}`,
        stateChanges: [
            {
                path: "meta.phase",
                before: state.meta.phase,
                after: nextPhase,
                reason: "Phase progression"
            }
        ],
        tick: state.meta.tick + 1,
        createdAt: new Date().toISOString()
    };

    return [event];
}

function handleAdvanceTurn(state: GameState): GameEvent[] {
    const nextTurn =
        state.meta.currentTurn === "PLAYER"
            ? "NPC"
            : state.meta.currentTurn === "NPC"
                ? "WORLD"
                : "PLAYER";

    const event: GameEvent = {
        id: crypto.randomUUID(),
        schemaVersion: "1.0.0",
        type: "world",
        actorId: "system",
        description: `Turn advanced to ${nextTurn}`,
        stateChanges: [
            {
                path: "meta.currentTurn",
                before: state.meta.currentTurn,
                after: nextTurn,
                reason: "Turn rotation"
            },
            {
                path: "meta.phase",
                before: state.meta.phase,
                after: "START",
                reason: "New turn starts at START phase"
            }
        ],
        tick: state.meta.tick + 1,
        createdAt: new Date().toISOString()
    };

    return [event];
}

function handleUpdateScene(
    state: GameState,
    intent: any
): GameEvent[] {
    const character = state.characters.find(
        c => c.id === intent.payload.focusCharacterId
    );
    if (!character) return [];

    const newLocation = character.status.locationId;

    const event: GameEvent = {
        id: crypto.randomUUID(),
        schemaVersion: "1.0.0",
        type: "world",
        actorId: "world",
        description: `Scene shifts to ${newLocation}`,
        stateChanges: [
            {
                path: "scene.locationId",
                before: state.scene.locationId,
                after: newLocation,
                reason: "World scene follows character movement"
            },
            {
                path: "scene.activeCharacters",
                before: state.scene.activeCharacters,
                after: [character.id],
                reason: "Scene focus updated"
            },
            {
                path: "scene.summary",
                before: state.scene.summary,
                after: `${character.name} arrives at the ${newLocation}.`,
                reason: "Narrative update"
            }
        ],
        tick: state.meta.tick + 1,
        createdAt: new Date().toISOString()
    };

    return [event];
}

function handleStoryDNAMutation(
    state: GameState,
    intent: any
): GameEvent[] {
    const delta = intent.payload.delta;

    const newAxes = {
        orderChaos:
            state.storyDNA.axes.orderChaos + (delta.orderChaos ?? 0),
        hopeDespair:
            state.storyDNA.axes.hopeDespair + (delta.hopeDespair ?? 0),
        trustBetrayal:
            state.storyDNA.axes.trustBetrayal + (delta.trustBetrayal ?? 0)
    };

    const event: GameEvent = {
        id: crypto.randomUUID(),
        schemaVersion: "1.0.0",
        type: "director",
        actorId: "world",
        description: `Story DNA mutated: ${intent.payload.cause}`,
        stateChanges: [
            {
                path: "storyDNA.axes",
                before: state.storyDNA.axes,
                after: newAxes,
                reason: "Narrative pressure from world events"
            },
            {
                path: "storyDNA.mutationHistory",
                before: state.storyDNA.mutationHistory,
                after: [
                    ...state.storyDNA.mutationHistory,
                    {
                        cause: intent.payload.cause,
                        delta,
                        tick: state.meta.tick + 1
                    }
                ],
                reason: "Track narrative evolution"
            }
        ],
        tick: state.meta.tick + 1,
        createdAt: new Date().toISOString()
    };

    return [event];
}
