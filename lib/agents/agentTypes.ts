// /lib/agents/agentTypes.ts

import { GameState } from "@/lib/engine/GameState"
import { AgentIntent } from "@/lib/engine/Event"

/**
 * Input provided to the Director Agent.
 * This is READ-ONLY data for reasoning.
 */
export type DirectorInput = {
    /**
     * Frozen snapshot of the current game state.
     * The Director must NEVER mutate this.
     */
    state: GameState

    /**
     * The player's intent for this turn.
     */
    playerIntent: AgentIntent
}

/**
 * The Director Agent's decision for a single turn.
 * This object controls narrative flow, not state.
 */
export type DirectorDecision = {
    /**
     * Controls how quickly the story advances this turn.
     */
    pacing: "slow" | "normal" | "fast"

    /**
     * Narrative and emotional pressure.
     * Range: 0 (calm) → 100 (crisis)
     */
    tension: number

    /**
     * Hard constraints that downstream agents must respect.
     * These are rules, not suggestions.
     */
    constraints: string[]

    /**
     * Self-reported confidence in this decision.
     * Range: 0.0 → 1.0
     */
    confidence: number
}

/**
 * Input provided to a Character Agent.
 * This is READ-ONLY.
 */
export type CharacterAgentInput = {
    /**
     * Frozen snapshot of the game state.
     */
    state: GameState

    /**
     * The character this agent controls.
     */
    characterId: string

    /**
     * Director constraints for this turn.
     */
    directorDecision: DirectorDecision
}

