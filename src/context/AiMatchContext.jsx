import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { aiService } from "../services/aiService";
import { matchService } from "../services/matchService";

const AiMatchContext = createContext(null);

export const AiMatchProvider = ({ children }) => {
  const [matchResults, setMatchResults] = useState({});
  const [bestProperties, setBestProperties] = useState([]);
  const [applicantRanking, setApplicantRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingRequests = useRef(new Set());

  const getMatchAnalysis = useCallback(
    async (applicationId) => {
      if (matchResults[applicationId]) return matchResults[applicationId];

      if (pendingRequests.current.has(applicationId)) {
        return new Promise((resolve) => {
          const check = setInterval(() => {
            if (matchResults[applicationId]) {
              clearInterval(check);
              resolve(matchResults[applicationId]);
            }
          }, 100);
          setTimeout(() => {
            clearInterval(check);
            resolve(null);
          }, 10000);
        });
      }

      pendingRequests.current.add(applicationId);
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiService.getMatchAnalysis(applicationId);
        const data = response.data.data;
        setMatchResults((prev) => ({ ...prev, [applicationId]: data }));
        return data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to analyze match");
        throw err;
      } finally {
        pendingRequests.current.delete(applicationId);
        setIsLoading(false);
      }
    },
    [matchResults],
  );

  const refreshMatchAnalysis = useCallback(async (applicationId) => {
    setMatchResults((prev) => {
      const n = { ...prev };
      delete n[applicationId];
      return n;
    });
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiService.refreshMatchAnalysis(applicationId);
      const data = response.data.data;
      setMatchResults((prev) => ({ ...prev, [applicationId]: data }));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refresh");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBestProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await matchService.getBestProperties();
      setBestProperties(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch matches");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchApplicantRanking = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await matchService.getApplicantRanking();
      setApplicantRanking(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch rankings");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMatchCache = useCallback(() => {
    setMatchResults({});
    aiService.clearCache();
  }, []);

  return (
    <AiMatchContext.Provider
      value={{
        matchResults,
        bestProperties,
        applicantRanking,
        isLoading,
        error,
        getMatchAnalysis,
        refreshMatchAnalysis,
        fetchBestProperties,
        fetchApplicantRanking,
        clearMatchCache,
      }}
    >
      {children}
    </AiMatchContext.Provider>
  );
};

export const useAiMatch = () => {
  const context = useContext(AiMatchContext);
  if (!context)
    throw new Error("useAiMatch must be used within AiMatchProvider");
  return context;
};
