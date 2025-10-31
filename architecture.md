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
- Key screens/components:
  - Home, Learn, Settings navigation within `App.js`
  - `components/SituationManager.js` for CRUD operations
  - `components/LearningModules.js` for educational content
- Offline strategy: If API calls fail, the UI falls back to an in-memory `FALLBACK_SCRIPTS` object in `App.js`

### Backend
`backend/server.js` exposes REST endpoints backed by JSON files:
- Situations store: prefers root-level `situations-extended.json` if present, otherwise uses `backend/data/situations.json` and will initialize it with defaults on first run
- Additional datasets:
  - `backend/data/learning-modules.json`
  - `backend/data/techniques.json`

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

### Data Model (Situations)
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

### Configuration
- `REACT_APP_API_URL` sets the frontend API base (default `http://localhost:5000/api`)
- Backend `PORT` (default 5000)

### Development Workflow
- Root scripts:
  - `npm run install:all` installs root and backend deps
  - `npm run dev` runs backend (nodemon) + frontend concurrently
  - `npm run backend:dev` runs backend only
  - `npm start` runs frontend only
 - New data files are auto-created on first run if missing: `weekly-routines.json`, `routine-templates.json`, `hard-week-flags.json`

### Error Handling and Fallbacks
- Frontend: If a request fails, UI logs an error and falls back to baked-in data for situations
- Backend: Returns appropriate 4xx/5xx codes; logs read/write errors; initializes missing `backend/data/situations.json` with defaults

### Content Library
Reference material lives in `library/` as text files; it is not directly served by the API today but can inform new situation content or learning modules.

### Extensibility Notes
- Add new datasets by creating JSON and a new route file/handlers in `backend/server.js`
- Add new UI flows by composing screens in `App.js` and segregating logic into new components/services
- Consider extracting the backend into a structured router/controller layout as it grows


