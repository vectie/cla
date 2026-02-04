import React, { useEffect, useState, useRef } from "react";
import {
    Button,
    Slider,
    Layout,
    Input,
    Row,
    Col,
    Checkbox,
    Space,
    Typography as AntTypography,
    Tabs,
    List,
    Upload,
} from "antd";
import 'antd/dist/reset.css';
import styles from "./ChatGLM.module.scss";
import { ChatService } from "@/ChatService";


const { Header, Content } = Layout;
const { Title } = AntTypography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const ChatGLM: React.FC = () => {
    const [inputMessage, setInputMessage] = useState("");
    // const [messages, setMessages] = useState<
    //     Array<{ role: "user" | "bot"; text: string }>
    // >([]);
    const [messages, setMessages] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatServiceRef = useRef<ChatService | null>(null);

    const [maxLength, setMaxLength] = useState(2048);
    const [topP, setTopP] = useState(0.7);
    const [temperature, setTemperature] = useState(0.95);
    const [maxRounds, setMaxRounds] = useState(20);
    const [useStreamChat, setUseStreamChat] = useState(true);

    const handleMessageReceived = (message: string) => {
        // console.log("Message received: ", message);
        const messageObj = JSON.parse(message);
        const responseMessage = messageObj.responseMessage;
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
        scrollToBottom(messagesEndRef);
    };

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

    useEffect(() => {
        scrollToBottom(messagesEndRef);
    }, [messages]);

    const handleSendMessage = () => {
        if (inputMessage && chatServiceRef.current) {
            const jsonMessage = JSON.stringify({
                inputMessage,
                maxLength,
                topP,
                temperature,
                maxRounds,
                useStreamChat,
            });

            chatServiceRef.current.sendMessage(jsonMessage);
            setInputMessage("");
        }
    };

    // Add a helper function to generate random avatars using DiceBear API
    const getAvatarUrl = (seed: string) => {
        return `https://avatars.dicebear.com/api/miniavs/${seed}.svg`;
    };

    const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    };

    return (
        <Layout className={styles.chatcontainer} style={{ minHeight: "100vh" }}>
            <Header className="chat-header">
                <Title level={2} style={{ color: "white" }}>
                    ChatGLM BOT
                </Title>
            </Header>
            <Content style={{ padding: "1rem" }} >
                <Tabs>
                    /**
                    * Chat Tab ******************************************************
                    */
                    <TabPane tab="Chat" key="1">
                        <Row gutter={[16, 24]}>
                            <Col span={24}>
                                <div ref={messagesEndRef} className="chat-list">
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={messages}
                                        renderItem={(item) => (
                                            <List.Item className="chat-list-item" >
                                                <img
                                                    className="chat-avatar"
                                                    src={getAvatarUrl(item.slice(0, 3))}
                                                    alt="Avatar"
                                                />
                                                <div className="chat-text">{item}</div>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                                <Row gutter={16} className="chat-input">
                                    <Col span={20}>
                                        <Input
                                            id="chatInput"
                                            placeholder="Type your message here..."
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onPressEnter={handleSendMessage}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Button
                                            type="primary"
                                            onClick={handleSendMessage}
                                            style={{ width: "100%", height: "100%" }}
                                        >
                                            Send
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                    </TabPane>
                    /**
                    * Settings Tab ******************************************************
                    */
                    <TabPane tab="Settings" key="2">
                        <Row>
                            <Col span={10}>
                                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                    <Title level={4}>Settings</Title>
                                    <div>
                                        <AntTypography>Max Length: </AntTypography>
                                        <Slider
                                            defaultValue={2048}
                                            min={4}
                                            max={4096}
                                            step={4}
                                            marks={{ 4: "4", 4096: "4096" }}
                                            onChange={(value) => setMaxLength(value as number)}
                                        />
                                    </div>
                                    <div>
                                        <AntTypography>Top P: </AntTypography>
                                        <Slider
                                            defaultValue={0.7}
                                            min={0.01}
                                            max={1}
                                            step={0.01}
                                            marks={{ 0.01: "0.01", 1: "1" }}
                                            onChange={(value) => setTopP(value as number)}
                                        />
                                    </div>
                                    <div>
                                        <AntTypography>Temperature: </AntTypography>
                                        <Slider
                                            defaultValue={0.95}
                                            min={0.01}
                                            max={1}
                                            step={0.01}
                                            marks={{ 0.01: "0.01", 1: "1" }}
                                            onChange={(value) => setTemperature(value as number)}
                                        />
                                    </div>
                                    <div>
                                        <AntTypography>Max Rounds: </AntTypography>
                                        <Slider
                                            defaultValue={20}
                                            min={1}
                                            max={100}
                                            step={1}
                                            marks={{ 1: "1", 100: "100" }}
                                            onChange={(value) => setMaxRounds(value as number)}
                                        />
                                    </div>
                                    <Checkbox defaultChecked checked={useStreamChat} onChange={(e) => setUseStreamChat(e.target.checked)}
                                    >Use Stream Chat</Checkbox>
                                </Space>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Content>
        </Layout>
    );
};

export default ChatGLM;