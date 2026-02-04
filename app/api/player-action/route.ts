import { getGame, updateGame } from "@/lib/store/memoryStore";
import { runTurnCycle } from "@/lib/engine/turnRunner";
import { runNarratorAgent } from "@/lib/agents/narratorAgent";
import { runPlayerIntentAgent } from "@/lib/agents/playerIntentAgent";


export async function POST(req: Request) {
    const { gameId, playerText, demo } = await req.json();


    const previousState = getGame(gameId);
    if (!previousState) {
        return new Response("Game not found", { status: 404 });
    }
    const initialIntent = await runPlayerIntentAgent({
        playerText,
        state: previousState,
    });

    // Run one full turn
    const nextState = await runTurnCycle(
        previousState,
        initialIntent
    );



    // Generate narration
    const narration = await runNarratorAgent({
        previousState,
        currentState: nextState,
        directorDecision: null,
        eventsThisTurn: nextState.history.slice(previousState.history.length),
    });

    if (nextState !== previousState) {
        updateGame(gameId, nextState);
    }

    // --- DEMO MODE EXTRACTION ---
    let demoPayload = undefined;

    if (demo === true) {
        const eventsThisTurn = nextState.history.slice(previousState.history.length);

        const directorEvent = [...eventsThisTurn]
            .reverse()
            .find(e => e.type === "director");

        const dnaBefore = previousState.storyDNA.axes;
        const dnaAfter = nextState.storyDNA.axes;

        const storyDNADelta: Record<string, number> = {};

        for (const key of Object.keys(dnaAfter)) {
            const before = (dnaBefore as any)[key];
            const after = (dnaAfter as any)[key];
            if (before !== after) {
                storyDNADelta[key] = Number((after - before).toFixed(2));
            }
        }

        demoPayload = {
            directorDecision: directorEvent?.intent ?? null,
            eventsThisTurn,
            storyDNADelta,
        };
        console.log("Narrator events count:", eventsThisTurn.length);
    }


    return Response.json({
        state: nextState,
        narration,
        ...(demoPayload ? { demo: demoPayload } : {}),
    });
}
