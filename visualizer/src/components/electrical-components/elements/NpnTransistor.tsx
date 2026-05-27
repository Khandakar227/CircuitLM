import * as React from "react";
import type { SVGProps } from "react";
const SvgNpnTransistor = (props: SVGProps<SVGSVGElement>) => (
  <g  
     {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1.5), rotate(${props.rotate || 0})`}    {...props}
  >
    <style>
      {".NPNTransistor_svg__st1{fill:none;stroke:#000;stroke-miterlimit:10}"}
    </style>
    <path
      d="M50.8 49.5h12v1h-12z"
      style={{
        fill: "#fff",
        stroke: "#000",
        strokeMiterlimit: 10,
      }}
    />
    <path
      d="M53.5 49.5c-1.7 2-3.3 4-5 6h-7M59.5 49.5c1.7 2 3.3 4 5 6h7M50.1 53.6l3.4-4.1"
      className="NPNTransistor_svg__st1"
    />
    <path d="m51.7 54.3-3.2 1.2.6-3.3z" />
    <path d="M56.5 49.5v-6" className="NPNTransistor_svg__st1" />
    <circle id="NPNTransistor_svg__E" data-pin="E" cx={41.5} cy={55.5} r={0.5} />
    <circle id="NPNTransistor_svg__C" data-pin="C" cx={71.5} cy={55.5} r={0.5} />
    <circle id="NPNTransistor_svg__B" data-pin="B" cx={56.5} cy={43.5} r={0.5} />
  </g>
);
export default SvgNpnTransistor;
