# 15 puntos ideales — Mi Bankito Nicaragua

Evaluados con el motor real (`scan-bankito`). Criterio de kiosco: **gente circulando +
zona sin bancos + transporte + clientela de préstamos**. Sucursal de 10 m².

| # | Punto | Coordenadas | Nota | Bancos | Comercios | Transporte |
|---|---|---|---:|---:|---:|---:|
| 1 | **Mercado Roberto Huembes (sur)** | 12.1424, -86.2447 | **A+ 8.20** | 4 | 20 | 7 |
| 2 | **Mercado Huembes** | 12.1265, -86.2436 | **A 7.95** | 4 | 20 | 4 |
| 3 | **León Mercado Central** | 12.4373, -86.8779 | **A 7.18** | 10 | 20 | 20 |
| 4 | **Bello Horizonte** | 12.1150, -86.2380 | **A 7.13** | 2 | 20 | 0 |
| 5 | **Mercado Oriental** | 12.1508, -86.2504 | **A 7.04** | 5 | 9 | 9 |
| 6 | **Mayoreo Tipitapa** | 12.1490, -86.3040 | **A 7.04** | 10 | 20 | 8 |
| 7 | Mercado Iván Montenegro | 12.1370, -86.2100 | B 6.71 | 3 | 19 | 2 |
| 8 | Mercado Mayoreo | 12.1553, -86.1889 | B 6.26 | 3 | 20 | 1 |
| 9 | Mercado Israel Lewites | 12.1310, -86.2960 | B 6.10 | 5 | 14 | 2 |
| 10 | Jinotepe centro | 11.8447, -86.1911 | B 5.96 | 1 | 5 | 0 |
| 11 | Terminal UCA | 12.1290, -86.2700 | B 5.95 | 10 | 6 | 5 |
| 12 | Tipitapa centro | 12.1970, -86.0970 | B 5.95 | 4 | 20 | 0 |
| 13 | Ciudad Belén | 12.1620, -86.2280 | B 5.59 | 0 | 2 | 0 |
| 14 | Estelí centro | 13.0930, -86.3560 | B 5.53 | 6 | 20 | 0 |
| 15 | Ciudad Sandino centro | 12.1580, -86.3450 | B 5.37 | 1 | 1 | 0 |

**Ninguno bajo B.** Los mercados dominan el top — es la lógica correcta: mucha gente,
poca bancarización, y ahí está quien paga servicios y recibe remesas.

## Lecciones de la evaluación

- **La coordenada importa muchísimo.** Mercado Mayoreo dio **D 3.09** con una coordenada
  mal puesta y **B 6.26** con la correcta. Apuntar al punto exacto, no al nombre del barrio.
- **Masaya quedó fuera (C 5.08)** pese a 20 comercios: tiene **11 bancos/ATM** alrededor.
  Zona ya bancarizada = poca demanda para un corresponsal. El modelo lo capta bien.
- **Matagalpa centro (C 5.06)**: mismo caso, 14 bancos.

⚠️ Sin calibrar contra desempeño real — no hay sucursales operando todavía.
Cuando abran las primeras, recalibrar contra transacciones reales.
