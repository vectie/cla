export class ChatService {
    private socket: WebSocket | null = null;

    constructor(private onMessageReceived: (message: string) => void) {
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket("ws://localhost:18789");

        this.socket.onopen = () => {
            console.log("Connected to chat server:", this.socket?.url);
        };

        this.socket.onmessage = async (event) => {
            const message = await this.readMessage(event.data);
            console.log("Message received:", message);
            this.onMessageReceived(message);
        };

        this.socket.onclose = (event) => {
            console.log("Disconnected from chat server", event);
            setTimeout(() => {
                this.connect();
            }, 1000);
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error", error);
        };
    }

    public sendMessage(message: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
    }

    private async readMessage(data: any): Promise<string> {
        if (typeof data === "string") {
            return data;
        }

        if (data instanceof Blob) {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                        resolve(reader.result);
                    } else {
                        resolve(""); // Return empty string if the result is not a string
                    }
                };
                reader.readAsText(data);
            });
        }

        return ""; // Return empty string for unsupported data types
    }
}
