// /lib/llm/narratorSchema.ts

import { LLMSchema } from "./llmTypes"

export type NarrationOutput = {
    text: string
}

export const NarrationSchema: LLMSchema<NarrationOutput> = {
    parse(data: unknown): NarrationOutput {
        if (
            typeof data !== "object" ||
            data === null ||
            typeof (data as any).text !== "string"
        ) {
            throw new Error("Narration output must be { text: string }")
        }

        return { text: (data as any).text }
    },
}
