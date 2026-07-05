import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function playNotify() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // Audio no disponible: se ignora.
  }
}

// Candidatos que se van "encontrando" en secuencia
const CANDIDATES = [
  { text: "RM", delay: "0s"   },
  { text: "LP", delay: "0.5s" },
  { text: "EG", delay: "1s"   },
  { text: "JC", delay: "1.5s" },
];

/**
 * Banner de espera: avatares de candidatos que aparecen en secuencia con un
 * check, como si el sistema fuera encontrando trabajadores (matching).
 * Animacion 100% CSS, sin librerias.
 *
 * @param {"waiting"|"accepted"} phase
 * @param {string} workerLabel
 */
export default function WaitingForAcceptance({ phase = "waiting", workerLabel }) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (phase === "accepted" && !playedRef.current) {
      playedRef.current = true;
      playNotify();
    }
    if (phase === "waiting") playedRef.current = false;
  }, [phase]);

  const accepted = phase === "accepted";

  return (
    <Box
      sx={FONT}
      className={`rounded-2xl p-4 mb-3 flex items-center gap-5 border ${
        accepted ? "bg-emerald-50 border-emerald-200" : "bg-primary-50 border-primary-200"
      }`}
    >
      {/* Fila de candidatos */}
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        {accepted ? (
          <Box
            className="mt-success"
            sx={{
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: "#22a06b",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="mt-success-ring" />
            <i className="ti ti-check mt-success-check" style={{ fontSize: 24 }} aria-hidden="true" />
          </Box>
        ) : (
          CANDIDATES.map((c, i) => (
            <Box key={i} className="mt-slot" sx={{ position: "relative", width: 40, height: 40 }}>
              <span className="mt-avatar" style={{ animationDelay: c.delay }}>
                {c.text}
                <span className="mt-check" style={{ animationDelay: c.delay }}>
                  <i className="ti ti-check" style={{ fontSize: 11 }} aria-hidden="true" />
                </span>
              </span>
            </Box>
          ))
        )}
      </Box>

      <Box className="min-w-0">
        <Typography sx={{ ...FONT, fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
          {accepted ? "¡Un trabajador aceptó tu solicitud!" : "Buscando trabajadores compatibles…"}
        </Typography>
        <Typography sx={{ ...FONT, fontSize: 13, color: "#6b6375", mt: 0.3 }}>
          {accepted
            ? `${workerLabel || "El trabajador"} ya está en el servicio. Coordinen por el chat.`
            : "Encontrando perfiles que coinciden con tu solicitud. Te avisaremos apenas alguien acepte."}
        </Typography>
      </Box>

      <style>{`
        .mt-avatar {
          position: absolute;
          inset: 0;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #e9cffa;
          color: #874cad;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Quicksand', system-ui, sans-serif;
          display: flex; align-items: center; justify-content: center;
          animation: mtPop 2.4s ease-in-out infinite;
        }
        /* aparece -> se ilumina (borde morado) -> se atenua, en bucle */
        @keyframes mtPop {
          0%, 10%   { opacity: 0.25; transform: scale(0.85); border-color: #e9cffa; }
          25%, 55%  { opacity: 1;    transform: scale(1);    border-color: #BB6AF0;
                      box-shadow: 0 0 0 3px rgba(187,106,240,0.18); }
          80%, 100% { opacity: 0.25; transform: scale(0.85); border-color: #e9cffa;
                      box-shadow: none; }
        }
        /* badge de check que aparece cuando el avatar se ilumina */
        .mt-check {
          position: absolute;
          right: -2px; bottom: -2px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #22a06b;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transform: scale(0.4);
          animation: mtCheck 2.4s ease-in-out infinite;
        }
        @keyframes mtCheck {
          0%, 20%   { opacity: 0; transform: scale(0.4); }
          30%, 55%  { opacity: 1; transform: scale(1);   }
          70%, 100% { opacity: 0; transform: scale(0.4); }
        }
        /* --- animacion de aceptacion (exito) --- */
        .mt-success {
          animation: mtSuccessBounce 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.4);
        }
        @keyframes mtSuccessBounce {
          0%   { transform: scale(0.2); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        .mt-success-check {
          animation: mtCheckDraw 0.4s ease-out 0.2s both;
        }
        @keyframes mtCheckDraw {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        /* destello que se expande una vez */
        .mt-success-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #22a06b;
          animation: mtSuccessFlash 0.8s ease-out 0.15s;
        }
        @keyframes mtSuccessFlash {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0;   }
        }

        @media (prefers-reduced-motion: reduce) {
          .mt-avatar, .mt-check, .mt-success, .mt-success-check, .mt-success-ring { animation: none; }
          .mt-avatar { opacity: 1; border-color: #BB6AF0; }
          .mt-success-ring { display: none; }
        }
      `}</style>
    </Box>
  );
}