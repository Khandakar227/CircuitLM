import * as React from "react";
import type { SVGProps } from "react";
const AcPowerOutput = (props: SVGProps<SVGSVGElement>) => (
  <g xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    id="AcPowerOutput_svg__Layer_1"
    x={0}
    y={0}
    viewBox="0 0 120 120"
    {...props}

    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1), rotate(${props.rotate || 0})`}
  >
    <style>
      {
        ".AcPowerOutput_svg__st3{fill:#fff;stroke:#000;stroke-width:2;stroke-miterlimit:10}"
      }
    </style>
    <path
      d="M57.8 12.1v98.7"
      style={{
        fill: "none",
        stroke: "#000",
        strokeWidth: 2,
        strokeMiterlimit: 10,
      }}
    />
    <circle
      cx={57.8}
      cy={61.5}
      r={25}
      style={{
        fill: "#fcee21",
        stroke: "#000",
        strokeWidth: 2,
        strokeMiterlimit: 10,
      }}
    />
    <path
      d="M39.5 61.5c2.3-4.5 6-10.4 10.2-10.2 7.6.3 10.3 20.3 17.3 20.4 2.1 0 5.2-1.7 9.2-11.2"
      style={{
        fill: "none",
        stroke: "#000",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeMiterlimit: 10,
      }}
    />
    <circle
      id="AcPowerOutput_svg__LIVE"
      cx={57.5}
      cy={11.8}
      r={6.5}
      className="AcPowerOutput_svg__st3"
      data-pin="LIVE"
    />
    <circle
      id="AcPowerOutput_svg__GND"
      cx={57.5}
      cy={110.5}
      r={6.5}
      className="AcPowerOutput_svg__st3"
      data-pin="GND"
    />
  </g>
);
export default AcPowerOutput;
