import api from "./api";
export const userService = {
  getCurrentUser: () => api.get("/users/me"),
  updateUser: (data) => api.patch("/users/me", data),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserProperties: () => api.get("/users/me/properties"),
  getUserApplications: () => api.get("/users/me/applications"),
};
