import React, { SVGProps } from "react";

interface GenericComponentProps extends SVGProps<SVGSVGElement> {
    width: number;
    height: number;
    pins: string[];
    name: string;
    rotate?: number;
}

// Sizing heuristics so pins/labels never clutter, regardless of the
// declared (data) width/height. These are intentionally generous.
const PIN_SPACING = 22;     // vertical px between adjacent pins on a side
const LABEL_CHAR_W = 6.2;   // approx px per char at fontSize 10
const NAME_CHAR_W = 8.5;    // approx px per char at fontSize 14 bold

const GenericComponent: React.FC<GenericComponentProps> = ({
    width,
    height,
    pins,
    name,
    x = 0,
    y = 0,
    rotate = 0,
    ...props
}) => {
    // Distribute pins evenly: first half on the left side, rest on the right.
    const leftPins = pins.slice(0, Math.ceil(pins.length / 2));
    const rightPins = pins.slice(Math.ceil(pins.length / 2));

    // Dynamic size: grow the box to fit the pins and their labels, but never
    // shrink below the declared size. Height scales with pins-per-side; width
    // fits the left label + centered name + right label without overlap.
    const pinsPerSide = Math.max(leftPins.length, rightPins.length, 1);
    const minHeight = (pinsPerSide + 1) * PIN_SPACING;

    const longestLeft = leftPins.reduce((m, p) => Math.max(m, p.length), 0);
    const longestRight = rightPins.reduce((m, p) => Math.max(m, p.length), 0);
    const minWidth =
        (longestLeft + longestRight) * LABEL_CHAR_W + name.length * NAME_CHAR_W + 40;

    const w = Math.max(width || 0, minWidth, 60);
    const h = Math.max(height || 0, minHeight);

    return (
        <g
            {...props}
            transform={`translate(${x}, ${y}) rotate(${rotate}, ${w / 2}, ${h / 2})`}
        >
            {/* Main body of the component */}
            <rect
                x={0}
                y={0}
                width={w}
                height={h}
                fill="#f0f0f0"
                stroke="#333"
                strokeWidth={2}
                rx={4}
            />

            {/* Component Name Label */}
            <text
                x={w / 2}
                y={h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#333"
                fontSize={14}
                fontWeight="bold"
                fontFamily="monospace"
                pointerEvents="none"
            >
                {name}
            </text>

            {/* Left side pins */}
            {leftPins.map((pin, index) => {
                const pinY = (h / (leftPins.length + 1)) * (index + 1);
                return (
                    <g key={`pin-${pin}`}>
                        {/* Visual pin line */}
                        <line x1={-10} y1={pinY} x2={0} y2={pinY} stroke="#333" strokeWidth={2} />
                        {/* The actual data-pin element used by getPinPosition */}
                        <circle cx={-10} cy={pinY} r={3} fill="#555" data-pin={pin} />
                        {/* Pin label */}
                        <text x={4} y={pinY} dominantBaseline="middle" fontSize={10} fill="#666" pointerEvents="none">
                            {pin}
                        </text>
                    </g>
                );
            })}

            {/* Right side pins */}
            {rightPins.map((pin, index) => {
                const pinY = (h / (rightPins.length + 1)) * (index + 1);
                return (
                    <g key={`pin-${pin}`}>
                        {/* Visual pin line */}
                        <line x1={w} y1={pinY} x2={w + 10} y2={pinY} stroke="#333" strokeWidth={2} />
                        {/* The actual data-pin element used by getPinPosition */}
                        <circle cx={w + 10} cy={pinY} r={3} fill="#555" data-pin={pin} />
                        {/* Pin label */}
                        <text x={w - 4} y={pinY} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#666" pointerEvents="none">
                            {pin}
                        </text>
                    </g>
                );
            })}
        </g>
    );
};

export default GenericComponent;
