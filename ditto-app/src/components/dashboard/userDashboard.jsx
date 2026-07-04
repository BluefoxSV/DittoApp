import { useState } from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import SidebarNav from "./sidebarNav";

const NAV_ITEMS = [
  { key: "chatAI", icon: "chatAI", label: "Inicio · Chat IA" },
  { key: "chatWorker", icon: "chatWorker", label: "Chat con trabajador" },
  { key: "services", icon: "services", label: "Mis servicios" },
  { key: "profile", icon: "profile", label: "Perfil" },
];

// mock — reemplazar por respuesta real del endpoint de matching por IA
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

export default function UserDashboard() {
  const [active, setActive] = useState("chatAI");

  return (
    <Box className="flex flex-col md:flex-row min-h-screen bg-paper">
      <SidebarNav items={NAV_ITEMS} activeKey={active} onSelect={setActive} />

      <Box className="flex-1 p-4 md:p-6 min-w-0 pb-20 md:pb-6">
        <Typography className="text-lg font-medium mb-4">
          Hola, Sofía — ¿qué necesitas resolver hoy?
        </Typography>

        <Box className="bg-primary-500 rounded-xl p-4 mb-5">
          <Typography className="text-paper text-sm opacity-90 mb-2">
            Escribe tu necesidad y la IA sugiere trabajadores verificados
          </Typography>
          <Box className="bg-paper rounded-lg px-3 py-2 flex items-center gap-2">
            <i className="ti ti-search text-gray-400 flex-shrink-0" aria-hidden="true" />
            <Typography className="text-sm text-gray-400 truncate">
              Necesito a alguien que revise una fuga de agua...
            </Typography>
          </Box>
        </Box>

        <Typography className="text-sm font-medium mb-2">Sugerencias de la IA</Typography>
        {/* 1 col móvil → 2 col sm → 3 col lg */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {suggestions.map((s, i) => (
            <Box
              key={i}
              className={`rounded-lg p-3 min-w-0 ${s.highlight ? "bg-primary-50" : "bg-gray-100"}`}
            >
              <Avatar className="bg-primary-500 w-8 h-8 text-xs mb-2">{s.initials}</Avatar>
              <Typography
                className={`text-sm font-medium truncate ${
                  s.highlight ? "text-primary-700" : "text-gray-500"
                }`}
              >
                {s.name}
              </Typography>
              <Typography className={`text-xs ${s.highlight ? "text-primary-700" : "text-gray-500"}`}>
                {s.trade} · {s.rating}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography className="text-sm font-medium mb-2">Servicio activo</Typography>
        <Box className="bg-gray-100 rounded-lg p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <Box className="min-w-0">
            <Typography className="text-sm font-medium text-gray-600 truncate">
              {activeService.worker} — {activeService.task}
            </Typography>
            <Typography className="text-xs text-gray-500 mt-1">{activeService.startedAt}</Typography>
          </Box>
          <Chip
            label={activeService.status}
            className="bg-primary-50 text-primary-700 text-xs self-start sm:self-center"
          />
        </Box>
      </Box>
    </Box>
  );
}