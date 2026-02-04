const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

const clients = new Set();

server.on("connection", (socket) => {
    clients.add(socket);
    console.log(
        `Client connected from ${socket._socket.remoteAddress}:${socket._socket.remotePort}, total clients: ${clients.size}`
    );

    // Broadcast incoming messages to all clients except the sender
    socket.on("message", (message) => {
        console.log("Received message from client:", socket._socket.remoteAddress, message);
        for (const client of clients) {
            console.log("Sending message to client:", client._socket.remoteAddress);
            if (client.readyState === WebSocket.OPEN) { // client !== socket && 
                client.send(message);
            }
        }
    });

    // Handle disconnection
    socket.on('close', () => {
        clients.delete(socket);
        console.log('Client disconnected');
    });
});

console.log('Chat server running on port 8080');


// const http = require("http");
// const { Server } = require("socket.io");

// const server = http.createServer();
// const io = new Server(server, {
//     cors: {
//         origin: "*", // Adjust this to match your frontend's origin for security purposes
//         methods: ["GET", "POST"],
//     },
// });

// io.on("connection", (socket) => {
//     // console.log(
//     //     `Client connected from ${socket._socket.remoteAddress}:${socket._socket.remotePort}, total clients: ${clients.size}`
//     // );
//     socket.on("message", (message) => {
//         // console.log("Received message from client:", socket._socket.remoteAddress, message);
//         socket.broadcast.emit("message", message);
//     });

//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//     });
// });

// const PORT = 8080;
// server.listen(PORT, () => {
//     console.log(`Chat server running on port ${PORT}`);
// });
