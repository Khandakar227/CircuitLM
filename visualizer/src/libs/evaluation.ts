import { CircuitJson } from "../types/circuit";
/**
 * Circuit Evaluation Function
 * Compares generated circuits against ground truth circuits
 * Returns a score: 1 = Very poor/illogical, 3 = Minor issues, 5 = Valid
 */

function evaluateCircuit(circuitData:{generatedJson: CircuitJson, fixedJson: CircuitJson, prompt: string}) {
    const { generatedJson, fixedJson } = circuitData;
    
    // Scoring weights
    const weights = {
        parts: 0.4,        // 40% weight for correct parts
        connections: 0.6   // 60% weight for correct connections
    };
    
    // Evaluate parts
    const partsScore = evaluateParts(generatedJson.parts, fixedJson.parts);
    
    // Evaluate connections
    const connectionsScore = evaluateConnections(generatedJson.connections, fixedJson.connections);
    
    // Calculate weighted score
    const rawScore = (partsScore * weights.parts) + (connectionsScore * weights.connections);
    
    // Convert to 1-5 scale
    const finalScore = Math.round(rawScore * 4) + 1; // Maps 0-1 to 1-5
    
    return {
        score: Math.max(1, Math.min(5, finalScore)), // Ensure score is between 1-5
        breakdown: {
            partsScore: Math.round(partsScore * 100) / 100,
            connectionsScore: Math.round(connectionsScore * 100) / 100,
            details: {
                parts: getPartsAnalysis(generatedJson.parts, fixedJson.parts),
                connections: getConnectionsAnalysis(generatedJson.connections, fixedJson.connections)
            }
        }
    };
}

function evaluateParts(generatedParts:CircuitJson["parts"], fixedParts:CircuitJson["parts"]) {
    if (fixedParts.length === 0) return generatedParts.length === 0 ? 1 : 0;
    
    // Check for correct component types and IDs
    const fixedPartsMap = new Map();
    fixedParts.forEach(part => {
        fixedPartsMap.set(part.id, part.type);
    });
    
    const generatedPartsMap = new Map();
    generatedParts.forEach(part => {
        generatedPartsMap.set(part.id, part.type);
    });
    
    let correctParts = 0;
    let totalParts = fixedParts.length;
    
    // Count correctly matched parts (same ID and type)
    fixedParts.forEach(fixedPart => {
        if (generatedPartsMap.has(fixedPart.id) && 
            generatedPartsMap.get(fixedPart.id) === fixedPart.type) {
            correctParts++;
        }
    });
    
    // Penalty for extra parts not in ground truth
    const extraParts = generatedParts.length - fixedParts.length;
    const extraPenalty = Math.max(0, extraParts) * 0.1;
    
    return Math.max(0, (correctParts / totalParts) - extraPenalty);
}

function evaluateConnections(generatedConnections:CircuitJson["connections"], fixedConnections:CircuitJson["connections"]) {
    if (fixedConnections.length === 0) return generatedConnections.length === 0 ? 1 : 0;
    
    // Normalize connections for comparison (handle bidirectionality)
    const normalizedFixed = fixedConnections.map(normalizeConnection);
    const normalizedGenerated = generatedConnections.map(normalizeConnection);
    
    let correctConnections = 0;
    let totalConnections = fixedConnections.length;
    
    // Check each fixed connection against generated connections
    normalizedFixed.forEach(fixedConn => {
        const hasMatch = normalizedGenerated.some(genConn => 
            connectionsMatch(fixedConn, genConn)
        );
        if (hasMatch) correctConnections++;
    });
    
    // Penalty for extra connections not in ground truth
    const extraConnections = generatedConnections.length - fixedConnections.length;
    const extraPenalty = Math.max(0, extraConnections) * 0.05;
    
    return Math.max(0, (correctConnections / totalConnections) - extraPenalty);
}

function normalizeConnection(connection: CircuitJson["connections"][0]) {
    const [pin1, pin2, color, waypoints] = connection;
    
    // Sort pins to handle bidirectionality
    // "power:vcc" -> "motor1:+" should match "motor1:+" -> "power:vcc"
    const [sortedPin1, sortedPin2] = [pin1, pin2].sort();
    
    return {
        pin1: sortedPin1,
        pin2: sortedPin2,
        color: color, // Color can be different, so we'll ignore it in comparison
        waypoints: waypoints || []
    };
}

function connectionsMatch(conn1: { pin1: any; pin2: any; color?: string; waypoints?: string[]; }, conn2: { pin1: any; pin2: any; color?: string; waypoints?: string[]; }) {
    // Check if pins match (ignoring color as specified)
    return conn1.pin1 === conn2.pin1 && conn1.pin2 === conn2.pin2;
}

function getPartsAnalysis(generatedParts:CircuitJson["parts"], fixedParts:CircuitJson["parts"]) {
    const fixedPartsMap = new Map();
    fixedParts.forEach(part => {
        fixedPartsMap.set(part.id, part.type);
    });
    
    const generatedPartsMap = new Map();
    generatedParts.forEach(part => {
        generatedPartsMap.set(part.id, part.type);
    });
    
    const missing: string[] = [];
    const incorrect: { id: string; expected: string; actual: any; }[] = [];
    const extra: string[] = [];
    const correct: string[] = [];
    
    // Check fixed parts against generated
    fixedParts.forEach(fixedPart => {
        if (!generatedPartsMap.has(fixedPart.id)) {
            missing.push(fixedPart.id);
        } else if (generatedPartsMap.get(fixedPart.id) !== fixedPart.type) {
            incorrect.push({
                id: fixedPart.id,
                expected: fixedPart.type,
                actual: generatedPartsMap.get(fixedPart.id)
            });
        } else {
            correct.push(fixedPart.id);
        }
    });
    
    // Check for extra parts in generated
    generatedParts.forEach(genPart => {
        if (!fixedPartsMap.has(genPart.id)) {
            extra.push(genPart.id);
        }
    });
    
    return { correct, missing, incorrect, extra };
}

function getConnectionsAnalysis(generatedConnections:CircuitJson["connections"], fixedConnections:CircuitJson["connections"]) {
    const normalizedFixed = fixedConnections.map(normalizeConnection);
    const normalizedGenerated = generatedConnections.map(normalizeConnection);
    
    const missing: string[] = [];
    const extra: string[] = [];
    const correct: string[] = [];
    
    // Find missing connections
    normalizedFixed.forEach((fixedConn, index) => {
        const hasMatch = normalizedGenerated.some(genConn => 
            connectionsMatch(fixedConn, genConn)
        );
        if (hasMatch) {
            correct.push(`${fixedConn.pin1} <-> ${fixedConn.pin2}`);
        } else {
            missing.push(`${fixedConn.pin1} <-> ${fixedConn.pin2}`);
        }
    });
    
    // Find extra connections
    normalizedGenerated.forEach(genConn => {
        const hasMatch = normalizedFixed.some(fixedConn => 
            connectionsMatch(fixedConn, genConn)
        );
        if (!hasMatch) {
            extra.push(`${genConn.pin1} <-> ${genConn.pin2}`);
        }
    });
    
    return { correct, missing, extra };
}

// Batch evaluation function for multiple circuits
function evaluateCircuitDataset(circuitDataset: any[]) {
    const results = circuitDataset.map((circuitData, index) => ({
        index,
        prompt: circuitData.prompt,
        evaluation: evaluateCircuit(circuitData)
    }));
    
    const scores = results.map(r => r.evaluation.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const distribution = {
        1: scores.filter(s => s === 1).length,
        2: scores.filter(s => s === 2).length,
        3: scores.filter(s => s === 3).length,
        4: scores.filter(s => s === 4).length,
        5: scores.filter(s => s === 5).length
    };
    
    return {
        results,
        summary: {
            averageScore: Math.round(avgScore * 100) / 100,
            totalCircuits: circuitDataset.length,
            distribution,
            percentageValid: Math.round((scores.filter(s => s >= 4).length / scores.length) * 100)
        }
    };
}

// Example usage:
/*
const circuitData = {
    prompt: "Sonar sensor connection with an arduino on top of a servo",
    generatedJson: { ... },
    fixedJson: { ... }
};

const evaluation = evaluateCircuit(circuitData);
console.log('Score:', evaluation.score);
console.log('Parts Score:', evaluation.breakdown.partsScore);
console.log('Connections Score:', evaluation.breakdown.connectionsScore);
console.log('Details:', evaluation.breakdown.details);

// For batch evaluation:
const dataset = [circuitData1, circuitData2, ...];
const batchResults = evaluateCircuitDataset(dataset);
console.log('Average Score:', batchResults.summary.averageScore);
console.log('Score Distribution:', batchResults.summary.distribution);
*/

module.exports = { evaluateCircuit, evaluateCircuitDataset };