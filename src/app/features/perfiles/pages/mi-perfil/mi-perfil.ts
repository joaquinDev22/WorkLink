import { Component, model, OnInit, inject } from '@angular/core';
import { PerfilUsuarioDTO } from '../../models/perfil.models';
import { Perfil } from '../../services/perfil';

@Component({
  imports: [],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit{
  private service = inject(Perfil)

  perfil = model<PerfilUsuarioDTO>()

  ngOnInit(): void {
    this.service.getProfile().subscribe({
      next: (data) => this.perfil.set(data),
      error: (e) => console.error('No se pudo cargar el perfil', e)
    })
  }
}
