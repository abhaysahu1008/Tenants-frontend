import { createContext, useCallback, useContext, useState } from "react";
import { applicationService } from "../services/applicationService";

const ApplicationContext = createContext(null);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [propertyApplications, setPropertyApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await applicationService.getMyApplications();
      setApplications(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch applications");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPropertyApplications = useCallback(async (propertyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response =
        await applicationService.getPropertyApplicantsWithScore(propertyId);
      setPropertyApplications(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch applications");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createApplication = useCallback(async (propertyId, message) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await applicationService.createApplication(
        propertyId,
        message,
      );
      setApplications((prev) => [response.data.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptApplication = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await applicationService.acceptApplication(id);
      setPropertyApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: "accepted" } : app,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectApplication = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await applicationService.rejectApplication(id);
      setPropertyApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: "rejected" } : app,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        propertyApplications,
        isLoading,
        error,
        fetchMyApplications,
        fetchPropertyApplications,
        createApplication,
        acceptApplication,
        rejectApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context)
    throw new Error("useApplication must be used within ApplicationProvider");
  return context;
};
