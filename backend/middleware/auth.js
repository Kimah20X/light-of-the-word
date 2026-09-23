const jwt = require('jsonwebtoken');

/**
 * verifies the Bearer JWT issued at login. Routes that work
 * fine for offline/anonymous users (none of the core reading features need
 * this) never use this middleware - only cloud sync and the account-bound
 * pieces of the API do.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { requireAuth };
