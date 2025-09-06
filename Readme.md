# Backend Logger Example

## Overview

This project demonstrates a simple Express backend for URL shortening, with integrated remote logging using a custom logger middleware. All API events and errors are logged to an external evaluation service.

## Structure

- [`backend/server.js`](backend/server.js): Main Express server with URL shortening, redirection, statistics, and logging.
- [`loggingmiddleware/logger.js`](loggingmiddleware/logger.js): Logger module that sends logs to a remote API.

## Usage

Start the server:
```
node backend/server.js
```

### API Endpoints

- `POST /shorturls`  
  Create a short URL.  
  **Body:** `{ "url": "https://example.com", "validity": 30, "shortcode": "custom123" }`  
  Logs creation and validation events.

- `GET /:shortcode`  
  Redirects to the original URL if valid and not expired.  
  Logs redirection and expiry events.

- `GET /shorturls/:shortcode`  
  Retrieves statistics for a short URL (clicks, expiry, etc).  
  Logs stats retrieval.

## Logging

All significant events and errors are logged using [`loggingmiddleware/logger.js`](loggingmiddleware/logger.js) via the `logEvent` function. Logs are sent to the remote evaluation service.
