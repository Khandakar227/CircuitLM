import * as React from "react";
import type { SVGProps } from "react";
const SvgDiode = (props: SVGProps<SVGSVGElement>) => (
  <g
    viewBox="0 0 150 150"
    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1.2), rotate(${props.rotate || 0})`} {...props}
  >
    <style>{".Diode_svg__st0{fill:#b3b3b3}"}</style>
    <path d="M34.3 38.1h27v2h-27z" className="Diode_svg__st0" />
    <path
      d="M53.5 42.3H42.2c-.1 0-.3-.1-.3-.3v-5.5c0-.1.1-.3.3-.3h11.3c.1 0 .3.1.3.3V42c-.1.1-.2.3-.3.3z"
      style={{
        stroke: "#000",
        strokeWidth: 0.25,
        strokeMiterlimit: 10,
      }}
    />
    <path d="M43.3 36.3h1v6h-1z" className="Diode_svg__st0" />
    <circle
      data-pin="-"
      cx={35}
      cy={39.1}
      r={0.5}
      className="Diode_svg__st0"
    />
    <circle
      data-pin="+"
      cx={60.5}
      cy={39.1}
      r={0.5}
      className="Diode_svg__st0"
    />
  </g>
);
export default SvgDiode;
