// /lib/llm/directorSchema.ts

import { LLMSchema } from "./llmTypes"
import { DirectorDecision } from "@/lib/agents/agentTypes"

export const DirectorDecisionSchema: LLMSchema<DirectorDecision> = {
    parse(data: unknown): DirectorDecision {
        if (typeof data !== "object" || data === null) {
            throw new Error("DirectorDecision must be an object")
        }

        const obj = data as any

        // pacing
        if (!["slow", "normal", "fast"].includes(obj.pacing)) {
            throw new Error("Invalid pacing value")
        }

        // tension
        if (
            typeof obj.tension !== "number" ||
            obj.tension < 0 ||
            obj.tension > 100
        ) {
            throw new Error("Tension must be a number between 0 and 100")
        }

        // constraints
        if (
            !Array.isArray(obj.constraints) ||
            !obj.constraints.every((c: any) => typeof c === "string")
        ) {
            throw new Error("Constraints must be an array of strings")
        }

        // confidence
        if (
            typeof obj.confidence !== "number" ||
            obj.confidence < 0 ||
            obj.confidence > 1
        ) {
            throw new Error("Confidence must be between 0 and 1")
        }

        return {
            pacing: obj.pacing,
            tension: obj.tension,
            constraints: obj.constraints,
            confidence: obj.confidence,
        }
    },
}
