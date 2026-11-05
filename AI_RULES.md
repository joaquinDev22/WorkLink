# 🤖 AI AGENT DIRECTIVES & RULES FOR WORKLINK FRONTEND

> **IMPORTANTE**: Este archivo define las reglas obligatorias, estrictas e inmutables para cualquier Agente de Inteligencia Artificial (Antigravity, Gemini, Cursor, GitHub Copilot, Claude) que opere sobre este repositorio.

---

## 🚫 1. REGLA FUNDAMENTAL: PROHIBICIÓN ESTRICTA DE ESCRIBIR CÓDIGO (READ-ONLY)

1. **CERO MODIFICACIÓN DE ARCHIVOS DE CÓDIGO FUENTE**:
   * La IA **NO tiene permiso** para crear, editar, sobrescribir ni borrar archivos de código del proyecto (`.ts`, `.html`, `.css`, `.json`, etc.) bajo ninguna circunstancia.
   * **El código lo escribe exclusivamente el desarrollador (alumno)**. La IA tiene prohibido usar herramientas de edición sobre el código fuente del proyecto.

2. **OBLIGACIÓN DE DOCUMENTAR TODO EN UN `implementation_plan` IDENTIFICADO**:
   * Toda información, explicación teórica, propuesta de cambio, nueva funcionalidad o corrección de errores **DEBE** entregarse dentro de un artefacto **`implementation_plan.md`** debidamente identificado (indicando Fase/Módulo, Subdominio, Requerimiento Funcional y Archivos involucrados).
   * Dentro del `implementation_plan`, la IA mostrará los bloques de código propuestos y explicará línea por línea qué debe hacer el alumno y en qué archivo exacto debe colocarlo.

---

## 👨‍🏫 2. METODOLOGÍA PEDAGÓGICA: ROL PROFESOR $\rightarrow$ ALUMNO

1. **ENSEÑANZA PASO A PASO**:
   * La IA debe comportarse en todo momento como un **Profesor de Ingeniería de Software y Arquitectura Angular enseñando a su alumno**.
   * Está prohibido "tirar código" sin contexto. Cada bloque propuesto debe ir acompañado de:
     * **¿Qué hace?** (Propósito funcional).
     * **¿Por qué se hace así?** (Fundamento arquitectónico o de diseño).
     * **¿Cómo se conecta con el resto del sistema?** (Flujo de datos entre componente, servicio, interceptor y backend).
2. **CLARIDAD DIDÁCTICA**:
   * Utilizar diagramas de flujo/secuencia (`mermaid`), tablas comparativas y explicaciones conceptuales claras antes de pasar a la implementación.

---

## ❓ 3. RESPETO ABSOLUTO A LA LÓGICA DE NEGOCIO (PREGUNTAR ANTE LA DUDA)

1. **CERO SUPOSICIONES SOBRE EL DOMINIO**:
   * La IA **NO debe asumir ni inventar reglas de negocio**, flujos de pantallas, validaciones de formularios, transiciones de estados, cálculos ni permisos por rol (`EMPRESA`, `RECRUITER`, `EMPLOYEE`, `POSTULANTE`, `CLIENTE`, `FREELANCER`).
2. **PREGUNTAR PRIMERO SI SE DESCONOCE**:
   * Si un requerimiento, contrato DTO, endpoint del backend o comportamiento de interfaz se desconoce o es ambiguo, la IA **DEBE detenerse y preguntar al usuario** antes de formular cualquier propuesta.

---

## 🏗️ 4. ARQUITECTURA Y PATRONES DE DISEÑO FRONTEND (ANGULAR v22)

La IA debe respetar estrictamente el stack y la arquitectura definida en el proyecto:

* **Angular v22 Moderno:**
  * Uso de **Standalone Components** y flujo de control nativo (`@if`, `@for`, `@switch`, `@defer`).
  * Uso del decorador **`@Service()`** de `@angular/core` para la declaración de servicios.
  * Inyección de dependencias funcional mediante **`inject()`**.
* **Formularios con Signal Forms (`@angular/forms/signals`):**
  * Uso de la API reactiva de formularios basada en señales: `form()`, directiva `FormField` (`[formField]`), y validadores de esquema (`required`, `email`, `min`, `max`, etc.), evitando el boilerplate antiguo de `FormBuilder` / `FormGroup`.
* **Paradigma Reactivo (Signals-First):**
  * Estado local y global gestionado con `signal()`, `computed()` y `effect()`.
  * `RxJS` (`Observable`, `pipe`, `tap`, `catchError`) enfocado en el transporte HTTP asíncrono con `HttpClient` e interceptores.
* **Separación por Capas:**
  * `core/`: Servicios singleton (`Auth`, `TokenStorage`), Guards funcionales (`CanActivateFn`), Interceptores funcionales (`HttpInterceptorFn`), Layout principal (`Navbar`, `Sidebar`, `MainLayout`) y modelos transversales (`Session`, `UserRole`).
  * `shared/`: Componentes Dumb de UI Kit (`input()` / `output()`), Directivas (`hasRole`, `clickOutside`), Pipes y modelos genéricos.
  * `features/`: Subdominios de negocio (`auth`, `perfiles`, `enterprise`, `freelance`, `bootcamps`) con sus respectivas `pages/`, `components/`, `services/` y `models/`.
* **Contratos DTO 1:1:**
  * Respetar estrictamente los nombres de propiedades definidos en los DTOs del Backend en Spring Boot (`LoginRequestDTO`, `LoginResponseDTO`, `GoogleLoginRequestDTO`, `Session`, etc.).

---

## 📋 5. ESTRUCTURA OBLIGATORIA DE CADA `implementation_plan`

Cada vez que el alumno solicite ayuda, una explicación o un cambio, la IA actualizará o creará el `implementation_plan.md` con la siguiente estructura:

1. **Identificación del Plan**: Título claro, Módulo/Subdominio, Archivos afectados (`[NEW]` / `[MODIFY]`) y Objetivo de aprendizaje.
2. **Explicación Conceptual (Modo Profesor)**: Cómo funciona el concepto por detrás (con diagrama si aplica) antes de ver código.
3. **Reglas de Negocio y Contratos Involucrados**: Qué DTOs, endpoints o reglas del dominio entran en juego (o preguntas al alumno si falta información).
4. **Guía Paso a Paso de Implementación**:
   * Archivo por archivo, indicando qué código debe escribir el alumno y explicando **línea por línea** el porqué de cada instrucción.
5. **Cómo Probarlo / Verificación**: Qué debe observar el alumno en el navegador, en la consola o en las DevTools para comprobar que su código funciona correctamente.

# 6. Directivas de Diseño y Modificación Web

1. ALCANCE Y LIMITACIONES:
   - Modifica solo los elementos explícitamente solicitados.
   - No toques estilos globales, reset CSS ni archivos de configuración de temas salvo orden directa.
   - No elimines imports, variables ni lógica de negocio preexistente.

2. SISTEMA VISUAL Y ESTILOS:
   - Utiliza exclusivamente los tokens de diseño y clases existentes en el proyecto.
   - Prohibido agregar colores "hardcodeados" o estilos inline arbitrarios.
   - Asegura contraste legible entre texto y superficie en todo momento.

3. RESPONSIVE Y ESTRUCTURA:
   - Todo cambio debe adaptarse fluidamente a móvil y desktop.
   - No uses anchos fijos en contenedores que puedan causar desbordamientos horizontales.

4. METODOLOGÍA:
   - Antes de modificar un archivo grande, muestra o resume el bloque exacto a alterar.

# SKILL: Diseño Premium + Transformaciones Morfológicas + Transiciones de Elemento Compartido

> **Para la IA que lea este documento:** estas son reglas obligatorias al generar o modificar UI en este proyecto. Si una petición del usuario entra en conflicto con este documento, prioriza la petición del usuario y avisa en una línea de qué regla relajaste.

---

## 0. Contexto del proyecto

| Elemento | Valor |
|---|---|
| Framework | Angular moderno (standalone, **signals**, control flow `@if/@for/@let`, sin NgModules) |
| Estilos | **Tailwind CSS v4** (`@theme`, `@utility`, `@starting-style`/`starting:`) + CSS propio |
| Lenguaje | TypeScript estricto |
| Detección de cambios | `ChangeDetectionStrategy.OnPush` y, si el proyecto lo permite, zoneless |
| Idioma de la UI | Español |

**Reglas de oro**
1. Nunca uses `@angular/animations` en código nuevo si hay alternativa nativa (CSS, View Transitions, `animate.enter` / `animate.leave` en Angular ≥ 20.2).
2. Solo animar `transform`, `opacity`, `clip-path`, `filter` (con moderación). Nunca `width/height/top/left` en bucles de animación propios.
3. **Todo movimiento debe respetar `prefers-reduced-motion`.**
4. Toda transición debe tener **fallback** (si el navegador no soporta View Transitions, la UI funciona igual, sin animación).
5. El diseño premium se logra con **restricción**: pocos colores, jerarquía clara, espaciado generoso, movimiento sutil y con propósito.

---

## 1. Principios de diseño premium

### 1.1 Jerarquía y tipografía
- Una sola familia sans (Inter, Geist, Plus Jakarta Sans o similar) con **3 pesos máximo** (400, 600, 800).
- Títulos con `tracking-tight`, cuerpo con `leading-relaxed`.
- Escala tipográfica fija: `text-xs (12) · text-sm (14) · text-base (16) · text-lg (18) · text-2xl (24) · text-3xl (30)`.
- Etiquetas pequeñas en mayúsculas: `text-[11px] font-semibold uppercase tracking-wider text-slate-400`.
- Máximo de **~65 caracteres por línea** en párrafos (`max-w-prose` o `max-w-3xl`).

### 1.2 Espaciado y layout
- Sistema de 4 px (Tailwind por defecto). Preferir `gap-*` y `space-y-*` sobre márgenes sueltos.
- Padding de tarjetas: `p-6` (móvil `p-5`), radio `rounded-3xl` para contenedores y `rounded-xl` para controles. **No mezclar más de 3 radios.**
- Contenedor: `max-w-6xl mx-auto px-4 sm:px-6`.
- Grid asimétrico (1/3 + 2/3) para perfiles y dashboards; evitar rejillas de tarjetas idénticas sin jerarquía.

### 1.3 Superficies y profundidad
- Capas: fondo `slate-50` → tarjeta `white` → elemento elevado (modal/popover) con sombra mayor.
- Borde fino translúcido: `border border-slate-200/80` + sombra **en capas** (ver tokens §2).
- Glass solo para elementos flotantes: `bg-white/70 backdrop-blur-xl border-white/40`.
- Anillos (`ring-4 ring-white`) para separar avatares superpuestos.

### 1.4 Color
- 1 color de marca (`brand-indigo`) + 1 acento secundario (`brand-sky`) + neutros `slate`.
- Estados: éxito `emerald`, error `rose`, aviso `amber`. Nunca usar rojo/verde puro saturado.
- Contraste mínimo **WCAG AA** (4.5:1 texto normal, 3:1 texto grande/UI).
- Dark mode: definir tokens semánticos (`--color-surface`, `--color-text`) y no hardcodear `white`/`slate-900` en componentes nuevos.

### 1.5 Micro-interacciones (todas con propósito)
- Botones: `active:scale-95`, `transition-all duration-200`, hover con cambio de tono (no de tamaño).
- Foco visible siempre: `focus-visible:ring-2 focus-visible:ring-brand-indigo/40 focus-visible:ring-offset-2`.
- Skeletons con shimmer (clase `animate-shine`) que replican la **forma exacta** del contenido final (evita CLS).
- Feedback inmediato: toast, spinner en botón, estado `disabled` coherente.

### 1.5.1 Estados obligatorios de todo componente de datos
`loading` (skeleton) · `empty` (mensaje + CTA) · `error` (mensaje + reintentar) · `success/lleno`.

---

## 2. Tokens (Tailwind v4, en `styles.css`)

```css
@import "tailwindcss";

@theme {
  /* Marca */
  --color-brand-indigo: #4f46e5;
  --color-brand-indigo-dark: #4338ca;
  --color-brand-sky: #0ea5e9;

  /* Curvas de movimiento */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-spring: linear(
    0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017,
    1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%,
    1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%,
    0.997 69.8%, 1.003 76.9%, 1 100%
  );

  /* Duraciones */
  --duration-micro: 150ms;
  --duration-base: 250ms;
  --duration-morph: 450ms;

  /* Sombras en capas (premium) */
  --shadow-card: 0 1px 2px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.05);
  --shadow-float: 0 2px 4px rgb(15 23 42 / 0.05), 0 12px 32px rgb(15 23 42 / 0.12);

  /* Animaciones utilitarias */
  --animate-shine: shine 1.6s linear infinite;
  --animate-fade-in: fade-in 200ms var(--ease-standard) both;
  --animate-scale-in: scale-in 250ms var(--ease-emphasized) both;

  @keyframes shine {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scale-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to   { opacity: 1; transform: none; }
  }
}

/* Skeleton shine reutilizable */
.animate-shine {
  background-image: linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 0.55) 50%, transparent 100%);
  background-size: 200% 100%;
}

/* Utilidades de transición compartida */
@utility vt-morph {
  view-transition-class: morph;
}

/* Reduced motion global */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 3. Sistema de movimiento

| Tipo | Duración | Curva | Ejemplo |
|---|---|---|---|
| Micro (hover, press) | 100–200 ms | `ease-standard` | botones, chips |
| Entrada/salida de overlays | 200–300 ms | `ease-emphasized` | modal, toast |
| **Morph / elemento compartido** | **350–500 ms** | `ease-emphasized` | tarjeta → detalle, botón → modal |
| Cambio de página | 250–350 ms | `ease-standard` | navegación del router |

Reglas:
- **Salir más rápido que entrar** (salida ≈ 70 % de la entrada).
- Un solo foco de atención por transición: si algo se mueve, lo demás se atenúa (fade), no se mueve también.
- Escalonado (stagger) máximo 40 ms por elemento y máximo 6 elementos.
- Nunca animar en bucle algo que no sea un indicador de carga.

---

## 4. Transformaciones morfológicas

Una **transformación morfológica** es un cambio en el que un elemento **cambia de forma, tamaño, posición o contenido** de manera continua, y el usuario percibe que es *el mismo objeto* transformándose (un botón que se convierte en diálogo, una tarjeta que se expande a detalle, un chip que se vuelve panel).

### 4.1 Cuándo usarla
- Abrir detalle desde una tarjeta/miniatura.
- Botón de acción → formulario/modal (editar perfil, agregar habilidad).
- Avatar pequeño → avatar grande/visor.
- Reordenar o filtrar listas (los elementos se desplazan, no “saltan”).
- Cambio de estado de un componente (colapsado ↔ expandido, vacío ↔ lleno).

### 4.2 Cuándo NO usarla
- Acciones repetitivas y rápidas (agregar 10 chips seguidos).
- Contenido sin relación visual entre origen y destino.
- Cuando el usuario tiene `prefers-reduced-motion: reduce`.

### 4.3 Técnicas, por orden de preferencia

1. **View Transitions API (same-document)** → para elementos compartidos entre dos estados/rutas. *Opción por defecto.*
2. **CSS puro con `@starting-style` / `starting:` + `transition-behavior: allow-discrete`** → entrada/salida de `<dialog>`, popovers y elementos que aparecen/desaparecen.
3. **FLIP con Web Animations API** → reordenamiento de listas dentro del mismo componente, o cuando View Transitions no aplica.
4. **`clip-path` / `border-radius` animados** → revelar contenido o morphs de forma (círculo → rectángulo).
5. `animate.enter` / `animate.leave` de Angular (≥ 20.2) → simples entradas/salidas ligadas a `@if/@for`.

---

## 5. Transiciones de elemento compartido (Shared Element) en Angular

### 5.1 Concepto
Se asigna el **mismo `view-transition-name`** al elemento origen (estado A) y al elemento destino (estado B). El navegador toma una captura de ambos y anima posición, tamaño y cruce de contenido entre ellos.

**Restricciones críticas**
- Un `view-transition-name` debe ser **único en el documento en cada momento** (si hay dos iguales, la transición se cancela).
- El nombre debe existir en el DOM **al capturar el estado viejo** y en el **nuevo**.
- Solo se anima lo que está visible; elementos `display: none` no participan.
- En listas, el nombre debe ser **dinámico por id** y asignarse **solo al elemento implicado** (no a los 50 de la lista).

### 5.2 Router (cambio de ruta)

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => {
          // Respeta reduced motion
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            transition.skipTransition();
          }
        },
      }),
    ),
  ],
};
```

Plantilla de la lista (ruta A) y detalle (ruta B), con el mismo nombre dinámico:

```html
<!-- lista -->
@for (proy of proyectos(); track proy.id) {
  <a [routerLink]="['/proyectos', proy.id]"
     class="vt-morph block rounded-2xl bg-white border border-slate-200/80 shadow-(--shadow-card)"
     [style.view-transition-name]="'proy-' + proy.id">
    <h3 class="font-bold text-slate-900">{{ proy.nombre }}</h3>
  </a>
}

<!-- detalle -->
<article class="vt-morph rounded-3xl bg-white p-8"
         [style.view-transition-name]="'proy-' + proy().id">
  ...
</article>
```

> Problema típico: en la lista todas las tarjetas tienen nombre y al volver, la del detalle no coincide con la correcta. Solución: nombres únicos por `id` (como arriba) y evitar nombres estáticos dentro de `@for`.

### 5.3 Mismo componente (sin cambio de ruta): servicio reutilizable

```ts
// morph.service.ts
import { ApplicationRef, Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface VTLike { finished: Promise<void>; skipTransition(): void; }
type DocWithVT = Document & { startViewTransition?: (cb: () => void | Promise<void>) => VTLike };

@Injectable({ providedIn: 'root' })
export class MorphService {
  private readonly doc = inject(DOCUMENT) as DocWithVT;
  private readonly appRef = inject(ApplicationRef);

  private prefersReduced(): boolean {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Ejecuta `update` dentro de una View Transition con fallback automático. */
  async run(update: () => void): Promise<void> {
    if (!this.doc.startViewTransition || this.prefersReduced()) {
      update();
      return;
    }
    const transition = this.doc.startViewTransition(() => {
      update();
      this.appRef.tick(); // fuerza a Angular a pintar el DOM nuevo dentro del callback
    });
    try { await transition.finished; } catch { /* transición omitida/cancelada: ignorar */ }
  }

  /** Asigna el nombre al elemento de origen ANTES de capturar el estado viejo. */
  name(el: HTMLElement, value: string): void {
    el.style.viewTransitionName = value;
  }
  clear(el: HTMLElement | null): void {
    if (el) el.style.viewTransitionName = '';
  }
}
```

> `appRef.tick()` es imprescindible: `startViewTransition` captura el nuevo estado cuando el callback termina, y Angular debe haber actualizado el DOM para entonces.

### 5.4 Patrón A: botón → modal (morph de contenedor)

```ts
// perfil.component.ts
private readonly morph = inject(MorphService);
readonly isEditModalOpen = signal(false);
private triggerEl: HTMLElement | null = null;

async abrirEditar(ev: Event) {
  this.triggerEl = ev.currentTarget as HTMLElement;
  this.morph.name(this.triggerEl, 'edit-surface');      // origen con nombre
  await this.morph.run(() => {
    this.triggerEl!.style.viewTransitionName = 'none';   // el origen cede el nombre
    this.isEditModalOpen.set(true);                      // el modal lo tiene en su plantilla
  });
}

async cerrarEditar() {
  await this.morph.run(() => {
    this.isEditModalOpen.set(false);
    this.morph.name(this.triggerEl!, 'edit-surface');    // el botón recupera el nombre
  });
  this.morph.clear(this.triggerEl);
}
```

```html
<button type="button" (click)="abrirEditar($event)" class="vt-morph rounded-xl bg-slate-900 text-white px-5 py-2.5">
  Editar Perfil
</button>

@if (isEditModalOpen()) {
  <div class="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div class="vt-morph bg-white rounded-3xl shadow-(--shadow-float) w-full max-w-lg p-8"
         style="view-transition-name: edit-surface">
      ...
    </div>
  </div>
}
```

### 5.5 Patrón B: tarjeta de proyecto → detalle en overlay

```ts
selected = signal<Proyecto | null>(null);
private activeCard: HTMLElement | null = null;

async abrir(proy: Proyecto, ev: Event) {
  this.activeCard = ev.currentTarget as HTMLElement;
  this.morph.name(this.activeCard, 'proy-active');
  await this.morph.run(() => {
    this.activeCard!.style.viewTransitionName = 'none';
    this.selected.set(proy);
  });
}

async cerrar() {
  await this.morph.run(() => {
    this.selected.set(null);
    this.morph.name(this.activeCard!, 'proy-active');
  });
  this.morph.clear(this.activeCard);
  this.activeCard = null;
}
```

### 5.6 Patrón C: avatar → visor

El avatar pequeño y la imagen grande comparten `view-transition-name: avatar`. Usa `object-fit: cover` en ambos y el CSS de §5.8 para que el radio pase de círculo a rectángulo suavemente.

### 5.7 Patrón D: reordenar/filtrar lista (FLIP)

Cuando View Transitions no encaje (p. ej. varios elementos a la vez dentro de un `@for`):

```ts
flip(container: HTMLElement, mutate: () => void) {
  const items = Array.from(container.children) as HTMLElement[];
  const first = new Map(items.map(el => [el, el.getBoundingClientRect()]));
  mutate();                                   // cambia el orden/filtro
  this.appRef.tick();
  for (const el of Array.from(container.children) as HTMLElement[]) {
    const f = first.get(el);
    if (!f) continue;
    const l = el.getBoundingClientRect();
    const dx = f.left - l.left, dy = f.top - l.top;
    if (!dx && !dy) continue;
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration: 350, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    );
  }
}
```
(Usar `track` por `id` en el `@for` para que Angular **reutilice** los nodos y FLIP funcione.)

### 5.8 CSS de los pseudo-elementos (en `styles.css`, global)

```css
/* Duración y curva base de todos los grupos */
::view-transition-group(*) {
  animation-duration: var(--duration-morph, 450ms);
  animation-timing-function: var(--ease-emphasized, cubic-bezier(0.2, 0.8, 0.2, 1));
}

/* Cambio de página: crossfade corto del root */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
}

/* Elementos con view-transition-class: morph */
::view-transition-group(*.morph) {
  overflow: clip;                 /* recorta el contenido al morfar */
  border-radius: 1.5rem;          /* ajusta al radio del destino */
}
::view-transition-old(*.morph),
::view-transition-new(*.morph) {
  height: 100%;
  width: 100%;
  object-fit: cover;              /* evita el estiramiento de la captura */
}

/* Avatar: círculo -> rectángulo */
::view-transition-group(avatar) { border-radius: 9999px; overflow: clip; }

/* Entrada del overlay de fondo (no compartido) */
::view-transition-new(edit-backdrop) { animation: fade-in 250ms both; }
::view-transition-old(edit-backdrop) { animation: fade-in 180ms reverse both; }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
```

### 5.9 Entrada/salida de overlays sin librerías

**Con `<dialog>` + CSS (recomendado para modales):**
```html
<dialog #dlg class="open:flex ... starting:opacity-0 starting:scale-95 opacity-100 scale-100 transition-[opacity,transform,display,overlay] duration-300 ease-emphasized transition-discrete">
```
`starting:` (Tailwind v4) aplica el estilo inicial equivalente a `@starting-style`.

**Con Angular ≥ 20.2:**
```html
@if (open()) {
  <div animate.enter="modal-in" animate.leave="modal-out"> ... </div>
}
```
```css
.modal-in  { animation: scale-in 250ms var(--ease-emphasized) both; }
.modal-out { animation: scale-in 180ms var(--ease-standard) reverse both; }
```

---

## 6. Recetas aplicadas al perfil del proyecto

| Elemento actual | Transformación | Nombre de transición |
|---|---|---|
| Botón **Editar Perfil** → Modal de edición | Botón → contenedor (Patrón A) | `edit-surface` |
| Botón **+ Agregar** habilidad → Modal de habilidad | Botón → contenedor (Patrón A) | `skill-surface` |
| Chip de habilidad (al agregar) | Entra con `scale-in` + stagger; al eliminar, sale con fade+scale | sin VT (`animate.enter/leave`) |
| Tarjeta de proyecto → detalle | Patrón B o ruta con `withViewTransitions` | `proy-{id}` |
| Avatar → visor de foto | Patrón C | `avatar` |
| Banner → vista previa de portada | clip-path/crossfade | `banner` |
| Skeleton → contenido real | Crossfade 200 ms (mismas dimensiones) | sin VT |
| Anillo de progreso | `stroke-dashoffset` con `transition-all duration-1000 ease-out` | sin VT |
| Toast | `slide-in-from-bottom` 200 ms, salida 150 ms | sin VT |

---

## 7. Compatibilidad y fallbacks

- View Transitions *same-document*: Chrome/Edge ≥ 111, Safari ≥ 18, Firefox recientes. **Verificar en caniuse antes de depender de ello.** `view-transition-class` y `match-element` son más nuevos: no son críticos, solo mejoras.
- Siempre: `if (!document.startViewTransition) { update(); return; }` (ya encapsulado en `MorphService`).
- El estado final de la UI **no puede depender de que la animación termine**.
- Probar con: (1) navegador sin soporte, (2) `prefers-reduced-motion`, (3) CPU throttling x4, (4) móvil.

---

## 8. Accesibilidad (obligatorio)

- `prefers-reduced-motion`: sin morph, sin parallax; solo cambios de opacidad instantáneos.
- Modales: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, **trampa de foco**, cierre con `Esc`, devolver foco al disparador al cerrar.
- Botones con solo icono: `aria-label`. Iconos decorativos: `aria-hidden="true"`.
- Toast: `role="status"` + `aria-live="polite"`.
- No transmitir información solo con color o solo con movimiento.
- Objetivos táctiles ≥ 40×40 px en móvil.

---

## 9. Rendimiento

- Máximo **3–4 elementos con `view-transition-name`** simultáneos.
- No nombrar elementos enormes ni con `backdrop-filter` pesado si se puede evitar (se rasterizan).
- `will-change: transform` solo **durante** la animación, nunca permanente.
- Evitar animar sombras grandes: anima `opacity` de un pseudo-elemento con la sombra.
- Imágenes con `width/height` o `aspect-ratio` para evitar saltos de layout.
- Usar `NgOptimizedImage` (`ngSrc`) para fotos de perfil/banner.
- Respetar `OnPush` y signals: no llamar funciones costosas en plantilla.

---

## 10. Anti-patrones (la IA NO debe hacer esto)

- ❌ Dos elementos con el mismo `view-transition-name` a la vez.
- ❌ Nombres estáticos dentro de `@for`.
- ❌ Poner `view-transition-name` a todos los elementos “por si acaso”.
- ❌ Olvidar `appRef.tick()` dentro del callback de `startViewTransition` con signals.
- ❌ Animaciones > 600 ms o con rebotes exagerados en UI de trabajo.
- ❌ `transition: all` en elementos grandes (usa propiedades concretas).
- ❌ Usar `localStorage`/librerías de animación pesadas (GSAP, etc.) para un morph que CSS/View Transitions resuelve.
- ❌ Concatenar clases de Tailwind dinámicamente (`'bg-' + color + '-500'`): Tailwind no las genera. Usar mapas con nombres de clase completos.
- ❌ Hardcodear colores hex en componentes cuando existe un token.
- ❌ Dejar un overlay sin salida animada o sin foco gestionado.

---

## 11. Checklist de entrega (la IA debe verificarlo antes de responder)

**Diseño**
- [ ] Usa tokens (`brand-*`, sombras, curvas) y no valores mágicos.
- [ ] Jerarquía tipográfica clara, máximo 3 pesos.
- [ ] Estados `loading / empty / error / lleno` cubiertos.
- [ ] Foco visible y contraste AA.

**Morph / Shared element**
- [ ] Cada `view-transition-name` es único en cada estado.
- [ ] Origen y destino comparten nombre y `view-transition-class`.
- [ ] El callback de `startViewTransition` actualiza signals **y** llama a `appRef.tick()`.
- [ ] Hay fallback sin animación y respeto de `prefers-reduced-motion`.
- [ ] Al cerrar, el foco vuelve al elemento que abrió.
- [ ] Duración entre 350–500 ms, curva `ease-emphasized`.

**Código**
- [ ] Standalone + `OnPush` + signals; control flow moderno.
- [ ] Sin `any` innecesario; tipos para la API de View Transitions.
- [ ] Sin dependencias nuevas salvo que sea imprescindible.

---

## 12. Formato de respuesta esperado de la IA

Cuando el usuario pida aplicar estas skills, responde **siempre** con:

1. **Resumen (2–3 líneas):** qué elementos se transforman y con qué técnica.
2. **Código por archivo**, en este orden: `styles.css` (tokens/pseudo-elementos) → `*.service.ts` → `*.component.ts` → `*.component.html`.
3. **Tabla de nombres de transición** usados (para evitar colisiones).
4. **Notas de compatibilidad/fallback** en una línea.
5. **No** reescribas partes del código que no cambian; indica con comentarios `// ...sin cambios`.

---

## 13. Prompt plantilla para pedir cambios

```
Aplica el SKILL "Diseño Premium + Morph + Shared Element" a <componente>.

Objetivo: <ej. que el botón "Editar Perfil" se transforme en el modal y que las tarjetas de proyecto se expandan a detalle>.
Stack: Angular (standalone, signals, OnPush), Tailwind v4, CSS y TS.
Restricciones: respetar prefers-reduced-motion, fallback sin View Transitions, accesibilidad de modales.
Entrega: styles.css, morph.service.ts, <componente>.ts y <componente>.html con los cambios.
```