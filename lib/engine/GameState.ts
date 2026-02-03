/* =========================
   Turn State
   ========================= */
export type TurnOwner = "PLAYER" | "NPC" | "WORLD";

export type PhaseType = "START" | "ACTION" | "RESOLVE";


/* =========================
   Root Game State Contract
   ========================= */

export interface GameState {
    meta: MetaState;
    world: WorldState;
    characters: CharacterState[];
    storyDNA: StoryDNAState;
    scene: SceneState;
    history: EventLogEntry[];
}

/* =========================
   Meta (Versioning & Safety)
   ========================= */

export interface MetaState {
    schemaVersion: "1.0.0";
    tick: number;
    createdAt: string;
    lastUpdatedAt: string;
    enabledSystems: string[];
    currentTurn: TurnOwner;
    phase: PhaseType;
}

/* =========================
   World State
   ========================= */

export interface WorldState {
    locations: Record<string, Location>;
    facts: Record<string, Fact>;
    rules: WorldRules;
}

export interface Location {
    id: string;
    name: string;
    description: string;
    tags: string[];
    connectedLocations: string[];
    properties: Record<string, any>;
}

export interface Fact {
    id: string;
    description: string;
    scope: "global" | "local" | "character";
    relatedEntities: string[];
    confidence: number;
}

export interface WorldRules {
    allowViolence: boolean;
    allowMagic: boolean;
    tone: "realistic" | "fantasy" | "grim";
    constraints: string[];
}

/* =========================
   Character State
   ========================= */

export interface CharacterState {
    id: string;
    name: string;
    role: string;

    personality: PersonalityModel;
    emotions: EmotionModel;
    motivations: MotivationModel;

    memory: MemoryState;
    relationships: RelationshipState[];

    status: StatusState;
    metadata: Record<string, any>;
}

export interface PersonalityModel {
    traits: string[];
    archetype: string;
    alignment?: string;
}

export interface EmotionModel {
    trust: number;
    fear: number;
    anger: number;
    hope: number;
}

export interface MotivationModel {
    primaryGoal: string;
    secondaryGoals: string[];
    fears: string[];
    desires: string[];
}

export interface MemoryState {
    shortTerm: MemoryEntry[];
    longTerm: MemoryEntry[];
}

export interface MemoryEntry {
    eventId: string;
    summary: string;
    emotionalImpact: Partial<EmotionModel>;
    importance: number;
    timestamp: number;
}

export interface RelationshipState {
    with: string;
    trust: number;
    history: string[];
}

export interface StatusState {
    alive: boolean;
    injured?: boolean;
    locationId: string;
    flags: string[];
}

/* =========================
   Story DNA
   ========================= */

export interface StoryDNAState {
    axes: {
        orderChaos: number;
        hopeDespair: number;
        trustBetrayal: number;
    };
    mutationHistory: DNAEvent[];
}

export interface DNAEvent {
    cause: string;
    delta: Record<string, number>;
    tick: number;
}

/* =========================
   Scene State
   ========================= */

export interface SceneState {
    sceneId: string;
    locationId: string;
    activeCharacters: string[];
    tone: string;
    summary: string;
    constraints: string[];
}

/* =========================
   Event Log
   ========================= */

export interface EventLogEntry {
    id: string;
    type: "player" | "character" | "world" | "director";
    description: string;
    stateChanges: string[];
    tick: number;
}
