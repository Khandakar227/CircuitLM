import * as React from "react";
import type { SVGProps } from "react";
const Mpu6050 = (props: SVGProps<SVGSVGElement>) => (
  <g
    width="21.6mm" height="16.2mm"
     {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), rotate(${props.rotate || 0})`}
  >
    <defs>
      <pattern
        id="mpu6050_svg__a"
        width={14}
        height={2.1}
        patternUnits="userSpaceOnUse"
      >
        <path
          fill="#f5f9f0"
          d="M2.09 1.32a.47.47 0 0 0 .468-.467V.466a.47.47 0 0 0-.468-.467H.47v1.32z"
        />
      </pattern>
    </defs>
    <path
      fill="#16619d"
      d="M81.6 0H0v61.2h81.6zm-10 44.9c3.8 0 6.88 3.08 6.88 6.88s-3.08 6.89-6.88 6.89-6.89-3.09-6.89-6.89 3.09-6.88 6.89-6.88m-61.6 0c3.8 0 6.89 3.08 6.89 6.88S13.8 58.67 10 58.67s-6.88-3.09-6.88-6.89S6.2 44.9 10 44.9M7.26 3a2.804 2.804 0 1 1 0 5.61c-1.55 0-2.8-1.26-2.8-2.8S5.72 3 7.26 3m19.2 0a2.804 2.804 0 1 1 0 5.61c-1.55 0-2.8-1.26-2.8-2.8S24.92 3 26.46 3m-9.58 0a2.804 2.804 0 1 1 0 5.61c-1.55 0-2.8-1.26-2.8-2.8S15.34 3 16.88 3m19.2 0a2.804 2.804 0 1 1 0 5.61c-1.55 0-2.8-1.26-2.8-2.8S34.54 3 36.08 3m9.58 0c1.55 0 2.8 1.26 2.8 2.81s-1.26 2.8-2.8 2.8c-1.55 0-2.81-1.26-2.81-2.8S44.11 3 45.66 3m19.2 0c1.55 0 2.8 1.26 2.8 2.81s-1.26 2.8-2.8 2.8-2.81-1.26-2.81-2.8S63.31 3 64.86 3m-9.58 0c1.55 0 2.8 1.26 2.8 2.81s-1.26 2.8-2.8 2.8c-1.55 0-2.81-1.26-2.81-2.8S53.73 3 55.28 3m19.2 0c1.55 0 2.8 1.26 2.8 2.81s-1.26 2.8-2.8 2.8c-1.55 0-2.81-1.26-2.81-2.8S72.93 3 74.48 3"
    />
    <g fill="#fefdf4">
      <path d="M74.5 23.1h2.01v4.81H74.5zM67.8 33h2.01v4.81H67.8zM71.2 23.1h2.01v4.81H71.2zM67.8 23.1h2.01v4.81H67.8zM74.5 33h2.01v4.81H74.5z" />
    </g>
    <g fill="#31322e">
      <path d="M74.5 25.5h2.01v2.4H74.5zM67.8 33h2.01v2.4H67.8zM71.2 25.5h2.01v2.4H71.2zM67.8 25.5h2.01v2.4H67.8zM74.5 33h2.01v2.4H74.5z" />
    </g>
    <g fill="#e5e5e5">
      <path d="M12 21.3h3.83v9.3H12zM17.7 21.3h3.83v9.3H17.7zM56.5 21.3h3.83v9.3H56.5zM51.2 21.3h3.83v9.3H51.2zM17.7 35.6h3.83v9.3H17.7zM23.3 21.3h3.83v9.3H23.3zM62.2 21.3h3.83v9.3H62.2zM51.2 35.8h3.83v9.3H51.2zM56.9 35.8h3.83v9.3H56.9z" />
    </g>
    <path fill="#fefdf4" d="M76 42.6v-3.13h-7.59v3.13z" />
    <path fill="#e5e5e5" d="M23.1 35.6h3.83v9.3H23.1z" />
    <g fill="#26232b">
      <path d="M17.7 23.4h3.83v5.31H17.7zM56.5 23.4h3.83v5.31H56.5zM51.2 23.4h3.83v5.31H51.2zM17.7 37.7h3.83v5.31H17.7z" />
    </g>
    <g fill="#d8c18d">
      <path d="M23.3 23.4h3.83v5.31H23.3zM62.2 23.4h3.83v5.31H62.2zM51.2 37.8h3.83v5.31H51.2zM56.9 37.8h3.83v5.31H56.9zM74.3 42.6v-3.13h-4.33v3.13z" />
    </g>
    <path fill="#a06352" d="M23.1 37.7h3.83v5.31H23.1z" />
    <path fill="#f3c338" d="M31.8 47.1h15.6v6.03H31.8z" />
    <path fill="#010303" d="M67.3 27.9h9.76v5.28H67.3z" />
    <path
      fill="url(#mpu6050_svg__a)"
      d="M0 0h5v14.5H0z"
      transform="translate(47 26)"
    />
    <path
      fill="url(#mpu6050_svg__a)"
      d="M0 0h5v14.5H0z"
      transform="rotate(180 16.15 20)"
    />
    <path
      fill="url(#mpu6050_svg__a)"
      d="M0 0h5v14.5H0z"
      transform="rotate(90 2.9 43.6)"
    />
    <path
      fill="url(#mpu6050_svg__a)"
      d="M0 0h5v14.5H0z"
      transform="rotate(-90 29.15 -3.15)"
    />
    <path d="M31.8 25.4h15.6V41H31.8z" fill="black" />
    <path fill="#f5ecde" d="M12 23.4h3.83v5.31H12z" />
    {"false"}
    <g fill="none" stroke="#d0ae88" strokeWidth={0.648}>
      <circle cx={64.8} cy={5.78} r={2.81} data-pin="GND" />
      <circle cx={55.2} cy={5.78} r={2.81} data-pin="SCL" />
      <circle cx={45.6} cy={5.78} r={2.81} data-pin="SDA" />
      <circle cx={36} cy={5.78} r={2.81} data-pin="XDA" />
      <circle cx={26.4} cy={5.78} r={2.81} data-pin="XCL" />
      <circle cx={16.9} cy={5.78} r={2.81} data-pin="AD0" />
      <circle cx={7.28} cy={5.78} r={2.81} data-pin="INT" />
      <circle cx={74.4} cy={5.78} r={2.81} data-pin="VCC" />
    </g>
    <text
      x={10.056}
      fill="#fff"
      fontFamily="sans-serif"
      fontSize={3.6}
      transform="rotate(90)"
    >
      <tspan x={10.056} y={-6}>
        {"INT"}
      </tspan>
      <tspan x={10.056} y={-15.5}>
        {"AD0"}
      </tspan>
      <tspan x={10.056} y={-25.157}>
        {"XCL"}
      </tspan>
      <tspan x={10.056} y={-34.5}>
        {"XDA"}
      </tspan>
      <tspan x={10.056} y={-44.38}>
        {"SDA"}
      </tspan>
      <tspan x={9.911} y={-54}>
        {"SCL"}
      </tspan>
      <tspan x={10.057} y={-63.54}>
        {"GND"}
      </tspan>
      <tspan x={10.057} y={-73}>
        {"VCC"}
      </tspan>
    </text>
  </g>
);
export default Mpu6050;
