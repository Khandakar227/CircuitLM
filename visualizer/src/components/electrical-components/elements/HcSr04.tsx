import * as React from "react";
import type { SVGProps } from "react";
const HcSr04 = (props: SVGProps<SVGSVGElement>) => (
  <g height="25mm" width={"45mm"} {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), scale(4), rotate(${props.rotate})`}
  >
    <defs>
      <radialGradient
        id="hc-sr04_svg__a"
        cx={8.96}
        cy={10.04}
        r={3.58}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#777" />
        <stop offset={1} stopColor="#b9b9b9" />
      </radialGradient>
      <pattern
        id="hc-sr04_svg__b"
        width={2}
        height={2}
        patternUnits="userSpaceOnUse"
      >
        <path d="M0 0h1v1H0zm1 1h1v1H1z" />
      </pattern>
      <g id="hc-sr04_svg__c">
        <circle cx={8.98} cy={10} r={8.61} fill="#dcdcdc" />
        <circle cx={8.98} cy={10} r={7.17} fill="#222" />
        <circle cx={8.98} cy={10} r={5.53} fill="#777" fillOpacity={0.992} />
        <circle cx={8.98} cy={10} r={3.59} fill="url(#hc-sr04_svg__a)" />
        <circle cx={8.99} cy={10} r={0.277} fill="#777" fillOpacity={0.818} />
        <circle
          cx={8.98}
          cy={10}
          r={5.53}
          fill="url(#hc-sr04_svg__b)"
          opacity={0.397}
        />
      </g>
    </defs>
    <path
      fill="#456f93"
      d="M0 0v20.948h45V0zm1.422.464h.004a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 .996-1m41.956 0h.004a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 .996-1M1.422 18.484h.004a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 .996-1m41.956 0h.004a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 .996-1"
    />
    <path
      fill="none"
      stroke="#355a7c"
      strokeWidth={0.858}
      d="m15.293 5.888 2.934-2.934v3.124l2.944 2.943v10.143m2.098-.127v-2.473l-.966-.965v-12.5l2.577 1.488 4.741 4.741"
    />
    <use xlinkHref="#hc-sr04_svg__c" />
    <use xlinkHref="#hc-sr04_svg__c" x={27.12} />
    <g fill="none" stroke="#505132" strokeWidth={0.368}>
      <circle cx={43.4} cy={1.46} r={1} />
      <circle cx={43.4} cy={19.5} r={1} />
      <circle cx={1.43} cy={1.46} r={1} />
      <circle cx={1.43} cy={19.5} r={1} />
    </g>
    <rect
      width={10.272}
      height={4.139}
      x={17.111}
      y={0.626}
      fill="#878787"
      stroke="#424242"
      strokeWidth={0.368}
      ry={2.07}
    />
    <rect width={2.25} height={2.271} x={17.87} y={18} ry={0.568} />
    <rect width={2.25} height={2.271} x={20.41} y={18} ry={0.568} />
    <rect width={2.25} height={2.271} x={22.95} y={18} ry={0.568} />
    <rect width={2.25} height={2.271} x={25.49} y={18} ry={0.568} />
    <g fill="#ccc" strokeLinecap="round" strokeWidth={0.21}>
      <rect width={0.75} height={7} x={18.61} y={19} rx={0.2} data-pin="VCC" />
      <rect width={0.75} height={7} x={21.15} y={19} rx={0.2} data-pin="TRIG" />
      <rect width={0.75} height={7} x={23.69} y={19} rx={0.2} data-pin="ECHO" />
      <rect width={0.75} height={7} x={26.23} y={19} rx={0.2} data-pin="GND" />
    </g>
    <text fill="#e6e6e6" strokeWidth={0.055} fontSize={2.2} fontWeight={400}>
      <tspan x={17.6} y={8}>
        {"HC-SR04"}
      </tspan>
    </text>
    <text
      fill="#e6e6e6"
      strokeWidth={0.039}
      fontSize={1.55}
      fontWeight={400}
      transform="rotate(-90)"
    >
      <tspan x={-17.591} y={19.561}>
        {"VCC"}
      </tspan>
      <tspan x={-17.591} y={22.101}>
        {"TRIG"}
      </tspan>
      <tspan x={-17.591} y={24.641}>
        {"ECHO"}
      </tspan>
      <tspan x={-17.591} y={27.181}>
        {"GND"}
      </tspan>
    </text>
  </g>
);
export default HcSr04;
