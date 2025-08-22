// server.js
// A simple Express server to serve your frontend files and finalData.json

// 1. Import Express
const express = require("express");

// 2. Create an Express app instance
const app = express();

// 3. Define the port
// process.env.PORT is used by hosting platforms (like Render) to assign a port
// 3000 is used as a fallback when running locally
const PORT = process.env.PORT || 4000;

// 4. Serve static files
// express.static() is middleware that serves all files in a folder
// __dirname refers to the current folder where server.js is located
// This makes your HTML, CSS, JS, images, and finalData.json accessible via the browser
app.use(express.static(__dirname));

// 5. Start the server
// The callback logs a message when the server is running
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Optional: You could add more routes here if needed
// Example: app.get("/api", (req, res) => { res.send("Hello World"); });
