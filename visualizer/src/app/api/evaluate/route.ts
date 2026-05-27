import { NextResponse } from "next/server"

// Backend API endpoint (see circuit-generation/route.ts for the 127.0.0.1 note).
const BACKEND_API_URL = process.env.CIRCUIT_API_URL || "http://127.0.0.1:8000"

export async function POST(request: Request) {
    const data = await request.json()

    if (!data?.schematic) {
        return NextResponse.json({ success: false, error: "Missing schematic to evaluate" }, { status: 400 })
    }

    try {
        const response = await fetch(`${BACKEND_API_URL}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: data.prompt || "",
                schematic: data.schematic,
                model_id: data.model_id || "deepseek",
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Backend evaluate error:", errorText)
            throw new Error(`Backend evaluation failed with status ${response.status}`)
        }

        const apiResponse = await response.json()
        return NextResponse.json({
            success: true,
            evaluation: apiResponse?.data?.evaluation ?? null,
        })
    } catch (error) {
        console.error("Error processing evaluation:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                warning: "Evaluation failed. Make sure the backend server is running at " + BACKEND_API_URL,
            },
            { status: 200 },
        )
    }
}
