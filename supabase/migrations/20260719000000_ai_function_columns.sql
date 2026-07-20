-- Add top-level columns to ai_health_insights so the mobile app can
-- query summary/improving/declining/stable/recommendations directly
-- without having to reach into the insights jsonb blob.

alter table public.ai_health_insights
  add column if not exists summary        text,
  add column if not exists improving      jsonb not null default '[]'::jsonb,
  add column if not exists declining      jsonb not null default '[]'::jsonb,
  add column if not exists stable         jsonb not null default '[]'::jsonb,
  add column if not exists recommendations jsonb not null default '[]'::jsonb;
