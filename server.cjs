// server.cjs - main server
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Basic health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Mount chat routes
const chatRoutes = require('./src/routes/chat');
app.use('/api/chats', chatRoutes);

// Fallback
app.use((req, res) => res.status(404).json({ error: 'not_found' }));

app.listen(port, () => {
  console.log(`Aivra backend listening on port ${port}`);
});
