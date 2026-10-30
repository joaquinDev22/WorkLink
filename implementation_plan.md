# 📘 Implementation Plan #37: Servicio de Catálogo de Proyectos (`ProyectoCatalog`)

| Campo | Detalle |
| :--- | :--- |
| **Identificador** | `PLAN-FE-37` |
| **Módulo / Capa** | `Features` / `Freelance` ([proyecto-catalog.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/freelance/proyectos-catalogo/services/proyecto-catalog.ts)) |
| **Objetivo de Aprendizaje** | 1. **Transparencia de Autenticación en APIs REST**: Comprender por qué los servicios de features nunca deben preocuparse por tokens (delegado al `authInterceptor`) ni por roles (delegado al `roleGuard` y al JWT en servidor).<br>2. **Implementación de `ProyectoCatalog`**: Crear un servicio limpio con `HttpClient`, tipado con `ProyectoResponseDTO[]` y soporte de datos de prueba cuando `environment.bypassAuth` está activo.<br>3. **Filtros Opcionales**: Permitir búsqueda por texto o filtrado por área tecnológica como parámetros opcionales. |
| **Archivos Involucrados** | <ul><li>`[MODIFY]` [proyecto-catalog.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/freelance/proyectos-catalogo/services/proyecto-catalog.ts)</li></ul> |

---

## 1. Fundamentos: ¿Hace falta Token o Rol en este servicio?

La respuesta es un rotundo **NO en ambos casos**:

1. **El Token es transparente (Interceptor HTTP)**:
   - Al igual que en `Perfil.getProfile()`, tu [auth-interceptor.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/core/auth/interceptors/auth-interceptor.ts) se encarga de clonar cada petición HTTP saliente e incrustar `Authorization: Bearer <token>`.
   - El servicio de catálogo solo hace `this.http.get(...)` sin ensuciar sus métodos con tokens.

2. **El Rol NO es un parámetro de consulta**:
   - El catálogo muestra proyectos abiertos (`BUSCANDO_TALENTO`). Cualquier usuario con permiso de navegar a esta pantalla puede ver las oportunidades disponibles.
   - El control de acceso por rol ya ocurrió antes de llegar aquí, gracias al **`roleGuard`** en la ruta.

---

## 2. Implementación de `ProyectoCatalog`

Abre [proyecto-catalog.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/freelance/proyectos-catalogo/services/proyecto-catalog.ts):

```typescript
import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ProyectoResponseDTO } from '../../proyecto-gestion/models/proyecto.models';

@Service()
export class ProyectoCatalog {
  private readonly apiUrl = `${environment.apiUrl}/freelance/proyectos`;
  private http = inject(HttpClient);

  // Obtiene el listado de proyectos con filtros opcionales
  getProyectos(area?: string): Observable<ProyectoResponseDTO[]> {
    // Soporte para Development Mode sin backend encendido
    if (environment.bypassAuth) {
      return of(this.getMockProyectos(area));
    }

    let params = new HttpParams();
    if (area && area !== 'TODOS') {
      params = params.set('area', area);
    }

    return this.http.get<ProyectoResponseDTO[]>(this.apiUrl, { params });
  }

  // Obtiene el detalle de un proyecto por su ID
  getProyectoById(id: number): Observable<ProyectoResponseDTO | undefined> {
    if (environment.bypassAuth) {
      const mock = this.getMockProyectos().find(p => p.proyectoId === id);
      return of(mock);
    }

    return this.http.get<ProyectoResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // Datos simulados para diseñar y probar la interfaz de inmediato
  private getMockProyectos(areaFiltro?: string): ProyectoResponseDTO[] {
    const mocks: ProyectoResponseDTO[] = [
      {
        proyectoId: 1,
        uuid: 'proj-001',
        area: 'Fullstack',
        descripcion: 'Refactorización y migración de Microservicios con Spring Boot 3 y Angular v22.',
        fechaPublicacion: '2026-10-25',
        presupuestoMin: 1200,
        presupuestoMax: 2000,
        clienteId: 10,
        nombreCliente: 'Fintech Solutions S.A.',
        duracion: '2 meses',
        habilidades: ['Angular', 'Spring Boot', 'Docker', 'PostgreSQL'],
        estado: 'BUSCANDO_TALENTO'
      },
      {
        proyectoId: 2,
        uuid: 'proj-002',
        area: 'Frontend',
        descripcion: 'Desarrollo de Dashboard SaaS con Tailwind CSS v4, Signals y gráficos en tiempo real.',
        fechaPublicacion: '2026-10-28',
        presupuestoMin: 800,
        presupuestoMax: 1400,
        clienteId: 11,
        nombreCliente: 'CloudMetrics Inc.',
        duracion: '3 semanas',
        habilidades: ['Angular', 'Tailwind CSS', 'TypeScript'],
        estado: 'BUSCANDO_TALENTO'
      },
      {
        proyectoId: 3,
        uuid: 'proj-003',
        area: 'Mobile / Backend',
        descripcion: 'Integración de pasarela de pagos MercadoPago y sistema de notificaciones push.',
        fechaPublicacion: '2026-10-29',
        presupuestoMin: 950,
        presupuestoMax: 1600,
        clienteId: 12,
        nombreCliente: 'Logística Express',
        duracion: '1 mes',
        habilidades: ['Java', 'MercadoPago SDK', 'REST APIs'],
        estado: 'BUSCANDO_TALENTO'
      }
    ];

    if (areaFiltro && areaFiltro !== 'TODOS') {
      return mocks.filter(m => m.area.toLowerCase().includes(areaFiltro.toLowerCase()));
    }

    return mocks;
  }
}
```

---

## 3. Verificación
1. Guarda [proyecto-catalog.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/freelance/proyectos-catalogo/services/proyecto-catalog.ts).
2. En tu componente `ProyectoList`, podrás inyectar `protected catalogService = inject(ProyectoCatalog)` y llamar a `this.catalogService.getProyectos()`.
3. Con `bypassAuth = true`, recibirás inmediatamente los 3 proyectos mock para probar el esqueleto de carga y el renderizado de tarjetas.
