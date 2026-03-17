// Catch-all Vercel serverless function so `/api/*` reaches the Express app.
const app = require("../server/index");

module.exports = app;
