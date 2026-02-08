// /app/play/page.tsx

import PlayClient from "./PlayClient";

export default async function PlayPage() {
    const res = await fetch(
        `http://localhost:3000/api/start-game`,
        {
            method: "POST",
            cache: "no-store"
        }
    );

    if (!res.ok) {
        return <div className="p-6">Failed to start game.</div>;
    }

    const { gameId, state } = await res.json();

    return (
        <PlayClient
            initialState={state}
            initialNarration={state.scene.summary}
            gameId={gameId}
        />
    );
}