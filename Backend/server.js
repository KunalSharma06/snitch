import app from "./src/app.js";
import connectToDatabase from "./src/config/database.js";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3000;
connectToDatabase();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on("joinAdminSupport", () => {
    socket.join("admin-support");
    console.log(`Socket ${socket.id} joined admin-support room`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});