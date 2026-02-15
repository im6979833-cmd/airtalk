const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const ROOM = "airtalk";

io.on("connection", (socket) => {

    socket.join(ROOM);

    const clients = Array.from(io.sockets.adapter.rooms.get(ROOM) || []);
    console.log("Connected:", socket.id, "Clients:", clients.length);

    if (clients.length === 1) {
        socket.emit("role", "offerer");
    }

    if (clients.length === 2) {
        const [first, second] = clients;

        io.to(first).emit("role", "offerer");
        io.to(second).emit("role", "answerer");

        io.to(first).emit("peer-ready");
    }

    socket.on("offer", (offer) => {
        socket.to(ROOM).emit("offer", offer);
    });

    socket.on("answer", (answer) => {
        socket.to(ROOM).emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
        socket.to(ROOM).emit("ice-candidate", candidate);
    });

    socket.on("chat-message", (msg) => {
        socket.to(ROOM).emit("chat-message", msg);
    });

    socket.on("disconnect", () => {
        socket.to(ROOM).emit("peer-disconnected");
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
