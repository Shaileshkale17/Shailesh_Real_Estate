import 'dotenv/config';
import { createApp } from './app.js';
import { connect } from './store.js';

try {
  const live = await connect(process.env.MONGODB_URI);
  console.log(live ? 'MongoDB connected' : 'No MONGODB_URI set: serving demo data');
} catch (e) {
  console.error('MongoDB connection failed, serving demo data:', e.message);
}
const port = process.env.PORT || 5000;
createApp().listen(port, () => console.log(`API on http://localhost:${port}/api`));
