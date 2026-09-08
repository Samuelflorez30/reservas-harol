import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private get supabase() { return this.supabaseService.client; }

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return data.session;
  }
}
