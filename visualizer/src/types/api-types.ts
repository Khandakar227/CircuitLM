/**
 * API types for circuit generation backend communication
 */

export interface CircuitGenerateRequest {
    prompt: string;
    model_id?: string;
    cot?: boolean;
    eval?: boolean;
    save_output?: boolean;
    output_path?: string;
}

export interface CircuitGenerateResponse {
    success: boolean;
    data: {
        user_prompt: string;
        reasoning: string;
        components: any[];
        schematic: string;
        evaluation?: any;
    };
    metadata: {
        components_count: number;
        matched_components_count: number;
        model_id: string;
        timestamp: number;
    };
    output_file?: string;
}

export interface CircuitGenerateErrorResponse {
    success: false;
    error: string;
    timestamp: number;
}
