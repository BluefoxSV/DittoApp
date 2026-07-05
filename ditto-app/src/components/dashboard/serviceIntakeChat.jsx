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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

import { useLazyGetConversationConfigQuery } from "../../store/api/elevenlabsApi";
import { getApiErrorMessage } from "./serviceRequestUi";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

const DITTOAPP_SESSION_CONTEXT =
  "Modo entrevista DittoApp: el cliente PUBLICA una solicitud para que un trabajador especializado vaya a su domicilio. Prohibido diagnosticar, dar tips, listas de causas o soluciones caseras. Cuando ya tengas la info necesaria, termina tu respuesta con exactamente [[DITTO_PUBLICAR]] (sin espacios extra).";

const DITTO_PUBLISH_KEYWORD = "[[DITTO_PUBLICAR]]";

function containsPublishKeyword(text) {
  return text.includes(DITTO_PUBLISH_KEYWORD);
}

function stripPublishKeyword(text) {
  return text.replaceAll(DITTO_PUBLISH_KEYWORD, "").trim();
}

function buildIntakePayload(description) {
  return description.trim();
}

function connectionStatusLabel(status, isConnecting) {
  if (isConnecting) return "Conectando...";
  if (status === "connected") return "Conectado";
  if (status === "connecting") return "Conectando...";
  if (status === "disconnected") return "Desconectado";
  return status || "Desconocido";
}

function ThinkingIndicator() {
  return (
    <Box className="flex justify-start">
      <Box className="bg-paper border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
        <Box className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
              sx={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </Box>
        <Typography sx={FONT} className="text-xs text-gray-500">
          Escribiendo...
        </Typography>
      </Box>
    </Box>
  );
}

function endConversationSession(endSession) {
  if (typeof endSession === "function") {
    endSession();
  }
}

function buildGeoSection(coords) {
  const lat = Number(coords?.latitude);
  const lng = Number(coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return [
      "",
      "Ubicación GPS del cliente:",
      "No disponible. Usa la dirección indicada en la entrevista.",
    ].join("\n");
  }

  return [
    "",
    "Ubicación GPS del cliente:",
    `Coordenadas: ${lat}, ${lng}`,
    `Google Maps: https://www.google.com/maps?q=${lat},${lng}`,
    `Waze: https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  ].join("\n");
}

function extractInterviewPairs(messages) {
  const pairs = [];
  let pendingQuestion = null;

  for (const message of messages) {
    const text = stripPublishKeyword(message.text ?? "").trim();
    if (!text) continue;

    if (message.role === "agent") {
      pendingQuestion = text;
      continue;
    }

    if (message.role === "user" && pendingQuestion) {
      pairs.push({ question: pendingQuestion, answer: text });
      pendingQuestion = null;
    }
  }

  return pairs;
}

function buildPublishDescription(messages, initialDescription, coords) {
  const parts = [`Problema inicial: ${initialDescription.trim()}`];
  const pairs = extractInterviewPairs(messages);

  if (pairs.length > 0) {
    parts.push("", "Entrevista:");
    pairs.forEach(({ question, answer }, index) => {
      parts.push(`P${index + 1}: ${question}`);
      parts.push(`R${index + 1}: ${answer}`);
      if (index < pairs.length - 1) parts.push("");
    });
  }

  parts.push(buildGeoSection(coords));
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
  coords,
  isMobile,
  onClose,
  onConfirm,
  onFallbackPublish,
  isPublishing,
  finalSummary,
  setFinalSummary,
  descriptionBuilderRef,
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
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const initialSentRef = useRef(false);
  const streamingIdRef = useRef(null);
  const lastAgentTextRef = useRef("");
  const endRef = useRef(null);
  const connectAttemptRef = useRef(0);
  const summaryNudgeRef = useRef(false);
  const autoFinalizeRef = useRef(false);
  const sendUserMessageRef = useRef(null);
  const sendContextualUpdateRef = useRef(null);
  const initialDescriptionRef = useRef(initialDescription);

  const [fetchConversationConfig] = useLazyGetConversationConfigQuery();

  const buildDescription = useCallback(
    () => buildPublishDescription(messages, initialDescription, coords),
    [messages, initialDescription, coords],
  );

  useEffect(() => {
    if (descriptionBuilderRef) {
      descriptionBuilderRef.current = buildDescription;
    }
  }, [buildDescription, descriptionBuilderRef]);

  const trySendInitialMessage = useCallback((attempt = 0) => {
    if (initialSentRef.current || !initialDescriptionRef.current) return;

    const sendFn = sendUserMessageRef.current;
    if (typeof sendFn !== "function") {
      if (attempt < 12) {
        window.setTimeout(() => trySendInitialMessage(attempt + 1), 200);
      }
      return;
    }

    try {
      sendFn(buildIntakePayload(initialDescriptionRef.current));
      initialSentRef.current = true;
      setIsWaitingForAgent(true);
      window.setTimeout(() => {
        sendContextualUpdateRef.current?.(DITTOAPP_SESSION_CONTEXT);
      }, 100);
    } catch {
      if (attempt < 12) {
        window.setTimeout(() => trySendInitialMessage(attempt + 1), 200);
      } else {
        setConnectionError("No se pudo enviar el mensaje inicial al asistente.");
      }
    }
  }, [setConnectionError]);

  const maybeAutoFinalize = useCallback(
    (agentText) => {
      if (autoFinalizeRef.current || finalSummary) return;

      const cleanText = agentText?.trim();
      if (!cleanText || !containsPublishKeyword(cleanText)) return;

      autoFinalizeRef.current = true;
      setFinalSummary(buildDescription());
    },
    [buildDescription, finalSummary, setFinalSummary],
  );

  const appendAgentText = (text) => {
    const rawText = text.trim();
    if (!rawText) return;

    const displayText = stripPublishKeyword(rawText);
    if (!displayText || displayText === lastAgentTextRef.current) {
      maybeAutoFinalize(rawText);
      return;
    }

    lastAgentTextRef.current = displayText;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent") {
        return [...prev.slice(0, -1), { ...last, text: rawText, streaming: false }];
      }
      return [...prev, { role: "agent", text: rawText, id: Date.now() }];
    });
    maybeAutoFinalize(rawText);
  };

  const conversation = useConversation({
    textOnly: true,
    onMessage: (message) => {
      const text = extractAgentText(message);
      if (!text) return;

      setIsWaitingForAgent(false);
      setIsAgentTyping(false);

      if (streamingIdRef.current) {
        lastAgentTextRef.current = text.trim();
        setMessages((prev) =>
          prev.map((item) =>
            item.id === streamingIdRef.current
              ? { ...item, text, streaming: false }
              : item,
          ),
        );
        streamingIdRef.current = null;
        maybeAutoFinalize(text);
        return;
      }

      appendAgentText(text);
    },
    onAgentChatResponsePart: (part) => {
      if (part.type === "start") {
        setIsWaitingForAgent(false);
        setIsAgentTyping(true);
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
        setIsAgentTyping(false);
        setMessages((prev) => {
          const index = prev.findIndex((item) => item.id === streamingIdRef.current);
          if (index === -1) return prev;
          const finalText = prev[index]?.text?.trim() ?? "";
          if (finalText) {
            lastAgentTextRef.current = finalText;
            maybeAutoFinalize(finalText);
          }
          return prev.map((item) =>
            item.id === streamingIdRef.current ? { ...item, streaming: false } : item,
          );
        });
        streamingIdRef.current = null;
      }
    },
    onAgentTyping: (event) => {
      const isTyping =
        event?.is_typing ??
        event?.agent_typing_event?.is_typing ??
        event?.isTyping ??
        false;
      setIsAgentTyping(Boolean(isTyping));
      if (isTyping) setIsWaitingForAgent(false);
    },
    onConnect: () => {
      setConnectionError(null);
      setIsConnecting(false);
      window.setTimeout(() => trySendInitialMessage(), 250);
    },
    onStatusChange: (newStatus) => {
      if (newStatus === "connected") {
        setIsConnecting(false);
        window.setTimeout(() => trySendInitialMessage(), 250);
      }
    },
    onDisconnect: () => {
      setIsAgentTyping(false);
      setIsWaitingForAgent(false);
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
  const canSendMessages = isConnected;
  const showThinking = isAgentTyping || isWaitingForAgent || messages.some(({ streaming }) => streaming);
  const followUpCount = useMemo(
    () => Math.max(0, messages.filter(({ role }) => role === "user").length - 1),
    [messages],
  );
  const canRequestSummary = followUpCount >= minFollowUp && !finalSummary;

  useEffect(() => {
    initialDescriptionRef.current = initialDescription;
  }, [initialDescription]);

  useEffect(() => {
    sendUserMessageRef.current = sendUserMessage;
  }, [sendUserMessage]);

  useEffect(() => {
    sendContextualUpdateRef.current = sendContextualUpdate;
  }, [sendContextualUpdate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, finalSummary, showThinking]);

  useEffect(() => {
    if (!isWaitingForAgent) return undefined;

    const timer = window.setTimeout(() => {
      setIsWaitingForAgent(false);
      setConnectionError("El asistente tardó demasiado en responder. Intenta enviar otro mensaje.");
    }, 45000);

    return () => window.clearTimeout(timer);
  }, [isWaitingForAgent, setConnectionError]);

  useEffect(() => {
    if (!canSendMessages || finalSummary || summaryNudgeRef.current) return;
    if (followUpCount < minFollowUp) return;

    summaryNudgeRef.current = true;
    sendContextualUpdate(
      `El cliente ya respondió las preguntas mínimas. Resume lo recopilado y termina tu mensaje con exactamente ${DITTO_PUBLISH_KEYWORD} para publicar en DittoApp.`,
    );
  }, [canSendMessages, finalSummary, followUpCount, minFollowUp, sendContextualUpdate]);

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
    autoFinalizeRef.current = false;

    async function connect() {
      try {
        const config = await fetchConversationConfig().unwrap();
        if (cancelled || connectAttemptRef.current !== attemptId) return;

        setMinFollowUp(config.min_follow_up_questions ?? 3);

        const sessionOptions = {
          userId: userId ? String(userId) : undefined,
          textOnly: true,
        };

        if (config.use_prompt_override === true && config.prompt_override) {
          sessionOptions.overrides = {
            conversation: { textOnly: true },
            agent: {
              prompt: { prompt: config.prompt_override },
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
    setIsWaitingForAgent(true);
    setIsAgentTyping(false);
    sendUserMessage(content);
    setDraft("");
  };

  const handleRequestSummary = () => {
    if (!canSendMessages) return;
    setIsWaitingForAgent(true);
    sendUserMessage(
      `Resume la solicitud y termina tu respuesta con exactamente ${DITTO_PUBLISH_KEYWORD} para publicar en DittoApp.`,
    );
  };

  const handlePreparePublish = () => {
    setFinalSummary(buildDescription());
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
      <DialogContent
        className="p-0 flex flex-col"
        sx={{
          minHeight: isMobile ? 0 : 420,
          flex: isMobile ? 1 : undefined,
          overflow: isMobile ? "hidden" : undefined,
        }}
      >
        <Box className="px-5 py-4 border-b border-gray-200 bg-paper">
          <Typography sx={FONT} className="text-sm font-bold text-gray-900">
            Publicemos tu solicitud
          </Typography>
          <Typography sx={FONT} className="text-xs text-gray-600 mt-1">
            Respondemos unas preguntas para que un especialista de DittoApp vea tu pedido y vaya a
            ayudarte ({followUpCount}/{minFollowUp} mínimo).
          </Typography>
          <Typography
            sx={FONT}
            className={`text-[11px] mt-1 font-semibold ${
              isConnected ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {connectionStatusLabel(status, isConnecting)}
          </Typography>
        </Box>

        {connectionError ? (
          <Alert severity="error" className="mx-4 mt-4">
            {connectionError}
          </Alert>
        ) : null}

        {!isConnected && !isConnecting && !connectionError ? (
          <Alert severity="warning" className="mx-4 mt-4">
            No hay conexión con el asistente. Cierra y vuelve a abrir, o publica con la descripción
            original.
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

        {canRequestSummary ? (
          <Box className="mx-4 mb-3 flex flex-col gap-2">
            {canSendMessages ? (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleRequestSummary}
                disabled={showThinking}
                sx={{ ...FONT, textTransform: "none", borderRadius: 3 }}
              >
                Generar resumen con IA
              </Button>
            ) : null}
            <Button
              variant="contained"
              fullWidth
              onClick={handlePreparePublish}
              sx={{
                ...FONT,
                textTransform: "none",
                borderRadius: 3,
                bgcolor: "#874cad",
                "&:hover": { bgcolor: "#7340a0" },
              }}
            >
              Listo — preparar publicación
            </Button>
          </Box>
        ) : null}

        <Box
          className={`flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-gray-50 ${
            isMobile ? "min-h-0" : "min-h-[280px] max-h-[50vh]"
          }`}
        >
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
                      {stripPublishKeyword(item.text) || (item.streaming ? "..." : "")}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

          {showThinking ? <ThinkingIndicator /> : null}

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
              disabled={!canSendMessages || showThinking}
              inputProps={{ maxLength: 1000, "aria-label": "Respuesta" }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, ...FONT } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!draft.trim() || !canSendMessages || showThinking}
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

      <DialogActions
        className="px-6 pb-5"
        sx={isMobile ? { pb: "max(20px, env(safe-area-inset-bottom))" } : undefined}
      >
        <Button onClick={handleClose} sx={{ ...FONT, textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!finalSummary || isPublishing}
          onClick={() => onConfirm(finalSummary)}
          sx={{ ...FONT, textTransform: "none", bgcolor: "#BB6AF0", "&:hover": { bgcolor: "#a855df" } }}
        >
          {isPublishing ? (
            <>
              <CircularProgress size={18} color="inherit" />
              <Box component="span" sx={{ ml: 1 }}>
                Publicando solicitud...
              </Box>
            </>
          ) : (
            "Confirmar y publicar"
          )}
        </Button>
      </DialogActions>
    </>
  );
}

export default function ServiceIntakeChat({
  open,
  initialDescription,
  userId,
  coords,
  onClose,
  onConfirm,
  onFallbackPublish,
  isPublishing,
}) {
  const [finalSummary, setFinalSummary] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const [elevenLabsUnavailable, setElevenLabsUnavailable] = useState(false);
  const autoPublishRef = useRef(false);
  const descriptionBuilderRef = useRef(null);

  const registerSummary = useCallback((resumen) => {
    const built = descriptionBuilderRef.current?.();
    if (built) {
      setFinalSummary(built);
      return "Resumen registrado. Publicando solicitud en DittoApp.";
    }

    const summary = typeof resumen === "string" ? resumen.trim() : "";
    if (summary) setFinalSummary(summary);
    return "Resumen registrado. Publicando solicitud en DittoApp.";
  }, []);

  useEffect(() => {
    if (!open) {
      autoPublishRef.current = false;
      return;
    }
    if (!finalSummary || isPublishing || autoPublishRef.current) return;

    autoPublishRef.current = true;
    void onConfirm(finalSummary);
  }, [open, finalSummary, isPublishing, onConfirm]);

  const clientTools = useMemo(
    () => ({
      finalizar_solicitud: ({ resumen }) => registerSummary(resumen),
      generar_resumen: ({ resumen }) => registerSummary(resumen),
    }),
    [registerSummary],
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    autoPublishRef.current = false;
    setFinalSummary("");
    setConnectionError(null);
    setElevenLabsUnavailable(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullScreen={isMobile}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        handleClose();
      }}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            ...FONT,
            borderRadius: isMobile ? 0 : 4,
            ...(isMobile && {
              height: "100%",
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
            }),
          },
        },
      }}
    >
      <DialogTitle
        className="flex items-center justify-between pr-2"
        sx={isMobile ? { pt: "max(16px, env(safe-area-inset-top))" } : undefined}
      >
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
            coords={coords}
            isMobile={isMobile}
            onClose={handleClose}
            onConfirm={onConfirm}
            onFallbackPublish={onFallbackPublish}
            isPublishing={isPublishing}
            finalSummary={finalSummary}
            setFinalSummary={setFinalSummary}
            descriptionBuilderRef={descriptionBuilderRef}
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
