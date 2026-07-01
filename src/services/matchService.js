import api from "./api";
export const matchService = {
  getBestProperties: () => api.get("/matches/properties/propertyRanking"),
  getApplicantRanking: () => api.get("/matches/applicants/applicantRanking"),
};
