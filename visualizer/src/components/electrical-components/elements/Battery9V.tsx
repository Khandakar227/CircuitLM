import * as React from "react";
import type { SVGProps } from "react";
const SvgBattery9V = (props: SVGProps<SVGSVGElement>) => (
  <g
    width="21.6mm" height="16.2mm"
    {...props} transform={`translate(${props.x || 0}, ${props.y || 0}),scale(1.5), rotate(${props.rotate || 0})`}
  >
    <style>
      {
        ".Battery9V_svg__st5{fill:#b7b6b6;stroke:#999;stroke-width:.15;stroke-miterlimit:10}"
      }
    </style>
    <path
      d="M52.8 114.5H6.7c-3.5 0-6.3-2.8-6.3-6.4V10.4C.4 6.8 3.1 4 6.7 4h46.2c3.5 0 6.3 2.8 6.3 6.4V108c-.1 3.7-2.9 6.5-6.4 6.5"
      style={{
        fill: "#232323",
      }}
    />
    <path
      d="M59.1 37.6H.4V10.4C.4 6.8 3.1 4 6.7 4h46.2c3.5 0 6.3 2.8 6.3 6.4-.1 0-.1 27.2-.1 27.2"
      style={{
        fill: "#ffba00",
      }}
    />
    <text
      style={{
        fill: "#f2f2f2",
        fontFamily: "&quot",
        fontSize: "12.0515px",
      }}
      transform="matrix(.9739 0 0 1 23.001 66.306)"
    >
      {"9V"}
    </text>
    <path
      id="Battery9V_svg__VCC"
      data-pin="VCC"
      d="M9.4 0h13.7v4H9.4z"
      className="Battery9V_svg__st5"
    />
    <path
      id="Battery9V_svg__GND"
      data-pin="GND"
      d="M34.8 0h13.7v4H34.8z"
      className="Battery9V_svg__st5"
    />
  </g>
);
export default SvgBattery9V;
