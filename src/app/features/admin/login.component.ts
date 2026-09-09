import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-screen flex items-center justify-center p-4 font-sans text-white overflow-hidden">
      <!-- Imagen de fondo con filtro oscuro -->
      <div class="absolute inset-0 bg-[url('/Portada.jpg')] bg-cover bg-center bg-no-repeat"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
      
      <!-- Contenedor del Formulario -->
      <div class="relative z-10 bg-black/60 backdrop-blur-xl border border-amber-500/30 p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-sm w-full">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
        <h2 class="relative z-10 text-3xl font-extrabold text-amber-500 text-center mb-2 uppercase tracking-wider drop-shadow-lg">STIVEN TAPIA</h2>
        <p class="text-center text-gray-400 mb-8 font-medium">Acceso Administrativo</p>
        
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <div>
            <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input type="email" [(ngModel)]="email" name="email" required class="w-full p-4 rounded-xl bg-zinc-900/80 border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder-gray-500" placeholder="admin@ejemplo.com">
          </div>
          
          <div>
            <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" required class="w-full p-4 rounded-xl bg-zinc-900/80 border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder-gray-500" placeholder="••••••••">
          </div>

          <div *ngIf="error()" class="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-medium">
            {{ error() }}
          </div>

          <button type="submit" [disabled]="loading() || !email || !password" class="w-full bg-amber-500 text-black p-4 rounded-xl font-extrabold mt-4 uppercase tracking-wide disabled:bg-zinc-800 disabled:text-gray-500 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
            {{ loading() ? 'Verificando...' : 'Entrar al Panel' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit() {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch (e: any) {
      this.error.set('Credenciales incorrectas');
    } finally {
      this.loading.set(false);
    }
  }
}
