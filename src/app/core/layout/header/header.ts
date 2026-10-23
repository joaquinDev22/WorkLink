import { Component, inject, input, signal } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterLink } from '@angular/router';
import { Auth } from '../../auth/services/auth';
import { BurgerMenu } from '../../../shared/components/burger-menu/burger-menu';
import { Sidebar } from '../sidebar/sidebar';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  imports: [Navbar, RouterLink, BurgerMenu, Sidebar],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected auth = inject(Auth);
  private observer = inject(BreakpointObserver)

  isMinWidth = signal<boolean>(false)
  isMenuOpen = signal<boolean>(false)
  floating = input<boolean>(true);
  
  ngOnInit(): void {
    this.observer.observe(['(max-width: 1024px)']).subscribe((rdo) => {
      this.isMinWidth.set(rdo.matches);
      if (!rdo.matches) {
        this.isMenuOpen.set(false);
      }
    });
  }
}
