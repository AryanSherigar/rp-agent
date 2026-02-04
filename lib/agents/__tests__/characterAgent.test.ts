import { runCharacterAgent } from "../characterAgent"
import { DirectorDecision } from "../agentTypes"
import { GameState } from "@/lib/engine/GameState"

const mockState = {} as GameState

const baseDirector: DirectorDecision = {
    pacing: "normal",
    tension: 50,
    constraints: [],
    confidence: 1,
}

async function testConfidenceGate() {
    const intent = await runCharacterAgent({
        state: mockState,
        characterId: "npc1",
        directorDecision: {
            ...baseDirector,
            constraints: [],
        },
    })

    console.assert(intent !== null, "Intent should pass confidence gate")
}

async function testConstraintBlocksMove() {
    const intent = await runCharacterAgent({
        state: mockState,
        characterId: "npc1",
        directorDecision: {
            ...baseDirector,
            constraints: ["No movement"],
        },
    })

    console.assert(
        intent === null || intent.intentType !== "MOVE",
        "MOVE should be blocked by constraint"
    )
}

async function runTests() {
    await testConfidenceGate()
    await testConstraintBlocksMove()
    console.log("CharacterAgent tests passed")
}

runTests()
