import * as React from "react";
import type { SVGProps } from "react";
const SvgStepperMotor = (props: SVGProps<SVGSVGElement>) => (
  <g
      width="21.6mm" height="16.2mm"
     {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), rotate(${props.rotate || 0})`}
  >
    <defs>
      <linearGradient
        id="StepperMotor_svg__b"
        x1={-11.46}
        x2={114.6}
        y1={57.3}
        y2={57.3}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#666" />
        <stop offset={1} stopColor="#fff" />
      </linearGradient>
      <linearGradient
        id="StepperMotor_svg__d"
        x1={0}
        x2={0}
        y1={-5}
        y2={5}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#9d9d9d" />
        <stop offset={1} stopColor="#9d9d9d" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="StepperMotor_svg__c"
        x1={5.73}
        x2={40.11}
        y1={57.3}
        y2={57.3}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#9d9d9d" />
        <stop offset={0.295} stopColor="#fdfafa" />
        <stop offset={1} stopColor="#2a2a2a" />
      </linearGradient>
    </defs>
    <g transform="translate(1 1)scale(3.78)">
      <path
        id="StepperMotor_svg__a"
        fill="#9f9f9f"
        d="M0 0c.5 0 .5 0 .5.5v4.55c-.5.5-.5.5-1 0V.55c0-.5 0-.5.5-.5"
        data-pin={1}
        transform="translate(24.9 57.3)"
      />
      <use xlinkHref="#StepperMotor_svg__a" x={2.54} data-pin={2} />
      <use xlinkHref="#StepperMotor_svg__a" x={5.08} data-pin={3} />
      <use xlinkHref="#StepperMotor_svg__a" x={7.62} data-pin={4} />
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect
          width={57.3}
          height={57.3}
          fill="url(#StepperMotor_svg__b)"
          stroke="#000"
          strokeWidth={0.325}
          rx={5}
          ry={5}
        />
        <circle cx={5.5} cy={5.5} r={2.75} fill="#666" />
        <circle cx={5.5} cy={5.5} r={2.25} fill="#e6e6e6" />
        <circle cx={51.8} cy={5.5} r={2.75} fill="#666" />
        <circle cx={51.8} cy={5.5} r={2.25} fill="#e6e6e6" />
        <circle cx={5.5} cy={51.8} r={2.75} fill="#666" />
        <circle cx={5.5} cy={51.8} r={2.25} fill="#e6e6e6" />
        <circle cx={51.8} cy={51.8} r={2.75} fill="#666" />
        <circle cx={51.8} cy={51.8} r={2.25} fill="#e6e6e6" />
      </g>
      <circle
        cx={28.65}
        cy={28.65}
        r={19.5}
        fill="#868686"
        fillOpacity={0.896}
        stroke="url(#StepperMotor_svg__c)"
        strokeWidth={1.414}
        opacity={0.73}
      />
      <path fill="transparent" d="M28.65 28.65H22.3L28.65 3 35 28.65z" />
      <path
        fill="#4d4d4d"
        stroke="url(#StepperMotor_svg__d)"
        strokeWidth={0.58}
        d="M-3.175-5.5a6.35 6.35 0 1 0 6.35 0z"
        transform="translate(28.65 28.65)"
      />
      <text fontFamily="arial" fontSize={14.667} textAnchor="middle">
        <tspan x={28.65} y={41} fontSize={6.349} />
        <tspan x={28.65} y={46} fontSize={4.444} />
      </text>
    </g>
  </g>
);
export default SvgStepperMotor;
