import { Routes } from '@angular/router';
import { BookingComponent } from './features/booking/booking.component';
import { LoginComponent } from './features/admin/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { CancelarCitaComponent } from './features/booking/cancelar-cita.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: BookingComponent },
  { path: 'cancelar/:id', component: CancelarCitaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
