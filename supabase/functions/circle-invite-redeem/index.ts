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

  const { token } = await req.json() as { token: string };
  if (!token) return errorResponse('token required');

  // Look up the invite
  const { data: invite, error } = await supabase
    .from('circle_invites')
    .select('id, host_user_id, expires_at, used')
    .eq('token', token)
    .single();

  if (error || !invite) return errorResponse('Invalid invite link', 404);
  if (invite.used) return errorResponse('This invite link has already been used', 400);
  if (new Date(invite.expires_at) < new Date()) return errorResponse('This invite link has expired', 400);
  if (invite.host_user_id === userId) return errorResponse('You cannot join your own circle', 400);

  // Check for existing pending request
  const { data: existingRequest } = await supabase
    .from('circle_requests')
    .select('id, status')
    .eq('invite_id', invite.id)
    .eq('requester_user_id', userId)
    .single();

  if (existingRequest) {
    return jsonResponse({
      request_id: existingRequest.id,
      status: existingRequest.status,
      host_user_id: invite.host_user_id,
      message: 'Request already submitted',
    });
  }

  // Create the request
  const { data: circleRequest, error: requestErr } = await supabase
    .from('circle_requests')
    .insert({
      invite_id: invite.id,
      requester_user_id: userId,
      status: 'pending',
    })
    .select('id')
    .single();

  if (requestErr || !circleRequest) return errorResponse('Failed to create circle request', 500);

  // Mark invite as used
  await supabase
    .from('circle_invites')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', invite.id);

  return jsonResponse({
    request_id: circleRequest.id,
    status: 'pending',
    host_user_id: invite.host_user_id,
    message: 'Circle request sent. The host will need to accept your request.',
  });
});
