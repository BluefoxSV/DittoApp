import { useState } from "react";
import { Box, Typography, Avatar, Chip, LinearProgress } from "@mui/material";
import SidebarNav from "./sidebarNav";
import MetricCard from "./metricCard";

const NAV_ITEMS = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard" },
  { key: "courses", icon: "courses", label: "Cursos" },
  { key: "chatWorker", icon: "chatWorker", label: "Chat con clientes" },
  { key: "profile", icon: "profile", label: "Perfil" },
];

const worker = {
  name: "Carlos Méndez",
  trade: "Electricista",
  experienceLabel: "Experiencia: oficial (3 años)",
  metrics: { completedCourses: 6, activeRequests: 3, rating: 4.8 },
  requests: [
    { client: "María Torres", service: "Instalación eléctrica", status: "Pendiente" },
    { client: "Jorge Ruiz", service: "Reparación de panel", status: "En curso" },
    { client: "Ana López", service: "Revisión general", status: "Completado" },
  ],
  courseProgress: [
    { title: "Instalaciones eléctricas básicas", percent: 80 },
    { title: "Atención al cliente", percent: 45 },
  ],
};

const statusColor = {
  Pendiente: "text-primary-700 bg-primary-50",
  "En curso": "text-gray-700 bg-gray-100",
  Completado: "text-gray-500 bg-gray-100",
};

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };
const avatarSx = { bgcolor: "#BB6AF0", color: "#fff", width: 40, height: 40, fontSize: 14, fontWeight: 700 };

export default function WorkerDashboard() {
  const [active, setActive] = useState("dashboard");

  return (
    <Box sx={FONT} className="flex flex-col md:flex-row min-h-screen bg-paper text-left">
      <SidebarNav items={NAV_ITEMS} activeKey={active} onSelect={setActive} />

      <Box className="flex-1 p-4 md:p-8 min-w-0 pb-24 md:pb-8 w-full max-w-5xl">
        <Box className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <Box>
            <Typography sx={FONT} className="text-sm text-gray-600">Hola,</Typography>
            <Typography sx={FONT} className="text-2xl font-bold text-gray-900">
              {worker.name} — {worker.trade}
            </Typography>
          </Box>
          <Box className="flex items-center gap-3">
            <Chip
              label={worker.experienceLabel}
              title="Basado en años de experiencia y certificaciones, no en idiomas"
              sx={{ ...FONT, bgcolor: "#f4e7fd", color: "#874cad", fontWeight: 700 }}
            />
            <Avatar sx={avatarSx}>CM</Avatar>
          </Box>
        </Box>

        <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <MetricCard label="Cursos completados" value={worker.metrics.completedCourses} tone="primary" />
          <MetricCard label="Solicitudes activas" value={worker.metrics.activeRequests} tone="gray" />
          <MetricCard label="Calificación" value={worker.metrics.rating} tone="primary" />
        </Box>

        <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
          Solicitudes recientes
        </Typography>
        <Box className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
          {worker.requests.map((r, i) => (
            <Box
              key={i}
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 ${
                i < worker.requests.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <Typography sx={FONT} className="text-sm font-semibold text-gray-900 min-w-0 truncate">
                {r.client} — {r.service}
              </Typography>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 self-start sm:self-center ${statusColor[r.status]}`}
              >
                {r.status}
              </span>
            </Box>
          ))}
        </Box>

        <Typography sx={FONT} className="text-lg font-bold text-gray-900 mb-4">
          Progreso de aprendizaje
        </Typography>
        <Box className="flex flex-col gap-5">
          {worker.courseProgress.map((c, i) => (
            <Box key={i}>
              <Box className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span className="min-w-0 truncate pr-2">{c.title}</span>
                <span className="flex-shrink-0 text-primary-700 font-bold">{c.percent}%</span>
              </Box>
              <LinearProgress
                variant="determinate"
                value={c.percent}
                sx={{
                  height: 8,
                  borderRadius: 6,
                  backgroundColor: "#f4e7fd",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#BB6AF0", borderRadius: 6 },
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}