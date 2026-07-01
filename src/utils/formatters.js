import { format, formatDistanceToNow } from "date-fns";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatFullName = (name) => {
  if (!name || (!name.firstName && !name.lastName)) return "";
  return `${name.firstName || ""} ${name.lastName || ""}`.trim();
};

export const formatTenantCount = (tenants, maxTenants) => {
  const occupied = Array.isArray(tenants) ? tenants.length : 0;
  const max = Number(maxTenants) || 1;
  const tenantLabel = max === 1 ? "tenant" : "tenants";
  if (occupied === 0) return `No tenants yet · ${max} ${tenantLabel}`;
  if (occupied === max) return `${occupied} of ${max} ${tenantLabel} (full)`;
  return `${occupied} of ${max} ${tenantLabel}`;
};

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-green-100 text-green-800",
  shortlisted: "bg-blue-100 text-blue-800",
};
