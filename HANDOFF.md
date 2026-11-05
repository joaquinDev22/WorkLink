# 🚀 WorkLink - Estado de Entrega & Guía de Continuación (Handoff)

Este documento resume la configuración del entorno, herramientas, estado del proyecto en Jira y pasos para continuar el desarrollo en local durante viajes o sin conexión directa.

---

## 🎯 1. Estado de la Épica 2 (`WL-13`) en Jira: **100% FINALIZADA**

| Clave | Resumen / Historia de Usuario | Estado Jira |
|---|---|---|
| **WL-12** | US-06: Vista de Consulta de Perfil de Usuario Autenticado | `Finalizado` |
| **WL-14** | US-07: Formulario de Actualización de Datos de Perfil | `Finalizado` |
| **WL-15** | US-08: Componente de Carga y Previsualización de CV (Streaming Binario) | `Finalizado` |
| **WL-16** | US-09: Componente de Carga de Foto de Perfil y Banner | `Finalizado` |
| **WL-17** | US-10: Gestor Interactivo de Habilidades Técnicas y Nivel | `Finalizado` |
| **WL-18** | US-11: Galería y Diálogo de Proyectos de Portafolio (Alta/Baja/FormData) | `Finalizado` |
| **WL-19** | US-12: Visualización de Reputación y Reseñas de Usuario | `Finalizado` |
| **WL-13** | **ÉPICA 2: Perfil Profesional, Portafolio y Habilidades (UI)** | **`Finalizado`** |

---

## 🛠️ 2. Arquitectura y Tecnologías Aplicadas

* **Framework:** Angular 22 Standalone con Zoneless / Signals reactivas (`signal`, `computed`).
* **Estilos:** Tailwind CSS v4 con variables semánticas `@theme` en `styles.css`.
* **Formularios:** Angular Signal Forms (`form()`, `validate()`, `pattern()`, etc.).
* **Transiciones Morfológicas:** Shared Element Transitions nativas (`document.startViewTransition`) con `MorphService` (`src/app/core/services/morph.ts`), respetando `prefers-reduced-motion` y manteniendo el fondo nítido sin distorsiones ni artefactos.
* **Seguridad:** Interceptores de autenticación JWT (`authInterceptor`) y manejo centralizado de errores HTTP (`errorInterceptor`).
* **Modo Offline/Local:** `environment.bypassAuth = true` permite probar flujos completos (subida de PDFs válidos, carga de fotos, alta y borrado de proyectos y calificaciones) sin requerir el backend encendido.

---

## 💻 3. Pasos para Correr en la Laptop

1. **Instalar dependencias (si es una clonación limpia):**
   ```bash
   pnpm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npx ng serve
   ```
   Abrir en navegador: `http://localhost:4200`

3. **Verificar compilación limpia de producción:**
   ```bash
   npx ng build --watch=false
   ```

---

## 📋 4. Próxima Épica sugerida para el Sprint

Revisar en Jira la siguiente épica priorizada (ej. Épica 3 de Búsqueda y Postulación a Ofertas Laborales o Épica de Contratación Freelance).

