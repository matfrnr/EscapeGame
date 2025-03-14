import { useState, useEffect, useRef } from "react";
import { socket } from "../../socket.js"
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import TextInputWithButton from "../ui/TextInputWithButton.jsx";

const Chat = ({ groupCode }) => {
    const { groupMembers, groupName } = useLobby(); // Access group members and name
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const { userInfo } = useAuth();
    const chatContainerRef = useRef(null); // For auto-scrolling

    useEffect(() => {
        socket.emit("join_chat", { code: groupCode, id: userInfo.id, username: userInfo.username });

        socket.on("load_messages", (loadedMessages) => {
            setMessages(loadedMessages);
            scrollToBottom(); // Auto-scroll after loading messages
        });

        const handleMessageReceive = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            scrollToBottom(); // Auto-scroll after receiving a new message
        };

        socket.on("chat_message", handleMessageReceive);

        return () => {
            socket.off("chat_message", handleMessageReceive);
            socket.off("load_messages");
        };
    }, [groupCode, userInfo]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit("chat_message", {
                code: groupCode,
                message: newMessage,
                username: userInfo.username,
            });
            setNewMessage("");
        }
    };

    const getProfilePicture = (username) => {
        const member = groupMembers.find((m) => m.username === username);
        return member?.profil_picture || "/default-avatar.png"; // Default avatar
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="text-center bg-background text-white p-4 rounded-t-lg">
                Chat de {groupName}
            </div>

            {/* Messages */}
            <div
                ref={chatContainerRef}
                className="flex flex-col flex-grow bg-background overflow-y-auto p-4 space-y-4 rounded-b-lg"
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-end space-x-2 ${
                            msg.username === userInfo.username ? "justify-end" : "justify-start"
                        }`}
                    >
                        {/* Profile Picture */}
                        {msg.username !== userInfo.username && (
                            <div>
                                <img
                                    src={getProfilePicture(msg.username)}
                                    alt={msg.username}
                                    className="w-10 h-10 rounded-full border border-gray-500"
                                />
                                <span className="text-xs text-white/40">{msg.username}</span>
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div
                            className={`p-3 rounded-2xl text-white max-w-sm ${
                                msg.username === userInfo.username
                                    ? "bg-primary text-right"
                                    : "bg-gray-700 text-left"
                            }`}
                        >
                            <p>{msg.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input */}
            <div className="flex p-4 bg-background space-x-2">
                <TextInputWithButton
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
                    placeholder="Tapez votre message..."
                    buttonText="Envoyer"
                    onClick={handleSendMessage}
                />
            </div>
        </div>
    );
};

export default Chat;