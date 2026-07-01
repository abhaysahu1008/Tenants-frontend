import api from "./api";
export const propertyService = {
  createProperty: (data) => api.post("/properties/create", data),
  getProperties: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return api.get(`/properties/filters?${params.toString()}`);
  },
  getProperty: (id) => api.get(`/properties/${id}`),
  getNearby: (lng, lat, dist = 5000) =>
    api.get(
      `/properties/nearby?longitude=${lng}&latitude=${lat}&distance=${dist}`,
    ),
  searchProperties: (query) =>
    api.get(`/properties/search?query=${encodeURIComponent(query)}`),
};
