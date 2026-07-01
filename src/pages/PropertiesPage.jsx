import { useEffect } from "react";
import { useProperty } from "../context/PropertyContext";
import { PropertyList } from "../components/property/PropertyList";
import { PropertyFilters } from "../components/property/PropertyFilters";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export const PropertiesPage = () => {
  const { properties, isLoading, fetchProperties } = useProperty();
  useEffect(() => {
    fetchProperties();
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Find Properties</h1>
      <PropertyFilters />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <PropertyList properties={properties} />
      )}
    </div>
  );
};
