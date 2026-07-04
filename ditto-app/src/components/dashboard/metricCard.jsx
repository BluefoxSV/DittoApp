import { Box, Typography } from "@mui/material";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

export default function MetricCard({ label, value, tone = "gray" }) {
  const bg = tone === "primary" ? "bg-primary-50 border-primary-200" : "bg-gray-100 border-gray-200";
  const labelColor = tone === "primary" ? "text-primary-700" : "text-gray-600";

  return (
    <Box className={`${bg} border rounded-2xl p-5 min-w-0`}>
      <Typography sx={FONT} className={`${labelColor} text-sm font-medium mb-1 truncate`}>
        {label}
      </Typography>
      <Typography sx={FONT} className="text-primary-700 text-3xl font-bold">
        {value}
      </Typography>
    </Box>
  );
}