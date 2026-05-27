"use client"

import { useMemo } from "react"
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react"
import type { CircuitData, CorrectnessAnalysis } from "@/types/circuit"

interface CorrectnessMetricsProps {
    circuitData: CircuitData
}

export default function CorrectnessMetrics({ circuitData }: CorrectnessMetricsProps) {
    const analysis = useMemo(() => {
        return analyzeCircuitCorrectness(circuitData)
    }, [circuitData])

    const getScoreColor = (score: number, maxScore: number) => {
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
        if (percentage >= 80) return "text-green-600"
        if (percentage >= 60) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBgColor = (score: number, maxScore: number) => {
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
        if (percentage >= 80) return "bg-green-100"
        if (percentage >= 60) return "bg-yellow-100"
        return "bg-red-100"
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Circuit Analysis
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Overall Score */}
                <div className={`p-3 rounded-lg ${getScoreBgColor(analysis.score, analysis.maxScore)}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Correctness Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(analysis.score, analysis.maxScore)}`}>
                            {analysis.score}/{analysis.maxScore}
                        </span>
                    </div>
                    <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${analysis.maxScore > 0 && analysis.score / analysis.maxScore >= 0.8
                                ? "bg-green-500"
                                : analysis.maxScore > 0 && analysis.score / analysis.maxScore >= 0.6
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            style={{
                                width: `${analysis.maxScore > 0 ? (analysis.score / analysis.maxScore) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Issues */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Issues Found</h4>
                    {analysis.issues.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>No issues detected</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {analysis.issues.map((issue, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-2 p-2 rounded text-sm ${issue.type === "error"
                                        ? "bg-red-50 text-red-700"
                                        : issue.type === "warning"
                                            ? "bg-yellow-50 text-yellow-700"
                                            : "bg-blue-50 text-blue-700"
                                        }`}
                                >
                                    {issue.type === "error" && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                    {issue.type === "warning" && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                    {issue.type === "info" && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                    <span className="flex-1">{issue.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
                        <div className="space-y-1">
                            {analysis.suggestions.map((suggestion, index) => (
                                <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    • {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Components</div>
                        <div className="text-gray-600">{circuitData.components.length}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Connections</div>
                        <div className="text-gray-600">{circuitData.connections.length}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Circuit correctness analysis logic
function analyzeCircuitCorrectness(circuitData: CircuitData): CorrectnessAnalysis {
    const issues: CorrectnessAnalysis["issues"] = []
    const suggestions: string[] = []
    let score = 0
    let maxScore = 0

    // Basic checks
    maxScore += 10 // Has components
    if (circuitData.components.length > 0) {
        score += 10
    } else {
        issues.push({
            type: "error",
            message: "Circuit has no components",
        })
    }

    // Power supply check
    maxScore += 15
    const hasPowerSupply = circuitData.components.some(
        (comp) => comp.type.includes("arduino") || comp.type.includes("esp32"),
    )
    if (hasPowerSupply) {
        score += 15
    } else {
        issues.push({
            type: "warning",
            message: "No microcontroller or power supply detected",
        })
        suggestions.push("Add a microcontroller like Arduino Uno or ESP32 for power and control")
    }

    // Connection validation
    maxScore += 20
    let connectionScore = 0

    circuitData.connections.forEach((conn) => {
        const fromComponent = circuitData.components.find((c) => c.id === conn.from.componentId)
        const toComponent = circuitData.components.find((c) => c.id === conn.to.componentId)

        if (fromComponent && toComponent) {
            const fromPin = fromComponent.pins.find((p) => p.id === conn.from.pinId)
            const toPin = toComponent.pins.find((p) => p.id === conn.to.pinId)

            if (fromPin && toPin) {
                // Check for valid pin type connections
                if (fromPin.type === "power" && toPin.type === "power") {
                    connectionScore += 2
                } else if (fromPin.type === "ground" && toPin.type === "ground") {
                    connectionScore += 2
                } else if (fromPin.type === "output" && toPin.type === "input") {
                    connectionScore += 3
                } else if (fromPin.type === "input" && toPin.type === "output") {
                    connectionScore += 3
                } else {
                    issues.push({
                        type: "warning",
                        message: `Questionable connection: ${fromPin.name} (${fromPin.type}) to ${toPin.name} (${toPin.type})`,
                        connectionId: conn.id,
                    })
                }
            }
        }
    })

    score += Math.min(connectionScore, 20)

    // Ground connections check
    maxScore += 10
    const groundConnections = circuitData.connections.filter((conn) => {
        const fromComponent = circuitData.components.find((c) => c.id === conn.from.componentId)
        const toComponent = circuitData.components.find((c) => c.id === conn.to.componentId)
        const fromPin = fromComponent?.pins.find((p) => p.id === conn.from.pinId)
        const toPin = toComponent?.pins.find((p) => p.id === conn.to.pinId)
        return fromPin?.type === "ground" || toPin?.type === "ground"
    })

    if (groundConnections.length > 0) {
        score += 10
    } else if (circuitData.components.length > 1) {
        issues.push({
            type: "warning",
            message: "No ground connections found - components may not share common ground",
        })
        suggestions.push("Connect ground pins of components together for proper operation")
    }

    // Component diversity bonus
    maxScore += 5
    const componentTypes = new Set(circuitData.components.map((c) => c.type))
    if (componentTypes.size >= 3) {
        score += 5
        issues.push({
            type: "info",
            message: `Good component diversity: ${componentTypes.size} different types`,
        })
    }

    // Final suggestions based on analysis
    if (circuitData.connections.length === 0 && circuitData.components.length > 1) {
        suggestions.push("Connect components together to create a functional circuit")
    }

    if (score === maxScore && issues.filter((i) => i.type === "error").length === 0) {
        issues.push({
            type: "info",
            message: "Circuit appears to be well-structured!",
        })
    }

    return {
        score,
        maxScore,
        issues,
        suggestions,
    }
}
