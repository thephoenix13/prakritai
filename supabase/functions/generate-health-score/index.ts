import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk';
import { corsHeaders, handleCors, errorResponse, jsonResponse, requireAuth } from '../_shared/cors.ts';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const userId = await requireAuth(req, supabase);
  if (userId instanceof Response) return userId;

  const { family_member_id } = await req.json();
  if (!family_member_id) return errorResponse('family_member_id required');

  // Fetch member data
  const { data: member, error: memberErr } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', family_member_id)
    .eq('user_id', userId)
    .single();
  if (memberErr || !member) return errorResponse('Family member not found', 404);

  // Fetch recent documents (last 10, with AI analysis)
  const { data: documents } = await supabase
    .from('documents')
    .select('title, document_type, ai_analysis, created_at')
    .eq('family_member_id', family_member_id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch active medications
  const { data: medications } = await supabase
    .from('medications')
    .select('name, dosage, frequency')
    .eq('family_member_id', family_member_id)
    .eq('is_active', true);

  // Fetch recent medication logs (last 14 days) for adherence
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: medLogs } = await supabase
    .from('medication_logs')
    .select('status')
    .eq('family_member_id', family_member_id)
    .gte('created_at', twoWeeksAgo);

  const ageYears = member.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bmi = member.height_cm && member.weight_kg
    ? (member.weight_kg / ((member.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const adherenceLogs = medLogs ?? [];
  const takenCount = adherenceLogs.filter((l: any) => l.status === 'taken').length;
  const adherencePct = adherenceLogs.length > 0
    ? Math.round((takenCount / adherenceLogs.length) * 100)
    : null;

  const prompt = `You are a clinical health scoring system. Score this patient's health based on available data.

PATIENT:
- Name: ${member.name}
- Age: ${ageYears ?? 'Unknown'} years
- Gender: ${member.gender ?? 'Unknown'}
- BMI: ${bmi ?? 'Unknown'}

RECENT MEDICAL DOCUMENTS (most recent first):
${(documents ?? []).map((d: any) => `- ${d.document_type}: ${d.title}\n  Analysis: ${JSON.stringify(d.ai_analysis ?? 'None')}`).join('\n') || 'None available'}

ACTIVE MEDICATIONS:
${(medications ?? []).map((m: any) => `- ${m.name} ${m.dosage ?? ''} (${m.frequency ?? ''})`).join('\n') || 'None'}

MEDICATION ADHERENCE (last 14 days):
${adherencePct !== null ? `${adherencePct}% (${takenCount} of ${adherenceLogs.length} doses taken)` : 'No data'}

Return ONLY valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "grade": <"A" if 80-100, "B" if 60-79, "C" if 40-59, "D" if 0-39>,
  "summary": <2-sentence plain English summary>,
  "breakdown": {
    "metabolic": <0-100>,
    "cardiovascular": <0-100>,
    "weight": <0-100>,
    "adherence": <0-100>,
    "preventive": <0-100>
  },
  "top_concern": <single most important health concern, or null>,
  "positive": <single biggest positive finding, or null>
}

Score conservatively. With no data, default to 65. Chronic conditions without complications → 55-65. Well-managed conditions → 65-75. No conditions, good data → 75-90.`;

  const completion = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  let result: any;
  try {
    const raw = (completion.content[0] as any).text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch?.[0] ?? raw);
  } catch {
    result = { score: 65, grade: 'B', summary: 'Health score computed.', breakdown: { metabolic: 65, cardiovascular: 65, weight: 65, adherence: 65, preventive: 65 }, top_concern: null, positive: null };
  }

  // Upsert into health_scores table
  await supabase.from('health_scores').upsert({
    family_member_id,
    score: result.score,
    grade: result.grade,
    breakdown: result.breakdown,
    summary: result.summary,
    top_concern: result.top_concern,
    positive: result.positive,
    computed_at: new Date().toISOString(),
  }, { onConflict: 'family_member_id' });

  return jsonResponse(result);
});
