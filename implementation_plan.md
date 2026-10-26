# 📘 Implementation Plan #29: Cápsula de Perfil con Avatar en Header (Reemplazo de Cerrar Sesión)

| Campo | Detalle |
| :--- | :--- |
| **Identificador** | `PLAN-FE-29` |
| **Módulo / Capa** | `Core` / `Layout` ([header.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/core/layout/header/header.html)) |
| **Objetivo de Aprendizaje** | 1. **Principio DRY (Don't Repeat Yourself) en UI/UX**: Eliminar botones redundantes. Si el cierre de sesión vive en la base del Sidebar (`MainLayout`), el Header superior debe dedicarse a la identidad del usuario.<br>2. **Patrón SaaS de Avatar**: Crear una píldora táctil moderna con avatar degradado (inicial del nombre o foto) y etiqueta de rol que navega a `/perfiles/mi-perfil`.<br>3. **Surgical Diff con Ponytail**: Cero dependencias nuevas. Reutilizamos Tailwind nativo y el signal `auth.session()`. |
| **Archivos Involucrados** | <ul><li>`[MODIFY]` [header.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/core/layout/header/header.html)</li></ul> |

---

## 1. Justificación de Diseño y UX

Tener un botón rojo de *"Cerrar Sesión"* en el Header cuando el usuario ya tiene uno visible en el pie del Sidebar genera:
1. **Redundancia visual:** Dos acciones destructivas idénticas en la misma pantalla.
2. **Espacio desperdiciado:** El Header lucía desproporcionado con texto plano (`Hola, usuario`) y un botón de alerta roja.

### El nuevo estándar (SaaS moderno):
Reemplazamos ese bloque por una **Cápsula de Identidad de Usuario**:
- **Avatar redondeado:** Con degradado Índigo-Sky y la inicial en mayúscula de su `nombreUsuario`.
- **Información del perfil:** Nombre de usuario en blanco y rol (`FREELANCER`, `EMPRESA`, etc.) en texto sutil.
- **Enlace directo:** Con `routerLink="/perfiles/mi-perfil"` para abrir rápidamente su portafolio o datos personales.

---

## 2. Guía Paso a Paso para el Alumno

Abre [header.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/core/layout/header/header.html) y ubica el bloque `@else` del usuario autenticado (alrededor de las líneas 31 a 44):

### 🔴 Antes:
```html
            } @else {
                <!-- Desktop Autenticado: Navbar + Perfil y Logout -->
                <app-navbar class="hidden md:flex"></app-navbar> 
                <div class="flex items-center gap-3">
                    <span class="text-white text-sm font-medium">
                        Hola, <strong class="text-brand-sky-light">{{ auth.session()?.nombreUsuario }}</strong>
                    </span>
                    <button 
                        (click)="auth.logout()"
                        class="px-3 py-1.5 rounded-xl text-sm font-medium text-brand-danger-muted bg-brand-danger/20 border border-brand-danger-muted/30 hover:bg-brand-danger/40 hover:text-white transition-all cursor-pointer">
                        Cerrar Sesión
                    </button>
                </div>
            }
```

### 🟢 Después:
```html
            } @else {
                <!-- Desktop Autenticado: Navbar + Cápsula de Perfil con Avatar -->
                <app-navbar class="hidden md:flex"></app-navbar> 
                
                <a 
                    routerLink="/perfiles/mi-perfil"
                    class="group flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-sky/40 transition-all cursor-pointer shadow-sm select-none">
                    
                    <!-- Avatar con Degradado de Marca e Inicial -->
                    <div class="w-9 h-9 rounded-xl bg-linear-to-tr from-brand-indigo to-brand-sky flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                        <span>{{ auth.session()?.nombreUsuario?.charAt(0)?.toUpperCase() || 'U' }}</span>
                    </div>

                    <!-- Datos del Usuario -->
                    <div class="flex flex-col text-left">
                        <span class="text-white text-xs font-semibold group-hover:text-brand-sky-light transition-colors leading-tight">
                            {{ auth.session()?.nombreUsuario }}
                        </span>
                        <span class="text-[10px] text-slate-400 uppercase tracking-wider font-medium leading-tight">
                            {{ auth.session()?.rol }}
                        </span>
                    </div>

                    <!-- Flecha indicadora sutil -->
                    <span class="text-slate-400 group-hover:text-white text-xs transition-colors ml-0.5">→</span>
                </a>
            }
```

---

## 3. Verificación
1. Guarda [header.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/core/layout/header/header.html).
2. Entra a tu sesión:
   - En el Header desaparece el botón rojo redundante.
   - En su lugar aparece la elegante píldora con tu avatar e inicial en mayúscula (`U` o la primera letra de tu nombre), tu usuario y tu rol.
   - Al pasar el cursor, el avatar se agranda sutilmente (`scale-105`) y el borde resplandece en celeste (`brand-sky`).
   - Al hacer clic, navega directamente a `/perfiles/mi-perfil`.
   - La opción de cerrar sesión sigue estando disponible de manera natural en la base del Sidebar.
