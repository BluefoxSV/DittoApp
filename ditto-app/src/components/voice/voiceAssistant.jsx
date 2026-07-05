import { useState, useCallback } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Box, Typography, Tooltip } from "@mui/material";
import logo from "../../assets/ditto.png"; // ajustar si el logo está en otra ruta

// Agente "Manolo" (público). Si el agente pasa a privado, hay que pedir una
// signedUrl al backend en vez de usar agentId directo.
const AGENT_ID = "agent_4301kwr4p8xheyvb6zy89je5wrbx";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function VoiceBubble() {
  const [error, setError] = useState(null);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onError: (e) => setError(typeof e === "string" ? e : "Error de conexión"),
  });

  const status = conversation.status; // "disconnected" | "connecting" | "connected"
  const isActive = status === "connected";
  const isConnecting = status === "connecting";
  const isSpeaking = conversation.isSpeaking;

  const start = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
      });
    } catch (e) {
      setError("Necesito permiso de micrófono para hablar.");
    }
  }, [conversation]);

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggle = () => (isActive || isConnecting ? stop() : start());

  return (
    <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1300, ...FONT }}>
      {(isActive || isConnecting) && (
        <Box
          sx={{
            ...FONT,
            position: "absolute",
            bottom: 74,
            right: 0,
            bgcolor: "#FCFCF5",
            border: "1px solid #e9cffa",
            borderRadius: 3,
            px: 2,
            py: 1,
            boxShadow: 3,
            whiteSpace: "nowrap",
          }}
        >
          <Typography sx={{ ...FONT, fontSize: 13, fontWeight: 600, color: "#874cad" }}>
            {isConnecting ? "Conectando…" : isSpeaking ? "Manolo está hablando…" : "Te escucho…"}
          </Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            ...FONT,
            position: "absolute",
            bottom: 74,
            right: 0,
            bgcolor: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: 3,
            px: 2,
            py: 1,
            boxShadow: 3,
            maxWidth: 220,
          }}
        >
          <Typography sx={{ ...FONT, fontSize: 12, color: "#b91c1c" }}>{error}</Typography>
        </Box>
      )}

      <Tooltip title={isActive ? "Terminar conversación" : "Hablar con Manolo"}>
        <Box
          component="button"
          onClick={toggle}
          aria-label="Asistente de voz"
          className={isActive ? "va-pulse" : ""}
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
          {isActive ? (
            <i className="ti ti-microphone" style={{ fontSize: 26, color: "#fff" }} />
          ) : (
            <Box
              component="img"
              src={logo}
              alt="Ditto"
              sx={{ width: 38, height: 38, objectFit: "contain" }}
            />
          )}
        </Box>
      </Tooltip>

      <style>{`
        .va-pulse { animation: vaPulse 1.6s ease-in-out infinite; }
        @keyframes vaPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(187,106,240,0.5); }
          50%     { box-shadow: 0 0 0 12px rgba(187,106,240,0); }
        }
        @media (prefers-reduced-motion: reduce) { .va-pulse { animation: none; } }
      `}</style>
    </Box>
  );
}

export default function VoiceAssistant() {
  return (
    <ConversationProvider>
      <VoiceBubble />
    </ConversationProvider>
  );
}