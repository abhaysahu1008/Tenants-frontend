import { ChevronDown, ChevronUp, FileText, Home, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiMatchCard } from "../components/application/AiMatchCard";
import { Badge } from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useApplication } from "../context/ApplicationContext";
import { STATUS_COLORS, formatDate, formatFullName } from "../utils/formatters";

export const ApplicationsPage = () => {
  const { applications, fetchMyApplications, isLoading } = useApplication();
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const toggleExpand = (appId) =>
    setExpandedApp(expandedApp === appId ? null : appId);

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      {applications.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications yet</p>
            <Link
              to="/properties"
              className="text-primary-600 hover:underline mt-2 inline-block"
            >
              Browse properties
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id} className="overflow-hidden">
              <CardBody className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        {app.property?._id ? (
                          <Link
                            to={`/properties/${app.property._id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 break-words"
                          >
                            {app.property?.title || "Untitled listing"}
                          </Link>
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">
                            {app.property?.title || "Property listing"}
                          </p>
                        )}
                        <div className="mt-1 text-sm text-gray-500">
                          {app.property?.propertyType || "Home"}
                        </div>
                      </div>
                      <Badge
                        className={
                          STATUS_COLORS[app.status] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {app.status
                          ? app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)
                          : "Pending"}
                      </Badge>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-gray-500 sm:grid-cols-3">
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {app.property?.propertyType || "Home"}
                      </span>
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {formatDate(app.createdAt)}
                      </span>
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {formatFullName(app.applicant?.name) || "Applicant"}
                      </span>
                    </div>

                    {app.message && (
                      <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {app.message}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(app._id)}
                    className="self-start rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
                  >
                    {expandedApp === app._id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {expandedApp === app._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <AiMatchCard applicationId={app._id} />
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
