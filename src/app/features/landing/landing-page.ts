import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

export type RolFiltro = 'TODOS' | 'FREELANCER' | 'CLIENTE' | 'EMPRESA';

export interface TestimonioItem {
  readonly id: string;
  readonly nombre: string;
  readonly rol: 'FREELANCER' | 'CLIENTE' | 'EMPRESA';
  readonly cargo: string;
  readonly empresaOStack: string;
  readonly comentario: string;
  readonly avatar: string;
}

export interface EmpresaItem {
  readonly nombre: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit, OnDestroy {
  // Marcas para el marquee infinito
  readonly empresas: readonly EmpresaItem[] = [
    { nombre: 'MercadoLibre' },
    { nombre: 'Globant' },
    { nombre: 'Auth0' },
    { nombre: 'Ualá' },
    { nombre: 'Despegar' },
    { nombre: 'Tiendanube' },
    { nombre: 'Pomelo' },
    { nombre: 'Accenture' },
  ];

  // Testimonios con experiencias concretas del producto
  readonly testimonios: readonly TestimonioItem[] = [
    {
      id: '1',
      nombre: 'Mateo Silva',
      rol: 'FREELANCER',
      cargo: 'Desarrollador Full Stack',
      empresaOStack: 'Angular · Spring Boot',
      comentario: 'La tranquilidad de que los fondos de cada hito queden en custodia antes de tirar una sola línea de código cambió por completo cómo cotizo mis proyectos.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: '2',
      nombre: 'Lucía Fernández',
      rol: 'EMPRESA',
      cargo: 'VP of Engineering',
      empresaOStack: 'Cloud Logistics Inc.',
      comentario: 'Publicamos la vacante de Tech Lead y en menos de 48 horas teníamos candidatos con perfiles técnicos verificados y disponibilidad real.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: '3',
      nombre: 'Gonzalo Rivas',
      rol: 'CLIENTE',
      cargo: 'Product Founder',
      empresaOStack: 'Fintech Startup',
      comentario: 'Liberar los pagos únicamente cuando el entregable cumple con los criterios de aceptación acordados nos dio el control que ninguna otra plataforma ofrecía.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: '4',
      nombre: 'Camila Morales',
      rol: 'FREELANCER',
      cargo: 'UI/UX & Design Engineer',
      empresaOStack: 'Design Systems · Tailwind',
      comentario: 'No tener comisiones ocultas ni sorpresas al liquidar mis cobros hace que sea mi plataforma predilecta para clientes corporativos.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
  ];

  // Señal reactiva para el filtro activo
  readonly rolFiltro = signal<RolFiltro>('TODOS');

  // Cálculo derivado de testimonios filtrados
  readonly testimoniosFiltrados = computed(() => {
    const filtro = this.rolFiltro();
    if (filtro === 'TODOS') {
      return this.testimonios;
    }
    return this.testimonios.filter((t) => t.rol === filtro);
  });

  // =========================================================================
  // SEÑALES REACTIVAS PARA EL CONTADOR ANIMADO (0 -> MÁXIMO)
  // =========================================================================
  readonly talentosCount = signal(0);
  readonly custodiaCount = signal(0);
  readonly empresasCount = signal(0);

  // Formateadores reactivos para la plantilla
  readonly talentosTexto = computed(() => `+${this.talentosCount().toLocaleString('es-AR')}`);
  readonly custodiaTexto = computed(() => `${this.custodiaCount()}%`);
  readonly empresasTexto = computed(() => `+${this.empresasCount()}`);

  private frameId: number | null = null;

  ngOnInit(): void {
    this.iniciarAnimacionMetricas();
  }

  ngOnDestroy(): void {
    // Evita fugas de memoria si el usuario navega a otra vista durante la animación
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  cambiarFiltro(nuevoFiltro: RolFiltro): void {
    this.rolFiltro.set(nuevoFiltro);
  }

  private iniciarAnimacionMetricas(): void {
    const duracionMs = 1800; // 1.8 segundos de recorrido
    const inicio = performance.now();

    const paso = (tiempoActual: number) => {
      const transcurrido = tiempoActual - inicio;
      const progreso = Math.min(transcurrido / duracionMs, 1);

      // Curva de desaceleración cúbica (easeOutCubic)
      const factorEasing = 1 - Math.pow(1 - progreso, 3);

      this.talentosCount.set(Math.floor(factorEasing * 3000));
      this.custodiaCount.set(Math.floor(factorEasing * 100));
      this.empresasCount.set(Math.floor(factorEasing * 500));

      if (progreso < 1) {
        this.frameId = requestAnimationFrame(paso);
      } else {
        // Garantiza valores finales exactos
        this.talentosCount.set(3000);
        this.custodiaCount.set(100);
        this.empresasCount.set(500);
        this.frameId = null;
      }
    };

    this.frameId = requestAnimationFrame(paso);
  }
}