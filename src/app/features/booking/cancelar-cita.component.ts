import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-cancelar-cita',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-white">
      
      <!-- ESTADO: CARGANDO -->
      <div *ngIf="loading()" class="flex flex-col items-center bg-black/60 backdrop-blur-md border border-amber-500/30 p-8 rounded-2xl shadow-xl">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <p class="text-amber-200 font-medium tracking-wide">Buscando cita...</p>
      </div>

      <!-- ESTADO: ERROR -->
      <div *ngIf="!loading() && error()" class="bg-black/80 backdrop-blur-md border border-red-500/50 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full">
        <div class="text-red-500 mb-4">
          <svg class="w-16 h-16 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-extrabold text-white mb-2">¡Oops!</h3>
        <p class="text-gray-300 mb-6 font-medium">{{ error() }}</p>
        <button routerLink="/" class="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20">
          Volver al inicio
        </button>
      </div>

      <!-- ESTADO: ÉXITO CANCELACIÓN -->
      <div *ngIf="!loading() && !error() && cancelado()" class="bg-black/80 backdrop-blur-md border border-amber-500/50 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full">
        <div class="text-amber-500 mb-4">
          <svg class="w-16 h-16 mx-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-extrabold text-white mb-2 tracking-wide">Cancelada</h3>
        <p class="text-gray-300 mb-6 font-medium">Tu cita ha sido cancelada exitosamente.</p>
        <button routerLink="/" class="w-full bg-amber-500 text-black font-extrabold py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
          Volver al inicio
        </button>
      </div>

      <!-- ESTADO: ENCONTRADA (CONFIRMACIÓN) -->
      <div *ngIf="!loading() && !error() && !cancelado() && cita()" class="bg-black/80 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
        <h3 class="text-2xl font-extrabold text-amber-500 mb-6 text-center uppercase tracking-wider drop-shadow-lg">Detalles de tu Cita</h3>
        
        <div class="bg-zinc-900/60 rounded-xl p-5 mb-6 border border-zinc-700/50">
          <p class="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">Nombre</p>
          <p class="font-medium text-white mb-4 text-lg">{{ cita()?.cliente_nombre }}</p>
          
          <p class="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">Servicio</p>
          <p class="font-medium text-white mb-4 text-lg">{{ cita()?.servicio || 'Servicio de barbería' }}</p>
          
          <div class="flex justify-between bg-black/40 p-3 rounded-lg border border-zinc-800">
            <div>
              <p class="text-xs text-gray-400 mb-1">Fecha</p>
              <p class="font-bold text-white">{{ cita()?.fecha }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400 mb-1">Hora</p>
              <p class="font-bold text-amber-400">{{ cita()?.hora?.substring(0, 5) }}</p>
            </div>
          </div>
        </div>

        <p class="text-center text-gray-300 font-medium mb-6">¿Estás seguro de que deseas cancelar esta cita?</p>

        <div class="flex flex-col gap-3">
          <button (click)="confirmarCancelacion()" class="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-500 transition shadow-lg shadow-red-500/20">
            Sí, cancelar cita
          </button>
          <button routerLink="/" class="w-full bg-zinc-800 text-white font-bold py-3.5 rounded-xl hover:bg-zinc-700 transition border border-zinc-700">
            No, mantenerla
          </button>
        </div>
      </div>

    </div>
  `
})
export class CancelarCitaComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private route = inject(ActivatedRoute);

  // Estado local manejado con Signals
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  cancelado = signal<boolean>(false);
  cita = signal<any | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No se proporcionó un ID válido.');
      this.loading.set(false);
      return;
    }
    
    this.cargarCita(id);
  }

  async cargarCita(id: string) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('citas')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        this.error.set('Cita no encontrada. Puede que el enlace sea incorrecto.');
        return;
      }

      if (data.estado === 'cancelada') {
        this.error.set('Esta cita ya fue cancelada previamente.');
        return;
      }

      this.cita.set(data);
    } catch (err) {
      this.error.set('Ocurrió un error al buscar la cita.');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmarCancelacion() {
    this.loading.set(true);
    
    try {
      const currentCita = this.cita();
      if (!currentCita) return;

      const { error } = await this.supabaseService.client
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('id', currentCita.id);

      if (error) {
        this.error.set('Hubo un problema procesando tu cancelación. Intenta de nuevo.');
      } else {
        this.cancelado.set(true);
      }
    } catch (err) {
      this.error.set('Ocurrió un error de red al cancelar la cita.');
    } finally {
      this.loading.set(false);
    }
  }
}
