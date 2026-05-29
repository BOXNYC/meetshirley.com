import { createNodeHandler } from '../server/chatHandler.js';

/**
 * Vercel serverless function for POST /api/chat.
 * Reads OPENAI_API_KEY from process.env — set that in:
 *   Vercel dashboard -> Project -> Settings -> Environment Variables
 */
export default createNodeHandler();
