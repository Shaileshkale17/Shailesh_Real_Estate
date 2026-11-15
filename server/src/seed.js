import 'dotenv/config';
import mongoose from 'mongoose';
import { connect, seedDatabase } from './store.js';

if (!process.env.MONGODB_URI) { console.error('Set MONGODB_URI first'); process.exit(1); }
await connect(process.env.MONGODB_URI);
await seedDatabase();
console.log('Seeded properties, agents and company');
await mongoose.disconnect();
