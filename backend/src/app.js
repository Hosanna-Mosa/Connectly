if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const httpStatus = require("http-status");
const http = require("http");
const mongoose = require("mongoose");
const connectToSocket = require("./controllers/socketManger.js");

const cors = require("cors");
const { Server } = require("socket.io");
const userRoutes = require("./routes/userRoutes.js");
const { log } = require("console");
const app = express();
const server = http.createServer(app);
const io = connectToSocket(server);
const dbUrl = process.env.DbUrl;

//------------------------------DataBase Connection------------------------------------

const dataBaseConnection = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database:", err);
    process.exit(1); // Exit if database connection fails
  }
};

dataBaseConnection();

//------------------------------DataBase Connection------------------------------------

app.set("port", process.env.PORT || 8080);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const start = async () => {
  try {
    server.listen(app.get("port"), () => {
      console.log(`Server is running on port ${app.get("port")}`);
     

    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

start();
