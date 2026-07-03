import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { chatService } from "../services/chatService";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

// Production URL - no /api suffix for socket.io
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
  : "http://localhost:7000";

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track processed message IDs to prevent duplicates
  const processedMessages = useRef(new Set());

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"], // Fallback for production
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setError(null);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error", err.message);
      setError("Chat connection failed. Retrying...");
    });

    socketInstance.on("receive_message", (message) => {
      // Deduplicate messages
      if (processedMessages.current.has(message._id)) return;
      processedMessages.current.add(message._id);

      // Keep set size manageable
      if (processedMessages.current.size > 1000) {
        processedMessages.current.clear();
      }

      setMessages((prev) => {
        // Double check not already in list
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Update conversations list
      setConversations((prev) => {
        const senderId =
          typeof message.sender === "object"
            ? message.sender._id?.toString()
            : message.sender?.toString();

        const existingIndex = prev.findIndex(
          (item) => item._id?.toString() === senderId,
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
            unreadCount:
              senderId !== user?._id?.toString()
                ? (updated[existingIndex].unreadCount || 0) + 1
                : updated[existingIndex].unreadCount,
          };
          // Move to top
          const [moved] = updated.splice(existingIndex, 1);
          return [moved, ...updated];
        }

        return prev;
      });
    });

    socketInstance.on("message_sent", (message) => {
      // Don't add here - receive_message will handle it if room is joined
      // Only add if we're sure receive_message won't fire
      if (!processedMessages.current.has(message._id)) {
        processedMessages.current.add(message._id);
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Join chat room when activeChatUser changes
  useEffect(() => {
    if (!socket || !activeChatUser || !user) return;

    // Leave previous chat if any
    // Join new chat room
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
      const msgs = response.data.data || [];

      // Clear processed set and populate with fetched messages
      processedMessages.current.clear();
      msgs.forEach((m) => processedMessages.current.add(m._id));

      setMessages(msgs);
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
    (receiverId, text) => {
      if (!socket) throw new Error("Socket not initialized");

      // Optimistically add message to UI immediately
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

      // Send via socket
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
