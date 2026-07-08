import api from "./api";

export const chatService = {
  getConversations: () => api.get("/chat"),
  getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  createChat: (receiverId) => api.post(`/chat/${receiverId}`),
};
