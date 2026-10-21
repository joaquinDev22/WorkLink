# 📐 MASTER IMPLEMENTATION PLAN: ARQUITECTURA FRONTEND ANGULAR CLI v22

**Proyecto:** WorkLink Platform (Cliente Web)  
**Tecnología Base:** Angular CLI v22 (Standalone Components, Signals-first, Control Flow `@if`/`@for`, `@defer`, Functional Guards/Interceptors, Strict TypeScript)  
**Backend Vinculado:** WorkLink REST API (Java 21, Spring Boot, MySQL 8.0, JWT Stateless)  
**Alcance:** Empleo Corporativo (Enterprise & Recruiting), Mercado Freelance, Identidad/Portafolio y Pasarela Mercado Pago. *(Nota: El módulo de Formación y Bootcamps queda explícitamente **Out of Scope** conforme a `requisitos.md`).*  
**Estado:** Documento Rector y Especificación Arquitectónica Definitiva  

---

## 1. Visión y Decisiones Arquitectónicas Fundamentales

Para construir un frontend escalable, mantenible y alineado con los estándares modernos de **Angular**, se establecen las siguientes reglas estructurales obligatorias:

### 1.1 ¿Se debe separar UI (Presentational/Dumb) de Pages (Smart/Containers)?
**SÍ, rotunda y obligatoriamente.** Se aplica el patrón **Smart vs. Dumb Components**:
* **Pages / Containers (`features/.../pages/`):**
  * Inyectan servicios de estado y de datos mediante `inject()`.
  * Coordinan flujos de negocio, procesan eventos, disparan peticiones HTTP y gestionan la navegación (`Router`, `ActivatedRoute`).
  * No definen estilos visuales complejos ni maquetación repetitiva; delegan la presentación a componentes de UI.
* **Componentes de UI / Presentational (`shared/components/` o `features/.../components/`):**
  * **Cero acoplamiento al backend o a servicios de datos.**
  * Se comunican con el exterior únicamente mediante **`input()`** (para recibir estado) y **`output()`** (para emitir acciones del usuario).
  * Son 100% reutilizables, predecibles y testeables en aislamiento.

### 1.2 ¿Debería existir una carpeta especializada para cada servicio?
**SÍ, siguiendo una regla de colocación por alcance en dos niveles:**
1. **Servicios Globales / Singleton (`core/`):**
   * Servicios transversales que viven durante todo el ciclo de vida de la aplicación (`AuthService`, `TokenStorageService`, `NotificationService`).
2. **Servicios de Característica / Estado (`features/<modulo>/services/`):**
   * Cada subdominio posee su propia carpeta `services/`.
   * Contiene el servicio HTTP y el **Signal State** específico de esa funcionalidad (`vacante.service.ts`, `proyecto-catalog.service.ts`, `recruiter.service.ts`).
   * **Ventaja:** Alta cohesión y bajo acoplamiento; si un subdominio se refactoriza, sus servicios y modelos evolucionan en el mismo directorio sin dejar código huérfano.

### 1.3 ¿Deberían crearse Modelos e Interfaces por Dominio?
**SÍ, SIEMPRE.** Queda prohibido el uso del tipo `any`:
* **Modelos Globales (`core/models/` y `shared/models/`):** Contratos transversales como `UserSession`, `UserRole`, `ErrorResponseDTO` (manejo global de errores del `@RestControllerAdvice`) y `MessageResponseDTO`.
* **Modelos por Subdominio (`features/<modulo>/models/`):** Interfaces TypeScript ubicadas dentro de cada feature que mapean **1:1 con exactitud quirúrgica** los `record` DTOs de entrada y salida de Spring Boot.

### 1.4 Paradigma Reactivo: Signals-first vs. RxJS
* **Signals (`signal()`, `computed()`, `effect()`):** Fuente única de la verdad para el **estado síncrono, filtros en memoria y estado de la UI**. Reemplaza el uso de `BehaviorSubject` en componentes y servicios de estado.
* **RxJS (`HttpClient`, `Observable`, `pipe`):** Reservado **exclusivamente** para flujos asíncronos de transporte HTTP (`HttpClient`), interceptores funcionales (`HttpInterceptorFn`) y manejo de errores con `catchError`. Se integra con Signals mediante `toSignal()` o actualización explícita del `signal` al finalizar la petición.

---

## 2. Esquema Completo del Árbol de Directorios (Folder Structure)

> **Nota de Alcance:** Se excluye el subdominio `bootcamps/` por encontrarse fuera del alcance de evaluación definido en `requisitos.md`. Se incorporan todos los flujos de `PUBLIC`, `ROLE_EMPLOYEE`, `ROLE_EMPRESA`, `ROLE_RECRUITER`, `ROLE_CLIENTE` y `ROLE_FREELANCER`.

```text
src/
├── app/
│   ├── app.config.ts                               # Configuración raíz: provideRouter, provideHttpClient(withInterceptors)
│   ├── app.routes.ts                               # Enrutamiento principal con Lazy Loading y Guards por rol
│   ├── app.component.ts                            # Shell raíz de la aplicación (<router-outlet />)
│   │
│   ├── core/                                       # SERVICIOS SINGLETON, SEGURIDAD Y LAYOUT (Carga única)
│   │   ├── auth/                                   # Seguridad y Sesión JWT Stateless
│   │   │   ├── guards/                             # auth.guard.ts, role.guard.ts, guest.guard.ts (CanActivateFn)
│   │   │   ├── interceptors/                       # auth.interceptor.ts, error.interceptor.ts (HttpInterceptorFn)
│   │   │   └── services/                           # auth.service.ts (Signal-based), token-storage.service.ts
│   │   ├── layout/                                 # Estructura visual principal
│   │   │   ├── navbar/                             # Barra superior con sesión activa y cierre de sesión
│   │   │   ├── sidebar/                            # Navegación lateral dinámica según UserRole
│   │   │   └── main-layout.component.ts            # Contenedor maestro (Navbar + Sidebar + <router-outlet />)
│   │   └── models/                                 # user-role.enum.ts, session.model.ts, error-response.model.ts
│   │
│   ├── shared/                                     # RECURSOS TRANSVERSALES REUTILIZABLES (Dumb UI Kit)
│   │   ├── components/                             # Componentes presentacionales puros (input/output)
│   │   │   ├── button/                             # Botones con estado de carga (loading spinner)
│   │   │   ├── modal/                              # Diálogo modal accesible reutilizable
│   │   │   ├── data-table/                         # Tabla genérica para listados administrativos
│   │   │   ├── file-uploader/                      # Drag & Drop multipart/form-data (PDF, JPEG, PNG, WEBP)
│   │   │   ├── status-badge/                       # Etiquetas semánticas (BUSCANDO_TALENTO, EN_PROGRESO, etc.)
│   │   │   ├── confirm-dialog/                     # Confirmación de bajas lógicas/físicas y cancelaciones
│   │   │   └── spinner/                            # Indicador visual de carga
│   │   ├── directives/                             # Directivas estructurales y de comportamiento
│   │   │   ├── has-role.directive.ts               # Renderizado condicional por rol en plantillas
│   │   │   └── click-outside.directive.ts          # Cierre automático de menús desplegables
│   │   ├── pipes/                                  # currency-format.pipe.ts, date-es.pipe.ts, base64-img.pipe.ts
│   │   └── models/                                 # message-response.model.ts, habilidad.model.ts
│   │
│   └── features/                                   # SUBDOMINIOS DE NEGOCIO (Smart Pages + Feature Components)
│       │
│       ├── auth/                                   # 1. SUBDOMINIO: AUTENTICACIÓN (RF-01 a RF-03)
│       │   ├── pages/login/                        # login.component.ts (POST /api/v1/auth/login)
│       │   ├── pages/register/                     # register.component.ts (POST /api/v1/auth/register)
│       │   ├── components/google-btn/              # google-button.component.ts (POST /api/v1/auth/google)
│       │   ├── models/auth.models.ts               # LoginRequestDTO, LoginResponseDTO, PerfilRequestDTO, etc.
│       │   └── auth.routes.ts                      # Rutas públicas de acceso
│       │
│       ├── perfiles/                               # 2. SUBDOMINIO: IDENTIDAD Y PORTAFOLIO (RF-04 a RF-10)
│       │   ├── pages/mi-perfil/                    # mi-perfil.component.ts (GET/PUT /api/v1/perfiles/...)
│       │   ├── components/media-uploader/          # media-uploader.component.ts (uploadMyPhoto, uploadMyBanner)
│       │   ├── components/cv-uploader/             # cv-uploader.component.ts (uploadMyCV - PDF)
│       │   ├── components/skill-selector/          # skill-selector.component.ts (addMySkill, removeMySkill)
│       │   ├── components/portfolio-grid/          # portfolio-grid.component.ts (addMyProject, removeMyProject)
│       │   ├── components/account-danger-zone/     # account-danger-zone.component.ts (DELETE /api/v1/perfiles/me)
│       │   ├── services/perfil.service.ts          # Operaciones JSON y Multipart hacia /api/v1/perfiles
│       │   ├── models/perfil.models.ts             # PerfilUsuarioDTO, HabilidadDTO, ProyectoPortafolioDTO
│       │   └── perfiles.routes.ts
│       │
│       ├── enterprise/                             # 3. SUBDOMINIO: CORPORATIVO, VACANTES Y RECRUITING (RF-11 a RF-21, RF-31)
│       │   ├── empresa-perfil/                     # Gestión Institucional de la Empresa (RF-11)
│       │   │   ├── pages/empresa-form/             # empresa-form.component.ts (POST/PUT/GET /api/v1/empresas)
│       │   │   ├── services/empresa.service.ts     # ABM de empresa y métricas de dashboard
│       │   │   └── models/empresa.models.ts        # EmpresaRequestDTO, EmpresaResponseDTO, DashboardStatsResponseDTO
│       │   ├── dashboard/                          # Panel Analítico Corporativo (RF-31)
│       │   │   └── pages/empresa-dashboard/        # empresa-dashboard.component.ts (GET /api/v1/empresas/dashboard)
│       │   ├── recruiters/                         # Gestión de Recruiters Asociados (RF-12 a RF-14)
│       │   │   ├── pages/recruiter-list/           # recruiter-list.component.ts (GET/DELETE recruiters)
│       │   │   ├── components/recruiter-modal/     # recruiter-form-modal.component.ts (POST/PUT recruiter)
│       │   │   ├── services/recruiter.service.ts   # CRUD contra /api/v1/empresas/recruiters
│       │   │   └── models/recruiter.models.ts      # RecruiterRequestDTO, RecruiterResponseDTO
│       │   ├── vacantes/                           # Ciclo Completo de Vacantes y Postulaciones (RF-15 a RF-19)
│       │   │   ├── pages/vacante-catalogo/         # vacante-catalogo.component.ts (Público/Employee + Filtro Signals)
│       │   │   ├── pages/vacante-detail/           # vacante-detail.component.ts (Detalle + Postulación RF-18)
│       │   │   ├── pages/vacante-admin/            # vacante-admin-list.component.ts (GET /me, PUT, DELETE - RF-17)
│       │   │   ├── pages/vacante-form/             # vacante-create-edit.component.ts (POST /vacantes/me, PUT)
│       │   │   ├── pages/vacante-postulantes/      # vacante-postulantes.component.ts (GET /{id}/postulaciones - RF-19)
│       │   │   ├── components/vacante-card/        # vacante-card.component.ts (Dumb Card)
│       │   │   ├── components/postulacion-modal/   # postulacion-modal.component.ts (Multipart mensaje + CV)
│       │   │   ├── services/vacante.service.ts     # Signal State (filtrado en memoria) + llamadas REST
│       │   │   └── models/vacante.models.ts        # VacanteRequestDTO, VacanteResponseDTO, PostulacionResponseDTO
│       │   ├── entrevistas/                        # Coordinación de Entrevistas Técnicas (RF-20, RF-21)
│       │   │   ├── pages/entrevista-calendar/      # entrevista-calendar.component.ts (GET /api/v1/recruiter/entrevistas)
│       │   │   ├── components/agenda-modal/        # agenda-modal.component.ts (POST /api/v1/recruiter/entrevistas)
│       │   │   ├── services/entrevista.service.ts
│       │   │   └── models/entrevista.models.ts     # EntrevistaRequestDTO, EntrevistaResponseDTO
│       │   └── enterprise.routes.ts
│       │
│       └── freelance/                              # 4. SUBDOMINIO: MERCADO FREELANCE, PAGOS Y FINANZAS (RF-22 a RF-30)
│           ├── proyectos-catalogo/                 # Catálogo Público con Filtrado Reactivo en Memoria (RF-24)
│           │   ├── pages/proyecto-list/            # proyecto-list.component.ts (GET /api/v1/freelance/proyectos)
│           │   ├── pages/proyecto-detail/          # proyecto-detail.component.ts (Detalle + Envío Propuesta RF-25)
│           │   ├── components/proyecto-card/       # proyecto-card.component.ts (Dumb Card)
│           │   ├── components/propuesta-modal/     # propuesta-modal.component.ts (POST /{id}/postulaciones/me)
│           │   └── services/proyecto-catalog.service.ts # Signal State con computed() por área/presupuesto/skill
│           ├── proyecto-gestion/                   # Gestión de Proyectos del Cliente y Freelancer (RF-22, RF-23, RF-25)
│           │   ├── pages/mis-proyectos-cliente/    # mis-proyectos-cliente.component.ts (GET /me/publicados, Cancelar)
│           │   ├── pages/mis-proyectos-freelancer/ # mis-proyectos-freelancer.component.ts (GET /me/asignados)
│           │   ├── pages/proyecto-form/            # proyecto-form.component.ts (POST /me y PUT /{id} si BUSCANDO_TALENTO)
│           │   ├── pages/proyecto-propuestas/      # proyecto-propuestas.component.ts (GET /{id}/postulaciones - RF-25)
│           │   ├── services/proyecto-admin.service.ts
│           │   └── models/proyecto.models.ts       # ProyectoRequestDTO, ProyectoResponseDTO, PostulacionProyectoDTO
│           ├── cliente-dashboard/                  # Panel Analítico del Cliente con Persistencia Real (RF-29)
│           │   ├── pages/cliente-dash/             # cliente-dashboard.component.ts (GET /api/v1/client/dashboard)
│           │   ├── services/cliente.service.ts     # Consume /api/v1/client/dashboard y /api/v1/client/proyectos
│           │   └── models/cliente-dashboard.models.ts
│           ├── freelancer-finances/                # Billetera, Balances y Transacciones del Freelancer (RF-30)
│           │   ├── pages/finances-view/            # freelancer-finances.component.ts (GET /finances y /transactions)
│           │   ├── services/finances.service.ts
│           │   └── models/finances.models.ts       # FreelancerFinancesResponseDTO, FreelancerTransactionResponseDTO
│           ├── checkout-mercadopago/               # Pasarela Checkout Pro e Historial de Pagos (RF-26, RF-28)
│           │   ├── pages/proyecto-pagos/           # proyecto-pagos.component.ts (GET/POST /proyectos/{id}/pagos)
│           │   ├── components/mp-button/           # mp-checkout-button.component.ts (POST /pagos/checkout -> initPoint)
│           │   ├── services/mercadopago.service.ts
│           │   └── models/mercadopago.models.ts    # MercadoPagoPreferenceResponseDTO, PagosRequestDTO, PagosResponseDTO
│           └── freelance.routes.ts
│
└── environments/
    ├── environment.ts                              # Desarrollo: apiUrl = 'http://localhost:8080/api/v1', googleClientId
    └── environment.prod.ts                         # Producción: URL API productiva, Google Client ID
```

---

## 3. Contratos Tipados TypeScript (Mapeo Quirúrgico 1:1 con Java Records del Backend)

Todos los contratos a continuación reflejan exactamente los nombres de campos y tipos de datos declarados en el paquete `com.example.Proyecto_Final_Progra3.dto` del backend:

### 3.1 Modelos Globales y de Seguridad (`src/app/core/models/` y `src/app/shared/models/`)

```typescript
// src/app/core/models/user-role.enum.ts
export type UserRole =
  | 'EMPRESA'
  | 'RECRUITER'
  | 'EMPLOYEE'
  | 'POSTULANTE'
  | 'CLIENTE'
  | 'FREELANCER';

// src/app/core/models/error-response.model.ts
// Mapea ErrorResponseDTO del GlobalExceptionHandler (@RestControllerAdvice)
export interface ErrorResponseDTO {
  message: string;
  details: string[];
  date: string; // LocalDate (YYYY-MM-DD)
}

// src/app/shared/models/message-response.model.ts
export interface MessageResponseDTO {
  message: string;
  timeStamp: string; // LocalDateTime ISO-8601
}

// src/app/shared/models/habilidad.model.ts
export interface HabilidadResponseDTO {
  id: number;
  name: string;
}
```

### 3.2 Subdominio Auth (`src/app/features/auth/models/auth.models.ts`)

```typescript
import { UserRole } from '../../../core/models/user-role.enum';

// POST /api/v1/auth/register (Mapea PerfilRequestDTO)
export interface RegisterRequestDTO {
  usuario: string;
  email: string;
  password: string;
  rol: UserRole;
}

export interface PerfilResponseDTO {
  perfil_id: number;
  usuario: string;
  email: string;
  rol: UserRole;
}

// POST /api/v1/auth/login (Mapea LoginRequestDTO)
export interface LoginRequestDTO {
  usuario: string;
  password: string;
}

// POST /api/v1/auth/google (Mapea GoogleLoginRequestDTO)
export interface GoogleLoginRequestDTO {
  idToken: string;
}

// Respuesta de /login y /google (Mapea LoginResponseDTO)
export interface LoginResponseDTO {
  mensaje: string;
  nombreUsuario: string;
  rol: UserRole;
  token: string;
}
```

### 3.3 Subdominio Perfiles y Portafolio (`src/app/features/perfiles/models/perfil.models.ts`)

```typescript
// Mapea PerfilUsuarioDTO.HabilidadDTO
export interface PerfilHabilidadDTO {
  habilidadId: number;
  nombre: string;
  nivel: 1 | 2 | 3 | 4; // 1: Básico, 2: Intermedio, 3: Avanzado, 4: Experto
}

// Mapea PerfilUsuarioDTO.ProyectoDTO
export interface PerfilProyectoPortafolioDTO {
  id: number;
  nombre: string;
  descripcion: string;
  link?: string;
  imagen?: string; // byte[] serializado en Base64 por Jackson
}

// GET /api/v1/perfiles/getProfile y PUT /api/v1/perfiles/updateProfile
export interface PerfilUsuarioDTO {
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  fechaNacimiento?: string; // YYYY-MM-DD (Employee / Recruiter)
  telefono?: string;        // Cliente / Empresa
  pais?: string;            // Cliente / Empresa
  descripcion?: string;
  ubicacion?: string;
  sitioWeb?: string;        // Empresa
  logo?: string;            // Empresa
  fotoPerfil?: string;      // byte[] en Base64
  bannerPerfil?: string;    // byte[] en Base64
  habilidades: PerfilHabilidadDTO[];
  proyectos: PerfilProyectoPortafolioDTO[];
}
```

### 3.4 Subdominio Enterprise: Empresas, Recruiters, Vacantes y Entrevistas (`src/app/features/enterprise/.../models/`)

```typescript
// --- 1. EMPRESAS (src/app/features/enterprise/empresa-perfil/models/empresa.models.ts) ---
export interface EmpresaRequestDTO {
  nombre: string;
  descripcion: string;
  sitio_web?: string;
  ubicacion?: string;
  perfil_id?: number;
}

export interface EmpresaResponseDTO {
  id: number;
  uuid: string;
  nombre: string;
  direccion?: string;
  sitio_web?: string;
  ubicacion?: string;
  perfil_id: number;
}

// GET /api/v1/empresas/dashboard (RF-31)
export interface DashboardStatsResponseDTO {
  totalVacantes: number;
  totalPostulaciones: number;
  entrevistasPendientes: number;
  contratacionesEfectuadas: number;
}

// --- 2. RECRUITERS (src/app/features/enterprise/recruiters/models/recruiter.models.ts) ---
export interface RecruiterRequestDTO {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // YYYY-MM-DD (@NotNull LocalDate)
  area?: string;
}

export interface RecruiterResponseDTO {
  recruiterId: number;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // YYYY-MM-DD
  area?: string;
  empresaId: number;
  nombreEmpresa: string;
}

// --- 3. VACANTES Y POSTULACIONES (src/app/features/enterprise/vacantes/models/vacante.models.ts) ---
export type EstadoPostulacion =
  | 'PENDIENTE'
  | 'VISUALIZADO'
  | 'ENTREVISTA_AGENDADA'
  | 'RECHAZADO';

export interface VacanteRequestDTO {
  puesto: string;
  descripcion: string;
  finalizacion: string; // YYYY-MM-DD (@NotNull @Future LocalDate)
  empresaId?: number;
  logo?: string;
  ubicacion?: string;
  tipoUbicacion?: 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL' | string;
  tipoVacante?: string;
  salario?: string;
  etiquetas?: string[];
}

export interface VacanteResponseDTO {
  vacanteId: number;
  uuid: string;
  puesto: string;
  descripcion: string;
  publicacion: string;  // YYYY-MM-DD
  finalizacion: string; // YYYY-MM-DD
  empresaId: number;
  nombreEmpresa: string;
  logo?: string;
  ubicacion?: string;
  tipoUbicacion?: string;
  tipoVacante?: string;
  salario?: string;
  etiquetas: string[];
}

export interface PostulacionResponseDTO {
  postulacionId: number;
  vacanteId: number;
  puestoVacante: string;
  employeeId: number;
  nombreCandidato: string;
  emailCandidato: string;
  fechaPostulacion: string; // YYYY-MM-DD
  estado: EstadoPostulacion;
  mensaje: string;
  tieneCvSubido: boolean;
}

// --- 4. ENTREVISTAS (src/app/features/enterprise/entrevistas/models/entrevista.models.ts) ---
export interface EntrevistaRequestDTO {
  postulacionId: number;
  fecha: string; // YYYY-MM-DD (@FutureOrPresent LocalDate)
  hora: string;  // HH:mm:ss (@NotNull LocalTime)
  link?: string;
}

export interface EntrevistaResponseDTO {
  id: number;
  candidateName: string;
  vacancyTitle: string;
  date: string;
  time: string;
  link?: string;
}
```

### 3.5 Subdominio Freelance: Proyectos, Propuestas, Pagos y Analítica (`src/app/features/freelance/.../models/`)

```typescript
// --- 1. PROYECTOS Y PROPUESTAS (src/app/features/freelance/proyecto-gestion/models/proyecto.models.ts) ---
export type EstadoProyecto =
  | 'BUSCANDO_TALENTO'
  | 'EN_PROGRESO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface ProyectoRequestDTO {
  area: string;
  descripcion: string;
  presupuestoMax: number;
  presupuestoMin: number;
  clienteId?: number;
  duracion?: string;
  tipoPago?: string;
  habilidades?: string[];
}

export interface ProyectoResponseDTO {
  proyectoId: number;
  uuid: string;
  area: string;
  descripcion: string;
  fechaPublicacion: string; // YYYY-MM-DD
  presupuestoMax: number;
  presupuestoMin: number;
  clienteId: number;
  nombreCliente: string;
  duracion?: string;
  tipoPago?: string;
  habilidades: string[];
  estado: EstadoProyecto;
  nombreFreelancer?: string;
}

export interface PostulacionProyectoRequestDTO {
  descripcion: string;
  costo: number;
  employeeId: number;
}

export interface PostulacionProyectoResponseDTO {
  postulacionId: number;
  descripcion: string;
  costoPropuesto: number;
  fechaPostulacion: string; // YYYY-MM-DD
  empleadoId: number;
  nombreEmpleado: string;
  proyectoId: number;
}

// --- 2. PASARELA DE PAGOS Y MERCADO PAGO (src/app/features/freelance/checkout-mercadopago/models/mercadopago.models.ts) ---
export type Moneda = 'PESOS' | 'USD';
export type MedioDePago = 'TARJETA' | 'BILLETERA_VIRTUAL';

export interface PagosRequestDTO {
  moneda: Moneda;
  monto: number;
  medioDePago: MedioDePago;
}

export interface PagosResponseDTO {
  pagoId: number;
  moneda: Moneda;
  monto: number;
  medioDePago: MedioDePago;
  proyectoId: number;
}

export interface MercadoPagoPreferenceResponseDTO {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

// --- 3. DASHBOARD CLIENTE Y FINANZAS FREELANCER (RF-29 y RF-30) ---
export interface ClientDashboardResponseDTO {
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingProposals: number;
}

export interface FreelancerFinancesResponseDTO {
  balance: number;
  pending: number;
  withdrawn: number;
}

export interface FreelancerTransactionResponseDTO {
  id: number;
  currency: string;
  amount: number;
  paymentMethod: string;
  projectId: number;
  projectTitle: string;
}
```

---

## 4. Arquitectura de Enrutamiento y Control de Acceso (RBAC en `app.routes.ts`)

El enrutador principal aplica **Lazy Loading** (`loadChildren` / `loadComponent`) y protege cada subdominio replicando las reglas de `SecurityConfig` del backend:

| Ruta Frontend | Subdominio / Vista | Guard Aplicado | Roles Permitidos (`data.roles`) |
| :--- | :--- | :--- | :--- |
| `/auth/login`, `/auth/register` | `features/auth` | `guestGuard` | `PUBLIC` (Redirige al inicio si ya hay sesión) |
| `/vacantes`, `/vacantes/:id` | `features/enterprise/vacantes` (Catálogo) | Ninguno (`permitAll`) | `PUBLIC`, `EMPLOYEE`, `POSTULANTE` |
| `/proyectos`, `/proyectos/:id` | `features/freelance/proyectos-catalogo` | Ninguno (`permitAll`) | `PUBLIC`, `FREELANCER`, `CLIENTE` |
| `/mi-perfil` | `features/perfiles` | `authGuard` | Todos los usuarios autenticados |
| `/enterprise/empresa` | `features/enterprise/empresa-perfil` | `authGuard`, `roleGuard` | `['EMPRESA']` |
| `/enterprise/dashboard` | `features/enterprise/dashboard` | `authGuard`, `roleGuard` | `['EMPRESA']` |
| `/enterprise/recruiters` | `features/enterprise/recruiters` | `authGuard`, `roleGuard` | `['EMPRESA']` |
| `/enterprise/vacantes-admin/**` | `features/enterprise/vacantes` (ABM y Postulantes) | `authGuard`, `roleGuard` | `['EMPRESA', 'RECRUITER']` |
| `/enterprise/entrevistas` | `features/enterprise/entrevistas` | `authGuard`, `roleGuard` | `['EMPRESA', 'RECRUITER']` |
| `/freelance/mis-proyectos` | `features/freelance/proyecto-gestion` | `authGuard`, `roleGuard` | `['CLIENTE']` |
| `/freelance/asignados` | `features/freelance/proyecto-gestion` | `authGuard`, `roleGuard` | `['FREELANCER', 'EMPLOYEE']` |
| `/freelance/cliente-dashboard` | `features/freelance/cliente-dashboard` | `authGuard`, `roleGuard` | `['CLIENTE']` |
| `/freelance/finanzas` | `features/freelance/freelancer-finances` | `authGuard`, `roleGuard` | `['FREELANCER', 'EMPLOYEE']` |

---

## 5. Patrones Base de Implementación en Angular v22

### 5.1 Interceptor Funcional JWT y Manejo de Errores (`core/auth/interceptors/`)

```typescript
// src/app/core/auth/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorageService).getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

### 5.2 Patrón Signal State para Filtrado en Memoria (RF-16 y RF-24)

Reemplaza las mutaciones imperativas en `ngOnInit` por estado reactivo derivado con `computed()`:

```typescript
// src/app/features/enterprise/vacantes/services/vacante.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { VacanteResponseDTO } from '../models/vacante.models';

@Injectable({ providedIn: 'root' })
export class VacanteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vacantes`;

  // 1. Estado base privado
  private readonly _vacantes = signal<VacanteResponseDTO[]>([]);
  readonly loading = signal<boolean>(false);

  // 2. Criterios de filtro reactivos
  readonly searchQuery = signal<string>('');
  readonly selectedModalidad = signal<string>('');

  // 3. Catálogo filtrado en memoria de forma declarativa (RF-16)
  readonly vacantesFiltradas = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const modalidad = this.selectedModalidad();

    return this._vacantes().filter(v => {
      const matchesModalidad = !modalidad || v.tipoUbicacion === modalidad;
      const matchesQuery =
        !query ||
        v.puesto.toLowerCase().includes(query) ||
        v.descripcion.toLowerCase().includes(query) ||
        v.nombreEmpresa.toLowerCase().includes(query);
      return matchesModalidad && matchesQuery;
    });
  });

  cargarCatalogo(): void {
    this.loading.set(true);
    this.http.get<VacanteResponseDTO[]>(this.apiUrl).subscribe({
      next: (data) => {
        this._vacantes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
```

---

## 6. Hoja de Ruta de Implementación (Roadmap en 4 Fases)

1. **Fase 1 — Core, Seguridad y Shell Estructural (RF-01 a RF-03):**
   * Configuración de `app.config.ts` (`provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`).
   * Implementación de `TokenStorageService`, `AuthService` (con `currentUser = signal<LoginResponseDTO | null>(null)`), `authGuard` y `roleGuard`.
   * Construcción de páginas `/auth/login`, `/auth/register`, integración del botón Google Identity Services (`POST /api/v1/auth/google`) y `MainLayoutComponent` con menú lateral adaptable por rol.
2. **Fase 2 — Identidad Profesional y Catálogos Públicos con Signals (RF-04 a RF-10, RF-16, RF-24):**
   * Construcción de `/mi-perfil` con edición de datos, carga `multipart/form-data` (CV en PDF, foto y banner), selector de habilidades (`1..4`), grilla de portafolio y baja lógica (`DELETE /api/v1/perfiles/me`).
   * Implementación de los catálogos públicos `/vacantes` y `/proyectos` con filtrado reactivo en memoria mediante `signal()` + `computed()`.
3. **Fase 3 — Subdominio Enterprise y Recruiting (RF-11 a RF-15, RF-17 a RF-21, RF-31):**
   * ABM de Empresa (`/enterprise/empresa`) y Dashboard Corporativo (`/enterprise/dashboard`).
   * CRUD de Recruiters (`/enterprise/recruiters` — **RF-12 a RF-14**).
   * Gestión de Vacantes propias (`GET /vacantes/me`, `POST`, `PUT`, `DELETE` — **RF-15, RF-17**), postulación de candidatos con CV adjunto (**RF-18**), bandeja de postulantes por vacante (**RF-19**) y agenda de entrevistas técnicas (**RF-20, RF-21**).
4. **Fase 4 — Subdominio Freelance, Checkout Pro y Analítica Real (RF-22, RF-23, RF-25 a RF-30):**
   * Publicación, edición condicionada al estado `BUSCANDO_TALENTO` y cancelación de proyectos (**RF-22, RF-23**).
   * Envío de propuestas por el freelancer y vista de evaluación de propuestas para el cliente (**RF-25**).
   * Integración del botón de pago **Mercado Pago Checkout Pro** (`POST /api/v1/freelance/proyectos/{id}/pagos/checkout` con redirección a `initPoint` — **RF-26**) e historial de pagos (**RF-28**).
   * Vistas de analítica conectadas a consultas JPA reales: Dashboard del Cliente (`/freelance/cliente-dashboard` — **RF-29**) y Finanzas/Transacciones del Freelancer (`/freelance/finanzas` — **RF-30**).
