import { useEffect } from "react";
import { useAiMatch } from "../context/AiMatchContext";
import { PropertyList } from "../components/property/PropertyList";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Heart } from "lucide-react";

export const MatchesPage = () => {
  const { bestProperties, fetchBestProperties, isLoading } = useAiMatch();
  useEffect(() => {
    fetchBestProperties();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Best Matches For You
        </h1>
      </div>
      <p className="text-gray-600">
        Properties ranked by compatibility with your preferences
      </p>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <PropertyList properties={bestProperties} showMatch={true} />
      )}
    </div>
  );
};
