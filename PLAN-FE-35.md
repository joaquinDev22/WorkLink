# 📘 Implementation Plan #35: Auditoría y Mapa de Reutilización de Componentes Compartidos (`Shared Components Architecture`)

| Campo | Detalle |
| :--- | :--- |
| **Identificador** | `PLAN-FE-35` |
| **Módulo / Capa** | `Shared` ([src/app/shared/components](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/shared/components)) y su consumo en `Features` |
| **Objetivo de Aprendizaje** | 1. **Aplicar la Escalera de Ponytail (Paso 2: Reutilización)**: Identificar qué componentes ya están creados en tu carpeta `shared/` para evitar escribir código duplicado en las vistas.<br>2. **Matriz de Reutilización Integral**: Mapear cada componente, pipe y directiva compartida con los lugares exactos de `Features` (Freelance, Enterprise, Perfiles, Auth) donde resuelven necesidades reales.<br>3. **Priorización de Implementación**: Definir el orden estratégico para dar vida a los componentes `shared/` con el mínimo código y máximo impacto. |
| **Archivos Involucrados** | <ul><li>`[AUDIT]` `src/app/shared/components/*`</li><li>`[AUDIT]` `src/app/shared/directives/*`</li><li>`[AUDIT]` `src/app/shared/pipes/*`</li><li>`[TARGET]` `src/app/features/*`</li></ul> |

---

## 1. Estado Actual de la Capa `Shared`

Tras revisar la totalidad de tu árbol de archivos, encontramos que tienes una excelente estructura de carpetas ya pensada, con **9 componentes compartidos**, **2 directivas** y **2 pipes**. Actualmente la mayoría son cascarones generados con Angular CLI esperando lógica.

```
src/app/shared/
├── components/
│   ├── burger-menu/       ✅ IMPLEMENTADO (usado en Header)
│   ├── status-badge/      ⏳ Cascarón (El componente con mayor potencial del proyecto)
│   ├── spinner/           ⏳ Cascarón (Vital para estados de carga HTTP)
│   ├── modal/             ⏳ Cascarón (Base para popups, propuestas y altas)
│   ├── confirm-dialog/    ⏳ Cascarón (Acciones destructivas / Confirmaciones)
│   ├── file-uploader/     ⏳ Cascarón (Drag & Drop para CVs, fotos y logos)
│   ├── data-table/        ⏳ Cascarón (Tablas de vacantes, postulantes y finanzas)
│   └── panel-control/     ⏳ Cascarón (KPI Cards para Dashboards)
├── directives/
│   ├── click-outside.ts   ⏳ Cascarón (Cierre automático de dropdowns)
│   └── has-role.ts        ⏳ Cascarón (Control granular de vistas por rol)
└── pipes/
    ├── currency-ars-pipe  ⏳ Cascarón (Formato de presupuestos y salarios)
    └── time-ago-pipe      ⏳ Cascarón (Fechas relativas "Hace 2 horas")
```

---

## 2. Matriz de Reutilización: Dónde Encajan en tu Proyecto

A continuación tienes el mapa exacto de dónde debes reutilizar cada pieza:

### 🏷️ 1. `StatusBadge` (`shared/components/status-badge`)
Es el componente más transversal de WorkLink. Muestra píldoras semánticas de color según el estado:
* **En `freelance/proyecto-gestion/mis-proyectos-freelancer`**:
  * Estados de hitos: `FONDOS_LIBERADOS` (Verde esmeralda), `EN_REVISION` (Ámbar), `PENDIENTE` (Pizarra).
* **En `freelance/proyecto-gestion/mis-proyectos-cliente`**:
  * Estados del proyecto: `PUBLICADO` (Azul), `EN_PROGRESO` (Índigo), `FINALIZADO` (Verde), `CANCELADO` (Rojo).
* **En `freelance/freelancer-finances`**:
  * Estados de fondos: `EN_CUSTODIA` (Ámbar), `DISPONIBLE` (Verde), `RETIRADO` (Pizarra).
* **En `enterprise/vacantes/vacante-admin-list`**:
  * Estados de vacante: `ABIERTA` (Verde), `EN_PAUSA` (Ámbar), `CERRADA` (Pizarra).
* **En `enterprise/vacantes/vacante-postulantes`**:
  * Estados del candidato: `POSTULADO` (Azul), `PRESELECCIONADO` (Violeta), `EN_ENTREVISTA` (Ámbar), `CONTRATADO` (Verde), `RECHAZADO` (Rojo).
* **En `enterprise/entrevistas/entrevista-calendar`**:
  * Estados de cita: `CONFIRMADA` (Verde), `PENDIENTE` (Ámbar), `CANCELADA` (Rojo).

---

### 🪟 2. `Modal` (`shared/components/modal`)
Ventana emergente accesible con fondo difuminado (`backdrop-blur`), botón de cierre y tecla `ESC`:
* **En `enterprise/recruiters/recruiter-register-modal`**:
  * Formulario para que la Empresa invite o dé de alta a un recruiter en su equipo.
* **En `freelance/proyectos-catalogo/propuesta-modal`**:
  * Formulario emergente para que el Freelancer envíe su propuesta económica y carta de presentación a un proyecto.
* **En `perfiles/components/portfolio-grid`**:
  * Modal para ver la vista ampliada de un proyecto del portafolio o cargar un nuevo trabajo.
* **En `shared/components/confirm-dialog`**:
  * El propio diálogo de confirmación debe construirse **reutilizando `<app-modal>` por composición**, sin duplicar el backdrop ni el z-index.

---

### ⚠️ 3. `ConfirmDialog` (`shared/components/confirm-dialog`)
Diálogo de confirmación para prevenir pérdida de datos o acciones críticas:
* **En `perfiles/components/account-danger-zone`**:
  * *"¿Estás seguro de que deseas darte de baja de WorkLink? Esta acción es irreversible."*
* **En `enterprise/vacantes/vacante-admin-list`**:
  * Confirmar cierre definitivo de una búsqueda laboral.
* **En `enterprise/recruiters/recruiter-list`**:
  * Confirmar desvinculación de un recruiter del equipo corporativo.
* **En `freelance/proyecto-gestion/mis-proyectos-cliente`**:
  * Confirmar liberación de fondos de un hito hacia el freelancer.

---

### 📁 4. `FileUploader` (`shared/components/file-uploader`)
Caja de carga con Drag & Drop, barra de progreso y validación de extensiones:
* **En `perfiles/components/cv-uploader`**:
  * En lugar de programar un uploader desde cero, `CvUploader` simplemente usa `<app-file-uploader accept=".pdf" label="Sube tu Currículum Vitae (PDF)"></app-file-uploader>`.
* **En `perfiles/components/media-uploader`**:
  * Carga de foto de perfil y banner usando `<app-file-uploader accept="image/*" [maxSizeMb]="3"></app-file-uploader>`.
* **En `enterprise/empresa-perfil/empresa-form`**:
  * Carga del logo corporativo de la empresa.
* **En `freelance/proyecto-gestion/proyecto-edit`**:
  * Carga de especificaciones o diagramas adjuntos al publicar un proyecto.

---

### ⏳ 5. `Spinner` (`shared/components/spinner`)
Indicador circular de carga en colores de marca (`border-brand-sky` / `border-brand-indigo`):
* **En `auth/pages/login` y `register`**:
  * Reemplazar el texto del botón por `<app-spinner />` mientras la petición HTTP está en curso para evitar clicks dobles.
* **En `perfiles/pages/mi-perfil`**:
  * Mostrado mientras `perfilService.cargarPerfil()` obtiene la respuesta.
* **En `freelance/proyectos-catalogo/proyecto-list` y `enterprise/vacantes/vacante-catalogo`**:
  * Estado de carga inicial mientras se reciben los catálogos del backend.

---

### 📊 6. `DataTable` (`shared/components/data-table`)
Tabla responsiva con cabeceras estilizadas, estados vacíos (`empty-state`) y diseño adaptado al modo claro/oscuro:
* **En `enterprise/vacantes/vacante-admin-list`**: Lista de vacantes creadas con total de postulantes y botón de acciones.
* **En `enterprise/recruiters/recruiter-list`**: Lista de recruiters del equipo.
* **En `enterprise/vacantes/vacante-postulantes`**: Lista de candidatos que enviaron su CV a una búsqueda.
* **En `freelance/freelancer-finances`**: Historial de movimientos y pagos de hitos.
* **En `freelance/proyecto-gestion/mis-proyectos-cliente`**: Listado de proyectos publicados y sus cotizaciones.

---

### 📈 7. `PanelControl` (`shared/components/panel-control`)
Tarjeta de métrica o KPI (Valor grande, etiqueta, icono y porcentaje de cambio):
* **En `enterprise/dashboard/empresa-dashboard`**:
  * KPIs: *Vacantes Activas*, *Postulaciones del Mes*, *Entrevistas Agendadas*, *Tasa de Contratación*.
* **En `freelance/cliente-dashboard`**:
  * KPIs: *Proyectos en Curso*, *Presupuesto en Custodia*, *Propuestas Recibidas*, *Proyectos Finalizados*.
* **En `freelance/freelancer-finances`**:
  * KPIs: *Saldo Disponible*, *Saldo en Custodia (Pendiente)*, *Ingresos del Mes*.

---

### 🛠️ 8. Directivas y Pipes (`directives` y `pipes`)
* **Directiva `[appClickOutside]`**:
  * En `header.html`: para el dropdown *"Más"*.
  * En el conmutador de rol y en cualquier menú desplegable de acciones (los 3 puntos `...` de cada fila de tabla).
* **Pipe `currencyArs`**:
  * Formatea montos monetarios en toda la plataforma: en las tarjetas de proyectos (`$1,200 USD`), en los salarios de vacantes y en el módulo de finanzas.
* **Pipe `timeAgo`**:
  * Muestra fechas relativas ("Publicado hace 3 horas", "Entrevista en 2 días", "Postulado ayer").

---

## 3. Plan de Acción Recomendado (Roadmap de Implementación)

Para aplicar la filosofía **Ponytail** de manera quirúrgica, el orden ideal para implementar estos componentes es:

1. **Fase 1: Los dos bloques clave de UI (Bajo esfuerzo, alto impacto)**
   - `StatusBadge`: 15 líneas de código que mejorarán instantáneamente 6 pantallas del sistema.
   - `Spinner`: Para eliminar la sensación de que la app se congela al hacer login o cargar datos.
2. **Fase 2: Interacciones y Formularios**
   - `Modal` + `ConfirmDialog`: Para propuestas freelance, invitaciones de recruiters y confirmaciones de borrado.
   - `FileUploader`: Para unificar la carga de CVs y fotos en un solo componente reutilizable.
3. **Fase 3: Datos y Paneles**
   - `PanelControl` (KPI Card): Para darle vida al dashboard de la Empresa, del Cliente y de Finanzas.
   - `DataTable`: Para unificar todas las tablas del sistema con el mismo estilo y soporte dark mode.
