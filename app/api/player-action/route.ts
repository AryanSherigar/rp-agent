import { getGame, updateGame } from "@/lib/store/memoryStore";
import { runTurnCycle } from "@/lib/engine/turnRunner";

export async function POST(req: Request) {
    const { gameId, intent } = await req.json();

    const state = getGame(gameId);
    if (!state) {
        return new Response("Game not found", { status: 404 });
    }

    const nextState = runTurnCycle(state, intent);

    updateGame(gameId, nextState);
    return Response.json(nextState);
}
