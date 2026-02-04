import { io, Socket } from "socket.io-client";

export class ChatServiceSocketIO {
    private socket: Socket;

    constructor(private onMessageReceived: (message: string) => void) {
        this.socket = io("http://localhost:8080");

        this.socket.on("connect", () => {
            console.log("Connected to chat server");
        });

        this.socket.on("message", (message: string) => {
            console.log("Message received:", message);
            this.onMessageReceived(message);
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from chat server");
        });
    }

    sendMessage(message: string): void {
        this.socket.emit("message", message);
    }
}
