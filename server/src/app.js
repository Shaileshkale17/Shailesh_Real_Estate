import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { filterProperties } from '../../shared/filter.js';
import { validateContact } from '../../shared/validate.js';
import * as store from './store.js';

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export function createApp({ contactLimit = 10 } = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  const origins = process.env.CLIENT_ORIGIN?.split(',').map((s) => s.trim());
  app.use(cors({ origin: origins?.length ? origins : true }));
  app.use(express.json({ limit: '20kb' }));

  const api = express.Router();
  api.get('/health', (_req, res) => res.json({ ok: true, database: store.usingDb() ? 'mongodb' : 'demo-data' }));

  api.get('/properties', wrap(async (req, res) => {
    const { q, category, type, sort, featured } = req.query;
    const all = await store.listProperties();
    res.json(filterProperties(all, { q, category, type, sort, featured: featured === 'true' }));
  }));

  api.get('/properties/:id', wrap(async (req, res) => {
    const p = await store.getProperty(req.params.id);
    if (!p) return res.status(404).json({ error: 'Property not found' });
    res.json(p);
  }));

  api.get('/gallery', wrap(async (_req, res) => {
    const items = (await store.listProperties()).flatMap((p) => [
      ...p.images.map((src, i) => ({ id: `${p.id}-img-${i}`, propertyId: p.id, propertyName: p.name, type: 'image', src })),
      ...(p.video ? [{ id: `${p.id}-video`, propertyId: p.id, propertyName: p.name, type: 'video', src: p.video, poster: p.images[0] }] : []),
    ]);
    res.json(items);
  }));

  api.get('/company', wrap(async (_req, res) => res.json(await store.getCompany())));

  api.post('/contact', rateLimit({ windowMs: 60_000, limit: contactLimit, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages. Try again in a minute.' } }),
    wrap(async (req, res) => {
      const { values, errors } = validateContact(req.body);
      if (Object.keys(errors).length) return res.status(400).json({ error: 'Check the highlighted fields', errors });
      await store.saveInquiry(values);
      res.status(201).json({ ok: true });
    }));

  api.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use('/api', api);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.status && err.status < 500 ? err.message : 'Something went wrong on our side' });
  });
  return app;
}
