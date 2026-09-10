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
    <div class="relative min-h-screen font-sans text-white">
      <!-- Imagen de fondo con filtro oscuro -->
      <div class="fixed inset-0 bg-[url('/Portada.jpg')] bg-cover bg-center bg-no-repeat z-0"></div>
      <div class="fixed inset-0 bg-black/85 z-0"></div>
      
      <div class="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center mb-10 bg-black/80 backdrop-blur-md border border-amber-500/40 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <!-- Decoración de fondo -->
          <div class="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
          
          <div class="text-center md:text-left mb-6 md:mb-0 relative z-10 flex items-center gap-4">
            <div class="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
              <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
            </div>
            <div>
              <h1 class="text-4xl font-extrabold text-white uppercase tracking-wider drop-shadow-lg flex items-center gap-2">
                Stiven <span class="text-amber-500">Tapia</span>
              </h1>
              <p class="text-amber-500/80 font-bold uppercase tracking-widest text-xs mt-1">Admin Control Panel</p>
            </div>
          </div>
          <button (click)="logout()" class="relative z-10 px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-xl border border-red-500/30 transition shadow-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Cerrar Sesión
          </button>
        </header>

        <!-- Tabs Navigation Premium -->
        <nav class="relative flex p-1.5 mb-10 bg-black/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl mx-auto md:mx-0 w-full md:w-fit overflow-hidden" aria-label="Tabs">
          
          <!-- Botón Gestión de Citas -->
          <button 
            (click)="activeTab.set('citas')" 
            [ngClass]="activeTab() === 'citas' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-100' : 'text-gray-400 hover:text-white hover:bg-white/5 scale-95'"
            class="relative z-10 flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-3.5 rounded-xl font-extrabold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 transform"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span class="truncate">Citas</span>
          </button>
          
          <!-- Botón Catálogo -->
          <button 
            (click)="activeTab.set('servicios'); cargarServicios()" 
            [ngClass]="activeTab() === 'servicios' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-100' : 'text-gray-400 hover:text-white hover:bg-white/5 scale-95'"
            class="relative z-10 flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-3.5 rounded-xl font-extrabold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 transform"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span class="truncate">Catálogo</span>
          </button>
        </nav>

        <!-- TAB CITAS -->
        <div *ngIf="activeTab() === 'citas'">
          <div *ngIf="loadingCitas()" class="text-center py-10">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          </div>

          <div *ngIf="!loadingCitas()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (cita of citasProcesadas; track cita.id) {
              <div class="bg-black/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border flex flex-col justify-between gap-6 hover:border-amber-500/80 transition-all group relative overflow-hidden"
                   [ngClass]="cita.isNext ? 'border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.25)]' : 'border-amber-500/30'">
                
                <!-- Decoración de fondo -->
                <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl transition-all duration-500"
                     [ngClass]="cita.isNext ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-amber-500/5 group-hover:bg-amber-500/20'"></div>
                
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-6">
                    <div>
                      <div class="flex gap-2 items-center mb-3">
                        <span class="bg-zinc-800 text-amber-500 border border-zinc-700 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-widest">{{ cita.fecha }}</span>
                        <span *ngIf="cita.isNext" class="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 animate-pulse">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Siguiente
                        </span>
                      </div>
                      <h3 class="font-extrabold text-2xl text-white">{{ cita.cliente_nombre }}</h3>
                    </div>
                    <span class="text-3xl font-black drop-shadow-md" [ngClass]="cita.isNext ? 'text-green-400' : 'text-amber-500'">{{ cita.hora.substring(0, 5) }}</span>
                  </div>
                  <div class="space-y-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/50">
                    <div class="flex items-center gap-3">
                      <div class="bg-amber-500/10 p-2 rounded-lg text-amber-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg></div>
                      <span class="font-medium text-gray-300">{{ cita.cliente_telefono }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="bg-amber-500/10 p-2 rounded-lg text-amber-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg></div>
                      <span class="font-medium text-gray-300">{{ cita.servicios?.nombre || 'General' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="relative z-10 flex flex-col gap-2">
                  <button 
                    (click)="marcarComoCompletada(cita)"
                    class="w-full bg-green-600/10 text-green-500 py-3 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all border border-green-500/50 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Realizada
                  </button>
                  <button 
                    (click)="cancelarCita(cita)"
                    class="w-full bg-red-600/10 text-red-500 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all border border-red-500/50 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Cancelar y Notificar
                  </button>
                </div>
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
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-extrabold text-white tracking-wide">Servicios Ofertados</h2>
            <button (click)="abrirModal()" class="bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider hover:bg-amber-400 transition shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Crear
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

      if (data) {
        // Removemos las citas marcadas localmente como completadas para que desaparezcan de inmediato
        const completadas = JSON.parse(localStorage.getItem('citas_completadas') || '[]');
        this.citas.set(data.filter(c => !completadas.includes(c.id)));
      }
    } catch (err: any) {
      console.error('Error cargando citas:', err);
      alert('Hubo un problema de red cargando las citas. Verifica tu conexión o intenta recargar.');
    } finally {
      this.loadingCitas.set(false);
    }
  }

  get citasProcesadas() {
    const ahora = new Date();
    const hoyStr = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().substring(0, 5);

    let nextEncontrada = false;

    return this.citas().map(cita => {
      let isNext = false;
      if (!nextEncontrada && (cita.fecha > hoyStr || (cita.fecha === hoyStr && cita.hora >= horaActual))) {
        isNext = true;
        nextEncontrada = true;
      }
      return { ...cita, isNext };
    });
  }

  async marcarComoCompletada(cita: any) {
    if (!confirm(`¿Estás seguro de marcar la cita de ${cita.cliente_nombre} como REALIZADA? Desaparecerá de tu lista activa.`)) return;

    try {
      const { error } = await this.supabaseService.client
        .from('citas')
        .update({ estado: 'completada' })
        .eq('id', cita.id);

      if (error) {
        // Si falla porque el ENUM de Postgres no tiene 'completada', usamos localStorage como fallback seguro
        if (error.code === '22P02') {
          const completadas = JSON.parse(localStorage.getItem('citas_completadas') || '[]');
          completadas.push(cita.id);
          localStorage.setItem('citas_completadas', JSON.stringify(completadas));
          this.citas.update(citas => citas.filter(c => c.id !== cita.id));
          return;
        }
        throw error;
      }

      this.citas.update(citas => citas.filter(c => c.id !== cita.id));
    } catch (err) {
      console.error('Error al completar cita:', err);
      alert('Ocurrió un error. Si persiste, usa el fallback guardando el estado en local.');
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
