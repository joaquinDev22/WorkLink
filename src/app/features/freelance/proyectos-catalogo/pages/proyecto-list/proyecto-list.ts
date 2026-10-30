import { Component, inject, OnInit, signal } from '@angular/core';
import { ProyectoCatalog } from '../../services/proyecto-catalog';
import { ProyectoResponseDTO } from '../../../proyecto-gestion/models/proyecto.models';

@Component({
  imports: [],
  selector: 'app-proyecto-list',
  styleUrl: './proyecto-list.css',
  templateUrl: './proyecto-list.html',
})
export class ProyectoList implements OnInit {

  protected catalogService = inject(ProyectoCatalog)

  catalogo = signal<ProyectoResponseDTO[]>([])

  ngOnInit(): void {
    this.catalogService.getProyectos().subscribe({
      next: (data) => this.catalogo.set(data),
      error: (e) => console.error('No hay proyectos cargados', e)
    })
  }
}
