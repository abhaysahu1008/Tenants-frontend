import L from "leaflet";
import { AlertCircle, Home, MapPin } from "lucide-react";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../context/AuthContext";
import {
  FOOD_OPTIONS,
  GENDER_OPTIONS,
  SLEEP_OPTIONS,
} from "../utils/constants";

// Fix for missing default Leaflet icons in Webpack/Vite setups
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    budgetMin: "",
    budgetMax: "",
    gender: "",
    sleepTime: "",
    smoking: "",
    food: "",
    longitude: "",
    latitude: "",
    city: "",
    preferredAmenities: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default fallback location

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Browser Geolocation API Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ map: "Geolocation is not supported by your browser" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        setMapCenter([latitude, longitude]);
      },
      (error) => {
        setErrors({ map: "Unable to retrieve your location automatically." });
      },
    );
  };

  // Sub-component to handle map clicks and adjust positioning
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      setErrors({ submit: "Please select a location on the map." });
      return;
    }
    // Client-side validation: ensure budget range is sensible
    if (Number(formData.budgetMin) >= Number(formData.budgetMax)) {
      setErrors({ submit: "Min budget must be less than max budget." });
      return;
    }
    setIsSubmitting(true);
    try {
      await signup({
        ...formData,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        longitude: Number(formData.longitude),
        latitude: Number(formData.latitude),
        smoking: formData.smoking === "true",
      });
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Signup failed";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Home className="h-10 w-10 text-primary-600 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Create Account
          </h2>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <Input
                      name="lastName"
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  <Input
                    name="email"
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <Input
                    name="password"
                    label="Password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="budgetMin"
                      label="Min Budget"
                      type="number"
                      required
                      value={formData.budgetMin}
                      onChange={handleChange}
                    />
                    <Input
                      name="budgetMax"
                      label="Max Budget"
                      type="number"
                      required
                      value={formData.budgetMax}
                      onChange={handleChange}
                    />
                  </div>
                  <Select
                    name="gender"
                    label="Gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    options={GENDER_OPTIONS.filter((g) => g.value !== "any")}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </Button>
                </>
              ) : (
                <>
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
                    label="Smoking Preference"
                    required
                    value={formData.smoking}
                    onChange={handleChange}
                    options={[
                      { value: "false", label: "Non-smoker" },
                      { value: "true", label: "Smoker" },
                    ]}
                  />
                  <Select
                    name="food"
                    label="Food Preference"
                    required
                    value={formData.food}
                    onChange={handleChange}
                    options={FOOD_OPTIONS}
                  />
                  <Input
                    name="city"
                    label="City"
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />

                  {/* Map Feature Integration Wrapper */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Select Location
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <MapPin className="h-3 w-3 text-red-500 font-semibold" />{" "}
                        Detect Location
                      </button>
                    </div>

                    <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
                      <MapContainer
                        center={mapCenter}
                        zoom={5}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>
                    {errors.map && (
                      <p className="text-xs text-red-500">{errors.map}</p>
                    )}

                    {/* Visual coordinates reference (read-only verification) */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                      <div>
                        <span className="font-semibold text-gray-500">
                          Lat:
                        </span>{" "}
                        {formData.latitude || "Not chosen"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500">
                          Lng:
                        </span>{" "}
                        {formData.longitude || "Not chosen"}
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="flex items-center gap-2 text-sm text-danger bg-red-50 p-3 rounded-lg text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      {errors.submit}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      isLoading={isSubmitting}
                    >
                      Sign Up
                    </Button>
                  </div>
                </>
              )}
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
