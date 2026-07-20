import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, handleCors, errorResponse, jsonResponse, requireAuth } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const userId = await requireAuth(req, supabase);
  if (userId instanceof Response) return userId;

  // Check active connections limit (max 10)
  const { count } = await supabase
    .from('circle_connections')
    .select('id', { count: 'exact', head: true })
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .is('revoked_at', null);

  if ((count ?? 0) >= 10) {
    return errorResponse('Maximum of 10 active circle connections reached', 400);
  }

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data: invite, error } = await supabase
    .from('circle_invites')
    .insert({
      host_user_id: userId,
      expires_at: expiresAt,
      used: false,
    })
    .select('id, token, expires_at')
    .single();

  if (error || !invite) return errorResponse('Failed to create invite', 500);

  const inviteUrl = `https://prakrit.ai/join/${invite.token}`;

  return jsonResponse({
    invite_id: invite.id,
    token: invite.token,
    invite_url: inviteUrl,
    expires_at: invite.expires_at,
  });
});
