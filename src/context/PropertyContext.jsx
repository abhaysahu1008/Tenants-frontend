import { createContext, useCallback, useContext, useState } from "react";
import { propertyService } from "../services/propertyService";

const PropertyContext = createContext(null);

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: "",
    minRent: "",
    maxRent: "",
    food: "",
    smoking: "",
    furnished: "",
    propertyType: "",
    amenities: [],
  });

  const fetchProperties = useCallback(
    async (overrideFilters = null) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await propertyService.getProperties(
          overrideFilters || filters,
        );
        setProperties(response.data.data || []);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch properties");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  const fetchProperty = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyService.getProperty(id);
      setCurrentProperty(response.data.property);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch property");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProperty = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyService.createProperty(data);
      setProperties((prev) => [response.data.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create property");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProperties = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyService.searchProperties(query);
      setProperties(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNearbyProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not available in your browser.");
      setIsLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject),
      );
      const { longitude, latitude } = position.coords;
      const response = await propertyService.getNearby(longitude, latitude);
      setProperties(response.data.data || []);
      return response.data;
    } catch (err) {
      setError(
        err.message ||
          err.response?.data?.message ||
          "Failed to fetch nearby properties",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      city: "",
      minRent: "",
      maxRent: "",
      food: "",
      smoking: "",
      furnished: "",
      propertyType: "",
      amenities: [],
    });
  }, []);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        currentProperty,
        isLoading,
        error,
        filters,
        fetchProperties,
        fetchProperty,
        createProperty,
        searchProperties,
        fetchNearbyProperties,
        updateFilters,
        clearFilters,
        setCurrentProperty,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context)
    throw new Error("useProperty must be used within PropertyProvider");
  return context;
};
