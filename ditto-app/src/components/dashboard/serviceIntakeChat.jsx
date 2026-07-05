import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

import { useLazyGetSignedUrlQuery } from "../../store/api/elevenlabsApi";
import { getApiErrorMessage } from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function endConversationSession(endSession) {
  if (typeof endSession === "function") {
    endSession();
  }
}

function extractMessageText(message) {
  if (typeof message === "string") return message;
  if (!message || typeof message !== "object") return "";

  return (
    message.message ??
    message.text ??
    message.agent_response ??
    message.agent_response_event?.agent_response ??
    ""
  );
}

function IntakeChatBody({
  initialDescription,
  userId,
  onClose,
  onConfirm,
  onFallbackPublish,
  isPublishing,
  finalSummary,
  elevenLabsUnavailable,
  setElevenLabsUnavailable,
  connectionError,
  setConnectionError,
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const initialSentRef = useRef(false);
  const streamingIdRef = useRef(null);
  const endRef = useRef(null);

  const [fetchSignedUrl] = useLazyGetSignedUrlQuery();

  const appendAgentMessage = useCallback((text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent" && last.id === streamingIdRef.current) {
        return [...prev.slice(0, -1), { ...last, text: cleanText }];
      }
      streamingIdRef.current = Date.now();
      return [...prev, { role: "agent", text: cleanText, id: streamingIdRef.current }];
    });
  }, []);

  const conversation = useConversation({
    textOnly: true,
    onMessage: (message) => {
      const source = message?.source ?? message?.role ?? message?.type;
      if (source === "user" || source === "user_transcript") return;

      const text = extractMessageText(message);
      if (text) appendAgentMessage(text);
    },
    onAgentChatResponsePart: (part) => {
      if (part.type === "start") {
        streamingIdRef.current = Date.now();
        setMessages((prev) => [
          ...prev,
          { role: "agent", text: "", id: streamingIdRef.current, streaming: true },
        ]);
        return;
      }

      if (part.type === "delta" && part.text) {
        setMessages((prev) => {
          const index = prev.findIndex((item) => item.id === streamingIdRef.current);
          if (index === -1) return prev;
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            text: `${updated[index].text}${part.text}`,
          };
          return updated;
        });
        return;
      }

      if (part.type === "stop") {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === streamingIdRef.current ? { ...item, streaming: false } : item,
          ),
        );
        streamingIdRef.current = null;
      }
    },
    onError: (error) => {
      setConnectionError(
        typeof error === "string" ? error : "Error en la conversación con ElevenLabs.",
      );
      setIsConnecting(false);
    },
  });

  const { startSession, endSession, sendUserMessage, sendUserActivity, status } = conversation;
  const isConnected = status === "connected";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, finalSummary]);

  useEffect(() => {
    if (!initialDescription) return undefined;

    let cancelled = false;
    initialSentRef.current = false;

    async function connect() {
      try {
        const { signed_url: signedUrl } = await fetchSignedUrl().unwrap();
        if (cancelled) return;

        await startSession({
          signedUrl,
          userId: userId ? String(userId) : undefined,
        });
        if (cancelled) return;

        if (!initialSentRef.current) {
          sendUserMessage(initialDescription);
          setMessages([{ role: "user", text: initialDescription, id: Date.now() }]);
          initialSentRef.current = true;
        }
        setIsConnecting(false);
      } catch (error) {
        if (cancelled) return;
        if (error?.status === 503 || error?.status === 502) {
          setElevenLabsUnavailable(true);
        } else {
          setConnectionError(
            getApiErrorMessage(error, "No se pudo iniciar la entrevista con ElevenLabs."),
          );
        }
        setIsConnecting(false);
      }
    }

    connect();

    return () => {
      cancelled = true;
      endConversationSession(endSession);
    };
  }, [
    initialDescription,
    userId,
    fetchSignedUrl,
    startSession,
    endSession,
    sendUserMessage,
    setConnectionError,
    setElevenLabsUnavailable,
  ]);

  const handleClose = () => {
    endConversationSession(endSession);
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !isConnected) return;

    setMessages((prev) => [...prev, { role: "user", text: content, id: Date.now() }]);
    sendUserMessage(content);
    setDraft("");
  };

  if (elevenLabsUnavailable) {
    return (
      <>
        <DialogContent className="p-6">
          <Alert severity="info">
            La entrevista con IA no está disponible en este momento. Puedes publicar tu solicitud
            con la descripción original.
          </Alert>
        </DialogContent>
        <DialogActions className="px-6 pb-5">
          <Button onClick={handleClose} sx={{ ...FONT, textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={isPublishing}
            onClick={() => onFallbackPublish(initialDescription)}
            sx={{ ...FONT, textTransform: "none", bgcolor: "#BB6AF0", "&:hover": { bgcolor: "#a855df" } }}
          >
            {isPublishing ? <CircularProgress size={18} color="inherit" /> : "Publicar sin entrevista"}
          </Button>
        </DialogActions>
      </>
    );
  }

  return (
    <>
      <DialogContent className="p-0 flex flex-col" sx={{ minHeight: 420 }}>
        <Box className="px-5 py-4 border-b border-gray-200 bg-paper">
          <Typography sx={FONT} className="text-sm font-bold text-gray-900">
            Detallemos tu solicitud
          </Typography>
          <Typography sx={FONT} className="text-xs text-gray-600 mt-1">
            Responde las preguntas para que los trabajadores tengan toda la información.
          </Typography>
        </Box>

        {connectionError ? (
          <Alert severity="error" className="mx-4 mt-4">
            {connectionError}
          </Alert>
        ) : null}

        {connectionError ? (
          <Box className="mx-4 mb-3">
            <Button
              variant="outlined"
              fullWidth
              disabled={isPublishing}
              onClick={() => onFallbackPublish(initialDescription)}
              sx={{ ...FONT, textTransform: "none", borderRadius: 3 }}
            >
              {isPublishing ? (
                <CircularProgress size={18} />
              ) : (
                "Publicar con la descripción original"
              )}
            </Button>
          </Box>
        ) : null}

        <Box className="flex-1 min-h-[280px] max-h-[50vh] overflow-y-auto px-4 py-5 space-y-3 bg-gray-50">
          {isConnecting ? (
            <Box className="h-full flex items-center justify-center gap-2">
              <CircularProgress size={24} />
              <Typography sx={FONT} className="text-sm text-gray-600">
                Conectando con el asistente...
              </Typography>
            </Box>
          ) : null}

          {!isConnecting &&
            messages.map((item) => {
              const isOwn = item.role === "user";
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
                      className={`text-sm break-words whitespace-pre-wrap ${
                        isOwn ? "text-white" : "text-black"
                      }`}
                    >
                      {item.text || (item.streaming ? "..." : "")}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          <div ref={endRef} />
        </Box>

        {finalSummary ? (
          <Box className="mx-4 mb-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
            <Typography sx={FONT} className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Resumen listo para publicar
            </Typography>
            <Typography sx={FONT} className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">
              {finalSummary}
            </Typography>
          </Box>
        ) : null}

        <Box component="form" onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-paper">
          <Box className="flex gap-2 items-end">
            <TextField
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                sendUserActivity();
              }}
              placeholder="Escribe tu respuesta..."
              size="small"
              fullWidth
              multiline
              maxRows={4}
              disabled={!isConnected || isConnecting}
              inputProps={{ maxLength: 1000, "aria-label": "Respuesta" }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, ...FONT } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!draft.trim() || !isConnected || isConnecting}
              aria-label="Enviar respuesta"
              sx={{
                minWidth: 44,
                width: 44,
                height: 40,
                borderRadius: 3,
                bgcolor: "#BB6AF0",
                "&:hover": { bgcolor: "#a855df" },
              }}
            >
              <i className="ti ti-send" aria-hidden="true" />
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="px-6 pb-5">
        <Button onClick={handleClose} sx={{ ...FONT, textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!finalSummary || isPublishing}
          onClick={() => onConfirm(finalSummary)}
          sx={{ ...FONT, textTransform: "none", bgcolor: "#BB6AF0", "&:hover": { bgcolor: "#a855df" } }}
        >
          {isPublishing ? <CircularProgress size={18} color="inherit" /> : "Confirmar y publicar"}
        </Button>
      </DialogActions>
    </>
  );
}

export default function ServiceIntakeChat({
  open,
  initialDescription,
  userId,
  onClose,
  onConfirm,
  onFallbackPublish,
  isPublishing,
}) {
  const [finalSummary, setFinalSummary] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const [elevenLabsUnavailable, setElevenLabsUnavailable] = useState(false);

  const clientTools = useMemo(
    () => ({
      finalizar_solicitud: ({ resumen }) => {
        const summary = typeof resumen === "string" ? resumen.trim() : "";
        if (summary) setFinalSummary(summary);
        return "Resumen registrado. El usuario puede publicar.";
      },
    }),
    [],
  );

  const handleClose = () => {
    setFinalSummary("");
    setConnectionError(null);
    setElevenLabsUnavailable(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: { borderRadius: 4, ...FONT } } }}
    >
      <DialogTitle className="flex items-center justify-between pr-2">
        <Typography sx={FONT} className="text-lg font-bold text-gray-900">
          Entrevista de solicitud
        </Typography>
        <IconButton onClick={handleClose} aria-label="Cerrar">
          <i className="ti ti-x" aria-hidden="true" />
        </IconButton>
      </DialogTitle>

      {open && initialDescription ? (
        <ConversationProvider textOnly clientTools={clientTools}>
          <IntakeChatBody
            key={initialDescription}
            initialDescription={initialDescription}
            userId={userId}
            onClose={handleClose}
            onConfirm={onConfirm}
            onFallbackPublish={onFallbackPublish}
            isPublishing={isPublishing}
            finalSummary={finalSummary}
            elevenLabsUnavailable={elevenLabsUnavailable}
            setElevenLabsUnavailable={setElevenLabsUnavailable}
            connectionError={connectionError}
            setConnectionError={setConnectionError}
          />
        </ConversationProvider>
      ) : null}
    </Dialog>
  );
}
