// app/play/PlayClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { GameState, CharacterState } from "@/lib/engine/GameState";

type Props = {
    initialState: GameState;
    initialNarration: string;
    gameId: string;
};

type LogEntry = {
    id: string;
    text: string;
    source: "narrator" | "user" | "system";
    mode?: "action" | "dialogue" | "story"; // Added mode tracking
};

type InputMode = "action" | "dialogue" | "story";

export default function PlayClient({
    initialState,
    initialNarration,
    gameId,
}: Props) {
    const [state, setState] = useState<GameState>(initialState);

    // History Log
    const [gameLog, setGameLog] = useState<LogEntry[]>([
        { id: "init", text: initialNarration, source: "narrator" }
    ]);

    // Input State
    const [playerText, setPlayerText] = useState<string>("");
    const [inputMode, setInputMode] = useState<InputMode>("action");
    const [loading, setLoading] = useState<boolean>(false);

    // Director Overlay State
    const [showDirector, setShowDirector] = useState(false);

    // Auto-scroll
    const logEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [gameLog]);

    async function sendPlayerText() {
        if (!playerText.trim()) return;

        // 1. Format text based on mode for the UI context
        let displayText = playerText;
        if (inputMode === "dialogue") displayText = `"${playerText}"`;
        if (inputMode === "story") displayText = `(Narrative) ${playerText}`;

        // 2. Optimistic Update
        const userEntry: LogEntry = {
            id: crypto.randomUUID(),
            text: displayText,
            source: "user",
            mode: inputMode
        };
        setGameLog((prev) => [...prev, userEntry]);
        setPlayerText("");
        setLoading(true);

        // 3. Send to API
        // Note: We currently just send the text. In the future, we can send { text, mode } 
        // to help the intent classifier.
        try {
            const res = await fetch("/api/player-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId,
                    playerText: userEntry.text,
                    demo: true,
                }),
            });

            if (!res.ok) throw new Error("Turn failed");

            const data = await res.json();

            setState(data.state);

            if (data.narration) {
                setGameLog((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        text: data.narration,
                        source: "narrator"
                    }
                ]);
            }
        } catch (e: any) {
            setGameLog((prev) => [
                ...prev,
                { id: crypto.randomUUID(), text: "Error: Could not resolve turn.", source: "system" }
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">

            {/* --- 6. DIRECTOR OVERLAY (Absolute) --- */}
            {showDirector && (
                <div className="absolute top-16 right-4 w-80 bg-slate-900 border border-emerald-500/30 rounded-lg shadow-2xl z-50 p-4 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Director Controls</h3>
                        <button onClick={() => setShowDirector(false)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-mono">Story Goal</label>
                            <div className="text-xs bg-slate-950 p-2 rounded border border-slate-800 text-slate-300">
                                "Survival and Discovery"
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Tension</span>
                                <span>High</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full">
                                <div className="h-full w-3/4 bg-orange-500/70 rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Pacing</span>
                                <span>Slow</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full">
                                <div className="h-full w-1/3 bg-blue-500/70 rounded-full"></div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase mb-2">System Instructions</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="text-xs bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300 transition-colors">
                                    Introduce Twist
                                </button>
                                <button className="text-xs bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300 transition-colors">
                                    Force Conflict
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* --- HEADER --- */}
            <header className="h-14 px-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center z-10">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-lg font-bold tracking-tight text-emerald-400">RP Agent</h1>
                    <span className="text-xs text-slate-500 font-mono">
                        Turn {state.meta.tick}
                    </span>
                </div>

                <button
                    onClick={() => setShowDirector(!showDirector)}
                    className={`
                        text-xs font-medium px-3 py-1.5 rounded transition-all flex items-center gap-2
                        ${showDirector
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"}
                    `}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Director Tools
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* --- LEFT SIDEBAR: WORLD INFO --- */}
                <aside className="w-72 bg-slate-900/50 border-r border-slate-800 p-4 overflow-y-auto hidden md:block">
                    <div className="mb-8">
                        <SectionTitle>Location</SectionTitle>
                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                            <h2 className="text-lg font-semibold text-white mb-1">
                                {state.world.locations[state.scene.locationId]?.name || state.scene.locationId}
                            </h2>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
                                {state.scene.tone} Tone
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {state.world.locations[state.scene.locationId]?.description}
                            </p>
                        </div>
                    </div>

                    <div>
                        <SectionTitle>Story DNA</SectionTitle>
                        <div className="space-y-4">
                            <DnaBar label="Order / Chaos" value={state.storyDNA.axes.orderChaos} color="bg-blue-500" />
                            <DnaBar label="Hope / Despair" value={state.storyDNA.axes.hopeDespair} color="bg-amber-500" />
                            <DnaBar label="Trust / Betrayal" value={state.storyDNA.axes.trustBetrayal} color="bg-emerald-500" />
                        </div>
                    </div>
                </aside>

                {/* --- CENTER: NARRATIVE LOG & INPUT --- */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
                    {/* Log Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                        {gameLog.map((entry) => (
                            <div
                                key={entry.id}
                                className={`flex flex-col max-w-2xl mx-auto ${entry.source === "user" ? "items-end" : "items-start"
                                    }`}
                            >
                                <div className={`
                                    py-4 px-6 rounded-lg leading-relaxed text-base shadow-sm relative
                                    ${entry.source === "user"
                                        ? "bg-slate-800 text-slate-100 rounded-br-none border border-slate-700"
                                        : "bg-transparent text-slate-300 pl-4 border-l-2 border-emerald-500/30"
                                    }
                                    ${entry.source === "system" ? "text-red-400 font-mono text-sm border-l-2 border-red-500" : ""}
                                `}>
                                    {entry.source === "user" && (
                                        <span className="absolute -top-5 right-0 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                            {entry.mode || "Action"}
                                        </span>
                                    )}
                                    {entry.text}
                                </div>
                            </div>
                        ))}
                        <div ref={logEndRef} className="h-4" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 z-20">
                        <div className="max-w-2xl mx-auto space-y-2">

                            {/* Input Mode Tabs */}
                            <div className="flex gap-2">
                                <InputTab
                                    active={inputMode === "action"}
                                    onClick={() => setInputMode("action")}
                                    label="Do"
                                    icon="⚡"
                                />
                                <InputTab
                                    active={inputMode === "dialogue"}
                                    onClick={() => setInputMode("dialogue")}
                                    label="Say"
                                    icon="💬"
                                />
                                <InputTab
                                    active={inputMode === "story"}
                                    onClick={() => setInputMode("story")}
                                    label="Story"
                                    icon="📖"
                                />
                            </div>

                            {/* Text Input */}
                            <div className="relative">
                                <textarea
                                    value={playerText}
                                    onChange={(e) => setPlayerText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendPlayerText();
                                        }
                                    }}
                                    disabled={loading}
                                    placeholder={
                                        inputMode === "action" ? "What do you do physically?" :
                                            inputMode === "dialogue" ? "What do you say?" :
                                                "Describe a narrative shift..."
                                    }
                                    className={`
                                        w-full bg-slate-950 border rounded-md p-4 pr-24 text-slate-200 
                                        focus:outline-none focus:ring-1 resize-none h-24 transition-all
                                        ${inputMode === "action" ? "border-slate-700 focus:ring-blue-500/50" : ""}
                                        ${inputMode === "dialogue" ? "border-slate-700 focus:ring-emerald-500/50" : ""}
                                        ${inputMode === "story" ? "border-slate-700 focus:ring-purple-500/50" : ""}
                                    `}
                                />
                                <button
                                    onClick={sendPlayerText}
                                    disabled={loading || !playerText.trim()}
                                    className="absolute bottom-4 right-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded border border-slate-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- RIGHT SIDEBAR: CHARACTERS --- */}
                <aside className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto hidden xl:block">
                    <SectionTitle>Dramatis Personae</SectionTitle>
                    <div className="space-y-4">
                        {state.characters.map((char) => (
                            <CharacterCard
                                key={char.id}
                                char={char}
                                isHero={char.role === 'player'}
                            />
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">
            {children}
        </h3>
    );
}

function InputTab({ active, onClick, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-t-md text-xs font-bold transition-all flex items-center gap-2 border-t border-x border-b-0
                ${active
                    ? "bg-slate-950 text-slate-100 border-slate-700 translate-y-[1px] z-10"
                    : "bg-slate-900 text-slate-500 border-transparent hover:text-slate-300"
                }
            `}
        >
            <span>{icon}</span> {label}
        </button>
    );
}

function DnaBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="text-xs">
            <div className="flex justify-between mb-1 text-slate-400">
                <span>{label}</span>
                <span>{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full opacity-80 ${color}`}
                    style={{ width: `${value * 100}%` }}
                />
            </div>
        </div>
    );
}

function CharacterCard({ char, isHero }: { char: CharacterState; isHero: boolean }) {
    return (
        <div className={`
            p-3 rounded border transition-all
            ${isHero
                ? "bg-slate-800/80 border-emerald-500/30 shadow-lg shadow-emerald-900/10"
                : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
            }
        `}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-bold text-slate-200 text-sm">{char.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{char.role}</div>
                </div>
                {char.status.locationId && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-400">
                        {char.status.locationId}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <StatRow label="Trust" value={char.emotions.trust} />
                <StatRow label="Fear" value={char.emotions.fear} />
            </div>

            {char.motivations.primaryGoal && (
                <div className="mt-3 pt-2 border-t border-slate-700/50">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Current Goal</p>
                    <p className="text-xs text-slate-300 leading-tight">
                        {char.motivations.primaryGoal}
                    </p>
                </div>
            )}
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center gap-2 text-[10px]">
            <span className="w-8 text-slate-500">{label}</span>
            <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-slate-400"
                    style={{ width: `${value * 100}%` }}
                />
            </div>
        </div>
    );
}