import * as React from "react";
import type { SVGProps } from "react";
const Mosfet = (props: SVGProps<SVGSVGElement>) => (
  <g xmlns="http://www.w3.org/2000/svg"
    width={35.518}
    height={59.824}
    baseProfile="tiny"
    viewBox="0 0 36.998 62.317"
    {...props}
    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1), rotate(${props.rotate || 0})`}
  >
    <path
      fill="none"
      stroke="#8C8C8C"
      strokeLinecap="round"
      strokeWidth={3}
      d="M9.001 62.317v10M18.999 62.317v10M28.997 62.317v10"
    />
    <path
      fill="#BFBCBC"
      d="M33.997.5H18.999v2.502c4.354 0 7.875 2.47 7.875 5.516-.002 3.044-3.523 5.513-7.875 5.513v8.087h14.998z"
    />
    <path
      fill="gray"
      d="M11.126 8.514C11.126 5.467 14.649 3 18.999 3V.499H4.001V22.11h14.998v-8.086c-4.35.002-7.873-2.465-7.873-5.51"
    />
    <path fill="#8C8C8C" d="M7.501 56.53h3v5.7h-3z" data-pin="G" />
    <path fill="#8C8C8C" d="M17.499 56.53h3v5.7h-3z" data-pin="D" />
    <path fill="#8C8C8C" d="M27.497 56.53h3v5.7h-3z" data-pin="S" />
    <path fill="#CCC" d="M.501 4.525v13.34h3.5V.5z" />
    <path fill="#999" d="M37.497 4.525 33.997.5v17.365h3.5z" />
    <path
      fill="#8C8C8C"
      d="m12.501 56.675-2.24 1h-2.52l-2.24-1v-12.18h7zM22.499 56.675l-2.24 1H17.74l-2.241-1v-12.18h7zM32.497 56.675l-2.24 1h-2.518l-2.24-1v-12.18h6.998z"
    />
    <path fill="#141414" d="M25.499 31.522h12v22.222h-12z" />
    <path fill="#333" d="M.501 31.522h12v22.222h-12z" />
    <path
      fill="#262626"
      d="M.501 39.659v7.176c2.83 0 5.125-1.604 5.125-3.588 0-1.981-2.295-3.588-5.125-3.588"
    />
    <path d="M37.497 39.659c-2.83 0-5.125 1.604-5.125 3.588 0 1.979 2.295 3.588 5.125 3.588z" />
    <path
      fill="#1A1A1A"
      d="M.501 31.522v9.888c2.83 0 5.125 1.606 5.125 3.588S3.331 48.586.501 48.586v5.158h36.998V31.522zm36.996 17.063c-2.83 0-5.125-1.604-5.125-3.588 0-1.979 2.295-3.588 5.125-3.588z"
    />
    <path d="M.501 26.872h36.998v4.649H.501z" />
    <path fill="#333" d="M.501 21.124h36.998v5.748H.501z" />
    <path fill="#B2B2B2" d="M4.001.5h29.998v4.25H4.001z" />
    <path
      fill="#8C8C8C"
      d="M33.997 3.759H4.001l-3.5 4.024v13.34h36.996V7.783zM18.999 17.286c-4.35 0-7.873-2.468-7.873-5.513s3.523-5.511 7.873-5.511c4.354 0 7.875 2.468 7.875 5.511-.002 3.044-3.523 5.513-7.875 5.513"
    />
    <g fill="#6D6D6D"
      transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1), rotate(${props.rotate || 0})`}
    >
      <path d="M11.673 32.135v.75h-3v.75h2.25v.75h-2.25v1.5h-1.5v-3.75zM16.923 32.135v.75h-3v.75h2.25v.75h-2.25v.75h3v.75h-4.5v-3.75zM17.673 32.885v-.75h4.5v.75h-1.5v3h-1.5v-3zM25.923 35.885v-3.75h1.5v.75h.75v.75h.75v-1.5h1.5v3.75h-1.5v-.75h-.75v-.75h-.75v1.5z" />
    </g>
  </g>
);
export default Mosfet;
