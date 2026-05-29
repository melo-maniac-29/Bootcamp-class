# CIRCUITRON // COGNITIVE INTEGRATED MAINBOARD

Welcome to **CIRCUITRON**, an uncompromising, tactile learning system configured to launch minds into architectural logic. Built for hardware engineering sprints, logical circuit debugging, and intellectual conquest, Circuitron merges raw mechanical aesthetics with a high-performance modern web stack.

The platform is engineered using a robust technical stack:
- **Next.js 14 (App Router)** // Primary Cognitive Interface
- **Convex** // Real-time Synchronization & Data Architecture
- **@convex-dev/auth** // Secure, Role-Based Access Control
- **Tailwind v4 & Framer Motion** // High-Fidelity UI & Telemetry Animations

---

## ⚙️ SYSTEM ROLES & ACCESS HIERARCHY

The platform enforces strict Role-Based Access Control (RBAC) to govern the learning architecture.

### 01 // INITIATE (`student`)
The standard operational tier assigned upon secure authentication.
- **Cognitive Vault (`/dashboard`)**: A terminal command center tracking structural progression, node processing limits, and a real-time leaderboard for architectural supremacy.
- **Architectural Roadmap (`/dashboard/days`)**: The central blueprint revealing operational nodes and daily logic sprints.
- **Execution Terminal (`/dashboard/days/[dayId]`)**: The active interface where initiates analyze telemetry feeds (video), process raw architectural data (Markdown tasks), and upload logic states (submissions).
- **Validation Engine (`/dashboard/days/[dayId]/quiz`)**: Interactive, granular evaluation tests that must be stabilized to proceed.

### 02 // LOGIC MENTOR (`volunteer`)
An elevated operational tier designated for code review and structural optimization.
- **Clearance Level**: Matches core administrative layers for grading node submissions, returning verdicts of `VERIFIED_STABLE` (Approved) or `NEEDS_RECALIBRATION` (Revision).
- *(Note: Access relies strictly on backend telemetry and isolated grading paths to ensure the core curriculum blueprint remains tamper-proof).*

### 03 // MAINFRAME ADMINISTRATOR (`admin`)
The root-level engineers who configure the architectural matrix and govern the entire platform.
- **Control Interface (`/admin`)**: The central nexus for platform diagnostics.
- **Curriculum Architecture (`/admin/content`)**: 
  - Synthesize and compile Bootcamp "Operational Weeks".
  - Instantiate "Nodes" (Daily Learning modules).
  - Utilize the **Schematic Editor** to inject video coordinates, draft complex markdown schematics, and compile validation quizzes.
- **User Node Management (`/admin/users`)**: 
  - Trace all authenticated operatives.
  - Dynamically elevate an Initiate to a Mentor or Admin with immediate system feedback.
- **Quality Assurance Review (`/admin/submissions`)**: 
  - Analyze raw output strings submitted by initiates.
  - Grade outputs as **OPTIMIZED** or **NEEDS_DEBUGGING**.

---

## 🏗️ HARDWARE ARCHITECTURE (CODEBASE)

The matrix cleanly segregates the Backend Processing (`convex/`) from the Frontend Visualizer (`src/`).

### BACKEND MAINFRAME (`convex/`)
Handles all distributed processing and state persistence.
- `schema.ts`: The strict relational architecture mapping Users, Sequences, Nodes, Memory states, and Input logs.
- `auth.ts`: Authentication relay configuring cryptographic handshakes.
- `content.ts`: Write protocols for editing the master blueprint (Root Access Required).
- `submissions.ts`: Quality control mutations for evaluating operative performance (Root/Mentor Access Required).

### FRONTEND VISUALIZER (`src/`)
Compiles UI topology and telemetry dashboards.
- `app/admin/`: Shielded routes for the Mainframe Control Interface.
- `app/dashboard/`: Shielded routes for the Initiate Cognitive Vault.
- `components/`: Modular, reusable hardware components (e.g., `AppSidebar`, `AdminPortalLink`, and schematic visualization elements).

---

## 🚀 INITIALIZATION PROTOCOL

### 1. Booting the Mainframe
To boot the system locally, engage two parallel terminal threads:

**THREAD 01 (Database Engine - Convex):**
```bash
npx convex dev
```

**THREAD 02 (Client Visualizer - Next.js):**
```bash
npm run dev
```

The graphical user interface will mount at `http://localhost:3000`.

### 2. Elevating to Root Access (Admin Creation)
Due to strict cryptographic hashing, external state injection is prohibited. To configure your initial Root user:
1. Navigate to `http://localhost:3000/login` and execute standard authorization (e.g., `admin@circuitron.io`).
2. Target your terminal and execute the backend override script to elevate your specific ID:
```bash
npx convex run reset:makeAdmin
```
3. Refresh the telemetry dashboard. The **Mainframe Admin Portal** will now be visible in your sidebar array.


