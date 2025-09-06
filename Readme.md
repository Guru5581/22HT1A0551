# Backend Logger Example

## Overview

This project demonstrates a simple Express backend with integrated remote logging using a custom logger middleware. All API events and errors are logged to an external evaluation service.

## Structure

- [`backend/server.js`](backend/server.js): Main Express server with user management routes and logging.
- [`loggingmiddleware/logger.js`](loggingmiddleware/logger.js): Logger module that sends logs to a remote API.

## Setup

1. **Clone the repository**
git clone https://github.com/yourusername/backend-logger-example.git cd backend-logger-example


2. **Install dependencies**
npm install

3. **Configure environment**
- Add your access token to the `.env` file:
  ```
  ACCESS_TOKEN=your_token_here
  ```

## Usage

Start the server:

node server.js

### API Endpoints

- `GET /users`  
  Returns the list of users. Logs the event remotely.

- `POST /users`  
  Creates a new user. Requires `{ "name": "username" }` in the request body. Logs creation and validation events.

- `GET /`  
  Health check endpoint.

## Logging

All significant events and errors are logged using [`loggingmiddleware/logger.js`](loggingmiddleware/logger.js) via the [`logEvent`](loggingmiddleware/logger.js) function. Logs are sent to the remote evaluation service.

## License

MIT