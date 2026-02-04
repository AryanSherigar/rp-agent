// /lib/agents/characterAgent.ts

import { AgentIntent } from "@/lib/engine/Event"
import { CharacterAgentInput } from "./agentTypes"

/**
 * Runs a Character Agent for a single turn.
 *
 * Returns:
 * - AgentIntent → propose an action
 * - null → take no action
 *
 * This is a stub. Real reasoning comes later.
 */
export async function runCharacterAgent(
    _input: CharacterAgentInput
): Promise<AgentIntent | null> {
    // Correct representation of inaction
    return null
}
