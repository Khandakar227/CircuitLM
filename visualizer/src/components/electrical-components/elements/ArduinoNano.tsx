import * as React from "react";
import type { SVGProps } from "react";
const SvgArduinoNano = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    id="ArduinoNano_svg__Layer_1"
    x={0}
    y={0}
    viewBox="0 0 127.3 50.5"
    {...props}
  >
    <style>
      {
        ".ArduinoNano_svg__st1,.ArduinoNano_svg__st2{stroke:#bbb}.ArduinoNano_svg__st1{fill:#fff;stroke-miterlimit:10}.ArduinoNano_svg__st2{fill:#ccc;stroke-width:.1}.ArduinoNano_svg__st5{filter:url(#ArduinoNano_svg__solderPlate)}.ArduinoNano_svg__st6{fill:#333}.ArduinoNano_svg__st11{fill:#eee;stroke:#aaa;stroke-width:5.000000e-02}.ArduinoNano_svg__st17{fill:#fff;stroke:#bbb;stroke-width:1.5;stroke-miterlimit:10}.ArduinoNano_svg__st18{fill:#fffdfd}.ArduinoNano_svg__st19{font-family:monospace}.ArduinoNano_svg__st20{font-size:2px}"
      }
    </style>
    <filter
      id="ArduinoNano_svg__solderPlate"
    >
      <feTurbulence baseFrequency={1} result="r0" type="fractalNoise" />
      <feComposite
        in="r0"
        in2="SourceGraphic"
        k1={0.6}
        k2={0.6}
        k3={1.2}
        k4={0.25}
        operator="arithmetic"
        result="r1"
      />
      <feBlend in="r1" in2="SourceGraphic" mode="luminosity" result="r2" />
      <feComposite in="r2" in2="SourceGraphic" operator="in" result="r3" />
    </filter>
    <filter
      id="ArduinoNano_svg__ledFilter"
      width={2.8}
      height={2.2}
      x={-0.8}
      y={-0.8}
    >
      <feGaussianBlur stdDeviation={0.5} />
    </filter>
    <g id="ArduinoNano_svg__pcb">
      <path
        d="M4 0h123.3v50.5H4z"
        style={{
          fill: "#1b7e84",
        }}
      />
      <circle cx={6.8} cy={2.9} r={2.5} className="ArduinoNano_svg__st1" />
      <circle cx={124.2} cy={2.9} r={2.5} className="ArduinoNano_svg__st1" />
      <circle cx={124.2} cy={47.1} r={2.5} className="ArduinoNano_svg__st1" />
      <circle cx={6.8} cy={47.1} r={2.5} className="ArduinoNano_svg__st1" />
    </g>
    <path
      d="m56.6 25.2-.8-.9.7-.7-8.5-8.5-.7.8-.7-.7-8.5 8.4.7.7-.8.8 8.5 8.5.8-.8.8.9z"
      className="ArduinoNano_svg__st2"
    />
    <g id="ArduinoNano_svg__mcu" transform="rotate(45 -2.978 23.39)">
      <path
        d="M26.9-18h12.9v12.9H26.9z"
        style={{
          fill: "#444",
        }}
        transform="rotate(90 33.336 -11.512)"
      />
      <circle
        cx={38.4}
        cy={-16.5}
        r={1}
        style={{
          fill: "#222",
        }}
      />
    </g>
    <g id="ArduinoNano_svg__usb-mini-b">
      <g className="ArduinoNano_svg__st5">
        <path
          d="M4.8 10.8h4.5v27.8H4.8zM19.6 10.8h4.5v27.8h-4.5zM24.7 20h3.1v1.4h-3.1zM24.7 22.2h3.1v1.4h-3.1zM24.7 24.3h3.1v1.4h-3.1zM24.7 26.5h3.1v1.4h-3.1zM24.7 28.8h3.1v1.4h-3.1z"
          className="ArduinoNano_svg__st6"
        />
      </g>
      <path
        d="M0 13.6h25.2v22.1H0z"
        style={{
          fill: "#999",
        }}
      />
      <path d="M.4 14.2h24.4v21H.4z" className="ArduinoNano_svg__st2" />
      <path
        d="M11.3 16.7H2v2.6h9.4m-.1 10.5H2v2.6h9.4M2.3 21.5l12.2.9v4.3l-12.2.8"
        style={{
          fill: "none",
          stroke: "#333",
          strokeWidth: 0.26,
          strokeLinecap: "round",
        }}
      />
      <path
        d="M13.3 22.4v4.3"
        style={{
          fill: "none",
          stroke: "#333",
        }}
      />
      <path
        d="M21 18.1v12.8"
        style={{
          fill: "none",
          stroke: "#333",
          strokeWidth: 0.35,
          strokeLinecap: "round",
        }}
      />
    </g>
    <g transform="translate(27.7 5)">
      <g id="ArduinoNano_svg__led-body">
        <g className="ArduinoNano_svg__st5">
          <path d="M54.8 9.2h7.4v3.4h-7.4z" className="ArduinoNano_svg__st6" />
        </g>
        <path d="M56.5 8.9h3.8v4h-3.8z" className="ArduinoNano_svg__st11" />
      </g>
    </g>
    <g className="ArduinoNano_svg__st5">
      <path d="M82.5 19.8h7.4v3.4h-7.4z" className="ArduinoNano_svg__st6" />
    </g>
    <path d="M84.2 19.6H88v4h-3.8z" className="ArduinoNano_svg__st11" />
    <g className="ArduinoNano_svg__st5">
      <path d="M82.5 25.5h7.4v3.4h-7.4z" className="ArduinoNano_svg__st6" />
    </g>
    <path d="M84.2 25.2H88v4h-3.8z" className="ArduinoNano_svg__st11" />
    <g
      style={{
        filter: "url(#ArduinoNano_svg__ledFilter)",
      }}
      transform="translate(27.7 9)"
    >
      <circle
        cx={58.5}
        cy={18.1}
        r={3.7}
        style={{
          fill: "#80ff80",
        }}
      />
    </g>
    <g className="ArduinoNano_svg__st5">
      <path d="M82.5 31.2h7.4v3.4h-7.4z" className="ArduinoNano_svg__st6" />
    </g>
    <path d="M84.2 30.9H88v4h-3.8z" className="ArduinoNano_svg__st11" />
    <g className="ArduinoNano_svg__st5">
      <path d="M72.9 17.9h2.8v13.6h-2.8z" className="ArduinoNano_svg__st6" />
    </g>
    <path
      d="M70.7 19.3h7.2v10.8h-7.2z"
      style={{
        fill: "#ccc",
        stroke: "#888",
        strokeWidth: 0.1,
      }}
    />
    <circle
      id="ArduinoNano_svg__reset-button"
      cx={74.3}
      cy={24.7}
      r={2.8}
      style={{
        fill: "#eeb",
        stroke: "#777",
        strokeWidth: 0.1,
      }}
    />
    <path
      d="M112.7 15.4h12v20h-12z"
      style={{
        fill: "none",
        stroke: "#bbb",
        strokeWidth: 0.25,
        strokeMiterlimit: 10,
      }}
    />
    <circle cx={121.7} cy={18.4} r={1} className="ArduinoNano_svg__st17" />
    <circle cx={121.7} cy={25.4} r={1} className="ArduinoNano_svg__st17" />
    <circle cx={121.7} cy={32.4} r={1} className="ArduinoNano_svg__st17" />
    <circle cx={115.7} cy={18.4} r={1} className="ArduinoNano_svg__st17" />
    <circle cx={115.7} cy={25.4} r={1} className="ArduinoNano_svg__st17" />
    <circle cx={115.7} cy={32.4} r={1} className="ArduinoNano_svg__st17" />
    <circle
      cx={116.3}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="VIN"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(114.735 44.087)"
    >
      {"VIN"}
    </text>
    <circle
      cx={109.1}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="GND"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(107.516 44.087)"
    >
      {"GND"}
    </text>
    <circle
      cx={101.9}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="RST"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(100.296 44.087)"
    >
      {"RST"}
    </text>
    <circle
      cx={94.7}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="5V"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(93.077 44.087)"
    >
      {"5V"}
    </text>
    <circle
      cx={87.4}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A7"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(85.858 44.087)"
    >
      {"A7"}
    </text>
    <circle
      cx={80.2}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="AREF"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(78.638 44.087)"
    >
      {"AREF"}
    </text>
    <circle
      cx={73}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A6"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(71.418 44.087)"
    >
      {"A6"}
    </text>
    <circle
      cx={65.8}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A5"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(64.2 44.087)"
    >
      {"A5"}
    </text>
    <circle
      cx={58.6}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A4"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(56.98 44.087)"
    >
      {"A4"}
    </text>
    <circle
      cx={51.3}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A3"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(49.76 44.087)"
    >
      {"A3"}
    </text>
    <circle
      cx={44.1}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A2"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(42.54 44.087)"
    >
      {"A2"}
    </text>
    <circle
      cx={36.9}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A1"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(35.321 44.087)"
    >
      {"A1"}
    </text>
    <circle
      cx={29.7}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="A0"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(28.102 44.087)"
    >
      {"A0"}
    </text>
    <circle
      cx={22.5}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="3V3"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(20.882 44.087)"
    >
      {"3V3"}
    </text>
    <circle
      cx={15.2}
      cy={47.4}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D13"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="translate(13.662 44.087)"
    >
      {"D13"}
    </text>
    <circle
      cx={15.2}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D12"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 8.405 3.614)"
    >
      {"D12"}
    </text>
    <circle
      cx={22.5}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D11"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 12.015 3.614)"
    >
      {"D11"}
    </text>
    <circle
      cx={29.7}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D10"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 15.625 3.614)"
    >
      {"D10"}
    </text>
    <circle
      cx={36.9}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D9"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 19.234 3.614)"
    >
      {"D9"}
    </text>
    <circle
      cx={44.1}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D8"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 22.844 3.614)"
    >
      {"D8"}
    </text>
    <circle
      cx={51.3}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D7"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 26.454 3.614)"
    >
      {"D7"}
    </text>
    <circle
      cx={58.6}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D6"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 30.064 3.614)"
    >
      {"D6"}
    </text>
    <circle
      cx={65.8}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D5"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 33.673 3.614)"
    >
      {"D5"}
    </text>
    <circle
      cx={73}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D4"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 37.283 3.614)"
    >
      {"D4"}
    </text>
    <circle
      cx={80.2}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D3"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 40.893 3.614)"
    >
      {"D3"}
    </text>
    <circle
      cx={87.4}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="D2"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 44.503 3.614)"
    >
      {"D2"}
    </text>
    <circle
      cx={94.7}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="GND"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 48.112 3.614)"
    >
      {"GND"}
    </text>
    <circle
      cx={101.9}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="RST"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 51.722 3.614)"
    >
      {"RST"}
    </text>
    <circle
      cx={109.1}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="RX0"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 55.332 3.614)"
    >
      {"RX0"}
    </text>
    <circle
      cx={116.3}
      cy={3.9}
      r={1.5}
      className="ArduinoNano_svg__st17"
      data-pin="TX0"
    />
    <text
      className="ArduinoNano_svg__st18 ArduinoNano_svg__st19 ArduinoNano_svg__st20"
      transform="rotate(180 58.941 3.614)"
    >
      {"TX0"}
    </text>
  </svg>
);
export default SvgArduinoNano;
