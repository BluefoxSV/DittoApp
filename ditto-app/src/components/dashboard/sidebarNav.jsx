import { Box, Typography } from "@mui/material";

const ICONS = {
  dashboard: "ti-layout-dashboard",
  courses: "ti-school",
  chatAI: "ti-sparkles",
  chatWorker: "ti-message-circle",
  services: "ti-clipboard-list",
  profile: "ti-user",
};

/**
 * Responsive:
 * - Móvil (<md): barra horizontal inferior fija, solo iconos.
 * - md+: sidebar lateral con logo y labels.
 */
export default function SidebarNav({ items, activeKey, onSelect }) {
  return (
    <>
      {/* Sidebar lateral — solo md+ */}
      <Box className="hidden md:block w-[180px] bg-gray-100 p-5 flex-shrink-0">
        <Typography className="text-primary-700 font-medium text-base mb-6">
          Jobcrafter
        </Typography>
        <Box className="flex flex-col gap-1">
          {items.map(({ key, icon, label }) => {
            const active = key === activeKey;
            return (
              <Box
                key={key}
                onClick={() => onSelect?.(key)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  active ? "bg-primary-500 text-paper" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                <i className={`ti ${ICONS[icon] || icon} text-base`} aria-hidden="true" />
                {label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Barra inferior — solo móvil */}
      <Box className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-100 border-t border-gray-200 flex justify-around py-2">
        {items.map(({ key, icon, label }) => {
          const active = key === activeKey;
          return (
            <Box
              key={key}
              onClick={() => onSelect?.(key)}
              aria-label={label}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg cursor-pointer text-xs ${
                active ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <i className={`ti ${ICONS[icon] || icon} text-xl`} aria-hidden="true" />
            </Box>
          );
        })}
      </Box>
    </>
  );
}