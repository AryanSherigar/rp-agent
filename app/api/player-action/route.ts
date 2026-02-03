import { getGame, updateGame } from "@/lib/store/memoryStore";
import { reduceIntent } from "@/lib/engine/reducer";
import { applyEvent } from "@/lib/engine/StateManager";

export async function POST(req: Request) {
    const { gameId, intent } = await req.json();

    const state = getGame(gameId);
    if (!state) {
        return new Response("Game not found", { status: 404 });
    }

    const events = reduceIntent(state, intent);

    let nextState = state;
    for (const event of events) {
        nextState = applyEvent(nextState, event);
    }

    updateGame(gameId, nextState);

    return Response.json(nextState);
}
