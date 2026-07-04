# Paleta de colores — DittoApp / Jobcrafter / Micraft

## 1. Colores base (los únicos que se escriben a mano)

| Token     | Hex       | Uso                                  |
|-----------|-----------|---------------------------------------|
| `primary` | `#BB6AF0` | Morado de marca (CTA, links, activo)  |
| `paper`    | `#FCFCF5` | Blanco (fondo principal, cards)       |
| `gray`    | `#F4E8FD` | Gris con tinte morado (bordes, fondos secundarios, texto deshabilitado) |

Estos 3 valores viven en **un solo lugar**: `BASE_COLORS` dentro de `tailwind.config.js`.

## 2. Por qué es "recursivo" / dinámico

En vez de escribir a mano `primary-50 ... primary-900` (10+ hex por color, fácil de desincronizar), `tailwind.config.js` incluye una función `generateScale(hex)` que:

1. Toma el hex base como el paso **500**.
2. Genera automáticamente los pasos 50→400 mezclando con blanco (más claro).
3. Genera los pasos 600→950 mezclando con negro (más oscuro).

Si el día de mañana cambia el morado de marca, **se edita una sola línea** (`BASE_COLORS.primary`) y las 11 variantes se recalculan solas. No hay que tocar CSS ni componentes.

```js
// tailwind.config.js
const BASE_COLORS = {
  primary: "#BB6AF0",
  paper:    "#FCFCF5",
  gray:    "#F4E8FD",
};
```

## 3. Cómo se usa en clases Tailwind

```jsx
<div className="bg-paper">
  <h1 className="text-primary-700">Bienvenido</h1>
  <button className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-paper">
    Ver curso
  </button>
  <p className="text-gray-700">Texto secundario</p>
  <div className="border border-gray-300 bg-gray-50">Card</div>
</div>
```

## 4. Convención de uso por contexto

| Contexto                          | Clase sugerida               |
|-----------------------------------|-------------------------------|
| Fondo general de la app           | `bg-paper`                     |
| Fondo de cards / secciones        | `bg-gray-50`                  |
| Bordes / separadores              | `border-gray-200` / `300`     |
| Texto principal                   | `text-gray-900`               |
| Texto secundario / placeholder    | `text-gray-500` / `600`       |
| Botón / acción primaria           | `bg-primary-500` → hover `600` → active `700` |
| Estado activo (sidebar, tabs)     | `text-primary-600` + `bg-primary-50` |
| Estado deshabilitado              | `bg-gray-100 text-gray-400`   |
| Badge / etiqueta destacada        | `bg-primary-100 text-primary-700` |

Regla simple: **500 es el color "real", <500 para fondos/hover claros, >500 para texto/hover oscuros y estados presionados.**

## 5. Integración con Material UI

Para que MUI use la misma paleta (sin duplicar hex), se crea el theme de MUI leyendo del mismo objeto:

```js
// src/styles/muiTheme.js
import { createTheme } from "@mui/material/styles";
import colors from "../../tailwind.config.js"; // reutiliza _debugColors o exporta `colors` directamente

export const muiTheme = createTheme({
  palette: {
    primary: { main: colors.primary[500], light: colors.primary[300], dark: colors.primary[700] },
    background: { default: colors.paper, paper: colors.gray[50] },
  },
});
```

Así Tailwind y MUI nunca se desincronizan: **una sola fuente de verdad**.