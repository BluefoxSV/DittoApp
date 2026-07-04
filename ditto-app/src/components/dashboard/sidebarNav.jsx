import { Box, Typography } from "@mui/material";

const ICONS = {
  dashboard: "ti-layout-dashboard",
  courses: "ti-school",
  chatAI: "ti-sparkles",
  chatWorker: "ti-message-circle",
  services: "ti-clipboard-list",
  profile: "ti-user",
};

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

export default function SidebarNav({ items, activeKey, onSelect }) {
  return (
    <>
      {/* Sidebar lateral — md+ */}
      <Box className="hidden md:flex md:flex-col w-56 bg-gray-100 border-r border-gray-200 p-6 flex-shrink-0">
        <Typography sx={FONT} className="text-primary-700 font-bold text-lg mb-8">
          Jobcrafter
        </Typography>
        <Box className="flex flex-col gap-1.5">
          {items.map(({ key, icon, label }) => {
            const active = key === activeKey;
            return (
              <Box
                key={key}
                onClick={() => onSelect?.(key)}
                sx={FONT}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                  active
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-primary-100 hover:text-primary-700"
                }`}
              >
                <i className={`ti ${ICONS[icon] || icon} text-lg`} aria-hidden="true" />
                {label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Barra inferior — móvil */}
      <Box className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-100 border-t border-gray-200 flex justify-around py-2">
        {items.map(({ key, icon, label }) => {
          const active = key === activeKey;
          return (
            <Box
              key={key}
              onClick={() => onSelect?.(key)}
              aria-label={label}
              className={`flex flex-col items-center px-3 py-1 rounded-lg cursor-pointer ${
                active ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <i className={`ti ${ICONS[icon] || icon} text-2xl`} aria-hidden="true" />
            </Box>
          );
        })}
      </Box>
    </>
  );
}