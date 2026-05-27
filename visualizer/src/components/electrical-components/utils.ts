export const getPinPosition = (id: string, pin: string, rootSvg: SVGSVGElement) => {
  const g = document.getElementById(id) as SVGGElement | null;

  if (!g) return null;

  // Use the "i" modifier for case-insensitive matching
  const element = g.querySelector(`[data-pin="${pin}" i]`) as SVGGraphicsElement;
  if (!element) {
    console.warn(`[getPinPosition] Could not find pin "${pin}" on component id "${id}"`);
    return null;
  }

  const bbox = element.getBBox();
  const point = rootSvg.createSVGPoint();
  point.x = bbox.x + bbox.width / 2;
  point.y = bbox.y + bbox.height / 2;

  const ctm = element.getScreenCTM();
  const svgCtm = rootSvg.getScreenCTM();
  if (!ctm || !svgCtm) return null;

  // Convert from element space → screen space → SVG space
  const screenPoint = point.matrixTransform(ctm);
  const svgPoint = screenPoint.matrixTransform(svgCtm.inverse());

  return { x: svgPoint.x, y: svgPoint.y };
};

// Simple wire counter for offset calculation
let wireCounter = 0;

export function resetWireCounter() {
  wireCounter = 0;
}

export function generateWirePath(p1: { x: number, y: number }, steps: string[], p2: { x: number, y: number }) {
  // If we have custom steps, use them
  if (steps.length > 0 && steps[0] !== '*') {
    let d = `M${p1.x},${p1.y}`;
    steps.forEach(step => {
      const [dir, val] = [step[0], parseFloat(step.slice(1))];
      if (dir === 'h') d += ` h${val}`;
      if (dir === 'v') d += ` v${val}`;
    });
    d += ` L${p2.x},${p2.y}`;
    return d;
  }

  // Otherwise, generate automatic path
  return generateAutomaticPath(p1, p2);
}

function generateAutomaticPath(p1: { x: number, y: number }, p2: { x: number, y: number }) {
  const offset = wireCounter * 6; // Small 6px offset per wire
  wireCounter++;

  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);

  // Simple orthogonal routing
  if (dx > dy) {
    // Horizontal first
    const midX = p2.x;
    const midY = p1.y;
    return `M${p1.x},${p1.y} L${midX},${midY} L${p2.x},${p2.y}`;
  } else {
    // Vertical first
    const midX = p1.x;
    const midY = p2.y;
    return `M${p1.x},${p1.y} L${midX},${midY} L${p2.x},${p2.y}`;
  }
}

// Generate custom wire paths based on routing strategy
export const generateCustomWirePath = (p1: { x: number, y: number }, p2: { x: number, y: number }, strategy: string, customPoints?: { x: number, y: number }[]) => {
  switch (strategy) {
    case 'l-shape':
      return `M${p1.x},${p1.y} L${p2.x},${p1.y} L${p2.x},${p2.y}`;

    case 'up-l':
      return `M${p1.x},${p1.y} L${p1.x},${p2.y} L${p2.x},${p2.y}`;

    case 'down-l':
      return `M${p1.x},${p1.y} L${p1.x},${p1.y + Math.abs(p2.y - p1.y)} L${p2.x},${p1.y + Math.abs(p2.y - p1.y)} L${p2.x},${p2.y}`;

    case 'z-shape':
      const mid1 = { x: p1.x + (p2.x - p1.x) / 3, y: p1.y };
      const mid2 = { x: p1.x + (p2.x - p1.x) * 2 / 3, y: p2.y };
      return `M${p1.x},${p1.y} L${mid1.x},${mid1.y} L${mid2.x},${mid2.y} L${p2.x},${p2.y}`;

    case 'reverse-z':
      const mid1R = { x: p1.x + (p2.x - p1.x) * 2 / 3, y: p1.y };
      const mid2R = { x: p1.x + (p2.x - p1.x) / 3, y: p2.y };
      return `M${p1.x},${p1.y} L${mid1R.x},${mid1R.y} L${mid2R.x},${mid2R.y} L${p2.x},${p2.y}`;

    case 'u-shape':
      const offset = Math.abs(p2.x - p1.x) / 2;
      const mid1U = { x: p1.x, y: p1.y + offset };
      const mid2U = { x: p2.x, y: p2.y + offset };
      return `M${p1.x},${p1.y} L${mid1U.x},${mid1U.y} L${mid2U.x},${mid2U.y} L${p2.x},${p2.y}`;

    case 'reverse-u':
      const offsetR = Math.abs(p2.x - p1.x) / 2;
      const mid1UR = { x: p1.x, y: p1.y - offsetR };
      const mid2UR = { x: p2.x, y: p2.y - offsetR };
      return `M${p1.x},${p1.y} L${mid1UR.x},${mid1UR.y} L${mid2UR.x},${mid2UR.y} L${p2.x},${p2.y}`;

    case 'direct':
      return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

    case 'custom':
      if (customPoints && customPoints.length > 0) {
        let d = `M${p1.x},${p1.y}`;
        customPoints.forEach(pt => {
          d += ` L${pt.x},${pt.y}`;
        });
        d += ` L${p2.x},${p2.y}`;
        return d;
      }
      return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

    default:
      return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
  }
};