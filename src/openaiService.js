// src/openaiService.js
const axios = require('axios');

async function generateReply(prompt) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
  if (!OPENAI_KEY) {
    return { text: `Mock reply (offline): I heard you say "${String(prompt).slice(0,120)}"`, model: 'mock-offline' };
  }

  try {
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: String(prompt) }],
      max_tokens: 300
    };
    const resp = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      timeout: 20000
    });
    const choice = resp.data?.choices?.[0];
    const text = choice?.message?.content || choice?.text || '';
    return { text: String(text), model: payload.model };
  } catch (e) {
    console.error('OpenAI call failed:', e?.message);
    return { text: `Sorry, I'm having trouble reaching the AI service right now.`, model: 'error' };
  }
}

module.exports = { generateReply };
