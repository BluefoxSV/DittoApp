import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";

import { useGetConversationQuery, useSendChatMessageMutation } from "../../store/api/chatApi";
import { formatServiceDate, getApiErrorMessage } from "./serviceRequestUi";
import WaitingForAcceptance from "../../components/dashboard/waitingForAcceptance";


const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

export default function ServiceChatPanel({
  currentUserId,
  otherUserId,
  title,
  enabled,
  active = true,
  requestStatus,
  waitingForWorker = false,
}) {
  const [message, setMessage] = useState("");
  const endRef = useRef(null);
  const shouldFetch = active && enabled && Boolean(requestId) && Boolean(currentUserId);
  const {
    data: messages = [],
    isLoading,
    isFetching,
    error: conversationError,
  } = useGetRequestConversationQuery(
    { requestId },
    {
      skip: !shouldFetch,
      pollingInterval: shouldFetch ? 5000 : 0,
      refetchOnMountOrArgChange: true,
    },
  );
  const [sendMessage, { isLoading: isSending, error: sendError }] =
    useSendChatMessageMutation();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || isSending) return;

    try {
      await sendMessage({
        senderId: currentUserId,
        receiverId: otherUserId,
        content,
      }).unwrap();
      setMessage("");
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  if (!enabled) {
    
    if (waitingForWorker) {
      return (
        <WaitingForAcceptance
          phase={requestStatus === "accepted" ? "accepted" : "waiting"}
          workerLabel={title}
        />
      );
    }
    return (
      <Box className="h-full flex items-center justify-center p-8 text-center bg-gray-50">
        <Box>
          <Box className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-message-off text-2xl" aria-hidden="true" />
          </Box>
          <Typography sx={FONT} className="font-bold text-gray-900">
            Chat no disponible
          </Typography>
          <Typography sx={FONT} className="text-sm text-gray-600 mt-2 max-w-xs">
            {waitingForWorker
              ? "El chat se habilitará cuando un trabajador acepte tu solicitud."
              : requestStatus === "cancelled"
                ? "La conversación se cerró porque la solicitud fue cancelada."
                : "No hay contraparte disponible para chatear."}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="h-full min-h-0 flex flex-col bg-paper">
      <Box className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
        <Box className="min-w-0">
          <Typography sx={FONT} className="text-sm font-bold text-gray-900 truncate">
            {title}
          </Typography>
          <Typography sx={FONT} className="text-xs text-emerald-700 font-semibold mt-0.5">
            {requestStatus === "pending"
              ? "Coordinación antes de aceptar"
              : requestStatus === "rejected"
                ? "Conversación tras el rechazo"
                : "Conversación del servicio"}
          </Typography>
        </Box>
        {isFetching && !isLoading ? <CircularProgress size={16} /> : null}
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-3 bg-gray-50">
        {(requestStatus === "pending" || requestStatus === "in_progress") ? (
          <WaitingForAcceptance
            phase={requestStatus === "in_progress" ? "accepted" : "waiting"}
            workerLabel={title}
          />
        ) : null}

        {isLoading ? (
          <Box className="h-full flex items-center justify-center">
            <CircularProgress size={28} />
          </Box>
        ) : null}

        {!isLoading && conversationError ? (
          <Alert severity="error">
            {getApiErrorMessage(conversationError, "No se pudo cargar la conversación.")}
          </Alert>
        ) : null}

        {!isLoading && !conversationError && messages.length === 0 ? (
          <Box className="h-full flex items-center justify-center text-center">
            <Typography sx={{...FONT, color: "#676767"}} className="text-sm  max-w-xs">
              Aún no hay mensajes. Escribe para coordinar los detalles del servicio.
            </Typography>
          </Box>
        ) : null}

        {messages.map((item) => {
          const isOwn = item.sender_id === currentUserId;
          return (
            <Box key={item.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <Box
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  isOwn
                    ? "bg-primary-500 text-white rounded-br-sm"
                    : "bg-paper text-black border border-gray-200 rounded-bl-sm"
                }`}
              >
                <Typography
                  sx={FONT}
                  className={`text-sm break-words ${isOwn ? "text-white" : "text-black"}`}
                >
                  {item.content}
                </Typography>
                <Typography
                  sx={FONT}
                  className={`text-[10px] mt-1 ${isOwn ? "text-white/75" : "text-black/50"}`}
                >
                  {formatServiceDate(item.created_at)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={endRef} />
      </Box>

      <Box component="form" onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        {sendError ? (
          <Alert severity="error" className="mb-2">
            {getApiErrorMessage(sendError, "No se pudo enviar el mensaje.")}
          </Alert>
        ) : null}
        <Box className="flex gap-2 items-end">
          <TextField
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe un mensaje..."
            size="small"
            fullWidth
            multiline
            maxRows={3}
            inputProps={{ maxLength: 1000, "aria-label": "Mensaje" }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, ...FONT } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!message.trim() || isSending}
            aria-label="Enviar mensaje"
            sx={{
              minWidth: 44,
              width: 44,
              height: 40,
              borderRadius: 3,
              bgcolor: "#BB6AF0",
              "&:hover": { bgcolor: "#a855df" },
            }}
          >
            {isSending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <i className="ti ti-send" aria-hidden="true" />
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}