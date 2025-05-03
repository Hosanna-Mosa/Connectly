if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const httpStatus = require("http-status");
const http = require("http");
const mongoose = require("mongoose");
const connectToSocket = require("./src/controllers/socketManger.js");

const cors = require("cors");
const { Server } = require("socket.io");
const userRoutes = require("./src/routes/userRoutes.js");
const { log } = require("console");
const { awaitLazyProperties } = require("create");
const app = express();
const server = http.createServer(app);
const io = connectToSocket(server);
const dbUrl = process.env.DbUrl;

//------------------------------DataBase Connection------------------------------------

const dataBaseConnection = async () => {
  await mongoose.connect(dbUrl);
};

dataBaseConnection()
  .then(() => {
    console.log("DataBase Connected");
  })
  .catch((err) => {
    console.log("Error to connect db " + err);
  });

//------------------------------DataBase Connection------------------------------------


app.set("port", process.env.PORT || 8080);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/users", userRoutes);

const start = async () => {
  app.set("mongo_user");
  
  server.listen(app.get("port"), () => {
    console.log("LISTENING ON PORT 8080");
  });
};

start();
