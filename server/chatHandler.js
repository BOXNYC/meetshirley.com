import OpenAI from 'openai';

const SHIRLEY_FILE_ID = 'file-RcKfUSRcwbp5Uf1DiU5nU4';
const LANDSCAPE_FILE_ID = 'file-QLKQJAPeVAkC3fFCr8ScmW';

function getClient(apiKey) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Server is missing OPENAI_API_KEY');
  return new OpenAI({ apiKey: key });
}

async function handleTrained(client, { question }) {
  const response = await client.responses.create({
    model: 'gpt-4o',
    input: [{
      role: 'user',
      content: [
        { type: 'input_text', text: `Pretend to be Shirley. How would Shirley respond to the question "${question}"?` },
        { type: 'input_file', file_id: SHIRLEY_FILE_ID },
        { type: 'input_file', file_id: LANDSCAPE_FILE_ID },
      ],
    }],
  });
  return { outputText: response.output_text };
}

async function handleRephrase(client, { prompt, temperature }) {
  const result = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature,
  });
  return { content: result.choices[0].message.content };
}

export async function handleChat(body, apiKey) {
  const client = getClient(apiKey);
  const action = body.action;

  if (action === 'trained') return handleTrained(client, body);
  if (action === 'rephrase') return handleRephrase(client, body);

  throw new Error(`Unknown action: ${action}`);
}

async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function createNodeHandler(apiKey) {
  return async (req, res) => {
    try {
      if (req.method && req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Method not allowed' }));
      }
      const body = await readJsonBody(req);
      const result = await handleChat(body, apiKey);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error('[chat] error:', err);
      res.statusCode = err.status || 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Internal error' }));
    }
  };
}
