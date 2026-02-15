const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let onlineUsers = {};
let userCounter = 0; // Brojač korisnika

io.on("connection", (socket) => {

    // Povećaj brojač
    userCounter++;

    // Dodaj korisnika sa numeracijom
    onlineUsers[socket.id] = {
        id: socket.id,
        name: "Korisnik " + userCounter
    };

    // Pošalji svima update liste
    io.emit("online-users", Object.values(onlineUsers));

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        io.emit("online-users", Object.values(onlineUsers));
    });

    socket.on("call-request", () => {
        socket.broadcast.emit("incoming-call");
    });

    socket.on("call-accepted", () => {
        socket.broadcast.emit("call-accepted");
    });

    socket.on("call-declined", () => {
        socket.broadcast.emit("call-declined");
    });
    socket.on("call-cancelled", () => {
    socket.broadcast.emit("call-cancelled");
});

    socket.on("call-ended", () => {
        socket.broadcast.emit("call-ended");
    });

    socket.on("offer", (offer) => {
        socket.broadcast.emit("offer", offer);
    });

    socket.on("answer", (answer) => {
        socket.broadcast.emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
        socket.broadcast.emit("ice-candidate", candidate);
    });

    socket.on("chat-message", (msg) => {
        socket.broadcast.emit("chat-message", msg);
    });

});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
