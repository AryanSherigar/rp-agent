// /lib/agents/characterAgent.ts

import { AgentIntent } from "@/lib/engine/Event"
import { CharacterAgentInput } from "./agentTypes"
import { callGemini } from "@/lib/llm/geminiClient"
import { CHARACTER_SYSTEM_PROMPT } from "@/lib/llm/characterPrompt"
import { CharacterDecisionSchema } from "@/lib/llm/characterSchema"


export async function runCharacterAgent(
    input: CharacterAgentInput
): Promise<AgentIntent | null> {
    const { state, characterId, directorDecision } = input
    const character = state.characters.find(c => c.id === characterId)

    const minimalState = {
        character,
        scene: state.scene,
        storyDNA: state.storyDNA.axes,
        recentEvents: state.history.slice(-5),
    }



    try {
        const decision = await callGemini({
            systemPrompt: CHARACTER_SYSTEM_PROMPT,
            userPrompt: JSON.stringify(
                {
                    characterId,
                    directorDecision,
                    state: minimalState,
                },
                null,
                2
            ),
            schema: CharacterDecisionSchema,
            maxRetries: 1,
            timeoutMs: 6000,
        })

        // Explicit no-op
        if (decision.action === null) {
            return null
        }

        const { intentType, payload, confidence } = decision.action

        // Confidence gate
        if (confidence < 0.5) {
            return null
        }

        // Director constraint enforcement (simple, explicit)
        for (const constraint of directorDecision.constraints) {
            if (constraint === "No movement" && intentType === "MOVE") {
                return null
            }

            if (constraint === "Dialogue only" && intentType !== "SAY") {
                return null
            }
        }

        // Construct engine-level intent
        const intent: AgentIntent = {
            actorId: characterId,
            intentType,
            payload,
            confidence,
        }

        return intent
    } catch {
        // Any failure → do nothing
        return null
    }
}

