import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export type RolFiltro = 'TODOS' | 'FREELANCER' | 'CLIENTE' | 'EMPRESA'

export interface TestimonioItem {
  readonly id: string
  readonly nombre: string
  readonly rol: 'FREELANCER' | 'CLIENTE' | 'EMPRESA'
  readonly cargo: string
  readonly empresaOStack: string
  readonly comentario: string
  readonly avatar: string
}

export interface EmpresaItem {
  readonly nombre: string
}

gsap.registerPlugin(ScrollTrigger)

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements AfterViewInit, OnDestroy {
  private hostEl = inject(ElementRef<HTMLElement>)
  private gsapCtx: gsap.Context | null = null

  readonly empresas: readonly EmpresaItem[] = [
    { nombre: 'MercadoLibre' },
    { nombre: 'Globant' },
    { nombre: 'Auth0' },
    { nombre: 'Ualá' },
    { nombre: 'Despegar' },
    { nombre: 'Tiendanube' },
    { nombre: 'Pomelo' },
    { nombre: 'Accenture' }
  ]

  readonly testimonios: readonly TestimonioItem[] = [
    {
      id: '1',
      nombre: 'Mateo Silva',
      rol: 'FREELANCER',
      cargo: 'Desarrollador Full Stack',
      empresaOStack: 'Angular · Spring Boot',
      comentario:
        'La tranquilidad de que los fondos de cada hito queden en custodia antes de tirar una sola línea de código cambió por completo cómo cotizo mis proyectos.',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '2',
      nombre: 'Lucía Fernández',
      rol: 'EMPRESA',
      cargo: 'VP of Engineering',
      empresaOStack: 'Cloud Logistics Inc.',
      comentario:
        'Publicamos la vacante de Tech Lead y en menos de 48 horas teníamos candidatos con perfiles técnicos verificados y disponibilidad real.',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '3',
      nombre: 'Gonzalo Rivas',
      rol: 'CLIENTE',
      cargo: 'Product Founder',
      empresaOStack: 'Fintech Startup',
      comentario:
        'Liberar los pagos únicamente cuando el entregable cumple con los criterios de aceptación acordados nos dio el control que ninguna otra plataforma ofrecía.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '4',
      nombre: 'Camila Morales',
      rol: 'FREELANCER',
      cargo: 'UI/UX & Design Engineer',
      empresaOStack: 'Design Systems · Tailwind',
      comentario:
        'No tener comisiones ocultas ni sorpresas al liquidar mis cobros hace que sea mi plataforma predilecta para clientes corporativos.',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    }
  ]

  readonly filtrosRol: readonly RolFiltro[] = ['TODOS', 'FREELANCER', 'CLIENTE', 'EMPRESA']
  readonly rolFiltro = signal<RolFiltro>('TODOS')
  readonly brokenAvatars = signal<Record<string, boolean>>({})

  readonly testimoniosFiltrados = computed(() => {
    const filtro = this.rolFiltro()
    if (filtro === 'TODOS') return this.testimonios
    return this.testimonios.filter((t) => t.rol === filtro)
  })

  readonly talentosCount = signal(0)
  readonly custodiaCount = signal(0)
  readonly empresasCount = signal(0)

  readonly talentosTexto = computed(() => `+${this.talentosCount().toLocaleString('es-AR')}`)
  readonly custodiaTexto = computed(() => `${this.custodiaCount()}%`)
  readonly empresasTexto = computed(() => `+${this.empresasCount()}`)

  ngAfterViewInit(): void {
    this.iniciarAnimacionesLanding()
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  onAvatarError(id: string): void {
    this.brokenAvatars.update((curr) => ({ ...curr, [id]: true }))
  }

  cambiarFiltro(nuevoFiltro: RolFiltro): void {
    if (this.rolFiltro() === nuevoFiltro) return
    this.rolFiltro.set(nuevoFiltro)

    queueMicrotask(() => {
      const scope = gsap.context(() => {
        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.from('.testimonio-card', {
            y: 12,
            autoAlpha: 0,
            duration: 0.28,
            stagger: 0.04,
            ease: 'power3.out',
            force3D: true,
            clearProps: 'transform,opacity,visibility'
          })
        })
      }, this.hostEl.nativeElement)
      this.gsapCtx?.add(() => scope.revert())
    })
  }

  private iniciarAnimacionesLanding(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        this.talentosCount.set(3000)
        this.custodiaCount.set(100)
        this.empresasCount.set(500)
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } })

        heroTl
          .from('.hero-stagger', {
            y: 18,
            autoAlpha: 0,
            duration: 0.48,
            stagger: 0.08,
            clearProps: 'transform,opacity,visibility'
          })
          .from(
            '.hero-showcase',
            {
              y: 22,
              scale: 0.98,
              autoAlpha: 0,
              duration: 0.56,
              clearProps: 'transform,opacity,visibility'
            },
            '-=0.35'
          )

        const metrics = { talentos: 0, custodia: 0, empresas: 0 }
        gsap.to(metrics, {
          talentos: 3000,
          custodia: 100,
          empresas: 500,
          duration: 1.5,
          ease: 'power3.out',
          onUpdate: () => {
            this.talentosCount.set(Math.round(metrics.talentos))
            this.custodiaCount.set(Math.round(metrics.custodia))
            this.empresasCount.set(Math.round(metrics.empresas))
          }
        })

        gsap.from('.pilar-card', {
          y: 20,
          autoAlpha: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: {
            trigger: '.pilares-section',
            start: 'top 84%',
            once: true
          }
        })

        gsap.from('.cta-slab', {
          y: 18,
          autoAlpha: 0,
          duration: 0.44,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: {
            trigger: '.cta-slab',
            start: 'top 88%',
            once: true
          }
        })
      })
    }, this.hostEl.nativeElement)
  }
}
