// /app/play/PlayClient.tsx

"use client";

import { useState } from "react";
import { GameState } from "@/lib/engine/GameState";

type Props = {
    initialState: GameState;
    initialNarration: string;
    gameId: string;
};

export default function PlayClient({
    initialState,
    initialNarration,
    gameId,
}: Props) {
    const [state, setState] = useState<GameState>(initialState);
    const [narration, setNarration] = useState<string>(initialNarration);
    const [playerText, setPlayerText] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function sendPlayerText() {
        if (!playerText.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/player-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId,
                    playerText,
                    demo: true,
                }),
            });

            if (!res.ok) {
                throw new Error("Turn failed");
            }

            const data = await res.json();

            setState(data.state);
            setNarration(data.narration ?? "");
            setPlayerText("");
        } catch (e: any) {
            setError(e.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const scene = state.scene;
    const characters = state.characters;

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Scene */}
            <section className="border rounded p-4">
                <h2 className="text-xl font-semibold">
                    Scene: {scene.locationId}
                </h2>
                <p className="text-sm text-gray-600">
                    Tone: {scene.tone}
                </p>
                <p className="mt-2">{scene.summary}</p>
            </section>

            {/* Narration */}
            <section className="border rounded p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Story</h3>
                <p>{narration}</p>
            </section>

            {/* Characters */}
            <section className="border rounded p-4">
                <h3 className="font-semibold mb-2">Characters</h3>
                <ul className="space-y-2">
                    {characters.map((c) => (
                        <li
                            key={c.id}
                            className="flex justify-between text-sm"
                        >
                            <span>
                                {c.name} ({c.role})
                            </span>
                            <span className="text-gray-600">
                                Location: {c.status.locationId}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Player Input */}
            <section className="border rounded p-4">
                <h3 className="font-semibold mb-2">Your Action</h3>

                {loading && (
                    <p className="text-sm text-gray-500">
                        Resolving turn…
                    </p>
                )}

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows={3}
                    placeholder="What do you do?"
                    disabled={loading}
                    value={playerText}
                    onChange={(e) => setPlayerText(e.target.value)}
                />

                <button
                    disabled={loading || !playerText.trim()}
                    onClick={sendPlayerText}
                    className="mt-2 px-4 py-1 rounded border text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                    Send
                </button>
            </section>
        </main>
    );
}
