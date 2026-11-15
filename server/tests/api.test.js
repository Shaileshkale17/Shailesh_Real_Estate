import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { _memoryInquiries } from '../src/store.js';

const app = createApp({ contactLimit: 3 });
const good = { name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210', subject: 'Villa visit', message: 'I would like to visit on Sunday.' };

test('GET /api/health', async () => {
  const r = await request(app).get('/api/health').expect(200);
  assert.equal(r.body.ok, true);
});
test('GET /api/properties returns all with agent joined', async () => {
  const r = await request(app).get('/api/properties').expect(200);
  assert.ok(r.body.length >= 6);
  assert.ok(r.body.every((p) => p.id && p.agent?.name && p.coordinates?.lat));
});
test('properties: search, category and sort', async () => {
  let r = await request(app).get('/api/properties?q=dharampeth').expect(200);
  assert.deepEqual(r.body.map((p) => p.id), ['orange-city-apartment']);
  r = await request(app).get('/api/properties?category=Commercial').expect(200);
  assert.deepEqual(r.body.map((p) => p.id), ['wardha-road-showroom']);
  r = await request(app).get('/api/properties?sort=price-desc').expect(200);
  const prices = r.body.map((p) => p.price);
  assert.deepEqual(prices, [...prices].sort((a, b) => b - a));
  r = await request(app).get('/api/properties?featured=true').expect(200);
  assert.ok(r.body.length && r.body.every((p) => p.featured));
});
test('GET /api/properties/:id found and 404', async () => {
  const r = await request(app).get('/api/properties/lakeview-villa').expect(200);
  assert.equal(r.body.name, 'Lakeview Villa');
  assert.equal(r.body.agent.name, 'Aarav Deshmukh');
  await request(app).get('/api/properties/nope').expect(404);
});
test('GET /api/gallery has images and videos', async () => {
  const r = await request(app).get('/api/gallery').expect(200);
  assert.ok(r.body.some((i) => i.type === 'image') && r.body.some((i) => i.type === 'video'));
});
test('GET /api/company', async () => {
  const r = await request(app).get('/api/company').expect(200);
  assert.equal(r.body.stats.propertiesListed, 420);
});
test('POST /api/contact validates, saves, and rate-limits', async () => {
  const bad = await request(app).post('/api/contact').send({ ...good, email: 'nope' }).expect(400);
  assert.equal(bad.body.errors.email, 'Enter a valid email address');
  await request(app).post('/api/contact').send(good).expect(201);
  assert.equal(_memoryInquiries.length, 1);
  await request(app).post('/api/contact').send(good).expect(201);
  await request(app).post('/api/contact').send(good).expect(429);
});
test('unknown API route returns JSON 404', async () => {
  const r = await request(app).get('/api/xyz').expect(404);
  assert.equal(r.body.error, 'Not found');
});
