const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // You can change this port as needed

// Define environment variables
const environmentVariables = {
    EXERCISE_API_KEY: process.env.EXERCISE_API_KEY,
    FOOD_API_KEY: process.env.FOOD_API_KEY,
    FB_API_KEY: process.env.FB_API_KEY,
    FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
    FB_PROJECT_ID: process.env.FB_PROJECT_ID,
    FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
    FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
    FB_APP_ID: process.env.FB_APP_ID,
    FB_MEASUREMENT_ID: process.env.FB_MEASUREMENT_ID
};

// Serve a JavaScript file containing environment variables
app.get('/env.js', (req, res) => {
    res.type('application/javascript');
    res.send(`window.env = ${JSON.stringify(environmentVariables)};`);
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
