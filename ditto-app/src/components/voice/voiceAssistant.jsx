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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useLazyGetConversationConfigQuery } from "../../store/api/elevenlabsApi";
import { useCreateServiceRequestMutation } from "../../store/api/serviceRequestsApi";
import { getApiErrorMessage } from "../dashboard/serviceRequestUi";
import logo from "../../assets/ditto.png";

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

function extractUserText(message) {
  if (!message || typeof message !== "object") return "";

  const source = message.source ?? message.role ?? message.type;
  if (source !== "user" && source !== "user_transcript") return "";

  return (message.message ?? message.text ?? message.user_transcript ?? "").trim();
}

function connectionStatusLabel(status, isConnecting) {
  if (isConnecting) return "Conectando...";
  if (status === "connected") return "Conectado";
  if (status === "connecting") return "Conectando...";
  if (status === "disconnected") return "Desconectado";
  return status || "Desconocido";
}

function unlockBrowserAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    void ctx.resume().finally(() => {
      void ctx.close();
    });
  } catch {
    // El navegador puede bloquear audio sin gesto del usuario.
  }
}

function buildVoiceSessionOptions(config, userId) {
  const sessionOptions = {
    userId: userId ? String(userId) : undefined,
    textOnly: false,
    overrides: {
      conversation: { textOnly: false },
      agent: {
        language: "en",
      },
    },
  };

  if (config.use_prompt_override === true && config.prompt_override) {
    sessionOptions.overrides.agent.prompt = { prompt: config.prompt_override };
    if (config.first_message_override) {
      sessionOptions.overrides.agent.firstMessage = config.first_message_override;
    }
  }

  if (config.mode === "signed_url" && config.signed_url) {
    sessionOptions.signedUrl = config.signed_url;
  } else if (config.mode === "agent_id" && config.agent_id) {
    sessionOptions.agentId = config.agent_id;
  } else {
    throw new Error("Configuración de ElevenLabs inválida.");
  }

  return sessionOptions;
}

function sendSessionContext(sendContextualUpdate) {
  if (typeof sendContextualUpdate !== "function") return;
  sendContextualUpdate(DITTOAPP_SESSION_CONTEXT);
}

function VoiceIntakeBody({
  userId,
  coords,
  onClose,
  clientTools,
  finalSummary,
  setFinalSummary,
  descriptionBuilderRef,
  elevenLabsUnavailable,
  setElevenLabsUnavailable,
  connectionError,
  setConnectionError,
}) {
  const [micMuted, setMicMuted] = useState(true);

  return (
    <ConversationProvider
      clientTools={clientTools}
      isMuted={micMuted}
      onMutedChange={setMicMuted}
    >
      <VoiceIntakeSession
        userId={userId}
        coords={coords}
        onClose={onClose}
        setMicMuted={setMicMuted}
        finalSummary={finalSummary}
        setFinalSummary={setFinalSummary}
        descriptionBuilderRef={descriptionBuilderRef}
        elevenLabsUnavailable={elevenLabsUnavailable}
        setElevenLabsUnavailable={setElevenLabsUnavailable}
        connectionError={connectionError}
        setConnectionError={setConnectionError}
      />
    </ConversationProvider>
  );
}

function VoiceIntakeSession({
  userId,
  coords,
  onClose,
  setMicMuted,
  finalSummary,
  setFinalSummary,
  descriptionBuilderRef,
  elevenLabsUnavailable,
  setElevenLabsUnavailable,
  connectionError,
  setConnectionError,
}) {
  const [messages, setMessages] = useState([]);
  const [initialDescription, setInitialDescription] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [minFollowUp, setMinFollowUp] = useState(3);
  const [isPttActive, setIsPttActive] = useState(false);
  const initialDescriptionRef = useRef("");
  const lastAgentTextRef = useRef("");
  const connectAttemptRef = useRef(0);
  const summaryNudgeRef = useRef(false);
  const autoFinalizeRef = useRef(false);
  const contextSentRef = useRef(false);
  const isConnectingRef = useRef(true);
  const sendContextualUpdateRef = useRef(null);
  const startSessionRef = useRef(null);
  const endSessionRef = useRef(null);
  const endRef = useRef(null);

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

  const appendUserText = useCallback((text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    if (!initialDescriptionRef.current) {
      initialDescriptionRef.current = cleanText;
      setInitialDescription(cleanText);
      if (!contextSentRef.current) {
        contextSentRef.current = true;
        window.setTimeout(() => {
          sendSessionContext(sendContextualUpdateRef.current);
        }, 100);
      }
    }

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "user" && last.text === cleanText) return prev;
      return [...prev, { role: "user", text: cleanText, id: Date.now() }];
    });
  }, []);

  const appendAgentText = useCallback(
    (text) => {
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
          return [...prev.slice(0, -1), { ...last, text: rawText }];
        }
        return [...prev, { role: "agent", text: rawText, id: Date.now() }];
      });
      maybeAutoFinalize(rawText);
    },
    [maybeAutoFinalize],
  );

  const conversation = useConversation({
    volume: 1,
    onMessage: (message) => {
      const userText = extractUserText(message);
      if (userText) {
        appendUserText(userText);
        return;
      }

      const agentText = extractAgentText(message);
      if (agentText) {
        appendAgentText(agentText);
      }
    },
    onConnect: () => {
      isConnectingRef.current = false;
      setConnectionError(null);
      setIsConnecting(false);
    },
    onStatusChange: (newStatus) => {
      if (newStatus === "connected") {
        isConnectingRef.current = false;
        setIsConnecting(false);
      }
      if (newStatus === "disconnected" && isConnectingRef.current) {
        setConnectionError("No se pudo conectar con el asistente de voz. Intenta de nuevo.");
        setIsConnecting(false);
      }
    },
    onDisconnect: () => {
      setIsPttActive(false);
      setMicMuted(true);
    },
    onError: (error) => {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Error en la conversación con ElevenLabs.";

      if (!isConnectingRef.current && message.toLowerCase().includes("disconnected")) return;

      setConnectionError(message);
      isConnectingRef.current = false;
      setIsConnecting(false);
    },
  });

  const { startSession, endSession, sendContextualUpdate, setVolume, status, isSpeaking } =
    conversation;
  const isConnected = status === "connected";
  const canUsePtt = isConnected && !isSpeaking && !finalSummary;
  const followUpCount = useMemo(
    () => Math.max(0, messages.filter(({ role }) => role === "user").length - 1),
    [messages],
  );
  const canRequestSummary = followUpCount >= minFollowUp && !finalSummary;

  useEffect(() => {
    sendContextualUpdateRef.current = sendContextualUpdate;
    startSessionRef.current = startSession;
    endSessionRef.current = endSession;
  }, [sendContextualUpdate, startSession, endSession]);

  useEffect(() => {
    if (!isConnected) return;
    setVolume?.({ volume: 1 });
  }, [isConnected, setVolume]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, finalSummary, isSpeaking]);

  useEffect(() => {
    if (!isConnecting) return undefined;

    const timer = window.setTimeout(() => {
      if (!isConnectingRef.current) return;
      setConnectionError("La conexión con ElevenLabs tardó demasiado. Intenta de nuevo.");
      isConnectingRef.current = false;
      setIsConnecting(false);
    }, 20000);

    return () => window.clearTimeout(timer);
  }, [isConnecting, setConnectionError]);

  useEffect(() => {
    if (!isConnected || finalSummary || summaryNudgeRef.current) return;
    if (followUpCount < minFollowUp) return;

    summaryNudgeRef.current = true;
    sendContextualUpdate(
      `El cliente ya respondió las preguntas mínimas. Resume lo recopilado y termina tu mensaje con exactamente ${DITTO_PUBLISH_KEYWORD} para publicar en DittoApp.`,
    );
  }, [isConnected, finalSummary, followUpCount, minFollowUp, sendContextualUpdate]);

  useEffect(() => {
    const attemptId = connectAttemptRef.current + 1;
    connectAttemptRef.current = attemptId;
    let cancelled = false;
    isConnectingRef.current = true;

    async function connect(retry = 0) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const config = await fetchConversationConfig().unwrap();
        if (cancelled || connectAttemptRef.current !== attemptId) return;

        setMinFollowUp(config.min_follow_up_questions ?? 3);
        const sessionOptions = buildVoiceSessionOptions(config, userId);

        const startFn = startSessionRef.current;
        if (typeof startFn !== "function") {
          if (retry < 8) {
            window.setTimeout(() => connect(retry + 1), 150);
          } else {
            throw new Error("El asistente de voz no está listo. Cierra y vuelve a abrir.");
          }
          return;
        }

        startFn(sessionOptions);
      } catch (error) {
        if (cancelled || connectAttemptRef.current !== attemptId) return;
        if (error?.status === 503 || error?.status === 502) {
          setElevenLabsUnavailable(true);
        } else if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
          setConnectionError("Necesito permiso de micrófono para la entrevista por voz.");
        } else {
          setConnectionError(
            getApiErrorMessage(error, "No se pudo iniciar la entrevista por voz."),
          );
        }
        isConnectingRef.current = false;
        setIsConnecting(false);
      }
    }

    const startTimer = window.setTimeout(() => connect(), 120);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      endConversationSession(endSessionRef.current);
    };
  }, [userId, fetchConversationConfig, setConnectionError, setElevenLabsUnavailable]);

  const handleRetryConnect = () => {
    connectAttemptRef.current += 1;
    isConnectingRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);
    endConversationSession(endSessionRef.current);
    window.setTimeout(() => {
      const attemptId = connectAttemptRef.current;
      void (async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          const config = await fetchConversationConfig().unwrap();
          if (connectAttemptRef.current !== attemptId) return;

          startSessionRef.current?.(buildVoiceSessionOptions(config, userId));
        } catch (error) {
          setConnectionError(
            getApiErrorMessage(error, "No se pudo reiniciar la entrevista por voz."),
          );
          isConnectingRef.current = false;
          setIsConnecting(false);
        }
      })();
    }, 200);
  };

  const handleClose = () => {
    endConversationSession(endSessionRef.current);
    onClose();
  };

  const handlePreparePublish = () => {
    setFinalSummary(buildDescription());
  };

  const startPtt = (event) => {
    event.preventDefault();
    if (!canUsePtt) return;
    unlockBrowserAudio();
    setIsPttActive(true);
    setMicMuted(false);
  };

  const stopPtt = () => {
    if (!isPttActive) return;
    setIsPttActive(false);
    setMicMuted(true);
  };

  if (elevenLabsUnavailable) {
    return (
      <>
        <DialogContent className="p-6">
          <Alert severity="info">
            La entrevista por voz no está disponible en este momento. Usa el formulario de texto
            para publicar tu solicitud.
          </Alert>
        </DialogContent>
        <DialogActions className="px-6 pb-5">
          <Button onClick={handleClose} sx={{ ...FONT, textTransform: "none" }}>
            Cerrar
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
            Entrevista por voz
          </Typography>
          <Typography sx={FONT} className="text-xs text-gray-600 mt-1">
            Al conectar, el asistente te saluda en voz alta. Mantén pulsado el micrófono para
            responder ({followUpCount}/{minFollowUp} mínimo).
          </Typography>
          <Typography
            sx={FONT}
            className={`text-[11px] mt-1 font-semibold ${
              isConnected ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {connectionStatusLabel(status, isConnecting)}
            {isSpeaking ? " · El asistente está hablando" : ""}
            {isPttActive ? " · Te escucho…" : ""}
          </Typography>
        </Box>

        {connectionError ? (
          <Box className="mx-4 mt-4 flex flex-col gap-2">
            <Alert severity="error">{connectionError}</Alert>
            <Button
              variant="outlined"
              onClick={handleRetryConnect}
              sx={{ ...FONT, textTransform: "none", borderRadius: 3 }}
            >
              Reintentar conexión
            </Button>
          </Box>
        ) : null}

        {canRequestSummary ? (
          <Box className="mx-4 mt-3">
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

        <Box className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-gray-50 min-h-[220px] max-h-[40vh]">
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
                    {stripPublishKeyword(item.text)}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {isSpeaking ? (
            <Typography sx={FONT} className="text-xs text-gray-500 text-center">
              El asistente está respondiendo…
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

        <Box className="p-4 border-t border-gray-200 bg-paper flex flex-col items-center gap-2">
          <Typography sx={FONT} className="text-xs text-gray-600 text-center">
            {canUsePtt
              ? "Mantén pulsado para hablar (suelta para enviar)"
              : isSpeaking
                ? "Espera a que termine de hablar…"
                : isConnecting
                  ? "Conectando…"
                  : "Sin conexión — usa Reintentar conexión"}
          </Typography>
          <Box
            component="button"
            type="button"
            aria-label="Mantén pulsado para hablar"
            disabled={!canUsePtt}
            onPointerDown={startPtt}
            onPointerUp={stopPtt}
            onPointerLeave={stopPtt}
            onPointerCancel={stopPtt}
            className={isPttActive ? "va-ptt-active" : ""}
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "none",
              cursor: canUsePtt ? "pointer" : "not-allowed",
              bgcolor: isPttActive ? "#a855df" : "#BB6AF0",
              opacity: canUsePtt ? 1 : 0.5,
              boxShadow: isPttActive ? 6 : 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.15s, box-shadow 0.15s",
              transform: isPttActive ? "scale(1.08)" : "scale(1)",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <i className="ti ti-microphone" style={{ fontSize: 30, color: "#fff" }} />
          </Box>
        </Box>
      </DialogContent>

      <style>{`
        .va-ptt-active { animation: vaPttPulse 1s ease-in-out infinite; }
        @keyframes vaPttPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(187,106,240,0.55); }
          50%     { box-shadow: 0 0 0 14px rgba(187,106,240,0); }
        }
        @media (prefers-reduced-motion: reduce) { .va-ptt-active { animation: none; } }
      `}</style>
    </>
  );
}

function VoiceBubble({ onOpen }) {
  return (
    <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1300, ...FONT }}>
      <Tooltip title="Entrevista por voz">
        <Box
          component="button"
          type="button"
          onClick={onOpen}
          aria-label="Asistente de voz"
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            bgcolor: "#BB6AF0",
            boxShadow: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 0,
            overflow: "hidden",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.06)", bgcolor: "#a55dd3" },
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Ditto"
            sx={{ width: 38, height: 38, objectFit: "contain" }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

function VoiceAssistantDialog({
  open,
  onClose,
  userId,
  coords,
  onConfirm,
  isPublishing,
}) {
  const [finalSummary, setFinalSummary] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const [elevenLabsUnavailable, setElevenLabsUnavailable] = useState(false);
  const descriptionBuilderRef = useRef(null);
  const autoPublishRef = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const clientTools = useMemo(
    () => ({
      finalizar_solicitud: ({ resumen }) => registerSummary(resumen),
      generar_resumen: ({ resumen }) => registerSummary(resumen),
    }),
    [registerSummary],
  );

  const handleClose = () => {
    autoPublishRef.current = false;
    setFinalSummary("");
    setConnectionError(null);
    setElevenLabsUnavailable(false);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      autoPublishRef.current = false;
      return;
    }
    if (!finalSummary || isPublishing || autoPublishRef.current) return;

    autoPublishRef.current = true;
    void onConfirm(finalSummary);
  }, [open, finalSummary, isPublishing, onConfirm]);

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
          },
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between pr-2">
        <Typography sx={FONT} className="text-lg font-bold text-gray-900">
          Publicar con voz
        </Typography>
        <IconButton onClick={handleClose} aria-label="Cerrar">
          <i className="ti ti-x" aria-hidden="true" />
        </IconButton>
      </DialogTitle>

      {open ? (
        <VoiceIntakeBody
          userId={userId}
          coords={coords}
          onClose={handleClose}
          clientTools={clientTools}
          finalSummary={finalSummary}
          setFinalSummary={setFinalSummary}
          descriptionBuilderRef={descriptionBuilderRef}
          elevenLabsUnavailable={elevenLabsUnavailable}
          setElevenLabsUnavailable={setElevenLabsUnavailable}
          connectionError={connectionError}
          setConnectionError={setConnectionError}
        />
      ) : null}

      <DialogActions className="px-6 pb-5">
        <Button onClick={handleClose} sx={{ ...FONT, textTransform: "none" }}>
          Cancelar
        </Button>
        {finalSummary ? (
          <Button
            variant="contained"
            disabled={isPublishing}
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
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default function VoiceAssistant() {
  const { isAuthenticated, user } = useCurrentUser();
  const { coords } = useGeolocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [createRequest, { isLoading: isPublishing }] = useCreateServiceRequestMutation();

  const userId = user?.id;
  const isClient =
    isAuthenticated && Boolean(userId) && user?.role !== "worker" && user?.role !== "support";

  const handleOpen = () => {
    unlockBrowserAudio();
    setSessionKey((key) => key + 1);
    setDialogOpen(true);
  };

  const handleConfirm = async (finalDescription) => {
    if (!finalDescription.trim() || !userId) return;

    try {
      await createRequest({
        userId,
        description: finalDescription.trim(),
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      }).unwrap();
      setDialogOpen(false);
    } catch {
      // El error se muestra en el dashboard si el usuario vuelve allí.
    }
  };

  if (!isClient) return null;

  return (
    <>
      <VoiceBubble onOpen={handleOpen} />
      <VoiceAssistantDialog
        key={sessionKey}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={userId}
        coords={coords}
        onConfirm={handleConfirm}
        isPublishing={isPublishing}
      />
    </>
  );
}
