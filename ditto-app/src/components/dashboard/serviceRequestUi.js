export const SERVICE_STATUS = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  rejected: {
    label: "Rechazado por trabajador",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  in_progress: {
    label: "En progreso",
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
  completed: {
    label: "Completado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function isChatEnabled(status) {
  return ["pending", "rejected", "in_progress", "completed"].includes(status);
}

export function getServiceStatus(status) {
  return SERVICE_STATUS[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };
}

export function formatServiceDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("es-SV", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getApiErrorMessage(error, fallback) {
  return error?.data?.detail ?? fallback;
}
