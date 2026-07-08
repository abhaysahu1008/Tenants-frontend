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

const SOCKET_URL = import.meta.env.PROD
  ? "https://api.teenants.site"
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
  const [activeChatId, setActiveChatId] = useState(null); // the chat/room _id
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => setError(null));
    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error", err.message);
      setError("Chat connection failed");
    });

    socketInstance.on("receive-message", (message) => {
      const senderId = normalizeId(message.sender);
      const myId = normalizeId(user?._id);
      if (senderId === myId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (item) => normalizeId(item._id) === normalizeId(message.chat),
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
          };
          const [moved] = updated.splice(existingIndex, 1);
          return [moved, ...updated];
        }
        return prev;
      });
    });

    socketInstance.on("message_error", (err) => {
      console.error("Message error:", err);
      setMessages((prev) => prev.filter((m) => !m.isOptimistic));
    });

    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Join/leave the socket room whenever activeChatId changes
  useEffect(() => {
    if (!socket || !activeChatId || !user) return;
    socket.emit("join-chat", activeChatId, (response) => {
      if (response?.status !== "ok") {
        setError(response?.message || "Unable to join chat");
      }
    });
    return () => {
      socket.emit("leave-chat", activeChatId);
    };
  }, [socket, activeChatId, user]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getConversations();
      setConversations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getMessages(chatId);
      setMessages(response.data || []);
      setActiveChatId(chatId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // NEW: create-or-fetch a chat with a given user (owner), return its chat _id
  const openChatWithUser = useCallback(async (otherUserId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.createChat(otherUserId);
      const chat = response.data;
      setActiveChatId(chat._id);
      return chat._id;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to open chat");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    (chatId, text) => {
      if (!socket) throw new Error("Socket not initialized");

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        sender: { _id: user?._id, name: user?.name, email: user?.email },
        chat: chatId,
        text,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      socket.emit("send-message", { chatId, text });
    },
    [socket, user],
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        activeChatId,
        isLoading,
        error,
        fetchConversations,
        fetchMessages,
        openChatWithUser,
        sendMessage,
        setActiveChatId,
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
