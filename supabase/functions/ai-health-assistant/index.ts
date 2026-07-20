import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, handleCors, errorResponse, requireAuth } from '../_shared/cors.ts';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

const DAILY_LIMIT = 20;

const SYSTEM_PROMPT = `You are Prakrit AI, a personal health assistant for Indian families. You help users understand their family's health records, medications, and lab reports.

Guidelines:
- Be warm, clear, and empathetic. Avoid jargon; explain medical terms simply.
- Always personalise answers using the family member context provided.
- For lab values, explain what normal ranges are and what the patient's values mean.
- For medications, explain purpose and common side effects in plain language.
- Never diagnose. Always recommend consulting a doctor for clinical decisions.
- Keep responses concise — 3–5 short paragraphs max unless more detail is explicitly needed.
- For questions involving health concerns, end with: "Please consult your doctor before making any changes."

IMPORTANT: Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.`;

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const userId = await requireAuth(req, supabase);
  if (userId instanceof Response) return userId;

  const { messages, family_member_id } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    family_member_id?: string | null;
  };

  if (!messages || messages.length === 0) return errorResponse('messages required');

  // ── Rate limit: count today's user messages across all this user's conversations ──
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: userConvIds } = await supabase
    .from('ai_chat_conversations')
    .select('id')
    .eq('user_id', userId);

  const convIds = (userConvIds ?? []).map((c: any) => c.id);

  if (convIds.length > 0) {
    const { count } = await supabase
      .from('ai_chat_messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('role', 'user')
      .gte('created_at', todayStart.toISOString());

    if ((count ?? 0) >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'Daily limit reached' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // ── Get or create a conversation for this user + member ──
  let conversationId: string;
  const memberKey = family_member_id ?? 'general';

  const existingConv = convIds.length > 0
    ? await supabase
        .from('ai_chat_conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('family_member_id', family_member_id ?? null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  if (existingConv.data?.id) {
    conversationId = existingConv.data.id;
  } else {
    const { data: newConv, error: convErr } = await supabase
      .from('ai_chat_conversations')
      .insert({
        user_id: userId,
        family_member_id: family_member_id ?? null,
        title: family_member_id ? 'Health Chat' : 'General Health Chat',
      })
      .select('id')
      .single();

    if (convErr || !newConv) return errorResponse('Failed to create conversation', 500);
    conversationId = newConv.id;
  }

  // ── Build member context ──
  let memberContext = '';
  if (family_member_id) {
    const { data: member } = await supabase
      .from('family_members')
      .select('name, date_of_birth, gender, blood_type, height_cm, weight_kg, relationship')
      .eq('id', family_member_id)
      .eq('user_id', userId)
      .single();

    if (member) {
      const ageYears = member.date_of_birth
        ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      const bmi = member.height_cm && member.weight_kg
        ? (member.weight_kg / ((member.height_cm / 100) ** 2)).toFixed(1)
        : null;

      const { data: docs } = await supabase
        .from('documents')
        .select('title, document_type, ai_analysis, created_at')
        .eq('family_member_id', family_member_id)
        .not('ai_analysis', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: meds } = await supabase
        .from('medications')
        .select('name, dosage, frequency, notes')
        .eq('family_member_id', family_member_id)
        .eq('is_active', true);

      const { data: emergency } = await supabase
        .from('emergency_info')
        .select('conditions, allergies')
        .eq('family_member_id', family_member_id)
        .single();

      memberContext = `
FAMILY MEMBER CONTEXT:
- Name: ${member.name} (${member.relationship ?? 'Family member'})
- Age: ${ageYears ?? 'Unknown'} | Gender: ${member.gender ?? 'Unknown'} | Blood type: ${member.blood_type ?? 'Unknown'}
- BMI: ${bmi ?? 'Unknown'}${member.height_cm ? ` (${member.height_cm}cm, ${member.weight_kg}kg)` : ''}
${(emergency?.conditions as string[] | null)?.length ? `- Known conditions: ${(emergency!.conditions as string[]).join(', ')}` : ''}
${emergency?.allergies ? `- Allergies: ${JSON.stringify(emergency.allergies)}` : ''}

ACTIVE MEDICATIONS:
${(meds ?? []).length > 0
  ? (meds ?? []).map((m: any) => `- ${m.name}${m.dosage ? ` ${m.dosage}` : ''} (${m.frequency ?? 'as prescribed'})${m.notes ? ` — ${m.notes}` : ''}`).join('\n')
  : 'None on record'}

RECENT HEALTH DOCUMENTS (most recent first):
${(docs ?? []).length > 0
  ? (docs ?? []).map((d: any) => {
      const a = d.ai_analysis as any;
      return `- ${d.document_type}: ${d.title} (${new Date(d.created_at).toLocaleDateString('en-IN')})\n  Summary: ${a?.summary ?? 'No summary'}\n  Key findings: ${JSON.stringify(a?.findings ?? a?.lab_values ?? 'None')}`;
    }).join('\n')
  : 'No analysed documents yet'}
`;
    }
  }

  const systemWithContext = memberContext
    ? `${SYSTEM_PROMPT}\n\n${memberContext}`
    : SYSTEM_PROMPT;

  // ── Persist the latest user message ──
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (lastUserMsg) {
    await supabase.from('ai_chat_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: lastUserMsg.content,
    });
  }

  // ── Stream response from Claude ──
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: systemWithContext,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  let fullResponse = '';

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            fullResponse += text;
            const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();

        if (fullResponse) {
          await supabase.from('ai_chat_messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
          });
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});
