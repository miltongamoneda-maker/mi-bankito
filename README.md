# Mi Bankito — Evaluador de ubicaciones

Evalúa puntos para una **sucursal Mi Bankito**: transacciones de todos los bancos,
prestamistas y remesas, en apenas **10 m²**.

## Por qué es distinto de SiteLo

Los criterios son casi **inversos** a los de una tienda de conveniencia:

| Factor | Tienda AMPM | **Mi Bankito** |
|---|---|---|
| Bancos/ATM cerca | indiferente | **mejor LEJOS** (zona desatendida = más demanda) |
| Gente circulando | suma | **lo que más pesa** |
| Financieras/prestamistas | irrelevante | **suman** — ahí está quien va a pagar su cuota |
| Puntos de remesa | irrelevante | **restan** — compiten directo |
| NSE | alto mejor | **medio/popular** usa más estos servicios |
| Espacio | 80-150 m² | **10 m²** → no es restricción |

## Cómo puntúa

concurrencia 34% · desatención bancaria 18% · transporte 14% ·
clientela de préstamos 14% · servicios 10% · competencia de remesas 10%

`≥8 A+ · ≥6.8 A · ≥5.2 B · ≥3.8 C · ≥2.5 D`

Validado con: Mercado Oriental **A 7.04** · Las Colinas (NSE alto) **B 5.63** · rural **C 3.82**.

## Estado

⚠️ **v2, sin calibrar contra desempeño real** — todavía no hay kioscos operando.
Los pesos son criterio de negocio. Cuando haya sucursales funcionando, recalibrar
contra sus transacciones reales.

## Estructura

- `index.html` — mapa + evaluador (Leaflet, sin build)
- `engine/supabase/functions/scan-bankito/` — el motor (Supabase Edge Function)

Deploy del motor:
```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx supabase functions deploy scan-bankito \
  --project-ref buuxljsdonkxxtbdnwpm --no-verify-jwt --use-api
```
