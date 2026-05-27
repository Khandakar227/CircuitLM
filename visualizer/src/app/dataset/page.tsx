"use client"
import { useEffect, useRef, useState, useCallback } from 'react';
import { generateWirePath, getPinPosition } from '@/components/electrical-components/utils';
import { CircuitLayout } from '@/components/electrical-components/layout';
import { WireRouter } from '@/components/electrical-components/wire-router';

import { Zap, ChevronLeft, ChevronRight, Database, Copy, Download, ChevronFirst, ChevronLast } from 'lucide-react';
import JsonViewer from '@/components/common/JsonViewer';
import ConnectionTable from '@/components/common/ConnectionTable';
import { ComponentInstance, Connection, CircuitData } from '@/types/circuit';

import JsonEditorModal from '@/components/common/JsonEditorModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useComponentPins } from '@/hooks/useComponentPins';
import { componentsList } from '@/components/electrical-components/components-list';
import { DraggableComponent } from '@/components/common/DraggableComponent';
import GenericComponent from '@/components/electrical-components/elements/GenericComponent';

import Papa from 'papaparse';
import WireRouteSelect from '@/components/common/WireRouteSelect';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Type definitions
type CircuitEntry = {
    prompt: string;
    circuit: CircuitJson;
};

type CircuitJson = {
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

export default function DatasetViewer() {
    const { componentPins, loading: pinsLoading, error: pinsError } = useComponentPins();
    const [loading, setLoading] = useState(true);
    const [circuitEntries, setCircuitEntries] = useState<CircuitEntry[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [circuitJson, setCircuitJson] = useState<CircuitJson | null>(null);
    const [layoutCalculated, setLayoutCalculated] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const [wires, setWires] = useState<{
        id: string;
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        steps: string[] | string,
        color: string;
        selected: boolean;
        routingStrategy: 'auto' | 'l-shape' | 'up-l' | 'down-l' | 'z-shape' | 'reverse-z' | 'u-shape' | 'reverse-u' | 'direct' | 'custom';
    }[]>([]);
    const [unresolvedConnections, setUnresolvedConnections] = useState<{
        from: string; to: string; color: string; reason: string;
    }[]>([]);
    const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

    const [layout, setLayout] = useState<CircuitLayout | null>(null);
    const [wireRouter, setWireRouter] = useState<WireRouter | null>(null);
    const [components, setComponents] = useState<ComponentInstance[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [showJsonEditor, setShowJsonEditor] = useState(false);

    const [goToEntryInput, setGoToEntryInput] = useState('');
    const [showGoToInput, setShowGoToInput] = useState(false);

    // Generate custom wire paths based on routing strategy
    const generateCustomWirePath = (p1: { x: number, y: number }, p2: { x: number, y: number }, strategy: string) => {
        switch (strategy) {
            case 'l-shape':
                return `M${p1.x},${p1.y} L${p2.x},${p1.y} L${p2.x},${p2.y}`;

            case 'up-l':
                return `M${p1.x},${p1.y} L${p1.x},${p2.y} L${p2.x},${p2.y}`;

            case 'down-l':
                return `M${p1.x},${p1.y} L${p1.x},${p1.y + Math.abs(p2.y - p1.y)} L${p2.x},${p1.y + Math.abs(p2.y - p1.y)} L${p2.x},${p2.y}`;

            case 'z-shape':
                const mid1 = { x: p1.x + (p2.x - p1.x) / 3, y: p1.y };
                const mid2 = { x: p1.x + (p2.x - p1.x) * 2 / 3, y: p2.y };
                return `M${p1.x},${p1.y} L${mid1.x},${mid1.y} L${mid2.x},${mid2.y} L${p2.x},${p2.y}`;

            case 'reverse-z':
                const mid1R = { x: p1.x + (p2.x - p1.x) * 2 / 3, y: p1.y };
                const mid2R = { x: p1.x + (p2.x - p1.x) / 3, y: p2.y };
                return `M${p1.x},${p1.y} L${mid1R.x},${mid1R.y} L${mid2R.x},${mid2R.y} L${p2.x},${p2.y}`;

            case 'u-shape':
                const offset = Math.abs(p2.x - p1.x) / 2;
                const mid1U = { x: p1.x, y: p1.y + offset };
                const mid2U = { x: p2.x, y: p2.y + offset };
                return `M${p1.x},${p1.y} L${mid1U.x},${mid1U.y} L${mid2U.x},${mid2U.y} L${p2.x},${p2.y}`;

            case 'reverse-u':
                const offsetR = Math.abs(p2.x - p1.x) / 2;
                const mid1UR = { x: p1.x, y: p1.y - offsetR };
                const mid2UR = { x: p2.x, y: p2.y - offsetR };
                return `M${p1.x},${p1.y} L${mid1UR.x},${mid1UR.y} L${mid2UR.x},${mid2UR.y} L${p2.x},${p2.y}`;

            case 'direct':
                return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

            case 'custom':
                // For custom routing, we'll use control points
                return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

            default:
                return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
        }
    };

    // Handle wire selection
    const handleWireSelect = (wireId: string) => {
        setWires(prev => prev.map(wire => ({
            ...wire,
            selected: wire.id === wireId
        })));
        setSelectedWireId(wireId);
        console.log("handleWireSelect: ", wireId);
    };

    // Handle wire routing strategy change
    const handleWireRoutingChange = (wireId: string, strategy: 'auto' | 'l-shape' | 'up-l' | 'down-l' | 'z-shape' | 'reverse-z' | 'u-shape' | 'reverse-u' | 'direct' | 'custom') => {
        setWires(prev => prev.map(wire => {
            if (wire.id === wireId) {
                const newPath = strategy === 'auto'
                    ? generateWirePath(wire.p1, [], wire.p2)
                    : generateCustomWirePath(wire.p1, wire.p2, strategy);
                return {
                    ...wire,
                    routingStrategy: strategy,
                    steps: newPath
                };
            }
            return wire;
        }));
    };

    // Handle component movement and auto-routing
    const handleComponentMove = useCallback((componentId: string, newX: number, newY: number) => {
        setCircuitJson(prev => {
            if (!prev) return null;

            const updatedParts = prev.parts.map(part =>
                part.id === componentId
                    ? { ...part, left: newX, top: newY }
                    : part
            );

            // Update wire router obstacles in the same callback
            if (wireRouter) {
                const updatedObstacles = updatedParts.map(part => {
                    const componentInfo = componentPins[part.type as keyof typeof componentPins];
                    return {
                        id: part.id,
                        x: part.left,
                        y: part.top,
                        width: +componentInfo?.width || 50,
                        height: +componentInfo?.height || 50
                    };
                });
                wireRouter.setObstacles(updatedObstacles);
            }

            return { ...prev, parts: updatedParts };
        });
    }, [wireRouter]);

    const handleGoToEntry = () => {
        const entryNumber = parseInt(goToEntryInput);
        if (entryNumber >= 1 && entryNumber <= circuitEntries.length) {
            setCurrentIndex(entryNumber - 1); // Convert to 0-based index
            setGoToEntryInput('');
            setShowGoToInput(false);
            toast.success(`Jumped to entry ${entryNumber}`);
        } else {
            toast.error(`Please enter a number between 1 and ${circuitEntries.length}`);
        }
    };

    const handleGoToKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleGoToEntry();
        } else if (e.key === 'Escape') {
            setShowGoToInput(false);
            setGoToEntryInput('');
        }
    };

    useEffect(() => {
        const loadCsvDataWithPapaParse = async () => {
            try {
                const response = await fetch('/prompt_to_circuit_output_filtered.csv');
                const text = await response.text();

                const results = Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    quoteChar: '"',
                    escapeChar: '"',
                    dynamicTyping: false,
                });

                if (results.errors.length > 0) {
                    console.warn('CSV parsing errors:', results.errors);
                }

                const entries: CircuitEntry[] = [];

                for (let i = 0; i < results.data.length; i++) {
                    const row = results.data[i] as any;
                    if (row.prompt && row.circuit) {
                        try {
                            // Sometimes PapaParse leaves quotes around the JSON string
                            let circuitStr = row.circuit?.trim();
                            // If it starts and ends with quotes, remove them
                            if (circuitStr.startsWith('"') && circuitStr.endsWith('"')) {
                                circuitStr = circuitStr.slice(1, -1);
                            }
                            // Replace escaped \n and \t with real characters
                            circuitStr = circuitStr.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                            // Now parse
                            const parsedCircuit = JSON.parse(circuitStr);
                            entries.push({
                                prompt: row.prompt,
                                circuit: parsedCircuit
                            });

                        } catch (jsonError) {
                            console.log("Row circuit string:", row.circuit);
                            console.log(`Invalid JSON at row ${i + 1}:`, jsonError);
                        }
                    }
                }

                setCircuitEntries(entries);
                if (entries.length > 0) {
                    setCurrentIndex(0);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error loading CSV:', error);
                setLoading(false);
            }
        };

        loadCsvDataWithPapaParse();
    }, []);

    useEffect(() => {
        if (circuitEntries.length > 0 && currentIndex >= 0 && currentIndex < circuitEntries.length) {
            try {
                setCircuitJson(circuitEntries[currentIndex]?.circuit);
                setLayoutCalculated(prev => !prev);
            } catch (error) {
                console.error('Error parsing circuit JSON:', error);
                console.log('Problematic circuit data:', circuitEntries[currentIndex]?.circuit);
                setCircuitJson(null);
            }
        } else {
            setCircuitJson(null);
        }
    }, [currentIndex, circuitEntries]);

    const handleSaveToDataset = async (fixedJson: any, annotations: any) => {
        try {
            const response = await fetch('/api/circuit-dataset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: circuitEntries[currentIndex]?.prompt,
                    generatedJson: circuitJson,
                    fixedJson,
                    metadata: circuitData.metadata,
                    annotations
                }),
            });

            if (!response.ok) throw new Error('Failed to save dataset entry');

            toast.success('Dataset entry saved successfully');
        } catch (error) {
            toast.error('Failed to save dataset entry');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!circuitJson) {
            setComponents([]);
            setConnections([]);
            return;
        }

        // Convert parts → ComponentInstance
        const newComponents: any[] = circuitJson.parts.map((part) => ({
            id: part.id,
            type: part.type,
            pins: componentPins[part.type as keyof typeof componentPins]?.pins || [],
        }));

        // Convert connections → Connection
        const newConnections: Connection[] = circuitJson.connections.map((conn, index) => {
            const [from, to, color] = conn;
            const [fromId, fromPin] = from.split(":");
            const [toId, toPin] = to.split(":");

            return {
                id: `conn-${index}`,
                from: { componentId: fromId, pinId: fromPin },
                to: { componentId: toId, pinId: toPin },
                color,
            };
        });

        setComponents(newComponents);
        setConnections(newConnections);
    }, [circuitJson]);

    const circuitData: CircuitData = {
        components,
        connections,
        metadata: {
            createdAt: new Date().toISOString(),
            version: "1.0.0",
            totalComponents: components.length,
            totalConnections: connections.length,
        },
    };

    useEffect(() => {
        if (!circuitJson) return;
        const newLayout = new CircuitLayout({
            padding: 20,
            gridSize: 10,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT
        });

        circuitJson.parts.forEach(part => {
            const componentInfo = componentPins[part.type as keyof typeof componentPins];
            if (componentInfo) {
                newLayout.addComponent(part.id, +componentInfo.width, +componentInfo.height);
            }
        });

        const positions = newLayout.calculateForceLayout(50);
        setLayout(newLayout);

        const router = new WireRouter();
        router.setObstacles(positions);
        setWireRouter(router);

        const updatedParts = circuitJson.parts.map((part, index) => ({
            ...part,
            left: positions[index]?.x || part.left,
            top: positions[index]?.y || part.top
        }));

        setCircuitJson({ ...circuitJson, parts: updatedParts });
    }, [layoutCalculated]);

    // Recalculate wire paths when components move
    useEffect(() => {
        if (!svgRef.current || !circuitJson) return;

        const newWires: typeof wires = [];
        const unresolved: typeof unresolvedConnections = [];
        circuitJson.connections.forEach(([from, to, color, offset], index) => {
            const [fromId, fromPin] = from.split(":");
            const [toId, toPin] = to.split(":");

            const p1 = getPinPosition(fromId, fromPin, svgRef.current!);
            const p2 = getPinPosition(toId, toPin, svgRef.current!);

            if (p1 && p2) {
                const wireId = `wire-${index}`;
                const existingWire = wires.find(w => w.id === wireId);

                // Use existing routing strategy or default to auto
                const routingStrategy = existingWire?.routingStrategy || 'auto';
                const isSelected = existingWire?.selected || false;

                let wirePath: string | string[] = offset;

                if (routingStrategy === 'auto' && wireRouter) {
                    const segments = wireRouter.routeOrthogonal(p1, p2);
                    // Convert segments to path string
                    let d = `M${p1.x},${p1.y}`;
                    segments.forEach(segment => {
                        d += ` L${segment.end.x},${segment.end.y}`;
                    });
                    wirePath = d;
                } else if (routingStrategy !== 'auto') {
                    wirePath = generateCustomWirePath(p1, p2, routingStrategy);
                } else {
                    // Fallback to simple path
                    wirePath = generateWirePath(p1, Array.isArray(offset) ? offset : [], p2);
                }

                newWires.push({
                    id: wireId,
                    p1,
                    p2,
                    steps: wirePath,
                    color,
                    selected: isSelected,
                    routingStrategy
                });
            } else {
                // Track connections that couldn't be rendered due to missing pins
                const reasons: string[] = [];
                if (!p1) reasons.push(`pin '${fromPin}' not found on '${fromId}'`);
                if (!p2) reasons.push(`pin '${toPin}' not found on '${toId}'`);
                unresolved.push({
                    from: `${fromId}:${fromPin}`, to: `${toId}:${toPin}`,
                    color, reason: reasons.join('; ')
                });
            }
        });

        setWires(newWires);
        setUnresolvedConnections(unresolved);
    }, [circuitJson, wireRouter]);

    const handleNext = () => {
        if (currentIndex < circuitEntries.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleCopyJson = () => {
        if (circuitJson) {
            navigator.clipboard.writeText(JSON.stringify(circuitJson, null, 2));
            toast.success('JSON copied to clipboard');
        }
    };

    const handleDownloadJson = () => {
        if (circuitJson) {
            const dataStr = JSON.stringify(circuitJson, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `circuit-${currentIndex + 1}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    if (loading || pinsLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dataset and components...</p>
                </div>
            </div>
        );
    }

    if (pinsError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>Failed to load component library from API endpoint.</p>
                    <p className="text-sm">Make sure the Python server is running on localhost:8000.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-screen bg-gray-50">
                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex flex-col gap-4">
                            {/* Navigation Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0 || circuitEntries.length === 0}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2">
                                    {showGoToInput ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={goToEntryInput}
                                                onChange={(e) => setGoToEntryInput(e.target.value)}
                                                onKeyDown={handleGoToKeyPress}
                                                placeholder="Entry #"
                                                min={1}
                                                max={circuitEntries.length}
                                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleGoToEntry}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Go
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowGoToInput(false);
                                                    setGoToEntryInput('');
                                                }}
                                                className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowGoToInput(true)}
                                            className="text-sm font-medium text-gray-700 min-w-24 text-center hover:bg-gray-50 px-2 py-1 rounded border border-gray-300"
                                            title="Click to go to specific entry"
                                        >
                                            {circuitEntries.length > 0 ? `${currentIndex + 1} / ${circuitEntries.length}` : '0 / 0'}
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex >= circuitEntries.length - 1 || circuitEntries.length === 0}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* Quick jump buttons */}
                                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
                                    <button
                                        onClick={() => setCurrentIndex(0)}
                                        disabled={currentIndex === 0 || circuitEntries.length === 0}
                                        className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Go to first entry"
                                    >
                                        <ChevronFirst className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentIndex(circuitEntries.length - 1)}
                                        disabled={currentIndex >= circuitEntries.length - 1 || circuitEntries.length === 0}
                                        className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Go to last entry"
                                    >
                                        <ChevronLast className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Prompt Display */}
                            <div className="min-w-0">
                                <div className="text-sm text-gray-500 mb-1">Current Prompt:</div>
                                <div className="text-sm font-medium text-gray-900">
                                    {circuitEntries[currentIndex]?.prompt ? (
                                        <div className="whitespace-normal break-words max-h-20 overflow-y-auto">
                                            {circuitEntries[currentIndex].prompt}
                                        </div>
                                    ) : (
                                        'No prompt available'
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                                {circuitJson && (
                                    <>
                                        <Button
                                            onClick={() => setShowJsonEditor(true)}
                                            variant="outline"
                                            className="px-3 py-2 flex items-center gap-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-all font-medium shadow-sm"
                                        >
                                            <Database className="w-4 h-4" />
                                            Save Dataset
                                        </Button>
                                        <Button
                                            onClick={handleCopyJson}
                                            variant="outline"
                                            className="px-3 py-2 flex items-center gap-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-all font-medium shadow-sm"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy JSON
                                        </Button>
                                        <Button
                                            onClick={handleDownloadJson}
                                            variant="outline"
                                            className="px-3 py-2 flex items-center gap-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-all font-medium shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {circuitJson && (
                        <JsonEditorModal
                            open={showJsonEditor}
                            onOpenChange={setShowJsonEditor}
                            initialData={{
                                prompt: circuitEntries[currentIndex]?.prompt || '',
                                generatedJson: circuitJson,
                                fixedJson: circuitJson,
                                metadata: circuitData.metadata
                            }}
                            onSave={handleSaveToDataset}
                            emitChangedJson={(jsonString) => {
                                try {
                                    const parsed = JSON.parse(jsonString);
                                    setCircuitJson(parsed);
                                    setLayoutCalculated(!layoutCalculated);
                                } catch (e) {
                                    console.log(e);
                                }
                            }}
                        />
                    )}

                    <div className="flex-1 flex">
                        {/* Canvas Area - Centered */}
                        <div className="flex-1 p-6 overflow-auto flex justify-center items-start">
                            {/* Unresolved connections warning */}
                            {unresolvedConnections.length > 0 && (
                                <div className="mb-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                                    <p className="text-sm font-semibold text-amber-800 mb-1">
                                        ⚠ {unresolvedConnections.length} connection(s) could not be rendered (pin not found)
                                    </p>
                                    <ul className="text-xs text-amber-700 space-y-0.5 max-h-24 overflow-y-auto">
                                        {unresolvedConnections.map((uc, i) => (
                                            <li key={i}>
                                                <span className="font-mono">{uc.from}</span>
                                                {' ↔ '}
                                                <span className="font-mono">{uc.to}</span>
                                                {' — '}{uc.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {circuitJson ? (
                                <div className="flex justify-center">
                                    <svg
                                        tabIndex={0}
                                        ref={svgRef}
                                        width={CANVAS_WIDTH}
                                        height={CANVAS_HEIGHT}
                                        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                                        className="border border-gray-300 rounded-lg shadow-lg bg-white"
                                    >
                                        {/* Parts */}
                                        {circuitJson.parts.map((part, index) => {
                                            const Component = componentsList[part.type as keyof typeof componentsList];
                                            const pinDefs = componentPins[part.type];

                                            if (!Component && !pinDefs) {
                                                console.warn(`Component type not found in registry or API: ${part.type}`);
                                                return null;
                                            }

                                            return (
                                                <DraggableComponent
                                                    key={`${part.id}-${index}`}
                                                    id={part.id}
                                                    x={part.left}
                                                    y={part.top}
                                                    onMove={handleComponentMove}
                                                >
                                                    {Component ? (
                                                        <Component
                                                            id={part.id}
                                                            x={0}
                                                            y={0}
                                                            rotate={part?.rotate || 0}
                                                            data-value={part.attrs?.value}
                                                        />
                                                    ) : (
                                                        <GenericComponent
                                                            id={part.id}
                                                            width={Number(pinDefs.width) || 100}
                                                            height={Number(pinDefs.height) || 100}
                                                            pins={pinDefs.pins || []}
                                                            name={part.type}
                                                            rotate={part?.rotate || 0}
                                                        />
                                                    )}
                                                </DraggableComponent>
                                            );
                                        })}

                                        {/* Wires */}
                                        {wires.map((w, i) => (
                                            <g key={w.id}>
                                                {/* Invisible wider path for easier clicking */}
                                                <path
                                                    d={typeof w.steps === 'string' ? w.steps : generateWirePath(w.p1, w.steps, w.p2)}
                                                    stroke="transparent"
                                                    fill="none"
                                                    strokeWidth={15}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    onClick={() => handleWireSelect(w.id)}
                                                    className="cursor-pointer"
                                                />

                                                {/* Visible wire path */}
                                                <path
                                                    d={typeof w.steps === 'string' ? w.steps : generateWirePath(w.p1, w.steps, w.p2)}
                                                    stroke={w.color}
                                                    opacity={w.selected ? 1 : 0.55}
                                                    fill="none"
                                                    strokeWidth={w.selected ? 5 : 3}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    onClick={() => handleWireSelect(w.id)}
                                                    className="cursor-pointer"
                                                />

                                                {/* Selection indicator */}
                                                {w.selected && (
                                                    <path
                                                        d={typeof w.steps === 'string' ? w.steps : generateWirePath(w.p1, w.steps, w.p2)}
                                                        stroke="#3b82f6"
                                                        opacity={0.3}
                                                        fill="none"
                                                        strokeWidth={7}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeDasharray="5,5"
                                                    />
                                                )}

                                                {/* Pin connection points */}
                                                <circle
                                                    cx={w.p1.x}
                                                    cy={w.p1.y}
                                                    r="4"
                                                    fill={w.color}
                                                    stroke="white"
                                                    strokeWidth="0.45"
                                                />
                                                <circle
                                                    cx={w.p2.x}
                                                    cy={w.p2.y}
                                                    r="4"
                                                    fill={w.color}
                                                    stroke="white"
                                                    strokeWidth="0.45"
                                                />
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Zap className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Circuit Data</h3>
                                        <p className="text-gray-500 max-w-md">
                                            {circuitEntries.length === 0
                                                ? "No circuit data found in the dataset."
                                                : "Select a circuit from the dataset to view."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Connection Table & Analysis */}
                        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                            {/* Wire Controls */}
                            {selectedWireId ? (
                                <div className="p-4 border-b border-gray-200 bg-blue-50">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Wire Controls</h3>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-600">Routing Strategy:</label>
                                        <WireRouteSelect
                                            value={wires.find(w => w.id === selectedWireId)?.routingStrategy || 'auto'}
                                            onChange={(e) => handleWireRoutingChange(selectedWireId, e.target.value as any)}
                                        />
                                        <button
                                            onClick={() => setSelectedWireId(null)}
                                            className="w-full px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                        >
                                            Deselect Wire
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Wire Selection</h3>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Click on any wire to select it and change its routing direction.
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <div>• <strong>Auto:</strong> Smart routing around obstacles</div>
                                        <div>• <strong>L-Shape:</strong> Right-angle routing (horizontal first)</div>
                                        <div>• <strong>Up L:</strong> Right-angle routing (vertical first)</div>
                                        <div>• <strong>Down L:</strong> Right-angle routing (down then right)</div>
                                        <div>• <strong>Z-Shape:</strong> Zigzag pattern</div>
                                        <div>• <strong>Reverse Z:</strong> Reverse zigzag pattern</div>
                                        <div>• <strong>U-Shape:</strong> U-shaped routing (down)</div>
                                        <div>• <strong>Reverse U:</strong> U-shaped routing (up)</div>
                                        <div>• <strong>Direct:</strong> Straight line</div>
                                        <div>• <strong>Custom:</strong> Draggable control points</div>
                                    </div>
                                </div>
                            )}

                            {/* Connection Table */}
                            <div className="flex-1 border-b border-gray-200">
                                <ConnectionTable
                                    components={components}
                                    connections={connections}
                                    editable={false}
                                    onConnectionUpdate={(v: any) => {
                                        setConnections(prev => prev.map(conn =>
                                            conn.id === v.connectionId
                                                ? { ...conn, [v.field]: v.value }
                                                : conn
                                        ));
                                    }}
                                />
                            </div>

                            {/* JSON Data Viewer */}
                            <div className="h-80">
                                <JsonViewer data={circuitData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}