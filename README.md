# Newton's 3rd Law Interactive Simulation: Exploration of Interaction v1.0

## 1. Project Overview

**Purpose:**  
To visually and numerically prove to students that *"every pair of interacting forces is always equal in magnitude and opposite in direction"* by allowing them to manipulate variables (mass, velocity, distance).

**Core Value:**  
Inquiry-based learning through active variable control rather than passive observation.

**Target Audience:**  
Middle and High School Physics learners.

**Language Policy:**
- Student UI/Text: English (Immersive Learning)
- Development Comments & Documentation: English

---

## 2. Tech Stack

- **Framework:** React (Rsbuild compatible)
- **Rendering:** HTML5 Canvas API (High-performance rendering based on useRef + requestAnimationFrame)
- **Physics Logic:** Custom Lightweight Physics (No external library dependencies; custom implementation based on formulas)
- **Styling:** Material UI (MUI)
- **Icons:** Lucide-react

---

## 3. System Architecture & State Management

### 3.1 Component Structure

- **NewtonLab** (Main Container): Manages tab states and layout skeleton
- **HammerSimulation**: Logic and rendering for Scenario 1 (Contact Force)
- **GravitySimulation**: Logic and rendering for Scenario 2 (Non-contact Force)
- **ControlRadioButton**: Reusable radio button UI component (for discrete selections)
- **ControlSlider**: Reusable slider UI component (for continuous variables)

### 3.2 Core Logic

**Interaction Principle (Force Symmetry):**
- Calculates forces for two objects simultaneously using a single physical quantity calculation function (`calculateForce`, `calculateGravity`)
- Note: Calculation numbers (raw integers) will not be shown in the UI, but they will drive the physics simulation visually
- Result: $F_{\text{Action}}$ and $F_{\text{Reaction}}$ always reference the same variable, eliminating the source of any discrepancies

**Animation Loop:**
- Uses `requestAnimationFrame` to guarantee smooth 60fps motion, independent of React State re-renders

---

## 4. Detailed Scenario Specifications

### Scenario 1: Hammer & Nail (Contact Force)

**Implemented Interaction:**

**Variable Settings (Discrete):**
- **Hammer Mass:** Light, Medium, Heavy
  - Logic Mapping: Light = 1 kg, Medium = 5 kg, Heavy = 10 kg (Hidden from UI)
- **Swing Speed:** Slow, Medium, Fast
  - Logic Mapping: Slow = 1 m/s, Medium = 5 m/s, Fast = 10 m/s (Hidden from UI)

**Execution:**  
Animation triggers upon clicking the [HIT] button.

**State Changes:**  
Idle → Down → Contact → Pause → Up
- Force Visualization: Arrows and data are displayed only during Contact and Pause phases
- Reset: The Up state is triggered only by the [UP] button (which replaces the [HIT] button during the Pause phase). Students may also reset the entire state

**Data Visualization:**
- **Dynamic Visuals:** The depth the nail is driven and the length of the arrows change dynamically in proportion to the impulse ($\text{Impulse} \approx mv$)
- **Overlay Legend (Pause State):**  
  When the state is Pause, a box in the top right displays:
  - $F_H$: Force exerted by the hammer on the nail
  - $F_N$: Force exerted by the nail on the hammer
  
  Below that, a summary box states:
  > The forces $F_N$ and $F_H$ are:
  > - equal in magnitude
  > - acting in opposite directions
  > - not acting on the same object

---

### Scenario 2: Earth & Moon (Non-contact Force)

**Implemented Interaction:**

**Variable Settings:**
- **Planet Mass:** 0.5, Earth, 1.5, 2 (0.5× smaller ∼ 2× bigger)
- **Moon Mass:** 0.5, Our Moon, 1.5, 2 (0.5× smaller ∼ 2× bigger)
- **Distance:** Students adjust distance by dragging the Moon relative to the Planet

**Execution Controls:**
- [PLAY]: Triggers animation
- [PAUSE]: Pauses animation
- [RESET]: Resets positions and velocities
- **Checklist:** Located above the button row to toggle visibility of:
  - [ ] Force Arrows
  - [ ] Orbital Path

**Animation Physics:**
- Orbital speed and angular velocity increase as distance decreases (Visual approximation of $v \propto \sqrt{1/r}$) (Hidden from UI)

**Physics Discovery Element:**
- **Principle:** Even if Earth's mass is maximized and Moon's mass is minimized, the lengths of the force arrows acting on both bodies ($F_E$, $F_M$) remain perfectly equal
- **Overlay Legend:**  
  A non-overlapping top-right box displays:
  - $F_E$: Gravitational force exerted by the Earth on the Moon
  - $F_M$: Gravitational force exerted by the Moon on the Earth
  
  Summary text:
  > The forces $F_E$ and $F_M$ are:
  > - equal in magnitude
  > - acting in opposite directions
  > - not acting on the same object

---

## 5. UI/UX Layout (Dashboard Style)

### 5.1 Overall Layout

- **Header:** App title and Scenario Tab switching (Example 1 / Example 2)
- **Body:** 2-Column structure (Left Panel + Main Canvas)

### 5.2 Detailed Sections

**Left Control Panel:**
- Scrollable area containing ControlSliders and ControlRadioButtons
- Action buttons ([HIT], [UP], [PLAY], [PAUSE], [RESET]) are pinned to the bottom

**Main Canvas Area:**
- **Background:** Themed per scenario (Laboratory Wooden Floor / Outer Space)
- **Force Arrows:** Vectors ($\vec{F}$) are drawn directly on top of canvas objects
- **Overlay Legend (Top-Right):**
  - A semi-transparent card preventing visual distraction
  - Displays the explanatory text (Variable definitions and "Equal/Opposite/Different Object" checklist) specifically defined in Section 4

---

## 6. QA Checklist

- [ ] State Management: Does the simulation correctly transition from Contact to Pause in the Hammer scenario?
- [ ] Logic Mapping: Do the UI labels (Light, Medium, Heavy) correctly map to the internal mass values (1, 5, 10)?
- [ ] Force Symmetry: In the Gravity simulation, do $F_E$ and $F_M$ arrow lengths remain equal even when masses are drastically different?
- [ ] Drag Interaction: Does the drag-to-change-distance functionality work smoothly without glitching the orbit animation?
- [ ] UI Overlay: Does the top-right legend box appear correctly in the Pause state (Scenario 1) and remain visible/non-overlapping in Scenario 2?

---

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## Project Structure

```
src/
├── App.tsx
├── App.routes.tsx
├── contents/
│   ├── contents.routes.ts
│   └── physics-simulations/
│       ├── physics-simulations.ts
│       └── simulation-1/
│           ├── index.tsx
│           └── assets/
└── index.tsx
```

---

## Key Files

- **[index.tsx](src/contents/physics-simulations/simulation-1/index.tsx)** - Hammer & Nail simulation component
- **[physics-simulations.ts](src/contents/physics-simulations/physics-simulations.ts)** - Physics calculation utilities
- **[App.routes.tsx](src/App.routes.tsx)** - Route configuration

---

## Physics Implementation

All force calculations are implemented in [physics-simulations.ts](src/contents/physics-simulations/physics-simulations.ts) with no external physics library dependencies. The custom implementation ensures:

- **Force Symmetry:** Both action and reaction forces reference the same calculated value
- **Visual Scaling:** Impulse values are scaled appropriately for canvas rendering
- **Interactive Learning:** Variables (mass, velocity, distance) directly affect simulation output

---

