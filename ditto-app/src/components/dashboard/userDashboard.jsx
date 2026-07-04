import { useState } from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import SidebarNav from "./sidebarNav";

const NAV_ITEMS = [
  { key: "chatAI", icon: "chatAI", label: "Inicio · Chat IA" },
  { key: "chatWorker", icon: "chatWorker", label: "Chat con trabajador" },
  { key: "services", icon: "services", label: "Mis servicios" },
  { key: "profile", icon: "profile", label: "Perfil" },
];

const suggestions = [
  { initials: "RM", name: "Rodrigo Martínez", trade: "Fontanería", rating: 4.9, highlight: true },
  { initials: "LP", name: "Luis Pérez", trade: "Plomería general", rating: 4.7, highlight: false },
  { initials: "EG", name: "Elena Gómez", trade: "Mantenimiento", rating: 4.8, highlight: true },
];

const activeService = {
  worker: "Rodrigo Martínez",
  task: "Reparación de fuga",
  startedAt: "Iniciado hoy · 10:30 am",
  status: "En progreso",
};

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };
const avatarSx = { bgcolor: "#BB6AF0", color: "#fff", width: 40, height: 40, fontSize: 14, fontWeight: 700 };

export default function UserDashboard() {
  const [active, setActive] = useState("chatAI");

  return (
    <Box sx={FONT} className="flex flex-col md:flex-row min-h-screen bg-paper text-left">
      <SidebarNav items={NAV_ITEMS} activeKey={active} onSelect={setActive} />

      <Box className="flex-1 p-4 md:p-8 min-w-0 pb-24 md:pb-8 w-full max-w-5xl">
        <Typography sx={FONT} className="text-2xl font-bold text-gray-900 mb-6">
          Hola, Sofía — ¿qué necesitas resolver hoy?
        </Typography>

        <Box className="bg-primary-500 rounded-2xl p-5 mb-8">
          <Typography sx={FONT} className="text-white text-sm font-medium mb-3">
            Escribe tu necesidad y la IA sugiere trabajadores verificados
          </Typography>
          <Box className="bg-paper rounded-xl px-4 py-3 flex items-center gap-2">
            <i className="ti ti-search text-primary-400 flex-shrink-0 text-lg" aria-hidden="true" />
            <Typography sx={FONT} className="text-sm text-gray-600 truncate">
              Necesito a alguien que revise una fuga de agua...
            </Typography>
          </Box>
        </Box>

        <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
          Sugerencias de la IA
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {suggestions.map((s, i) => (
            <Box
              key={i}
              className={`rounded-2xl p-5 min-w-0 border transition-shadow hover:shadow-md ${
                s.highlight ? "bg-primary-50 border-primary-200" : "bg-gray-100 border-gray-200"
              }`}
            >
              <Avatar sx={avatarSx} className="mb-3">{s.initials}</Avatar>
              <Typography sx={FONT} className="text-base font-bold text-gray-900 truncate">
                {s.name}
              </Typography>
              <Typography sx={FONT} className="text-sm font-semibold text-primary-700 mt-1">
                {s.trade} · ★ {s.rating}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
          Servicio activo
        </Typography>
        <Box className="bg-paper border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <Box className="min-w-0">
            <Typography sx={FONT} className="text-base font-bold text-gray-900 truncate">
              {activeService.worker} — {activeService.task}
            </Typography>
            <Typography sx={FONT} className="text-sm text-gray-600 mt-1">
              {activeService.startedAt}
            </Typography>
          </Box>
          <Chip
            label={activeService.status}
            sx={{ ...FONT, bgcolor: "#f4e7fd", color: "#874cad", fontWeight: 700 }}
            className="self-start sm:self-center"
          />
        </Box>
      </Box>
    </Box>
  );
}