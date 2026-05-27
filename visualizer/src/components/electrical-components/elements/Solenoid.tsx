import * as React from "react";
import type { SVGProps } from "react";
const Solenoid = (props: SVGProps<SVGSVGElement>) => (
  <g xmlns="http://www.w3.org/2000/svg"
    width={63.072}
    height={150.193}
    baseProfile="basic"
    viewBox="0 0 47.369 112.672"
    {...props}
    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1), rotate(${props.rotate || 0})`}
  >
    <path fill="none" d="M19.013 111h1v1h-1z" data-pin="-" />
    <path fill="none" d="M26.234 111h1v1h-1z" data-pin="+" />
    <path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeWidth={3}
      d="M20.083 112.672v8.245"
    />
    <path
      fill="none"
      stroke="red"
      strokeLinecap="round"
      strokeWidth={3}
      d="M27.314 112.672v8.245"
    />
    <path
      fill="none"
      stroke="#000"
      strokeWidth={3}
      d="M20.083 102.305v10.367"
    />
    <path fill="none" stroke="red" strokeWidth={3} d="M27.314 102.305v10.367" />
    <path fill="#726038" d="M2 39.462v62.843h43.369V39.462" />
    <path
      fill="none"
      stroke="#E5C76C"
      strokeWidth={4}
      d="M2 39.462V99.47a2.84 2.84 0 0 0 2.834 2.835h37.701a2.84 2.84 0 0 0 2.834-2.835V39.462"
    />
    <path fill="#E5C76C" d="M43.127 43.462H4.242v-4h38.885z" />
    <path fill="#D6B667" d="M36.986 39.462H10.383v-4h26.603z" />
    <path fill="#353535" d="M4.962 43.594h37.445v55.062H4.962z" />
    <path d="M4.962 43.594h6.933v55.062H4.962z" opacity={0.35} />
    <path fill="#FFF" d="M29.256 44.594h11.857v53.062H29.256z" opacity={0.25} />
    <path fill="#999" d="M4.962 98.656h37.445v1.593H4.962z" />
    <path d="M10.383 35.462h5.102v4h-5.102z" opacity={0.12} />
    <path fill="#FFF" d="M32.161 35.612h4.649v3.622h-4.649z" opacity={0.35} />
    <path fill="#FFF" d="M27.512 35.612h4.649v3.622h-4.649z" opacity={0.54} />
    <path fill="#E2E2E2" d="M34.486 35.462H12.883v-4h21.603z" />
    <path fill="#D3D3D3" d="M27.292 31.462h-7.215V0h7.215z" />
    <path d="M12.883 31.46h4.143v4.001h-4.143z" opacity={0.12} />
    <path fill="#FFF" d="M30.567 31.612h3.775v3.622h-3.775z" opacity={0.35} />
    <path fill="#FFF" d="M26.792 31.612h3.775v3.622h-3.775z" opacity={0.54} />
    <path d="M20.112.018h1.326v31.441h-1.326z" opacity={0.12} />
    <path fill="#FFF" d="M25.334.321h1.648v30.881h-1.648z" opacity={0.35} />
    <path fill="#FFF" d="M23.685.321h1.649v30.881h-1.649z" opacity={0.51} />
    <circle cx={23.685} cy={3.149} r={1.466} fill="#A3A3A3" />
    <circle cx={23.685} cy={3.149} r={1.28} fill="#727272" opacity={0.2} />
  </g>
);
export default Solenoid;
