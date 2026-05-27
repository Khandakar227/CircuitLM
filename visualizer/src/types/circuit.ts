
// Type definitions
export type CircuitEntry = {
    prompt: string;
    circuit: CircuitJson;
};

export type CircuitJson = {
    version: number;
    author: string;
    parts: Array<{
        type: string;
        id: string;
        top: number;
        left: number;
        attrs: Record<string, any>;
        rotate?: number;
    }>;
    connections: Array<[string, string, string, string[]]>;
};

export interface Pin {
    id: string
    name: string
    type: "input" | "output" | "power" | "ground"
}

export interface ComponentInstance {
    id: string
    type: string
    position: { x: number; y: number }
    rotation: number
    pins: Pin[]
}

export interface Connection {
    id: string
    from: { componentId: string; pinId: string }
    to: { componentId: string; pinId: string }
}

export interface CircuitData {
    components: ComponentInstance[]
    connections: Connection[]
    metadata: {
        createdAt: string
        version: string
        totalComponents: number
        totalConnections: number
    }
}

export interface CorrectnessAnalysis {
    score: number
    maxScore: number
    issues: Array<{
        type: "error" | "warning" | "info"
        message: string
        componentId?: string
        connectionId?: string
    }>
    suggestions: string[]
}
