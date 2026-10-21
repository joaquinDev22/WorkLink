import { Component, inject } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterLink } from '@angular/router';
import { Auth } from '../../auth/services/auth';

@Component({
  imports: [Navbar, RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected auth = inject(Auth);
}
