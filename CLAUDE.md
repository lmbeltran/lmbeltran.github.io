# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Sitio estático de GitHub Pages (`https://lmbeltran.github.io/`, rama `main`, sin paso de compilación) con herramientas
docentes de la Unidad de Lípidos y Riesgo Vascular (H. U. Virgen del Rocío). El autor es clínico, no programador:
explica los cambios en español y en lenguaje no técnico. Todo el contenido visible está en español.

## Estructura

- `index.html`: portada con una tarjeta por herramienta. Al añadir una herramienta, añade su tarjeta aquí y su fila en `README.md`.
- `<herramienta>/index.html`: cada herramienta es un único HTML autocontenido (CSS y JS en línea, logo en base64).
  La única dependencia externa es Google Fonts. No introduzcas librerías ni pasos de build.
- `sw.js` (raíz): service worker para uso sin conexión. Páginas: red primero, caché si no hay conexión. Si añades una
  herramienta, añade su ruta a `PRECACHE` y registra `/sw.js` desde su página.
- `ldl-objetivo/`: además del HTML, `manifest.webmanifest`, iconos y `og.png` (vista previa al compartir).

## LDL a objetivo (`ldl-objetivo/index.html`)

Toda la lógica está en el `<script>` final:
- `RISK`: objetivos de cLDL por categoría de riesgo (mg/dL). `OPT`: opciones de tratamiento con su % de reducción
  (`red`), su escalón (`rank`) y dosis. `CURRENT`: tratamiento actual. `SITU`: qué opciones se permiten según la
  situación hepática (`keys` con estatina, `nostat` sin estatina) y sus avisos.
- `run()`: estima LDL₀ = cLDL ÷ (1 − reducción actual), calcula el cLDL estimado de cada opción y elige la de menor
  `rank` que queda por debajo del objetivo (estrictamente `<`). `ALT_MAP` define las alternativas equivalentes.
- `planText()`: texto de «Copiar plan para la historia».
- El pie de página muestra la versión (`#version`): súbela y anótala en `README.md` cuando cambie el contenido clínico.

Son contenidos clínicos: no cambies cifras, dosis ni recomendaciones sin que el autor lo pida expresamente.

## Pruebas

```
node tests/calculos.test.js
```

Necesita Playwright con Chromium (en la nube de Claude Code: `NODE_PATH=/opt/node22/lib/node_modules`).
Cada caso de `CASOS` rellena el formulario y comprueba textos del resultado; para probar un solo caso, comenta los demás.
GitHub Actions (`.github/workflows/pruebas.yml`) las ejecuta en cada push.
