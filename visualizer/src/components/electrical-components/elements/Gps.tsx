import * as React from "react";
import type { SVGProps } from "react";
const SvgGps = (props: SVGProps<SVGSVGElement>) => (
  <g xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    id="Gps_svg__Layer_1"
    x={0}
    y={0}
    viewBox="0 0 57 74.6"
    {...props}

    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1), rotate(${props.rotate || 0})`}
  >
    <style>
      {
        '.Gps_svg__st1{fill:#fff}.Gps_svg__st4{fill:khaki}.Gps_svg__st5{fill:#333}.Gps_svg__st6{font-family:"ArialMT"}.Gps_svg__st7{font-size:1.779px}'
      }
    </style>
    <path
      d="M3.1.5h51.2c1.4 0 2.5 1.3 2.5 2.9V71c0 1.6-1.1 2.9-2.5 2.9H3.1C1.7 73.9.6 72.6.6 71V3.4C.6 1.8 1.7.5 3.1.5"
      style={{
        fill: "#1e5f8b",
      }}
    />
    <circle cx={6} cy={5.3} r={2.2} className="Gps_svg__st1" />
    <circle cx={51.2} cy={5.3} r={2.2} className="Gps_svg__st1" />
    <circle cx={6} cy={69} r={2.2} className="Gps_svg__st1" />
    <circle cx={51.2} cy={69} r={2.2} className="Gps_svg__st1" />
    <path
      d="M8.8 14.7h38.4c1.2 0 2.1 1.2 2.1 2.8v36.6c0 1.6-.9 2.8-2.1 2.8H8.8c-1.2 0-2.1-1.2-2.1-2.8V17.5c-.1-1.5.9-2.8 2.1-2.8"
      style={{
        fill: "#d4a574",
      }}
    />
    <path
      d="M14.4 21.4h27c.5 0 1 .7 1 1.5v26c0 .8-.4 1.5-1 1.5h-27c-.5 0-1-.7-1-1.5v-26c.1-.9.5-1.5 1-1.5"
      className="Gps_svg__st1"
    />
    <circle
      cx={27.9}
      cy={35.9}
      r={2.7}
      style={{
        opacity: 0.5,
        fill: "#888",
      }}
    />
    <g id="Gps_svg__pin-header"

    >
      <path
        d="M20.8 62.6h2.7v11.1h-2.7zM25.3 62.6H28v11.1h-2.7zM29.7 62.6h2.7v11.1h-2.7zM34.2 62.6h2.7v11.1h-2.7z"
        className="Gps_svg__st4"
      />
      <circle
        cx={22.1}
        cy={68}
        r={0.7}
        className="Gps_svg__st5"
        data-pin="VCC"
      />
      <circle
        cx={26.6}
        cy={68}
        r={0.7}
        className="Gps_svg__st5"
        data-pin="RX"
      />
      <circle cx={31} cy={68} r={0.7} className="Gps_svg__st5" data-pin="TX" />
      <circle
        cx={35.5}
        cy={68}
        r={0.7}
        className="Gps_svg__st5"
        data-pin="GND"
      />
    </g>
    <text
      className="Gps_svg__st1 Gps_svg__st6 Gps_svg__st7"
      transform="translate(20.264 60.412)"
    >
      {"VCC"}
    </text>
    <text
      className="Gps_svg__st1 Gps_svg__st6 Gps_svg__st7"
      transform="translate(25.353 60.412)"
    >
      {"RX"}
    </text>
    <text
      className="Gps_svg__st1 Gps_svg__st6 Gps_svg__st7"
      transform="translate(29.901 60.412)"
    >
      {"TX"}
    </text>
    <text
      className="Gps_svg__st1 Gps_svg__st6 Gps_svg__st7"
      transform="translate(33.508 60.412)"
    >
      {"GND"}
    </text>
    <text
      className="Gps_svg__st1 Gps_svg__st6"
      style={{
        fontSize: "3.5581px",
      }}
      transform="rotate(89.999 16.386 35.436)"
    >
      {"GY-NEO6MV2"}
    </text>
    <circle cx={25.3} cy={5.9} r={3.6} className="Gps_svg__st1" />
  </g>
);
export default SvgGps;
