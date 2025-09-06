const express = require("express");
const { logEvent } = require("./logger");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Replace with your own token after registration/auth
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.use(express.json());

// In-memory users
const users = [];

// GET /users
app.get("/users", async (req, res) => {
  try {
    res.send({ users });
    await logEvent("backend", "info", "route", "Fetched users successfully", ACCESS_TOKEN);
  } catch (error) {
    await logEvent("backend", "error", "handler", `Error fetching users: ${error.message}`, ACCESS_TOKEN);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// POST /users
app.post("/users", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      await logEvent("backend", "warn", "handler", "Tried to create user with no name", ACCESS_TOKEN);
      return res.status(400).send({ error: "Name is required" });
    }
    const user = { id: users.length + 1, name };
    users.push(user);
    res.status(201).send(user);
    await logEvent("backend", "info", "route", `Created user: ${name}`, ACCESS_TOKEN);
  } catch (error) {
    await logEvent("backend", "error", "handler", `Error creating user: ${error.message}`, ACCESS_TOKEN);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send({ message: "API Running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
