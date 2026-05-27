type Part = {
    type: string,
    id: string,
    top: number,
    left: number,
    rotate?: number,
    attrs: { value?: string, [key: string]: any }, // e.g., value for resistors, capacitors, inductors etc.
}
type PinReference = `${string}:${string}`; // e.g., "pico:GND.1"
type PathInstruction = `h${number}` | `v${number}` | "*" | "h0" | "v0";

type Connection = [
  PinReference,
  PinReference,
  string, // color
  PathInstruction[]
];

type CircuitJson = {
  version: number;
  author?: string;
  editor?: string;
  parts: Part[];
  connections: Connection[];
};