const fs = require('fs').promises;
const path = require('path');

const WEEKLY_ROUTINES_FILE = path.join(__dirname, '../../backend/data/weekly-routines.json');
const ROUTINE_TEMPLATES_FILE = path.join(__dirname, '../../backend/data/routine-templates.json');
const HARD_WEEK_FLAGS_FILE = path.join(__dirname, '../../backend/data/hard-week-flags.json');

// Helper functions
const readJson = async (filePath, fallback = {}) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (error) {
    // If file doesn't exist, return fallback and ensure directory exists
    const dataDir = path.dirname(filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
};

const writeJson = async (filePath, data) => {
  // Ensure directory exists
  const dataDir = path.dirname(filePath);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const getWeekKey = (dateStr) => dateStr; // Expecting ISO week start (e.g., 2024-11-04)

const getMondayOfWeek = (date = new Date()) => {
  const now = date instanceof Date ? date : new Date(date);
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const diffToMonday = (day + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
};

const getHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
});

exports.handler = async (event) => {
  const headers = getHeaders();

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse path: /api/routines/current, /api/routines/templates, /api/routines/:weekStartDate, etc.
    const pathParts = event.path.split('/').filter(p => p);
    // pathParts will be: ['api', 'routines', ...rest]
    const subPath = pathParts.length > 2 ? pathParts.slice(2).join('/') : '';
    
    const method = event.httpMethod;

    // GET /api/routines/current
    if (method === 'GET' && subPath === 'current') {
      const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
      const currentWeek = getMondayOfWeek();
      const routine = routines[currentWeek];
      
      if (!routine) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Current week routine not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(routine)
      };
    }

    // GET /api/routines/upcoming
    if (method === 'GET' && subPath === 'upcoming') {
      const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(flags)
      };
    }

    // GET /api/routines/templates or GET /api/routines/templates/:id
    if (method === 'GET' && subPath.startsWith('templates')) {
      const templates = await readJson(ROUTINE_TEMPLATES_FILE, {});
      const templateParts = subPath.split('/');
      
      if (templateParts.length > 1) {
        // GET /api/routines/templates/:id
        const templateId = templateParts[1];
        const template = templates[templateId];
        if (!template) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Template not found' })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(template)
        };
      }
      
      // GET /api/routines/templates
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(templates)
      };
    }

    // POST /api/routines/templates
    if (method === 'POST' && subPath === 'templates') {
      const { id, template } = JSON.parse(event.body || '{}');
      if (!id || !template) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'id and template are required' })
        };
      }
      const templates = await readJson(ROUTINE_TEMPLATES_FILE, {});
      templates[id] = { id, ...template };
      await writeJson(ROUTINE_TEMPLATES_FILE, templates);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(templates[id])
      };
    }

    // POST /api/routines/flag-hard-week
    if (method === 'POST' && subPath === 'flag-hard-week') {
      const { weekStartDate, flag } = JSON.parse(event.body || '{}');
      if (!weekStartDate || !flag) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'weekStartDate and flag are required' })
        };
      }
      const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
      const key = getWeekKey(weekStartDate);
      flags[key] = { id: `flag-${key}`, weekStartDate: key, ...flag };
      await writeJson(HARD_WEEK_FLAGS_FILE, flags);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(flags[key])
      };
    }

    // GET/PUT/DELETE /api/routines/hard-week/:id
    if (subPath.startsWith('hard-week')) {
      const hardWeekParts = subPath.split('/');
      if (hardWeekParts.length > 1) {
        const flagId = hardWeekParts[1];
        const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
        const flag = Object.values(flags).find((f) => f.id === flagId);
        
        if (!flag) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Hard week not found' })
          };
        }

        if (method === 'GET') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(flag)
          };
        }

        if (method === 'PUT') {
          const updates = JSON.parse(event.body || '{}');
          flags[flag.weekStartDate] = { ...flag, ...updates };
          await writeJson(HARD_WEEK_FLAGS_FILE, flags);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(flags[flag.weekStartDate])
          };
        }

        if (method === 'DELETE') {
          const entry = Object.entries(flags).find(([, v]) => v.id === flagId);
          if (entry) {
            const [key] = entry;
            delete flags[key];
            await writeJson(HARD_WEEK_FLAGS_FILE, flags);
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Hard week flag removed' })
          };
        }
      }
    }

    // GET/PUT /api/routines/prep-tasks/:weekId
    if (subPath.startsWith('prep-tasks')) {
      const prepParts = subPath.split('/');
      if (prepParts.length > 1) {
        const weekId = prepParts[1];
        const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
        const key = getWeekKey(weekId);
        const routine = routines[key];
        
        if (!routine) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Routine not found' })
          };
        }

        if (method === 'GET') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(routine.prepTasks || [])
          };
        }

        if (method === 'PUT') {
          const { prepTasks } = JSON.parse(event.body || '{}');
          if (!Array.isArray(prepTasks)) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'prepTasks must be an array' })
            };
          }
          routines[key] = { ...routine, prepTasks, updatedAt: new Date().toISOString() };
          await writeJson(WEEKLY_ROUTINES_FILE, routines);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(routines[key].prepTasks)
          };
        }
      }
    }

    // POST /api/routines (create/update routine)
    if (method === 'POST' && subPath === '') {
      const { weekStartDate, routine } = JSON.parse(event.body || '{}');
      if (!weekStartDate || !routine) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'weekStartDate and routine are required' })
        };
      }
      const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
      const key = getWeekKey(weekStartDate);
      const nowIso = new Date().toISOString();
      const existing = routines[key] || {};
      routines[key] = {
        id: key,
        weekStartDate: key,
        weekEndDate: routine.weekEndDate || existing.weekEndDate || null,
        ...existing,
        ...routine,
        idempotencyKey: undefined,
        updatedAt: nowIso,
        createdAt: existing.createdAt || nowIso
      };
      await writeJson(WEEKLY_ROUTINES_FILE, routines);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(routines[key])
      };
    }

    // PUT /api/routines/:id (update routine by weekStartDate)
    if (method === 'PUT' && subPath) {
      const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
      const key = getWeekKey(subPath);
      
      const updates = JSON.parse(event.body || '{}');
      
      // If routine doesn't exist, create it
      if (!routines[key]) {
        routines[key] = {
          id: key,
          weekStartDate: key,
          mode: 'regular',
          dailyRoutines: {},
          ...updates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        // Handle null values (e.g., deleting weekException)
        const cleanedUpdates = {};
        for (const [updateKey, updateValue] of Object.entries(updates)) {
          if (updateValue === null) {
            delete routines[key][updateKey];
          } else {
            cleanedUpdates[updateKey] = updateValue;
          }
        }
        routines[key] = { ...routines[key], ...cleanedUpdates, updatedAt: new Date().toISOString() };
      }
      
      await writeJson(WEEKLY_ROUTINES_FILE, routines);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(routines[key])
      };
    }

    // DELETE /api/routines/:id
    if (method === 'DELETE' && subPath) {
      const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
      const key = getWeekKey(subPath);
      
      if (!routines[key]) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Routine not found' })
        };
      }
      
      delete routines[key];
      await writeJson(WEEKLY_ROUTINES_FILE, routines);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Routine deleted' })
      };
    }

    // GET /api/routines/:weekStartDate
    if (method === 'GET' && subPath) {
      const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
      const key = getWeekKey(subPath);
      const routine = routines[key];
      
      if (!routine) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Routine not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(routine)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error in routines function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

