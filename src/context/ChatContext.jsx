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

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
  : "http://localhost:7000";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "object")
    return value._id?.toString() || value.toString();
  return value.toString();
};

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

    const socketInstance = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setError(null);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error", err.message);
      setError("Chat connection failed");
    });

    socketInstance.on("receive_message", (message) => {
      const senderId = normalizeId(message.sender);
      const myId = normalizeId(user?._id);

      // Don't add own messages here (handled by message_sent)
      if (senderId === myId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (item) => normalizeId(item._id) === senderId,
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
            unreadCount: (updated[existingIndex].unreadCount || 0) + 1,
          };
          const [moved] = updated.splice(existingIndex, 1);
          return [moved, ...updated];
        }
        return prev;
      });
    });

    socketInstance.on("message_sent", (message) => {
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => !m.isOptimistic);
        if (withoutOptimistic.some((m) => m._id === message._id)) return prev;
        return [...withoutOptimistic, message];
      });
    });

    socketInstance.on("message_error", (err) => {
      console.error("Message error:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.isOptimistic));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !activeChatUser || !user) return;
    socket.emit("join_chat", { otherUserId: activeChatUser });
    return () => {
      socket.emit("leave_chat", { otherUserId: activeChatUser });
    };
  }, [socket, activeChatUser, user]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getConversations();
      setConversations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    (receiverId, text) => {
      if (!socket) throw new Error("Socket not initialized");

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        sender: { _id: user?._id, name: user?.name, email: user?.email },
        receiver: { _id: receiverId },
        text,
        read: false,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      socket.emit("send_message", { receiverId, text });
    },
    [socket, user],
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
