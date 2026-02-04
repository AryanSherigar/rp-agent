// /app/play/page.tsx

import PlayClient from "./PlayClient";

export default async function PlayPage() {
    // TEMP: hardcode gameId for now
    // later you can read from search params or session
    const gameId = "efdc1aed-5ef0-42e2-90f4-5a78c190df5e";

    const res = await fetch(
        `http://localhost:3000/api/state?gameId=${gameId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        return <div className="p-6">Failed to load game.</div>;
    }

    const state = await res.json();

    return (
        <PlayClient
            initialState={state}
            initialNarration={state.scene.summary}
            gameId={gameId}
        />
    );
}
