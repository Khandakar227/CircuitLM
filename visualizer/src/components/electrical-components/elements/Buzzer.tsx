import * as React from "react";
import type { SVGProps } from "react";
const SvgBuzzer = (props: SVGProps<SVGSVGElement>) => (
  <g width="27.2mm" height="31.8mm" {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), scale(3), rotate(${props.rotate})`}>
    <path
      fill="none"
      stroke="#000"
      strokeWidth={0.5}
      d="M7.23 16.5V20"
      data-pin="GND"
    />
    <path
      fill="red"
      stroke="red"
      strokeWidth={0.5}
      d="M9.77 16.5V20"
      data-pin="VCC"
    />
    <g stroke="#000">
      <circle cx={8.5} cy={8.5} r={8.15} fill="#1a1a1a" strokeWidth={0.7} />
      <circle
        cx={8.5}
        cy={8.5}
        r={6.347}
        fill="none"
        strokeWidth={0.3}
        style={{
          paintOrder: "normal",
        }}
      />
      <circle
        cx={8.5}
        cy={8.5}
        r={4.349}
        fill="none"
        strokeWidth={0.3}
        style={{
          paintOrder: "normal",
        }}
      />
      <circle cx={8.5} cy={8.5} r={1.374} fill="#ccc" strokeWidth={0.25} />
    </g>
  </g>
);
export default SvgBuzzer;
