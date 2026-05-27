export interface ComponentBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutOptions {
  padding: number;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

export class CircuitLayout {
  private components: ComponentBounds[] = [];
  private options: LayoutOptions;

  constructor(options: LayoutOptions) {
    this.options = options;
  }

  addComponent(id: string, width: number, height: number) {
    this.components.push({ id, x: 0, y: 0, width, height });
  }

  // Grid-based layout algorithm
  calculateGridLayout(): ComponentBounds[] {
    const grid = this.createGrid();
    const placed: ComponentBounds[] = [];

    // Sort components by area (largest first)
    const sorted = [...this.components].sort((a, b) =>
      (b.width * b.height) - (a.width * a.height)
    );

    for (const component of sorted) {
      const position = this.findBestGridPosition(component, grid);
      if (position) {
        component.x = position.x;
        component.y = position.y;
        this.placeComponentOnGrid(component, grid);
        placed.push(component);
      }
    }

    return placed;
  }

  // Force-directed layout for better component distribution
  calculateForceLayout(iterations: number = 100): ComponentBounds[] {
    const positions = this.components.map(c => ({ ...c }));

    for (let i = 0; i < iterations; i++) {
      this.applyForces(positions);
      this.constrainToBounds(positions);
    }

    return positions;
  }

  private createGrid(): boolean[][] {
    const cols = Math.ceil(this.options.canvasWidth / this.options.gridSize);
    const rows = Math.ceil(this.options.canvasHeight / this.options.gridSize);
    return Array(rows).fill(null).map(() => Array(cols).fill(false));
  }

  private findBestGridPosition(component: ComponentBounds, grid: boolean[][]): { x: number, y: number } | null {
    const cols = Math.ceil(component.width / this.options.gridSize);
    const rows = Math.ceil(component.height / this.options.gridSize);

    for (let y = 0; y < grid.length - rows; y++) {
      for (let x = 0; x < grid[0].length - cols; x++) {
        if (this.canPlaceAt(x, y, cols, rows, grid)) {
          return { x: x * this.options.gridSize, y: y * this.options.gridSize };
        }
      }
    }
    return null;
  }

  private canPlaceAt(x: number, y: number, cols: number, rows: number, grid: boolean[][]): boolean {
    for (let dy = 0; dy < rows; dy++) {
      for (let dx = 0; dx < cols; dx++) {
        if (grid[y + dy]?.[x + dx]) return false;
      }
    }
    return true;
  }

  private placeComponentOnGrid(component: ComponentBounds, grid: boolean[][]) {
    const cols = Math.ceil(component.width / this.options.gridSize);
    const rows = Math.ceil(component.height / this.options.gridSize);
    const gridX = Math.floor(component.x / this.options.gridSize);
    const gridY = Math.floor(component.y / this.options.gridSize);

    for (let dy = 0; dy < rows; dy++) {
      for (let dx = 0; dx < cols; dx++) {
        if (grid[gridY + dy]?.[gridX + dx] !== undefined) {
          grid[gridY + dy][gridX + dx] = true;
        }
      }
    }
  }

  private applyForces(positions: ComponentBounds[]) {
    // Repulsion between components
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const force = this.calculateRepulsion(positions[i], positions[j]);
        positions[i].x -= force.x * 0.1;
        positions[i].y -= force.y * 0.1;
        positions[j].x += force.x * 0.1;
        positions[j].y += force.y * 0.1;
      }
    }
  }

  private calculateRepulsion(a: ComponentBounds, b: ComponentBounds) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (a.width + b.width + a.height + b.height) / 4;

    if (distance < minDistance) {
      const force = (minDistance - distance) / distance;
      return { x: dx * force, y: dy * force };
    }
    return { x: 0, y: 0 };
  }

  private constrainToBounds(positions: ComponentBounds[]) {
    for (const pos of positions) {
      pos.x = Math.max(0, Math.min(this.options.canvasWidth - pos.width, pos.x));
      pos.y = Math.max(0, Math.min(this.options.canvasHeight - pos.height, pos.y));
    }
  }
}
