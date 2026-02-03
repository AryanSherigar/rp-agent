import { createInitialGameState } from "@/lib/engine/createInitialGameState";
import { createGame } from "@/lib/store/memoryStore";

export async function POST() {
    const state = createInitialGameState();
    const gameId = createGame(state);

    return Response.json({ gameId, state });
}
