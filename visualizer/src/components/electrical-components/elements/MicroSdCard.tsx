import * as React from "react";
import type { SVGProps } from "react";
const SvgMicroSdCard = (props: SVGProps<SVGSVGElement>) => (
  <g
      width="65" height="62"
     {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), scale(3), rotate(${props.rotate || 0})`}
  >
    <path fill="#a1111b" d="M0 0h21.6v20.4H0z" />
    <path
      fill="#262626"
      stroke="#d5b7b5"
      strokeWidth={0.232}
      d="M1.32 4.59h3.13v8.06H1.32z"
    />
    <rect
      width={10.7}
      height={17.8}
      x={4.08}
      y={0.037}
      fill="#262626"
      rx={0.772}
      ry={0.772}
    />
    <path
      fill="#dbded9"
      d="m3.79 2.49-1.62.03V3.9c.474.043.486.002.489.196s-.07.237-1.2.257v.94c.388.018.665-.071.679.21l.176 3.66-.413.434.02.733.104.114 1.15.031.114-.114-.031-.764-.361-.403.041-3.62c.01-.258.176-.283.176-.283h.34c.109 0 .197.07.197.154v5.29c0 .086-.088.154-.197.154h-1.99v6.96h5.2c-.04-1.41-.191-5.31-.097-6 .016-.114.263-.066.272-.03.055.222.022 2.55.234 5.65.431.234.17-.655.423-.635.242.018-.08.81.394.635.384-4 .066-5.8.365-5.71.3.09-.204 5.36.044 6.09h4.18s-.17-4.16-.285-5.96c-.01-.155.473-.156.467 0-.065 1.63.08 5.67.08 5.67.533.066.168-.755.46-.745.28.01-.05.854.387.745 0 0 .218-4.08.226-5.69.001-.146.375-.14.372.007-.022 1.42-.13 5.97-.13 5.97h1.01L15 3.546s-.24-.038-.352.001c-3.96 1.4-7.81 1.06-10.7-.03-.175-.212-.146-.993-.146-.993z"
    />
    <rect
      width={3.97}
      height={1.97}
      x={5.84}
      y={6.42}
      fill="#262626"
      stroke="#ebebeb"
      strokeWidth={0.08}
      rx={0.3}
      ry={0.3}
    />
    <rect
      width={3.97}
      height={1.97}
      x={10.4}
      y={6.42}
      fill="#262626"
      stroke="#ebebeb"
      strokeWidth={0.08}
      rx={0.3}
      ry={0.3}
    />
    <path
      fill="#020202"
      stroke="#000"
      strokeWidth={0.027}
      d="M4.08 1.21s2.37.327 5.27.327 5.42-.327 5.42-.327v.57s-.949.331-5.42.327c-4.47-.004-5.27-.327-5.27-.327z"
    />
    <g fill="#fcfff9">
      <path d="M1.19 10.9h.275v6.95H1.19zM1.19 4.36h.275v.945H1.19zM1.84 2.52h.33V3.9h-.33z" />
    </g>
    <text
      fill="#fff"
      strokeWidth={0.033}
      fontFamily="sans-serif"
      fontSize={1.6}
    >
      <tspan x={16.61} y={2.9}>
        {"CD"}
      </tspan>
      <tspan x={16.45} y={5.45}>
        {"DO"}
      </tspan>
      <tspan x={15.39} y={7.98}>
        {"GND"}
      </tspan>
      <tspan x={15.65} y={10.62}>
        {"SCK"}
      </tspan>
      <tspan x={15.68} y={13.06}>
        {"VCC"}
      </tspan>
      <tspan x={16.88} y={15.57}>
        {"DI"}
      </tspan>
      <tspan x={16.67} y={18.24}>
        {"CS"}
      </tspan>
    </text>
    <g fill="#fff" stroke="#d9cb97" strokeWidth={0.381}>
      <circle cx={20.3} cy={2.48} r={0.814} data-pin="CD" />
      <circle cx={20.3} cy={4.99} r={0.814} data-pin="DO" />
      <circle cx={20.3} cy={7.53} r={0.814} data-pin="GND" />
      <circle cx={20.3} cy={10.1} r={0.814} data-pin="SCK" />
      <circle cx={20.3} cy={12.6} r={0.814} data-pin="VCC" />
      <circle cx={20.3} cy={15.2} r={0.814} data-pin="DI" />
      <circle cx={20.3} cy={17.7} r={0.814} data-pin="CS" />
    </g>
  </g>
);
export default SvgMicroSdCard;
