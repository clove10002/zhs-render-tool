const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/download', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        const filename = path.basename(fileUrl.split('?')[0]) || 'downloaded_file';

        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const filePath = path.join(__dirname, filename);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            res.download(filePath, filename, () => {
                fs.unlinkSync(filePath);
            });
        });
        writer.on('error', () => {
            res.status(500).json({ error: 'File download failed' });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
