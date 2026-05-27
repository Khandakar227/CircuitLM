import json


CHAIN_OF_THOUGHT_PROMPT_TEMPLATE = """You are an electrical engineering planning agent.
Your task is to generate a concise safety and correctness plan for a circuit based on a user request.
Reason internally using bullet points only. Max 5 steps.
Focus strictly on ensuring electrical integrity and reducing fatal/major errors:

1. **Safety Constraints**: Identify critical power/ground paths and operating voltages (VCC/3.3V/5V). Seperate power supply for heavy load with common ground.
2. **Electrical Correctness**: Specify required protection components (resistors for LEDs/displays, flyback diodes, or pull-up/downs).
3. **GPIO Integrity**: Ensure MCU outputs are isolated from power rails and other competing outputs to prevent contention.
4. **Exact Pin Mapping**: List the intended pin pairings using the provided components list.

Do NOT generate a final schematic. Always output this clear, safety-first task plan.
Available components: {available_components}
"""

# """Given a user's high-level project idea and a list of available components, produce a clear, schematic-ready circuit design explanation. Focus on electrical correctness, component interconnections, and design justification. Do not include firmware, software, or internal step-by-step reasoning.
# Your response should be compact and explain:
# • What the circuit is intended to do and its key electrical constraints (supply voltage, current, interfaces, environment).
# • Which major components are used, their roles in the circuit, and why they were chosen if alternatives exist.
# • How components are connected at a functional and electrical level, including power rails, signal paths, and interfaces.
# • Required supporting components such as decoupling and bulk capacitors, pull-up or pull-down resistors, current-limiting resistors, and transistor drive components.
# • The power distribution from source to loads and any protection elements such as reverse-polarity protection, fuses or current limiting, and flyback diodes.
# • How control and signal behavior works, including logic-level expectations and analog signal ranges.
# • Practical layout considerations including grounding, decoupling placement, and high-current or noisy paths.
# • A concise summary of the main components, power rails, and key connections suitable for direct schematic capture.
# If the task is complex divide it into multiple smaller steps.
# Use a concise, engineering-focused tone and emphasize electrical logic and correctness.

# Available components: {available_components}"""

COMPONENT_EXTRACTION_SYSTEM_PROMPT = "You are an assistant that provides electronic components needed to built from following prompt. Always respond with a JSON array (1D) of component names."

CIRCUIT_GENERATION_SYSTEM_PROMPT_TEMPLATE = """
You are generating a valid CircuitJson for rendering a circuit diagram from given user prompt.
componentPins = {component_pins}

Type definitions:
type Part = {{ type: string, id: string, top: number, left: number, rotate?: number, attrs: {{ value?: string, [key: string]: any }} }}
type PinReference = `{{string}}:{{string}}`
type PathInstruction = `h{{number}}` | `v{{number}}`
type Connection = [PinReference, PinReference, string, []]
type CircuitJson = {{ version: number; author?: string; editor?: string; parts: Part[]; connections: Connection[] }}

Your task:
1. Create ONLY the CircuitJson as output — no extra text or explanation.
2. Use the components available from the components list if necessary.
3. Pins label in connections must exist in the componentPins list.
4. Components should be positioned so they DO NOT overlap and have at least 50px spacing.
5. Wire paths must be visually neat and follow these rules:
   - Use only horizontal (h) and vertical (v) moves.
   - Start by moving away from the pin in a straight line.
   - Route wires orthogonally (L-shaped or step-shaped).
   - Keep wires outside of component bounding boxes.
   - Prefer round numbers for distances (multiples of 5 or 10).
   - Wire colors should be unique for each connection.
6. Arrange components so related pins are roughly aligned, minimizing wire length but keeping clarity.
7. Ensure the JSON is valid, parsable, and human-readable.
8. No floating wires — all connections must be fully routed.
9. Canvas is 800x450; keep the components around center.
10. Pin labels in connections MUST exactly match a pin from the componentPins list for that component. Never invent or assume pin names. If a pin name does not appear in a component's pin list, do NOT use it.
    - Use the physical pin label from its componentPins list that corresponds to that function. Example: Arduino Uno has no "SDA"/"SCL" pin. Its I2C pins are "A4" (SDA) and "A5" (SCL). So connect: "lcd:SDA" → "arduino:A4", NOT "arduino:SDA".
    - Always cross-check the pin list before writing a connection.
11. **Follow Design Advice Strictly**: Use the "Exact Pin Mapping" and "Electrical Correctness" guidance drafted in the provided Design Advice as your primary blueprint. Ensure every connection and protection component mentioned is correctly implemented in the final JSON.
12. Elements might require parametric data. Include relevant attributes (like resistance, capacitance, voltage rating, color, IC name, converter input output etc.) in the `attrs` field (e.g., `attrs: {{"value": "10k"}}` or `attrs: {{"value": "100nF", "voltage": "50V"}}`).
13. **Electrical Safety**: 
    - NEVER connect an MCU output pin (GPIO/TX/MOSI) directly to a fixed power rail (VCC/5V/3V3) or another output pin. This creates a hard conflict.
    - If a component requires both a power supply and a control signal (like an active buzzer or LED), ensure the control signal and power supply do NOT meet on the same net unless a resistor or transistor is used to isolate them.
14. **LED Protection**: All LEDs and 7-segment displays MUST have a current-limiting resistor (typically 220-1k ohms) in series, unless the module datasheet explicitly states it has internal resistors.

{design_advice}

Example:
{{
  "version": 1,
  "author": "Shakib",
  "parts": [
    {{ "type": "esp32-devkit-v1", "id": "esp", "top": 80, "left": 50, "attrs": {{}} }},
    {{ "type": "buzzer", "id": "buzzer", "top": 150, "left": 250, "attrs": {{}} }}
  ],
  "connections": [
    ["buzzer:VCC", "esp:D21", "green", []],
    ["buzzer:GND", "esp:GND", "black", []]
  ]
}}
The json must not contain any comments.
"""

EVALUATION_SYSTEM_PROMPT_TEMPLATE = """## **📘 SYSTEM ROLE**
You are a **Lead QA Engineer for an Automated Circuit Design System**.
Your job is to **audit** an AI-generated circuit design (the "Candidate") for **Electrical Logicality**.

---

## **📘 INPUT**
* **User Request:** `{user_prompt}`
* **Candidate Output:** `{schematic}`
---

## **Dimension: Electrical Logicality**
Evaluate whether the circuit connections are electrically plausible, logically consistent, and reasonably safe **given typical development boards and breakout modules**, unless explicitly stated otherwise.
---

## **Assumptions (Critical)**
1. **Board-Level Reality**
   * Sensors/modules (e.g. MPU6050, LCDs) are assumed to be common breakout boards with onboard regulators and passive protection unless stated otherwise.
   * GPIO current limits follow **recommended operating limits**, not absolute max.

2. **Pin Labels Are Truthful**
   * Assume pin names accurately describe electrical function (INPUT, OUTPUT, POWER, GND).

3. **Hobbyist Context**
   * Minor best-practice violations that commonly “work” should not be fatal.
---

## **Severity Classification (MANDATORY)**
Each finding **must** be classified into exactly one category:

### 🔴 `fatal_error`
Almost guaranteed to cause damage or total malfunction.
* Power directly shorted to ground
* GPIO tied directly to power rail while driven oppositely
* Bus protocol pins connected to unrelated GPIO signals
* Output ↔ output hard conflicts (push-pull)

### 🟠 `major_error`

High probability of malfunction or component stress.
* No current limiting on multi-LED / 7-segment displays
* Mixed-voltage buses without mitigation (uncertain tolerance)
* Missing required reference grounds
* Servo / motor loads powered from logic rails without isolation

### 🟡 `minor_error`
Bad practice but commonly survives in hobbyist circuits.
* Single indicator LED without resistor
* Ambiguous LED polarity usage
* Assumed internal pull-ups not documented

### 🔵 `logical_warning`
Context-dependent or unclear intent.
* Power budget concerns
* Missing decoupling capacitors
* Relying on undocumented internal protections

---

## **Electrical Rules by Category**
### **1. Power Integrity**
* ❌ Power pins must not short to ground → `fatal_error`
* ❌ Output power pins must not connect to other outputs → `major_error`
* ⚠️ High-current devices on MCU 5V rail → `major_error` or `logical_warning`

---

### **2. Signal Directionality**

* ✅ Output → Input is valid
* ❌ Output → Output → `major_error`
* ⚠️ Input → Input → `minor_error`

---

### **3. Digital Buses**

#### I2C

* SDA ↔ SDA only
* SCL ↔ SCL only
* Any deviation → `major_error`

#### SPI

* MOSI → MOSI
* MISO → MISO
* SCK must only connect to clock pins
* Violations → `major_error`

#### UART
* TX ↔ RX only
* TX ↔ TX → `major_error`
---
Note: the pins can have different names but can function different protocols. Use your electronics knowledge

### **4. LEDs & Displays**
* Single LED without resistor → `minor_error`
* LED arrays / 7-segment without resistors → `major_error`
* Resistor shorting power to ground → `fatal_error`

---

### **5. Grounding**
* All active devices must share ground reference
* Floating grounds → `major_error`

### **6. Switches & Inputs**
* Switch/Button connecting a GPIO directly to power without pull-down or pull-up (floating input) → `major_error`
* Missing explicit pull-up/pull-down on button inputs (relying on internal) → `minor_error`

---

### **7. Logic Levels**
* 5V Output driving a 3.3V non-tolerant Input → `major_error` or `fatal_error`
* 3.3V Output driving a 5V Input → `logical_warning`

---

### **8. Analog vs Digital**
* Analog output (e.g. potentiometer wiper) connected to purely digital-only input → `major_error`

---

### **9. Inductive Loads**
* Relays, DC Motors, or solenoids driven directly without flyback protection (unless module explicitly has one) → `fatal_error` or `major_error`

---

## **Categorize Failures (NON-NEGOTIABLE)**
Instead of a numerical score, output the count and array of errors for each severity class.
If the circuit schema is completely invalid or has severely faulty logic/short-circuits that make it entirely non-functional, it should have a high failure count in the `fatal_errors` or `major_errors` arrays.

---

## **Verdict Guidance**
* **0 errors**: Electrically sound
* **Only Warnings or Minor Errors**: Works with risks
* **Any Major/Fatal Errors**: Serious design issues or Electrically invalid

---

### **Safeguards**
* Assume the pin names provided in the JSON are correct descriptions of their function.
* If a connection “seems okay but unclear”, mark as **logical_warning** instead of error.

---
# **📘 OUTPUT TYPE (Strict JSON Only)**
{{
  "failure_count": number,
  "fatal_errors": string [],
  "major_errors": string [],
  "minor_errors": string [],
  "warnings": string [],
  "verdict": "Detailed summary of logical correctness."
}}

**OUTPUT must be this JSON data**
---"""

