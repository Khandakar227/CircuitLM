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

export class WireRouter {
  private obstacles: ComponentBounds[] = [];
  private gridSize: number = 10;

  setObstacles(components: ComponentBounds[]) {
    this.obstacles = components;
  }

  // A* pathfinding for wire routing
  findWirePath(start: Point, end: Point): WireSegment[] {
    const path = this.aStarPathfinding(start, end);
    return this.convertToSegments(path);
  }

  // Simple orthogonal routing with obstacle avoidance
  routeOrthogonal(start: Point, end: Point): WireSegment[] {
    const segments: WireSegment[] = [];

    // Try different routing strategies
    const strategies = [
      () => this.routeLShape(start, end),
      () => this.routeZShape(start, end),
      () => this.routeUShape(start, end)
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result && !this.hasCollisions(result)) {
        return result;
      }
    }

    // Fallback to direct connection
    return [{ start, end, type: 'horizontal' }];
  }

  private routeLShape(start: Point, end: Point): WireSegment[] {
    const midPoint = { x: end.x, y: start.y };
    return [
      { start, end: midPoint, type: 'horizontal' },
      { start: midPoint, end, type: 'vertical' }
    ];
  }

  private routeZShape(start: Point, end: Point): WireSegment[] {
    const mid1 = { x: start.x + (end.x - start.x) / 3, y: start.y };
    const mid2 = { x: start.x + (end.x - start.x) * 2 / 3, y: end.y };

    return [
      { start, end: mid1, type: 'horizontal' },
      { start: mid1, end: mid2, type: 'vertical' },
      { start: mid2, end, type: 'horizontal' }
    ];
  }

  private routeUShape(start: Point, end: Point): WireSegment[] {
    const offset = Math.abs(end.x - start.x) / 2;
    const mid1 = { x: start.x, y: start.y + offset };
    const mid2 = { x: end.x, y: end.y + offset };

    return [
      { start, end: mid1, type: 'vertical' },
      { start: mid1, end: mid2, type: 'horizontal' },
      { start: mid2, end, type: 'vertical' }
    ];
  }

  private hasCollisions(segments: WireSegment[]): boolean {
    for (const segment of segments) {
      for (const obstacle of this.obstacles) {
        if (this.segmentIntersectsObstacle(segment, obstacle)) {
          return true;
        }
      }
    }
    return false;
  }

  private segmentIntersectsObstacle(segment: WireSegment, obstacle: ComponentBounds): boolean {
    if (segment.type === 'horizontal') {
      return segment.start.y >= obstacle.y &&
        segment.start.y <= obstacle.y + obstacle.height &&
        segment.start.x < obstacle.x + obstacle.width &&
        segment.end.x > obstacle.x;
    } else {
      return segment.start.x >= obstacle.x &&
        segment.start.x <= obstacle.x + obstacle.width &&
        segment.start.y < obstacle.y + obstacle.height &&
        segment.end.y > obstacle.y;
    }
  }

  private aStarPathfinding(start: Point, end: Point): Point[] {
    // Simplified A* implementation for wire routing
    // This would be a more complex implementation in practice
    return [start, end];
  }

  private convertToSegments(path: Point[]): WireSegment[] {
    const segments: WireSegment[] = [];
    for (let i = 1; i < path.length; i++) {
      const start = path[i - 1];
      const end = path[i];
      const type = Math.abs(end.x - start.x) > Math.abs(end.y - start.y) ? 'horizontal' : 'vertical';
      segments.push({ start, end, type });
    }
    return segments;
  }
}