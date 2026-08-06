// scan-bankito v1 — Evaluación de sitios para kioscos MI BANKITO (standalone).
// SUCURSAL de 10 m2: transacciones de TODOS los bancos + prestamistas + remesas + servicios.
// Solo 10 m2 => el espacio NO es restriccion; lo que manda es el flujo de gente.
// OJO: los criterios son CASI INVERSOS a los de una tienda de conveniencia:
// lo que manda es gente circulando + NSE medio/popular + zona SIN bancos cerca.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Content-Type": "application/json" };
const GKEY = Deno.env.get("GOOGLE_API_KEY") || "";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function hav(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180;
  const x = 0.5 - Math.cos((c - a) * p) / 2 + Math.cos(a * p) * Math.cos(c * p) * (1 - Math.cos((d - b) * p)) / 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}
async function nearby(lat: number, lng: number, types: string[], radius: number) {
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GKEY,
        "X-Goog-FieldMask": "places.displayName,places.location,places.userRatingCount,places.primaryTypeDisplayName,places.businessStatus" },
      body: JSON.stringify({ includedTypes: types, maxResultCount: 20,
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } } }),
    });
    const d = await r.json();
    return (d.places || []).filter((p: any) => p.businessStatus !== "CLOSED_PERMANENTLY").map((p: any) => ({
      nombre: p.displayName?.text || "?", resenas: p.userRatingCount || 0,
      dist: hav(lat, lng, p.location.latitude, p.location.longitude),
    })).sort((a: any, b: any) => a.dist - b.dist);
  } catch { return []; }
}

async function textSearch(lat: number, lng: number, q: string, radius: number) {
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GKEY,
        "X-Goog-FieldMask": "places.displayName,places.location,places.userRatingCount" },
      body: JSON.stringify({ textQuery: q, locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } }, maxResultCount: 15 }),
    });
    const d = await r.json();
    return (d.places || []).map((p: any) => ({ nombre: p.displayName?.text || "?",
      dist: hav(lat, lng, p.location.latitude, p.location.longitude) })).filter((x: any) => x.dist <= radius).sort((a: any, b: any) => a.dist - b.dist);
  } catch { return []; }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  let body: any; try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: CORS }); }
  const lat = Number(body.lat), lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return new Response(JSON.stringify({ error: "lat/lng requeridos" }), { status: 400, headers: CORS });
  const t0 = Date.now();

  const [bancos, comercio, transporte, mercados, farmacias, escuelas, financieras, remesas] = await Promise.all([
    nearby(lat, lng, ["bank", "atm"], 800),
    nearby(lat, lng, ["convenience_store", "grocery_store", "supermarket", "clothing_store"], 400),
    nearby(lat, lng, ["bus_station", "transit_station"], 600),
    nearby(lat, lng, ["market"], 800),
    nearby(lat, lng, ["pharmacy"], 500),
    nearby(lat, lng, ["school"], 600),
    // Financieras/prestamistas: si estan aca, la clientela que PAGA prestamos esta aca.
    // Para Mi Bankito son GENERADORES de clientes, no competencia.
    textSearch(lat, lng, "financiera prestamos microfinanciera casa de empeno", 800),
    // Puntos de remesa (Western Union, etc.): esos SI compiten.
    textSearch(lat, lng, "western union remesas envio de dinero moneygram", 800),
  ]);

  // CONCURRENCIA: ¿circula gente? Es lo que más pesa para un kiosco.
  const sComercio = clamp(comercio.length / 1.6, 0, 10);
  const sTransp = clamp(transporte.length * 2.5, 0, 10);
  const sMercado = mercados.length ? 10 : 0;
  const sServicios = clamp((farmacias.length + escuelas.length) / 1.5, 0, 10);
  const concSignals = [sComercio, sTransp, sServicios].filter(v => v > 0);
  let sConc = concSignals.length ? concSignals.reduce((a, b) => a + b, 0) / concSignals.length : 3;
  if (sMercado) sConc = Math.max(sConc, 8); // un mercado al lado = flujo garantizado

  // DESATENCIÓN BANCARIA: menos bancos/ATM cerca = más demanda para el corresponsal.
  const sBanco = clamp(10 - bancos.length * 0.9, 2, 10);

  // Financieras/prestamistas cerca = clientela que paga prestamos (Mi Bankito cobra por ellos).
  const sFinanc = clamp(financieras.length * 1.8, 0, 10);
  // Puntos de remesa = competencia directa en uno de los tres servicios.
  const sRemesa = clamp(10 - remesas.length * 1.2, 3, 10);

  const pesos = { conc: 0.34, banco: 0.18, transporte: 0.14, servicios: 0.10, financ: 0.14, remesa: 0.10 };
  let score = sConc * pesos.conc + sBanco * pesos.banco + sTransp * pesos.transporte
            + sServicios * pesos.servicios + sFinanc * pesos.financ + sRemesa * pesos.remesa;
  score = Math.round(score * 100) / 100;
  const grade = score >= 8 ? "A+" : score >= 6.8 ? "A" : score >= 5.2 ? "B" : score >= 3.8 ? "C" : score >= 2.5 ? "D" : "F";

  const suma: string[] = [], resta: string[] = [];
  if (sConc >= 7) suma.push("Mucha gente circulando"); else if (sConc <= 4) resta.push("Poco movimiento de gente");
  if (mercados.length) suma.push(`Mercado a ${mercados[0].dist}m (flujo constante)`);
  if (bancos.length <= 2) suma.push(`Zona desatendida (${bancos.length} banco/ATM cerca)`);
  else if (bancos.length >= 6) resta.push(`${bancos.length} bancos/ATM cerca (competencia)`);
  if (transporte.length >= 2) suma.push(`${transporte.length} paradas de transporte cerca`);
  else if (!transporte.length) resta.push("Sin transporte público cerca");
  if (financieras.length >= 2) suma.push(`${financieras.length} financieras/prestamistas cerca (clientela que paga cuotas)`);
  if (remesas.length >= 3) resta.push(`${remesas.length} puntos de remesa compitiendo`);
  if (comercio.length >= 10) suma.push(`${comercio.length} comercios alrededor`);
  else if (comercio.length <= 3) resta.push("Poco comercio alrededor");

  const resumen = (grade === "A+" || grade === "A") ? "Muy buen punto para un Mi Bankito."
    : grade === "B" ? "Punto viable para Mi Bankito, con reservas."
    : grade === "C" ? "Punto marginal — alto riesgo." : "No recomendado para Mi Bankito.";

  return new Response(JSON.stringify({
    lat, lng, grade, score,
    detalle: { concurrencia: Math.round(sConc * 10) / 10, desatencion_bancaria: Math.round(sBanco * 10) / 10,
      transporte: Math.round(sTransp * 10) / 10, servicios: Math.round(sServicios * 10) / 10,
      clientela_prestamos: Math.round(sFinanc * 10) / 10, competencia_remesas: Math.round(sRemesa * 10) / 10 },
    conteos: { bancos_atm: bancos.length, comercios: comercio.length, transporte: transporte.length,
      mercados: mercados.length, farmacias: farmacias.length, escuelas: escuelas.length,
      financieras: financieras.length, puntos_remesa: remesas.length },
    bancos_cerca: bancos.slice(0, 4), suma, resta, resumen,
    _version: "bankito-v2", _ms: Date.now() - t0,
  }), { headers: CORS });
});
