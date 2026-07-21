let app;

try {
  app = require('../OTP-Authentication/server');
} catch (err) {
  // If the Express app fails to load, create a minimal handler
  // that returns the actual error so we can debug on Vercel
  console.error('[VERCEL INIT ERROR]', err.stack || err.message);
  app = (req, res) => {
    res.status(500).json({
      error: 'Function initialization failed',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  };
}

module.exports = app;
