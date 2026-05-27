import { NextResponse } from "next/server"
import { CircuitGenerateRequest, CircuitGenerateResponse } from "@/types/api-types"

// Backend API endpoint.
// Use 127.0.0.1 (not "localhost"): Node 18+ fetch resolves "localhost" to IPv6
// (::1) first, but the backend binds to 0.0.0.0 (IPv4), causing ECONNREFUSED.
const BACKEND_API_URL = process.env.CIRCUIT_API_URL || "http://127.0.0.1:8000"

export async function POST(request: Request) {
    const data = await request.json()

    if (!data?.content) {
        return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    try {
        // Prepare request for backend API
        const apiRequest: CircuitGenerateRequest = {
            prompt: data.content,
            model_id: data.model_id || "gemini",
            cot: data.cot !== undefined ? data.cot : false,
            eval: data.eval !== undefined ? data.eval : false,
            save_output: false,
        }

        // Call backend API
        const response = await fetch(`${BACKEND_API_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(apiRequest),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Backend API error:", errorText)
            // Forward the backend's actual error (e.g. an OOD halt message) so the
            // client can display it, instead of a generic status code.
            let backendError = `Backend API failed with status ${response.status}`
            try {
                const errJson = JSON.parse(errorText)
                backendError = errJson?.detail?.error || errJson?.error || backendError
            } catch { /* non-JSON error body */ }
            return NextResponse.json({
                data: JSON.stringify({}, null, 2),
                warning: "Circuit generation failed.",
                error: backendError,
            })
        }

        const apiResponse: CircuitGenerateResponse = await response.json()

        if (!apiResponse.success) {
            throw new Error("Backend API returned unsuccessful response")
        }

        console.log(apiResponse);

        // The backend returns the schematic as a JSON string in data.schematic
        // We need to parse it and return it as a JSON string for the visualizer
        const schematicData = apiResponse.data.schematic

        return NextResponse.json({
            data: schematicData,
        })
    } catch (error) {
        console.error("Error processing circuit generation:", error)
        return NextResponse.json({
            data: JSON.stringify({}, null, 2),
            warning: "Circuit generation failed. Make sure the backend server is running at " + BACKEND_API_URL,
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
