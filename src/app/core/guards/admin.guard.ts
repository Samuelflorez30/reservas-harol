import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const session = await authService.getSession();
  
  if (session) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
