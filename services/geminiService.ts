import { GoogleGenAI } from "@google/genai";
import { 
  GameState, 
  PlayerInput
} from "../types";

// Helper to ensure API Key exists
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const MODEL_NAME = 'gemini-3-flash-preview';
const SEPARATOR = "___METADATA___";

/**
 * Scans recent history and current input to find triggered Story Cards.
 * Returns the content of triggered cards to be injected into context.
 */
const getActiveStoryCards = (state: GameState, input: PlayerInput): string => {
  if (!state.storyCards || state.storyCards.length === 0) return "";

  // Combine recent text to scan against
  const recentHistoryText = state.history
    .slice(-3) // Look at last 3 turns
    .map(h => h.description)
    .join(' ')
    .toLowerCase();
  
  const inputText = input.content.toLowerCase();
  const combinedText = `${recentHistoryText} ${inputText}`;

  // Find matches
  const matchedCards = state.storyCards.filter(card => {
    return card.keys.some(key => {
      const cleanKey = key.trim().toLowerCase();
      if (!cleanKey) return false;
      // Simple inclusion check, could be regex for word boundaries in future
      return combinedText.includes(cleanKey);
    });
  });

  if (matchedCards.length === 0) return "";

  return matchedCards.map(card => `[World Info - ${card.title}]: ${card.entry}`).join('\n');
};

/**
 * EXECUTE TURN STREAM
 * Streams the narrative text first, then parses the JSON metadata.
 * This ensures immediate UI feedback (responsiveness) while maintaining state integrity.
 */
export async function* executeTurnStream(
  state: GameState,
  input: PlayerInput
) {
  const ai = getAIClient();

  // CRITICAL: Include ID in the context so the LLM can reference it in the JSON response
  const characterContext = state.characters.map(c => 
    `ID[${c.id}] Name[${c.name}] Role[${c.role}]\n   - Status: ${c.status}\n   - Psychology: [Trust:${c.emotions.trust} (0=Paranoid, 100=Blind Faith), Fear:${c.emotions.fear} (0=Brave, 100=Terrified), Anger:${c.emotions.anger}, Hope:${c.emotions.hope}]\n   - Description: ${c.description}`
  ).join('\n');

  const historyContext = state.history
    .slice(-8)
    .map(h => `[${h.type}] ${h.description}`)
    .join('\n');

  // Trigger Story Cards
  const storyCardContext = getActiveStoryCards(state, input);

  // We ask for text first, then a specific separator, then JSON.
  const prompt = `
    You are the CORE ENGINE of an advanced interactive role-play simulation.
    Your goal is to weave a compelling, consequence-driven narrative where characters are psychologically deep and the world reacts realistically to the player.

    === CURRENT SIMULATION STATE ===
    Title: ${state.title}
    Location: ${state.world.locations[state.world.currentLocationId].name} (${state.world.locations[state.world.currentLocationId].description})
    Time/Context: ${state.world.time}
    
    [STORY DNA] (Thematic Resonance)
    - Order <--> Chaos (${state.storyDNA.orderChaos}/100): Low=Strict/Stagnant, High=Anarchy/Unpredictable.
    - Hope <--> Despair (${state.storyDNA.hopeDespair}/100): Low=Optimistic, High=Grim/Nihilistic.
    - Trust <--> Betrayal (${state.storyDNA.trustBetrayal}/100): Low=Honest, High=Deceptive.

    [DIRECTOR OVERRIDE]
    - Target Tension: ${state.directorState.tension}/100
    - Pacing: ${state.directorState.pacing}
    - Current Narrative Focus: "${state.directorState.narrativeFocus}"

    [CHARACTERS PRESENT]
    ${characterContext}

    [KNOWLEDGE BASE (Active Context)]
    Facts: ${state.world.facts.slice(-5).join('; ')}
    ${storyCardContext ? `Triggered Lore:\n${storyCardContext}` : ""}

    [RECENT HISTORY]
    ${historyContext}
    
    === PLAYER INPUT ===
    Type: ${input.type}
    Content: "${input.content}"
    
    === INSTRUCTIONS ===
    
    PHASE 1: NARRATIVE GENERATION
    Write the next segment of the story. 
    1. **Show, Don't Tell**: Use sensory details (sound, smell, light) to ground the scene.
    2. **Psychological Consistency**: Characters MUST act according to their current stats.
       - High Fear (>70): Stuttering, defensive posture, irrationality.
       - Low Trust (<30): Withholding info, suspicion, lying.
       - High Anger (>70): Aggression, shouting, impulsiveness.
    3. **Consequence**: The player's input matters. If they fail, let them fail. If they succeed, reward them. Do not god-mode the player.
    4. **Director Influence**: 
       - If Tension is High (>70), use short sentences, cliffhangers, and immediate threats.
       - If Pacing is Fast, skip pleasantries and move to action.
    5. **Output**: Just the story text. No prefixes.

    PHASE 2: SEPARATOR
    Output exactly "${SEPARATOR}" on a new line.

    PHASE 3: STATE SIMULATION (JSON)
    Analyze the narrative you just wrote and update the mathematical state of the world.
    
    1. **Character Updates**:
       - Adjust emotions based on *events*. 
       - Example: Player threatens NPC -> NPC Fear +15, Trust -20.
       - Example: Player helps NPC -> NPC Hope +10, Trust +15.
       - **Status**: Update status strings (e.g., "Wounded", "Terrified", "Unconscious") if changed.
       - **Death**: If a character dies, set status to "Dead".

    2. **Story DNA Mutation**:
       - Did the scene become more chaotic/violent? Increase OrderChaos.
       - Did a secret get revealed or a lie told? Increase TrustBetrayal.
       - Did the situation look grim? Increase HopeDespair.
       - Shift values by 1-5 for minor events, 10-25 for major plot twists.

    3. **Director Logic (The GM)**:
       - **Tension**: Did the player resolve the threat? Lower tension. Did they make it worse? Raise it.
       - **Pacing**: Decide if the next scene should breathe (Slow) or accelerate (Fast).
       - **Narrative Focus**: Give yourself a short directive for the *next* turn (e.g., "The villain escapes," "Reveal the secret door").
       - **Hints**: Provide 3 short, actionable options for the player based on the new context.

    4. **World Updates**:
       - add NEW facts if learned.

    Output valid JSON matching this schema:
    {
      "director": {
        "pacing": "Slow" | "Normal" | "Fast",
        "tension": number,
        "narrativeFocus": string,
        "suggestedHints": string[]
      },
      "world": {
        "characterUpdates": [
          {
            "id": string, 
            "emotions": { "trust": number, "fear": number, "anger": number, "hope": number },
            "status": string
          }
        ],
        "newFacts": string[],
        "dnaShift": { "orderChaos": number, "hopeDespair": number, "trustBetrayal": number }
      }
    }
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: prompt,
    });

    let buffer = "";
    let narrativeFinished = false;

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (!text) continue;
      
      buffer += text;
      
      if (!narrativeFinished) {
        const splitIndex = buffer.indexOf(SEPARATOR);
        if (splitIndex !== -1) {
          narrativeFinished = true;
          // Extract the final clean narrative
          const narrative = buffer.substring(0, splitIndex).trim();
          yield { type: 'text', content: narrative };
          
          // Keep only the potential JSON part in the buffer
          buffer = buffer.substring(splitIndex + SEPARATOR.length);
        } else {
          // Yield the full buffer as the current narrative draft
          yield { type: 'text', content: buffer };
        }
      }
    }

    // If the stream ends but we never saw the separator, we assume it's just text
    // and no state update occurred (or an error occurred in generation).
    if (!narrativeFinished) {
      // Just yield what we have as text
      yield { type: 'text', content: buffer };
      return; 
    }

    // Parse the JSON from the remaining buffer
    try {
      // Clean up markdown code blocks if present
      const jsonStr = buffer.trim()
        .replace(/^```json\s*/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
        
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        // Include triggered keys in the data payload for UI feedback (optional, handled by active check in UI for now)
        yield { type: 'final', data };
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Buffer was:", buffer);
      // We purposefully don't yield 'final' here to avoid crashing the state reducer
    }

  } catch (error) {
    console.error("Stream Error:", error);
    yield { type: 'text', content: "The simulation wavers... (Connection Error)" };
  }
}

// Deprecated
export const executeTurn = async () => { throw new Error("Deprecated"); };
export const runDirectorAgent = async () => { throw new Error("Deprecated"); };
export const runWorldSimulation = async () => { throw new Error("Deprecated"); };