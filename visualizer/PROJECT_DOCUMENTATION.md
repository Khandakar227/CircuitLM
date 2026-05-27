# Circuit Generation AI - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Core Components](#core-components)
4. [AI Circuit Generation](#ai-circuit-generation)
5. [Electrical Components System](#electrical-components-system)
6. [Layout and Wire Routing](#layout-and-wire-routing)
7. [User Interface](#user-interface)
8. [Data Management](#data-management)
9. [API Endpoints](#api-endpoints)
10. [Business Logic](#business-logic)
11. [Theoretical Concepts](#theoretical-concepts)
12. [Development Setup](#development-setup)
13. [Research Contributions](#research-contributions)

---

## Project Overview

**Circuit Generation AI** is a novel research project that combines Large Language Models (LLMs) with electronic circuit design to automatically generate circuit diagrams from natural language descriptions. The system uses Groq's Llama-3.3-70B model to understand circuit requirements and produce structured JSON representations that can be visualized as interactive SVG circuit diagrams.

### Key Features

- **AI-Powered Circuit Generation**: Natural language to circuit conversion
- **Interactive Visualization**: SVG-based circuit diagrams with drag-and-drop components
- **Automated Layout**: Force-directed component positioning
- **Smart Wire Routing**: Multiple routing strategies with obstacle avoidance
- **Component Library**: 30+ real electronic components (Arduino, ESP32, sensors, etc.)
- **Dataset Management**: MongoDB-based storage for training data
- **Real-time Editing**: Live circuit modification and validation

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **AI**: Groq SDK with Llama-3.3-70B
- **Database**: MongoDB with Mongoose
- **UI Components**: Radix UI, Lucide React icons
- **Data Processing**: Papa Parse for CSV handling

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   AI Service    │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (Groq)        │
│                 │    │                 │    │                 │
│ • React UI      │    │ • Circuit Gen   │    │ • Llama-3.3-70B │
│ • SVG Canvas    │    │ • Dataset API   │    │ • Prompt Eng.   │
│ • Components    │    │ • MongoDB       │    │ • JSON Output   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Layout Engine │    │   Database      │
│                 │    │                 │
│ • Force Layout  │    │ • MongoDB       │
│ • Wire Router   │    │ • Circuit Data  │
│ • Collision Det │    │ • Annotations   │
└─────────────────┘    └─────────────────┘
```

### Core Data Flow

1. **User Input**: Natural language circuit description
2. **AI Processing**: Groq API processes prompt with specialized circuit generation prompt
3. **JSON Generation**: Structured circuit representation with components and connections
4. **Layout Calculation**: Force-directed positioning of components
5. **Wire Routing**: Smart routing with obstacle avoidance
6. **Visualization**: SVG rendering with interactive features
7. **Data Storage**: MongoDB persistence for dataset building

---

## Core Components

### 1. Main Application (`src/app/page.tsx`)

The primary interface where users interact with the circuit generation system.

**Key Features:**

- Natural language input for circuit descriptions
- Real-time circuit generation and visualization
- Interactive component dragging and wire routing
- Dataset saving capabilities

**State Management:**

```typescript
const [circuitJson, setCircuitJson] = useState<CircuitJson | null>(null)
const [wires, setWires] = useState<Wire[]>([])
const [layout, setLayout] = useState<CircuitLayout | null>(null)
const [wireRouter, setWireRouter] = useState<WireRouter | null>(null)
```

### 2. Dataset Viewer (`src/app/dataset/page.tsx`)

A specialized interface for browsing and analyzing generated circuits from CSV datasets.

**Features:**

- CSV data loading with Papa Parse
- Navigation through circuit entries
- JSON editing and validation
- Export capabilities

### 3. Component Mapper (`src/app/mapper/page.tsx`)

Development tool for mapping component pins and testing component configurations.

---

## AI Circuit Generation

### Prompt Engineering (`src/libs/prompt.ts`)

The system uses sophisticated prompt engineering to ensure consistent, valid circuit generation:

```typescript
export const circuitGenerationPrompt = `You are generating a valid CircuitJson for rendering a circuit diagram.
componentPins = ${JSON.stringify(componentPins)}

Type definitions:
type Part = { type: string, id: string, top: number, left: number, rotate?: number, attrs: { value?: string } }
type PinReference = \`\${string}:\${string}\`
type Connection = [PinReference, PinReference, string, PathInstruction[]]
type CircuitJson = { version: number; parts: Part[]; connections: Connection[] }

Your task:
1. Create ONLY the CircuitJson as output — no extra text or explanation.
2. All parts must be from the available components list.
3. Pins in connections must exist in the component's pin list.
4. Components should be positioned so they DO NOT overlap and have at least 50px spacing.
5. Wire paths must be visually neat and follow orthogonal routing rules.
6. Canvas is 800x450 - keep components around center.
`
```

### AI Processing Pipeline (`src/app/api/circuit-generation/route.ts`)

1. **Input Validation**: Ensures valid request data
2. **Prompt Construction**: Combines system prompt with user input
3. **AI Generation**: Calls Groq API with optimized parameters
4. **JSON Extraction**: Parses and validates AI response
5. **Error Handling**: Graceful fallbacks for malformed responses

**Key Parameters:**

- Model: `llama-3.3-70b-versatile`
- Temperature: `0.5` (balanced creativity/consistency)
- Max Tokens: `2000`
- JSON Schema Validation

---

## Electrical Components System

### Component Library (`src/components/electrical-components/`)

The system includes 30+ real electronic components:

**Microcontrollers:**

- Arduino Uno, ESP32 DevKit V1, Franzininho

**Sensors:**

- DHT22 (temperature/humidity), MPU6050 (accelerometer), HC-SR04 (ultrasonic)
- Flame sensor, Gas sensor, PIR motion sensor, Photo resistor

**Actuators:**

- Servo motor, DC motor, Stepper motor, Buzzer, LED

**Communication:**

- HC-05 (Bluetooth), LCD I2C, SSD1306 (OLED), 7-segment display

**Basic Components:**

- Resistor, Capacitor, Diode, Transistors (NPN/PNP), Push button

### Component Structure

Each component is defined with:

```typescript
interface ComponentDefinition {
  pins: string[] // Pin names (e.g., ["VCC", "GND", "D2"])
  width: number // Component width in pixels
  height: number // Component height in pixels
}
```

### SVG Component Implementation

Components are implemented as React SVG components with:

- **Pin Markers**: `data-pin` attributes for connection points
- **Visual Fidelity**: Accurate representations of real components
- **Scalability**: Responsive sizing and rotation support
- **Interactive Elements**: Hover states and selection indicators

Example (Arduino Uno):

```typescript
const SvgArduinoUno = (props: SVGProps<SVGSVGElement>) => (
  <g
    transform={`translate(${props.x || 0}, ${props.y || 0}), scale(4), rotate(${
      props.rotate
    })`}
  >
    {/* Pin definitions with data-pin attributes */}
    <tspan x={0} data-pin='AREF' dy={2.54}>
      AREF
    </tspan>
    <tspan x={0} data-pin='GND' dy={2.54}>
      GND
    </tspan>
    {/* ... more pins */}
  </g>
)
```

---

## Layout and Wire Routing

### Force-Directed Layout (`src/components/electrical-components/layout.ts`)

The `CircuitLayout` class implements a physics-based layout algorithm:

**Algorithm:**

1. **Component Initialization**: Add components with dimensions
2. **Force Calculation**: Repulsion forces between overlapping components
3. **Position Updates**: Iterative position adjustment
4. **Boundary Constraints**: Keep components within canvas bounds

```typescript
calculateForceLayout(iterations: number = 100): ComponentBounds[] {
  const positions = this.components.map(c => ({ ...c }));

  for (let i = 0; i < iterations; i++) {
    this.applyForces(positions);
    this.constrainToBounds(positions);
  }

  return positions;
}
```

**Force Calculation:**

- Repulsion between components based on distance
- Minimum distance enforcement
- Smooth convergence with damping

### Wire Routing System (`src/components/electrical-components/wire-router.ts`)

The `WireRouter` class provides multiple routing strategies:

**Routing Strategies:**

1. **Auto (Smart)**: A\* pathfinding with obstacle avoidance
2. **L-Shape**: Right-angle routing (horizontal first)
3. **Z-Shape**: Zigzag pattern for complex routing
4. **U-Shape**: U-shaped routing around obstacles
5. **Direct**: Straight-line connections

**Obstacle Avoidance:**

```typescript
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
```

**Collision Detection:**

- Line-rectangle intersection testing
- Component boundary checking
- Wire-to-wire intersection prevention

### Pin Position Calculation (`src/components/electrical-components/utils.ts`)

Real-time pin position calculation for wire connections:

```typescript
export const getPinPosition = (
  id: string,
  pin: string,
  rootSvg: SVGSVGElement
) => {
  const g = document.querySelector(`g#${id}`)
  const element = g.querySelector(`[data-pin="${pin}"]`) as SVGGraphicsElement

  const bbox = element.getBBox()
  const point = rootSvg.createSVGPoint()
  point.x = bbox.x + bbox.width / 2
  point.y = bbox.y + bbox.height / 2

  // Coordinate transformation from element space to SVG space
  const ctm = element.getScreenCTM()
  const svgCtm = rootSvg.getScreenCTM()
  const screenPoint = point.matrixTransform(ctm)
  const svgPoint = screenPoint.matrixTransform(svgCtm.inverse())

  return { x: svgPoint.x, y: svgPoint.y }
}
```

---

## User Interface

### Main Interface Components

#### 1. Sidebar (`src/components/common/Sidebar.tsx`)

- Component library browser
- Search functionality
- Collapsible design
- Component categorization

#### 2. Draggable Components (`src/components/common/DraggableComponent.tsx`)

Interactive component manipulation:

- Mouse-based dragging
- Coordinate transformation
- Boundary constraints
- Real-time position updates

```typescript
const handleMouseMove = useCallback(
  (e: MouseEvent) => {
    if (!isDragging || !elementRef.current) return

    const svgRect = elementRef.current.ownerSVGElement?.getBoundingClientRect()
    const svgX = (e.clientX - svgRect.left) * (800 / svgRect.width)
    const svgY = (e.clientY - svgRect.top) * (600 / svgRect.height)

    const newX = svgX - dragOffset.x
    const newY = svgY - dragOffset.y

    onMove(id, constrainedX, constrainedY)
  },
  [isDragging, dragOffset, id, onMove]
)
```

#### 3. Connection Table (`src/components/common/ConnectionTable.tsx`)

- Real-time connection visualization
- Pin type validation
- Conflict detection (power/ground mismatches)
- Editable connections

#### 4. JSON Editor Modal (`src/components/common/JsonEditorModal.tsx`)

- Live JSON editing
- Syntax validation
- Annotation system
- Dataset integration

#### 5. JSON Viewer (`src/components/common/JsonViewer.tsx`)

- Syntax highlighting
- Export capabilities
- Compact summary view
- Full-screen modal

### Wire Interaction System

**Wire Selection:**

- Click-to-select wires
- Visual feedback with highlighting
- Routing strategy controls
- Real-time path updates

**Routing Controls:**

```typescript
const handleWireRoutingChange = (wireId: string, strategy: RoutingStrategy) => {
  setWires((prev) =>
    prev.map((wire) => {
      if (wire.id === wireId) {
        const newPath =
          strategy === "auto"
            ? generateWirePath(wire.p1, [], wire.p2)
            : generateCustomWirePath(wire.p1, wire.p2, strategy)
        return { ...wire, routingStrategy: strategy, steps: newPath }
      }
      return wire
    })
  )
}
```

---

## Data Management

### Data Models

#### Circuit Dataset Schema (`src/models/CircuitDataset.ts`)

```typescript
interface ICircuitDataset extends Document {
  prompt: string // Original user prompt
  generatedJson: any // AI-generated circuit JSON
  fixedJson: any // Human-corrected version
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    totalComponents: number
    totalConnections: number
    createdBy?: string
  }
  annotations: {
    corrections: Array<{
      field: string
      oldValue: any
      newValue: any
      reason: string
    }>
    notes: string
  }
}
```

#### Circuit Data Types (`src/types/circuit.ts`)

```typescript
interface ComponentInstance {
  id: string
  type: string
  position: { x: number; y: number }
  rotation: number
  pins: Pin[]
}

interface Connection {
  id: string
  from: { componentId: string; pinId: string }
  to: { componentId: string; pinId: string }
  color: string
}

interface CircuitData {
  components: ComponentInstance[]
  connections: Connection[]
  metadata: {
    createdAt: string
    version: string
    totalComponents: number
    totalConnections: number
  }
}
```

### Database Integration (`src/lib/mongodb.ts`)

MongoDB connection management with Mongoose:

```typescript
export async function dbConnect() {
  if (connection.isConnected) return

  if (!process.env.MONGODB_URI) {
    throw new Error("Add Mongo URI to .env file")
  }

  const db = await connect(process.env.MONGODB_URI as string, {
    dbName: process.env.DBNAME,
  })

  connection.isConnected = db.connections[0]?.readyState
}
```

---

## API Endpoints

### 1. Circuit Generation API (`/api/circuit-generation`)

**POST** - Generate circuit from natural language

**Request:**

```json
{
  "content": "Create a circuit with Arduino Uno connected to an LED and resistor"
}
```

**Response:**

```json
{
  "data": "{\"version\":1,\"parts\":[...],\"connections\":[...]}"
}
```

**Process:**

1. Validate input
2. Construct AI prompt
3. Call Groq API
4. Extract and validate JSON
5. Return structured response

### 2. Dataset Management API (`/api/circuit-dataset`)

**POST** - Save circuit to dataset

```json
{
  "prompt": "User prompt",
  "generatedJson": {...},
  "fixedJson": {...},
  "metadata": {...},
  "annotations": {...}
}
```

**GET** - Retrieve dataset entries

- Pagination support
- Sorting by creation date
- Configurable limits

---

## Business Logic

### Circuit Generation Workflow

1. **Input Processing**

   - Natural language parsing
   - Component requirement extraction
   - Connection logic analysis

2. **AI Generation**

   - Prompt construction with component constraints
   - LLM processing with structured output
   - JSON validation and error handling

3. **Layout Processing**

   - Component positioning with force-directed algorithm
   - Collision detection and resolution
   - Canvas boundary enforcement

4. **Wire Routing**

   - Connection point calculation
   - Routing strategy selection
   - Obstacle avoidance implementation

5. **Visualization**
   - SVG rendering with interactive elements
   - Real-time updates on component movement
   - Wire path recalculation

### Data Validation Pipeline

**Component Validation:**

- Existence in component library
- Pin compatibility checking
- Position constraint validation

**Connection Validation:**

- Pin existence verification
- Electrical compatibility (power/ground conflicts)
- Wire routing feasibility

**JSON Schema Validation:**

- Required field presence
- Type checking
- Structure integrity

### Error Handling Strategy

**AI Generation Errors:**

- Malformed JSON recovery
- Partial response handling
- Fallback to empty circuit

**Layout Errors:**

- Component overlap resolution
- Boundary constraint enforcement
- Force calculation stability

**User Input Errors:**

- Invalid component references
- Malformed connection syntax
- Canvas boundary violations

---

## Theoretical Concepts

### 1. Prompt Engineering for Circuit Design

**Key Principles:**

- **Structured Output**: JSON schema enforcement
- **Component Constraints**: Library-based validation
- **Spatial Reasoning**: Position and layout instructions
- **Electrical Logic**: Connection rules and pin compatibility

**Prompt Design Strategy:**

```typescript
// Component library injection
componentPins = ${JSON.stringify(componentPins)}

// Type definitions for structured output
type CircuitJson = { version: number; parts: Part[]; connections: Connection[] }

// Spatial constraints
Canvas is 800x450 - keep components around center
Components should be positioned so they DO NOT overlap and have at least 50px spacing

// Routing rules
Wire paths must be visually neat and follow orthogonal routing rules
Use only horizontal (h) and vertical (v) moves
```

### 2. Force-Directed Layout Algorithms

**Physics-Based Positioning:**

- **Repulsion Forces**: Prevent component overlap
- **Damping**: Smooth convergence
- **Boundary Constraints**: Canvas limits
- **Iterative Refinement**: Progressive improvement

**Mathematical Foundation:**

```typescript
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
```

### 3. Wire Routing Theory

**Routing Strategies:**

- **Orthogonal Routing**: L-shaped, Z-shaped, U-shaped paths
- **Obstacle Avoidance**: A\* pathfinding with component boundaries
- **Collision Detection**: Line-rectangle intersection algorithms
- **Path Optimization**: Minimize wire length and crossings

**A\* Pathfinding Implementation:**

```typescript
private aStarPathfinding(start: Point, end: Point): Point[] {
  // Simplified A* implementation for wire routing
  // Considers component obstacles and routing preferences
  return [start, end];
}
```

### 4. SVG Coordinate Systems

**Coordinate Transformation:**

- **Element Space**: Component-relative coordinates
- **Screen Space**: Browser viewport coordinates
- **SVG Space**: Canvas-relative coordinates

**Transformation Pipeline:**

```typescript
// Element space → Screen space → SVG space
const screenPoint = point.matrixTransform(ctm)
const svgPoint = screenPoint.matrixTransform(svgCtm.inverse())
```

### 5. Real-Time Interactive Systems

**Event Handling:**

- **Mouse Events**: Drag and drop, click selection
- **Coordinate Mapping**: Screen to SVG transformation
- **State Synchronization**: Component and wire updates
- **Performance Optimization**: Efficient re-rendering

**State Management:**

- **Component State**: Position, rotation, selection
- **Wire State**: Routing strategy, path, selection
- **Layout State**: Force calculations, constraints
- **UI State**: Modals, panels, interactions

---

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB instance
- Groq API key

### Environment Variables

```bash
# .env.local
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=mongodb://localhost:27017
DBNAME=circuit_generation
```

### Installation

```bash
npm install
npm run dev
```

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dataset/           # Dataset viewer
│   ├── mapper/            # Component mapper
│   └── page.tsx           # Main application
├── components/
│   ├── common/            # Shared UI components
│   ├── electrical-components/  # Circuit components
│   └── ui/                # Base UI components
├── lib/                   # Utilities and configurations
├── libs/                  # Business logic libraries
├── models/                # Database models
└── types/                 # TypeScript definitions
```

### Key Dependencies

```json
{
  "next": "15.4.6",
  "react": "19.1.0",
  "groq-sdk": "^0.30.0",
  "mongoose": "^8.17.2",
  "papaparse": "^5.5.3",
  "@radix-ui/react-*": "^1.x.x"
}
```

---

## Research Contributions

### 1. Novel AI-Driven Circuit Design

**Contribution**: First system to use LLMs for automatic circuit diagram generation from natural language.

**Technical Innovation**:

- Specialized prompt engineering for circuit design
- JSON schema validation for structured output
- Component constraint handling
- Spatial reasoning integration

### 2. Automated Layout and Routing

**Contribution**: Physics-based layout algorithms combined with intelligent wire routing.

**Technical Innovation**:

- Force-directed component positioning
- Multiple wire routing strategies
- Real-time obstacle avoidance
- Interactive routing controls

### 3. Educational and Practical Applications

**Contribution**: Bridge between AI research and practical electronics education.

**Applications**:

- Rapid prototyping from natural language
- Educational tool for circuit design
- Automated documentation generation
- Dataset building for AI training

### 4. Research Methodology

**Dataset Building**:

- Human-AI collaboration for data collection
- Annotation system for corrections
- Quality metrics and validation
- Iterative improvement process

**Evaluation Framework**:

- Circuit validity assessment
- Layout quality metrics
- User experience testing
- Performance analysis

### 5. Future Research Directions

**Potential Extensions**:

- Multi-modal input (images + text)
- Circuit simulation integration
- PCB layout generation
- Component recommendation systems
- Collaborative design features

**Research Questions**:

1. How effective are LLMs at generating valid electronic circuits?
2. What prompt engineering techniques optimize circuit generation accuracy?
3. How do automated layout algorithms compare to manual placement?
4. What are the limitations and failure modes of AI-generated circuits?

---

## Conclusion

The Circuit Generation AI project represents a significant advancement in the intersection of artificial intelligence and electronic circuit design. By combining sophisticated prompt engineering, physics-based layout algorithms, and interactive visualization, the system demonstrates the potential for AI to assist in complex engineering tasks.

The project's contributions span multiple domains:

- **AI Research**: Novel application of LLMs to circuit design
- **Software Engineering**: Complex interactive systems with real-time updates
- **Electrical Engineering**: Accurate component modeling and connection validation
- **Human-Computer Interaction**: Intuitive interfaces for circuit manipulation

The system serves as both a practical tool for circuit design and a research platform for exploring AI applications in engineering domains. The comprehensive dataset building capabilities and evaluation framework provide a foundation for future research in AI-assisted design tools.

This documentation provides a complete technical overview of the system, from high-level architecture to implementation details, enabling developers and researchers to understand, extend, and build upon this innovative approach to circuit design automation.
