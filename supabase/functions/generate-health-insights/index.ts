import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';
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

  // Verify member belongs to user
  const { data: member, error: memberErr } = await supabase
    .from('family_members')
    .select('name, date_of_birth, gender, height_cm, weight_kg, relationship')
    .eq('id', family_member_id)
    .eq('user_id', userId)
    .single();

  if (memberErr || !member) return errorResponse('Family member not found', 404);

  // Documents with AI analysis (last 20, all types)
  const { data: documents } = await supabase
    .from('documents')
    .select('title, document_type, ai_analysis, created_at')
    .eq('family_member_id', family_member_id)
    .not('ai_analysis', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!documents || documents.length === 0) {
    return errorResponse('No analysed documents found. Upload and process documents first.', 422);
  }

  // Active medications
  const { data: medications } = await supabase
    .from('medications')
    .select('name, dosage, frequency, start_date, notes')
    .eq('family_member_id', family_member_id)
    .eq('is_active', true);

  // Medication adherence last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: medLogs } = await supabase
    .from('medication_logs')
    .select('status, medication_id, scheduled_time')
    .eq('family_member_id', family_member_id)
    .gte('created_at', thirtyDaysAgo);

  const ageYears = member.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bmi = member.height_cm && member.weight_kg
    ? (member.weight_kg / ((member.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const logs = medLogs ?? [];
  const taken = logs.filter((l: any) => l.status === 'taken').length;
  const adherencePct = logs.length > 0 ? Math.round((taken / logs.length) * 100) : null;

  const prompt = `You are a clinical health analyst reviewing a patient's longitudinal health records. Analyse trends across multiple documents over time and surface actionable insights.

PATIENT:
- Name: ${member.name} (${member.relationship ?? 'Family member'})
- Age: ${ageYears ?? 'Unknown'} | Gender: ${member.gender ?? 'Unknown'}
- BMI: ${bmi ?? 'Unknown'}

HEALTH DOCUMENTS (most recent first, ${(documents ?? []).length} total):
${(documents ?? []).map((d: any, i: number) => {
  const a = d.ai_analysis as any;
  return `[${i + 1}] ${d.document_type} — "${d.title}" (${new Date(d.created_at).toLocaleDateString('en-IN')})
  Summary: ${a?.summary ?? 'No summary'}
  Lab values: ${JSON.stringify(a?.lab_values ?? a?.findings ?? 'None')}
  Recommendations: ${JSON.stringify(a?.recommendations ?? 'None')}`;
}).join('\n\n')}

ACTIVE MEDICATIONS:
${(medications ?? []).length > 0
  ? (medications ?? []).map((m: any) => `- ${m.name}${m.dosage ? ` ${m.dosage}` : ''} (${m.frequency ?? 'as prescribed'}) — since ${m.start_date ?? 'unknown'}`).join('\n')
  : 'None'}

MEDICATION ADHERENCE (last 30 days):
${adherencePct !== null ? `${adherencePct}% (${taken} of ${logs.length} doses taken)` : 'No adherence data'}

Analyse the data above and return ONLY valid JSON with this exact structure:
{
  "summary": "<2-3 sentence overall health narrative based on the documents>",
  "improving": [
    { "marker": "<lab marker or health metric>", "value": "<latest value + unit>", "trend": "<e.g. ↓ from 8.2 to 7.1>" }
  ],
  "declining": [
    { "marker": "<lab marker or health metric>", "value": "<latest value + unit>", "trend": "<e.g. ↑ from 130 to 145>" }
  ],
  "stable": [
    { "marker": "<lab marker or health metric>", "value": "<current value + unit>" }
  ],
  "recommendations": [
    "<specific, actionable recommendation based on the data — max 8>"
  ]
}

Rules:
- Only include markers that actually appear in the documents. Do not fabricate values.
- Trend must compare the most recent value to a previous value if multiple documents are available.
- Improving = values moving toward healthy range. Declining = values moving away from healthy range. Stable = no meaningful change.
- Recommendations should be specific and reference the actual data (e.g. "HbA1c dropped to 7.1 — continue current Metformin dose and retest in 3 months").
- Include medication adherence in recommendations if data is available.
- Use Indian medical conventions where relevant (e.g. haemoglobin, creatinine).`;

  const completion = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  let result: any;
  try {
    const raw = (completion.content[0] as any).text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch?.[0] ?? raw);
  } catch {
    return errorResponse('Failed to parse AI response. Please try again.', 500);
  }

  // Persist to ai_health_insights table.
  // `insights` stores the full blob; flat columns (added via migration) are
  // what the mobile screen queries directly (e.g. pi.summary).
  await supabase.from('ai_health_insights').insert({
    user_id: userId,
    family_member_id,
    insights: result,
    summary: result.summary,
    improving: result.improving ?? [],
    declining: result.declining ?? [],
    stable: result.stable ?? [],
    recommendations: result.recommendations ?? [],
    status: 'complete',
  });

  return jsonResponse(result);
});
