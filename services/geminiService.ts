import {
  GameState,
  PlayerInput,
} from '../types';

export async function* executeTurnStream(
  state: GameState,
  input: PlayerInput,
) {
  try {
    const response = await fetch('/api/turn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state, input }),
    });

    if (!response.ok) {
      throw new Error(`Turn request failed with status ${response.status}`);
    }

    const payload = await response.json();

    if (payload.narrative) {
      yield { type: 'text', content: payload.narrative };
    }

    if (payload.director && payload.world) {
      yield {
        type: 'final',
        data: {
          director: payload.director,
          world: payload.world,
        },
      };
    }
  } catch (error) {
    console.error('Turn request error:', error);
    yield { type: 'text', content: 'The simulation wavers... (Connection Error)' };
  }
}

// Deprecated
export const executeTurn = async () => { throw new Error('Deprecated'); };
export const runDirectorAgent = async () => { throw new Error('Deprecated'); };
export const runWorldSimulation = async () => { throw new Error('Deprecated'); };
