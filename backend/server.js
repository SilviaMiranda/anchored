const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const SITUATIONS_FILE = path.join(__dirname, 'data', 'situations.json');
const EXTENDED_SITUATIONS_FILE = path.join(__dirname, '..', 'situations-extended.json');
const LEARNING_MODULES_FILE = path.join(__dirname, 'data', 'learning-modules.json');
const TECHNIQUES_FILE = path.join(__dirname, 'data', 'techniques.json');
const WEEKLY_ROUTINES_FILE = path.join(__dirname, 'data', 'weekly-routines.json');
const ROUTINE_TEMPLATES_FILE = path.join(__dirname, 'data', 'routine-templates.json');
const HARD_WEEK_FLAGS_FILE = path.join(__dirname, 'data', 'hard-week-flags.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(SITUATIONS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Initialize database with extended data
const initializeDatabase = async () => {
  try {
    await fs.access(SITUATIONS_FILE);
  } catch {
    // Create default situations data
    const defaultSituations = {
      'homework': {
        id: 'homework',
        title: 'Homework Battle',
        scripts: {
          gentle: {
            say: "I know homework feels really hard right now. Your brain is tired from school. Let's figure out together how to make this feel manageable.",
            do: "Sit with him. Break it into tiny chunks - maybe just 5 minutes to start. Offer sensory break first (jump, push wall, snack). Use a timer he can see. Celebrate any effort.",
            dont: ["Battle for hours", "Do the work for him", "Threaten or guilt trip"],
            why: "His ADHD brain is genuinely depleted after school. Collaboration reduces power struggle and helps him feel supported rather than pressured."
          },
          balanced: {
            say: "Homework is part of school. It's hard, but it has to get done. Let's make a plan together.",
            do: "Set timer for 15 minutes. He tries his best. Break after. Second 15-minute session. If genuine effort made, he earns 30 min screen time. If refused, outdoor play instead.",
            dont: ["Battle for hours", "Do it for him", "Skip consequences"],
            why: "Clear structure with built-in breaks works with ADHD. Natural consequences teach responsibility while accommodating his needs."
          },
          tough: {
            say: "You have homework. It's not optional. You can choose to do it now and earn screens, or refuse and lose them. Your choice.",
            do: "One warning with clear consequence. Set timer. If genuine refusal after warning: No screens today, homework must be done before breakfast tomorrow. Follow through even if he melts down.",
            dont: ["Give multiple chances", "Cave when he escalates", "Make empty threats"],
            why: "Consistency teaches accountability. His ADHD means he needs clear boundaries even more, not fewer. Following through builds trust.",
            tough: "You're tired and want to let it slide. Don't. If he doesn't try today, he does it tomorrow morning before fun stuff."
          }
        }
      },
      'screen': {
        id: 'screen',
        title: 'Screen Refusal',
        scripts: {
          gentle: {
            say: "I know it's so hard to stop when you're having fun. Your brain wants to keep going. Let's help your brain make the switch.",
            do: "Give a 5-minute warning with timer. When it goes off: 'Timer's done. I'm going to count to 10 while you finish up.' Count slowly. If still playing at 10, calmly take device. Offer replacement activity.",
            dont: ["Negotiate endlessly", "Get angry", "Shame him for struggling"],
            why: "Transitions are genuinely hard for ADHD brains. Warning + countdown + calm follow-through respects his neurology while maintaining boundary."
          },
          balanced: {
            say: "Timer's up. Screens off now. You can turn it off, or I do it and you lose 30 minutes tomorrow. Counting to 5.",
            do: "Count slowly to 5. If no action, remove device. He loses 30 minutes tomorrow. Stay calm but firm. Natural consequence teaches the rule.",
            dont: ["Give multiple warnings", "Negotiate 'just 5 more minutes'", "Cave when he escalates"],
            why: "Clear countdown respects his transition time. Consistent consequence teaches that the rule is real, reducing future battles."
          },
          tough: {
            say: "Screens off. Now. This is not a negotiation.",
            do: "No countdown needed - you already gave warning. Remove device immediately. No screens rest of day. Tomorrow he can try again. Don't engage in argument.",
            dont: ["Explain again (he knows)", "Feel guilty", "Give it back when he calms down"],
            why: "Sometimes you need to just act. The repeated battles happen because consequences haven't been consistent. Time to break that pattern.",
            tough: "You already gave a warning. Now it's action time. Remove the device. Don't explain again - he knows the rule."
          }
        }
      }
    };

    await fs.writeFile(SITUATIONS_FILE, JSON.stringify(defaultSituations, null, 2));
    console.log('Database initialized with default data');
  }
  // Ensure new data files exist
  const ensureJsonFile = async (filePath) => {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify({}, null, 2));
    }
  };
  await Promise.all([
    ensureJsonFile(WEEKLY_ROUTINES_FILE),
    ensureJsonFile(ROUTINE_TEMPLATES_FILE),
    ensureJsonFile(HARD_WEEK_FLAGS_FILE)
  ]);

  // Seed templates if empty
  try {
    const raw = await fs.readFile(ROUTINE_TEMPLATES_FILE, 'utf8');
    const obj = raw ? JSON.parse(raw) : {};
    if (!obj || Object.keys(obj).length === 0) {
      const seed = {
        'regular-with-kids': {
          id: 'regular-with-kids',
          name: 'Regular Week (Kids With You)',
          mode: 'regular',
          kidsPresent: true,
          days: {
            monday: {
              morning: [{ text: 'Wake kids 7:00am', type: 'task' }, { text: 'Breakfast together', type: 'task' }],
              afterSchool: [{ text: 'Pick up 3:30pm', type: 'task' }],
              evening: [{ text: 'Dinner together 6:30pm', type: 'task' }, { text: 'Bedtime routine', type: 'task' }],
              parentTasks: [{ text: 'Check in with each kid', type: 'task' }]
            }
          }
        },
        'hard-with-kids': {
          id: 'hard-with-kids',
          name: 'Hard Week (Kids With You)',
          mode: 'hard',
          kidsPresent: true,
          days: {
            monday: {
              morning: [{ text: 'Wake kids 7:00am', type: 'task' }],
              afterSchool: [{ text: 'Snack + 30 min screens', type: 'task' }],
              evening: [{ text: 'Easy dinner (takeout)', type: 'task' }],
              parentTasks: []
            }
          }
        },
        'hardest-survival': {
          id: 'hardest-survival',
          name: 'Hardest Week (Survival Mode)',
          mode: 'hardest',
          kidsPresent: true,
          days: {
            monday: {
              morning: [{ text: 'Cereal + water', type: 'task' }],
              afterSchool: [{ text: 'Screens 60 min', type: 'task' }],
              evening: [{ text: 'Frozen dinner', type: 'task' }],
              parentTasks: []
            }
          }
        }
      };
      await fs.writeFile(ROUTINE_TEMPLATES_FILE, JSON.stringify(seed, null, 2));
      console.log('Seeded routine templates');
    }
  } catch (e) {
    console.error('Template seeding failed:', e);
  }
};

// Helper function to read situations (try extended first, fallback to basic)
const readSituations = async () => {
  try {
    // Try to read extended situations first
    const extendedData = await fs.readFile(EXTENDED_SITUATIONS_FILE, 'utf8');
    console.log('Using extended situations database');
    return JSON.parse(extendedData);
  } catch (error) {
    try {
      // Fallback to basic situations
      const data = await fs.readFile(SITUATIONS_FILE, 'utf8');
      console.log('Using basic situations database');
      return JSON.parse(data);
    } catch (fallbackError) {
      console.error('Error reading situations:', fallbackError);
      throw fallbackError;
    }
  }
};

// Helper function to read learning modules
const readLearningModules = async () => {
  try {
    const data = await fs.readFile(LEARNING_MODULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading learning modules:', error);
    return {};
  }
};

// Helper function to read techniques
const readTechniques = async () => {
  try {
    const data = await fs.readFile(TECHNIQUES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading techniques:', error);
    return {};
  }
};

// Helper function to write situations
const writeSituations = async (situations) => {
  try {
    await fs.writeFile(SITUATIONS_FILE, JSON.stringify(situations, null, 2));
  } catch (error) {
    console.error('Error writing situations:', error);
    throw error;
  }
};

// Routines helpers
const readJson = async (filePath, fallback = {}) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error(`Error reading ${path.basename(filePath)}:`, error);
    return fallback;
  }
};

const writeJson = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${path.basename(filePath)}:`, error);
    throw error;
  }
};

const getWeekKey = (dateStr) => dateStr; // Expecting ISO week start (e.g., 2024-11-04)


// API Routes

// Get all situations
app.get('/api/situations', async (req, res) => {
  try {
    const situations = await readSituations();
    res.json(situations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch situations' });
  }
});

// Get a specific situation
app.get('/api/situations/:id', async (req, res) => {
  try {
    const situations = await readSituations();
    const situation = situations[req.params.id];
    
    if (!situation) {
      return res.status(404).json({ error: 'Situation not found' });
    }
    
    res.json(situation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch situation' });
  }
});

// Create a new situation
app.post('/api/situations', async (req, res) => {
  try {
    const { title, scripts } = req.body;
    
    if (!title || !scripts) {
      return res.status(400).json({ error: 'Title and scripts are required' });
    }
    
    const situations = await readSituations();
    const id = uuidv4().substring(0, 8); // Short unique ID
    
    situations[id] = {
      id,
      title,
      scripts,
      createdAt: new Date().toISOString()
    };
    
    await writeSituations(situations);
    res.status(201).json(situations[id]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create situation' });
  }
});

// Update an existing situation
app.put('/api/situations/:id', async (req, res) => {
  try {
    const { title, scripts } = req.body;
    const situations = await readSituations();
    
    if (!situations[req.params.id]) {
      return res.status(404).json({ error: 'Situation not found' });
    }
    
    situations[req.params.id] = {
      ...situations[req.params.id],
      title: title || situations[req.params.id].title,
      scripts: scripts || situations[req.params.id].scripts,
      updatedAt: new Date().toISOString()
    };
    
    await writeSituations(situations);
    res.json(situations[req.params.id]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update situation' });
  }
});

// Delete a situation
app.delete('/api/situations/:id', async (req, res) => {
  try {
    const situations = await readSituations();
    
    if (!situations[req.params.id]) {
      return res.status(404).json({ error: 'Situation not found' });
    }
    
    delete situations[req.params.id];
    await writeSituations(situations);
    res.json({ message: 'Situation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete situation' });
  }
});

// ===== Adaptive Routines API =====

// Weekly Routines
app.get('/api/routines/current', async (req, res) => {
  try {
    const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
    // Determine current week by nearest Monday of today
    const now = new Date();
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const diffToMonday = (day + 6) % 7; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const key = monday.toISOString().slice(0, 10);
    const routine = routines[key];
    if (!routine) {
      return res.status(404).json({ error: 'Current week routine not found' });
    }
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current routine' });
  }
});

// ROUTE ORDER MATTERS: define specific subpaths before the param route
// Hard Week Planning - Upcoming
app.get('/api/routines/upcoming', async (req, res) => {
  try {
    const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming hard weeks' });
  }
});

// Templates (list and by id)
app.get('/api/routines/templates', async (req, res) => {
  try {
    const templates = await readJson(ROUTINE_TEMPLATES_FILE, {});
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.get('/api/routines/templates/:id', async (req, res) => {
  try {
    const templates = await readJson(ROUTINE_TEMPLATES_FILE, {});
    const tpl = templates[req.params.id];
    if (!tpl) return res.status(404).json({ error: 'Template not found' });
    res.json(tpl);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Param route for specific week must come after specific subpaths
app.get('/api/routines/:weekStartDate', async (req, res) => {
  try {
    const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
    const key = getWeekKey(req.params.weekStartDate);
    const routine = routines[key];
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
});

app.post('/api/routines', async (req, res) => {
  try {
    const { weekStartDate, routine } = req.body;
    if (!weekStartDate || !routine) return res.status(400).json({ error: 'weekStartDate and routine are required' });
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
    res.status(201).json(routines[key]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert routine' });
  }
});

app.put('/api/routines/:id', async (req, res) => {
  try {
    const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
    const key = getWeekKey(req.params.id);
    if (!routines[key]) return res.status(404).json({ error: 'Routine not found' });
    routines[key] = { ...routines[key], ...req.body, updatedAt: new Date().toISOString() };
    await writeJson(WEEKLY_ROUTINES_FILE, routines);
    res.json(routines[key]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update routine' });
  }
});

app.delete('/api/routines/:id', async (req, res) => {
  try {
    const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
    const key = getWeekKey(req.params.id);
    if (!routines[key]) return res.status(404).json({ error: 'Routine not found' });
    delete routines[key];
    await writeJson(WEEKLY_ROUTINES_FILE, routines);
    res.json({ message: 'Routine deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

// Routine Templates (create)

app.post('/api/routines/templates', async (req, res) => {
  try {
    const { id, template } = req.body;
    if (!id || !template) return res.status(400).json({ error: 'id and template are required' });
    const templates = await readJson(ROUTINE_TEMPLATES_FILE, {});
    templates[id] = { id, ...template };
    await writeJson(ROUTINE_TEMPLATES_FILE, templates);
    res.status(201).json(templates[id]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
});

app.post('/api/routines/flag-hard-week', async (req, res) => {
  try {
    const { weekStartDate, flag } = req.body;
    if (!weekStartDate || !flag) return res.status(400).json({ error: 'weekStartDate and flag are required' });
    const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
    const key = getWeekKey(weekStartDate);
    flags[key] = { id: `flag-${key}`, weekStartDate: key, ...flag };
    await writeJson(HARD_WEEK_FLAGS_FILE, flags);
    res.status(201).json(flags[key]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to flag hard week' });
  }
});

app.put('/api/routines/hard-week/:id', async (req, res) => {
  try {
    const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
    const flag = Object.values(flags).find((f) => f.id === req.params.id);
    if (!flag) return res.status(404).json({ error: 'Hard week not found' });
    flags[flag.weekStartDate] = { ...flag, ...req.body };
    await writeJson(HARD_WEEK_FLAGS_FILE, flags);
    res.json(flags[flag.weekStartDate]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hard week' });
  }
});

app.delete('/api/routines/hard-week/:id', async (req, res) => {
  try {
    const flags = await readJson(HARD_WEEK_FLAGS_FILE, {});
    const entry = Object.entries(flags).find(([, v]) => v.id === req.params.id);
    if (!entry) return res.status(404).json({ error: 'Hard week not found' });
    const [key] = entry;
    delete flags[key];
    await writeJson(HARD_WEEK_FLAGS_FILE, flags);
    res.json({ message: 'Hard week flag removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hard week' });
  }
});

// Prep Tasks (stored inside weekly routine by weekId)
app.get('/api/routines/prep-tasks/:weekId', async (req, res) => {
  try {
    const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
    const key = getWeekKey(req.params.weekId);
    const routine = routines[key];
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    res.json(routine.prepTasks || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prep tasks' });
  }
});

app.put('/api/routines/prep-tasks/:weekId', async (req, res) => {
  try {
    const routines = await readJson(WEEKLY_ROUTINES_FILE, {});
    const key = getWeekKey(req.params.weekId);
    const routine = routines[key];
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    const { prepTasks } = req.body;
    if (!Array.isArray(prepTasks)) return res.status(400).json({ error: 'prepTasks must be an array' });
    routines[key] = { ...routine, prepTasks, updatedAt: new Date().toISOString() };
    await writeJson(WEEKLY_ROUTINES_FILE, routines);
    res.json(routines[key].prepTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prep tasks' });
  }
});

// Get learning modules
app.get('/api/learning-modules', async (req, res) => {
  try {
    const modules = await readLearningModules();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning modules' });
  }
});

// Get specific learning module
app.get('/api/learning-modules/:category/:id', async (req, res) => {
  try {
    const modules = await readLearningModules();
    const category = modules[req.params.category];
    const module = category?.modules?.[req.params.id];
    
    if (!module) {
      return res.status(404).json({ error: 'Learning module not found' });
    }
    
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning module' });
  }
});

// Get techniques
app.get('/api/techniques', async (req, res) => {
  try {
    const techniques = await readTechniques();
    res.json(techniques);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch techniques' });
  }
});

// Get specific technique
app.get('/api/techniques/:category/:id', async (req, res) => {
  try {
    const techniques = await readTechniques();
    const category = techniques[req.params.category];
    const technique = category?.[req.params.id];
    
    if (!technique) {
      return res.status(404).json({ error: 'Technique not found' });
    }
    
    res.json(technique);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch technique' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  await ensureDataDir();
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Anchored Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Situations API: http://localhost:${PORT}/api/situations`);
  });
};

startServer().catch(console.error);
