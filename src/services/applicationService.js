import api from "./api";
export const applicationService = {
  createApplication: (propertyId, message) =>
    api.post(`/applications/${propertyId}`, { message }),
  getMyApplications: () => api.get("/applications/me"),
  getPropertyApplications: (propertyId) =>
    api.get(`/applications/property/${propertyId}`),
  getPropertyApplicantsWithScore: (propertyId) =>
    api.get(`/matches/applicants/${propertyId}/applicantRanking`),
  acceptApplication: (id) => api.patch(`/applications/${id}/accept`),
  rejectApplication: (id) => api.patch(`/applications/${id}/reject`),
  deleteApplication: (id) => api.patch(`/applications/${id}`),
};
