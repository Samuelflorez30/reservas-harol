import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';
import { Servicio } from '../../core/models/servicio.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-4 md:p-8 font-sans text-white">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center mb-8 bg-black/60 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl shadow-xl">
          <div class="text-center md:text-left mb-4 md:mb-0">
            <h1 class="text-3xl font-extrabold text-amber-500 uppercase tracking-wide drop-shadow-lg">Harol Barber - Admin</h1>
            <p class="text-gray-400 font-medium mt-1">Panel de Control</p>
          </div>
          <button (click)="logout()" class="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl border border-zinc-600 transition shadow-lg">Cerrar Sesión</button>
        </header>

        <!-- Tabs -->
        <div class="flex gap-4 mb-8">
          <button 
            (click)="activeTab.set('citas')" 
            [class.bg-amber-500]="activeTab() === 'citas'"
            [class.text-black]="activeTab() === 'citas'"
            [class.bg-black_60]="activeTab() !== 'citas'"
            [class.border-amber-500]="activeTab() === 'citas'"
            class="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition border border-zinc-700 hover:border-amber-500 bg-black/60 backdrop-blur-md"
          >
            Gestión de Citas
          </button>
          <button 
            (click)="activeTab.set('servicios'); cargarServicios()" 
            [class.bg-amber-500]="activeTab() === 'servicios'"
            [class.text-black]="activeTab() === 'servicios'"
            [class.border-amber-500]="activeTab() === 'servicios'"
            class="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition border border-zinc-700 hover:border-amber-500 bg-black/60 backdrop-blur-md text-gray-300"
          >
            Catálogo de Servicios
          </button>
        </div>

        <!-- TAB CITAS -->
        <div *ngIf="activeTab() === 'citas'">
          <div *ngIf="loadingCitas()" class="text-center py-10">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          </div>

          <div *ngIf="!loadingCitas()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (cita of citas(); track cita.id) {
              <div class="bg-black/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-amber-500/30 flex flex-col justify-between gap-6 hover:border-amber-500/80 transition-all">
                <div>
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="font-extrabold text-xl text-white">{{ cita.cliente_nombre }}</h3>
                    <span class="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">{{ cita.fecha }}</span>
                  </div>
                  <div class="space-y-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                    <p class="text-gray-300 text-sm flex justify-between"><span class="text-amber-500 font-bold uppercase text-xs">Hora:</span> <span class="font-medium text-white">{{ cita.hora.substring(0, 5) }}</span></p>
                    <p class="text-gray-300 text-sm flex justify-between"><span class="text-amber-500 font-bold uppercase text-xs">Teléfono:</span> <span class="font-medium text-white">{{ cita.cliente_telefono }}</span></p>
                    <p class="text-gray-300 text-sm flex justify-between"><span class="text-amber-500 font-bold uppercase text-xs">Servicio:</span> <span class="font-medium text-white text-right ml-4">{{ cita.servicios?.nombre || 'General' }}</span></p>
                  </div>
                </div>
                
                <button 
                  (click)="cancelarCita(cita)"
                  class="w-full bg-red-600/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-500 transition border border-red-500/50">
                  Cancelar y Notificar
                </button>
              </div>
            } @empty {
              <div class="col-span-full text-center py-16 bg-black/60 backdrop-blur-md rounded-2xl border border-dashed border-zinc-600">
                <svg class="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p class="text-gray-400 text-lg font-medium">No hay citas activas pendientes.</p>
              </div>
            }
          </div>
        </div>

        <!-- TAB SERVICIOS -->
        <div *ngIf="activeTab() === 'servicios'">
          <div class="flex justify-end mb-6">
            <button (click)="abrirModal()" class="bg-amber-500 text-black px-6 py-3 rounded-xl font-extrabold uppercase tracking-wide hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
              + Nuevo Servicio
            </button>
          </div>

          <div *ngIf="loadingServicios()" class="text-center py-10">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          </div>

          <div *ngIf="!loadingServicios()" class="overflow-x-auto bg-black/80 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-2xl">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-amber-500/30 bg-zinc-900/50">
                  <th class="p-4 text-amber-500 font-bold uppercase text-xs tracking-wider">Servicio</th>
                  <th class="p-4 text-amber-500 font-bold uppercase text-xs tracking-wider">Precio</th>
                  <th class="p-4 text-amber-500 font-bold uppercase text-xs tracking-wider hidden md:table-cell">Duración</th>
                  <th class="p-4 text-amber-500 font-bold uppercase text-xs tracking-wider hidden lg:table-cell">Descripción</th>
                  <th class="p-4 text-amber-500 font-bold uppercase text-xs tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (s of servicios(); track s.id) {
                  <tr class="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                          <img *ngIf="s.imagen_url" [src]="s.imagen_url" class="w-full h-full object-cover">
                        </div>
                        <div>
                          <p class="font-bold text-white">{{ s.nombre }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4 font-bold text-amber-400">{{ s.precio }}</td>
                    <td class="p-4 text-gray-300 hidden md:table-cell">{{ s.duracion_minutos }} min</td>
                    <td class="p-4 text-gray-400 text-sm hidden lg:table-cell truncate max-w-[200px]">{{ s.descripcion }}</td>
                    <td class="p-4 text-right space-x-2">
                      <button (click)="abrirModal(s)" class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-bold transition">Editar</button>
                      <button (click)="eliminarServicio(s.id)" class="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 hover:border-transparent rounded-lg text-sm font-bold transition">Eliminar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="p-8 text-center text-gray-500 font-medium">No hay servicios en el catálogo.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- MODAL CRUD SERVICIOS -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-zinc-900 border border-amber-500/50 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
          <h2 class="text-2xl font-extrabold text-amber-500 uppercase tracking-wide mb-6">{{ formData.id ? 'Editar Servicio' : 'Nuevo Servicio' }}</h2>
          
          <form (ngSubmit)="guardarServicio()" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Nombre del Servicio</label>
              <input type="text" [(ngModel)]="formData.nombre" name="nombre" required class="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 outline-none transition">
            </div>
            
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Precio</label>
                <input type="text" [(ngModel)]="formData.precio" name="precio" required class="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="Ej: $25.000">
              </div>
              <div class="flex-1">
                <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Duración (min)</label>
                <input type="number" [(ngModel)]="formData.duracion_minutos" name="duracion_minutos" required class="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 outline-none transition">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Descripción</label>
              <textarea [(ngModel)]="formData.descripcion" name="descripcion" rows="2" class="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 outline-none transition resize-none"></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">URL de Imagen</label>
              <input type="url" [(ngModel)]="formData.imagen_url" name="imagen_url" class="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 outline-none transition">
            </div>

            <div class="flex gap-3 mt-6">
              <button type="button" (click)="cerrarModal()" class="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition border border-zinc-700">
                Cancelar
              </button>
              <button type="submit" [disabled]="savingService() || !formData.nombre || !formData.precio || !formData.duracion_minutos" class="flex-1 bg-amber-500 text-black font-extrabold py-3 rounded-xl hover:bg-amber-400 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {{ savingService() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);

  // Tabs
  activeTab = signal<'citas' | 'servicios'>('citas');

  // Citas State
  citas = signal<any[]>([]);
  loadingCitas = signal(true);

  // Servicios State
  servicios = signal<Servicio[]>([]);
  loadingServicios = signal(true);

  // Modal State
  showModal = signal(false);
  savingService = signal(false);
  formData: Partial<Servicio> = {};

  ngOnInit() {
    this.cargarCitas();
  }

  // --- LÓGICA DE CITAS ---

  async cargarCitas() {
    this.loadingCitas.set(true);
    try {
      const { data, error } = await this.supabaseService.client
        .from('citas')
        .select('*, servicios(nombre)')
        .eq('estado', 'activa')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
        .limit(500); // Límite de seguridad para evitar sobrecarga de memoria

      if (error) throw error;
      if (data) this.citas.set(data as any[]);
    } catch (err: any) {
      console.error('Error cargando citas:', err);
      alert('Hubo un problema de red cargando las citas. Verifica tu conexión o intenta recargar.');
    } finally {
      this.loadingCitas.set(false);
    }
  }

  async cancelarCita(cita: any) {
    if (!confirm(`¿Estás seguro de cancelar la cita de ${cita.cliente_nombre}?`)) return;

    const { error } = await this.supabaseService.client
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', cita.id);

    if (error) {
      alert('Error cancelando la cita.');
      return;
    }

    this.citas.update(actuales => actuales.filter(c => c.id !== cita.id));

    const horaFormateada = cita.hora.substring(0, 5);
    const servicioNombre = cita.servicios?.nombre || 'Barbería';
    const mensaje = `Hola ${cita.cliente_nombre}, por motivos de fuerza mayor hemos tenido que cancelar tu cita de ${servicioNombre} programada para el ${cita.fecha} a las ${horaFormateada}. Nos disculpamos por las molestias.`;

    const telefonoLimpio = cita.cliente_telefono.replace(/\D/g, '');
    const wsUrl = `https://wa.me/57${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;

    window.open(wsUrl, '_blank');
  }

  // --- LÓGICA DE SERVICIOS (CRUD) ---

  async cargarServicios() {
    if (this.servicios().length > 0) return; // Cache simple
    this.loadingServicios.set(true);
    const { data, error } = await this.supabaseService.client
      .from('servicios')
      .select('*')
      .order('nombre', { ascending: true });

    if (data && !error) {
      this.servicios.set(data);
    }
    this.loadingServicios.set(false);
  }

  abrirModal(servicio?: Servicio) {
    if (servicio) {
      this.formData = { ...servicio };
    } else {
      this.formData = { nombre: '', precio: '', duracion_minutos: 60 };
    }
    this.showModal.set(true);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.formData = {};
  }

  async guardarServicio() {
    this.savingService.set(true);
    const isEditing = !!this.formData.id;

    const payload = {
      nombre: this.formData.nombre,
      precio: this.formData.precio,
      duracion_minutos: this.formData.duracion_minutos,
      descripcion: this.formData.descripcion || null,
      imagen_url: this.formData.imagen_url || null,
    };

    let error;

    if (isEditing) {
      const res = await this.supabaseService.client
        .from('servicios')
        .update(payload)
        .eq('id', this.formData.id);
      error = res.error;
    } else {
      const res = await this.supabaseService.client
        .from('servicios')
        .insert([payload]);
      error = res.error;
    }

    this.savingService.set(false);

    if (error) {
      alert('Hubo un error al guardar el servicio.');
      console.error(error);
    } else {
      this.cerrarModal();
      // Recargar la lista forzando la petición
      this.servicios.set([]);
      this.cargarServicios();
    }
  }

  async eliminarServicio(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio? Las citas asociadas podrían verse afectadas.')) return;

    const { error } = await this.supabaseService.client
      .from('servicios')
      .delete()
      .eq('id', id);

    if (error) {
      alert('No se pudo eliminar el servicio.');
      console.error(error);
    } else {
      this.servicios.update(actuales => actuales.filter(s => s.id !== id));
    }
  }

  logout() {
    this.authService.logout();
  }
}
