import { GameState } from "./GameState";

export function createInitialGameState(): GameState {
    const now = new Date().toISOString();

    return {
        meta: {
            schemaVersion: "1.0.0",
            tick: 0,
            createdAt: now,
            lastUpdatedAt: now,
            enabledSystems: ["movement"]
        },

        world: {
            locations: {
                village: {
                    id: "village",
                    name: "Village",
                    description: "A quiet village.",
                    tags: ["safe"],
                    connectedLocations: ["forest"],
                    properties: {}
                },
                forest: {
                    id: "forest",
                    name: "Forest",
                    description: "A dark forest.",
                    tags: ["danger"],
                    connectedLocations: ["village"],
                    properties: {}
                }
            },
            facts: {},
            rules: {
                allowViolence: false,
                allowMagic: false,
                tone: "realistic",
                constraints: []
            }
        },

        characters: [
            {
                id: "hero",
                name: "Hero",
                role: "player",
                personality: { traits: [], archetype: "hero" },
                emotions: { trust: 0.5, fear: 0.2, anger: 0.1, hope: 0.7 },
                motivations: {
                    primaryGoal: "Explore",
                    secondaryGoals: [],
                    fears: [],
                    desires: []
                },
                memory: { shortTerm: [], longTerm: [] },
                relationships: [],
                status: {
                    alive: true,
                    locationId: "village",
                    flags: []
                },
                metadata: {}
            }
        ],

        storyDNA: {
            axes: {
                orderChaos: 0.5,
                hopeDespair: 0.6,
                trustBetrayal: 0.5
            },
            mutationHistory: []
        },

        scene: {
            sceneId: "scene-1",
            locationId: "village",
            activeCharacters: ["hero"],
            tone: "calm",
            summary: "The story begins.",
            constraints: []
        },

        history: []
    };
}
