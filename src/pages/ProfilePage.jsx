import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { userService } from "../services/userService";
import {
  GENDER_OPTIONS,
  FOOD_OPTIONS,
  SLEEP_OPTIONS,
  AMENITIES,
} from "../utils/constants";
import { formatFullName } from "../utils/formatters";
import { User, Save } from "lucide-react";

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(() => ({
    firstName: user?.name?.firstName || "",
    lastName: user?.name?.lastName || "",
    bio: user?.bio || "",
    budgetMin: user?.budget?.min || "",
    budgetMax: user?.budget?.max || "",
    gender: user?.gender || "",
    sleepTime: user?.preferences?.sleepTime || "",
    smoking: user?.preferences?.smoking ? "true" : "false",
    food: user?.preferences?.food || "",
    city: user?.location?.city || "",
    preferredAmenities: user?.preferredAmenities || [],
  }));

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (amenityId) => {
    setFormData((prev) => ({
      ...prev,
      preferredAmenities: prev.preferredAmenities.includes(amenityId)
        ? prev.preferredAmenities.filter((a) => a !== amenityId)
        : [...prev.preferredAmenities, amenityId],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await userService.updateUser({
        name: { firstName: formData.firstName, lastName: formData.lastName },
        bio: formData.bio,
        budget: {
          min: Number(formData.budgetMin),
          max: Number(formData.budgetMax),
        },
        gender: formData.gender,
        preferences: {
          sleepTime: formData.sleepTime,
          smoking: formData.smoking === "true",
          food: formData.food,
        },
        preferredAmenities: formData.preferredAmenities,
        location: { ...user.location, city: formData.city },
      });
      updateUser(response.data.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Button
          variant={isEditing ? "secondary" : "primary"}
          onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
            {user.name?.firstName?.[0]}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {formatFullName(user.name)}
            </h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </CardHeader>

        <CardBody>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="budgetMin"
                  label="Min Budget"
                  type="number"
                  value={formData.budgetMin}
                  onChange={handleChange}
                />
                <Input
                  name="budgetMax"
                  label="Max Budget"
                  type="number"
                  value={formData.budgetMax}
                  onChange={handleChange}
                />
              </div>

              <Select
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS.filter((g) => g.value !== "any")}
              />
              <Select
                name="sleepTime"
                label="Sleep Schedule"
                value={formData.sleepTime}
                onChange={handleChange}
                options={SLEEP_OPTIONS}
              />
              <Select
                name="food"
                label="Food Preference"
                value={formData.food}
                onChange={handleChange}
                options={FOOD_OPTIONS}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleAmenity(id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.preferredAmenities.includes(id)
                          ? "bg-primary-100 text-primary-800 border-2 border-primary-300"
                          : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                isLoading={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Budget Range</span>
                  <p className="font-medium">
                    ₹{user.budget?.min?.toLocaleString()} - ₹
                    {user.budget?.max?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Location</span>
                  <p className="font-medium">{user.location?.city}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gender</span>
                  <p className="font-medium capitalize">{user.gender}</p>
                </div>
                <div>
                  <span className="text-gray-500">Food Preference</span>
                  <p className="font-medium capitalize">
                    {user.preferences?.food}
                  </p>
                </div>
              </div>

              {user.bio && (
                <div className="pt-4 border-t">
                  <span className="text-gray-500 text-sm">Bio</span>
                  <p className="mt-1 text-gray-700">{user.bio}</p>
                </div>
              )}

              {user.preferredAmenities?.length > 0 && (
                <div className="pt-4 border-t">
                  <span className="text-gray-500 text-sm">
                    Preferred Amenities
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.preferredAmenities.map((a) => (
                      <span
                        key={a}
                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
