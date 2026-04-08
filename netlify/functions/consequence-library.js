const fs = require('fs').promises;
const path = require('path');

const CONSEQUENCE_LIBRARY_FILE = path.join(
  __dirname,
  '../../backend/data/consequence-library.json'
);

const getHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Content-Type': 'application/json'
});

const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Object.getPrototypeOf(value) === Object.prototype;

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

const readLibrary = async () => {
  try {
    const data = await fs.readFile(CONSEQUENCE_LIBRARY_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch {
    return {};
  }
};

const writeLibrary = async (obj) => {
  await ensureDir(CONSEQUENCE_LIBRARY_FILE);
  await fs.writeFile(CONSEQUENCE_LIBRARY_FILE, JSON.stringify(obj, null, 2));
};

exports.handler = async (event) => {
  const headers = getHeaders();

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const library = await readLibrary();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(library)
      };
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      if (!isPlainObject(body)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Body must be a JSON object' })
        };
      }
      await writeLibrary(body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(body)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error in consequence-library function:', error);
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

