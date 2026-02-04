import { callGemini } from "@/lib/llm/geminiClient";
import { CharacterDecisionSchema } from "@/lib/llm/characterSchema";
import { AgentIntent } from "@/lib/engine/Event";

const PLAYER_INTENT_PROMPT = `
You interpret player input into a single game action.

Rules:
- You may propose ONE action or no action.
- You must NOT invent facts.
- You must NOT describe outcomes.
- If the input is unclear, return no action.

Valid output JSON only.

Remember:
You interpret intent. The engine decides results.
`.trim();

export async function runPlayerIntentAgent(input: {
    playerText: string;
    state: any;
}): Promise<AgentIntent | null> {
    try {
        const decision = await callGemini({
            systemPrompt: PLAYER_INTENT_PROMPT,
            userPrompt: JSON.stringify(input, null, 2),
            schema: CharacterDecisionSchema,
            maxRetries: 1,
            timeoutMs: 6000,
        });

        if (decision.action === null) {
            return null;
        }

        const { intentType, payload, confidence } = decision.action;

        if (confidence < 0.5) {
            return null;
        }

        return {
            actorId: "hero",
            intentType,
            payload,
            confidence,
        };
    } catch {
        return null;
    }
}
