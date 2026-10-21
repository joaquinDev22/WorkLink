# Estado de Continuidad del Proyecto — WorkLink (TPF Gestión de Desarrollo de Software)

Este archivo contiene el estado actual, las reglas editoriales estrictas y el resumen técnico del Trabajo Práctico Final de **Gestión de Desarrollo de Software (GDS)** articulado con **Programación IV** (UTN - Facultad Regional Mar del Plata, 2026).

> **Instrucción para la IA (Antigravity / Cursor / Copilot):** Si el usuario abre este proyecto en una nueva sesión o computadora, **leé este archivo y `TPFinal_Gestion_WorkLink_v1.0.md` antes de responder**. Respetá estrictamente todas las reglas de estilo detalladas a continuación.

---

## 1. Estado de Avance por Capítulos (`TPFinal_Gestion_WorkLink_v1.0.md`)

- **Índice General:** ✅ **DEFINITIVO Y SINCRONIZADO** (2 niveles jerárquicos simétricos `X.Y`, sin subsecciones huérfanas como `3.6.1`).
- **Capítulo 1 (`1.1` a `1.10`) — Definición de Negocio, Proyecto y Factibilidad:** ✅ **100% REVISADO Y APROBADO**
  - `1.1` Contexto de la organización y dominio del problema.
  - `1.2` Distinción entre producto, proyecto y operación (`Tabla 1`).
  - `1.3` Problema u oportunidad identificada (embudo de fricción e incertidumbre).
  - `1.4` Misión del proyecto.
  - `1.5` Objetivo general unificado (`OBJ-01`) y criterios SMART (`Tabla 2`).
  - `1.6` Propuesta de valor unificada en un único bloque narrativo cohesivo.
  - `1.7` Viabilidad preliminar técnica, operativa y económica (`Tabla 3`, presupuesto basal $59,52\text{ USD}$).
  - `1.8` Hechos, supuestos e información pendiente (`Tabla 4`).
  - `1.9` Restricciones y dependencias externas (plazo rígido 19/11/2026, equipo de 2 integrantes, dedicación $12\text{ h/semana}$ c/u = $384\text{ horas-hombre}$).
  - `1.10` Project Charter consolidado (`Tabla 5`).
- **Capítulo 2 (`2.1` a `2.8`) — Interesados, Requerimientos y Alcance:** ✅ **100% REVISADO Y APROBADO**
  - `2.1` Registro de interesados (`Tabla 6`, `SH01–SH09`).
  - `2.2` Matriz Poder–Interés (`Tabla 7` + `Figura 1`) y resolución de conflictos estructurales.
  - `2.3` Catálogo continuo en viñetas modulares de **34 Requerimientos Funcionales (`RF01–RF34`)** en 9 módulos y **14 Requerimientos No Funcionales (`RNF01–RNF14`)** bajo ISO/IEC 25010.
  - `2.4` Priorización MoSCoW compacta de 4 filas exclusivamente sobre RFs (`Tabla 10`: 23 *Must Have*, 6 *Should Have*, 2 *Could Have*, 3 *Won't Have*).
  - `2.5` Matriz de trazabilidad y criterios BDD (`Tabla 11`, `CA01–CA09`).
  - `2.6` Definition of Ready (DoR) y Definition of Done (DoD).
  - `2.7` Enunciado del alcance, entregables e hitos de exclusión (`EX01–EX06`).
  - `2.8` Definición del MVP de 3 flujos troncales (*Vertical Slice*).
- **Capítulo 3 (`3.1` a `3.8`) — Arquitectura, Descomposición y Diseño Técnico:** ✅ **100% REVISADO Y APROBADO**
  - `3.1` Enfoque arquitectónico general (Monolito Modular en Spring Boot 3.4.3 / Java 21 + SPA Angular 21 + MySQL 8.0 + WebSockets STOMP).
  - `3.2` Diagrama de Contexto C1 (`Figura 2`).
  - `3.3` Diagrama de Contenedores C2 (`Figura 3`).
  - `3.4` Diagrama de Componentes C3 del backend (`Figura 4`).
  - `3.5` Principales intercambios de información (REST/JSON, JWT Stateless, Webhooks HMAC-SHA256 con Mercado Pago).
  - `3.6` Estructura de Desglose del Trabajo (EDT / WBS, `Figura 5`, fases `1.1` a `1.6`) + subsección interna sin numerar `### Diccionario de la EDT (WBS Dictionary)` (`Tabla 12`).
  - `3.7` Diagrama de Casos de Uso UML (`Figura 6`) como puente entre alcance (`RF01–RF34`) y diseño arquitectónico.
  - `3.8` Decisiones Arquitectónicas Relevantes (`Tabla 13` + `ADR-001` a `ADR-004`).
- **Capítulo 4 (`4.1` a `4.9`) — Estimación, Cronograma y Presupuesto:** ⏳ **PRÓXIMO PASO A REVISAR CON EL USUARIO**
  - El documento maestro tiene un borrador base de `4.1` a `4.9`, pero **debemos co-diseñar y revisar sección por sección con el usuario** aplicando las reglas editoriales y las fórmulas exactas de la Unidad 4 de la cátedra.

---

## 2. Reglas Editoriales y de Estilo (Obligatorias)

1. **PROHIBICIÓN ESTRICTA DE *FORWARD MENTIONS* (Cero referencias hacia adelante):**
   - **Nunca** mencionar capítulos, secciones, tablas, figuras o códigos (ej. `ADR-001`, `Sección 4.6`, `Capítulo 4`) que aparezcan más adelante en el documento. Solo se permite referenciar elementos ya definidos previamente (hacia atrás).
2. **NO HACER COPY-PASTE MASIVO SIN REVISIÓN:**
   - Trabajar de forma iterativa con el usuario (de a 1 o 2 subsecciones por turno), explicando qué se optimiza, presentando la propuesta limpia y esperando su aprobación antes de avanzar.
3. **ÍNDICE Y NUMERACIÓN SIMÉTRICA DE 2 NIVELES (`X.Y`):**
   - No crear subsecciones numeradas de tercer nivel (`X.Y.Z`) aisladas que ensucien el Índice General. Usar encabezados `###` sin numerar para divisiones internas (como `### Diccionario de la EDT` o `### ADR-001`).
4. **TABLAS COMPACTAS Y PREÁMBULOS CONCISOS (1–2 LÍNEAS):**
   - Toda tabla debe ir precedida por una introducción breve de 1 a 2 líneas y estar diseñada para entrar en una sola carilla de Word/Google Docs junto con su leyenda (`*Nota.* ...`) bajo formato APA 7.ª edición.
5. **TONO ACADÉMICO IMPERSONAL:**
   - Redacción en tercera persona del singular impersonal (*se define*, *se establece*, *se dimensiona*), español rioplatense formal, alineado con el PMBOK y la cátedra de GDS (UTN FRMDP).

---

## 3. Fórmulas y Lineamientos de Cátedra para el Capítulo 4 (Unidad 4 GDS)

Al revisar y co-diseñar el **Capítulo 4 (`4.1` a `4.9`)**, verificar el cumplimiento estricto de las fórmulas de la cátedra:

### 4.1 y 4.2 — Puntos de Función (IFPUG / ISO 20926)
- **5 tipos de componentes:**
  - Datos: **ILF** (*Archivos Lógicos Internos*: Baja=7, Media=10, Alta=15), **EIF** (*Archivos de Interfaz Externa*: Baja=5, Media=7, Alta=10).
  - Transacciones: **EI** (*Entradas Externas*: Baja=3, Media=4, Alta=6), **EO** (*Salidas Externas*: Baja=4, Media=5, Alta=7), **EQ** (*Consultas Externas*: Baja=3, Media=4, Alta=6).
- **Cálculo de PFSA:** $\text{PFSA} = \sum (\text{Cantidad} \times \text{Peso})$.
- **Factor de Valor de Ajuste (FVA):** 14 Características Generales del Sistema (CGS / GSC) puntuadas de $0$ a $5$:
  $$FA = \sum_{i=1}^{14} C_i \quad \Longrightarrow \quad \text{FVA} = 0.65 + (0.01 \times FA)$$
  $$\text{PFA} = \text{PFSA} \times \text{FVA}$$
- **Conversión a tamaño de código (*Backfiring*):** Para Java / TypeScript moderno ($\approx 50\text{ SLOC/PF}$), determinando los $\text{KSLOC}$ para COCOMO.

### 4.3 — COCOMO 81 (Básico e Intermedio)
- **Modos de desarrollo:**
  - *Orgánico:* $A=2.4,\; B=1.05,\; C=2.5,\; D=0.38$
  - *Semiacoplado:* $A=3.0,\; B=1.12,\; C=2.5,\; D=0.35$
  - *Empotrado:* $A=3.6,\; B=1.20,\; C=2.5,\; D=0.32$
- **Ecuaciones:**
  $$PM_{\text{nominal}} = A \times (\text{KSLOC})^B$$
  $$EAF = \prod_{i=1}^{15} CD_i \quad \text{(15 Cost Drivers en COCOMO Intermedio)}$$
  $$PM_{\text{ajustado}} = PM_{\text{nominal}} \times EAF$$
  $$TDEV = C \times (PM_{\text{ajustado}})^D \quad \text{(Duración óptima en meses)}$$
  $$N = \frac{PM_{\text{ajustado}}}{TDEV} \quad \text{(Personal promedio requerido)}$$

### 4.4 y 4.5 — Segunda Técnica (PERT / Tres Puntos o Planning Poker + Bottom-Up) y Comparativa
- **PERT / Tres Puntos (Distribución Beta):**
  $$E = \frac{o + 4m + p}{6}, \qquad \sigma = \frac{p - o}{6}$$
- Contrastar la estimación paramétrica teórica (FPA + COCOMO) frente a la capacidad real del equipo de 2 desarrolladores ($384\text{ HH}$ en 16 semanas, de agosto a noviembre de 2026).

### 4.6 a 4.9 — Red de Precedencias (PDM), Camino Crítico, RACI, Cronograma y Presupuesto
- **Red de Precedencias (PDM):** Relaciones lógicas (`FS`, `SS`, `FF`, `SF`) y *Leads/Lags*, identificando el **Camino Crítico** ($\text{Holgura Total} = LS - ES = LF - EF = 0$).
- **Matriz RACI:** Roles del equipo (`PM/TL`, `DBE`, `FE`) frente a los entregables de la EDT. Regla de oro: **exactamente una única letra `A` (*Accountable*) por fila**.
- **Estructura Presupuestaria (PMBOK):**
  - $\text{Costos Directos} + \text{Costos Indirectos} = \text{Costo Base Estimado}$
  - $\text{Costo Base Estimado} + \text{Reserva de Contingencia (riesgos conocidos)} = \text{Línea Base de Costo}$
  - $\text{Línea Base de Costo} + \text{Reserva de Gestión (imprevistos desconocidos)} = \text{Presupuesto Total del Proyecto}$.
