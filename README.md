# reinigung-primavista
Website for Prima Vista Bio Reinigung (reinigung-primavista.com) — a professional cleaning service offering office cleaning, maintenance cleaning, window cleaning, and deep cleaning.

A single-page German marketing site: **React** (Vite) frontend, **Netlify Functions** backend, **MongoDB** for contact inquiries. Includes a dark/light theme toggle (dark by default) and scroll/entrance animations. Implemented from the Claude Design handoff in `design_extracted/`.

## Run locally

```sh
npm run install:all   # install root and client dependencies
cp .env.example .env  # fill in MONGODB_URI (and ADMIN_TOKEN if needed)
npm run dev           # netlify dev → site + functions on http://localhost:8888
```

`netlify dev` runs the Vite dev server and serves `/api/contact` from the same origin, mirroring production. (If the site is linked via `netlify link`, env vars can come from the Netlify site instead of `.env`.)

UI-only work without the form backend: `npm run dev --prefix client` (Vite on :5173).

## Deploy (Netlify)

`netlify.toml` configures everything — connect the repo and it deploys:

- Build: `client/` → `client/dist` (published as static assets)
- `netlify/functions/contact.mjs` serves `/api/contact`
- `client/public/.well-known/bimi.svg` hosts the BIMI logo; DNS/mail setup steps live in `docs/bimi-setup.md`

Set these environment variables on the Netlify site:

- `MONGODB_URI` — connection string for a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- `ADMIN_TOKEN` — a secret for reading stored inquiries (generate with `openssl rand -hex 32`)
- `IP_HASH_SECRET` — key for hashing client IPs in the contact-form rate limiter (generate with `openssl rand -hex 32`); without it the function falls back to an unkeyed hash and logs a warning

The function caches its Mongoose connection across warm invocations.

### Reading inquiries

`GET /api/contact` returns the 100 newest inquiries and requires the admin token; it denies all requests if `ADMIN_TOKEN` is unset:

```sh
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<your-site>.netlify.app/api/contact
```

## Structure
- `client/` — React 18 + Vite frontend
  - `src/components/` — Header (with theme toggle), Hero, Services, Why, About (count-up stats), Contact (form), Footer
  - `src/styles.css` — design tokens (pine/sage/cream palette), dark theme via `[data-theme="dark"]`, animations
  - `public/` — self-hosted variable fonts, photography, favicon
- `netlify/functions/contact.mjs` — serverless API: `POST /api/contact` (public, stores an inquiry), `GET /api/contact` (token-protected listing)

## CI

GitHub Actions (`.github/workflows/ci.yml`) builds the client on every push and PR to `main`/`development`.

## Notes
- Contact details, stats, and legal links are **placeholders** — swap in real values. `client/public/datenschutz.html` is pre-filled with the details currently available (email, phone, locations); the remaining bracketed items (street address) get filled in once the final company data is available — update the page, don't remove it.
- Theme preference persists in `localStorage`; animations respect `prefers-reduced-motion`.
- Cookie consent is stored with a timestamp and expires after 12 months — the banner then re-asks, and an expired acceptance no longer loads Google Analytics (logic lives in both `CookieConsent.jsx` and the loader in `index.html`).
