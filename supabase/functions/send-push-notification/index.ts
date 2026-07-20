import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, handleCors, errorResponse, jsonResponse, requireAuth } from '../_shared/cors.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const userId = await requireAuth(req, supabase);
  if (userId instanceof Response) return userId;

  const body = await req.json() as {
    user_id?: string;
    expo_push_token?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channel_id?: string;
  };

  if (!body.title || !body.body) return errorResponse('title and body required');

  let token = body.expo_push_token;

  if (!token && body.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', body.user_id)
      .single();
    token = profile?.expo_push_token;
  }

  if (!token) {
    // Fallback: look up the calling user's token
    const { data: profile } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', userId)
      .single();
    token = profile?.expo_push_token;
  }

  if (!token) return errorResponse('No push token found for user');

  const message = {
    to: token,
    title: body.title,
    body: body.body,
    data: body.data ?? {},
    sound: 'default',
    priority: 'high',
    channelId: body.channel_id ?? 'default',
  };

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(message),
  });

  const result = await res.json();

  if (result.errors || result.data?.[0]?.status === 'error') {
    console.error('Expo push error:', JSON.stringify(result));
    return jsonResponse({ success: false, error: result }, 200);
  }

  return jsonResponse({ success: true, ticket: result.data?.[0] });
});
