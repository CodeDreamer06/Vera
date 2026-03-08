# Vera Command Center

Vera Command Center is an offline-first, cinematic hydroponics operations dashboard for monitoring many plants at once, with LLM-powered narration and decision support.

It is built for hackathon demos where real sensor/model infrastructure may not be available yet: sensor streams and forecasting are mocked but realistic; disease classification is handled by an LLM vision route from uploaded images; LLM features remain wired with secure API routes and graceful fallbacks.

## Screenshots
- Fleet command center (placeholder)
- Plant detail view (placeholder)
- Time travel simulation panel (placeholder)
- Disease triage panel (placeholder)
- Command palette + shortcuts dialog (placeholder)

## Core Features

### Required features implemented
- Multi-plant fleet dashboard with triage-first scanning UX.
- Sentient Plant Persona (LLM): first-person plant messages from sensor + vision context.
- Time Travel simulation (0-7 day slider): wilted vs stable vs lush visual states with intervention toggles.
- Mock forecasting + predictive alerts: “You will have a problem in X hours.”
- Anomaly detection + root-cause ranking (LLM explanation + actions).
- Disease panel with webcam/upload input (LLM vision classification + local treatment guidance).
- Local persistence via IndexedDB (Dexie), fully offline-capable in mock LLM mode.
- Import/export of complete demo data as JSON.

### Extra wow features implemented
- Plant Inbox: conversational plant/system feed with quick action replies.
- Operator Mode Briefing: one-click, cross-fleet LLM-generated morning checklist.
- Starter onboarding walkthrough: guided step-by-step training for first-time users.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Dexie (IndexedDB)
- Zustand (state)
- Recharts (charts)
- Framer Motion (animation)
- cmdk (command palette)
- zod (runtime validation)
- sonner (toasts)

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Copy `.env.example` to `.env.local` and set values as needed:
```bash
cp .env.example .env.local
```

### 3) Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4) Verify local ML disease inference (uv + TFLite)
Disease triage runs through local Python inference using `uv` and the TFLite model from `../Plant-Disease-Detection-and-Solution`.

Install `uv` if needed:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Optional quick check:
```bash
uv --version
```

## Environment Variables (`.env.example`)
- `OPENAI_API_KEY`: LLM API key for OpenAI-compatible provider.
- `LLM_BASE_URL`: OpenAI-compatible base URL.
- `LLM_MODEL`: model id used by API routes.
- `NEXT_PUBLIC_DEMO_MODE`: enable demo flow defaults.
- `MOCK_LLM`: server-side LLM mock switch (`1` forces fallback, `0` uses provider).
- `NEXT_PUBLIC_MOCK_LLM`: `1` forces offline deterministic responses.
- `NEXT_PUBLIC_SENSOR_TICK_MS`: interval for simulated readings.
- `NEXT_PUBLIC_MAX_PLANTS`: initial seed size target.
- `NEXT_PUBLIC_SENSOR_SOURCE`: `mock` (default) or `esp` for live distance override on active plant.
- `ESP8266_BASE_URL`: base URL of ESP device, e.g. `http://192.168.1.50`.
- `ESP8266_DISTANCE_PATH`: path to read distance (default `/distance`).
- `ESP8266_TIMEOUT_MS`: timeout for bridge calls.
- `UV_BIN`: optional `uv` binary override (default `uv`).
- `PLANT_DISEASE_PYTHON`: Python version for `uv run` (default `3.11`).
- `PLANT_DISEASE_RUNTIME`: `auto` (default), `tflite`, or `tensorflow`.
- `PLANT_DISEASE_MODEL_PATH`: optional override for `.tflite` path.
- `PLANT_DISEASE_LABELS_PATH`: optional override for labels path.
- `PLANT_DISEASE_TOP_K`: number of classes returned by inference (`1-5`, default `3`).

## Local Data Model (IndexedDB)

All data is stored in a Dexie database `vera-command-center`.

Object stores:
- `plants`
- `sensor_readings`
- `alerts`
- `anomalies`
- `persona_messages`
- `forecasts`
- `disease_scans`
- `inbox_messages`
- `ops_briefs`
- `ui_events`

Key entities:
- **plants**: id, name, species, zone, stage, healthScore, timestamps
- **sensor_readings**: time-series metrics (pH, TDS, DO, temp, humidity, soil moisture, water + nutrient usage)
- **alerts/anomalies**: predictive and anomaly intelligence
- **persona_messages**: tone-specific first-person narratives
- **disease_scans**: image reference + ML disease label + treatment triage plan
- **inbox_messages**: plant/system/operator interactions
- **ops_briefs**: fleet-level action briefings

Indexes:
- Time-series: `[plantId+timestamp]`
- Alerts: `[plantId+status]`, `severity`, `createdAt`
- Feed-like stores: `createdAt`, `timestamp`

## How Persistence Works
- Live state is held in Zustand for responsive UI.
- Mutations are persisted to IndexedDB repositories.
- UI preferences (theme, some panel toggles) live in `localStorage`.
- Export bundles all stores into one JSON payload.
- Import validates schema version and supports merge/replace.

## File Structure
```text
app/
  api/llm/*                 # LLM API routes
  api/ml/disease/route.ts   # Disease inference route (local ML via uv)
  plants/[plantId]/page.tsx # Plant detail
  settings/page.tsx         # Settings and data tools
  error.tsx                 # Route-level error UI
  global-error.tsx          # App-level error UI
  page.tsx                  # Fleet command center
components/
  ...                       # Cards, panels, dialogs, charts, error surfaces
lib/
  storage/                  # Dexie schema + repositories + import/export
  mock/                     # Sensor generation, anomalies, forecasts, disease mock
  llm/                      # Prompts, client, cache, fallback, rate limit
  ml/                       # Disease inference orchestration + fallback guidance
  onboarding/               # Starter walkthrough library + state persistence
  shortcuts/                # Shortcut registry and hooks
  errors/                   # Error serialization + debug copy helpers
types/
  domain.ts                 # Core domain models
  llm.ts                    # API payload/response contracts
  ml.ts                     # ML disease API contracts
```

## LLM Wiring (What is real vs mocked)
- Real LLM wiring:
  - persona generation
  - predictive narratives
  - root-cause explanations
  - operator briefing
- Mocked telemetry/modeling:
  - sensor streams
  - forecasting values
  - anomaly detector signals
- Real disease inference:
  - disease classifier labels from image (`/api/ml/disease`, local TFLite model via uv)

To keep sensors mocked while using real LLM features (persona/briefing/root-cause), set `NEXT_PUBLIC_SENSOR_SOURCE=mock` and `MOCK_LLM=0` (or `NEXT_PUBLIC_MOCK_LLM=0`).

API routes validate request/response contracts with zod and return fallback-safe payloads on failures.

## ESP8266 Integration (v1)
- Route added: `app/api/device/esp/route.ts`.
- Supported app commands:
  - `POST /api/device/esp` `{ "action": "toggleRelay" }`
  - `POST /api/device/esp` `{ "action": "setOnTime", "value": 300000 }`
  - `POST /api/device/esp` `{ "action": "setOffTime", "value": 3600000 }`
  - `GET /api/device/esp?action=distance` (expects numeric payload)
- Settings page now includes an **ESP8266_Bridge** panel for testing these actions.
- If `NEXT_PUBLIC_SENSOR_SOURCE=esp`, the dashboard uses ESP distance (when available) to override active plant `soilMoisture` during ticks.

## Hackathon Mode
- Click **Start Demo Mode** to seed multiple plants and 24-72h history.
- Use **Inject Anomaly** action (or `Shift+X`) to force a visible issue.
- Toggle **Mock LLM** in settings to demo fully offline mode.
- Use time travel sliders + what-if switches to show intervention outcomes.

## Keyboard Shortcuts
- `Cmd/Ctrl + K`: command palette
- `?`: open shortcuts dialog
- `Shift + F`: focus plant switcher/search
- `[` / `]`: previous/next plant
- `A`: open alerts center
- `T`: toggle time travel panel
- `R`: focus chart range selector
- `D`: open disease scan panel
- `Shift + X`: inject demo anomaly
- `M`: toggle recipe mode
- `,`: open settings

## Design System Notes
- Dark mode by default, optional light mode.
- Cinematic gradient backdrops + glassmorphism cards.
- Accent palette: emerald/cyan/amber with severity coding.
- Motion system: 150-300ms transitions, subtle pulsing live indicators, animated panel and chart state transitions.
- Typography: Space Grotesk (display), Manrope (body), JetBrains Mono (metrics).

## Demo Script (Step-by-step)

### 1) Launch and seed fleet
1. Open app.
2. Click **Start Demo Mode**.
3. Confirm multi-plant grid populates with live metrics and health scores.

### 2) Show persona intelligence
1. Open a plant card.
2. Change tone (Calm -> Dramatic).
3. Click **Refresh Persona**.
4. Show message history persisting after page reload.

### 3) Trigger anomaly and predictive alert
1. Press `Shift+X` to inject a demo anomaly.
2. Open Alerts Center (`A`).
3. Highlight predictive warning text: “Problem likely in X hours.”

### 4) Time travel consequences
1. Open Time Travel (`T`).
2. Move slider from Day 0 to Day 7.
3. Toggle **Increase Aeration** and **Reduce Temp**.
4. Show visual changing from wilted to stable/lush and updated narrative.

### 5) Disease triage flow
1. Open Disease Panel (`D`).
2. Capture webcam image or upload one.
3. Run analysis.
4. Show ML disease label + treatment plan + safety warnings.

### 6) Plant Inbox and operator briefing
1. Open Plant Inbox and select quick reply action.
2. Show that a new control intent is logged and narrative updates.
3. Trigger **Operator Mode Briefing** from header or command palette.
4. Review ranked cross-fleet checklist.

### 7) Keyboard and command center polish
1. Press `Cmd/Ctrl+K` and run actions from palette.
2. Press `?` and review full shortcut list.

### 8) Error handling demo
1. In Settings, switch to real LLM mode without API key (or temporarily invalid key).
2. Trigger persona generation.
3. Show graceful fallback content.
4. Open error details disclosure and click **Copy debug details**.
5. Use retry action and reset demo data recovery action.

## Starter Onboarding Walkthrough
- Click **Walkthrough** in the header.
- Follow one clear step at a time:
  - seed demo plants
  - choose a plant
  - check alerts
  - inject an anomaly drill
  - open disease panel
  - generate morning ops brief
  - open command palette
- Progress is saved in local storage key `vera-onboarding-starter-v1`.
- Use **restart walkthrough** anytime to train again.

## Future Expansions
- Real sensor ingestion via MQTT/HTTP and device adapters.
- Real forecasting models (Prophet/LSTM/transformer time-series).
- Confidence calibration and per-crop threshold tuning for disease classifier.
- Edge deployment near farms with intermittent connectivity handling.
- Device-control loops (aeration, dosing, HVAC) with safety guardrails.
- Multi-tenant RBAC + audit logs.
- Optional cloud sync with conflict-aware offline-first architecture.
- Historical experiment comparison and automated recipe optimization.

## Notes
- This project intentionally prioritizes demo credibility and UX polish over production-scale controls.
- For hackathon reliability, all critical paths degrade gracefully with deterministic local fallbacks.
