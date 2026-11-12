# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Postulante / Freelancer:** Talento IT con cuenta dual que explora vacantes laborales o proyectos freelance por contrato, postula con cotización económica y ejecuta hitos entregables.
- **Cliente Particular:** Persona o entidad que publica proyectos freelance con rango presupuestario, compara propuestas recibidas, adjudica freelancers, gestiona hitos de entrega y califica el resultado.
- **Empresa / Reclutador:** Organizaciones y recruiters oficiales que publican vacantes, gestionan candidatos en pipeline y coordinan entrevistas.

## Product Purpose

WorkLink conecta talento tecnológico con ofertas laborales formales y proyectos freelance con seguimiento por hitos, historial de reputación y gestión integral del ciclo de contratación en una sola aplicación web.

## Operating Context

- Frontend web en Angular 22 (Standalone Components, Signals, Tailwind CSS v4) conectado a una API REST en Spring Boot (`/api/v1`).
- Los usuarios en rol `POSTULANTE` / `FREELANCER` pueden alternar su modo operativo para explorar vacantes o proyectos freelance; los clientes particulares operan bajo el rol `CLIENTE`.
- Toda la operación en producción consume datos reales de la API (`environment.bypassAuth = false`); los datos de prueba solo aplican en modo bypass offline.

## Capabilities and Constraints

- Autenticación JWT y Google OAuth2 SSO con control de acceso por rol (`roleGuard` y JWT claims).
- En Épica 4 (Ecosistema Freelance): perfil particular de cliente (`GET/PUT /api/v1/client/me` y dashboard `GET /api/v1/client/dashboard`), publicación de proyectos (`POST /api/v1/freelance/proyectos/me`), catálogo público con filtros (`GET /api/v1/freelance/proyectos`), envío de propuestas (`POST /api/v1/freelance/proyectos/{id}/postulaciones/me`), comparación y adjudicación (`GET .../postulaciones`, `PUT .../asignar`), seguimiento de hitos (`GET/POST .../hitos`, `PUT .../hitos/{hitoId}/estado`), cierre/cancelación (`PUT .../cancelar`) y reseñas/calificaciones (`POST/GET .../calificar`, `.../calificaciones`).
- No inventar datos mock visibles cuando la aplicación opera contra el backend real; respetar mensajes de error sanitizados sin exponer trazas técnicas al usuario.

## Brand Commitments

- Identidad WorkLink: diseño limpio sobre base clara (`slate-50` / blanco), tinta profunda (`slate-900`), acentos de marca `#4f46e5` (`brand-indigo`), `#6d28d9` (`brand-violet`) y `#38bdf8` (`brand-sky`), superficies táctiles con biseles sutiles, botones primarios sólidos y secundarios sutiles, y transiciones morfológicas (`MorphService`) respetando `prefers-reduced-motion`.
- Idioma de toda la interfaz y copy UX: español (Argentina / Latam).

## Evidence on Hand

- Contrato OpenAPI/Spring Boot verificado en `D:\Facultad\Programacion 3\Proyecto-Final-Progra-3` (`ClientController`, `ProyectoController`, `PostulacionProyectoController`, `HitoController`, `CalificacionProyectoController`).
- Sistema visual establecido en `src/styles.css`, `src/app/core/layout/*`, `src/app/features/enterprise/*` y `src/app/features/perfiles/*`.
- Trabajo parcial previo de catálogo y detalle freelance en la rama `WL-30-ÉPICA-4-Ecosistema-Freelance-y-Proyectos-UI`.

## Product Principles

- **Claridad operativa:** Un flujo por pantalla, jerarquía visual clara y una acción primaria inequívoca por bloque.
- **Datos reales primero:** Cero métricas, reseñas o listados inventados en modo conectado a API; estados vacíos accionables cuando no existen registros.
- **Seguridad y validación en frontera:** Validaciones cruzadas de montos y rangos en formularios reactivos antes de despachar mutaciones al servidor.
- **Movimiento con propósito:** Animaciones fluidas e interrumpibles con limpieza estricta de contexto en SPAs (`gsap.context()`, GPU-accelerated `transform`/`opacity`) y respeto a `prefers-reduced-motion`.

## Accessibility & Inclusion

- Tamaño mínimo de objetivos táctiles interactivos de 44×44px en dispositivos móviles.
- Anillos de foco visibles (`focus-visible:ring-2 focus-visible:ring-brand-sky`), orden lógico de tabulación, `aria-label` descriptivos en botones icónicos y soporte de teclado (Escape en modales).
