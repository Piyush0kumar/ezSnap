const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/process-url', (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Call the Python script with the provided URL
  const pythonProcess = spawn('python', ['script.py', url]);

  let resultData = "";

  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString(); // Accumulate JSON result
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const resultJson = JSON.parse(resultData); // Parse JSON response
        console.log("Python Script Result:", resultJson);
        res.json(resultJson); // Send JSON response back to the client
      } catch (error) {
        console.error("Error parsing Python script output:", error);
        res.status(500).json({ error: "Invalid JSON output from Python script" });
      }
    } else {
      console.error(`Python process exited with code ${code}`);
      res.status(500).json({ error: "Python script failed" });
    }
  });
});

app.listen(port, () => {
  console.log(`Node.js server running at http://localhost:${port}`);
});
