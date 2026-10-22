import { Component, model, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../auth/services/auth';

@Component({
  imports: [RouterLink],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  isOpen = model<boolean>(false);
  protected auth = inject(Auth);

  cerrar(): void {
    this.isOpen.set(false);
  }
}
