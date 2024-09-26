require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const CustomError = require("./utils/customError");

const userRoutes = require("./routes/user");

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use(userRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `This route : ${req.url} not found` });
});

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("userJoined", { id: socket.id, username });
  });

  socket.on("message", (message) => {
    const username = users[socket.id];
    io.emit("message", { username, message });
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("userLeft", { id: socket.id, username });
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.DB_URL)
  .then(async () => {
    try {
      server.listen(process.env.PORT || PORT, () => {
        console.log(
          `Server started at http://localhost:${process.env.PORT || PORT}/`
        );
      });
    } catch (error) {
      console.error("Error during server initialization:", error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

module.exports = app;
