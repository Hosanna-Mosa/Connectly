const { Server } = require("socket.io");

let connections = {};
let messages = {};
let timeOnline = {};

module.exports = connectToSocket = (server) => {
  
    const io = new Server(server, {
        cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT"],
      allowedHeaders: "*",
      credentials: true,
    },
    });

    io.on("connection", (socket) => {
      console.log(`User Connected.. ${socket.id}`);
      
    socket.on("join-call", (roomId) => {
      if (connections[roomId] === undefined) {
        connections[roomId] = [];
      }

      // Adding User to room id
      connections[roomId].push(socket.id);

      //Adding User TimeOnline
      timeOnline[socket.id] = new Date();

      // Sending Notifications to existing users
      for (let i = 0; i < connections[roomId].length; i++) {
        io.to(connections[roomId][i]).emit(
          "user-joined",
          socket.id,
          connections[roomId]
        );
      }

      //Sending Prevous Chat to Newly Joined User
      if (messages[roomId] !== undefined) {
        for (let a = 0; a < messages[roomId].length; a++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[roomId][a]["data"],
            messages[roomId][a]["sender"],
            messages[roomId][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      //To Store User Room id
      let matchingRoom = "";
      let found = false;

      //To find User Room Id to send data
      for (const [roomIds, roomUsers] of Object.entries(connections)) {
        if (roomUsers.includes(socket.id)) {
          matchingRoom = roomIds;
          found = true;
          break;
        }
      }

      if (found === true) {
        if (messages[matchingRoom] === undefined) messages[matchingRoom] = [];
      }

      //Storing User Data
      messages[matchingRoom].push({
        sender: sender,
        data: data,
        "socket-id-sender": socket.id,
      });

      //Chat message to Every in that room
      connections[matchingRoom].forEach((element) => {
        io.to(element).emit("chat-message", data, sender, socket.id);
        });
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected.. ${socket.id}`);
      
      //To Find User time online
      let diffTime = Math.abs(timeOnline[socket.id] - new Date());
      let key;

      //To find User Room Id
      for (const [roomIds, roomUsers] of Object.entries(connections)) {
        if (roomUsers.includes(socket.id)) {
          key = roomIds;
        }
      }

      //To Send Notify to Remaining Users to User left
      for (let i = 0; i < connections[key].length; i++) {
        io.to(connections[key][i]).emit("user-left", socket.id);
}

      //Remove User from connections
      var index = connections[key].indexOf(socket.id);
      connections[key].splice(index, 1);

      //if No Users yet Delete Room
      if (connections[key].length === 0) {
        delete connections[key];
      }
    });
  });

  return io;
};
