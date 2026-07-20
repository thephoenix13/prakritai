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

  const { new_medication, existing_medications } = await req.json() as {
    new_medication: string;
    existing_medications: string[];
  };

  if (!new_medication) return errorResponse('new_medication required');
  if (!existing_medications || existing_medications.length === 0) {
    return jsonResponse({ has_interaction: false, interactions: [], severity: 'none' });
  }

  const prompt = `You are a clinical pharmacist checking for drug interactions.

New medication being added: ${new_medication}
Existing medications: ${existing_medications.join(', ')}

Check for clinically significant drug interactions between the new medication and ALL existing medications.

Return ONLY valid JSON:
{
  "has_interaction": <boolean>,
  "severity": <"none" | "mild" | "moderate" | "severe">,
  "interactions": [
    {
      "drug_a": <string>,
      "drug_b": <string>,
      "severity": <"mild" | "moderate" | "severe">,
      "mechanism": <brief pharmacological mechanism>,
      "clinical_effect": <what can happen to the patient>,
      "management": <what the patient/doctor should do>
    }
  ],
  "overall_recommendation": <brief overall recommendation string>
}

Only include clinically meaningful interactions. Generic warnings not needed. If no interactions, return has_interaction: false with empty interactions array.`;

  const completion = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  let result: any;
  try {
    const raw = (completion.content[0] as any).text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch?.[0] ?? raw);
  } catch {
    result = { has_interaction: false, interactions: [], severity: 'none', overall_recommendation: 'Unable to check interactions. Please consult your pharmacist.' };
  }

  return jsonResponse(result);
});
