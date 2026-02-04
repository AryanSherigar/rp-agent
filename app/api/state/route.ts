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

    const state = getGame(gameId);

    if (!state) {
        return Response.json(
            { error: "Game not found" },
            { status: 404 }
        );
    }

    // IMPORTANT: normalize GameState to plain JSON
    return Response.json(
        JSON.parse(JSON.stringify(state))
    );
}
