import { sanitizeBackendValue } from '../utils/sanitize.js';

/**
 * Express middleware to sanitize req.body, req.query, and req.params against XSS attacks.
 */
export const xssSanitizerMiddleware = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeBackendValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeBackendValue(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeBackendValue(req.params);
    }
  } catch (err) {
    // If sanitization fails, pass error along
    return next(err);
  }
  next();
};
