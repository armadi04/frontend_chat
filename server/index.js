const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const DATA_FILE = path.join(__dirname, "messages.json");
const MAX_MESSAGES = Number(process.env.MAX_MESSAGES || 200);

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const readMessages = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to read messages", error);
  }
  return [];
};

const persistMessages = (messages) => {
  const limited = messages.slice(-MAX_MESSAGES);
  fs.writeFileSync(DATA_FILE, JSON.stringify(limited, null, 2));
  return limited;
};

const createMessage = ({ username, text }) => {
  const trimmedText = String(text || "").trim();
  const trimmedUsername = String(username || "").trim();

  if (!trimmedUsername) {
    throw new Error("Username is required");
  }

  if (!trimmedText) {
    throw new Error("Message text is required");
  }

  return {
    id: randomUUID(),
    username: trimmedUsername,
    text: trimmedText.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
};

const removeMessage = (messageId) => {
  const messages = readMessages();
  const updated = messages.filter((item) => item.id !== messageId);

  if (updated.length === messages.length) {
    throw new Error("Message not found");
  }

  persistMessages(updated);
  return messageId;
};

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/messages", (req, res) => {
  res.json(readMessages());
});

app.post("/messages", (req, res) => {
  try {
    const message = createMessage(req.body || {});
    const messages = [...readMessages(), message];
    const saved = persistMessages(messages);
    io.emit("message:new", message);
    res.status(201).json({ message, total: saved.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/messages/:id", (req, res) => {
  try {
    const id = removeMessage(req.params.id);
    io.emit("message:deleted", { id });
    res.json({ id });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("message:create", (payload, callback) => {
    try {
      const message = createMessage(payload || {});
      const messages = [...readMessages(), message];
      persistMessages(messages);
      io.emit("message:new", message);
      if (typeof callback === "function") {
        callback({ status: "ok", message });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({ status: "error", error: error.message });
      }
    }
  });

  socket.on("message:delete", (messageId, callback) => {
    try {
      const id = removeMessage(messageId);
      io.emit("message:deleted", { id });
      if (typeof callback === "function") {
        callback({ status: "ok", id });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({ status: "error", error: error.message });
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected", socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`Realtime chat server listening on port ${PORT}`);
});
