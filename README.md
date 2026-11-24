# Pixel Art

[![CI](https://github.com/ruimendes29/pixel-art/actions/workflows/ci.yml/badge.svg)](https://github.com/ruimendes29/pixel-art/actions/workflows/ci.yml)

A free web app for creating pixel art in the browser: draw on a grid, save your artwork, organise it into groups and like other people's creations.

**Live demo:** https://pixel-art-lemon.vercel.app

## Features

- Grid-based pixel editor with a colour picker
- User accounts with JWT authentication and bcrypt-hashed passwords
- Save, list and delete artwork; organise it into groups
- Likes on other users' artwork
- Profile photos (image upload)

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, TypeScript, Redux Toolkit, React Router, React Bootstrap |
| Backend | Node.js, Express, JWT (jose), Multer |
| Database | MySQL |
| Deploy | Vercel (static frontend + serverless API), Aiven MySQL |

## Project structure

```
frontend/   React + TypeScript single-page app
backend/    Express REST API (controllers/, routers/, resources/)
api/        Vercel serverless entry point that runs the backend
```

## Running locally

**Backend**

```bash
cd backend
cp .env.example .env   # fill in your MySQL credentials and a JWT secret
mysql -u <user> -p <database> < schema.sql   # create the tables (first time only)
npm install
npm start
```

The API listens on port 8080 (override with `PORT`). Uploaded images (profile photos and saved canvases) are stored in the database.

**Frontend**

```bash
cd frontend
npm install
npm start
```

The frontend calls `http://localhost:8080/api` by default. To point it at a deployed backend, set `REACT_APP_API_URL` (for example in `frontend/.env`) before `npm start` or `npm run build`.

## Development / Testing

All commands run in `frontend/`.

```bash
npm test                          # Vitest unit tests for the grid helpers
npm run build                     # production build, also used by the E2E tests
npx playwright install chromium   # first time only
npm run test:e2e                  # Playwright E2E tests against the build
```

The Playwright tests serve `build/` on port 4173 and drive the editor as a guest, so they need neither the API nor MySQL; any request to `/api` is intercepted and fails the test. They check that painting a cell changes the canvas pixels, that the eraser clears them, that the eyedropper picks a painted colour and that *Download as PNG* saves a real PNG file. Run `npm run build` again after changing the source.

GitHub Actions (`.github/workflows/ci.yml`) runs the build, Vitest and Playwright (Chromium) on every push and pull request, and uploads the Playwright report when a test fails.

## Deploying

The app is deployed on **Vercel** as a single project: `vercel.json` builds the frontend and serves the backend as a serverless function under `/api`, so both share one address and the frontend calls `/api`.

1. **Database:** any MySQL 8 server; load `backend/schema.sql` once. The live version uses Aiven's free MySQL plan (console.aiven.io). Free Aiven services power off after a period of inactivity; power them back on from the console.
2. **Vercel:** import this repository as a new project (no other settings needed) and add these environment variables from the database's connection information: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL_CA` (the CA certificate, with line breaks written as `\n`) and `TOKEN_KEY` (any long random string).
