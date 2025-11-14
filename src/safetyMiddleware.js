// src/safetyMiddleware.js
const axios = require('axios');

let flaggedEvent = () => {};
let warn = (...args) => console.warn(...args);
let info = (...args) => console.log(...args);
let refusal_unethical = "Sorry, I can’t help with that.";
let seek_human_help_short = "If you're thinking about harming yourself, please contact local emergency services or someone you trust right now.";

try { Object.assign(global, require('./utils/logger')); } catch(e) {}
try { Object.assign(global, require('./sampleResponses')); } catch(e) {}

const selfHarmPatterns = [/\bkill myself\b/i,/\bsuicid(e|al)\b/i,/\bhurt myself\b/i,/\bi want to die\b/i,/\bend my life\b/i];
const unethicalPatterns = [/\b(porn|pornography)\b/i,/\b(child sex|sexual act with minor)\b/i,/\b(how to make a bomb|explosive|detonate)\b/i];

function textSnippet(text, length = 300) { if (!text) return ''; return text.length > length ? text.slice(0, length) + '...' : text; }

async function callOpenAIModeration(text) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) throw new Error('Missing OPENAI_API_KEY for moderation');
  const url = 'https://api.openai.com/v1/moderations';
  const resp = await axios.post(url, { model: process.env.MODERATION_MODEL || 'omni-moderation-latest', input: text }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } });
  const result = resp.data?.results?.[0] || {};
  const categories = result.categories || {};
  const flagged = (typeof result.flagged === 'boolean' && result.flagged) || Object.values(categories).some(Boolean);
  return { flagged, categories };
}

module.exports = async function safetyMiddleware(req, res, next) {
  try {
    const text = (req.body && (req.body.message || req.body.text)) || '';
    if (!text) return next();
    for (const p of selfHarmPatterns) if (p.test(text)) return res.status(200).json({ safe: false, action: 'seek_help', message: seek_human_help_short });
    for (const p of unethicalPatterns) if (p.test(text)) return res.status(200).json({ safe: false, action: 'refuse_unethical', message: refusal_unethical });
    if (process.env.MODERATION_API_ENABLED === 'true') {
      try {
        const mod = await callOpenAIModeration(text);
        if (mod.flagged) return res.status(200).json({ safe: false, action: 'refuse_unethical', message: refusal_unethical });
      } catch (e) { warn('Moderation API failed; allowing content to proceed (fallback).', e?.message); }
    }
    return next();
  } catch (err) {
    warn('Safety middleware error, proceeding: ' + (err?.message));
    return next();
  }
};
