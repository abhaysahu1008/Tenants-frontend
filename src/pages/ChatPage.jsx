import { format } from "date-fns";
import { MessageSquare, Send, Check, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "object")
    return value._id?.toString() || value.toString();
  return value.toString();
};

const getGreeting = (name) => {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${time}, ${name}`;
};

export const ChatPage = () => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeChatUser,
    isLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveChatUser,
  } = useChat();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChatUser) {
      fetchMessages(activeChatUser);
    }
  }, [activeChatUser, fetchMessages]);

  const activeConversation = useMemo(() => {
    if (!activeChatUser) return null;
    return conversations.find((item) => {
      const convoId = normalizeId(item._id);
      const participantId = normalizeId(item.participant?._id);
      const activeId = normalizeId(activeChatUser);
      return convoId === activeId || participantId === activeId;
    });
  }, [conversations, activeChatUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim() || !activeChatUser) return;

    sendMessage(activeChatUser, text.trim());
    setText("");
  };

  const activeUserName =
    activeConversation?.participant?.name?.firstName ||
    activeConversation?.participant?.email ||
    "Chat";

  const userIdStr = normalizeId(user?._id);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)]">
      {/* Left Sidebar - Conversations */}
      <div className="space-y-4 flex flex-col h-full">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {getGreeting(user?.name?.firstName || "there")}
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
            </div>
            <Badge variant="secondary" className="text-sm">
              {conversations.length} chats
            </Badge>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden">
          <CardBody className="space-y-4 h-full flex flex-col">
            <div>
              <p className="text-sm text-gray-500">Conversations</p>
              <h2 className="text-lg font-semibold text-gray-900">
                Your chat list
              </h2>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {conversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No chats yet. Start a conversation from a user profile.
                </div>
              ) : (
                conversations.map((conversation) => {
                  const participant = conversation.participant;
                  const conversationId = normalizeId(conversation._id);
                  const isActive =
                    conversationId === normalizeId(activeChatUser);

                  return (
                    <button
                      key={conversationId}
                      type="button"
                      onClick={() => setActiveChatUser(conversationId)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 bg-white hover:border-primary-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {participant?.name?.firstName ||
                              participant?.email ||
                              "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">
                            {conversation.lastMessageAt
                              ? new Date(
                                  conversation.lastMessageAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="mt-2 inline-flex items-center rounded-full bg-primary-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex flex-col h-full space-y-4">
        {/* Chat Header */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chat with</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {activeUserName}
              </h2>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardBody className="flex flex-col h-full p-0">
            {isLoading && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : !activeChatUser ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p>No messages yet. Say hello!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const senderId = normalizeId(message.sender);
                      const isMine = senderId === userIdStr;
                      const isOptimistic = message.isOptimistic;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm ${
                              isMine
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            } ${isOptimistic ? "opacity-70" : ""}`}
                          >
                            <p>{message.text}</p>
                            <div
                              className={`mt-1 flex items-center gap-1 ${isMine ? "text-primary-200" : "text-gray-400"}`}
                            >
                              <span className="text-[10px]">
                                {format(new Date(message.createdAt), "hh:mm a")}
                              </span>
                              {isMine &&
                                (isOptimistic ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <CheckCheck className="h-3 w-3" />
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-3 border-t border-gray-200 p-4 bg-white"
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    disabled={!activeChatUser}
                  />
                  <Button
                    type="submit"
                    disabled={!activeChatUser || !text.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardBody>
        </Card>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
