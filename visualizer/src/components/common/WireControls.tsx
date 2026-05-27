"use client"
import WireRouteSelect from './WireRouteSelect';

interface Wire {
    id: string;
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    steps: string[] | string;
    color: string;
    selected: boolean;
    routingStrategy: 'auto' | 'l-shape' | 'z-shape' | 'u-shape' | 'direct' | 'custom';
}

interface WireControlsProps {
    wires: Wire[];
    selectedWireId: string | null;
    onRoutingChange: (wireId: string, strategy: 'auto' | 'l-shape' | 'z-shape' | 'u-shape' | 'direct' | 'custom') => void;
    onAllWiresRoutingChange: (strategy: 'auto' | 'l-shape' | 'z-shape' | 'u-shape' | 'direct' | 'custom') => void;
    onDeselectWire: () => void;
}

export default function WireControls({
    wires,
    selectedWireId,
    onRoutingChange,
    onAllWiresRoutingChange,
    onDeselectWire
}: WireControlsProps) {
    const selectedWire = wires.find(w => w.id === selectedWireId);
    const currentRoutingStrategy = selectedWire?.routingStrategy || 'auto';

    const handleApplyToAllWires = () => {
        if (selectedWire) {
            onAllWiresRoutingChange(currentRoutingStrategy);
        }
    };

    return (
        <>
            {selectedWireId ? (
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Wire Controls</h3>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-600">Routing Strategy:</label>
                        <WireRouteSelect
                            value={currentRoutingStrategy}
                            onChange={(e) => onRoutingChange(selectedWireId, e.target.value as any)}
                        />
                        <button
                            onClick={handleApplyToAllWires}
                            className="w-full px-2 py-1 text-xs rounded transition-colors bg-purple-300 hover:bg-purple-400"
                        >
                            All wires to "{currentRoutingStrategy}"
                        </button>
                        <button
                            onClick={onDeselectWire}
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
                        <div>• <strong>L-Shape:</strong> Right-angle routing</div>
                        <div>• <strong>Z-Shape:</strong> Zigzag pattern</div>
                        <div>• <strong>U-Shape:</strong> U-shaped routing</div>
                        <div>• <strong>Direct:</strong> Straight line</div>
                    </div>
                </div>
            )}
        </>
    );
}
