# 📦 CATÁLOGO DE MODELOS TYPESCRIPT Y GUÍA DE UBICACIÓN — SPRINT 1 (ÉPICA 1)

**Proyecto:** WorkLink (Frontend Angular CLI v22)  
**Ubicación del Proyecto:** `c:\Users\joaki\OneDrive\Escritorio\WorkLink`  
**Sprint Activo:** Sprint 1 - Épica 1 (Autenticación, Rutas Protegidas RBAC y Gestión de Sesión JWT)  

---

## PARTE 1: Dónde Realizar tu Primer Sprint en el Proyecto (`Sprint 1 - Épica 1`)

Según tu tablero de Jira (**Sprint 1 - Épica 1: 25 Story Points en 5 Historias de Usuario**), **NO debés tocar todavía** las carpetas `enterprise/`, `freelance/` ni `perfiles/` (más allá de dejar sus rutas declaradas). Todo tu trabajo de este Sprint se concentra en **`environments/`**, **`app.config.ts`**, **`app.routes.ts`**, **`core/`** y **`features/auth/`**.

### 🗺️ Orden Recomendado de Ejecución y Archivos Exactos por Historia de Usuario

#### Paso 0 (Pre-requisito de Conexión — 10 min)
Antes de empezar las US, configurá la URL base de tu API y habilitá el cliente HTTP:
1. **`src/environments/environment.development.ts`** y **`src/environments/environment.ts`** $\rightarrow$ Definir `apiUrl: 'http://localhost:8080/api/v1'` y `googleClientId`.
2. **`src/app/core/models/user-role.ts`**, **`session.model.ts`**, **`error-response.model.ts`** y **`src/app/features/auth/models/auth.models.ts`** $\rightarrow$ Pegar los contratos de la **Parte 2** de este documento.
3. **`src/app/app.config.ts`** $\rightarrow$ Agregar `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.

---

#### 🟢 1. `WL-7` — US-02: Formulario de Login, Manejo de Sesión y Almacenamiento de Token JWT
> *Te conviene hacer `US-02` primero porque construye el `TokenStorage` y el `Auth` service que reutilizan todas las demás historias.*

* **Archivos de Servicios (`core/auth/`):**
  1. **`src/app/core/auth/services/token-storage.ts`**
     * **Qué hacer acá:** Métodos `saveSession(session: Session)`, `getToken(): string | null`, `getSession(): Session | null` y `clear()` leyendo/escribiendo en `localStorage`.
  2. **`src/app/core/auth/services/auth.ts`**
     * **Qué hacer acá:**
       * Declarar el Signal reactivo de sesión: `readonly currentUser = signal<Session | null>(this.tokenStorage.getSession())`.
       * Computed signals: `readonly isAuthenticated = computed(() => !!this.currentUser())` y `readonly userRole = computed(() => this.currentUser()?.rol ?? null)`.
       * Método `login(dto: LoginRequestDTO)` $\rightarrow$ `POST http://localhost:8080/api/v1/auth/login`, guarda en `TokenStorage` y actualiza `this.currentUser.set(...)`.
  3. **`src/app/core/auth/interceptors/auth-interceptor.ts`**
     * **Qué hacer acá:** Leer el token desde `inject(TokenStorage)` y clonar la petición agregando el header `Authorization: Bearer ${token}`.
* **Archivos de Vista (`features/auth/pages/login/`):**
  4. **`src/app/features/auth/pages/login/login.ts`** (`.html`, `.css`)
     * **Qué hacer acá:** Formulario reactivo (`ReactiveFormsModule`) con `usuario` y `password`, manejo de estado de carga/error con `signal()`, llamada a `authService.login()` y redirección con `Router` según el rol recibido.

---

#### 🟢 2. `WL-5` — US-01: Formulario de Registro de Usuarios y Selección de Rol
* **Archivos donde trabajar:**
  1. **`src/app/core/auth/services/auth.ts`**
     * **Qué hacer acá:** Agregar el método `register(dto: RegisterRequestDTO)` que consuma `POST http://localhost:8080/api/v1/auth/register` y retorne `Observable<PerfilResponseDTO>`.
  2. **`src/app/features/auth/pages/register/register.ts`** (`.html`, `.css`)
     * **Qué hacer acá:** Formulario reactivo con los 4 campos de `RegisterRequestDTO`:
       * `usuario` (texto, obligatorio)
       * `email` (formato email válido, obligatorio)
       * `password` (contraseña, obligatorio)
       * `rol` (selector de rol: `'EMPRESA' | 'CLIENTE' | 'FREELANCER' | 'EMPLOYEE'`)
     * Al registrarse con éxito (`201 Created`), redirigir a `/auth/login` (o iniciar sesión automáticamente).

---

#### 🟢 3. `WL-8` — US-03: Botón e Inicio de Sesión con Google OAuth2 (SSO)
* **Archivos donde trabajar:**
  1. **`src/index.html`**
     * **Qué hacer acá:** Incluir el script oficial de Google Identity Services: `<script src="https://accounts.google.com/gsi/client" async defer></script>`.
  2. **`src/app/core/auth/services/auth.ts`**
     * **Qué hacer acá:** Agregar el método `loginWithGoogle(dto: GoogleLoginRequestDTO)` que envía `{ idToken }` a `POST http://localhost:8080/api/v1/auth/google`, recibe el `LoginResponseDTO` con el JWT nativo de WorkLink, lo persiste en `TokenStorage` y actualiza el Signal `currentUser`.
  3. **`src/app/features/auth/components/google-btn/google-button.ts`** (`.html`, `.css`)
     * **Qué hacer acá:** Componente Dumb/UI que renderiza el botón de Google, recibe el `credential` (`idToken` de Google) y lo emite mediante `output<string>()` hacia las páginas `login.ts` y `register.ts`.

---

#### 🟢 4. `WL-10` — US-04: Rutas Protegidas y Control de Acceso por Roles (RBAC UI)
* **Archivos donde trabajar:**
  1. **`src/app/core/auth/guards/auth-guard.ts`**
     * **Qué hacer acá:** Verificar `inject(Auth).isAuthenticated()`. Si es `true`, permite el paso; si es `false`, redirige a `router.createUrlTree(['/auth/login'])`.
  2. **`src/app/core/auth/guards/role-guard.ts`**
     * **Qué hacer acá:** Leer los roles permitidos desde `route.data['roles'] as UserRole[]` y compararlos contra `inject(Auth).userRole()`. Si el usuario no tiene el rol requerido, redirigir a su vista principal o página de acceso denegado.
  3. **`src/app/core/auth/interceptors/error-interceptor.ts`**
     * **Qué hacer acá:** Interceptar respuestas HTTP `401 Unauthorized` o `403 Forbidden`; si el token expiró o es inválido (`401`), limpiar la sesión y redirigir a `/auth/login`.
  4. **`src/app/features/auth/auth.routes.ts`** y **`src/app/app.routes.ts`**
     * **Qué hacer acá:** Configurar las rutas públicas (`/auth/login`, `/auth/register`, `/vacantes`, `/proyectos`) y las rutas protegidas con `canActivate: [authGuard, roleGuard]` y `data: { roles: [...] }`.
  5. **`src/app/core/layout/sidebar/sidebar.ts`** (y opcionalmente **`src/app/shared/directives/has-role.ts`**)
     * **Qué hacer acá:** Mostrar en el menú lateral únicamente los enlaces que corresponden al rol activo (`@if (auth.userRole() === 'EMPRESA') { ... }`).

---

#### 🟢 5. `WL-11` — US-05: Cierre de Sesión y Purga de Estado Local
* **Archivos donde trabajar:**
  1. **`src/app/core/auth/services/auth.ts`**
     * **Qué hacer acá:** Método `logout()`:
       * Llama a `this.tokenStorage.clear()` (elimina `token` y datos de sesión de `localStorage`).
       * Resetea el Signal en memoria: `this.currentUser.set(null)`.
       * Redirige a `/auth/login` mediante `this.router.navigate(['/auth/login'])`.
  2. **`src/app/core/layout/navbar/navbar.ts`** (`.html`, `.css`)
     * **Qué hacer acá:** Mostrar en la barra superior el `nombreUsuario` y el `rol` leyendo el Signal `auth.currentUser()`, e incluir el botón **"Cerrar Sesión"** que ejecuta `auth.logout()`.

---

### 📊 Tabla Resumen del Sprint 1

| Código Jira | Historia de Usuario | Archivos Principales a Editar en `WorkLink/src/app/` | Endpoint Backend Vinculado |
| :--- | :--- | :--- | :--- |
| **WL-5 (US-01)** | Registro y Selección de Rol | `features/auth/pages/register/register.*`<br>`core/auth/services/auth.ts` | `POST /api/v1/auth/register` |
| **WL-7 (US-02)** | Login y Almacenamiento JWT | `features/auth/pages/login/login.*`<br>`core/auth/services/token-storage.ts`<br>`core/auth/services/auth.ts`<br>`core/auth/interceptors/auth-interceptor.ts` | `POST /api/v1/auth/login` |
| **WL-8 (US-03)** | Login con Google OAuth2 | `features/auth/components/google-btn/google-button.*`<br>`core/auth/services/auth.ts` | `POST /api/v1/auth/google` |
| **WL-10 (US-04)** | Rutas Protegidas y RBAC UI | `core/auth/guards/auth-guard.ts`<br>`core/auth/guards/role-guard.ts`<br>`core/auth/interceptors/error-interceptor.ts`<br>`app.routes.ts`, `core/layout/sidebar/sidebar.*` | Validación JWT y RBAC local |
| **WL-11 (US-05)** | Logout y Purga de Estado | `core/auth/services/auth.ts`<br>`core/layout/navbar/navbar.*` | Limpieza local + Redirección |

---

## PARTE 2: Los 15 Archivos de Modelos (`models`) para Copiar y Pegar

### 1. Core Models (`src/app/core/models/`)

#### 📄 `src/app/core/models/user-role.ts`
```typescript
export type UserRole =
  | 'EMPRESA'
  | 'RECRUITER'
  | 'EMPLOYEE'
  | 'POSTULANTE'
  | 'CLIENTE'
  | 'FREELANCER';
```

#### 📄 `src/app/core/models/session.model.ts`
```typescript
import { UserRole } from './user-role';

export interface Session {
  token: string;
  nombreUsuario: string;
  rol: UserRole;
}
```

#### 📄 `src/app/core/models/error-response.model.ts`
```typescript
export interface ErrorResponseDTO {
  message: string;
  details: string[];
  date: string; // YYYY-MM-DD
}
```

---

### 2. Shared Models (`src/app/shared/models/`)

#### 📄 `src/app/shared/models/message-response.model.ts`
```typescript
export interface MessageResponseDTO {
  message: string;
  timeStamp: string; // ISO-8601 LocalDateTime
}
```

#### 📄 `src/app/shared/models/habilidad.model.ts`
```typescript
export interface HabilidadResponseDTO {
  id: number;
  name: string;
}
```

---

### 3. Feature: Auth (`src/app/features/auth/models/`)

#### 📄 `src/app/features/auth/models/auth.models.ts`
```typescript
import { UserRole } from '../../../core/models/user-role';

// POST /api/v1/auth/register (PerfilRequestDTO en Backend)
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

// POST /api/v1/auth/login
export interface LoginRequestDTO {
  usuario: string;
  password: string;
}

// POST /api/v1/auth/google
export interface GoogleLoginRequestDTO {
  idToken: string;
}

// Respuesta de /login y /google
export interface LoginResponseDTO {
  mensaje: string;
  nombreUsuario: string;
  rol: UserRole;
  token: string;
}
```

---

### 4. Feature: Perfiles (`src/app/features/perfiles/models/`)

#### 📄 `src/app/features/perfiles/models/perfil.models.ts`
```typescript
export type NivelHabilidad = 1 | 2 | 3 | 4; // 1: Básico, 2: Intermedio, 3: Avanzado, 4: Experto

export interface PerfilHabilidadDTO {
  habilidadId: number;
  nombre: string;
  nivel: NivelHabilidad;
}

export interface PerfilProyectoPortafolioDTO {
  id: number;
  nombre: string;
  descripcion: string;
  link?: string;
  imagen?: string; // byte[] serializado en Base64
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

---

### 5. Feature: Enterprise (`src/app/features/enterprise/.../models/`)

#### 📄 `src/app/features/enterprise/empresa-perfil/models/empresa.models.ts`
```typescript
// POST /api/v1/empresas y PUT /api/v1/empresas/{id}
export interface EmpresaRequestDTO {
  nombre: string;
  descripcion: string;
  sitio_web?: string;
  ubicacion?: string;
  perfil_id?: number;
}

// GET /api/v1/empresas/{id}
export interface EmpresaResponseDTO {
  id: number;
  uuid: string;
  nombre: string;
  direccion?: string;
  sitio_web?: string;
  ubicacion?: string;
  perfil_id: number;
}

// GET /api/v1/empresas/dashboard
export interface DashboardStatsResponseDTO {
  totalVacantes: number;
  totalPostulaciones: number;
  entrevistasPendientes: number;
  contratacionesEfectuadas: number;
}
```

#### 📄 `src/app/features/enterprise/recruiters/models/recruiter.models.ts`
```typescript
// POST y PUT /api/v1/empresas/recruiters
export interface RecruiterRequestDTO {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // YYYY-MM-DD
  area?: string;
}

// GET /api/v1/empresas/recruiters
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
```

#### 📄 `src/app/features/enterprise/vacantes/models/vacante.models.ts`
```typescript
export type ModalidadTrabajo = 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL';

export type EstadoPostulacion =
  | 'PENDIENTE'
  | 'VISUALIZADO'
  | 'ENTREVISTA_AGENDADA'
  | 'RECHAZADO';

// POST /api/v1/vacantes, POST /api/v1/vacantes/me y PUT /api/v1/vacantes/{id}
export interface VacanteRequestDTO {
  puesto: string;
  descripcion: string;
  finalizacion: string; // YYYY-MM-DD (@Future)
  empresaId?: number;
  logo?: string;
  ubicacion?: string;
  tipoUbicacion?: ModalidadTrabajo | string;
  tipoVacante?: string;
  salario?: string;
  etiquetas?: string[];
}

// GET /api/v1/vacantes, GET /api/v1/vacantes/me y GET /api/v1/vacantes/{id}
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

// GET y POST /api/v1/vacantes/{vacanteId}/postulaciones
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
```

#### 📄 `src/app/features/enterprise/entrevistas/models/entrevista.models.ts`
```typescript
// POST /api/v1/recruiter/entrevistas
export interface EntrevistaRequestDTO {
  postulacionId: number;
  fecha: string; // YYYY-MM-DD (@FutureOrPresent)
  hora: string;  // HH:mm:ss
  link?: string;
}

// GET /api/v1/recruiter/entrevistas
export interface EntrevistaResponseDTO {
  id: number;
  candidateName: string;
  vacancyTitle: string;
  date: string;
  time: string;
  link?: string;
}
```

---

### 6. Feature: Freelance (`src/app/features/freelance/.../models/`)

#### 📄 `src/app/features/freelance/proyecto-gestion/models/proyecto.models.ts`
```typescript
export type EstadoProyecto =
  | 'BUSCANDO_TALENTO'
  | 'EN_PROGRESO'
  | 'FINALIZADO'
  | 'CANCELADO';

// POST /api/v1/freelance/proyectos, POST /me y PUT /{id}
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

// GET /api/v1/freelance/proyectos, /me/publicados y /me/asignados
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

// POST /api/v1/freelance/proyectos/{proyectoId}/postulaciones y /me
export interface PostulacionProyectoRequestDTO {
  descripcion: string;
  costo: number;
  employeeId: number;
}

// GET /api/v1/freelance/proyectos/{proyectoId}/postulaciones
export interface PostulacionProyectoResponseDTO {
  postulacionId: number;
  descripcion: string;
  costoPropuesto: number;
  fechaPostulacion: string; // YYYY-MM-DD
  empleadoId: number;
  nombreEmpleado: string;
  proyectoId: number;
}
```

#### 📄 `src/app/features/freelance/checkout-mercadopago/models/mercadopago.models.ts`
```typescript
export type Moneda = 'PESOS' | 'USD';
export type MedioDePago = 'TARJETA' | 'BILLETERA_VIRTUAL';

// POST /api/v1/freelance/proyectos/{proyectoId}/pagos
export interface PagosRequestDTO {
  moneda: Moneda;
  monto: number;
  medioDePago: MedioDePago;
}

// GET /api/v1/freelance/proyectos/{proyectoId}/pagos
export interface PagosResponseDTO {
  pagoId: number;
  moneda: Moneda;
  monto: number;
  medioDePago: MedioDePago;
  proyectoId: number;
}

// POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout
export interface MercadoPagoPreferenceResponseDTO {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}
```

#### 📄 `src/app/features/freelance/cliente-dashboard/models/cliente-dashboard.models.ts`
```typescript
// GET /api/v1/client/dashboard
export interface ClientDashboardResponseDTO {
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingProposals: number;
}
```

#### 📄 `src/app/features/freelance/freelancer-finances/models/finances.models.ts`
```typescript
// GET /api/v1/freelancer/finances
export interface FreelancerFinancesResponseDTO {
  balance: number;
  pending: number;
  withdrawn: number;
}

// GET /api/v1/freelancer/transactions
export interface FreelancerTransactionResponseDTO {
  id: number;
  currency: string;
  amount: number;
  paymentMethod: string;
  projectId: number;
  projectTitle: string;
}
```
