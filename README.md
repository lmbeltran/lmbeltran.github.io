# Herramientas de consulta y docencia

Pequeñas herramientas web (un único archivo HTML cada una) para docencia y consulta.
Dr. Luis M. Beltrán Romero · Unidad de Lípidos y Riesgo Vascular, H. U. Virgen del Rocío (Sevilla).

Página de inicio: https://lmbeltran.github.io/

| Herramienta | Dirección | Descripción |
|---|---|---|
| LDL a objetivo (versión Hepatología) | https://lmbeltran.github.io/ldl-objetivo/ | Qué tratamiento oral llevaría a un paciente a su objetivo de cLDL |

Cada herramienta vive en su carpeta (`<nombre>/index.html`) y funciona en el navegador, sin instalar nada.
Solo se carga la tipografía desde Google Fonts. Una vez abiertas, funcionan sin conexión (`sw.js`), y en el móvil
se pueden añadir a la pantalla de inicio como una app.

## Versiones de «LDL a objetivo»

- **1.1 (18/10/2026)**: funciona sin conexión e instalable en el móvil; vista previa al compartir el enlace;
  versión visible al pie; corregido el redondeo del «% que hay que bajar» (mostraba 31 % cuando bastaba el 30 %).
- **1.0 (octubre 2026)**: versión presentada en la III Jornada de Comorbilidad Metabólica en Hepatología (SAPD).

## Pruebas

`tests/calculos.test.js` abre la app, introduce pacientes de ejemplo y comprueba la propuesta de tratamiento.
Se ejecuta sola en GitHub con cada cambio (pestaña *Actions*). Si cambias reducciones, dosis u objetivos,
actualiza también lo esperado en ese archivo.

**Aviso.** Herramientas docentes y orientativas; no sustituyen el juicio clínico ni la ficha técnica.
No introduzcas datos que identifiquen a pacientes.
