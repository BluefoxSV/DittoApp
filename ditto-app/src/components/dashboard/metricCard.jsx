import { Box, Typography } from "@mui/material";

/**
 * Card de métrica reutilizable. tone: "primary" | "gray" — nunca negro.
 * Es fluida: ocupa el ancho que le dé el grid padre.
 */
export default function MetricCard({ label, value, tone = "gray" }) {
  const bg = tone === "primary" ? "bg-primary-50" : "bg-gray-100";
  const labelColor = tone === "primary" ? "text-primary-600" : "text-gray-500";

  return (
    <Box className={`${bg} rounded-lg p-4 min-w-0`}>
      <Typography className={`${labelColor} text-sm mb-1 truncate`}>{label}</Typography>
      <Typography className="text-primary-700 text-2xl font-medium">{value}</Typography>
    </Box>
  );
}