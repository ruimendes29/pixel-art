# Pixel Art

A free web app for creating pixel art in the browser: draw on a grid, save your artwork, organise it into groups and like other people's creations.

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
| Backend | Node.js, Express, JWT, Multer |
| Database | MySQL |
| Deploy | Google App Engine (frontend) |

## Project structure

```
frontend/   React + TypeScript single-page app
backend/    Express REST API (controllers/, routers/, resources/)
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

The API listens on port 8080 (override with `PORT`). Uploaded images are stored in `backend/uploads/`.

**Frontend**

```bash
cd frontend
npm install
npm start
```

The frontend calls `http://localhost:8080/api` by default. To point it at a deployed backend, set `REACT_APP_API_URL` (for example in `frontend/.env`) before `npm start` or `npm run build`.

## Deploying

1. **Database:** any MySQL 8 server. Load `backend/schema.sql` once.
2. **Backend:** run it on a host that keeps files on disk between restarts (uploaded images are saved to `backend/uploads/`), with the `.env` variables set. Serve it over **HTTPS**: browsers block an HTTPS page from calling an HTTP API.
3. **Frontend:** build with the backend's address, then deploy the `build/` folder:

   ```bash
   cd frontend
   REACT_APP_API_URL=https://your-backend.example.com/api npm run build
   gcloud app deploy app.yaml
   ```
