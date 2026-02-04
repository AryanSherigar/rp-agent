// /lib/llm/llmTypes.ts

/**
 * A JSON schema validator function.
 * You can back this with Zod, Valibot, Ajv, or a manual check later.
 */
export type LLMSchema<T> = {
    parse: (data: unknown) => T
}

/**
 * Options passed to the Gemini client wrapper.
 * This file intentionally knows NOTHING about Gemini itself.
 */
export type CallGeminiOptions<T> = {
    systemPrompt: string
    userPrompt: string

    /**
     * Schema used to validate and strongly type the response.
     * If parsing fails, the call must retry or fail.
     */
    schema: LLMSchema<T>

    /**
     * Retry behavior
     */
    maxRetries?: number        // default: 2
    timeoutMs?: number         // default: 8000
}

/**
 * Canonical error types for all LLM failures.
 * Agents and engine code should only ever see THESE.
 */
export type LLMErrorType =
    | "TIMEOUT"
    | "INVALID_JSON"
    | "SCHEMA_VALIDATION_FAILED"
    | "PROVIDER_ERROR"
    | "UNKNOWN"

/**
 * Normalized error thrown by the LLM layer.
 * No SDK-specific garbage should leak past this.
 */
export class LLMError extends Error {
    readonly type: LLMErrorType
    readonly retryable: boolean

    constructor(
        type: LLMErrorType,
        message: string,
        retryable: boolean = false
    ) {
        super(message)
        this.name = "LLMError"
        this.type = type
        this.retryable = retryable
    }
}
