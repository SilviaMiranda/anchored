# Anchored - Parenting Support App

A full-stack React application with Express.js backend for managing parenting situations and behavioral scripts.

## Features

- **Situation Management**: Add, edit, and delete parenting situations with custom scripts
- **Two-Variable System**: Week Mode (proactive routine adjustments) + Energy Level (reactive self-awareness)
- **Contextual Guidance**: Situation scripts adapt to your energy level and week mode for personalized support
- **Adaptive Routines**: Weekly routines with Regular, Hard, and Survival modes to match your circumstances
- **Custody Settings**: Configure alternating weeks custody schedule with automatic week detection and handover reminders
- **Learning Modules**: Educational content on parenting strategies and child development
- **Techniques Library**: Practical parenting techniques organized by category
- **Real-time API**: Full CRUD operations with JSON database
- **Offline Fallback**: Works even when backend is unavailable with merged fallback data
- **Responsive Design**: Mobile-first design optimized for quick access during parenting moments

See also: [architecture.md](./architecture.md)

## Tech Stack

### Frontend
- React 19.2.0
- Lucide React (icons)
- CSS-in-JS styling
- Fetch API for backend communication

### Backend
- Node.js with Express.js
- JSON file-based database
- CORS enabled for frontend communication
- RESTful API endpoints

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd anchored
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start both frontend and backend:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend React app on `http://localhost:3000`

### Alternative Setup

**Run frontend and backend separately:**

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend  
npm start
```

## API Endpoints

The backend provides the following REST API endpoints:

### Situations
- `GET /api/situations` - Get all situations
- `GET /api/situations/:id` - Get specific situation
- `POST /api/situations` - Create new situation
- `PUT /api/situations/:id` - Update existing situation
- `DELETE /api/situations/:id` - Delete situation

### Learning Modules
- `GET /api/learning-modules` - Get all learning modules grouped by category
- `GET /api/learning-modules/:category/:id` - Get a specific module

### Techniques
- `GET /api/techniques` - Get all techniques grouped by category
- `GET /api/techniques/:category/:id` - Get a specific technique

### Health Check
- `GET /api/health` - Server health status

### Adaptive Routines
- Weekly Routines
  - `GET /api/routines/current` – Get current week's routine (by Monday start)
  - `GET /api/routines/:weekStartDate` – Get specific week by YYYY-MM-DD
  - `POST /api/routines` – Create/update a week routine `{ weekStartDate, routine }`
  - `PUT /api/routines/:id` – Update routine by weekStartDate
  - `DELETE /api/routines/:id` – Delete routine by weekStartDate
- Routine Templates
  - `GET /api/routines/templates`
  - `GET /api/routines/templates/:id`
  - `POST /api/routines/templates` – Create template `{ id, template }`
- Hard Week Planning
  - `GET /api/routines/upcoming` – Get flagged upcoming hard weeks
  - `POST /api/routines/flag-hard-week` – Flag a week `{ weekStartDate, flag }`
  - `PUT /api/routines/hard-week/:id` – Update by flag id
  - `DELETE /api/routines/hard-week/:id` – Remove by flag id
- Prep Tasks (stored on weekly routine)
  - `GET /api/routines/prep-tasks/:weekId`
  - `PUT /api/routines/prep-tasks/:weekId` – Update array of tasks

## Database

The app uses JSON files for storage. For situations, the server will prefer a project-level extended dataset if present, otherwise it falls back to the local data file:

- Preferred: `situations-extended.json` (project root)
- Fallback: `backend/data/situations.json` (auto-initialized on first run)

Additional datasets:
- `backend/data/learning-modules.json`
- `backend/data/techniques.json`
- `backend/data/weekly-routines.json`
- `backend/data/routine-templates.json`
- `backend/data/hard-week-flags.json`

### Data Structure

```json
{
  "situation-id": {
    "id": "situation-id",
    "title": "Situation Title",
    "scripts": {
      "gentle": {
        "say": "What to say",
        "do": "What to do",
        "dont": ["What not to do"],
        "why": "Why this works",
        "tough": "Additional tough love reminder"
      },
      "balanced": { ... },
      "tough": { ... }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Usage

### Adding New Situations

1. Open the app and go to **Settings**
2. Click **"Manage Situations"**
3. Click **"Add Situation"**
4. Fill in the situation details:
   - **Title**: Name of the situation
   - **Scripts**: For each response style (gentle, balanced, tough):
     - **What to Say**: Exact words to use
     - **What to Do**: Actions to take
     - **What NOT to Do**: Things to avoid (one per line)
     - **Why This Works**: Explanation of the approach
     - **Tough Love Reminder**: Additional note for tough mode

### Editing Situations

1. Go to **Settings** → **Manage Situations**
2. Click **"Edit"** on any situation
3. Modify the fields as needed
4. Click **"Update Situation"**

### Using the App

1. **Set Your Energy Level**: Choose Running Low or Survival Mode on the Home screen to track how you're feeling today
2. **Configure Custody Schedule**: Go to Settings → Custody Schedule to set up alternating weeks or other custody patterns
3. **Set Your Week Mode**: Choose Regular, Hard, or Survival mode for your weekly routine expectations
4. **Access Situations**: Use the main button "What do I need right now?" or quick solutions
5. **Follow Scripts**: Situation responses use the Balanced script and show contextual guidance based on your energy level and week mode
6. **Manage Routines**: Set up weekly routines with different modes based on your week's demands

### Custody Settings

The app supports alternating weeks custody schedules:

1. Go to **Settings** → **Custody Schedule**
2. Select your custody pattern:
   - **No custody**: Kids always with you
   - **Alternating weeks**: Kids alternate between you and the other parent weekly
   - **Specific schedule**: Custom weekly pattern (coming soon)
3. If alternating weeks:
   - Select whether this week has kids with you
   - Handover details are automatically set (Monday at school, 9am drop-off, 4:30pm pick-up)
4. Save your schedule

The app automatically detects which week you're in and displays custody status on:
- **Home screen**: Shows "Kids with you this week" or "Kids at dad's this week"
- **Routines Home**: Displays custody status and handover reminders for the current week

## Project Structure

```
anchored/
├── backend/
│   ├── data/
│   │   ├── situations.json          # JSON database
│   │   ├── learning-modules.json    # Educational content
│   │   ├── techniques.json          # Parenting techniques
│   │   ├── weekly-routines.json     # User routines
│   │   ├── routine-templates.json   # Routine templates
│   │   └── hard-week-flags.json     # Flagged difficult weeks
│   ├── package.json
│   ├── server.js                    # Express server
│   └── .gitignore
├── src/
│   ├── components/
│   │   ├── SituationManager.js      # CRUD interface
│   │   ├── LearningModules.js       # Learning content viewer
│   │   ├── RoutinesHome.js          # Main routines landing
│   │   ├── TodayView.js             # Today's tasks view
│   │   ├── FullWeekView.js          # Week overview
│   │   ├── TemplateSelection.js     # Mode selection
│   │   └── CustodySettings.js       # Custody pattern setup
│   ├── services/
│   │   └── api.js                   # API service
│   ├── App.js                       # Main app component
│   └── index.js
├── library/                         # Reference content (text files)
├── package.json
├── architecture.md                  # Detailed architecture docs
└── README.md
```

## Development

### Adding New Features

1. **Backend Changes**: Modify `backend/server.js` and add new endpoints
2. **Frontend Changes**: Update `src/App.js` or create new components
3. **API Integration**: Use `src/services/api.js` for backend communication

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=5000
```

## Troubleshooting

### Backend Won't Start
- Check if port 5000 is available
- Ensure all dependencies are installed: `cd backend && npm install`

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check browser console for CORS errors
- App will fall back to offline mode if backend is unavailable

### Database Issues
- Delete `backend/data/situations.json` to reset to default data
- Check file permissions on the data directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.