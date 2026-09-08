import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- 1. Contenedor absoluto con la imagen de fondo de tu carpeta public -->
    <div class="min-h-screen w-full bg-[url('/harol1.jpg')] bg-cover bg-center bg-fixed">
      
      <!-- 2. Capa oscura semitransparente para que las tarjetas de cristal resalten -->
      <div class="min-h-screen w-full bg-black/50 backdrop-blur-sm">

        <!-- 3. Tu contenedor central (este es el que ya tenías) -->
        <div class="max-w-md mx-auto p-4 min-h-screen flex flex-col gap-6 font-sans">
          
          <header class="text-center mt-6">
            <h1 class="text-4xl font-extrabold text-amber-500 tracking-wide uppercase drop-shadow-lg">Stiven</h1>
            <p class="text-gray-300 mt-2 font-medium drop-shadow-md">Agenda tu cita de manera exclusiva</p>  
          </header>

          <!-- Paso 1: Servicios -->  
          <section *ngIf="step === 1" class="flex flex-col gap-4">
        <h2 class="font-bold text-xl text-amber-400">1. Selecciona tu servicio</h2>
        <div 
          *ngFor="let s of booking.servicios()"
          (click)="selectService(s)"
          class="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 cursor-pointer hover:bg-amber-500/10 hover:border-amber-500 transition-all duration-300 shadow-xl"
        >
          <div class="flex items-center gap-4">
            <!-- Imagen -->
            <div class="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
              <img *ngIf="s.imagen_url" [src]="s.imagen_url" class="w-full h-full object-cover" [alt]="s.nombre">
              <div *ngIf="!s.imagen_url" class="w-full h-full flex items-center justify-center text-amber-500">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </div>
            
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <h3 class="font-bold text-lg text-white">{{ s.nombre }}</h3>
              </div>
              <p *ngIf="s.descripcion" class="text-sm text-gray-400 mt-1 line-clamp-2">{{ s.descripcion }}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-500">{{ s.duracion_minutos }} min</span>
                <span class="font-extrabold text-amber-400 text-lg">{{ s.precio }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Paso 2: Fecha (Calendario Custom) -->
      <section *ngIf="step === 2" class="flex flex-col gap-4">
        <h2 class="font-bold text-xl text-amber-400">2. Selecciona la fecha</h2>
        
        <div class="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          
          <!-- Encabezado del calendario -->
          <div class="flex justify-between items-center mb-4">
            <button (click)="prevMonth()" class="text-amber-500 hover:text-amber-400 p-2 font-bold transition">&larr;</button>
            <span class="text-white font-bold text-lg capitalize">{{ monthName }}</span>
            <button (click)="nextMonth()" class="text-amber-500 hover:text-amber-400 p-2 font-bold transition">&rarr;</button>
          </div>

          <!-- Días de la semana -->
          <div class="grid grid-cols-7 gap-1 text-center mb-2">
            <span *ngFor="let day of weekDays" class="text-xs font-bold text-gray-400">{{ day }}</span>
          </div>

          <!-- Cuadrícula de fechas -->
          <div class="grid grid-cols-7 gap-1">
            <button
              *ngFor="let d of calendarDays"
              (click)="selectCustomDate(d)"
              [disabled]="!d.date || d.isPast"
              class="h-10 w-full rounded-xl flex items-center justify-center text-sm font-medium transition"
              [ngClass]="{
                'opacity-0 cursor-default': !d.date,
                'text-gray-600 cursor-not-allowed': d.date && d.isPast,
                'text-white hover:bg-amber-500 hover:text-black border border-transparent hover:border-amber-500': d.date && !d.isPast && !isSelectedDate(d.date),
                'bg-amber-500 text-black shadow-md border-amber-500': d.date && isSelectedDate(d.date)
              }"
            >
              {{ d.date ? d.date.getDate() : '' }}
            </button>
          </div>

        </div>
        <button (click)="step = 1" class="text-amber-500/80 hover:text-amber-400 text-sm mt-2 font-medium transition">← Volver a servicios</button>
      </section>

      <!-- Paso 3: Hora -->
      <section *ngIf="step === 3" class="flex flex-col gap-4">
        <h2 class="font-bold text-xl text-amber-400">3. Selecciona la hora</h2>
        <div class="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div class="grid grid-cols-3 gap-3">
            <button
              *ngFor="let slot of booking.slotsDisponibles()"
              (click)="selectTime(slot.hora)"
              [disabled]="slot.ocupado"
              [class.bg-amber-500]="booking.selectedHora() === slot.hora"
              [class.text-black]="booking.selectedHora() === slot.hora"
              [class.border-amber-500]="booking.selectedHora() === slot.hora"
              [class.bg-zinc-900]="!slot.ocupado && booking.selectedHora() !== slot.hora"
              [class.border-zinc-700]="!slot.ocupado && booking.selectedHora() !== slot.hora"
              [class.text-gray-300]="!slot.ocupado && booking.selectedHora() !== slot.hora"
              [class.opacity-40]="slot.ocupado"
              [class.cursor-not-allowed]="slot.ocupado"
              class="p-3 text-sm rounded-xl border font-bold transition hover:border-amber-500"
            >
              {{ slot.hora.substring(0, 5) }}
            </button>
          </div>
          
          <div *ngIf="booking.selectedHora()" class="mt-6 flex flex-col gap-3">
            <input type="text" placeholder="Tu Nombre" [(ngModel)]="nombre" class="w-full p-4 rounded-xl bg-zinc-900/80 border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder-gray-500">
            <input type="tel" placeholder="Tu WhatsApp (ej: 3001234567)" [(ngModel)]="telefono" class="w-full p-4 rounded-xl bg-zinc-900/80 border border-zinc-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder-gray-500">
            
            <button 
              (click)="agendar()" 
              [disabled]="!nombre || !telefono || isSubmitting"
              class="mt-4 w-full bg-amber-500 text-black p-4 rounded-xl font-extrabold uppercase tracking-wide disabled:bg-zinc-700 disabled:text-gray-500 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
              {{ isSubmitting ? 'Procesando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </div>
        <button (click)="step = 2" class="text-amber-500/80 hover:text-amber-400 text-sm mt-2 font-medium text-center transition">← Volver a fechas</button>
      </section>

      <!-- Paso 4: Éxito -->
      <section *ngIf="step === 4" class="bg-black/80 backdrop-blur-md border border-amber-500 rounded-2xl p-8 text-center flex flex-col gap-6 shadow-2xl">
        <div class="text-amber-500">
          <svg class="w-20 h-20 mx-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h2 class="font-extrabold text-3xl text-white mb-2 tracking-wide">¡Reserva Lista!</h2>
          <p class="text-amber-200/70 font-medium">Prepara tu mejor estilo, te esperamos.</p>
        </div>
        
        <div class="bg-zinc-900/50 p-5 rounded-xl text-left border border-amber-500/20 mt-2">
          <p class="text-sm text-amber-500 font-bold uppercase tracking-wider mb-2">Importante</p>
          <p class="text-sm text-gray-300 mb-3">Si surge algún imprevisto, usa este enlace seguro para cancelar tu cita:</p>
          
          <div class="flex items-center bg-black rounded-lg border border-zinc-700 p-1 mb-4">
            <input type="text" readonly [value]="cancelLink" class="w-full text-xs p-2 bg-transparent text-gray-400 select-all cursor-pointer focus:outline-none" (click)="copiarLink()">
            <button (click)="copiarLink()" class="p-2 text-amber-500 hover:text-amber-400 transition" title="Copiar enlace">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
          
          <a [href]="whatsappLink" target="_blank"
             class="flex justify-center items-center gap-2 w-full bg-[#25D366] text-white p-3 rounded-xl font-bold hover:bg-[#20b858] transition shadow-lg shadow-[#25D366]/20">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar confirmación
          </a>
        </div>

        <button (click)="reset()" class="text-amber-500 hover:text-amber-400 font-medium text-sm mt-2 transition">Agendar nueva cita</button>
      </section>

        </div> <!-- Cierra el contenedor central max-w-md -->
      </div> <!-- Cierra la capa oscura -->
    </div> <!-- Cierra el contenedor de imagen -->
  `
})
export class BookingComponent implements OnInit {
  booking = inject(BookingService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  step = 1;
  tempDate: string = '';
  minDate = new Date().toISOString().split('T')[0];

  nombre = '';
  telefono = '';
  isSubmitting = false;
  cancelLink = '';

  get whatsappLink() {
    const msg = `Hola Harold, agendé una cita. Mi link privado de cancelación en caso de imprevistos es: ${this.cancelLink}`;
    return `https://wa.me/573229098831?text=${encodeURIComponent(msg)}`; // Ajusta el código de país y número real aquí
  }

  copiarLink() {
    navigator.clipboard.writeText(this.cancelLink);
    alert('¡Enlace copiado al portapapeles!');
  }

  selectService(servicio: any) {
    this.booking.selectedServicio.set(servicio);
    this.step = 2;
  }

  // Nuevas variables del calendario
  currentMonth = new Date();
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: { date: Date | null, isPast: boolean }[] = [];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ date: null, isPast: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      this.calendarDays.push({
        date: d,
        isPast: d < today // Domingos ya permitidos
      });
    }
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  prevMonth() {
    const today = new Date();
    if (this.currentMonth.getFullYear() === today.getFullYear() && this.currentMonth.getMonth() === today.getMonth()) {
      return;
    }
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  get monthName() {
    return this.currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  }

  isSelectedDate(d: Date): boolean {
    const sel = this.booking.selectedFecha();
    if (!sel) return false;
    return d.getDate() === sel.getDate() && d.getMonth() === sel.getMonth() && d.getFullYear() === sel.getFullYear();
  }

  async selectCustomDate(day: { date: Date | null, isPast: boolean }) {
    if (!day.date || day.isPast) return;

    const yyyy = day.date.getFullYear();
    const mm = String(day.date.getMonth() + 1).padStart(2, '0');
    const dd = String(day.date.getDate()).padStart(2, '0');
    this.tempDate = `${yyyy}-${mm}-${dd}`;

    this.booking.selectedFecha.set(day.date);
    await this.booking.loadDisponibilidad(this.tempDate);
    this.step = 3;
  }

  selectTime(hora: string) {
    this.booking.selectedHora.set(hora);
  }

  async agendar() {
    this.isSubmitting = true;
    try {
      const idCita = await this.booking.agendarCita(this.nombre, this.telefono);
      this.cancelLink = environment.siteUrl + '/cancelar/' + idCita;
      this.step = 4;
    } catch (e: any) {
      alert(e.message || 'Error al agendar la cita.');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  reset() {
    this.step = 1;
    this.nombre = '';
    this.telefono = '';
    this.cancelLink = '';
    this.booking.selectedServicio.set(null);
    this.booking.selectedFecha.set(null);
    this.booking.selectedHora.set(null);
  }
}
