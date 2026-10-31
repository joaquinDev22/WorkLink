# 🚀 WorkLink Frontend — Guía de Traspaso y Estado del Proyecto (Handoff)

> Este documento contiene el contexto completo, configuración del agente de IA, herramientas, estado de las historias de usuario en Jira y los siguientes pasos para retomar el desarrollo en cualquier máquina o laptop sin perder continuidad.

---

## 🛠️ 1. Configuración del Agente de IA y Skills

### Directivas y Modos de Operación
* **Modo Read-Only en Código Fuente (`AI_RULES.md`):** La IA actúa como **Profesor -> Alumno**. No edita archivos `.ts`, `.html` o `.css` directamente; explica la arquitectura, muestra el código exacto y guía al desarrollador para que él lo implemente.
* **Regla de Formato TypeScript:** Estrictamente **sin punto y coma** (`no semicolons`).
* **Mindset Ponytail (Ladder of Simplicity):**
  1. *YAGNI:* No inventar wrappers ni código no solicitado.
  2. *Reuse:* Reutilizar pipes, componentes y helpers existentes.
  3. *Stdlib / Platform:* Aprovechar Signals, Native Blobs, HTML5 y CSS nativo de Tailwind v4.
  4. *One-Liner / Minimal Code:* Mínimas líneas necesarias, máxima claridad.

### Skills y Especialidades Activas
1. **`twg-setup` / Atlassian Teamwork Graph CLI (`twg`):** Integración directa con Jira Software Cloud (`joaking102003.atlassian.net`, Proyecto `WL`). Permite consultar DoD, criterios de aceptación Gherkin y transicionar historias a `Finalizado`.
2. **`ponytail`:** Evita sobreingeniería y exige el resumen `💡 Ponytail summary` en cada solución técnica.
3. **`taste-skill` & `tasteful-ui-skill`:** Reglas de diseño estético, jerarquía tipográfica, microinteracciones y superficies de cristal (*glassmorphism*).
4. **`transitions-dev`:** Física de transiciones, aceleración GPU con `translate3d`, curvas de desaceleración `cubic-bezier(0.16, 1, 0.3, 1)` y animación de entrada/salida para modales.
5. **`UX-design-hallimark` & `build-design`:** Patrones de navegación accesible, estados de carga metálicos (`animate-shine`) y validaciones en formularios.

---

## 🔌 2. MCP, Plugins y Herramientas Externas

### Atlassian TWG CLI (Jira)
* **Plugin:** `antigravity-plugins-partners/plugin/atlassian-twg-cli`
* **Cuenta conectada:** `joaking102003@gmail.com`
* **Sitio Jira:** `https://joaking102003.atlassian.net`
* **Ruta del ejecutable (Windows):** `"$env:LOCALAPPDATA\Programs\twg\bin\twg.exe"`
* **Comandos útiles:**
  ```powershell
  # Consultar ticket
  & "$env:LOCALAPPDATA\Programs\twg\bin\twg.exe" jira workitem get WL-17 -o json

  # Listar transiciones de estado disponibles
  & "$env:LOCALAPPDATA\Programs\twg\bin\twg.exe" jira workitem transition --id WL-17

  # Transicionar a Finalizado (id: 41)
  & "$env:LOCALAPPDATA\Programs\twg\bin\twg.exe" jira workitem transition --id WL-17 --transition-id 41 --transition-comment "Completado y verificado" --transition-comment-format plain
  ```

---

## 📊 3. Estado Actual del Proyecto

### Arquitectura Técnica
* **Framework:** Angular 22 Standalone con Zoneless / Signals.
* **Formularios:** `@angular/forms/signals` (`form()`, directiva `[formField]`, validadores de esquema).
* **Estilos:** Tailwind CSS v4 (`@import 'tailwindcss';` con `@theme` personalizado en `src/styles.css`).
* **Backend:** Spring Boot (Java) en `http://localhost:8080/api/v1` (con soporte para desarrollo local mediante `bypassAuth: true` en `environment.ts`).

### Rama de Trabajo Activa
* **Branch:** `WL-13-ÉPICA-2-Perfil-Profesional-Portafolio-y-Habilidades-UI`

### Progreso en Jira — Épica 2 (`WL-13`): Perfil Profesional, Portafolio y Habilidades (UI)

| Key | User Story | Estado | Detalle Técnico Completado |
| :--- | :--- | :---: | :--- |
| **`WL-12`** | **US-06:** Vista de Consulta de Perfil | 🟢 `Finalizado` | Layout LinkedIn/GitHub, Skeletons metálicos `animate-shine`, Anillo circular SVG de progreso (0 a 100%), Header modal flotante. |
| **`WL-14`** | **US-07:** Formulario de Edición de Perfil | 🟢 `Finalizado` | Modal reactivo con Signal Forms (`@angular/forms/signals`), validaciones de país/teléfono, URLs `https://`, animaciones de entrada/salida y spinner de guardado. |
| **`WL-15`** | **US-08:** Carga y Previsualización de CV (PDF) | 🟢 `Finalizado` | Drag & Drop / selector de PDF ($\le$ 5 MB), streaming binario con `Blob`, previsualización en pestaña nueva, descarga a disco y soporte en `bypassAuth`. |
| **`WL-16`** | **US-09:** Carga de Foto de Perfil y Banner | 🟢 `Finalizado` | Lectura asíncrona con `FileReader` a Base64, recorte y previsualización reactiva inmediata. |
| **`WL-17`** | **US-10:** Gestor de Habilidades Técnicas y Nivel | 🟡 `En curso` | Pendiente integrar interfaz de selección de skills y niveles (1-4). |
| **`WL-18`** | **US-11:** Galería y Proyectos de Portafolio | 🟡 `En curso` | Pendiente modal para alta de proyectos con imagen y link. |
| **`WL-19`** | **US-12:** Reputación y Reseñas de Usuario | ⚪ `Por hacer` | Pendiente tarjeta de reseñas, estrellas y badges de confianza. |

---

## 🎯 4. Lo que Falta por Hacer (Roadmap de Retorno)

Para dar por cerrada la **Épica 2** y el Sprint de Perfiles, restan 3 pasos concretos:

### Paso 1: `WL-17` (US-10) — Gestor Interactivo de Habilidades Técnicas y Nivel
* **Contrato:**
  * Alta: `POST /api/v1/perfiles/addMySkill?nombre={n}&nivel={v}` (Nivel 1=Básico, 2=Intermedio, 3=Avanzado, 4=Experto).
  * Baja: `DELETE /api/v1/perfiles/removeMySkill/{habilidadId}`.
* **Archivos a tocar:**
  * `perfil.ts`: métodos `addSkill()` y `removeSkill()` (con soporte mock en `bypassAuth`).
  * `mi-perfil.html`: Botón `+ Agregar Habilidad` con selector de tecnología y nivel, y botón `✕` de eliminación en cada chip.

### Paso 2: `WL-18` (US-11) — Galería y Diálogo de Proyectos de Portafolio
* **Contrato:**
  * Alta: `POST /api/v1/perfiles/addMyProject` (`FormData` con `nombre`, `descripcion`, `link` opcional e `imagen` opcional).
  * Baja: `DELETE /api/v1/perfiles/removeMyProject/{proyectoId}`.
* **Archivos a tocar:**
  * `perfil.ts`: métodos `addProject()` y `removeProject()`.
  * `mi-perfil.html`: Modal de alta de proyecto y botón de borrado en tarjetas de portafolio.

### Paso 3: `WL-19` (US-12) — Visualización de Reputación y Reseñas
* **Objetivo:** Mostrar resumen cuantitativo (promedio de estrellas, cantidad de calificaciones) y lista de testimonios de clientes anteriores o empresas.
* **Cierre de Épica:** Transicionar `WL-17`, `WL-18`, `WL-19` y la épica principal `WL-13` a `Finalizado`.

---

## 💻 5. Instrucciones para la Laptop de Viaje

1. **Clonar / Actualizar el repositorio:**
   ```bash
   git fetch origin
   git checkout WL-13-ÉPICA-2-Perfil-Profesional-Portafolio-y-Habilidades-UI
   git pull origin WL-13-ÉPICA-2-Perfil-Profesional-Portafolio-y-Habilidades-UI
   ```
2. **Instalar dependencias si es clon nuevo:**
   ```bash
   npm install
   ```
3. **Modo de desarrollo sin backend levantado:**
   Verificar en `src/environments/environment.ts` que:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api/v1',
     bypassAuth: true // <-- Permite probar toda la UI, subida de CV, fotos y datos sin prender Spring Boot
   }
   ```
4. **Levantar el servidor de desarrollo:**
   ```bash
   npx ng serve
   # Navegar a http://localhost:4200
   ```
5. **Verificar que el build compile limpio:**
   ```bash
   npx ng build --watch=false
   ```

