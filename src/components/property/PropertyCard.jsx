import { IndianRupee, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DEFAULT_PROPERTY_IMAGE,
  getMatchScoreColor,
  getMatchScoreLabel,
  normalizePropertyImages,
} from "../../utils/constants";
import { formatCurrency, formatTenantCount } from "../../utils/formatters";
import { Badge } from "../ui/Badge";
import { Card, CardBody } from "../ui/Card";

export const PropertyCard = ({ property, matchScore, showMatch = false }) => {
  const {
    _id,
    title,
    rent,
    deposit,
    propertyType,
    location,
    furnished,
    maxTenants,
    tenants,
    images,
    isAvailable,
  } = property;

  const imageList = normalizePropertyImages(images);
  const imageUrl = imageList.length > 0 ? imageList[0] : DEFAULT_PROPERTY_IMAGE;

  return (
    <Card className="overflow-hidden group">
      <Link to={`/properties/${_id}`}>
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={imageUrl}
            alt={title || "Property placeholder"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_PROPERTY_IMAGE;
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="primary">{propertyType}</Badge>
            <Badge
              variant={furnished === "unfurnished" ? "outline" : "success"}
            >
              {furnished === "fully"
                ? "Fully Furnished"
                : furnished === "semi"
                  ? "Semi Furnished"
                  : "Unfurnished"}
            </Badge>
          </div>
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="danger" className="text-sm px-3 py-1">
                Not Available
              </Badge>
            </div>
          )}
        </div>

        <CardBody className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {location?.city || "City unknown"}
              {location?.address ? ` · ${location.address}` : ""}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <IndianRupee className="h-4 w-4 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              {rent?.toLocaleString() || "0"}
            </span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          {deposit > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Deposit: {formatCurrency(deposit)}
            </p>
          )}
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{formatTenantCount(tenants, maxTenants)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location?.city || "City"}</span>
            </div>
          </div>
          {showMatch && matchScore !== undefined && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Match Score
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getMatchScoreColor(matchScore)}`}
                >
                  {matchScore}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getMatchScoreLabel(matchScore)}
              </p>
            </div>
          )}
        </CardBody>
      </Link>
    </Card>
  );
};
