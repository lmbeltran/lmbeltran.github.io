// Pruebas de "LDL a objetivo": abre la app en un navegador sin ventana, rellena el formulario
// y comprueba la propuesta. Si cambias reducciones, dosis u objetivos, actualiza aquí lo esperado.
// Ejecutar: node tests/calculos.test.js   (necesita Playwright con Chromium)
const { chromium } = require("playwright");
const path = require("path");
const assert = require("assert/strict");

const APP = "file://" + path.resolve(__dirname, "../ldl-objetivo/index.html");

// Cada caso: datos del paciente → textos que deben aparecer (has) o no (not) en el resultado.
const CASOS = [
  { nombre: "Ejemplo precargado: 160, sin tto, riesgo alto → submáxima + ezetimiba",
    datos: {},
    has: ["57 %", "< 70", "Propuesta", "Estatina submáxima + ezetimiba", "Más del 50 % desde el basal", "Estatina a dosis máxima + ezetimiba"] },
  { nombre: "Necesita 30 %: estatina submáxima con alternativa moderada + ezetimiba",
    datos: { ldl: "100" },
    has: ["30 %", "Estatina a dosis submáxima", "Alternativa equivalente", "Estatina moderada + ezetimiba", "Hasta el 50 %"] },
  { nombre: "Justo en el objetivo no cuenta como alcanzado (70 con objetivo < 70)",
    datos: { ldl: "100" },
    not: ["Estatina de intensidad moderada"] },
  { nombre: "Ya en objetivo",
    datos: { ldl: "60", cur: "hi" },
    has: ["En objetivo", "Mantén el tratamiento actual"], not: ["Siguiente paso"] },
  { nombre: "Riesgo muy alto: objetivo < 55",
    datos: { ldl: "100", risk: "vhigh" },
    has: ["< 55", "Estatina submáxima + ezetimiba"] },
  { nombre: "Cirrosis Child B/C: dosis baja y derivar si no llega",
    datos: { ldl: "160", liver: "bc" },
    has: ["Cirrosis Child B o C", "Estatina a dosis baja", "Lo máximo en consulta", "Deriva a la Unidad de Lípidos"],
    not: ["ezetimiba 10 mg"] },
  { nombre: "Trasplante con ciclosporina: estatina compatible + ezetimiba",
    datos: { ldl: "90", risk: "vhigh", liver: "cya" },
    has: ["simvastatina, rosuvastatina y pitavastatina están contraindicadas", "Estatina compatible + ezetimiba"],
    not: ["rosuva 20"] },
  { nombre: "Sin estatinas: ezetimiba con alternativa bempedoico",
    datos: { ldl: "85", noStatin: true },
    has: ["Sin estatina:", "Ezetimiba sola", "Ácido bempedoico", "visado SNS"], not: ["Estatina submáxima"] },
  { nombre: "Sin estatinas y lejos del objetivo: derivar",
    datos: { ldl: "200", noStatin: true },
    has: ["Bempedoico + ezetimiba", "no llega", "Deriva a la Unidad de Lípidos"] },
  { nombre: "cLDL basal ≥ 190 avisa de posible HF",
    datos: { ldl: "100", cur: "hi" },
    has: ["cLDL basal ≥ 190", "hipercolesterolemia familiar"] },
  { nombre: "Valor fuera de rango",
    datos: { ldl: "700" },
    has: ["Revisa el valor"], not: ["Propuesta"] },
  { nombre: "Unidades mmol/L: objetivo alto en mmol/L",
    datos: { unit: "mmoll", ldl: "4,1" },
    has: ["< 1,8", "mmol/L", "Estatina submáxima + ezetimiba"] }
];

async function rellenar(page, d) {
  await page.goto(APP);
  if (d.unit === "mmoll") await page.check("#u-mmol");
  if (d.ldl !== undefined) await page.fill("#ldl", d.ldl);
  if (d.cur) await page.selectOption("#cur", d.cur);
  if (d.risk) await page.check(`#r-${d.risk}`);
  if (d.liver) await page.selectOption("#liver", d.liver);
  if (d.noStatin) await page.check("#noStatin");
  // textContent y no innerText: los rótulos se muestran en mayúsculas solo por CSS
  return (await page.textContent("#out")).replace(/\s+/g, " ");
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());

  let fallos = 0;
  for (const c of CASOS) {
    try {
      const txt = await rellenar(page, c.datos);
      for (const s of c.has || []) assert.ok(txt.includes(s), `falta «${s}»`);
      for (const s of c.not || []) assert.ok(!txt.includes(s), `no debería aparecer «${s}»`);
      console.log(`✔ ${c.nombre}`);
    } catch (e) {
      fallos++;
      console.log(`✘ ${c.nombre}: ${e.message}`);
    }
  }

  // El texto para la historia clínica
  try {
    await rellenar(page, {});
    const plan = await page.evaluate(async () => {
      let copied = "";
      navigator.clipboard.writeText = async (t) => { copied = t; };
      document.getElementById("copy").click();
      await new Promise((r) => setTimeout(r, 50));
      return copied;
    });
    assert.ok(plan.includes("Propuesta: Estatina submáxima + ezetimiba"), "el plan copiado no incluye la propuesta");
    assert.ok(plan.includes("6–8 semanas"), "el plan copiado no incluye el control");
    console.log("✔ Copiar plan para la historia");
  } catch (e) {
    fallos++;
    console.log(`✘ Copiar plan para la historia: ${e.message}`);
  }

  if (errores.length) { fallos++; console.log("✘ Errores de JavaScript:", errores); }
  await browser.close();
  console.log(fallos ? `\n${fallos} prueba(s) fallida(s)` : `\nTodas las pruebas pasan (${CASOS.length + 1})`);
  process.exit(fallos ? 1 : 0);
})();
