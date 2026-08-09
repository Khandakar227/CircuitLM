import React, { SVGProps } from "react";

interface GenericComponentProps extends SVGProps<SVGSVGElement> {
    width: number;
    height: number;
    pins: string[];
    name: string;
    rotate?: number;
    category?: string;
}

/**
 * Generic fallback body for a component that has no dedicated symbol.
 *
 * Redesign notes:
 *  - The name used to sit in the geometric centre, where it collided with pin
 *    labels on small parts. It now lives in a header band, so the body stays
 *    free for the pins.
 *  - Pin labels get an opaque chip behind them. Wires are drawn under the
 *    components, and a wire crossing a pin number is the single worst defect
 *    on a wiring diagram: the person at the terminal block reads the wrong
 *    screw.
 *  - Terminals are drawn as ring + stub, the way terminal blocks actually look,
 *    instead of a flat dot.
 *  - Category tints the header, so power, sensors and controllers are
 *    distinguishable at a glance on a dense sheet.
 */

const PIN_SPACING = 26;
const LABEL_CHAR_W = 7.4;
const NAME_CHAR_W = 8.8;
const HEADER_H = 34;
const STUB = 12;

const CATEGORY_TINT: Record<string, string> = {
    microcontroller: "#dbe4ff",
    controller: "#dbe4ff",
    sensor: "#e6fcf5",
    actuator: "#fff4e6",
    "power supply": "#ffe3e3",
    power: "#ffe3e3",
    display: "#f3f0ff",
    "passive component": "#f1f3f5",
    "active component": "#f1f3f5",
};

const GenericComponent: React.FC<GenericComponentProps> = ({
    width,
    height,
    pins,
    name,
    x = 0,
    y = 0,
    rotate = 0,
    category = "",
    ...props
}) => {
    const leftPins = pins.slice(0, Math.ceil(pins.length / 2));
    const rightPins = pins.slice(Math.ceil(pins.length / 2));

    const pinsPerSide = Math.max(leftPins.length, rightPins.length, 1);
    const minHeight = HEADER_H + (pinsPerSide + 1) * PIN_SPACING;

    const longestLeft = leftPins.reduce((m, p) => Math.max(m, p.length), 0);
    const longestRight = rightPins.reduce((m, p) => Math.max(m, p.length), 0);
    const minWidth = Math.max(
        (longestLeft + longestRight) * LABEL_CHAR_W + 56,
        name.length * NAME_CHAR_W + 28
    );

    const w = Math.max(Number(width) || 0, minWidth, 96);
    const h = Math.max(Number(height) || 0, minHeight);
    const tint = CATEGORY_TINT[category.toLowerCase()] ?? "#eef0f2";

    const renderPin = (pin: string, index: number, side: "left" | "right", count: number) => {
        const pinY = HEADER_H + ((h - HEADER_H) / (count + 1)) * (index + 1);
        const px = side === "left" ? 0 : w;
        const dir = side === "left" ? -1 : 1;
        const chipW = pin.length * LABEL_CHAR_W + 12;
        const chipX = side === "left" ? 8 : w - 8 - chipW;
        return (
            <g key={`${side}-${pin}-${index}`}>
                <line
                    x1={px}
                    y1={pinY}
                    x2={px + dir * STUB}
                    y2={pinY}
                    stroke="#343a40"
                    strokeWidth={2}
                />
                {/* data-pin is what getPinPosition() looks up — keep it on the tip */}
                <circle
                    cx={px + dir * STUB}
                    cy={pinY}
                    r={4.5}
                    fill="#ffffff"
                    stroke="#343a40"
                    strokeWidth={2}
                    data-pin={pin}
                />
                <rect
                    x={chipX}
                    y={pinY - 9}
                    width={chipW}
                    height={18}
                    rx={4}
                    fill="#ffffff"
                    opacity={0.95}
                    pointerEvents="none"
                />
                <text
                    x={side === "left" ? 14 : w - 14}
                    y={pinY}
                    textAnchor={side === "left" ? "start" : "end"}
                    dominantBaseline="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="#212529"
                    pointerEvents="none"
                >
                    {pin}
                </text>
            </g>
        );
    };

    return (
        <g {...props} transform={`translate(${x}, ${y}) rotate(${rotate}, ${w / 2}, ${h / 2})`}>
            <rect
                x={0}
                y={0}
                width={w}
                height={h}
                rx={10}
                fill="#ffffff"
                stroke="#343a40"
                strokeWidth={2.5}
            />
            <path
                d={`M 0 ${HEADER_H} L 0 10 Q 0 0 10 0 L ${w - 10} 0 Q ${w} 0 ${w} 10 L ${w} ${HEADER_H} Z`}
                fill={tint}
            />
            <line x1={0} y1={HEADER_H} x2={w} y2={HEADER_H} stroke="#343a40" strokeWidth={1.5} />
            <text
                x={w / 2}
                y={HEADER_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#212529"
                fontSize={14}
                fontWeight="bold"
                pointerEvents="none"
            >
                {name}
            </text>
            {leftPins.map((pin, i) => renderPin(pin, i, "left", leftPins.length))}
            {rightPins.map((pin, i) => renderPin(pin, i, "right", rightPins.length))}
        </g>
    );
};

export default GenericComponent;
