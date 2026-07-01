import { format } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const normalizeId = (value) => {
  if (!value) return null;
  return typeof value === "object"
    ? value._id?.toString() || value.toString()
    : value.toString();
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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChatUser) {
      fetchMessages(activeChatUser);
    }
  }, [activeChatUser, fetchMessages]);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (item) =>
          normalizeId(item._id) === normalizeId(activeChatUser) ||
          normalizeId(item.participant?._id) === normalizeId(activeChatUser),
      ),
    [conversations, activeChatUser],
  );

  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        const senderId = normalizeId(message.sender);
        const receiverId = normalizeId(message.receiver);
        const activeId = normalizeId(activeChatUser);
        const userId = normalizeId(user?._id);
        return (
          (senderId === userId && receiverId === activeId) ||
          (receiverId === userId && senderId === activeId)
        );
      }),
    [messages, activeChatUser, user],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim() || !activeChatUser) return;

    sendMessage(activeChatUser, text.trim());
    setText("");
  };

  const activeUserName =
    activeConversation?.participant?.name?.firstName || "Chat";

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-4">
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

        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Conversations</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  Your chat list
                </h2>
              </div>
            </div>

            <div className="space-y-3">
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
                        <div>
                          <p className="font-semibold text-gray-900">
                            {participant?.name?.firstName ||
                              participant?.email ||
                              "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        <div className="text-right">
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

      <div className="space-y-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
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

        <Card className="flex flex-col h-[calc(100vh-220px)] overflow-hidden">
          <CardBody className="flex flex-col h-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
                  {visibleMessages.length === 0 ? (
                    <div className="h-full rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                      Select a conversation to view messages.
                    </div>
                  ) : (
                    visibleMessages.map((message) => {
                      const isMine =
                        message.sender?._id === user?._id ||
                        message.sender === user?._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${isMine ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-900"}`}
                          >
                            <p>{message.text}</p>
                            <p className="mt-1 text-[10px] text-gray-400">
                              {format(new Date(message.createdAt), "hh:mm a")}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4"
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      activeChatUser
                        ? "Type your message..."
                        : "Select a chat to send a message"
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
