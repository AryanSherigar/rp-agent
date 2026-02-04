"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { CallGeminiOptions, LLMError } from "./llmTypes"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenerativeAI(apiKey)

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const controller = new AbortController()

    const timeout = setTimeout(() => {
        controller.abort()
    }, timeoutMs)

    try {
        return await promise
    } finally {
        clearTimeout(timeout)
    }
}

export async function callGemini<T>(
    options: CallGeminiOptions<T>
): Promise<T> {
    const {
        systemPrompt,
        userPrompt,
        schema,
        maxRetries = 2,
        timeoutMs = 8000,
    } = options

    let attempt = 0
    let lastError: unknown = null

    while (attempt <= maxRetries) {
        try {
            attempt++

            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
            })

            const result = await withTimeout(
                model.generateContent(`${systemPrompt}\n\n${userPrompt}`),
                timeoutMs
            )

            const responseText = result.response.text()

            if (!responseText) {
                throw new LLMError(
                    "PROVIDER_ERROR",
                    "Gemini returned empty response",
                    false
                )
            }

            let parsedJson: unknown
            try {
                parsedJson = JSON.parse(responseText)
            } catch {
                throw new LLMError(
                    "INVALID_JSON",
                    "Gemini did not return valid JSON",
                    true
                )
            }

            let validated: T
            try {
                validated = schema.parse(parsedJson)
            } catch {
                throw new LLMError(
                    "SCHEMA_VALIDATION_FAILED",
                    "Gemini response failed schema validation",
                    true
                )
            }

            return validated
        } catch (err) {
            lastError = err

            if (
                err instanceof LLMError &&
                err.retryable &&
                attempt <= maxRetries
            ) {
                continue
            }

            break
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new LLMError("UNKNOWN", "Gemini call failed", false)
}


