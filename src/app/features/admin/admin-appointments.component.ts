import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { Cita } from '../../core/models/cita.model';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-8 font-sans text-white">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h2 class="text-3xl font-extrabold text-amber-500 uppercase tracking-wide drop-shadow-lg flex items-center gap-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Citas de Hoy
          </h2>
          <p class="text-gray-400 font-medium mt-1">Revisa tu agenda para el día de hoy.</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (cita of citasHoy(); track cita.id) {
            <div class="bg-black/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-amber-500/30 flex flex-col justify-between gap-6 hover:border-amber-500/80 transition-all relative overflow-hidden">
              <!-- Círculo decorativo -->
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

              <div>
                <div class="flex justify-between items-start mb-4">
                  <h3 class="font-extrabold text-2xl text-white drop-shadow-md">{{ cita.hora.substring(0, 5) }}</h3>
                  <span class="bg-zinc-800 border border-zinc-700 text-amber-500 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Hoy
                  </span>
                </div>
                
                <div class="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 relative z-10">
                  <div class="flex items-center gap-3">
                    <div class="bg-amber-500/20 p-2 rounded-lg text-amber-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div>
                      <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Cliente</p>
                      <p class="font-bold text-white text-lg leading-tight">{{ cita.cliente_nombre }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <div class="bg-amber-500/20 p-2 rounded-lg text-amber-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <div>
                      <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Teléfono</p>
                      <p class="font-medium text-gray-300 leading-tight">{{ cita.cliente_telefono }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                (click)="cancelarCita(cita)"
                [disabled]="isCanceling()"
                class="w-full bg-red-600/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-500 transition border border-red-500/50 disabled:opacity-50 relative z-10 flex justify-center items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Cancelar Cita
              </button>
            </div>
          } @empty {
            <div class="col-span-full text-center py-16 bg-black/60 backdrop-blur-md rounded-2xl border border-dashed border-zinc-600">
              <svg class="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p class="text-gray-400 text-lg font-medium">Agenda libre por hoy. ¡Tómate un descanso!</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminAppointmentsComponent implements OnInit {
  citasHoy = signal<Cita[]>([]);
  isCanceling = signal<boolean>(false);

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.cargarCitasDeHoy();
  }

  async cargarCitasDeHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase.client
      .from('citas')
      .select('*')
      .eq('fecha', hoy)
      .eq('estado', 'activa')
      .order('hora', { ascending: true });

    if (data) this.citasHoy.set(data as Cita[]);
  }

  async cancelarCita(cita: Cita) {
    if (!confirm(`¿Cancelar la cita de ${cita.cliente_nombre}?`)) return;
    this.isCanceling.set(true);
    
    const { error } = await this.supabase.client
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', cita.id);

    this.isCanceling.set(false);
    if (error) return alert('Error cancelando la cita.');

    this.citasHoy.update(citas => citas.filter(c => c.id !== cita.id));

    const horaForm = cita.hora.substring(0, 5);
    const mensaje = `Hola ${cita.cliente_nombre}, soy Stiven Tapia... tuve un imprevisto y debo cancelar tu cita de las ${horaForm}.`;
    const telefono = cita.cliente_telefono.replace(/\D/g, ''); 
    
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
