import * as React from "react";
import type { SVGProps } from "react";
const SvgAnalogJoystick = (props: SVGProps<SVGSVGElement>) => (
  <g width="27.2mm" height="31.8mm" transform={`translate(${props.x || 0}, ${props.y || 0}), scale(4), rotate(${props.rotate || 0})`} {...props}>
    <defs>
      <radialGradient
        id="analog-joystick_svg__b"
        cx={13.6}
        cy={13.6}
        r={10.6}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} />
        <stop offset={0.9} />
        <stop offset={1} stopColor="#777" />
      </radialGradient>
      <radialGradient
        id="analog-joystick_svg__a"
        cx={13.6}
        cy={13.6}
        r={13.6}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} />
        <stop offset={0.8} stopColor="#444" />
        <stop offset={0.9} stopColor="#555" />
        <stop offset={1} />
      </radialGradient>
      <filter id="analog-joystick_svg__c" primitiveUnits="objectBoundingBox">
        <feTurbulence baseFrequency="2 2" type="fractalNoise" />
        <feColorMatrix values=".1 0 0 0 .1 .1 0 0 0 .1 .1 0 0 0 .1 0 0 0 0 1" />
        <feComposite in2="SourceGraphic" operator="lighter" />
        <feComposite in2="SourceAlpha" operator="in" result="body" />
      </filter>
      <path
        id="analog-joystick_svg__d"
        fill="silver"
        stroke="#a2a2a2"
        strokeWidth={0.024}
        d="M8.726 29.801a.83.83 0 0 0-.828.829.83.83 0 0 0 .828.828.83.83 0 0 0 .829-.828.83.83 0 0 0-.829-.829zm-.004.34h.004a.49.49 0 0 1 .49.489.49.49 0 0 1-.49.49.49.49 0 0 1-.489-.49.49.49 0 0 1 .485-.49z"
      />
    </defs>
    <path
      fill="#bd1e34"
      d="M1.3 0v31.7h25.5V0zm2.33.683h.009a1.87 1.87 0 0 1 1.87 1.87 1.87 1.87 0 0 1-1.87 1.87 1.87 1.87 0 0 1-1.87-1.87 1.87 1.87 0 0 1 1.87-1.87zm20.5 0h.009a1.87 1.87 0 0 1 1.87 1.87 1.87 1.87 0 0 1-1.87 1.87 1.87 1.87 0 0 1-1.87-1.87 1.87 1.87 0 0 1 1.87-1.87zm-20.5 26.8h.009a1.87 1.87 0 0 1 1.87 1.87 1.87 1.87 0 0 1-1.87 1.87 1.87 1.87 0 0 1-1.87-1.87 1.87 1.87 0 0 1 1.87-1.87zm20.4 0h.009a1.87 1.87 0 0 1 1.87 1.87 1.87 1.87 0 0 1-1.87 1.87 1.87 1.87 0 0 1-1.87-1.87 1.87 1.87 0 0 1 1.87-1.87zm-12.7 2.66h.004a.49.49 0 0 1 .489.489.49.49 0 0 1-.489.489.49.49 0 0 1-.489-.489.49.49 0 0 1 .485-.489m2.57 0h.004a.49.49 0 0 1 .489.489.49.49 0 0 1-.489.489.49.49 0 0 1-.489-.489.49.49 0 0 1 .485-.489m2.49.013h.004a.49.49 0 0 1 .489.489.49.49 0 0 1-.489.489.49.49 0 0 1-.489-.489.49.49 0 0 1 .485-.489m-7.62.007h.004a.49.49 0 0 1 .489.489.49.49 0 0 1-.489.489.49.49 0 0 1-.489-.49.49.49 0 0 1 .485-.488m10.2.013h.004a.49.49 0 0 1 .489.489.49.49 0 0 1-.489.489.49.49 0 0 1-.489-.49.49.49 0 0 1 .485-.488"
    />
    <g fill="#fff" strokeWidth={0.03} fontFamily="sans-serif" fontSize={1.2}>
      <text letterSpacing={0.053} textAnchor="middle">
        <tspan x={4.034} y={25.643}>
          {"Analog"}
        </tspan>
        <tspan x={4.061} y={27.159}>
          {"Joystick"}
        </tspan>
      </text>
      <text transform="rotate(-90)">
        <tspan x={-29.2} y={9.2} data-pin="VCC">
          {"VCC"}
        </tspan>
        <tspan x={-29.2} y={11.74} data-pin="VERT">
          {"VERT"}
        </tspan>
        <tspan x={-29.2} y={14.28} data-pin="HORZ">
          {"HORZ"}
        </tspan>
        <tspan x={-29.2} y={16.82} data-pin="SEL">
          {"SEL"}
        </tspan>
        <tspan x={-29.2} y={19.36} data-pin="GND">
          {"GND"}
        </tspan>
      </text>
    </g>
    <ellipse
      cx={13.6}
      cy={13.7}
      fill="url(#analog-joystick_svg__a)"
      rx={13.6}
      ry={13.7}
    />
    <path
      fill="#fff"
      d="M48.2 65.5s.042.179-.093.204c-.094.017-.246-.077-.322-.17-.094-.115-.082-.205-.009-.285.11-.122.299-.075.299-.075s-.345-.303-.705-.054c-.32.22-.228.52.06.783.262.237.053.497-.21.463-.18-.023-.252-.167-.21-.256.038-.076.167-.122.167-.122s-.149-.06-.324.005c-.157.06-.286.19-.276.513v1.51s.162-.2.352-.403c.214-.229.311-.384.53-.366.415.026.714-.159.918-.454.391-.569.085-1.2-.178-1.29"
    />
    <circle
      cx={13.6}
      cy={13.6}
      r={10.6}
      fill="url(#analog-joystick_svg__b)"
      filter="url(#analog-joystick_svg__c)"
      tabIndex={0}
    />
    <g fill="none" stroke="#fff" strokeWidth={0.142}>
      <path d="m7.8 31.7-.383-.351v-1.31l.617-.656h1.19l.721.656.675-.656h1.18l.708.656.662-.656h1.25l.643.656.63-.656h1.21l.695.656.636-.656h1.17l.753.656v1.3l-.416.39" />
      <path
        strokeLinecap="square"
        strokeLinejoin="bevel"
        d="m9.5 31.7.381-.344.381.331m1.838.013.381-.344.381.331m1.838.013.381-.344.381.331m1.738.013.381-.344.381.331"
      />
    </g>
    <use xlinkHref="#analog-joystick_svg__d" />
    <use xlinkHref="#analog-joystick_svg__d" x={2.54} />
    <use xlinkHref="#analog-joystick_svg__d" x={5.08} />
    <use xlinkHref="#analog-joystick_svg__d" x={7.62} />
    <use xlinkHref="#analog-joystick_svg__d" x={10.16} />
  </g>
);
export default SvgAnalogJoystick;
