// /lib/agents/narratorAgent.ts

import { callGemini } from "@/lib/llm/geminiClient";
import { NARRATOR_SYSTEM_PROMPT } from "@/lib/llm/narratorPrompt";
import { NarrationSchema, NarrationOutput } from "@/lib/llm/narratorSchema";
import { GameState } from "@/lib/engine/GameState";
import { DirectorDecision } from "./agentTypes";

export async function runNarratorAgent(input: {
    previousState: GameState;
    currentState: GameState;
    directorDecision: DirectorDecision | null;
    eventsThisTurn: any[];
}): Promise<string> {
    try {
        // Explicit inaction narration
        if (input.eventsThisTurn.length === 0) {
            return "You pause, watching the world around you. Nothing immediately changes.";
        }

        const narrationInput = {
            previousScene: input.previousState.scene,
            currentScene: input.currentState.scene,
            events: input.eventsThisTurn.map(e => ({
                type: e.type,
                actorId: e.actorId,
                description: e.description,
            })),
            director: input.directorDecision
                ? {
                    pacing: input.directorDecision.pacing,
                    tension: input.directorDecision.tension,
                }
                : null,
        };

        const narration = await callGemini<NarrationOutput>({
            systemPrompt: NARRATOR_SYSTEM_PROMPT,
            userPrompt: JSON.stringify(narrationInput, null, 2),
            schema: NarrationSchema,
            maxRetries: 2,
            timeoutMs: 8000,
        });

        return narration.text;
    } catch (err) {
        console.error("[NarratorAgent] Gemini failed:", err);
        return "Time passes quietly.";
    }
}
