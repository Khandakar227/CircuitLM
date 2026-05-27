import * as React from "react";
import type { SVGProps } from "react";
const SvgCapacitor = (props: SVGProps<SVGSVGElement>) => (
  <g
    width={"40mm"}
    height={"60mm"}
    {...props} transform={`translate(${props.x || 0}, ${props.y || 0}),scale(1.5), rotate(${props.rotate || 0})`}
  >
    <style>
      {".Capacitor_svg__st0{fill:#b3b3b3}.Capacitor_svg__st2{fill:#99fffc}"}
    </style>
    <path
      id="Capacitor_svg___x2B_"
      data-pin="+"
      d="M27 52c.6 0 1-.4 1-1V40c0-.6-.4-1-1-1s-1 .4-1 1v11c0 .6.4 1 1 1"
      className="Capacitor_svg__st0"
    />
    <path
      id="Capacitor_svg___x2D_"
      data-pin="-"
      d="M13 52c.6 0 1-.4 1-1V40c0-.6-.4-1-1-1s-1 .4-1 1v11c0 .6.4 1 1 1"
      className="Capacitor_svg__st0"
    />
    <path
      d="M25 42c-2.6-.4-2.8-2.9-5-3-2.4-.2-3 2.7-6 3s-5.4-2-5.7-2.3C6.5 37.8 6.2 35.4 6 34c-1-8.5-.1-23 0-25 0-4.4 3.6-8 8-8h11c4.4 0 8 3.6 8 8 .1 2 1 16.5 0 25-.2 1.3-.5 3.7-2.3 5.7-.3.2-2.8 2.8-5.7 2.3"
      style={{
        fill: "#0ff",
      }}
    />
    <path
      d="M7 8c-.5-.5.5-2.6 2-4 1.8-1.7 4.2-1.9 5-2s1.5 0 2 0q-1.35 2.7-3 3c-.9.2-1.2-.3-2 0-1.5.5-1.4 2.5-3 3-.2.1-.8.2-1 0M25 2c.5 0 2.2-.1 4 1 2 1.2 3.4 3.5 3 4-.3.4-1.9-.2-3-1-.6-.5-.5-.6-1-1-1.1-.8-1.9-.4-4-1-.8-.2-2-.6-2-1 0-.5 1.7-.9 3-1"
      className="Capacitor_svg__st2"
    />
    <text
      style={{
        fontFamily: "&quot",
        fontSize: 4,
      }}
      transform="translate(25.936 39.17)"
    >
      {"+"}
    </text>
  </g>
);
export default SvgCapacitor;
