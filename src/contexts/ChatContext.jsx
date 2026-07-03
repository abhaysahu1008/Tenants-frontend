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

    // Connect to production socket server
    const socketInstance = io("https://api.teenants.site", {
      auth: { token: localStorage.getItem("token") },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully");
      setError(null);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      setError(`Connection error: ${err.message}`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socketInstance.on("receive_message", (message) => {
      console.log("Received message:", message);
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

    socketInstance.on("message_delivered", (message) => {
      console.log("Message delivered:", message);
    });

    socketInstance.on("message_error", (error) => {
      console.error("Message error:", error);
      setError(`Message error: ${error.message}`);
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
      if (!socket) {
        setError("Socket not initialized. Please refresh the page.");
        throw new Error("Socket not initialized");
      }
      if (!socket.connected) {
        setError("Not connected to server. Attempting to reconnect...");
        socket.connect();
        throw new Error("Socket not connected");
      }
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
