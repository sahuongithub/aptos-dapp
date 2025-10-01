const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000; // Change this to use a different local port if needed

app.use(cors());
app.use(express.json());

// GET proxy for summary
app.get('/api/summary', async (req, res) => {
  try {
    const response = await axios.get('https://api.merkle.trade/v1/summary');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// (Optional) POST proxy for trade orders
app.post('/api/trade', async (req, res) => {
  try {
    const response = await axios.post('https://api.merkle.trade/v1/trade', req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
