/** Profesiones disponibles para trabajadores (registro y perfiles). */
export const WORK_PROFESSIONS = [
  { value: "plomeria", label: "Plomería / Fontanería" },
  { value: "electricidad", label: "Electricidad" },
  { value: "mantenimiento", label: "Mantenimiento general" },
  { value: "carpinteria", label: "Carpintería" },
  { value: "albanileria", label: "Albañilería / Construcción" },
  { value: "pintura", label: "Pintura" },
  { value: "jardineria", label: "Jardinería" },
  { value: "limpieza", label: "Limpieza" },
  { value: "cerrajeria", label: "Cerrajería" },
  { value: "climatizacion", label: "Climatización / Aire acondicionado" },
  { value: "soldadura", label: "Soldadura" },
  { value: "herreria", label: "Herrería" },
  { value: "techado", label: "Techado / Impermeabilización" },
  { value: "paneles_solares", label: "Instalación de paneles solares" },
  { value: "mudanzas", label: "Mudanzas" },
  { value: "fumigacion", label: "Fumigación / Control de plagas" },
  { value: "vidrieria", label: "Vidriería" },
  { value: "tapiceria", label: "Tapicería" },
  { value: "pisos", label: "Instalación de pisos" },
  { value: "drywall", label: "Drywall / Tablaroca" },
  { value: "mecanica_automotriz", label: "Mecánica automotriz" },
  { value: "electrodomesticos", label: "Reparación de electrodomésticos" },
  { value: "seguridad", label: "Seguridad privada" },
  { value: "cuidado_personas", label: "Niñera / Cuidado de personas" },
  { value: "cocina_domicilio", label: "Chef / Cocina a domicilio" },
  { value: "peluqueria", label: "Peluquería / Barbería" },
  { value: "costura", label: "Costura / Sastrería" },
  { value: "redes_cableado", label: "Instalación de cableado / Redes" },
];

const PROFESSION_VALUES = new Set(WORK_PROFESSIONS.map((p) => p.value));

export function isValidProfession(value) {
  return PROFESSION_VALUES.has(value);
}

export function getProfessionLabel(value) {
  return WORK_PROFESSIONS.find((p) => p.value === value)?.label ?? "";
}
