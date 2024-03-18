const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // You can change this port as needed

// Serve the data.js file
app.get('/data.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.js'));
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
