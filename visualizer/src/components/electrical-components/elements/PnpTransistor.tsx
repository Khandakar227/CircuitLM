import * as React from "react";
import type { SVGProps } from "react";
const SvgPnpTransistor = (props: SVGProps<SVGSVGElement>) => (
  <g
    id="PNPTransistor_svg__Layer_1"
     {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1.5), rotate(${props.rotate || 0})`}    {...props}
  >
    <style>
      {".PNPTransistor_svg__st1{fill:none;stroke:#000;stroke-miterlimit:10}"}
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
      d="M53.5 49.5c-1.7 2-3.3 4-5 6h-7M59.5 49.5c1.7 2 3.3 4 5 6h7M49.2 54.7l1.3-1.7"
      className="PNPTransistor_svg__st1"
    />
    <path d="m51.4 54.3.4-3-2.7 1.1z" />
    <path d="M56.5 49.5v-6" className="PNPTransistor_svg__st1" />
    <circle data-pin="E" cx={41.5} cy={55.5} r={0.5} />
    <circle data-pin="C" cx={71.5} cy={55.5} r={0.5} />
    <circle data-pin="B" cx={56.5} cy={43.5} r={0.5} />
  </g>
);
export default SvgPnpTransistor;
