import { getGame } from "@/lib/store/memoryStore";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
        return new Response("Missing gameId", { status: 400 });
    }

    const state = getGame(gameId);
    return Response.json(state);
}
