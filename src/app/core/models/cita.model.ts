export interface Cita {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  servicio_id: string;
  fecha: string;
  hora: string;
  estado: 'activa' | 'cancelada';
  google_calendar_event_id?: string;
  created_at?: string;
}
