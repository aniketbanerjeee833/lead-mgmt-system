
// socket.js
let io;
let connectedAdmins = {}; // { adminId: socketId }
let connectedUsers = {};  // { userId: socketId }

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Client registers itself (after login)
    socket.on("register", ({ id, role }) => {
      if (role === "admin") {
        connectedAdmins[id] = socket.id;
        console.log(`🟢 Admin registered: ${id}`);
      } else {
        connectedUsers[id] = socket.id;
        console.log(`🔵 User registered: ${id}`);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);

      // Remove from admins
      for (let adminId in connectedAdmins) {
        if (connectedAdmins[adminId] === socket.id) {
          delete connectedAdmins[adminId];
          console.log(`Admin ${adminId} removed`);
        }
      }

      // Remove from users
      for (let userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          console.log(`User ${userId} removed`);
        }
      }
    });
  });

  return io;
}

// 🔹 Utility: notify a specific admin
function notifyAdmin(adminId, event, data) {
  if (!io) {
    console.log("⚠️ Socket.io not initialized");
    return;
  }
  const adminSocketId = connectedAdmins[adminId];
  if (adminSocketId) {
    io.to(adminSocketId).emit(event, data);
    console.log(`📢 Sent ${event} to admin ${adminId}`);
  } else {
    console.log(`⚠️ Admin ${adminId} not connected`);
  }
}

module.exports = { initSocket, notifyAdmin };
