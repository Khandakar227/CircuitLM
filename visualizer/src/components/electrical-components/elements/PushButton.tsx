import * as React from "react";
import type { SVGProps } from "react";
const SvgPushButton = (props: SVGProps<SVGSVGElement>) => (
  <g
      width="21.6mm" height="16.2mm"
     {...props} transform={`translate(${props.x || 0}, ${props.y || 0}), scale(2), rotate(${props.rotate || 0})`}
  >
    <defs>
      <linearGradient id="PushButton_svg__a" x1={0} x2={1} y1={0} y2={1}>
        <stop offset={0} stopColor="#fff" />
        <stop offset={0.3} stopColor="red" />
        <stop offset={0.5} stopColor="red" />
        <stop offset={1} />
      </linearGradient>
      <linearGradient id="PushButton_svg__b" x1={1} x2={0} y1={1} y2={0}>
        <stop offset={0} stopColor="#fff" />
        <stop offset={0.3} stopColor="red" />
        <stop offset={0.5} stopColor="red" />
        <stop offset={1} />
      </linearGradient>
    </defs>
    <rect width={12} height={12} fill="#464646" rx={0.44} ry={0.44} />
    <rect
      width={10.5}
      height={10.5}
      x={0.75}
      y={0.75}
      fill="#eaeaea"
      rx={0.211}
      ry={0.211}
    />
    <g fill="#1b1b1">
      <circle cx={1.767} cy={1.792} r={0.37} />
      <circle cx={10.161} cy={1.792} r={0.37} />
      <circle cx={10.161} cy={10.197} r={0.37} />
      <circle cx={1.767} cy={10.197} r={0.37} />
    </g>
    <g fill="#999" strokeWidth={1.015}>
      <path d="M12.365 2.426c.06 0 .108.047.109.105v.387h2.217c.12 0 .217.094.217.21v.508c0 .116-.097.21-.217.21h-2.218v.401a.107.107 0 0 1-.108.106h-.368V2.426z" />
      <path
        d="M12.365 7.5c.06 0 .108.047.109.105v.387h2.217c.12 0 .217.094.217.21v.508c0 .116-.097.21-.217.21h-2.218v.401a.107.107 0 0 1-.108.106h-.368V7.5z"
        data-pin={1}
      />
      <path
        d="M-.35 4.353a.107.107 0 0 1-.11-.106V3.86h-2.217a.213.213 0 0 1-.217-.21v-.507c0-.117.097-.21.217-.21h2.218V2.53c0-.058.048-.105.108-.105h.368v1.927z"
        data-pin={2}
      />
      <path d="M-.35 9.427a.107.107 0 0 1-.11-.106v-.387h-2.217a.213.213 0 0 1-.217-.21v-.507c0-.117.097-.21.217-.21h2.218v-.402c0-.058.048-.105.108-.105h.368v1.927z" />
    </g>
    <g className="PushButton_svg__clickable-element">
      <circle cx={6} cy={6} r={3.822} fill="url(#PushButton_svg__a)" />
      <circle
        cx={6}
        cy={6}
        r={3.822}
        fill="url(#PushButton_svg__b)"
        className="PushButton_svg__button-active-circle"
      />
      <circle
        cx={6}
        cy={6}
        r={2.9}
        fill="red"
        stroke="#2f2f2f"
        strokeOpacity={0.47}
        strokeWidth={0.08}
      />
    </g>
  </g>
);
export default SvgPushButton;
