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

import { useLazyGetConversationConfigQuery } from "../../store/api/elevenlabsApi";
import { getApiErrorMessage } from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

const DITTOAPP_SESSION_CONTEXT =
  "Modo entrevista DittoApp: el cliente PUBLICA una solicitud para que un trabajador especializado vaya a su domicilio. Prohibido diagnosticar, dar tips, listas de causas o soluciones caseras.";

function buildIntakePayload(description) {
  return `[PUBLICAR SOLICITUD EN DITTOAPP]
El cliente quiere publicar para que un ESPECIALISTA de DittoApp venga en persona. Tu rol es entrevistador, NO técnico.

Prohibido: diagnosticar, consejos, listas de causas, explicar reparaciones.

Problema del cliente:
${description.trim()}`;
}

function endConversationSession(endSession) {
  if (typeof endSession === "function") {
    endSession();
  }
}

function buildLocalSummary(messages, initialDescription) {
  const userLines = messages
    .filter(({ role, text }) => role === "user" && text?.trim())
    .map(({ text }) => text.trim());

  const detailLines = userLines.slice(1);
  const parts = [
    `Problema inicial: ${initialDescription.trim()}`,
  ];

  if (detailLines.length > 0) {
    parts.push("", "Detalles adicionales del cliente:");
    detailLines.forEach((line) => parts.push(`- ${line}`));
  }

  return parts.join("\n");
}

function extractAgentText(message) {
  if (typeof message === "string") return message.trim();
  if (!message || typeof message !== "object") return "";

  const source = message.source ?? message.role ?? message.type;
  if (source === "user" || source === "user_transcript") return "";

  return (
    message.message ??
    message.text ??
    message.agent_response ??
    message.agent_response_event?.agent_response ??
    ""
  ).trim();
}

function IntakeChatBody({
  initialDescription,
  userId,
  onClose,
  onConfirm,
  onFallbackPublish,
  isPublishing,
  finalSummary,
  setFinalSummary,
  elevenLabsUnavailable,
  setElevenLabsUnavailable,
  connectionError,
  setConnectionError,
}) {
  const [messages, setMessages] = useState(() =>
    initialDescription
      ? [{ role: "user", text: initialDescription, id: Date.now() }]
      : [],
  );
  const [draft, setDraft] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [minFollowUp, setMinFollowUp] = useState(3);
  const initialSentRef = useRef(false);
  const streamingIdRef = useRef(null);
  const lastAgentTextRef = useRef("");
  const endRef = useRef(null);
  const connectAttemptRef = useRef(0);
  const summaryNudgeRef = useRef(false);

  const [fetchConversationConfig] = useLazyGetConversationConfigQuery();

  const sendInitialMessage = (sendFn, contextualFn) => {
    if (initialSentRef.current || !initialDescription || typeof sendFn !== "function") {
      return false;
    }
    contextualFn?.(DITTOAPP_SESSION_CONTEXT);
    sendFn(buildIntakePayload(initialDescription));
    initialSentRef.current = true;
    return true;
  };

  const appendAgentText = (text) => {
    const cleanText = text.trim();
    if (!cleanText || cleanText === lastAgentTextRef.current) return;

    lastAgentTextRef.current = cleanText;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent") {
        return [...prev.slice(0, -1), { ...last, text: cleanText, streaming: false }];
      }
      return [...prev, { role: "agent", text: cleanText, id: Date.now() }];
    });
  };

  const conversation = useConversation({
    textOnly: true,
    onMessage: (message) => {
      const text = extractAgentText(message);
      if (!text) return;

      if (streamingIdRef.current) {
        lastAgentTextRef.current = text;
        setMessages((prev) =>
          prev.map((item) =>
            item.id === streamingIdRef.current
              ? { ...item, text, streaming: false }
              : item,
          ),
        );
        streamingIdRef.current = null;
        return;
      }

      appendAgentText(text);
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
        setMessages((prev) => {
          const index = prev.findIndex((item) => item.id === streamingIdRef.current);
          if (index === -1) return prev;
          const finalText = prev[index]?.text?.trim() ?? "";
          if (finalText) lastAgentTextRef.current = finalText;
          return prev.map((item) =>
            item.id === streamingIdRef.current ? { ...item, streaming: false } : item,
          );
        });
        streamingIdRef.current = null;
      }
    },
    onConnect: () => {
      setConnectionError(null);
      setIsConnecting(false);
    },
    onError: (error) => {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Error en la conversación con ElevenLabs.";

      if (message.toLowerCase().includes("disconnected")) return;

      setConnectionError(message);
      setIsConnecting(false);
    },
  });

  const { startSession, endSession, sendUserMessage, sendUserActivity, sendContextualUpdate, status } =
    conversation;
  const isConnected = status === "connected";
  const canSendMessages = isConnected && !isConnecting;
  const followUpCount = useMemo(
    () => Math.max(0, messages.filter(({ role }) => role === "user").length - 1),
    [messages],
  );
  const canRequestSummary = canSendMessages && followUpCount >= minFollowUp && !finalSummary;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, finalSummary]);

  useEffect(() => {
    if (!canSendMessages) return undefined;

    const timer = window.setTimeout(() => {
      sendInitialMessage(sendUserMessage, sendContextualUpdate);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [canSendMessages, initialDescription, sendUserMessage, sendContextualUpdate]);

  useEffect(() => {
    if (!canSendMessages || finalSummary || summaryNudgeRef.current) return;
    if (followUpCount < minFollowUp) return;

    summaryNudgeRef.current = true;
    sendUserMessage(
      "STOP. No des diagnósticos ni consejos técnicos. Eres entrevistador de DittoApp. Llama AHORA a finalizar_solicitud con el resumen para publicar la solicitud y que un especialista vaya al domicilio del cliente.",
    );
  }, [canSendMessages, finalSummary, followUpCount, minFollowUp, sendUserMessage]);

  useEffect(() => {
    if (!isConnecting) return undefined;

    const timer = window.setTimeout(() => {
      setConnectionError("La conexión con ElevenLabs tardó demasiado. Intenta de nuevo.");
      setIsConnecting(false);
    }, 20000);

    return () => window.clearTimeout(timer);
  }, [isConnecting, setConnectionError]);

  useEffect(() => {
    if (!initialDescription) return undefined;

    const attemptId = connectAttemptRef.current + 1;
    connectAttemptRef.current = attemptId;
    let cancelled = false;
    initialSentRef.current = false;
    lastAgentTextRef.current = "";
    summaryNudgeRef.current = false;

    async function connect() {
      try {
        const config = await fetchConversationConfig().unwrap();
        if (cancelled || connectAttemptRef.current !== attemptId) return;

        setMinFollowUp(config.min_follow_up_questions ?? 3);

        const sessionOptions = {
          userId: userId ? String(userId) : undefined,
        };

        if (config.prompt_override) {
          sessionOptions.overrides = {
            conversation: { textOnly: true },
            agent: {
              prompt: { prompt: config.prompt_override },
              firstMessage: config.first_message_override ?? undefined,
              language: "es",
            },
          };
        }

        if (config.mode === "signed_url" && config.signed_url) {
          sessionOptions.signedUrl = config.signed_url;
        } else if (config.mode === "agent_id" && config.agent_id) {
          sessionOptions.agentId = config.agent_id;
        } else {
          throw new Error("Configuración de ElevenLabs inválida.");
        }

        startSession(sessionOptions);
      } catch (error) {
        if (cancelled || connectAttemptRef.current !== attemptId) return;
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
    fetchConversationConfig,
    startSession,
    endSession,
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
    if (!content || !canSendMessages) return;

    setMessages((prev) => [...prev, { role: "user", text: content, id: Date.now() }]);
    sendUserMessage(content);
    setDraft("");
  };

  const handleRequestSummary = () => {
    if (!canSendMessages) return;
    sendUserMessage(
      "No des consejos ni diagnósticos. Genera el resumen para PUBLICAR la solicitud en DittoApp y llama finalizar_solicitud con el parámetro resumen (problema, ubicación, urgencia, qué debe hacer el especialista on-site).",
    );
  };

  const handleLocalSummary = () => {
    setFinalSummary(buildLocalSummary(messages, initialDescription));
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
            Publicemos tu solicitud
          </Typography>
          <Typography sx={FONT} className="text-xs text-gray-600 mt-1">
            Respondemos unas preguntas para que un especialista de DittoApp vea tu pedido y vaya a
            ayudarte ({followUpCount}/{minFollowUp} mínimo).
          </Typography>
        </Box>

        {connectionError && !isConnected ? (
          <Alert severity="error" className="mx-4 mt-4">
            {connectionError}
          </Alert>
        ) : null}

        {connectionError && !isConnected ? (
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

        {canRequestSummary ? (
          <Box className="mx-4 mb-3 flex flex-col gap-2">
            <Button
              variant="outlined"
              fullWidth
              onClick={handleRequestSummary}
              sx={{ ...FONT, textTransform: "none", borderRadius: 3 }}
            >
              Generar resumen con IA
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleLocalSummary}
              sx={{ ...FONT, textTransform: "none", color: "#874cad" }}
            >
              Usar conversación como descripción
            </Button>
          </Box>
        ) : null}

        <Box className="flex-1 min-h-[280px] max-h-[50vh] overflow-y-auto px-4 py-5 space-y-3 bg-gray-50">
          {isConnecting && messages.length === 0 ? (
            <Box className="h-full flex items-center justify-center gap-2">
              <CircularProgress size={24} />
              <Typography sx={FONT} className="text-sm text-gray-600">
                Conectando con el asistente...
              </Typography>
            </Box>
          ) : null}

          {messages.map((item) => {
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

          {isConnecting ? (
            <Typography sx={FONT} className="text-xs text-gray-500 text-center">
              Conectando con el asistente...
            </Typography>
          ) : null}
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
              disabled={!canSendMessages}
              inputProps={{ maxLength: 1000, "aria-label": "Respuesta" }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, ...FONT } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!draft.trim() || !canSendMessages}
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

  const registerSummary = useCallback((resumen) => {
    const summary = typeof resumen === "string" ? resumen.trim() : "";
    if (summary) setFinalSummary(summary);
    return "Resumen registrado. El usuario puede publicar.";
  }, []);

  const clientTools = useMemo(
    () => ({
      finalizar_solicitud: ({ resumen }) => registerSummary(resumen),
      generar_resumen: ({ resumen }) => registerSummary(resumen),
    }),
    [registerSummary],
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
            setFinalSummary={setFinalSummary}
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
