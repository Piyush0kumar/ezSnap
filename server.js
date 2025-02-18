const express = require("express");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const database = require("./database"); // Import the database connection
const useragent = require("user-agent");

const app = express();
const port = 5000;


function deleteFilesByExtension(directory, extensions) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const fileExt = path.extname(file);

      if (extensions.includes(fileExt)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Failed to delete ${filePath}:`, err);
          else console.log(`Deleted: ${filePath}`);
        });
      }
    });
  });
}

app.use(cors());
app.use(bodyParser.json());

app.post("/process-url", (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  //---------SQL-------//
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const agent = useragent.parse(req.headers["user-agent"]);
  const deviceType = agent.isMobile ? "Phone" : "PC";

  // Store the actual entered URL in the database
  const query = "INSERT INTO user_logs (ip_address, device_type, url_accessed) VALUES (?, ?, ?)";
  database.query(query, [ip, deviceType, url], (err) => {
    if (err) console.error("Database Error:", err);
  });

  const pythonProcess = spawn("python", ["script.py", url]);
  let resultData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      try {
        const resultJson = JSON.parse(resultData.trim());
        console.log("Python Script Result:", resultJson);

        // Delete all `.xz` and `.txt` files in `dump` folder
        deleteFilesByExtension("dump", [".xz", ".txt"]);

        res.json({
          ...resultJson,
          operation_status: true,
        });
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




// Route to serve files for download
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "dump", req.params.filename);

  // Check if the file exists before sending
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).json({ error: "Error downloading file" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js server running at http://localhost:${port}`);
});