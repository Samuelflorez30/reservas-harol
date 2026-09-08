// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { JWT } from "npm:google-auth-library@9";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// IMPORTANTE: Pon aquí el correo de la cuenta de Google Calendar real
const CALENDAR_ID = 'davidflorezramirez1602@gmail.com';

serve(async (req: any) => {
  try {
    const payload = await req.json();
    const { type, record, old_record } = payload;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Obtener y parsear el JSON de Google Cloud que guardaste en la terminal
    const serviceAccountStr = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountStr) throw new Error('No se encontró el secreto de Google');
    const credentials = JSON.parse(serviceAccountStr);

    // 2. Generar el cliente de autenticación
    const authClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    // 3. Crear cita
    if (type === 'INSERT' && record.estado === 'activa') {
      const startDateTime = new Date(`${record.fecha}T${record.hora}-05:00`);
      const endDateTime = new Date(startDateTime.getTime() + 45 * 60000); // 45 minutos fijos

      const eventResponse = await authClient.request({
        url: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
        method: 'POST',
        data: {
          summary: `Corte: ${record.cliente_nombre}`,
          description: `Contacto: ${record.cliente_telefono}`,
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() }
        }
      });

      const eventId = (eventResponse.data as any).id;

      // Guardar el ID del evento de Google en la base de datos de Supabase
      await supabase.from('citas').update({ google_calendar_event_id: eventId }).eq('id', record.id);

      return new Response(JSON.stringify({ success: true, eventId }), { status: 200 });
    }

    // 4. Eliminar cita cancelada
    if (type === 'UPDATE' && record.estado === 'cancelada' && old_record.estado === 'activa') {
      const eventId = record.google_calendar_event_id;
      if (eventId) {
        await authClient.request({
          url: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${eventId}`,
          method: 'DELETE',
        });
      }
      return new Response(JSON.stringify({ success: true, action: 'deleted' }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, action: 'ignored' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});