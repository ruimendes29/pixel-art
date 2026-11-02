// Vercel serverless entry point: every /api/* request is handled by the
// Express app from backend/ (see vercel.json).
module.exports = require("../backend/app");
