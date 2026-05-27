"use client"

import { useState } from "react"
import { Cable, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ComponentInstance, Connection } from "@/types/circuit"

interface ConnectionTableProps {
    components: ComponentInstance[]
    connections: Connection[]
    onHighlightConnection?: (connectionId: string | null) => void
    onConnectionUpdate?: (connectionId: string, field: 'from' | 'to', value: { componentId: string; pinId: string }) => void
    editable?: boolean
}

export default function ConnectionTable({
    components,
    connections,
    onHighlightConnection,
    onConnectionUpdate,
    editable = false
}: ConnectionTableProps) {
    const [sortBy, setSortBy] = useState<"component" | "pin">("component")
    const [hovered, setHovered] = useState<string | null>(null)
    const [editingConnection, setEditingConnection] = useState<{ id: string, field: string } | null>(null)
    const [editValue, setEditValue] = useState('')

    const getComponentName = (componentId: string) => {
        const component = components.find((c) => c.id === componentId)
        return component ? `${component.type} (${component.id.split("-").pop()})` : componentId
    }

    const getPinName = (componentId: string, pinId: string) => {
        const component = components.find((c) => c.id === componentId)
        if (!component) return pinId
        const pin = component.pins.find((p) => p.id === pinId || p.name === pinId)
        return pin ? pin.name : pinId
    }

    const getPinType = (componentId: string, pinId: string) => {
        const component = components.find((c) => c.id === componentId)
        if (!component) return "unknown"
        const pin = component.pins.find((p) => p.id === pinId || p.name === pinId)
        return pin?.type || "unknown"
    }

    const sortedConnections = [...connections].sort((a, b) => {
        if (sortBy === "component") {
            return getComponentName(a.from.componentId).localeCompare(getComponentName(b.from.componentId))
        }
        return getPinName(a.from.componentId, a.from.pinId).localeCompare(getPinName(b.from.componentId, b.from.pinId))
    })

    const getPinTypeColor = (type: string) => {
        switch (type) {
            case "power":
                return "bg-red-100 text-red-700 border border-red-200"
            case "ground":
                return "bg-gray-100 text-gray-700 border border-gray-200"
            case "input":
                return "bg-blue-100 text-blue-700 border border-blue-200"
            case "output":
                return "bg-green-100 text-green-700 border border-green-200"
            default:
                return "bg-gray-100 text-gray-600 border border-gray-200"
        }
    }

    const startEditing = (connectionId: string, field: 'from' | 'to', initialValue: string) => {
        if (!editable) return
        setEditingConnection({ id: connectionId, field })
        setEditValue(initialValue)
    }

    const saveEdit = () => {
        if (!editingConnection || !onConnectionUpdate) return

        const [componentId, pinId] = editValue.split(':')
        onConnectionUpdate(
            editingConnection.id,
            editingConnection.field as 'from' | 'to',
            { componentId, pinId }
        )
        setEditingConnection(null)
    }

    const cancelEdit = () => {
        setEditingConnection(null)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                        <Cable className="w-4 h-4" />
                        Connections
                    </h3>
                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "component" | "pin")}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                            <option value="component">Sort by Component</option>
                            <option value="pin">Sort by Pin</option>
                        </select>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {connections.length} total
                        </span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto text-xs">
                {connections.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <Cable className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No connections yet</p>
                        <p className="text-xs mt-1">Drag between component pins to create connections</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {sortedConnections.map((connection) => {
                            const fromPinType = getPinType(connection.from.componentId, connection.from.pinId)
                            const toPinType = getPinType(connection.to.componentId, connection.to.pinId)
                            const hasTypeConflict =
                                (fromPinType === "power" && toPinType === "ground") ||
                                (fromPinType === "ground" && toPinType === "power")


                            return (
                                <div
                                    key={connection.id}
                                    className={`p-3 border rounded transition-all duration-150
                                        ${hasTypeConflict
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 bg-white hover:bg-gray-50"}
                                    `}
                                    onMouseEnter={() => {
                                        setHovered(connection.id)
                                        onHighlightConnection?.(connection.id)
                                    }}
                                    onMouseLeave={() => {
                                        setHovered(null)
                                        onHighlightConnection?.(null)
                                    }}
                                >
                                    {/* Compact Connection Row */}
                                    <div className="flex items-center gap-2">
                                        {/* Status indicator */}
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasTypeConflict ? 'bg-red-500' : 'bg-green-500'}`}></div>

                                        {/* From Component */}
                                        <div className="flex-1 min-w-0">
                                            {editingConnection?.id === connection.id && editingConnection.field === 'from' ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={saveEdit}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") saveEdit()
                                                            if (e.key === "Escape") cancelEdit()
                                                        }}
                                                        className="h-8 w-40 text-xs font-mono px-2 py-1 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={saveEdit}
                                                        className="h-8 w-8 rounded-md p-0 text-xs shadow-sm"
                                                    >
                                                        ✓
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className={` text-sm font-medium ${editable ? 'cursor-pointer hover:underline' : ''}`}
                                                    onClick={(e) => {
                                                        if (editable) {
                                                            e.stopPropagation()
                                                            startEditing(connection.id, 'from', `${connection.from.componentId}:${connection.from.pinId}`)
                                                        }
                                                    }}
                                                >
                                                    <span className="">
                                                        {getComponentName(connection.from.componentId)}
                                                    </span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ml-1 ${getPinTypeColor(fromPinType)}`}>
                                                        {getPinName(connection.from.componentId, connection.from.pinId)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <div className="text-gray-400 mx-1">
                                            →
                                        </div>

                                        {/* To Component */}
                                        <div className="flex-1 min-w-0 text-right">
                                            {editingConnection?.id === connection.id && editingConnection.field === 'to' ? (
                                                <div className="flex gap-2 justify-center items-center">
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={saveEdit}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEdit()
                                                            if (e.key === 'Escape') cancelEdit()
                                                        }}
                                                        className="h-7 text-xs font-mono px-2 py-1"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={saveEdit}
                                                        className="h-8 w-8 rounded-md p-0 text-xs shadow-sm"
                                                    >
                                                        ✓
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className={` text-sm font-medium ${editable ? 'cursor-pointer hover:underline' : ''}`}
                                                    onClick={(e) => {
                                                        if (editable) {
                                                            e.stopPropagation()
                                                            startEditing(connection.id, 'to', `${connection.to.componentId}:${connection.to.pinId}`)
                                                        }
                                                    }}
                                                >
                                                    <span className={`text-xs px-1.5 py-0.5 rounded mr-1 ${getPinTypeColor(toPinType)}`}>
                                                        {getPinName(connection.to.componentId, connection.to.pinId)}
                                                    </span>
                                                    <span className="">
                                                        {getComponentName(connection.to.componentId)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* Warning for conflicts */}
                                    {hasTypeConflict && (
                                        <div className="mt-2 flex items-center gap-1 text-red-600 bg-red-50 p-1.5 rounded text-xs">
                                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                            <span className="">Power/Ground conflict</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}