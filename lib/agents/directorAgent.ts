// /lib/agents/directorAgent.ts

import { DirectorInput, DirectorDecision } from "./agentTypes"
import { callGemini } from "@/lib/llm/geminiClient"
import { DIRECTOR_SYSTEM_PROMPT } from "@/lib/llm/directorPrompt"
import { DirectorDecisionSchema } from "@/lib/llm/directorSchema"

/**
 * Minimum confidence required for a DirectorDecision
 * to be accepted.
 */
const DIRECTOR_CONFIDENCE_THRESHOLD = 0.6

/**
 * Safe fallback decision.
 * Used when the Director fails or is uncertain.
 */
const DEFAULT_DIRECTOR_DECISION: DirectorDecision = {
    pacing: "normal",
    tension: 50,
    constraints: [],
    confidence: 1.0,
}


export async function runDirectorAgent(
    input: DirectorInput
): Promise<DirectorDecision> {
    try {
        const decision = await callGemini<DirectorDecision>({
            systemPrompt: DIRECTOR_SYSTEM_PROMPT,
            userPrompt: JSON.stringify(
                {
                    state: input.state,
                    playerIntent: input.playerIntent,
                },
                null,
                2
            ),
            schema: DirectorDecisionSchema,
            maxRetries: 2,
            timeoutMs: 8000,
        })

        // Confidence gate
        if (decision.confidence < DIRECTOR_CONFIDENCE_THRESHOLD) {
            return DEFAULT_DIRECTOR_DECISION
        }

        return decision
    } catch (error) {
        // Absolute safety net
        return DEFAULT_DIRECTOR_DECISION
    }
}

