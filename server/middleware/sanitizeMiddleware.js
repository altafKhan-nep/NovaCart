const sanitizeHtml = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeHtml(obj.trim());
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

const NOSQL_PATTERNS = [
  /\$where/i,
  /\$gt/i,
  /\$gte/i,
  /\$lt/i,
  /\$lte/i,
  /\$ne/i,
  /\$in/i,
  /\$nin/i,
  /\$regex/i,
  /\$or/i,
  /\$and/i,
  /\$not/i,
  /\$nor/i,
  /\$exists/i,
  /\$type/i,
  /\$mod/i,
  /\$text/i,
  /\$expr/i,
  /\$jsonSchema/i,
  /\$all/i,
  /\$elemMatch/i,
  /\$size/i,
  /\$slice/i,
];

const containsNoSqlInjection = (value) => {
  if (typeof value !== 'string') return false;
  return NOSQL_PATTERNS.some((pattern) => pattern.test(value));
};

const checkNoSqlPatterns = (obj) => {
  if (obj === null || obj === undefined) return false;
  if (typeof obj === 'string') return containsNoSqlInjection(obj);
  if (Array.isArray(obj)) return obj.some(checkNoSqlPatterns);
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (NOSQL_PATTERNS.some((p) => p.test(key))) return true;
      if (checkNoSqlPatterns(value)) return true;
    }
  }
  return false;
};

const preventInjection = (req, res, next) => {
  if (req.body && checkNoSqlPatterns(req.body)) {
    return res.status(400).json({ message: 'Invalid input detected' });
  }
  if (req.query && checkNoSqlPatterns(req.query)) {
    return res.status(400).json({ message: 'Invalid query parameters detected' });
  }
  if (req.params && checkNoSqlPatterns(req.params)) {
    return res.status(400).json({ message: 'Invalid parameters detected' });
  }
  next();
};

const ObjectId = require('mongoose').Types.ObjectId;

const validateObjectId = (req, res, next) => {
  const idParams = ['id'];
  for (const param of idParams) {
    if (req.params[param]) {
      if (!ObjectId.isValid(req.params[param]) || String(new ObjectId(req.params[param])) !== req.params[param]) {
        return res.status(400).json({ message: `Invalid ${param} format` });
      }
    }
  }
  next();
};

module.exports = { sanitizeInput, preventInjection, validateObjectId };
