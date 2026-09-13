import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cita } from '../models/cita.model';
import { Servicio as ServicioModel } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private get supabase() { return this.supabaseService.client; }

  servicios = signal<ServicioModel[]>([]);
  citasActivasDelDia = signal<Cita[]>([]);

  selectedServicio = signal<ServicioModel | null>(null);
  selectedFecha = signal<Date | null>(null);
  selectedHora = signal<string | null>(null);

  slotsDisponibles = computed(() => {
    const slots: { hora: string; ocupado: boolean }[] = [];

    // Verificar si la fecha seleccionada es hoy para bloquear horas pasadas
    const fechaSeleccionada = this.selectedFecha();
    
    // Los domingos el horario empieza a las 10:00 AM, el resto de días a las 9:00 AM
    const esDomingo = fechaSeleccionada?.getDay() === 0;
    const start = esDomingo ? 10 * 60 : 9 * 60;
    const end = 20 * 60; // 8:00 PM

    // Leemos la duración directamente de la base de datos (por defecto 60 min)
    const duracion = this.selectedServicio()?.duracion_minutos || 60;

    const hoy = new Date();
    const esHoy = fechaSeleccionada && 
                  fechaSeleccionada.getDate() === hoy.getDate() && 
                  fechaSeleccionada.getMonth() === hoy.getMonth() && 
                  fechaSeleccionada.getFullYear() === hoy.getFullYear();
    const minutosActuales = hoy.getHours() * 60 + hoy.getMinutes();

    // time <= end permite que se generen citas hasta exactamente las 8:00 PM
    for (let time = start; time <= end; time += duracion) {
      const hours = Math.floor(time / 60).toString().padStart(2, '0');
      const mins = (time % 60).toString().padStart(2, '0');
      
      // Convertimos explícitamente a booleano con !! para evitar el error TS2322
      const yaPaso = !!(esHoy && time <= minutosActuales);
      
      slots.push({ hora: `${hours}:${mins}:00`, ocupado: yaPaso });
    }

    const citasOcupadas = this.citasActivasDelDia().map(c => c.hora);

    return slots.map(slot => ({
      ...slot,
      ocupado: slot.ocupado || citasOcupadas.includes(slot.hora)
    }));
  });

  constructor(private supabaseService: SupabaseService) {
    this.loadServicios();
  }

  private async loadServicios() {
    try {
      const { data, error } = await this.supabase.from('servicios').select('*');
      if (error) throw error;
      if (data) this.servicios.set(data);
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  }

  async loadDisponibilidad(fechaIso: string) {
    try {
      const { data, error } = await this.supabase
        .from('citas')
        .select('hora')
        .eq('fecha', fechaIso)
        .eq('estado', 'activa');

      if (error) throw error;
      if (data) this.citasActivasDelDia.set(data as Cita[]);
    } catch (err) {
      console.error('Error cargando disponibilidad:', err);
      alert('Error de conexión al cargar las horas disponibles.');
    }
  }

  async agendarCita(clienteNombre: string, clienteTelefono: string): Promise<string> {
    const fechaFormat = this.selectedFecha()!.toISOString().split('T')[0];

    const { data, error } = await this.supabase.from('citas').insert([{
      cliente_nombre: clienteNombre,
      cliente_telefono: clienteTelefono,
      servicio_id: this.selectedServicio()!.id,
      fecha: fechaFormat,
      hora: this.selectedHora(),
      estado: 'activa'
    }]).select('id').single();

    if (error) {
      if (error.code === '23505') {
        await this.loadDisponibilidad(fechaFormat);
        throw new Error('El turno acaba de ser tomado. Por favor, selecciona otro.');
      }
      throw error;
    }

    return data.id;
  }
}