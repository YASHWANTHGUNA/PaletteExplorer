const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Use the CORS middleware
app.use(cors());

// --- Serve static files from the frontend directory ---
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Load palettes from JSON file ---
let serverPalettes = {};
try {
  const palettesData = fs.readFileSync(path.join(__dirname, 'palettes.json'), 'utf8');
  serverPalettes = JSON.parse(palettesData);
  console.log('Successfully loaded palettes from palettes.json');
} catch (err) {
  console.error('Error reading or parsing palettes.json:', err);
  // In case of an error, the server will run with empty palettes.
  // A more robust solution might be to exit or use a default set.
}

// Define the API endpoint that the frontend will call
app.get('/api/palettes/:mood', (req, res) => {
  const mood = req.params.mood;
  // For demonstration, let's send a subset or all of the serverPalettes
  // In a real app, you might fetch new ones from a database or generate them
  const allPalettesForMood = serverPalettes[mood] || [];
  // Send a random subset or all, depending on desired behavior
  const palettes = allPalettesForMood.slice(0, Math.min(allPalettesForMood.length, 4)); // Send up to 4 new palettes
  console.log(`Request received for mood: ${mood}. Sending ${palettes.length} palettes.`);
  res.json(palettes);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log('You can now view the app in your browser at this address.');
});