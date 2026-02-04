import { ipcRenderer } from 'electron'
import type { ProgressInfo } from 'electron-updater'
import { useCallback, useEffect, useState, useRef } from 'react'
import styles from './ChatContainer.module.scss'
import { ChatService } from "@/ChatService";
import { ChatServiceSocketIO } from "@/ChatServiceSocketIO";


const ChatContainer = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const chatServiceRef = useRef<ChatService | null>(null);


    const handleMessageReceived = (message: string) => {
        // console.log("Message received: ", message);
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    // const chatService = new ChatService(handleMessageReceived);
    // const chatService = new ChatServiceSocketIO(handleMessageReceived);

    useEffect(() => {
        if (!chatServiceRef.current) {
            chatServiceRef.current = new ChatService(handleMessageReceived);
        }

        return () => {
            if (chatServiceRef.current) {
                chatServiceRef.current.sendMessage("User has left the chat");
            }
        };
    }, []);

    const handleSendMessage = () => {
        const input = document.getElementById("chatInput") as HTMLInputElement;
        const message = input.value.trim();
        if (message && chatServiceRef.current) {
            chatServiceRef.current.sendMessage(message);
            input.value = "";
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    // Add a helper function to generate random avatars using DiceBear API
    const getAvatarUrl = (seed: string) => {
        return `https://avatars.dicebear.com/api/miniavs/${seed}.svg`;
    };

    return (
        <div className={styles.chatcontainer}>
            <div className="chat-header">
                {/* Chat header elements */}
            </div>
            <div className="chat">
                {messages.map((message, index) => (
                    <div key={index} className="chat-message">
                        <img
                            className="chat-avatar"
                            src={getAvatarUrl(message.slice(0, 3))}
                            alt="Avatar"
                        />
                        <div className="chat-text">{message}</div>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    id="chatInput"
                    type="text"
                    placeholder="Type your message..."
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatContainer