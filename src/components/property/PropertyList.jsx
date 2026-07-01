import { PropertyCard } from "./PropertyCard";

export const PropertyList = ({ properties = [], showMatch = false }) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No properties found. Try adjusting your filters.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((item) => {
        const property = item.property || item;
        const matchScore = item.matchScore;
        return (
          <PropertyCard
            key={property._id}
            property={property}
            matchScore={matchScore}
            showMatch={showMatch}
          />
        );
      })}
    </div>
  );
};
