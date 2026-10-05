const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Haversine function to compute distance to MG Road (12.9716 N, 77.5946 E)
function calculateDistanceToCityCenter(lat, lon) {
  const R = 6371.0;
  const dLat = (12.9716 - lat) * (Math.PI / 180);
  const dLon = (77.5946 - lon) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * (Math.PI / 180)) *
      Math.cos(12.9716 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

app.post('/api/predict', (req, res) => {
  const payload = req.body;

  // Compute distance to city center automatically
  payload.Distance_to_CityCenter_km = calculateDistanceToCityCenter(
    payload.latitude,
    payload.longitude
  );

  const scriptPath = path.join(__dirname, '../ml-model/predict.py');
  const pythonProcess = spawn('python', [scriptPath, JSON.stringify(payload)]);

  let resultData = '';
  let errorData = '';

  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python Error:', errorData);
      return res.status(500).json({ error: 'Failed to predict price' });
    }
    try {
      const parsedResult = JSON.parse(resultData);
      res.json(parsedResult);
    } catch (err) {
      res.status(500).json({ error: 'Invalid JSON from prediction model' });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Node.js Backend listening at http://localhost:${PORT}`);
});