import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useGetWorkerServiceRequestsQuery } from "../../store/api/serviceRequestsApi";
import ServiceRequestDialog from "./serviceRequestDialog";
import {
  getApiErrorMessage,
  getServiceStatus,
} from "./serviceRequestUi";

const courseProgress = [
  { title: "Instalaciones eléctricas básicas", percent: 80 },
  { title: "Atención al cliente", percent: 45 },
];

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };
const avatarSx = {
  bgcolor: "#BB6AF0",
  color: "#fff",
  width: 40,
  height: 40,
  fontSize: 14,
  fontWeight: 700,
};

export default function WorkerDashboard() {
  const {
    user,
    workerProfile,
    displayName,
    trade,
    initials,
    isLoading: isLoadingUser,
  } = useCurrentUser();
  const workerId = workerProfile?.id;
  const [dialogRequestId, setDialogRequestId] = useState(null);
  const {
    data: requests = [],
    isLoading,
    error,
  } = useGetWorkerServiceRequestsQuery(workerId, {
    skip: !workerId,
    pollingInterval: 15000,
  });

  const orderedRequests = useMemo(() => {
    const priority = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };
    return [...requests].sort(
      (a, b) =>
        (priority[a.status] ?? 4) - (priority[b.status] ?? 4) ||
        new Date(b.created_at) - new Date(a.created_at),
    );
  }, [requests]);
  const dialogRequest =
    requests.find(({ id }) => id === dialogRequestId) ?? null;
  const activeRequests = requests.filter(({ status }) =>
    ["pending", "in_progress"].includes(status),
  ).length;
  const completedRequests = requests.filter(
    ({ status }) => status === "completed",
  ).length;

  if (isLoadingUser) {
    return (
      <Box className="min-h-[60vh] flex items-center justify-center bg-[#FCFCF5]">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !workerProfile) {
    return (
      <Box className="p-4 md:p-8 min-h-[60vh] bg-[#FCFCF5]">
        <Alert severity="warning">
          Necesitas iniciar sesión como trabajador y completar tu perfil para ver solicitudes.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{ ...FONT, bgcolor: "#FCFCF5", color: "#1a1a1a", minHeight: "100%" }}
      className="p-4 md:p-8 min-w-0 w-full text-left"
    >
      <Box className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <Box>
          <Typography sx={FONT} className="text-sm text-gray-600">
            Hola,
          </Typography>
          <Typography sx={FONT} className="text-2xl font-bold text-gray-900">
            {displayName} — {trade || "Trabajador"}
          </Typography>
        </Box>
        <Box className="flex items-center gap-3">
          <Chip
            label={workerProfile.experience || "Perfil profesional"}
            sx={{ ...FONT, bgcolor: "#f4e7fd", color: "#874cad", fontWeight: 700 }}
          />
          <Avatar sx={avatarSx}>{initials}</Avatar>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          ["Servicios completados", completedRequests, true],
          ["Solicitudes activas", activeRequests, false],
          ["Clasificación", workerProfile.classification_level ?? 0, true],
        ].map(([label, value, primary]) => (
          <Box
            key={label}
            className={`border rounded-2xl p-5 min-w-0 ${
              primary
                ? "bg-primary-50 border-primary-200"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <Typography
              sx={FONT}
              className={`text-sm font-medium mb-1 truncate ${
                primary ? "text-primary-700" : "text-gray-600"
              }`}
            >
              {label}
            </Typography>
            <Typography sx={FONT} className="text-primary-700 text-3xl font-bold">
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
        Solicitudes recientes
      </Typography>
      {error ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(error, "No se pudieron cargar las solicitudes.")}
        </Alert>
      ) : null}
      <Box className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
        {isLoading ? (
          <Box className="p-8 flex justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!isLoading && orderedRequests.length === 0 ? (
          <Typography sx={FONT} className="text-sm text-gray-500 p-5">
            Aún no tienes solicitudes de servicio.
          </Typography>
        ) : null}
        {orderedRequests.map((request, index) => {
          const status = getServiceStatus(request.status);
          return (
            <Box
              component="button"
              type="button"
              onClick={() => setDialogRequestId(request.id)}
              key={request.id}
              className={`w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 text-left bg-paper hover:bg-primary-50/40 ${
                index < orderedRequests.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <Typography sx={FONT} className="text-sm font-semibold text-gray-900 min-w-0 truncate">
                Cliente #{request.user_id} — {request.description}
              </Typography>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 self-start sm:self-center ${status.className}`}
              >
                {status.label}
              </span>
            </Box>
          );
        })}
      </Box>

      <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
        Progreso de aprendizaje
      </Typography>
      <Box className="flex flex-col gap-5">
        {courseProgress.map((course) => (
          <Box key={course.title}>
            <Box className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span className="min-w-0 truncate pr-2">{course.title}</span>
              <span className="flex-shrink-0 text-primary-700 font-bold">
                {course.percent}%
              </span>
            </Box>
            <LinearProgress
              variant="determinate"
              value={course.percent}
              sx={{
                height: 8,
                borderRadius: 6,
                backgroundColor: "#f4e7fd",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#BB6AF0",
                  borderRadius: 6,
                },
              }}
            />
          </Box>
        ))}
      </Box>

      <ServiceRequestDialog
        open={Boolean(dialogRequest)}
        onClose={() => setDialogRequestId(null)}
        request={dialogRequest}
        currentUserId={user.id}
        otherUserId={dialogRequest?.user_id}
        counterpartLabel={`Cliente #${dialogRequest?.user_id ?? ""}`}
        isWorker
      />
    </Box>
  );
}
