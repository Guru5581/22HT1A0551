require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const logger = require('../loggingmiddleware/logger');
const { logEvent } = require('./logService');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "your_token_here"; // Replace with actual token

// Middleware
app.use(bodyParser.json());
app.use(logger);

// In-memory database
const urlDatabase = {};
const statsDatabase = {};

// Create Short URL
app.post('/shorturls', async (req, res) => {
    const { url, validity, shortcode } = req.body;

    if (!url || !validUrl.isUri(url)) {
        await logEvent("backend", "error", "route", "Invalid or missing URL", AUTH_TOKEN);
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    let finalShortcode = shortcode;

    if (shortcode) {
        if (!/^[a-zA-Z0-9]+$/.test(shortcode)) {
            await logEvent("backend", "warn", "route", "Shortcode format invalid", AUTH_TOKEN);
            return res.status(400).json({ error: 'Shortcode must be alphanumeric' });
        }
        if (urlDatabase[shortcode]) {
            await logEvent("backend", "warn", "route", "Shortcode collision", AUTH_TOKEN);
            return res.status(409).json({ error: 'Shortcode already in use' });
        }
    } else {
        do {
            finalShortcode = nanoid(6);
        } while (urlDatabase[finalShortcode]);
    }

    const expiryMinutes = parseInt(validity) || 30;
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

    urlDatabase[finalShortcode] = {
        originalUrl: url,
        expiry: expiryDate.toISOString()
    };
    statsDatabase[finalShortcode] = {
        clicks: 0,
        clicksData: []
    };

    await logEvent("backend", "info", "route", `Short URL created: ${finalShortcode}`, AUTH_TOKEN);

    return res.status(201).json({
        shortLink: `${BASE_URL}/${finalShortcode}`,
        expiry: expiryDate.toISOString()
    });
});

// Redirect to original URL
app.get('/:shortcode', async (req, res) => {
    const { shortcode } = req.params;
    const entry = urlDatabase[shortcode];

    if (!entry) {
        await logEvent("backend", "warn", "route", `Shortcode not found: ${shortcode}`, AUTH_TOKEN);
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    if (new Date() > new Date(entry.expiry)) {
        await logEvent("backend", "warn", "route", `Short link expired: ${shortcode}`, AUTH_TOKEN);
        return res.status(410).json({ error: 'Short link expired' });
    }

    statsDatabase[shortcode].clicks += 1;
    statsDatabase[shortcode].clicksData.push({
        timestamp: new Date().toISOString(),
        referrer: req.get('Referrer') || 'direct',
        geo: 'unknown' // In production, integrate a GeoIP lookup
    });

    await logEvent("backend", "info", "route", `Redirecting ${shortcode} to ${entry.originalUrl}`, AUTH_TOKEN);

    return res.redirect(entry.originalUrl);
});

// Retrieve statistics for a short URL
app.get('/shorturls/:shortcode', async (req, res) => {
    const { shortcode } = req.params;
    const entry = urlDatabase[shortcode];

    if (!entry) {
        await logEvent("backend", "warn", "route", `Stats requested for unknown shortcode: ${shortcode}`, AUTH_TOKEN);
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    await logEvent("backend", "info", "route", `Stats retrieved for ${shortcode}`, AUTH_TOKEN);

    return res.json({
        originalUrl: entry.originalUrl,
        expiry: entry.expiry,
        totalClicks: statsDatabase[shortcode].clicks,
        clicks: statsDatabase[shortcode].clicksData
    });
});

// Global error handler
app.use(async (err, req, res, next) => {
    console.error(err.stack);
    await logEvent("backend", "error", "handler", "Internal Server Error", AUTH_TOKEN);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at ${BASE_URL}`);
});
