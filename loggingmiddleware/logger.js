const axios = require("axios");

const BASE_URL = "http://20.244.56.144/evaluation-service/logs";

/**
 * Send a log event to the remote Log API
 * @param {string} stack Example: "backend"
 * @param {string} level One of: "error", "warn", "info", "fatal", "debug"
 * @param {string} pkg Context/package. Example: "route" or "handler"
 * @param {string} message Text to log
 * @param {string} token Bearer token string
 */
async function logEvent(stack, level, pkg, message, token) {
  try {
    await axios.post(
      BASE_URL,
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    // Optionally: console.log("Log sent:", level, pkg, message);
  } catch (err) {
    console.error("Log failed:", err.message);
  }
}

module.exports = { logEvent };
