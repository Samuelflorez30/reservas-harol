import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { Cita } from '../../core/models/cita.model';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Citas de Hoy</h2>
      <div class="flex flex-col gap-4">
        @for (cita of citasHoy(); track cita.id) {
          <div class="p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center">
            <div>
              <p class="font-bold text-lg text-gray-900">{{ cita.hora.substring(0, 5) }}</p>
              <p class="font-medium text-gray-700">{{ cita.cliente_nombre }}</p>
              <p class="text-sm text-gray-500">{{ cita.cliente_telefono }}</p>
            </div>
            <button 
              (click)="cancelarCita(cita)"
              [disabled]="isCanceling()"
              class="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 disabled:opacity-50 transition">
              Cancelar
            </button>
          </div>
        } @empty {
          <p class="text-gray-500 text-center mt-10">Agenda libre por hoy.</p>
        }
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
    const mensaje = `Hola ${cita.cliente_nombre}, soy Harold... tuve un imprevisto y debo cancelar tu cita de las ${horaForm}.`;
    const telefono = cita.cliente_telefono.replace(/\D/g, ''); 
    
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
