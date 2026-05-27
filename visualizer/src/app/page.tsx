"use client"
import { useEffect, useRef, useState, useCallback } from 'react';
import { componentsList } from '../components/electrical-components/components-list'
import { generateCustomWirePath, generateWirePath, getPinPosition } from '@/components/electrical-components/utils';
import { CircuitLayout } from '@/components/electrical-components/layout';
import { WireRouter } from '@/components/electrical-components/wire-router';
import { useComponentPins } from '@/hooks/useComponentPins';
import { DraggableComponent } from '@/components/common/DraggableComponent';
import GenericComponent from '@/components/electrical-components/elements/GenericComponent';

import { Zap } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import JsonViewer from '@/components/common/JsonViewer';
import CorrectnessMetrics from '@/components/common/CorrectnessMetrics';
import ConnectionTable from '@/components/common/ConnectionTable';
import { ComponentInstance, Connection, CircuitData } from '@/types/circuit';

import JsonEditorModal from '@/components/common/JsonEditorModal';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { toast } from 'sonner';
import WireControls from '@/components/common/WireControls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function Home() {
  const { componentPins, loading: pinsLoading, error: pinsError } = useComponentPins();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(``);
  const [circuitJson, setCircuitJson] = useState<CircuitJson | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [layoutCalculated, setLayoutCalculated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [wires, setWires] = useState<{
    id: string;
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    steps: string[] | string,
    color: string;
    selected: boolean;
    routingStrategy: 'auto' | 'l-shape' | 'z-shape' | 'u-shape' | 'direct' | 'custom';
    customPoints?: { x: number, y: number }[];
  }[]>([]);
  const [unresolvedConnections, setUnresolvedConnections] = useState<{
    from: string; to: string; color: string; reason: string;
  }[]>([]);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<{ wireId: string, pointIndex: number } | null>(null);

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
  const handleWireRoutingChange = (wireId: string, strategy: any) => {
    setWires(prev => prev.map(wire => {
      if (wire.id === wireId) {
        let newCustomPoints = wire.customPoints;
        if (strategy === 'custom' && wire.routingStrategy !== 'custom') {
          // Try to parse existing path to preserve the shape
          let pathStr = '';
          if (typeof wire.steps === 'string') {
            pathStr = wire.steps;
          } else if (Array.isArray(wire.steps)) {
            pathStr = generateWirePath(wire.p1, wire.steps, wire.p2);
          }

          if (pathStr) {
            const pts: { x: number, y: number }[] = [];
            let currX = 0, currY = 0;
            // Match commands like M x,y or L x,y or h x or v y
            const regex = /([MLhv])\s*([-0-9.]+)(?:,\s*([-0-9.]+))?/g;
            let match;
            while ((match = regex.exec(pathStr)) !== null) {
              const cmd = match[1];
              const x = parseFloat(match[2]);
              const y = parseFloat(match[3]);

              if (cmd === 'M' || cmd === 'L') {
                currX = x;
                currY = y;
              } else if (cmd === 'h') {
                currX += x;
              } else if (cmd === 'v') {
                currY += x;
              }
              pts.push({ x: currX, y: currY });
            }
            // Remove first (p1) and last (p2) to only keep intermediate control points
            if (pts.length > 2) {
              newCustomPoints = pts.slice(1, -1);
            } else {
              newCustomPoints = [
                { x: wire.p1.x + (wire.p2.x - wire.p1.x) / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) / 3 },
                { x: wire.p1.x + (wire.p2.x - wire.p1.x) * 2 / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) * 2 / 3 }
              ];
            }
          } else {
            newCustomPoints = [
              { x: wire.p1.x + (wire.p2.x - wire.p1.x) / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) / 3 },
              { x: wire.p1.x + (wire.p2.x - wire.p1.x) * 2 / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) * 2 / 3 }
            ];
          }
        }

        const newPath = strategy === 'auto'
          ? generateWirePath(wire.p1, [], wire.p2)
          : generateCustomWirePath(wire.p1, wire.p2, strategy, newCustomPoints);
        return {
          ...wire,
          routingStrategy: strategy as any,
          customPoints: newCustomPoints,
          steps: newPath
        };
      }
      return wire;
    }));
  };

  // Handle setting all wires to the same routing strategy
  const handleAllWiresRoutingChange = (strategy: any) => {
    setWires(prev => prev.map(wire => {
      let newCustomPoints = wire.customPoints;
      if (strategy === 'custom' && wire.routingStrategy !== 'custom') {
        // Try to parse existing path to preserve the shape
        let pathStr = '';
        if (typeof wire.steps === 'string') {
          pathStr = wire.steps;
        } else if (Array.isArray(wire.steps)) {
          pathStr = generateWirePath(wire.p1, wire.steps, wire.p2);
        }

        if (pathStr) {
          const pts: { x: number, y: number }[] = [];
          let currX = 0, currY = 0;
          // Match commands like M x,y or L x,y or h x or v y
          const regex = /([MLhv])\s*([-0-9.]+)(?:,\s*([-0-9.]+))?/g;
          let match;
          while ((match = regex.exec(pathStr)) !== null) {
            const cmd = match[1];
            const x = parseFloat(match[2]);
            const y = parseFloat(match[3]);

            if (cmd === 'M' || cmd === 'L') {
              currX = x;
              currY = y;
            } else if (cmd === 'h') {
              currX += x;
            } else if (cmd === 'v') {
              currY += x;
            }
            pts.push({ x: currX, y: currY });
          }
          // Remove first (p1) and last (p2) to only keep intermediate control points
          if (pts.length > 2) {
            newCustomPoints = pts.slice(1, -1);
          } else {
            newCustomPoints = [
              { x: wire.p1.x + (wire.p2.x - wire.p1.x) / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) / 3 },
              { x: wire.p1.x + (wire.p2.x - wire.p1.x) * 2 / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) * 2 / 3 }
            ];
          }
        } else {
          newCustomPoints = [
            { x: wire.p1.x + (wire.p2.x - wire.p1.x) / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) / 3 },
            { x: wire.p1.x + (wire.p2.x - wire.p1.x) * 2 / 3, y: wire.p1.y + (wire.p2.y - wire.p1.y) * 2 / 3 }
          ];
        }
      }

      const newPath = strategy === 'auto'
        ? generateWirePath(wire.p1, [], wire.p2)
        : generateCustomWirePath(wire.p1, wire.p2, strategy, newCustomPoints);
      return {
        ...wire,
        routingStrategy: strategy as any,
        customPoints: newCustomPoints,
        steps: newPath
      };
    }));
  };

  const [layout, setLayout] = useState<CircuitLayout | null>(null);
  const [wireRouter, setWireRouter] = useState<WireRouter | null>(null);

  const [components, setComponents] = useState<ComponentInstance[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  const [showJsonEditor, setShowJsonEditor] = useState(false);

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
            width: Number(componentInfo?.width) || 50,
            height: Number(componentInfo?.height) || 50
          };
        });
        wireRouter.setObstacles(updatedObstacles);
      }

      return { ...prev, parts: updatedParts };
    });
  }, [wireRouter]);


  // Recalculate wire paths when components move
  useEffect(() => {
    if (!svgRef.current || !circuitJson) return;

    // A failed generation can leave a malformed schematic (e.g. {}). Guard so
    // rendering never crashes on a missing connections/parts array.
    if (!Array.isArray(circuitJson.connections)) {
      setWires([]);
      setUnresolvedConnections([]);
      return;
    }

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
        const customPoints = existingWire?.customPoints;

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
          wirePath = generateCustomWirePath(p1, p2, routingStrategy, customPoints);
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
          routingStrategy,
          customPoints
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

  const handleSaveToDataset = async (fixedJson: any, annotations: any) => {
    try {
      const response = await fetch('/api/circuit-dataset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
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

  // 🔄 Transform circuitJson → components & connections
  useEffect(() => {
    if (!circuitJson) {
      setComponents([])
      setConnections([])
      return
    }

    // Convert parts → ComponentInstance
    const newComponents: any[] = circuitJson.parts.map((part) => ({
      id: part.id,
      type: part.type,
      pins: componentPins[part.type as keyof typeof componentPins]?.pins || [],
    }))

    // Convert connections → Connection
    const newConnections: Connection[] = circuitJson.connections.map((conn, index) => {
      const [from, to, color] = conn
      const [fromId, fromPin] = from.split(":")
      const [toId, toPin] = to.split(":")

      return {
        id: `conn-${index}`,
        from: { componentId: fromId, pinId: fromPin },
        to: { componentId: toId, pinId: toPin },
        color,
      }
    })

    setComponents(newComponents)
    setConnections(newConnections)
  }, [circuitJson])

  // Circuit data for analysis and export
  const circuitData: CircuitData = {
    components,
    connections,
    metadata: {
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      totalComponents: components.length,
      totalConnections: connections.length,
    },
  }

  useEffect(() => {
    if (!circuitJson) return;
    // Create layout engine
    const newLayout = new CircuitLayout({
      padding: 20,
      gridSize: 10,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT
    });

    // Add components to layout
    circuitJson.parts.forEach(part => {
      const componentInfo = componentPins[part.type as keyof typeof componentPins];
      if (componentInfo) {
        newLayout.addComponent(part.id, Number(componentInfo.width), Number(componentInfo.height));
      }
    });

    // Calculate positions
    const positions = newLayout.calculateForceLayout(50);
    setLayout(newLayout);

    // Create wire router
    const router = new WireRouter();
    router.setObstacles(positions);
    setWireRouter(router);

    // Update component positions
    const updatedParts = circuitJson.parts.map((part, index) => ({
      ...part,
      left: positions[index]?.x || part.left,
      top: positions[index]?.y || part.top
    }));

    setCircuitJson({ ...circuitJson, parts: updatedParts });
  }, [layoutCalculated]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/circuit-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: prompt }),
      });

      if (!res.ok) {
        console.error("Failed to generate circuit:", res.statusText);
        return;
      }

      const data = await res.json();

      if (data.error || !data.data) {
        toast.error(data.error || "Generation failed: no circuit returned.");
        return;
      }
      const generatedCircuit = typeof data.data == "string" ? JSON.parse(data?.data) as CircuitJson : data?.data as CircuitJson;

      // Guard against an empty/malformed schematic (e.g. backend returned {} on halt/error)
      if (!generatedCircuit || !Array.isArray(generatedCircuit.parts) || !Array.isArray(generatedCircuit.connections)) {
        toast.error("Generation returned an invalid circuit.");
        return;
      }

      setCircuitJson(generatedCircuit);
      setLayoutCalculated(!layoutCalculated)
      setWires([]); // Clear previous wires
      setEvaluation(null); // Clear any stale evaluation
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!circuitJson) {
      toast.error("Generate a circuit first.");
      return;
    }
    try {
      setEvaluating(true);
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, schematic: circuitJson }),
      });
      const data = await res.json();
      if (!data.success || !data.evaluation) {
        toast.error(data.error || "Evaluation failed.");
        return;
      }
      setEvaluation(data.evaluation);
      const judge = data.evaluation.llm_as_judge;
      toast.success(`LLM Judge: ${judge?.failure_count ?? 0} issue(s) found`);
    } catch (error) {
      console.error(error);
      toast.error("Evaluation request failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleClear = () => {
    setCircuitJson(null);
    setWires([]);
    setLayout(null);
    setWireRouter(null);
    setLayoutCalculated(false);
    setEvaluation(null);
  };

  if (pinsLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Component Library...</p>
        </div>
      </div>
    );
  }

  if (pinsError) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
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
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Describe your circuit..."
                  value={prompt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Button Group */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || !circuitJson}
                  className="px-4 py-2.5 bg-emerald-600 text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                >
                  {evaluating ? "Evaluating..." : "Evaluate"}
                </button>
                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                >
                  Clear
                </button>
                {/*circuitJson && (
                  <Button
                    onClick={() => setShowJsonEditor(true)}
                    variant="outline"
                    className="px-5 py-2.5 flex items-center gap-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-all font-medium shadow-sm"
                  >
                    <Database className="w-4 h-4" />
                    Save Dataset
                  </Button>
                ) */}
              </div>
            </div>
          </div>

          {evaluation && (
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    LLM-as-Judge Evaluation
                    {typeof evaluation.llm_as_judge?.failure_count === 'number' && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {evaluation.llm_as_judge.failure_count} issue(s)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {evaluation.llm_as_judge?.verdict || "No verdict returned."}
                  </p>
                  {(['fatal_errors', 'major_errors', 'minor_errors', 'warnings'] as const).map((k) => {
                    const items: string[] = evaluation.llm_as_judge?.[k] || [];
                    if (!items.length) return null;
                    const color =
                      k === 'fatal_errors' ? 'text-red-700'
                        : k === 'major_errors' ? 'text-orange-700'
                          : k === 'minor_errors' ? 'text-yellow-700'
                            : 'text-blue-700';
                    return (
                      <div key={k} className="mt-1.5 text-xs">
                        <span className={`font-semibold capitalize ${color}`}>{k.replace('_', ' ')}:</span>
                        <ul className="list-disc list-inside text-gray-600">
                          {items.map((it, i) => <li key={i}>{it}</li>)}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setEvaluation(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
                  aria-label="Dismiss evaluation"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {circuitJson && (
            <JsonEditorModal
              open={showJsonEditor}
              onOpenChange={setShowJsonEditor}
              initialData={{
                prompt,
                generatedJson: circuitJson,
                fixedJson: circuitJson,
                metadata: circuitData.metadata
              }}
              onSave={handleSaveToDataset}
              emitChangedJson={(jsonString) => {
                try {
                  const parsed = JSON.parse(jsonString);
                  setCircuitJson(parsed);
                  setLayoutCalculated(!layoutCalculated)
                } catch (e) {
                  // Invalid JSON, ignore or show error
                  console.log(e);
                }
              }}
            />
          )}

          <div className="flex-1 flex">

            {/* Canvas Area */}
            <div className="flex-1 p-6 overflow-auto">
              {/* Unresolved connections warning */}
              {unresolvedConnections.length > 0 && (
                <div className="mx-6 mb-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
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
                <div className="w-full h-full flex justify-center">
                  <svg
                    tabIndex={0}
                    ref={svgRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                    className="border border-gray-300 rounded-lg shadow-lg bg-[#e8e8e8]"
                    onMouseMove={(e) => {
                      if (draggingPoint && svgRef.current) {
                        const rect = svgRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        setWires(prev => prev.map(wire => {
                          if (wire.id === draggingPoint.wireId) {
                            const newPts = [...(wire.customPoints || [])];
                            newPts[draggingPoint.pointIndex] = { x, y };
                            const newPath = generateCustomWirePath(wire.p1, wire.p2, wire.routingStrategy, newPts);
                            return { ...wire, customPoints: newPts, steps: newPath };
                          }
                          return wire;
                        }));
                      }
                    }}
                    onMouseUp={() => setDraggingPoint(null)}
                    onMouseLeave={() => setDraggingPoint(null)}
                  >
                    {/* Parts */}
                    {circuitJson?.parts?.map((part, index) => {
                      const Component = componentsList[part.type as keyof typeof componentsList];
                      const pinDefs = componentPins[part.type];

                      if (!Component && !pinDefs) {
                        console.warn(`Component type not found in registry or API: ${part.type}`);
                        return null;
                      }

                      return (
                        <DraggableComponent
                          key={index}
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
                    {[...wires].sort((a, b) => {
                      const aPriority = (draggingPoint?.wireId === a.id ? 2 : (a.selected ? 1 : 0));
                      const bPriority = (draggingPoint?.wireId === b.id ? 2 : (b.selected ? 1 : 0));
                      return aPriority - bPriority;
                    }).map((w, i) => (
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
                        {w.selected && w.routingStrategy === 'custom' && w.customPoints && (
                          <g>
                            {/* Ghost points at midsegments */}
                            {[w.p1, ...w.customPoints, w.p2].map((pt, j, arr) => {
                              if (j === arr.length - 1) return null;
                              const nextPt = arr[j + 1];
                              const midX = (pt.x + nextPt.x) / 2;
                              const midY = (pt.y + nextPt.y) / 2;
                              return (
                                <circle
                                  key={`ghost-${j}`}
                                  cx={midX} cy={midY} r="4"
                                  fill="white" stroke="#3b82f6" strokeWidth={2}
                                  style={{ cursor: 'pointer', opacity: 0.6 }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const newPts = [...w.customPoints!];
                                    newPts.splice(j, 0, { x: midX, y: midY });
                                    setWires(prev => prev.map(wire => {
                                      if (wire.id === w.id) {
                                        const newPath = generateCustomWirePath(wire.p1, wire.p2, wire.routingStrategy, newPts);
                                        return { ...wire, customPoints: newPts, steps: newPath };
                                      }
                                      return wire;
                                    }));
                                    setDraggingPoint({ wireId: w.id, pointIndex: j });
                                  }}
                                />
                              )
                            })}

                            {/* Actual control points */}
                            {w.customPoints.map((cp, j) => (
                              <circle
                                key={`cp-${j}`}
                                cx={cp.x} cy={cp.y} r="5"
                                fill="#3b82f6" stroke="white" strokeWidth={1}
                                style={{ cursor: 'grab' }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  setDraggingPoint({ wireId: w.id, pointIndex: j });
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  const newPts = w.customPoints!.filter((_, idx) => idx !== j);
                                  setWires(prev => prev.map(wire => {
                                    if (wire.id === w.id) {
                                      const newPath = generateCustomWirePath(wire.p1, wire.p2, wire.routingStrategy, newPts);
                                      return { ...wire, customPoints: newPts, steps: newPath };
                                    }
                                    return wire;
                                  }));
                                }}
                              />
                            ))}
                          </g>
                        )}
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
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Generate</h3>
                    <p className="text-gray-500 max-w-md">
                      Enter a circuit description above or click components from the sidebar to build your prompt, then hit Generate!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Connection Table & Analysis */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
              {/* Wire Controls */}
              <WireControls
                wires={wires}
                selectedWireId={selectedWireId}
                onRoutingChange={handleWireRoutingChange}
                onAllWiresRoutingChange={handleAllWiresRoutingChange}
                onDeselectWire={() => setSelectedWireId(null)}
              />

              {/* Connection Table */}
              <div className="flex-1 border-b border-gray-200">
                <ConnectionTable
                  components={components}
                  connections={connections}
                  editable={false}
                  onConnectionUpdate={(v: any) => {
                    // update circuitJson also
                    // setCircuitJson(prev => {
                    //   if (!prev) return null;
                    //   const updatedConnections = prev.connections.map(conn => {
                    //     if (conn.id === connectionId) {
                    //       return { ...conn, [field]: value };
                    //     }
                    //     return conn;
                    //   });
                    //   return { ...prev, connections: updatedConnections };
                    // });
                    setConnections(prev => prev.map(conn =>
                      conn.id === v.connectionId
                        ? { ...conn, [v.field]: v.value }
                        : conn
                    ));
                  }}
                />
              </div>

              {/* Correctness Metrics */}
              {/*
              <div className="h-80 border-b border-gray-200">
                <CorrectnessMetrics circuitData={circuitData} />
              </div>
            */}

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
