import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useCreateServiceRequestMutation,
  useGetUserServiceRequestsQuery,
} from "../../store/api/serviceRequestsApi";
import { useGetWorkersQuery } from "../../store/api/workersApi";
import ServiceRequestDialog from "./serviceRequestDialog";
import {
  formatServiceDate,
  getApiErrorMessage,
  getServiceStatus,
} from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };
const avatarSx = {
  bgcolor: "#BB6AF0",
  color: "#fff",
  width: 40,
  height: 40,
  fontSize: 14,
  fontWeight: 700,
};

function workerLabel(worker) {
  return worker?.bio?.trim() || `Profesional #${worker?.id ?? ""}`;
}

function workerInitials(worker) {
  const label = workerLabel(worker);
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getFirstName(displayName) {
  if (!displayName) return "";
  if (displayName.includes("@")) return displayName.split("@")[0];
  return displayName.trim().split(/\s+/)[0];
}

export default function UserDashboard() {
  const { user, displayName, isLoading: isLoadingUser } = useCurrentUser();
  const firstName = getFirstName(displayName);
  const userId = user?.id;
  const [description, setDescription] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [dialogRequestId, setDialogRequestId] = useState(null);

  const {
    data: workers = [],
    isLoading: isLoadingWorkers,
    error: workersError,
  } = useGetWorkersQuery();
  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useGetUserServiceRequestsQuery(userId, {
    skip: !userId,
    pollingInterval: 15000,
  });
  const [createRequest, { isLoading: isCreating, error: createError }] =
    useCreateServiceRequestMutation();

  const workersById = useMemo(
    () => new Map(workers.map((worker) => [worker.id, worker])),
    [workers],
  );
  const suggestions = workers.slice(0, 3);
  const orderedRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [requests],
  );
  const dialogRequest =
    requests.find(({ id }) => id === dialogRequestId) ?? null;
  const dialogWorker = dialogRequest
    ? workersById.get(dialogRequest.worker_id)
    : null;

  const handleCreate = async (event) => {
    event.preventDefault();
    const cleanDescription = description.trim();
    if (!cleanDescription || !selectedWorkerId || !userId) return;

    try {
      const request = await createRequest({
        userId,
        workerId: selectedWorkerId,
        description: cleanDescription,
      }).unwrap();
      setDescription("");
      setDialogRequestId(request.id);
    } catch {
      // El error de la API se presenta debajo del buscador.
    }
  };

  if (isLoadingUser) {
    return (
      <Box className="min-h-[60vh] flex items-center justify-center bg-[#FCFCF5]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ ...FONT, bgcolor: "#FCFCF5", color: "#1a1a1a", minHeight: "100%" }}
      className="p-4 md:p-8 min-w-0 w-full text-left"
    >
      <Typography sx={FONT} className="text-2xl font-bold text-gray-900 mb-6">
        Hola, {firstName} — ¿qué necesitas resolver hoy?
      </Typography>

      <Box
        component="form"
        onSubmit={handleCreate}
        className="bg-primary-500 rounded-2xl p-5 mb-8"
      >
        <Typography sx={FONT} className="text-white text-sm font-medium mb-3">
          Escribe tu necesidad y elige un trabajador verificado
        </Typography>
        <Box className="bg-paper rounded-xl px-3 flex items-center gap-2">
          <i className="ti ti-search text-primary-400 flex-shrink-0 text-lg" aria-hidden="true" />
          <TextField
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Necesito a alguien que revise una fuga de agua..."
            variant="standard"
            fullWidth
            inputProps={{ maxLength: 2000, "aria-label": "Descripción del servicio" }}
            InputProps={{ disableUnderline: true }}
            sx={{ "& .MuiInputBase-root": { ...FONT, minHeight: 48, fontSize: 14 } }}
          />
          <Button
            type="submit"
            disabled={!description.trim() || !selectedWorkerId || isCreating}
            sx={{
              ...FONT,
              color: "#874cad",
              fontWeight: 700,
              whiteSpace: "nowrap",
              minWidth: { xs: 42, sm: 92 },
            }}
          >
            {isCreating ? (
              <CircularProgress size={18} />
            ) : (
              <>
                <span className="hidden sm:inline">Solicitar</span>
                <i className="ti ti-send sm:hidden" aria-hidden="true" />
              </>
            )}
          </Button>
        </Box>
        {createError ? (
          <Alert severity="error" className="mt-3">
            {getApiErrorMessage(createError, "No se pudo enviar la solicitud.")}
          </Alert>
        ) : null}
      </Box>

      <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
        Sugerencias de la IA
      </Typography>
      {workersError ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(workersError, "No se pudieron cargar los trabajadores.")}
        </Alert>
      ) : null}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoadingWorkers ? (
          <Box className="col-span-full py-8 flex justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {suggestions.map((worker, index) => {
          const selected = selectedWorkerId === worker.id;
          return (
            <Box
              component="button"
              type="button"
              onClick={() => setSelectedWorkerId(worker.id)}
              key={worker.id}
              aria-pressed={selected}
              className={`rounded-2xl p-5 min-w-0 border text-left transition-shadow hover:shadow-md ${
                selected || index % 2 === 0
                  ? "bg-primary-50 border-primary-200"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Avatar sx={avatarSx} className="mb-3">
                {workerInitials(worker)}
              </Avatar>
              <Typography sx={FONT} className="text-base font-bold text-gray-900 truncate">
                {workerLabel(worker)}
              </Typography>
              <Typography sx={FONT} className="text-sm font-semibold text-primary-700 mt-1">
                {worker.is_verified ? "Trabajador verificado" : "Perfil disponible"}
                {selected ? " · Seleccionado" : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
        Servicio activo
      </Typography>
      {requestsError ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(requestsError, "No se pudieron cargar tus solicitudes.")}
        </Alert>
      ) : null}
      <Box className="border border-gray-200 rounded-2xl overflow-hidden">
        {isLoadingRequests ? (
          <Box className="p-8 flex justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!isLoadingRequests && orderedRequests.length === 0 ? (
          <Typography sx={FONT} className="text-sm text-gray-500 p-5">
            Aún no tienes solicitudes de servicio.
          </Typography>
        ) : null}
        {orderedRequests.map((request, index) => {
          const worker = workersById.get(request.worker_id);
          const status = getServiceStatus(request.status);
          return (
            <Box
              component="button"
              type="button"
              onClick={() => setDialogRequestId(request.id)}
              key={request.id}
              className={`w-full bg-paper px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-left hover:bg-primary-50/40 ${
                index < orderedRequests.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <Box className="min-w-0">
                <Typography sx={FONT} className="text-base font-bold text-gray-900 truncate">
                  {workerLabel(worker)} — {request.description}
                </Typography>
                <Typography sx={FONT} className="text-sm text-gray-600 mt-1">
                  {formatServiceDate(request.created_at)}
                </Typography>
              </Box>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${status.className}`}
              >
                {status.label}
              </span>
            </Box>
          );
        })}
      </Box>

      <ServiceRequestDialog
        open={Boolean(dialogRequest)}
        onClose={() => setDialogRequestId(null)}
        request={dialogRequest}
        currentUserId={userId}
        otherUserId={dialogWorker?.user_id}
        counterpartLabel={workerLabel(dialogWorker)}
      />
    </Box>
  );
}
