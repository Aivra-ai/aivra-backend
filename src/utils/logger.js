// src/utils/logger.js
module.exports = {
  flaggedEvent: (name, data) => console.log('[FLAGGED]', name, data || {}),
  warn: (...args) => console.warn('[WARN]', ...args),
  info: (...args) => console.log('[INFO]', ...args)
};
