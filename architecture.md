## Anchored Architecture

### Overview
Anchored is a full-stack JavaScript app:
- Frontend: React (Create React App) in `src/`
- Backend: Express server in `backend/server.js`
- Data: JSON files stored in `backend/data/` with an optional extended dataset in the project root

The app provides quick, scripted responses for common parenting situations, with offline fallback on the client.

### High-Level Diagram

User ⇄ React App (`src/`) ⇄ REST API (`/api/*` on `backend/server.js`) ⇄ JSON files (`backend/data/*` and `situations-extended.json`)

### Frontend
- Bootstrapped with CRA; primary UI in `src/App.js`
- Service layer in `src/services/api.js` wraps `fetch` against `REACT_APP_API_URL` (default `http://localhost:5000/api`)
- Icons: Lucide React throughout
- Key screens/components:
  - Home, Routines, Learn, Settings navigation within `App.js`
  - `components/SituationManager.js` for CRUD operations
  - `components/LearningModules.js` for educational content
  - `components/RoutinesHome.js` - Main routines landing page
  - `components/TodayView.js` - Time-aware today's tasks view
  - `components/FullWeekView.js` - Week overview with collapsed day cards
  - `components/TemplateSelection.js` - Mode selection for routines
  - `components/CustodySettings.js` - Custody pattern configuration with alternating weeks support
- **Custody Management**:
  - Settings stored in `localStorage` as `custodySettings` JSON object
  - Supports three custody types: `no` (always with user), `alternating` (weekly alternation), `specific` (custom schedule)
  - Automatic week detection based on reference week and current date
  - Custody status displayed on Home screen and RoutinesHome components
  - Handover details: Monday at school, 9am drop-off, 4:30pm pick-up
- **Two-Variable System**: 
  - **Week Mode** (proactive): Stored in routine data, affects routine expectations and displays contextual notes
  - **Energy Level** (reactive): Stored in localStorage, displayed on Home screen, used for self-awareness contextual notes
  - Situation scripts always use Balanced mode; contextual guidance boxes adjust based on both variables
- Offline strategy: Frontend merges API data with `FALLBACK_SCRIPTS` to ensure all situations are available even if API returns partial data

### Backend
`backend/server.js` exposes REST endpoints backed by JSON files:
- Situations store: prefers root-level `situations-extended.json` if present, otherwise uses `backend/data/situations.json` and will initialize it with defaults on first run
- Additional datasets:
  - `backend/data/learning-modules.json` - Educational modules
  - `backend/data/techniques.json` - Parenting techniques
  - `backend/data/weekly-routines.json` - User's weekly routine instances
  - `backend/data/routine-templates.json` - Pre-made routine templates (seeded on first run)
  - `backend/data/hard-week-flags.json` - Flagged difficult weeks with prep checklists

Middleware: CORS, JSON body parsing. Data is read/written via Node `fs/promises`.

### API Surface
- Situations
  - GET `/api/situations`
  - GET `/api/situations/:id`
  - POST `/api/situations`
  - PUT `/api/situations/:id`
  - DELETE `/api/situations/:id`
- Learning Modules
  - GET `/api/learning-modules`
  - GET `/api/learning-modules/:category/:id`
- Techniques
  - GET `/api/techniques`
  - GET `/api/techniques/:category/:id`
- Health
  - GET `/api/health`
- Adaptive Routines
  - Weekly Routines: `GET /api/routines/current`, `GET /api/routines/:weekStartDate`, `POST /api/routines`, `PUT /api/routines/:id`, `DELETE /api/routines/:id`
  - Templates: `GET /api/routines/templates`, `GET /api/routines/templates/:id`, `POST /api/routines/templates`
  - Hard Week: `GET /api/routines/upcoming`, `POST /api/routines/flag-hard-week`, `PUT /api/routines/hard-week/:id`, `DELETE /api/routines/hard-week/:id`
  - Prep Tasks: `GET /api/routines/prep-tasks/:weekId`, `PUT /api/routines/prep-tasks/:weekId`

### Data Models

#### Situations
Each situation is keyed by ID and includes a title and three styles (gentle, balanced, tough). Example shape:

```json
{
  "homework": {
    "id": "homework",
    "title": "Homework Battle",
    "scripts": {
      "gentle": { "say": "...", "do": "...", "dont": ["..."], "why": "..." },
      "balanced": { "say": "...", "do": "...", "dont": ["..."], "why": "..." },
      "tough": { "say": "...", "do": "...", "dont": ["..."], "why": "...", "tough": "..." }
    },
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

#### Custody Settings Data Model
Custody settings are stored in browser `localStorage` as `custodySettings`:

```json
{
  "custodyType": "alternating",  // "no" | "alternating" | "specific"
  "currentWeekHasKids": true,    // true if reference week has kids
  "weekStartDate": "2024-11-04",  // ISO date string for reference Monday
  "handoverDay": "monday",
  "handoverLocation": "school",
  "dropoffTime": "09:00",
  "pickupTime": "16:30",
  "notes": "Week with me: Pick up Mon 4:30pm, drop off next Mon 9am. Week with dad: Dad picks up Mon afternoon, drops off next Mon 9am."
}
```

The app calculates current week custody status by:
1. Getting the current week's Monday
2. Calculating weeks difference from the reference `weekStartDate`
3. Using modulo 2 to determine if current week matches reference week pattern

#### Routines & Two-Variable System
Weekly routines support three modes (regular, hard, hardest) with time-based task sections:
- **Week Modes**: Regular (full routine), Hard (simplified expectations), Hardest/Survival (bare minimum)
- **Time sections**: Morning, After School, Evening, Parent Tasks
- **Templates**: Pre-configured routines by mode and custody pattern
- **Custody awareness**: 
  - Auto-detects current week custody status from `localStorage.custodySettings`
  - Filters templates based on whether kids are with user that week
  - Displays custody status and handover reminders on Home and RoutinesHome screens
  - Handover details shown: Monday at school (pick up 4:30pm, drop off next Monday 9am)
- **Hard week planning**: Flag upcoming difficult weeks with auto-generated prep checklists
- **Energy Levels**: Separate from Week Mode, tracks daily energy (Running Low, Survival Mode) stored in localStorage
- **Contextual Guidance**: Both Week Mode and Energy Level display contextual notes in situation responses without changing the script content

### Configuration
- `REACT_APP_API_URL` sets the frontend API base (default `http://localhost:5000/api`)
- Backend `PORT` (default 5000)

### Development Workflow
- Root scripts:
  - `npm run install:all` installs root and backend deps
  - `npm run dev` runs backend (nodemon) + frontend concurrently
  - `npm run backend:dev` runs backend only
  - `npm start` runs both frontend and backend via concurrently
- New data files are auto-created on first run if missing: `weekly-routines.json`, `routine-templates.json`, `hard-week-flags.json`
- Routine templates are automatically seeded with default templates (Regular, Hard, Hardest modes)

### Error Handling and Fallbacks
- Frontend: If a request fails, UI logs an error and falls back to baked-in data for situations
- Backend: Returns appropriate 4xx/5xx codes; logs read/write errors; initializes missing `backend/data/situations.json` with defaults

### Content Library
Reference material lives in `library/` as text files; it is not directly served by the API today but can inform new situation content or learning modules.

### Extensibility Notes
- Add new datasets by creating JSON and a new route file/handlers in `backend/server.js`
- Add new UI flows by composing screens in `App.js` and segregating logic into new components/services
- Consider extracting the backend into a structured router/controller layout as it grows


