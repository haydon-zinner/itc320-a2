const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '/')));

// Serve main.html from root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
