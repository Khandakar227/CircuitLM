import * as React from "react";
import type { SVGProps } from "react";
const SvgSsd1306 = (props: SVGProps<SVGSVGElement>) => (
  <g width={150} height={116} {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), rotate(${props.rotate || 0})`}>
    <rect
      width={148}
      height={114}
      x={0.5}
      y={0.5}
      fill="#025CAF"
      stroke="#BE9B72"
      rx={13}
    />
    <g
      fill="#59340A"
      stroke="#BE9B72"
      strokeWidth={0.6}
      transform="translate(6 6)"
    >
      <circle cx={130} cy={6} r={5.5} />
      <circle cx={6} cy={6} r={5.5} />
      <circle cx={130} cy={96} r={5.5} />
      <circle cx={6} cy={96} r={5.5} />
    </g>
    <path fill="#1A1A1A" d="M11.4 26h128v64h-128z" />
    <text
      fill="#FFF"
      fontFamily="monospace"
      fontSize={4}
      fontWeight={300}
      textAnchor="middle"
    >
      <tspan x={56} y={8}>
        {"GND"}
      </tspan>
      <tspan x={66} y={8}>
        {"VCC"}
      </tspan>
      <tspan x={76} y={8}>
        {"SCL"}
      </tspan>
      <tspan x={84} y={8}>
        {"SDA"}
      </tspan>
    </text>
    <path
      fill="#FFF"
      stroke="#FFF"
      d="m115.5 10.06-1.59 2.974-3.453.464 2.495 2.245-.6 3.229 3.148-1.528 3.148 1.528-.6-3.23 2.495-2.244-3.453-.464z"
    />
    <g fill="#9D9D9A" strokeWidth={0.4} transform="translate(33 9)">
      <circle cx={50.5} cy={3.5} r={3.5} stroke="#9D5B96" data-pin="SDA" />
      <circle cx={41.5} cy={3.5} r={3.5} stroke="#009E9B" data-pin="SCL" />
      <circle cx={31.5} cy={3.5} r={3.5} stroke="#E8D977" data-pin="VCC" />
      <circle cx={21.5} cy={3.5} r={3.5} stroke="#C08540" data-pin="GND" />
    </g>
  </g>
);
export default SvgSsd1306;
