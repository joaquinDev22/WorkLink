import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
   pildoraX = signal(0);
  pildoraW = signal(0);
  pildoraVisible = signal(false);
  moverPildora(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    this.pildoraX.set(el.offsetLeft);
    this.pildoraW.set(el.offsetWidth);
    this.pildoraVisible.set(true);
  }
  ocultarPildora() {
    this.pildoraVisible.set(false);
  }
}
