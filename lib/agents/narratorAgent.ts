// /lib/agents/narratorAgent.ts

import { callGemini } from "@/lib/llm/geminiClient"
import { NARRATOR_SYSTEM_PROMPT } from "@/lib/llm/narratorPrompt"
import { NarrationSchema, NarrationOutput } from "@/lib/llm/narratorSchema"
import { DirectorDecision } from "./agentTypes"
import { GameState } from "@/lib/engine/GameState"

export async function runNarratorAgent(input: {
    previousState: GameState
    currentState: GameState
    directorDecision: DirectorDecision
    eventsThisTurn: any[]
}): Promise<string> {
    try {
        const narration = await callGemini<NarrationOutput>({
            systemPrompt: NARRATOR_SYSTEM_PROMPT,
            userPrompt: JSON.stringify(input, null, 2),
            schema: NarrationSchema,
            maxRetries: 2,
            timeoutMs: 8000,
        })

        return narration.text
    } catch {
        // Safe fallback narration
        return input.currentState.scene.summary
    }
}
