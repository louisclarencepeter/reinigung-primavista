# reinigung-primavista
Website for Prima Vista Bio Reinigung (reinigung-primavista.com) — a professional cleaning service offering office cleaning, maintenance cleaning, window cleaning, and deep cleaning.

A single-page German marketing site built on the **MERN stack** (MongoDB, Express, React, Node.js), with a working contact form that persists inquiries to MongoDB. Includes a dark/light theme toggle (dark by default) and scroll/entrance animations. Implemented from the Claude Design handoff in `design_extracted/`.

## Run locally

```sh
npm run install:all   # install root, server, and client dependencies
npm run dev           # API on :5001 + Vite dev server on :5173
```

Without `MONGODB_URI` set, the API uses an in-memory MongoDB so everything works out of the box (data is not persisted across restarts). For real persistence, copy `server/.env.example` to `server/.env` and set `MONGODB_URI` (e.g. a MongoDB Atlas cluster).

## Deploy (Netlify)

The site deploys to Netlify as a static client plus one serverless function — no running server needed. `netlify.toml` configures everything:

- Build: `client/` → `client/dist` (published as static assets)
- `netlify/functions/contact.mjs` serves `POST /api/contact` (same URL the client uses in dev, so no client changes)

Setup: create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and set these environment variables on the Netlify site:

- `MONGODB_URI` — the Atlas connection string
- `ADMIN_TOKEN` — a secret for reading stored inquiries (generate with `openssl rand -hex 32`)

The function caches its Mongoose connection across warm invocations.

### Reading inquiries

`GET /api/contact` returns the 100 newest inquiries and requires the admin token; it denies all requests if `ADMIN_TOKEN` is unset:

```sh
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<your-site>.netlify.app/api/contact
```

### Self-hosted production (alternative)

```sh
npm run build   # build the React client to client/dist
npm start       # Express serves the API + built client on :5001
```

## Structure
- `client/` — React 18 + Vite frontend
  - `src/components/` — Header (with theme toggle), Hero, Services, Why, About (count-up stats), Contact (form), Footer
  - `src/styles.css` — design tokens (pine/sage/cream palette), dark theme via `[data-theme="dark"]`, animations
  - `public/` — self-hosted variable fonts, photography, favicon
- `netlify/functions/contact.mjs` — serverless contact endpoint used in production (Netlify)
- `server/` — Express + Mongoose API for local development
  - `POST /api/contact` — validate and store a contact inquiry
  - `GET /api/contact` — list stored inquiries (newest first)
  - `GET /api/health` — health check

## Notes
- Contact details, stats, and social/legal links are **placeholders** — swap in real values.
- Theme preference persists in `localStorage`; animations respect `prefers-reduced-motion`.
