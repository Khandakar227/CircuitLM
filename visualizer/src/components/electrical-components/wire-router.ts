import { ComponentBounds } from "./layout";

interface Point {
  x: number;
  y: number;
}

interface WireSegment {
  start: Point;
  end: Point;
  type: 'horizontal' | 'vertical';
}

/**
 * Orthogonal wire router with obstacle avoidance and lane separation.
 *
 * Design notes (rewrite):
 *  - A wire is NEVER drawn diagonally. A diagonal segment on a wiring diagram
 *    is unreadable for whoever assembles the circuit, so every fallback path
 *    is still orthogonal: worst case we route around the bounding box.
 *  - Parallel wires between the same pair of columns used to be drawn on top
 *    of each other. Each corridor now hands out distinct lanes, so bundles
 *    stay countable.
 *  - Obstacle tests keep a margin: a wire touching a component border reads as
 *    "connected to it".
 */
export class WireRouter {
  private obstacles: ComponentBounds[] = [];
  private laneUsage: Map<number, number> = new Map();

  private readonly margin = 8;      // keep-out around components
  private readonly stub = 18;       // straight exit out of a pin
  private readonly laneStep = 14;   // spacing between parallel wires

  setObstacles(components: ComponentBounds[]) {
    this.obstacles = components;
    this.laneUsage.clear();
  }

  /** Reset lane bookkeeping between full re-routes of a diagram. */
  resetLanes() {
    this.laneUsage.clear();
  }

  findWirePath(start: Point, end: Point): WireSegment[] {
    return this.routeOrthogonal(start, end);
  }

  routeOrthogonal(start: Point, end: Point): WireSegment[] {
    const sx = this.exitDirection(start, end);
    const ex = this.exitDirection(end, start);
    const a: Point = { x: start.x + sx * this.stub, y: start.y };
    const b: Point = { x: end.x + ex * this.stub, y: end.y };

    // Straight shot: same row and nothing in between.
    if (Math.abs(a.y - b.y) < 1) {
      const direct = this.build([start, a, b, end]);
      if (!this.hasCollisions(direct)) return direct;
    }

    for (const corridor of this.verticalCorridors(a, b)) {
      const x = corridor + this.takeLane(corridor);
      const path = this.build([start, a, { x, y: a.y }, { x, y: b.y }, b, end]);
      if (!this.hasCollisions(path)) return path;
    }

    for (const corridor of this.horizontalCorridors(a, b)) {
      const y = corridor + this.takeLane(corridor);
      const path = this.build([start, a, { x: a.x, y }, { x: b.x, y }, b, end]);
      if (!this.hasCollisions(path)) return path;
    }

    // Last resort: go around everything — long, but still orthogonal and
    // readable, unlike the diagonal this used to fall back to.
    const bounds = this.worldBounds();
    const y = bounds.bottom + 24 + this.takeLane(bounds.bottom);
    return this.build([start, a, { x: a.x, y }, { x: b.x, y }, b, end]);
  }

  /** Which way a pin should leave its component (away from the far end). */
  private exitDirection(from: Point, to: Point): number {
    const host = this.obstacles.find(
      (o) =>
        from.x >= o.x - this.stub - 4 &&
        from.x <= o.x + o.width + this.stub + 4 &&
        from.y >= o.y - 4 &&
        from.y <= o.y + o.height + 4
    );
    if (host) {
      // Leave through the nearest vertical edge of the host component.
      return from.x - host.x < host.x + host.width - from.x ? -1 : 1;
    }
    return to.x >= from.x ? 1 : -1;
  }

  /** Free vertical corridors, nearest to the midpoint first. */
  private verticalCorridors(a: Point, b: Point): number[] {
    const mid = (a.x + b.x) / 2;
    const edges = [Math.min(a.x, b.x), Math.max(a.x, b.x), mid];
    for (const o of this.obstacles) {
      edges.push(o.x - this.margin - 10, o.x + o.width + this.margin + 10);
    }
    const top = Math.min(a.y, b.y);
    const bottom = Math.max(a.y, b.y);
    return edges
      .filter((x) => !this.obstacles.some(
        (o) =>
          x > o.x - this.margin &&
          x < o.x + o.width + this.margin &&
          bottom > o.y - this.margin &&
          top < o.y + o.height + this.margin
      ))
      .sort((p, q) => Math.abs(p - mid) - Math.abs(q - mid));
  }

  /** Free horizontal corridors, nearest to the midpoint first. */
  private horizontalCorridors(a: Point, b: Point): number[] {
    const mid = (a.y + b.y) / 2;
    const edges = [mid];
    for (const o of this.obstacles) {
      edges.push(o.y - this.margin - 10, o.y + o.height + this.margin + 10);
    }
    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    return edges
      .filter((y) => !this.obstacles.some(
        (o) =>
          y > o.y - this.margin &&
          y < o.y + o.height + this.margin &&
          right > o.x - this.margin &&
          left < o.x + o.width + this.margin
      ))
      .sort((p, q) => Math.abs(p - mid) - Math.abs(q - mid));
  }

  /** Hand out a fresh lane inside a corridor so bundles do not overlap. */
  private takeLane(corridor: number): number {
    const key = Math.round(corridor);
    const used = this.laneUsage.get(key) ?? 0;
    this.laneUsage.set(key, used + 1);
    // 0, +step, -step, +2step, -2step ... centred on the corridor
    const rank = Math.ceil(used / 2) * (used % 2 === 0 ? 1 : -1);
    return rank * this.laneStep;
  }

  private worldBounds() {
    let bottom = 0;
    for (const o of this.obstacles) bottom = Math.max(bottom, o.y + o.height);
    return { bottom };
  }

  /** Points → orthogonal segments (degenerate ones dropped). */
  private build(points: Point[]): WireSegment[] {
    const segments: WireSegment[] = [];
    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1];
      const end = points[i];
      if (Math.abs(start.x - end.x) < 0.5 && Math.abs(start.y - end.y) < 0.5) continue;
      // Force orthogonality: split any accidental diagonal into two legs.
      if (Math.abs(start.x - end.x) > 0.5 && Math.abs(start.y - end.y) > 0.5) {
        const knee = { x: end.x, y: start.y };
        segments.push({ start, end: knee, type: 'horizontal' });
        segments.push({ start: knee, end, type: 'vertical' });
        continue;
      }
      segments.push({
        start,
        end,
        type: Math.abs(end.x - start.x) > Math.abs(end.y - start.y) ? 'horizontal' : 'vertical',
      });
    }
    return segments;
  }

  /**
   * Collision test for the ROUTE, excluding the two pin stubs.
   *
   * The stubs start on the component itself, so they always "touch" it. An
   * earlier version exempted any segment whose endpoint was near a component
   * — that quietly exempted long segments leaving a pin, and wires were drawn
   * straight through the very component they started from. Only the first and
   * last legs are exempt now; everything in between must be clean.
   */
  private hasCollisions(segments: WireSegment[]): boolean {
    return segments.some((s, i) => {
      const isStub = i === 0 || i === segments.length - 1;
      if (isStub && this.length(s) <= this.stub + 6) return false;
      return this.obstacles.some((o) => this.segmentIntersectsObstacle(s, o));
    });
  }

  private length(s: WireSegment): number {
    return Math.abs(s.end.x - s.start.x) + Math.abs(s.end.y - s.start.y);
  }

  private segmentIntersectsObstacle(segment: WireSegment, obstacle: ComponentBounds): boolean {
    const left = obstacle.x - this.margin;
    const right = obstacle.x + obstacle.width + this.margin;
    const top = obstacle.y - this.margin;
    const bottom = obstacle.y + obstacle.height + this.margin;

    if (segment.type === 'horizontal') {
      const [x1, x2] = [segment.start.x, segment.end.x].sort((a, b) => a - b);
      return segment.start.y > top && segment.start.y < bottom && x1 < right && x2 > left;
    }
    const [y1, y2] = [segment.start.y, segment.end.y].sort((a, b) => a - b);
    return segment.start.x > left && segment.start.x < right && y1 < bottom && y2 > top;
  }
}
