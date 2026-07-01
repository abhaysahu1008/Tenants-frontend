import { Search, X } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import {
  FOOD_OPTIONS,
  FURNISHED_TYPES,
  PROPERTY_TYPES,
} from "../../utils/constants";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export const PropertyFilters = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    fetchProperties,
    fetchNearbyProperties,
  } = useProperty();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl border border-gray-200"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="City"
          value={filters.city}
          onChange={(e) => updateFilters({ city: e.target.value })}
        />
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Rent"
            value={filters.minRent}
            onChange={(e) => updateFilters({ minRent: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max Rent"
            value={filters.maxRent}
            onChange={(e) => updateFilters({ maxRent: e.target.value })}
          />
        </div>
        <Select
          placeholder="Property Type"
          value={filters.propertyType}
          onChange={(e) => updateFilters({ propertyType: e.target.value })}
          options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Select
          placeholder="Furnished"
          value={filters.furnished}
          onChange={(e) => updateFilters({ furnished: e.target.value })}
          options={FURNISHED_TYPES}
        />
        <Select
          placeholder="Food Preference"
          value={filters.food}
          onChange={(e) => updateFilters({ food: e.target.value })}
          options={FOOD_OPTIONS}
        />
        <Select
          placeholder="Smoking"
          value={filters.smoking}
          onChange={(e) => updateFilters({ smoking: e.target.value })}
          options={[
            { value: "true", label: "Allowed" },
            { value: "false", label: "Not Allowed" },
          ]}
        />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-2 flex-wrap">
          <Button type="submit" className="flex-1 min-w-[160px]">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-w-[160px]"
            onClick={fetchNearbyProperties}
          >
            Nearby properties
          </Button>
        </div>
      </div>
    </form>
  );
};
