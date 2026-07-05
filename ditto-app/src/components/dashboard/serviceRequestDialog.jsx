import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  useReassignServiceRequestMutation,
  useUpdateServiceRequestStatusMutation,
} from "../../store/api/serviceRequestsApi";
import { useGetWorkersQuery } from "../../store/api/workersApi";
import { formatDistanceKm } from "../../utils/distance";
import ServiceChatPanel from "./serviceChatPanel";
import {
  formatServiceDate,
  getApiErrorMessage,
  getServiceStatus,
  isChatEnabled,
} from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function workerLabel(worker) {
  return worker?.bio?.trim() || `Profesional #${worker?.id ?? ""}`;
}

export default function ServiceRequestDialog({
  open,
  onClose,
  request,
  currentUserId,
  otherUserId,
  counterpartLabel,
  isWorker = false,
}) {
  const [updateStatus, { isLoading, error }] = useUpdateServiceRequestStatusMutation();
  const [reassignRequest, { isLoading: isReassigning, error: reassignError }] =
    useReassignServiceRequestMutation();
  const { data: workers = [] } = useGetWorkersQuery(undefined, { skip: isWorker });
  const [newWorkerId, setNewWorkerId] = useState("");

  if (!request) return null;

  const status = getServiceStatus(request.status);
  const chatEnabled = Boolean(otherUserId) && isChatEnabled(request.status);
  const distanceLabel = formatDistanceKm(request.distance_km);

  const changeStatus = async (nextStatus) => {
    try {
      await updateStatus({ requestId: request.id, status: nextStatus }).unwrap();
    } catch {
      // El error se muestra dentro del diálogo.
    }
  };

  const handleReassign = async () => {
    if (!newWorkerId) return;
    try {
      await reassignRequest({
        requestId: request.id,
        workerId: Number(newWorkerId),
      }).unwrap();
      setNewWorkerId("");
    } catch {
      // El error se muestra dentro del diálogo.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden", bgcolor: "#FCFCF5" } }}
    >
      <DialogTitle sx={{ ...FONT, p: 0 }}>
        <Box className="px-5 py-4 flex items-center justify-between gap-4 border-b border-gray-200">
          <Box className="min-w-0">
            <Typography sx={FONT} className="text-xs font-bold text-primary-700">
              Solicitud #{request.id}
            </Typography>
            <Typography sx={FONT} className="text-lg font-bold text-gray-900 truncate mt-0.5">
              {counterpartLabel}
            </Typography>
            {distanceLabel ? (
              <Typography sx={FONT} className="text-xs text-gray-500 mt-1">
                A {distanceLabel} de tu ubicación
              </Typography>
            ) : null}
          </Box>
          <Box className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status.className}`}>
              {status.label}
            </span>
            <IconButton onClick={onClose} aria-label="Cerrar">
              <i className="ti ti-x" aria-hidden="true" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] min-h-[520px]">
          <Box className="p-5 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
            {!isWorker && request.status === "rejected" ? (
              <Alert severity="warning" className="mb-4">
                El trabajador rechazó esta solicitud. Puedes chatear para coordinar, elegir otro
                profesional o cancelar la solicitud.
              </Alert>
            ) : null}

            <Typography sx={{ ...FONT, color: "#676767" }} className="text-xs font-bold uppercase tracking-wide">
              Descripción
            </Typography>
            <Typography
              sx={{ ...FONT, color: "#676767" }}
              className="text-sm leading-relaxed mt-2 whitespace-pre-wrap"
            >
              {request.description}
            </Typography>

            <Box className="mt-5 rounded-2xl bg-primary-50 border border-primary-200 p-4">
              <Typography sx={{ ...FONT, color: "#676767" }} className="text-xs text-gray-500">
                Fecha de solicitud
              </Typography>
              <Typography sx={FONT} className="text-sm font-bold text-gray-900 mt-1">
                {formatServiceDate(request.created_at)}
              </Typography>
            </Box>

            {error ? (
              <Alert severity="error" className="mt-4">
                {getApiErrorMessage(error, "No se pudo actualizar la solicitud.")}
              </Alert>
            ) : null}
            {reassignError ? (
              <Alert severity="error" className="mt-4">
                {getApiErrorMessage(reassignError, "No se pudo reasignar la solicitud.")}
              </Alert>
            ) : null}

            <Box className="mt-auto pt-6 flex flex-col gap-3">
              {isWorker && request.status === "pending" ? (
                <Box className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => changeStatus("rejected")}
                    sx={{ ...FONT, borderRadius: 3, color: "#c2410c", borderColor: "#fdba74" }}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => changeStatus("in_progress")}
                    sx={{ ...FONT, borderRadius: 3, bgcolor: "#BB6AF0", "&:hover": { bgcolor: "#a855df" } }}
                  >
                    {isLoading ? <CircularProgress size={18} color="inherit" /> : "Aceptar"}
                  </Button>
                </Box>
              ) : null}

              {isWorker && request.status === "in_progress" ? (
                <Box className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => changeStatus("cancelled")}
                    sx={{ ...FONT, borderRadius: 3, color: "#6b7280", borderColor: "#d1d5db" }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => changeStatus("completed")}
                    sx={{ ...FONT, borderRadius: 3, bgcolor: "#BB6AF0", "&:hover": { bgcolor: "#a855df" } }}
                  >
                    Completar
                  </Button>
                </Box>
              ) : null}

              {!isWorker && request.status === "rejected" ? (
                <Box className="flex flex-col gap-3">
                  <TextField
                    select
                    size="small"
                    label="Elegir otro trabajador"
                    value={newWorkerId}
                    onChange={(event) => setNewWorkerId(event.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, ...FONT } }}
                  >
                    {workers
                      .filter((worker) => worker.id !== request.worker_id)
                      .map((worker) => (
                        <MenuItem key={worker.id} value={String(worker.id)}>
                          {workerLabel(worker)}
                          {worker.distance_km != null
                            ? ` · ${formatDistanceKm(worker.distance_km)}`
                            : ""}
                        </MenuItem>
                      ))}
                  </TextField>
                  <Button
                    variant="contained"
                    disabled={!newWorkerId || isReassigning}
                    onClick={handleReassign}
                    sx={{ ...FONT, borderRadius: 3, bgcolor: "#BB6AF0", "&:hover": { bgcolor: "#a855df" } }}
                  >
                    {isReassigning ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      "Reenviar a otro trabajador"
                    )}
                  </Button>
                </Box>
              ) : null}

              {!isWorker && ["pending", "rejected", "in_progress"].includes(request.status) ? (
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={isLoading}
                  onClick={() => changeStatus("cancelled")}
                  sx={{ ...FONT, borderRadius: 3, color: "#6b7280", borderColor: "#d1d5db" }}
                >
                  Cancelar solicitud
                </Button>
              ) : null}
            </Box>
          </Box>

          <Box className="min-h-[420px]">
            <ServiceChatPanel
              currentUserId={currentUserId}
              otherUserId={otherUserId}
              title={counterpartLabel}
              enabled={chatEnabled}
              requestStatus={request.status}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
