import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useGeolocation } from "../../hooks/useGeolocation";
import {
  useCreateServiceRequestMutation,
  useGetUserServiceRequestsQuery,
} from "../../store/api/serviceRequestsApi";
import { useUpdateUserLocationMutation } from "../../store/api/usersApi";
import ServiceRequestDialog from "./serviceRequestDialog";
import ServiceIntakeChat from "./serviceIntakeChat";
import {
  formatServiceDate,
  getApiErrorMessage,
  getServiceStatus,
} from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function requestTitle(request) {
  if (!request?.worker_id) return "Publicado en el feed — esperando trabajador";
  return `Solicitud #${request.id}`;
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
  const [dialogRequestId, setDialogRequestId] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [pendingDescription, setPendingDescription] = useState("");
  const lastSyncedLocationRef = useRef("");

  const { coords, error: geoError, isLoading: isLoadingGeo, refresh: refreshGeo } =
    useGeolocation();
  const [updateUserLocation] = useUpdateUserLocationMutation();

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

  useEffect(() => {
    if (!userId || !coords) return;
    const locationKey = `${coords.latitude},${coords.longitude}`;
    if (lastSyncedLocationRef.current === locationKey) return;
    lastSyncedLocationRef.current = locationKey;
    updateUserLocation({
      userId,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }, [userId, coords, updateUserLocation]);

  const orderedRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [requests],
  );
  const dialogRequest =
    requests.find(({ id }) => id === dialogRequestId) ?? null;

  const handleCreate = (event) => {
    event.preventDefault();
    const cleanDescription = description.trim();
    if (!cleanDescription || !userId) return;

    setPendingDescription(cleanDescription);
    setIntakeOpen(true);
  };

  const handleConfirmIntake = async (finalDescription) => {
    if (!finalDescription.trim() || !userId) return;

    try {
      const request = await createRequest({
        userId,
        description: finalDescription.trim(),
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      }).unwrap();
      setDescription("");
      setPendingDescription("");
      setIntakeOpen(false);
      setDialogRequestId(request.id);
    } catch {
      // El error de la API se presenta debajo del buscador.
    }
  };

  const handleFallbackPublish = async (fallbackDescription) => {
    await handleConfirmIntake(fallbackDescription);
  };

  const handleCloseIntake = () => {
    setIntakeOpen(false);
    setPendingDescription("");
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
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <Typography sx={FONT} className="text-2xl font-bold text-gray-900">
          Hola, {firstName} — ¿qué necesitas resolver hoy?
        </Typography>
        <Box className="flex items-center gap-2 min-w-[120px] justify-end">
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
        </Box>
      </Box>

      {geoError ? (
        <Alert severity="info" className="mb-4">
          Activa la ubicación para que los trabajadores cercanos vean tu solicitud. {geoError}
        </Alert>
      ) : null}

      <Box
        component="form"
        onSubmit={handleCreate}
        className="bg-primary-500 rounded-2xl p-5 mb-8"
      >
        <Typography sx={FONT} className="text-white text-sm font-medium mb-3">
          Publica lo que necesitas. Los trabajadores cercanos podrán verlo y aceptarlo.
        </Typography>
        <Box className="bg-paper rounded-xl px-3 flex items-center gap-2">
          <i className="ti ti-pencil text-gray-900 flex-shrink-0 text-lg" aria-hidden="true" />
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
            disabled={!description.trim() || isCreating}
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
                <span className="hidden sm:inline">Publicar</span>
                <i className="ti ti-send sm:hidden" aria-hidden="true" />
              </>
            )}
          </Button>
        </Box>
        {createError ? (
          <Alert severity="error" className="mt-3">
            {getApiErrorMessage(createError, "No se pudo publicar la solicitud.")}
          </Alert>
        ) : null}
      </Box>

      <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
        Mis solicitudes
      </Typography>
      {requestsError ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(requestsError, "No se pudieron cargar tus solicitudes.")}
        </Alert>
      ) : null}
      <Box className="bg-primary-100 border border-primary-200 rounded-2xl overflow-hidden">
        {isLoadingRequests && orderedRequests.length === 0 ? (
          <Box className="p-8 flex justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!isLoadingRequests && orderedRequests.length === 0 ? (
          <Typography sx={FONT} className="text-sm text-gray-700 p-5">
            Aún no has publicado ninguna solicitud.
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
              className={`w-full bg-paper px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-left hover:bg-primary-50/40 ${
                index < orderedRequests.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <Box className="min-w-0">
                <Typography sx={FONT} className="text-base font-bold text-gray-900 truncate">
                  {request.description}
                </Typography>
                <Typography sx={FONT} className="text-sm text-gray-600 mt-1">
                  {requestTitle(request)} · {formatServiceDate(request.created_at)}
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

      <ServiceIntakeChat
        open={intakeOpen}
        initialDescription={pendingDescription}
        userId={userId}
        onClose={handleCloseIntake}
        onConfirm={handleConfirmIntake}
        onFallbackPublish={handleFallbackPublish}
        isPublishing={isCreating}
      />

      <ServiceRequestDialog
        open={Boolean(dialogRequest)}
        onClose={() => setDialogRequestId(null)}
        request={dialogRequest}
        currentUserId={userId}
        counterpartLabel={requestTitle(dialogRequest)}
      />
    </Box>
  );
}
