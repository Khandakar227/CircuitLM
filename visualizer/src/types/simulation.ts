export interface SimulationPin {
    id: string
    name: string
    state: boolean
    mode: "INPUT" | "OUTPUT" | "INPUT_PULLUP"
}

export interface SimulationComponent {
    id: string
    type: string
    pins: Record<string, SimulationPin>
    state: Record<string, any>
}

export interface SimulationState {
    isRunning: boolean
    components: Record<string, SimulationComponent>
    connections: Array<{
        from: { componentId: string; pinId: string }
        to: { componentId: string; pinId: string }
    }>
    serialOutput: string[]
}

export interface CircuitJson {
    parts: Array<{
        id: string
        type: string
        left: number
        top: number
        [key: string]: any
    }>
    connections: Array<[string, string, string, Array<{ x: number; y: number }>]>
}
