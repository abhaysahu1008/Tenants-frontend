import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const getInitials = (name) => {
  if (!name) return "?";
  const first = name.firstName?.[0] || "";
  const last = name.lastName?.[0] || "";
  return (first + last).toUpperCase() || "?";
};

const getOtherParticipant = (conversation, myId) => {
  return conversation.participants?.find(
    (p) => p._id?.toString() !== myId?.toString(),
  );
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    messages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    isLoading,
    error,
  } = useChat();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  useEffect(() => {
    if (!chatId && conversations.length > 0) {
      navigate(`/chat/${conversations[0]._id}`, { replace: true });
    }
  }, [chatId, conversations, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find((c) => c._id === chatId);
  const otherUser = activeConversation
    ? getOtherParticipant(activeConversation, user?._id)
    : null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;
    sendMessage(chatId, inputText);
    setInputText("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Messages</h3>
        </div>
        <div>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Apply to a listing to start chatting with an owner
              </p>
            </div>
          ) : (
            conversations.map((c) => {
              const other = getOtherParticipant(c, user?._id);
              const name = other?.name
                ? `${other.name.firstName || ""} ${other.name.lastName || ""}`.trim()
                : other?.email || "Unknown user";
              const isActive = chatId === c._id;

              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/chat/${c._id}`)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition ${
                    isActive ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {getInitials(other?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm truncate ${
                        isActive
                          ? "font-semibold text-primary-700"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {c.lastMessage?.text || "Say hello"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat pane */}
      <div className="flex-1 flex flex-col bg-white">
        {chatId && activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                {getInitials(otherUser?.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {otherUser?.name
                    ? `${otherUser.name.firstName || ""} ${otherUser.name.lastName || ""}`.trim()
                    : otherUser?.email || "Unknown user"}
                </p>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
              {isLoading && messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-8">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-8">
                  No messages yet. Say hello 👋
                </p>
              ) : (
                messages.map((msg, i) => {
                  const isMine =
                    msg.sender?._id?.toString() === user?._id?.toString();
                  const prevMsg = messages[i - 1];
                  const showSenderChange =
                    !prevMsg ||
                    prevMsg.sender?._id?.toString() !==
                      msg.sender?._id?.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                        showSenderChange ? "mt-3" : "mt-0.5"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm ${
                          isMine
                            ? "bg-primary-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                        } ${msg.isOptimistic ? "opacity-60" : ""}`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isMine ? "text-primary-100" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 flex gap-3 bg-white"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
