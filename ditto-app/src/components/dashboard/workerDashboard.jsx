import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useGeolocation } from "../../hooks/useGeolocation";
import {
  useGetFeedServiceRequestsQuery,
  useGetWorkerServiceRequestsQuery,
} from "../../store/api/serviceRequestsApi";
import { useUpdateWorkerLocationMutation } from "../../store/api/workersApi";
import { formatDistanceKm } from "../../utils/distance";
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
  const lastSyncedLocationRef = useRef("");

  const { coords, error: geoError, isLoading: isLoadingGeo, refresh: refreshGeo } =
    useGeolocation();
  const [updateWorkerLocation] = useUpdateWorkerLocationMutation();

  const requestQueryArgs = useMemo(
    () =>
      workerId && coords
        ? {
            workerId,
            lat: coords.latitude,
            lng: coords.longitude,
          }
        : workerId
          ? { workerId }
          : { workerId: undefined },
    [workerId, coords],
  );

  const {
    data: myRequests = [],
    isLoading: isLoadingMine,
    error: myRequestsError,
  } = useGetWorkerServiceRequestsQuery(requestQueryArgs, {
    skip: !workerId,
    pollingInterval: 15000,
  });

  const feedQueryArgs = useMemo(
    () =>
      coords
        ? { lat: coords.latitude, lng: coords.longitude, radiusKm: 50 }
        : {},
    [coords],
  );

  const {
    data: feedRequests = [],
    isLoading: isLoadingFeed,
    error: feedError,
  } = useGetFeedServiceRequestsQuery(feedQueryArgs, {
    pollingInterval: 15000,
  });

  useEffect(() => {
    if (!workerId || !coords) return;
    const locationKey = `${coords.latitude},${coords.longitude}`;
    if (lastSyncedLocationRef.current === locationKey) return;
    lastSyncedLocationRef.current = locationKey;
    updateWorkerLocation({
      workerId,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }, [workerId, coords, updateWorkerLocation]);

  const allRequests = useMemo(() => {
    const byId = new Map();
    for (const request of [...feedRequests, ...myRequests]) {
      byId.set(request.id, request);
    }
    return [...byId.values()];
  }, [feedRequests, myRequests]);

  const orderedMine = useMemo(() => {
    const priority = { pending: 0, in_progress: 1, rejected: 2, completed: 3, cancelled: 4 };
    return [...myRequests].sort(
      (a, b) =>
        (priority[a.status] ?? 5) - (priority[b.status] ?? 5) ||
        (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity) ||
        new Date(b.created_at) - new Date(a.created_at),
    );
  }, [myRequests]);

  const dialogRequest =
    allRequests.find(({ id }) => id === dialogRequestId) ?? null;

  const activeRequests = myRequests.filter(({ status }) =>
    ["pending", "in_progress"].includes(status),
  ).length;
  const completedRequests = myRequests.filter(
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
          <Typography sx={FONT} className="text-sm text-gray-700">
            Hola,
          </Typography>
          <Typography sx={FONT} className="text-2xl font-bold text-gray-900">
            {displayName} — {trade || "Trabajador"}
          </Typography>
        </Box>
        <Box className="flex items-center gap-3 min-w-[120px] justify-end">
          {isLoadingGeo ? (
            <CircularProgress size={16} />
          ) : coords ? (
            <Typography sx={FONT} className="text-xs text-emerald-700 font-semibold">
              <i className="ti ti-map-pin mr-1" aria-hidden="true" />
              Ubicación activa
            </Typography>
          ) : (
            <Button size="small" onClick={refreshGeo} sx={{ ...FONT, textTransform: "none" }}>
              Activar ubicación
            </Button>
          )}
          <Chip
            label={workerProfile.experience || "Perfil profesional"}
            sx={{ ...FONT, bgcolor: "#f4e7fd", color: "#874cad", fontWeight: 700 }}
          />
          <Avatar sx={avatarSx}>{initials}</Avatar>
        </Box>
      </Box>

      {geoError ? (
        <Alert severity="info" className="mb-4">
          Activa la ubicación para ver solicitudes cercanas en el feed. {geoError}
        </Alert>
      ) : null}

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
                primary ? "text-primary-700" : "text-gray-900"
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
        Feed de solicitudes {coords ? "cercanas" : "disponibles"}
      </Typography>
      {feedError ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(feedError, "No se pudo cargar el feed.")}
        </Alert>
      ) : null}
      <Box className="border border-primary-200 rounded-2xl overflow-hidden mb-8 bg-primary-50/30">
        {isLoadingFeed && feedRequests.length === 0 ? (
          <Box className="p-8 flex justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!isLoadingFeed && feedRequests.length === 0 ? (
          <Typography sx={FONT} className="text-sm text-gray-700 p-5">
            No hay solicitudes abiertas en este momento.
          </Typography>
        ) : null}
        {feedRequests.map((request, index) => {
          const status = getServiceStatus(request.status);
          const distance = formatDistanceKm(request.distance_km);
          return (
            <Box
              component="button"
              type="button"
              onClick={() => setDialogRequestId(request.id)}
              key={request.id}
              className={`w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 text-left bg-paper hover:bg-primary-50/40 ${
                index < feedRequests.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <Typography sx={FONT} className="text-sm font-semibold text-gray-900 min-w-0 truncate">
                Cliente #{request.user_id} — {request.description}
                {distance ? ` · ${distance}` : ""}
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
        Mis trabajos asignados
      </Typography>
      {myRequestsError ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(myRequestsError, "No se pudieron cargar tus solicitudes.")}
        </Alert>
      ) : null}
      <Box className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
        {isLoadingMine && orderedMine.length === 0 ? (
          <Box className="p-8 flex justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!isLoadingMine && orderedMine.length === 0 ? (
          <Typography sx={FONT} className="text-sm text-gray-700 p-5">
            Aún no tienes trabajos asignados. Acepta una solicitud del feed.
          </Typography>
        ) : null}
        {orderedMine.map((request, index) => {
          const status = getServiceStatus(request.status);
          const distance = formatDistanceKm(request.distance_km);
          return (
            <Box
              component="button"
              type="button"
              onClick={() => setDialogRequestId(request.id)}
              key={request.id}
              className={`w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 text-left bg-paper hover:bg-primary-50/40 ${
                index < orderedMine.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <Typography sx={FONT} className="text-sm font-semibold text-gray-900 min-w-0 truncate">
                Cliente #{request.user_id} — {request.description}
                {distance ? ` · ${distance}` : ""}
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
        workerId={workerId}
      />
    </Box>
  );
}
