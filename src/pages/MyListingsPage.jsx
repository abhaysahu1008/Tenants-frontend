import { useEffect, useState } from "react";
import { PropertyList } from "../components/property/PropertyList";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { userService } from "../services/userService";

export const MyListingsPage = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMy = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await userService.getUserProperties();
        setProperties(res.data.properties || []);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchMy();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
      <p className="text-gray-600">Properties you've listed on Teenants</p>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <PropertyList properties={properties} />
      )}
    </div>
  );
};
