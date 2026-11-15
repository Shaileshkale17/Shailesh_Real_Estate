import mongoose from 'mongoose';
import { Property, Agent, Company, Inquiry } from './models/index.js';
import * as seed from './data/seed.js';

let db = false;
const memoryInquiries = [];
const clean = ({ _id, __v, createdAt, updatedAt, ...rest }) => rest;

export const usingDb = () => db;

/** Connects when a URI is given; otherwise the API serves the bundled seed data (demo mode). */
export async function connect(uri) {
  if (!uri) return false;
  if (mongoose.connection.readyState === 1) return (db = true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return (db = true);
}

async function agentMap() {
  const list = db ? (await Agent.find().lean()).map(clean) : seed.agents;
  return Object.fromEntries(list.map((a) => [a.slug, a]));
}

const shape = (p, agents) => {
  const { slug, agentId, ...rest } = p;
  return { id: slug, ...rest, agent: agents[agentId] || null };
};

export async function listProperties() {
  const agents = await agentMap();
  const rows = db ? (await Property.find().lean()).map(clean) : seed.properties;
  return rows.map((p) => shape(p, agents));
}

export async function getProperty(id) {
  const agents = await agentMap();
  const row = db ? await Property.findOne({ slug: id }).lean() : seed.properties.find((p) => p.slug === id);
  return row ? shape(clean(row), agents) : null;
}

export async function getCompany() {
  if (!db) return seed.company;
  const c = await Company.findOne().lean();
  return c ? clean(c) : seed.company;
}

export async function saveInquiry(data) {
  if (db) return clean((await Inquiry.create(data)).toObject());
  memoryInquiries.push({ ...data, createdAt: new Date().toISOString() });
  return data;
}
export const _memoryInquiries = memoryInquiries;

export async function seedDatabase() {
  await Promise.all([
    ...seed.properties.map((p) => Property.updateOne({ slug: p.slug }, p, { upsert: true })),
    ...seed.agents.map((a) => Agent.updateOne({ slug: a.slug }, a, { upsert: true })),
  ]);
  await Company.deleteMany({});
  await Company.create(seed.company);
}
