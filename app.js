const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const cache = new Map();
const CACHE_DURATION = 1000;

function getCachedData(key, custom_duration) {
  const data = cache.get(key);
  if (data && Date.now() - data.timestamp < (custom_duration || CACHE_DURATION)) {
    return data.value;
  }
  return null;
}

function setCachedData(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now()
  });
}

app.get('/', async (req, res) => {
  res.sendFile("index.html", {
    root: __dirname
  })
});

app.get('/api/games', async (req, res) => {
  try {
    const universeId = req.query.universeId;
    const cacheKey = `games-${universeId}`;
    
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    setCachedData(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching game data:', error);
    res.status(500).json({ error: 'Failed to fetch game data' });
  }
});

app.get('/api/votes', async (req, res) => {
  try {
    const universeId = req.query.universeId;
    const cacheKey = `votes-${universeId}`;
    
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`);
    setCachedData(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

app.get('/api/icon', async (req, res) => {
  try {
    const universeId = req.query.universeId;
    const cacheKey = `icon-${universeId}`;
    
    const cachedData = getCachedData(cacheKey, 50000);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=256x256&format=Png&isCircular=false`
    );
    setCachedData(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching icon:', error);
    res.status(500).json({ error: 'Failed to fetch icon' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
