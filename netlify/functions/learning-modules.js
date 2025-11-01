const fs = require('fs').promises;
const path = require('path');

const LEARNING_MODULES_FILE = path.join(__dirname, '../../backend/data/learning-modules.json');

const getHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
});

// Helper function to read learning modules
const readLearningModules = async () => {
  try {
    const data = await fs.readFile(LEARNING_MODULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty object if file doesn't exist
    return {};
  }
};

exports.handler = async (event) => {
  const headers = getHeaders();

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const modules = await readLearningModules();
    
    // Parse path: /api/learning-modules/:category/:id
    const pathParts = event.path.split('/').filter(p => p);
    // pathParts will be: ['api', 'learning-modules', category?, id?]
    
    if (pathParts.length === 2) {
      // GET /api/learning-modules - return all modules
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(modules)
      };
    }
    
    if (pathParts.length >= 4) {
      // GET /api/learning-modules/:category/:id
      const category = pathParts[2];
      const id = pathParts[3];
      const categoryModules = modules[category];
      const module = categoryModules?.modules?.[id];
      
      if (!module) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Learning module not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(module)
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error in learning-modules function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

