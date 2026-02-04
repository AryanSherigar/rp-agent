// /lib/llm/characterSchema.ts

import { LLMSchema } from "./llmTypes"

export type CharacterDecision =
    | { action: null }
    | {
        action: {
            intentType: string
            payload: Record<string, any>
            confidence: number
        }
    }

export const CharacterDecisionSchema: LLMSchema<CharacterDecision> = {
    parse(data: unknown): CharacterDecision {
        if (typeof data !== "object" || data === null) {
            throw new Error("Character decision must be an object")
        }

        const obj = data as any

        // Explicit no-op
        if (obj.action === null) {
            return { action: null }
        }

        // Action must be an object
        if (typeof obj.action !== "object" || obj.action === null) {
            throw new Error("action must be an object or null")
        }

        const { intentType, payload, confidence } = obj.action

        // intentType
        if (typeof intentType !== "string") {
            throw new Error("intentType must be a string")
        }

        // payload
        if (typeof payload !== "object" || payload === null) {
            throw new Error("payload must be an object")
        }

        // confidence
        if (
            typeof confidence !== "number" ||
            confidence < 0 ||
            confidence > 1
        ) {
            throw new Error("confidence must be between 0 and 1")
        }

        return {
            action: {
                intentType,
                payload,
                confidence,
            },
        }
    },
}
