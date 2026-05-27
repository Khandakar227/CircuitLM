import * as React from "react";
import type { SVGProps } from "react";
const SvgDcMotor = (props: SVGProps<SVGSVGElement>) => (
  <g   
    viewBox="0 0 150 150"
    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1.2), rotate(${props.rotate || 0})`} {...props}
  >
    <style>{".DCMotor_svg__st1{fill:#666}"}</style>
    <path
      d="M99.3 43.6H49.4c-6.5 6.9-10.5 16.4-10.5 27 0 10.1 3.7 19.2 9.6 26h51.8c6-6.8 9.6-15.9 9.6-26 0-10.6-4.1-20.1-10.6-27"
      style={{
        opacity: 0.74,
        fill: "#bfbfbf",
      }}
    />
    <circle cx={51.5} cy={70.5} r={3.5} className="DCMotor_svg__st1" />
    <circle cx={74.4} cy={87.5} r={3.5} className="DCMotor_svg__st1" />
    <circle cx={97.5} cy={70.5} r={3.5} className="DCMotor_svg__st1" />
    <path
      d="M86.4 72.5v-4.4h-4.3c-.2-.6-.4-1.2-.7-1.7l3-3-3.1-3.1-3 3c-.5-.3-1.1-.5-1.7-.7v-4.3h-4.4v4.3c-.6.2-1.2.4-1.7.7l-3-3-3.1 3.1 3 3c-.3.5-.5 1.1-.7 1.7h-4.3v4.4h4.3c.2.6.4 1.2.7 1.7l-3 3 3.1 3.1 3-3c.5.3 1.1.5 1.7.7v4.3h4.4V78c.6-.2 1.2-.4 1.7-.7l3 3 3.1-3.1-3-3c.3-.5.5-1.1.7-1.7z"
      style={{
        fill: "#f9df6e",
        stroke: "#605e43",
        strokeWidth: 0.25,
        strokeMiterlimit: 10,
      }}
    />
    <circle
      cx={74.4}
      cy={70.3}
      r={5.1}
      style={{
        fill: "#c1c1c1",
        stroke: "#666",
        strokeWidth: 0.25,
        strokeMiterlimit: 10,
      }}
    />
    <path
      data-pin="+"
      d="M64 38.5h5v5h-5z"
      style={{
        fill: "#e62222",
      }}
    />
    <path
      data-pin="-"
      d="M79 38.5h5v5h-5z"
      style={{
        fill: "#212324",
      }}
    />
  </g>
);
export default SvgDcMotor;
