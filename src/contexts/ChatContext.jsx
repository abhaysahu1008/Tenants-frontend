import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { chatService } from "../services/chatService";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io("http://localhost:7000", {
      auth: { token: localStorage.getItem("token") },
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error", err.message);
      setError(err.message);
    });

    socketInstance.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
      setConversations((prev) => {
        const existing = prev.find(
          (item) =>
            item._id === message.sender._id ||
            item.participant._id === message.sender._id,
        );
        if (existing) {
          return prev.map((item) =>
            item._id === existing._id
              ? {
                  ...item,
                  lastMessage: message.text,
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    item.participant._id === message.sender._id
                      ? item.unreadCount + 1
                      : item.unreadCount,
                }
              : item,
          );
        }
        return prev;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getConversations();
      setConversations(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatUserId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getMessages(chatUserId);
      setMessages(response.data.data || []);
      setActiveChatUser(chatUserId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch messages");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId, text) => {
      if (!socket) throw new Error("Socket not initialized");
      socket.emit("send_message", { receiverId, text });
    },
    [socket],
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        activeChatUser,
        isLoading,
        error,
        fetchConversations,
        fetchMessages,
        sendMessage,
        setActiveChatUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
