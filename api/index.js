// Vercel serverless entry: all /api/* requests are rewritten here (see vercel.json)
import { createApp } from '../server/src/app.js';
import { connect } from '../server/src/store.js';

const app = createApp();
let ready;
export default async function handler(req, res) {
  ready ??= connect(process.env.MONGODB_URI).catch((e) => console.error('DB connect failed', e.message));
  await ready;
  return app(req, res);
}
