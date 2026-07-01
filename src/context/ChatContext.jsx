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

const normalizeId = (value) => {
  if (!value) return null;
  return typeof value === "object"
    ? value._id?.toString() || value.toString()
    : value.toString();
};

const getChatRoomId = (userId, otherId) => {
  const first = normalizeId(userId);
  const second = normalizeId(otherId);
  if (!first || !second) return null;
  return `chat:${[first, second].sort().join(":")}`;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const previousRoomRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io("http://localhost:7000", {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error", err.message);
      setError(err.message);
    });

    socketInstance.on("receive_message", (message) => {
      const senderId = normalizeId(message.sender);
      setMessages((prev) => [...prev, message]);
      setConversations((prev) => {
        const existing = prev.find(
          (item) =>
            normalizeId(item._id) === senderId ||
            normalizeId(item.participant?._id) === senderId,
        );

        const participantData =
          typeof message.sender === "object" && message.sender.name
            ? message.sender
            : existing?.participant;

        const participant = participantData
          ? {
              _id: normalizeId(participantData),
              name: participantData.name || { firstName: "Unknown" },
              email: participantData.email || "",
            }
          : {
              _id: senderId,
              name: { firstName: "Unknown" },
              email: "",
            };

        const updatedItem = {
          _id: senderId,
          participant,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          unreadCount: existing ? (existing.unreadCount || 0) + 1 : 1,
        };

        if (existing) {
          return prev.map((item) =>
            normalizeId(item._id) === senderId ||
            normalizeId(item.participant?._id) === senderId
              ? { ...item, ...updatedItem }
              : item,
          );
        }

        return [updatedItem, ...prev];
      });
    });

    socketInstance.on("message_sent", (message) => {
      setMessages((prev) => [...prev, message]);
      const receiverId = normalizeId(message.receiver);
      setConversations((prev) => {
        const existing = prev.find(
          (item) =>
            normalizeId(item._id) === receiverId ||
            normalizeId(item.participant?._id) === receiverId,
        );

        const participantData =
          typeof message.receiver === "object" && message.receiver.name
            ? message.receiver
            : existing?.participant;

        const participant = participantData
          ? {
              _id: normalizeId(participantData),
              name: participantData.name || { firstName: "Unknown" },
              email: participantData.email || "",
            }
          : {
              _id: receiverId,
              name: { firstName: "Unknown" },
              email: "",
            };

        const updatedItem = {
          _id: receiverId,
          participant,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          unreadCount: existing ? existing.unreadCount || 0 : 0,
        };

        if (existing) {
          return prev.map((item) =>
            normalizeId(item._id) === receiverId ||
            normalizeId(item.participant?._id) === receiverId
              ? { ...item, ...updatedItem }
              : item,
          );
        }

        return [updatedItem, ...prev];
      });
    });

    socketInstance.on("message_error", (payload) => {
      setError(payload?.message || "Unable to send message");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !user || !activeChatUser) return;

    const roomId = getChatRoomId(user._id, activeChatUser);
    if (!roomId) return;

    const previousRoom = previousRoomRef.current;
    if (previousRoom && previousRoom !== roomId) {
      socket.emit("leave_room", { roomId: previousRoom });
    }

    socket.emit("join_room", { roomId });
    previousRoomRef.current = roomId;
    setCurrentRoom(roomId);

    return () => {
      if (roomId) {
        socket.emit("leave_room", { roomId });
      }
    };
  }, [socket, activeChatUser, user]);

  useEffect(() => {
    if (conversations.length === 0) return;
    if (!activeChatUser) {
      setActiveChatUser(normalizeId(conversations[0]._id));
    }
  }, [conversations, activeChatUser]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getConversations();
      const data = response.data.data || [];
      setConversations(data);
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
