const fs = require('fs').promises;
const path = require('path');

const TECHNIQUES_FILE = path.join(__dirname, '../../backend/data/techniques.json');

const getHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
});

// Helper function to read techniques
const readTechniques = async () => {
  try {
    const data = await fs.readFile(TECHNIQUES_FILE, 'utf8');
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
    const techniques = await readTechniques();
    
    // Parse path: /api/techniques/:category/:id
    const pathParts = event.path.split('/').filter(p => p);
    // pathParts will be: ['api', 'techniques', category?, id?]
    
    if (pathParts.length === 2) {
      // GET /api/techniques - return all techniques
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(techniques)
      };
    }
    
    if (pathParts.length >= 4) {
      // GET /api/techniques/:category/:id
      const category = pathParts[2];
      const id = pathParts[3];
      const categoryTechniques = techniques[category];
      const technique = categoryTechniques?.[id];
      
      if (!technique) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Technique not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(technique)
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error in techniques function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

