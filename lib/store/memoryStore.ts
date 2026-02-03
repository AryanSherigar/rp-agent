import { GameState } from "@/lib/engine/GameState";

/**
 * In-memory game store.
 * Single source of truth for runtime state.
 * Swappable with DB later.
 */

const games = new Map<string, GameState>();

export function createGame(state: GameState) {
    const gameId = crypto.randomUUID();

    state.meta = {
        ...state.meta,
        gameId
    };

    games.set(gameId, state);
    return gameId;
}

export function getGame(gameId: string): GameState | undefined {
    return games.get(gameId);
}

export function updateGame(gameId: string, state: GameState) {
    games.set(gameId, state);
}
