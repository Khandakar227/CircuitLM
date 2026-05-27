import { useEffect } from "react";
import { componentsList } from "./electrical-components/components-list";

function ComponentsPinsMapper(props:{ type?: string }) {
  useEffect(() => {
    const grouped: Record<string, { pins: string[]; width: number; height: number }> = {};

    document.querySelectorAll("[data-part]").forEach(partEl => {
      const partId = partEl.getAttribute("data-part");
      if (!partId) return;
      // Extract pins
      const pins = Array.from(partEl.querySelectorAll("[data-pin]"))
        .map(pinEl => pinEl.getAttribute("data-pin")!)
        .filter(Boolean);
      // Extract size
      const bbox = (partEl as SVGGElement).getBBox();
      console.log(bbox)
      grouped[partId] = {
        pins,
        width: bbox.width,
        height: bbox.height
      };
    });

    console.log(grouped);
    /*
      Example:
      {
        buzzer: { pins: ["GND", "VCC"], width: 20, height: 40 },
        esp: { pins: ["D21", "GND", ...], width: 60, height: 120 }
      }
    */
  }, [props.type]);

  return (
    <svg className="" width={800} height={1450} viewBox="0 0 800 1450">
      {Object.keys(componentsList).map((type, index) => {
        const Component = componentsList[type as keyof typeof componentsList];
        if(!type || type === props.type)
          return (
            <Component
              key={index}
              data-part={type}
              id={`test-${index}`}
              x={50}
              y={50 + index * 10}
              data-value="220K"
            />
          );
      })}
    </svg>
  );
}

export default ComponentsPinsMapper;
