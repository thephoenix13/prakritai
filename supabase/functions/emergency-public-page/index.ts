import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, handleCors, errorResponse, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  // Public endpoint — no auth required
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) return errorResponse('token required');

  // Look up emergency info by public token
  const { data: emergencyInfo, error } = await supabase
    .from('emergency_info')
    .select(`
      *,
      family_members (
        name,
        date_of_birth,
        gender,
        blood_type
      )
    `)
    .eq('public_token', token)
    .single();

  if (error || !emergencyInfo) return errorResponse('Emergency card not found', 404);

  const member = (emergencyInfo as any).family_members;
  const ageYears = member?.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return jsonResponse({
    name: member?.name ?? emergencyInfo.name,
    age: ageYears,
    gender: member?.gender,
    blood_type: member?.blood_type ?? emergencyInfo.blood_type,
    allergies: emergencyInfo.allergies ?? [],
    conditions: emergencyInfo.conditions ?? [],
    medications: emergencyInfo.medications ?? [],
    emergency_contacts: emergencyInfo.emergency_contacts ?? [],
    notes: emergencyInfo.notes,
    last_updated: emergencyInfo.updated_at,
  });
});
