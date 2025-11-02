const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SITUATIONS_FILE = path.join(__dirname, '../../backend/data/situations.json');
const EXTENDED_SITUATIONS_FILE = path.join(__dirname, '../../situations-extended.json');

// Helper function to read situations (try extended first, fallback to basic)
const readSituations = async () => {
  try {
    // Try to read extended situations first
    const extendedData = await fs.readFile(EXTENDED_SITUATIONS_FILE, 'utf8');
    return JSON.parse(extendedData);
  } catch (error) {
    try {
      // Fallback to basic situations
      const data = await fs.readFile(SITUATIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (fallbackError) {
      // Return empty object if both fail (will be initialized on first write)
      return {};
    }
  }
};

// Helper function to write situations
const writeSituations = async (situations) => {
  // Ensure directory exists
  const dataDir = path.dirname(SITUATIONS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  await fs.writeFile(SITUATIONS_FILE, JSON.stringify(situations, null, 2));
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
    // Log for debugging (removed in production)
    if (process.env.NETLIFY_DEV) {
      console.log('Situations function called:', {
        path: event.path,
        method: event.httpMethod,
        rawPath: event.rawPath,
        pathParameters: event.pathParameters
      });
    }

    // Parse path - extract ID from /api/situations/:id format
    // With redirect: /api/situations -> /.netlify/functions/situations
    // event.path is usually the original path /api/situations
    let id = null;
    const pathMatch = event.path.match(/\/api\/situations\/(.+)$/);
    if (pathMatch) {
      id = pathMatch[1];
    }

    if (event.httpMethod === 'GET') {
      const situations = await readSituations();
      
      if (id) {
        const situation = situations[id];
        if (!situation) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Situation not found' })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(situation)
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(situations)
      };
    }

    if (event.httpMethod === 'POST') {
      const { title, scripts } = JSON.parse(event.body || '{}');
      
      if (!title || !scripts) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Title and scripts are required' })
        };
      }
      
      const situations = await readSituations();
      const newId = uuidv4().substring(0, 8);
      
      situations[newId] = {
        id: newId,
        title,
        scripts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await writeSituations(situations);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(situations[newId])
      };
    }

    if (event.httpMethod === 'PUT') {
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Situation ID is required' })
        };
      }
      
      const { title, scripts } = JSON.parse(event.body || '{}');
      const situations = await readSituations();
      
      if (!situations[id]) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Situation not found' })
        };
      }
      
      situations[id] = {
        ...situations[id],
        title: title || situations[id].title,
        scripts: scripts || situations[id].scripts,
        updatedAt: new Date().toISOString()
      };
      
      await writeSituations(situations);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(situations[id])
      };
    }

    if (event.httpMethod === 'DELETE') {
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Situation ID is required' })
        };
      }
      
      const situations = await readSituations();
      
      if (!situations[id]) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Situation not found' })
        };
      }
      
      delete situations[id];
      await writeSituations(situations);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Situation deleted successfully' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error in situations function:', error);
    console.error('Event path:', event.path);
    console.error('Event method:', event.httpMethod);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: process.env.NETLIFY_DEV ? error.stack : undefined
      })
    };
  }
};

