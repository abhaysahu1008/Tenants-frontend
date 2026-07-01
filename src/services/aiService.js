import api from "./api";
import { cacheService } from "./cacheService";

export const aiService = {
  getMatchAnalysis: async (applicationId) => {
    const userId = localStorage.getItem("userId");
    const cached = cacheService.get(applicationId, userId);
    if (cached) {
      return {
        data: {
          success: true,
          data: { ...cached, cached: true },
        },
      };
    }

    const response = await api.get(
      `/matches/applications/${applicationId}/match-analysis`,
    );
    if (response.data?.success && response.data?.data) {
      cacheService.set(applicationId, userId, response.data.data);
    }
    return response;
  },

  refreshMatchAnalysis: async (applicationId) => {
    const userId = localStorage.getItem("userId");
    cacheService.delete(applicationId, userId);
    const response = await api.get(
      `/matches/applications/${applicationId}/match-analysis?refresh=true`,
    );
    if (response.data?.success && response.data?.data) {
      cacheService.set(applicationId, userId, response.data.data);
    }
    return response;
  },

  clearCache: () => cacheService.clear(),
};
