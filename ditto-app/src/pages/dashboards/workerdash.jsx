import { useState } from "react";
import { Box, Typography, Avatar, Chip, LinearProgress } from "@mui/material";
import SidebarNav from "./SidebarNav";
import MetricCard from "./MetricCard";

const NAV_ITEMS = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard" },
  { key: "courses", icon: "courses", label: "Cursos" },
  { key: "chatWorker", icon: "chatWorker", label: "Chat con clientes" },
  { key: "profile", icon: "profile", label: "Perfil" },
];

// mock — reemplazar por datos reales de /api/workers/:id
const worker = {
  name: "Carlos Méndez",
  trade: "Electricista",
  experienceLabel: "Experiencia: oficial (3 años)", // ver nota en README sobre naming
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
  Pendiente: "text-primary-600",
  "En curso": "text-gray-500",
  Completado: "text-gray-400",
};

export default function WorkerDashboard() {
  const [active, setActive] = useState("dashboard");

  return (
    <Box className="flex min-h-[520px] bg-paper border border-gray-200 rounded-xl overflow-hidden">
      <SidebarNav items={NAV_ITEMS} activeKey={active} onSelect={setActive} />

      <Box className="flex-1 p-6 min-w-0">
        <Box className="flex justify-between items-center mb-4">
          <Box>
            <Typography className="text-sm text-gray-500">Hola,</Typography>
            <Typography className="text-lg font-medium">
              {worker.name} — {worker.trade}
            </Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Chip
              label={worker.experienceLabel}
              title="Basado en años de experiencia y certificaciones, no en idiomas"
              className="bg-primary-50 text-primary-700 text-xs"
            />
            <Avatar className="bg-primary-500 w-8 h-8 text-xs">CM</Avatar>
          </Box>
        </Box>

        <Box className="grid grid-cols-3 gap-3 mb-5">
          <MetricCard label="Cursos completados" value={worker.metrics.completedCourses} tone="primary" />
          <MetricCard label="Solicitudes activas" value={worker.metrics.activeRequests} tone="gray" />
          <MetricCard label="Calificación" value={worker.metrics.rating} tone="primary" />
        </Box>

        <Typography className="text-sm font-medium mb-2">Solicitudes recientes</Typography>
        <Box className="border border-gray-200 rounded-lg overflow-hidden mb-5">
          {worker.requests.map((r, i) => (
            <Box
              key={i}
              className={`flex justify-between px-4 py-2.5 text-sm ${
                i < worker.requests.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <span>{r.client} — {r.service}</span>
              <span className={statusColor[r.status]}>{r.status}</span>
            </Box>
          ))}
        </Box>

        <Typography className="text-sm font-medium mb-2">Progreso de aprendizaje</Typography>
        <Box className="flex flex-col gap-3">
          {worker.courseProgress.map((c, i) => (
            <Box key={i}>
              <Box className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{c.title}</span>
                <span>{c.percent}%</span>
              </Box>
              <LinearProgress
                variant="determinate"
                value={c.percent}
                className="rounded"
                sx={{
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: "#F4E8FD",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#BB6AF0" },
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}