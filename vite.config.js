import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { createNodeHandler } from './server/chatHandler.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) console.warn('[vite] OPENAI_API_KEY not found in .env — /api/chat will 500');

  const mountProxy = (server) => {
    const handler = createNodeHandler(apiKey);
    server.middlewares.use('/api/chat', (req, res, next) => {
      if (req.method !== 'POST') return next();
      handler(req, res);
    });
  };

  return {
    plugins: [
      react(),
      {
        name: 'openai-chat-proxy',
        configureServer: mountProxy,
        configurePreviewServer: mountProxy,
      },
    ],
  };
});
