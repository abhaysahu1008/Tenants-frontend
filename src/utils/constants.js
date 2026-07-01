export const AMENITIES = [
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "AC" },
  { id: "parking", label: "Parking" },
  { id: "laundry", label: "Laundry" },
  { id: "gym", label: "Gym" },
  { id: "fridge", label: "Fridge" },
  { id: "kitchen", label: "Kitchen" },
  { id: "water-purifier", label: "Water Purifier" },
  { id: "power-backup", label: "Power Backup" },
];

export const PROPERTY_TYPES = ["1BHK", "2BHK", "3BHK", "PG", "Studio"];

export const FURNISHED_TYPES = [
  { value: "fully", label: "Fully Furnished" },
  { value: "semi", label: "Semi Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "any", label: "Any" },
];

export const FOOD_OPTIONS = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
];

export const SLEEP_OPTIONS = [
  { value: "early", label: "Early Bird" },
  { value: "late", label: "Night Owl" },
  { value: "flexible", label: "Flexible" },
];

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export const getMatchScoreColor = (score) => {
  if (score >= 70) return "bg-green-500 text-white";
  if (score >= 50) return "bg-blue-500 text-white";
  if (score >= 30) return "bg-yellow-500 text-white";
  return "bg-red-500 text-white";
};

export const getMatchScoreLabel = (score) => {
  if (score >= 70) return "Excellent Match";
  if (score >= 50) return "Good Match";
  if (score >= 30) return "Average Match";
  return "Poor Match";
};

export const DEFAULT_PROPERTY_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/9202/9202500.png";

export const normalizePropertyImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === "string") {
    return images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }
  return [];
};
