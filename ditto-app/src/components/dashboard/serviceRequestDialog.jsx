import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";

import { useUpdateServiceRequestStatusMutation } from "../../store/api/serviceRequestsApi";
import ServiceChatPanel from "./serviceChatPanel";
import {
  formatServiceDate,
  getApiErrorMessage,
  getServiceStatus,
} from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

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

  if (!request) return null;

  const status = getServiceStatus(request.status);
  const chatEnabled =
    Boolean(otherUserId) && ["in_progress", "completed"].includes(request.status);

  const changeStatus = async (nextStatus) => {
    try {
      await updateStatus({ requestId: request.id, status: nextStatus }).unwrap();
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
            <Typography sx={FONT} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Descripción
            </Typography>
            <Typography sx={FONT} className="text-sm text-gray-800 leading-relaxed mt-2 whitespace-pre-wrap">
              {request.description}
            </Typography>

            <Box className="mt-5 rounded-2xl bg-primary-50 border border-primary-200 p-4">
              <Typography sx={FONT} className="text-xs text-gray-500">
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

            <Box className="mt-auto pt-6">
              {isWorker && request.status === "pending" ? (
                <Box className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => changeStatus("cancelled")}
                    sx={{ ...FONT, borderRadius: 3, color: "#6b7280", borderColor: "#d1d5db" }}
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

              {!isWorker && ["pending", "in_progress"].includes(request.status) ? (
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
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
