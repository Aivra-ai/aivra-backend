// src/routes/chat.js
const express = require('express');
const router = express.Router();
const { generateReply } = require('../openaiService');
const safetyMiddleware = require('../safetyMiddleware');

const conversations = {};

router.post('/:chatId/message', safetyMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId || 'default';
    const text = (req.body && (req.body.message || req.body.text)) || '';
    conversations[chatId] = conversations[chatId] || [];
    conversations[chatId].push({ id: Date.now(), role: 'user', text });
    const result = await generateReply(text);
    const reply = { id: Date.now()+1, role: 'assistant', text: result.text || '' };
    conversations[chatId].push(reply);
    return res.status(200).json({ ok: true, reply: reply.text, meta: { model: result.model || 'mock' } });
  } catch (err) {
    console.error('Chat route error:', err?.message);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

module.exports = router;
