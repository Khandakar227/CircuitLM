import * as React from "react";
import type { SVGProps } from "react";
const SvgGasSensor = (props: SVGProps<SVGSVGElement>) => (
  <g width="36.232mm" height="16.617mm" {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), rotate(${props.rotate})`}
    {...props}
  >
    <defs>
      <pattern
        id="gas-sensor_svg__b"
        width={4.1}
        height={4.1}
        patternUnits="userSpaceOnUse"
      >
        <path
          fill="#949392"
          d="M0 0v4.09h.4v-.85l.42.381v.469h.4v-.1l.109.1h.711v-.799l.42.379v.42h.398v-.049l.055.049h.766v-.75l.42.381v.369h.4V0h-.4v.311L3.765 0h-.598l.11.1V1l-.42-.38V0H2.46v.25L2.183 0h-.6l.056.05v.9L1.22.57V0h-.4v.2L.596 0zm.4.359L.82.74v.9L.4 1.259zm1.64.05.42.392v.889l-.42-.38zM3.68.47l.42.38v.89l-.42-.38zm-2.46.64.42.38v.9l-.42-.38zm1.64.05.42.381v.898l-.42-.379zM.4 1.801l.42.38v.9L.4 2.7zm1.64.049.42.38v.9l-.42-.38zm1.64.05.42.38v.9l-.42-.38zm-2.46.65.42.38v.9l-.42-.38zm1.64.05.42.38v.9l-.42-.38z"
        />
      </pattern>
      <g id="gas-sensor_svg__a">
        <path
          fill="#c6bf95"
          d="M29 4.6c.382 0 .748-.152 1.02-.422s.422-.636.422-1.02v-.001c0-.382-.152-.748-.422-1.02s-.636-.422-1.02-.422H2.9a.423.423 0 0 0-.423.423v2.04c0 .234.189.423.423.423H29z"
        />
        <path d="M0 0h6.9v6.9H0z" />
      </g>
    </defs>
    <path
      fill="#0664af"
      d="M113 0H0v59.5h113zm-1.6 53.2c0 2.62-2.12 4.74-4.74 4.74s-4.74-2.12-4.74-4.74 2.12-4.74 4.74-4.74 4.74 2.12 4.74 4.74m-110 0c0 2.62 2.12 4.74 4.74 4.74s4.74-2.12 4.74-4.74-2.12-4.74-4.74-4.74S1.4 50.58 1.4 53.2m105-51.6c2.62 0 4.74 2.12 4.74 4.74s-2.12 4.74-4.74 4.74-4.74-2.12-4.74-4.74 2.12-4.74 4.74-4.74m-101 0C2.78 1.6.66 3.72.66 6.34s2.12 4.74 4.74 4.74 4.74-2.12 4.74-4.74S8.02 1.6 5.4 1.6"
    />
    <use xlinkHref="#gas-sensor_svg__a" x={107} y={12} data-pin="AOUT" />
    <use xlinkHref="#gas-sensor_svg__a" x={107} y={21.3} data-pin="DOUT" />
    <use xlinkHref="#gas-sensor_svg__a" x={107} y={31.1} data-pin="GND" />
    <use xlinkHref="#gas-sensor_svg__a" x={107} y={40.9} data-pin="DOUT" />
    <circle
      cx={47.7}
      cy={29.8}
      r={31.2}
      fill="none"
      stroke="#fff"
      strokeWidth={0.4}
    />
    <circle cx={47.7} cy={29.8} r={28.8} fill="#dedede" />
    <circle cx={47.7} cy={29.8} r={25.8} fill="#d0ccc4" />
    <circle cx={47.7} cy={29.8} r={21.4} fill="#bab3ad" />
    <circle cx={47.7} cy={29.8} r={21.4} fill="url(#gas-sensor_svg__b)" />
    <text fill="#fff" fontFamily="sans-serif" fontSize={3.72}>
      <tspan x={94.656} y={16.729}>
        {"AOUT"}
      </tspan>
      <tspan x={94.656} y={26.098}>
        {"DOUT"}
      </tspan>
      <tspan x={94.656} y={35.911}>
        {"GND"}
      </tspan>
      <tspan x={94.656} y={45.696} data-pin="VCC">
        {"VCC"}
      </tspan>
    </text>
    <path
      d="M81.322 5.818h8.526v3.828h-8.526z"
      style={{
        opacity: 1,
        fill: "#999",
        strokeWidth: 1.5747,
        paintOrder: "stroke markers fill",
      }}
    />
    <path
      d="M83.163 5.818h4.844v3.828h-4.844z"
      style={{
        opacity: 1,
        fill: "#e6e6e6",
        strokeWidth: 2.05589,
        paintOrder: "stroke markers fill",
      }}
    />
    <circle
      cx={85.5}
      cy={8}
      r={1.8}
      fill="#03f704"
      filter="url(#gas-sensor_svg__ledFilter)"
    />
    <path
      d="M81.018 48.7h8.526v3.828h-8.526z"
      style={{
        fill: "#999",
        strokeWidth: 1.5747,
        paintOrder: "stroke markers fill",
      }}
    />
    <path
      d="M82.859 48.7h4.844v3.828h-4.844z"
      style={{
        fill: "#e6e6e6",
        strokeWidth: 2.05589,
        paintOrder: "stroke markers fill",
      }}
    />
    {"false"}
    <text fill="#fff" fontFamily="sans-serif" fontSize={3}>
      <tspan x={80.213} y={4.727} data-pin="PWR LED">
        {"PWR LED"}
      </tspan>
      <tspan x={80.464} y={55.852} data-pin="D0 LED">
        {"D0 LED"}
      </tspan>
    </text>
  </g>
);
export default SvgGasSensor;
