import { getGame } from "@/lib/store/memoryStore";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
        return Response.json(
            { error: "Missing gameId" },
            { status: 400 }
        );
    }

    const game = getGame(gameId);

    if (!game) {
        return Response.json(
            { error: "Game not found" },
            { status: 404 }
        );
    }

    // IMPORTANT: return ONLY plain state, not the game object
    return Response.json(game.state);
}
