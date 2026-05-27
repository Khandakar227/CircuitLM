"use client"

import { useState } from "react"
import { Copy, Code, Download, Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { CircuitData } from "@/types/circuit"

interface JsonViewerProps {
    data: CircuitData
}

export default function JsonViewer({ data }: JsonViewerProps) {
    const [copied, setCopied] = useState(false)

    const jsonString = JSON.stringify(data, null, 2)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `circuit-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Code className="w-4 h-4" />
                        Circuit Data (JSON)
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                            title="Copy JSON"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleDownload}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                            title="Download JSON"
                        >
                            <Download className="w-4 h-4" />
                        </Button>

                        {/* Expand into modal */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                                    title="Expand JSON"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Code className="w-5 h-5" />
                                        Circuit Data (JSON)
                                    </DialogTitle>
                                </DialogHeader>
                                <pre className="text-xs font-mono bg-gray-50 p-4 rounded border h-full overflow-auto">
                                    <SyntaxHighlightedJson json={jsonString} />
                                </pre>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button onClick={handleCopy} variant="outline">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                    <Button onClick={handleDownload}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {copied && <div className="text-xs text-green-600 mt-1">Copied to clipboard!</div>}
            </div>

            {/* Compact summary */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{data.components.length}</div>
                        <div className="text-xs text-blue-500 uppercase tracking-wide">Components</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-600">{data.connections.length}</div>
                        <div className="text-xs text-green-500 uppercase tracking-wide">Connections</div>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <div className="text-xs text-gray-500">
                        Click <Maximize2 className="w-3 h-3 inline mx-1" /> to view/edit full JSON
                    </div>
                </div>
            </div>
        </div>
    )
}

// Simple syntax highlighting
function SyntaxHighlightedJson({ json }: { json: string }) {
    const highlighted = json
        .replace(/"([^"]+)":/g, '<span class="text-blue-600">"$1":</span>')
        .replace(/: "([^"]+)"/g, ': <span class="text-green-600">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="text-purple-600">$1</span>')
        .replace(/: (true|false)/g, ': <span class="text-orange-600">$1</span>')
        .replace(/: null/g, ': <span class="text-gray-500">null</span>')

    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />
}