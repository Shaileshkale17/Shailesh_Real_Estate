# XYZ Real Estate (MERN)

React + Vite + Framer Motion + Leaflet (client) · Express + Mongoose (API) · Vercel.

## Run locally
```bash
npm install && npm install --prefix client
cp .env.example .env            # add MONGODB_URI (optional: without it the API serves built-in demo data)
npm run seed                    # only when MONGODB_URI is set
npm run dev:server              # http://localhost:5000/api
npm run dev:client              # http://localhost:5173 (proxies /api)
```
## Test
```bash
npm test            # API + shared logic (node:test + supertest)
npm run test:client # components, hero video states, forms (vitest)
```
## Deploy (Vercel)
Import the repo root. `vercel.json` builds `client/` and rewrites `/api/*` to `api/index.js`.
Set `MONGODB_URI` (and optionally `CLIENT_ORIGIN`) in Project Settings. Leave `VITE_API_URL` empty.
Replace `VITE_HERO_VIDEO` and the `video` / `images` fields in `server/src/data/seed.js` with your real media (host videos on a CDN, not in git).
