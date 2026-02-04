import { NextResponse } from "next/server"
import { callGemini } from "@/lib/llm/geminiClient"

export async function GET() {
    const result = await callGemini<{ message: string }>({
        systemPrompt:
            "You are a test system. You must return valid JSON only.",
        userPrompt:
            'Return a JSON object with exactly this shape: { "message": "dead" }',
        schema: {
            parse: (data: unknown) => {
                if (
                    typeof data === "object" &&
                    data !== null &&
                    "message" in data &&
                    typeof (data as any).message === "string"
                ) {
                    return data as { message: string }
                }
                throw new Error("Invalid shape")
            },
        },
    })

    return NextResponse.json(result)
}
