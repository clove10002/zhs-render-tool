const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/extract-and-download', async (req, res) => {
    const pageUrl = req.query.url;
    if (!pageUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // 1. Scrape Mediafire page
        const response = await axios.get(pageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const directLink = $('a#downloadButton').attr('href');

        if (!directLink) {
            return res.status(404).json({ error: 'Download link not found' });
        }

        // 2. Stream file directly to client
        const fileResponse = await axios.get(directLink, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const fileName = directLink.split('/').pop() || 'download.file';
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', fileResponse.headers['content-type'] || 'application/octet-stream');

        fileResponse.data.pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
