import {
  Calendar,
  IndianRupee,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useApplication } from "../context/ApplicationContext";
import { useAuth } from "../context/AuthContext";
// import { useChat } from "../context/ChatContext";
import { useProperty } from "../context/PropertyContext";
import {
  DEFAULT_PROPERTY_IMAGE,
  getMatchScoreColor,
  getMatchScoreLabel,
  normalizePropertyImages,
} from "../utils/constants";
import {
  formatCurrency,
  formatDate,
  formatFullName,
  formatTenantCount,
} from "../utils/formatters";

export const PropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { currentProperty, fetchProperty, isLoading } = useProperty();
  const {
    applications,
    createApplication,
    propertyApplications,
    fetchMyApplications,
    fetchPropertyApplications,
    acceptApplication,
    rejectApplication,
  } = useApplication();
  const { user } = useAuth();
  // const { setActiveChatUser } = useChat();
  const [message, setMessage] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const hasApplied = applications.some((application) => {
    const property = application.property;
    return (
      property === propertyId ||
      property?._id?.toString() === propertyId ||
      property?.toString() === propertyId
    );
  });

  const handleMessageOwner = () => {
    const ownerId = currentProperty?.createdBy?._id;
    if (!ownerId) return;
    setActiveChatUser(ownerId.toString());
    navigate("/chat");
  };

  useEffect(() => {
    fetchProperty(propertyId);
  }, [propertyId, fetchProperty]);

  useEffect(() => {
    if (user) {
      fetchMyApplications();
    }
  }, [user, fetchMyApplications]);

  useEffect(() => {
    if (
      currentProperty &&
      user &&
      currentProperty.createdBy?._id?.toString() === user._id?.toString()
    ) {
      fetchPropertyApplications(propertyId);
    }
  }, [currentProperty, user, fetchPropertyApplications, propertyId]);

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await createApplication(propertyId, message);
      setShowApplyForm(false);
      alert("Application submitted!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (!currentProperty)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Property not found</p>
      </div>
    );

  const {
    title,
    description,
    rent,
    deposit,
    propertyType,
    furnished,
    amenities,
    location,
    roommatePreferences,
    createdBy,
    maxTenants,
    tenants,
    availableFrom,
    images,
  } = currentProperty;

  const normalizedImages = normalizePropertyImages(images);

  const ownerName =
    formatFullName(createdBy?.name) || createdBy?.email || "Property Owner";
  const ownerEmail = createdBy?.email || "";

  const furnishedLabel =
    furnished === "fully"
      ? "Fully Furnished"
      : furnished === "semi"
        ? "Semi Furnished"
        : "Unfurnished";

  const isOwner =
    currentProperty?.createdBy?._id?.toString() === user?._id?.toString();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(normalizedImages.length > 0
          ? normalizedImages
          : [DEFAULT_PROPERTY_IMAGE]
        ).map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${title} ${i + 1}`}
            className="rounded-xl object-cover w-full h-64"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_PROPERTY_IMAGE;
            }}
          />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="primary">{propertyType}</Badge>
              <Badge
                variant={furnished === "unfurnished" ? "outline" : "success"}
              >
                {furnishedLabel}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-gray-500 mt-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>
                {location?.address || "Address not available"}
                {location?.city ? ` · ${location.city}` : ""}
              </span>
            </div>
          </div>
          <Card>
            <CardBody>
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {amenities?.map((a) => (
                  <Badge key={a} variant="secondary">
                    {a}
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h2 className="font-semibold text-gray-900 mb-3">
                Roommate Preferences
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 font-medium capitalize">
                    {roommatePreferences?.gender}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Food:</span>
                  <span className="ml-2 font-medium capitalize">
                    {roommatePreferences?.food}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Smoking:</span>
                  <span className="ml-2 font-medium">
                    {roommatePreferences?.smoking ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Sleep:</span>
                  <span className="ml-2 font-medium capitalize">
                    {roommatePreferences?.sleepTime}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {isOwner && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-primary-200 bg-primary-50 p-5">
                <h2 className="text-lg font-semibold text-primary-900">
                  Applicants for this listing
                </h2>
                <p className="text-sm text-primary-700 mt-1">
                  Review applications and accept or reject applicants directly.
                </p>
              </div>
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Applicant requests ({propertyApplications.length})
                  </h3>
                  {propertyApplications.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No one has applied to this property yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {propertyApplications.map((app) => (
                        <div
                          key={app._id}
                          className="rounded-2xl border border-gray-200 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {formatFullName(app.applicant?.name) ||
                                  app.applicant?.email ||
                                  "Applicant"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {app.applicant?.email || "No email"}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-semibold ${getMatchScoreColor(app.finalScore ?? app.matchScore)}`}
                                >
                                  {app.finalScore ?? app.matchScore ?? "--"}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getMatchScoreLabel(
                                    app.finalScore ?? app.matchScore,
                                  )}
                                </span>
                              </div>
                              {app.aiScore == null && (
                                <p className="mt-1 text-xs text-gray-400">
                                  AI compatibility pending
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                app.status === "accepted"
                                  ? "success"
                                  : app.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {app.status
                                ? app.status.charAt(0).toUpperCase() +
                                  app.status.slice(1)
                                : "Pending"}
                            </Badge>
                          </div>
                          {app.message && (
                            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                              {app.message}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span>{formatDate(app.createdAt)}</span>
                          </div>
                          {app.status === "pending" && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => acceptApplication(app._id)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => rejectApplication(app._id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="h-5 w-5 text-primary-600" />
                  <span className="text-3xl font-bold">
                    {rent?.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </div>
                {deposit > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Deposit: {formatCurrency(deposit)}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{formatTenantCount(tenants, maxTenants)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>From {formatDate(availableFrom)}</span>
                </div>
                <div className="pt-4 border-t space-y-1">
                  <p className="text-sm text-gray-500 mb-2">Listed by</p>
                  <p className="font-medium">{ownerName}</p>
                  <p className="text-sm text-gray-500">
                    {ownerEmail || "Contact owner through the app"}
                  </p>
                </div>
              </div>
              {isOwner ? (
                <div className="rounded-2xl bg-primary-50 p-4 text-sm text-primary-700">
                  You own this property. Applicants are listed below.
                </div>
              ) : hasApplied ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700">
                    Already applied
                  </div>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleMessageOwner}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Owner
                  </Button>
                </div>
              ) : !showApplyForm ? (
                <Button
                  className="w-full"
                  onClick={() => setShowApplyForm(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              ) : (
                <form onSubmit={handleApply} className="space-y-3">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    rows={3}
                    placeholder="Introduce yourself..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      isLoading={isApplying}
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
