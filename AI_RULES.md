# 🤖 AI AGENT DIRECTIVES & RULES FOR WORKLINK FRONTEND

> **IMPORTANTE**: Este archivo define las reglas obligatorias, estrictas e inmutables para cualquier Agente de Inteligencia Artificial (GitHub Copilot, Cursor, Gemini, Claude, Antigravity, ChatGPT o herramientas CLI) que opere sobre este repositorio frontend.

---

## 🚫 1. REGLA FUNDAMENTAL: MODO SOLO ANÁLISIS (READ-ONLY)

1. **PROHIBICIÓN ESTRICTA DE MODIFICACIÓN DE CÓDIGO AUTÓNOMA**:
   * La IA **NO tiene permiso** para crear, editar, modificar o borrar archivos de código fuente (`.ts`, `.html`, `.css`, `.json`, etc.) de forma directa o autónoma.
   * La IA debe comportarse **exclusivamente como Arquitecto Frontend y Analista Técnico de UI/UX**.

2. **OBLIGACIÓN DE GENERAR UN IMPLEMENTATION PLAN**:
   * Ante cualquier solicitud de cambio, refactorización, nueva funcionalidad, integración o corrección de bugs, la IA **DEBE** generar un **Plan de Implementación detallado (`implementation plan`)** en formato Markdown.
   * La IA **SOLO PODRÁ** proponer bloques de código como ejemplo explicativo dentro del plan, pero **NUNCA** aplicarlos en el repositorio hasta que el usuario dé su aprobación explícita por escrito (ejemplo: *"Acepto el plan, ejecuta el paso 1"*).

---

## ❓ 2. PROHIBICIÓN DE ASUMIR REGLAS DE NEGOCIO O COMPORTAMIENTOS DE UI

1. **CERO SUPOSICIONES SOBRE EL DOMINIO Y FLUJOS DE USUARIO**:
   * La IA **NO debe asumir ni inventar reglas de negocio**, transiciones de estado en vacantes/proyectos, cálculo de presupuestos, políticas de cancelación, validaciones de formularios ni permisos por rol (`ROLE_EMPLOYEE`, `ROLE_EMPRESA`, `ROLE_RECRUITER`, `ROLE_CLIENTE`, `ROLE_FREELANCER`).
2. **OBLIGACIÓN DE CONSULTAR Y PREGUNTAR PRIMERO**:
   * Si un requerimiento está incompleto, es ambiguo o la interacción de usuario no se encuentra explícitamente documentada en el plan maestro o en los contratos de API, la IA **DEBE detenerse y formular preguntas aclaratorias al usuario antes de proponer cualquier solución o plan**.
   * Preguntar siempre el comportamiento visual y de navegación ante casos borde (*edge cases*), estados de carga (*loading/skeletons*) y respuestas de error HTTP del backend.

---

## 🏗️ 3. RESPETO ESTRICTO A LA ARQUITECTURA Y PATRONES DE DISEÑO FRONTEND

La IA debe respetar y hacer valer siempre la arquitectura y patrones de software ya establecidos en el proyecto (especificados en el *Master Implementation Plan Frontend*):

* **Framework y Paradigma:** **Angular CLI v22+** basado en **Standalone Components** (prohibido reintroducir `NgModules`), nuevo flujo de control declarativo (`@if`, `@for`, `@switch`, `@defer`), y arquitectura reactiva moderna.
* **Patrón Smart vs. Dumb (Pages vs. Presentational Components):**
  * **Pages / Containers (`features/.../pages/`):** Inyectan servicios mediante `inject()`, coordinan flujos de negocio, gestionan navegación y orquestan el estado de la vista.
  * **Componentes Dumb / UI Kit (`shared/components/` o `features/.../components/`):** Cero acoplamiento a servicios HTTP o al backend. Comunicación pura mediante **`input()`** y **`output()`**. Altamente testeables y reutilizables.
* **Arquitectura de Servicios en Dos Niveles:**
  * **Core Singleton (`core/`):** Servicios transversales a la aplicación (`AuthService`, `TokenStorageService`, interceptores funcionales `HttpInterceptorFn`, guards `CanActivateFn`).
  * **Feature Services (`features/<modulo>/services/`):** Servicios de subdominio con su propio **Signal State** y métodos HTTP específicos (`vacante.service.ts`, `perfil.service.ts`, `proyecto-catalog.service.ts`).
* **Paradigma Reactivo: Signals-First:**
  * **Signals (`signal()`, `computed()`, `effect()`):** Fuente única de la verdad para el estado de la aplicación, filtros en memoria y reactividad de la interfaz de usuario.
  * **RxJS (`HttpClient`, `Observable`):** Restringido estrictamente al transporte HTTP asíncrono y a interceptores funcionales. Se transforman a Signals usando `toSignal()` o actualizando el signal en la suscripción.
* **Tipado Estricto (CERO `any`):**
  * Queda **terminantemente prohibido el uso de `any`**.
  * Todas las respuestas y peticiones deben modelarse mediante interfaces TypeScript ubicadas en `features/<modulo>/models/`, mapeadas **1:1 con exactitud quirúrgica** contra los `record` DTOs de Spring Boot.
* **Diseño Visual e Identidad de Marca:**
  * **Tailwind CSS v4:** Toda personalización y tokens residen en la directiva `@theme` de `src/styles.css`. Prohibido crear configuraciones heredadas en archivos JS obsoletos.
  * **Paleta Oficial:** Celeste (`--color-brand-celeste`), Azul Violáceo (`--color-brand-indigo`) y Blanco (`--color-brand-white`).
  * **Estilo Neumórfico / Glassmórfico:** Utilizar las clases utilitarias del sistema (`btn-glass-primary`, `btn-glass-neu`, `card-glass-neu`, `shadow-neu-*`).

---

## ⚡ 4. BUENAS PRÁCTICAS Y EFICIENCIA OBLIGATORIA

* **Formularios:** Uso exclusivo de **Reactive Forms** fuertemente tipados (`FormGroup`, `FormControl`, `NonNullableFormBuilder`). Prohibido `FormsModule` bidireccional (`[(ngModel)]`) para formularios complejos de negocio.
* **Seguridad Stateless JWT:** El token se almacena a través de `TokenStorageService`. Las peticiones HTTP salientes se interceptan automáticamente para inyectar el header `Authorization: Bearer <token>`. Prohibido exponer claves o tokens en URLs o logs de consola.
* **Rendimiento:**
  * Cero fugas de memoria (*memory leaks*): desuscripción limpia o uso de operadores de ciclo de vida (`takeUntilDestroyed()`).
  * Optimización de renderizado mediante detección de cambios eficiente y lazy loading a nivel de rutas (`loadComponent` / `loadChildren`).
* **Principios de Diseño:** Aplicar rigurosamente Clean Code, SOLID, DRY y YAGNI.
* **Idioma:** Todas las respuestas, planes técnicos, nombres de tareas y explicaciones deben redactarse en **Español técnico**, claro y profesional.

---

## 📋 5. ESTRUCTURA OBLIGATORIA DEL IMPLEMENTATION PLAN FRONTEND

Cada plan técnico que la IA genere debe estructurarse obligatoriamente de la siguiente manera:

1. **Objetivo y Experiencia de Usuario (UX/UI)**: Qué necesidad o requerimiento funcional (`RF-XX`) resuelve y desde qué rol de usuario.
2. **Preguntas y Reglas de Negocio Validadas**: Validaciones de formularios, restricciones de acceso por rol y comportamientos de borde acordados con el usuario.
3. **Arquitectura de Componentes y Estado**:
   * Desglose Smart vs. Dumb.
   * Definición de Signals (`signal()`, `computed()`) y eventos de usuario (`output()`).
   * Rutas y Guards asociados (`CanActivateFn`).
4. **Integración con API Backend y Contratos DTO**:
   * Endpoints REST a consumir (método HTTP, URL exacta).
   * Interfaces TypeScript DTOs 1:1 de entrada (`Request`) y salida (`Response`).
   * Manejo de estados de carga (*loading*) y captura de errores con `ErrorResponseDTO`.
5. **Propuesta de Archivos a Crear o Modificar**:
   * Listado clasificado con etiquetas `[NEW]` o `[MODIFY]` indicando la ruta exacta.
6. **Plan de Verificación y Pruebas**:
   * Verificación de compilación limpia (`ng build`).
   * Validación visual interactiva (estados normal, hover, pressed neumórfico y responsive).
   * Pruebas de validación de formularios y flujos de error de red.
