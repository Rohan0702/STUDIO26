const app = require('../OTP-Authentication/server');

// Vercel serverless handler — export the Express app directly.
// Vercel automatically wraps this into a serverless function.
module.exports = app;
