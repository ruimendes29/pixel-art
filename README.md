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
npm install
node server.js
```

**Frontend**

```bash
cd frontend
npm install
npm start
```
