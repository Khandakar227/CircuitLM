import * as React from "react";
import type { SVGProps } from "react";
const SvgResistor = (props: SVGProps<SVGSVGElement>) => (
  <g
  width="54mm"
  height="15mm"
  {...props}
  transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1.5), rotate(${props.rotate || 0})`}
  >
    <style>
      {
        ".Resistor_svg__st0{fill:none;stroke:#000;stroke-miterlimit:10}.Resistor_svg__st1{fill:#c7b299;stroke-width:5.000000e-02}.Resistor_svg__st1,.Resistor_svg__st2,.Resistor_svg__st3{stroke:#000;stroke-miterlimit:10}.Resistor_svg__st2{fill:#c7b299;stroke-width:.25}.Resistor_svg__st3{stroke-width:5.000000e-02}"
      }
    </style>
    <path d="M32 47.2h7" className="Resistor_svg__st0" />
    <path
      d="M43 50.7h-2c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2h2c.5 0 1 .5 1 1v5c0 .6-.4 1-1 1zM58 50.7h-2c-.5 0-1-.5-1-1v-5c0-.5.5-1 1-1h2c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2z"
      className="Resistor_svg__st1"
    />
    <path d="M60 47.2h7" className="Resistor_svg__st0" />
    <path d="M43.7 44.7h11v5h-11z" className="Resistor_svg__st1" />
    <circle
      cx={32}
      cy={47.2}
      r={0.5}
      className="Resistor_svg__st2"
      data-pin={1}
    />
    <circle
      cx={67}
      cy={47.2}
      r={0.5}
      className="Resistor_svg__st2"
      data-pin={2}
    />
    <path
      d="M45.5 44.7h1v5h-1zM53.5 44.7h1v5h-1zM51.5 44.7h1v5h-1zM49.5 44.7h1v5h-1z"
      className="Resistor_svg__st3"
    />
    <text
      style={{
        fontFamily: "&quot",
        fontSize: 5,
      }}
      transform="translate(46.108 43.88)"
    >
      {(props as any)["data-value"] || "1kΩ"}
    </text>
  </g>
);
export default SvgResistor;
