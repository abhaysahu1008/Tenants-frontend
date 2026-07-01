import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useProperty } from "../context/PropertyContext";
import {
  AMENITIES,
  FOOD_OPTIONS,
  FURNISHED_TYPES,
  GENDER_OPTIONS,
  PROPERTY_TYPES,
  SLEEP_OPTIONS,
} from "../utils/constants";

// Fix default Leaflet marker assets breaking under build bundlers
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const { createProperty } = useProperty();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Fallback map center view
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rent: "",
    deposit: "",
    propertyType: "",
    availableFrom: "",
    furnished: "",
    amenities: [],
    smoking: "",
    food: "",
    sleepTime: "",
    gender: "",
    longitude: "",
    latitude: "",
    address: "",
    city: "",
    imageUrls: "",
    maxTenants: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (amenityId) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  // Browser Geolocation API Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        setMapCenter([latitude, longitude]);
      },
      () => {
        alert("Unable to auto-detect your location.");
      },
    );
  };

  // Map Click Listener to capture custom coordinate coordinates placement
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
        setMapCenter([e.latlng.lat, e.latlng.lng]);
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert(
        "Please pinpoint the location on the map before listing your property.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const images = formData.imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      await createProperty({
        ...formData,
        rent: Number(formData.rent),
        deposit: Number(formData.deposit) || 0,
        longitude: Number(formData.longitude),
        latitude: Number(formData.latitude),
        maxTenants: Number(formData.maxTenants),
        smoking: formData.smoking === "true",
        images,
      });
      navigate("/properties");
    } catch (err) {
      alert(err.message || "Failed to create property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        List Your Property
      </h1>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              label="Title"
              required
              value={formData.title}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                required
                minLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="rent"
                label="Monthly Rent"
                type="number"
                required
                value={formData.rent}
                onChange={handleChange}
              />
              <Input
                name="deposit"
                label="Deposit"
                type="number"
                value={formData.deposit}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                name="propertyType"
                label="Property Type"
                required
                value={formData.propertyType}
                onChange={handleChange}
                options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
              />
              <Select
                name="furnished"
                label="Furnished"
                required
                value={formData.furnished}
                onChange={handleChange}
                options={FURNISHED_TYPES}
              />
            </div>

            <Input
              name="availableFrom"
              label="Available From"
              type="date"
              required
              value={formData.availableFrom}
              onChange={handleChange}
            />
            <Input
              name="maxTenants"
              label="Max Tenants"
              type="number"
              required
              value={formData.maxTenants}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                name="gender"
                label="Preferred Gender"
                required
                value={formData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS}
              />
              <Select
                name="food"
                label="Food Preference"
                required
                value={formData.food}
                onChange={handleChange}
                options={FOOD_OPTIONS}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                name="sleepTime"
                label="Sleep Schedule"
                required
                value={formData.sleepTime}
                onChange={handleChange}
                options={SLEEP_OPTIONS}
              />
              <Select
                name="smoking"
                label="Smoking"
                required
                value={formData.smoking}
                onChange={handleChange}
                options={[
                  { value: "false", label: "Not Allowed" },
                  { value: "true", label: "Allowed" },
                ]}
              />
            </div>

            {/* Interactive Leaflet Map Picker Component Replacing Raw Coordinate Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Select Property Location
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <MapPin className="h-3 w-3" /> Pin Current Location
                </button>
              </div>

              <div className="h-52 w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
                <MapContainer
                  center={mapCenter}
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-500">Lat:</span>{" "}
                  {formData.latitude || "Not chosen"}
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Lng:</span>{" "}
                  {formData.longitude || "Not chosen"}
                </div>
              </div>
            </div>

            <Input
              name="address"
              label="Address"
              required
              value={formData.address}
              onChange={handleChange}
            />
            <Input
              name="city"
              label="City"
              required
              value={formData.city}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URLs
              </label>
              <textarea
                name="imageUrls"
                rows={2}
                placeholder="Enter one or more image URLs separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                value={formData.imageUrls}
                onChange={handleChange}
              />
              <p className="mt-2 text-xs text-gray-500">
                Add at least one image URL or leave blank to use the default
                property photo.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAmenity(id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.amenities.includes(id)
                        ? "bg-primary-100 text-primary-800 border-2 border-primary-300"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              List Property
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
