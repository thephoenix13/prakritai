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

  const { data: member } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', family_member_id)
    .eq('user_id', userId)
    .single();
  if (!member) return errorResponse('Family member not found', 404);

  const { data: documents } = await supabase
    .from('documents')
    .select('title, document_type, ai_analysis')
    .eq('family_member_id', family_member_id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: medications } = await supabase
    .from('medications')
    .select('name, dosage, frequency, with_food')
    .eq('family_member_id', family_member_id)
    .eq('is_active', true);

  const ageYears = member.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bmi = member.height_cm && member.weight_kg
    ? (member.weight_kg / ((member.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const prompt = `You are a preventive health specialist creating a 30-day personalized health protocol.

PATIENT:
- Name: ${member.name}
- Age: ${ageYears ?? 'Unknown'} years
- Gender: ${member.gender ?? 'Unknown'}
- BMI: ${bmi ?? 'Unknown'}

RECENT DOCUMENTS:
${(documents ?? []).map((d: any) => `- ${d.document_type}: ${d.title}`).join('\n') || 'None'}

CURRENT MEDICATIONS:
${(medications ?? []).map((m: any) => `- ${m.name} ${m.dosage ?? ''}`).join('\n') || 'None'}

Create a practical, actionable 30-day health protocol. Return ONLY valid JSON:
{
  "title": <string, e.g. "30-Day Metabolic Reset">,
  "goal": <1-sentence goal>,
  "weeks": [
    {
      "week": 1,
      "theme": <string>,
      "tasks": [
        {
          "id": <"w1t1" etc>,
          "category": <"nutrition" | "exercise" | "sleep" | "monitoring" | "medication" | "mindfulness">,
          "title": <short title>,
          "description": <1-2 sentences>,
          "frequency": <"daily" | "3x/week" | "weekly" | "once">,
          "priority": <"must" | "should" | "nice">
        }
      ]
    }
  ],
  "monthly_goals": [<string>, <string>, <string>],
  "medical_disclaimer": "This protocol is for general wellness guidance only. Always consult your doctor before making changes to your health regimen."
}

Include 4 weeks. Each week 3-5 tasks. Make tasks specific to the patient's health data. Avoid advice that conflicts with their medications.`;

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
    return errorResponse('Failed to generate protocol', 500);
  }

  return jsonResponse({ protocol: result, family_member_id, generated_at: new Date().toISOString() });
});
