-- ============================================================
-- PrakritAI — Supabase Database Schema
-- Run this in the Supabase SQL Editor (new project)
-- Order matters: run top to bottom
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- One row per auth.users entry
-- ============================================================
create table public.profiles (
  id                uuid primary key references auth.users on delete cascade,
  display_name      text,
  phone             text unique,
  avatar_url        text,
  expo_push_token   text,
  language          text not null default 'en',
  notification_prefs jsonb not null default '{
    "medication_reminders": true,
    "critical_alerts": true,
    "weekly_insights": true,
    "circle_requests": true
  }'::jsonb,
  onboarding_complete boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
create table public.family_members (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  name            text not null,
  date_of_birth   date,
  gender          text check (gender in ('Female', 'Male', 'Other', 'Prefer not to say')),
  blood_type      text check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown')),
  relationship    text check (relationship in ('Self','Spouse','Parent','Child','Sibling','Other')),
  height_cm       numeric check (height_cm between 50 and 250),
  weight_kg       numeric check (weight_kg between 10 and 300),
  profile_photo_url text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_family_members_user_id on public.family_members(user_id);

alter table public.family_members enable row level security;

create policy "Users can manage own family members"
  on public.family_members for all
  using (auth.uid() = user_id);

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table public.documents (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid references public.family_members on delete set null,
  title           text not null,
  document_type   text check (document_type in ('Lab Report','Prescription','Scan','Hospital Discharge','Other')),
  file_url        text not null,
  file_size_bytes integer,
  mime_type       text,
  thumbnail_url   text,
  ai_analysis     jsonb,            -- {summary, findings, lab_values, medications, recommendations}
  ai_processed_at timestamptz,
  upload_source   text check (upload_source in ('camera','gallery','files')),
  created_at      timestamptz not null default now()
);

create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_family_member_id on public.documents(family_member_id);
create index idx_documents_created_at on public.documents(created_at desc);

alter table public.documents enable row level security;

create policy "Users can manage own documents"
  on public.documents for all
  using (auth.uid() = user_id);

-- ============================================================
-- MEDICATIONS
-- ============================================================
create table public.medications (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid not null references public.family_members on delete cascade,
  name            text not null,
  dosage          text,
  form            text check (form in ('Tablet','Capsule','Syrup','Injection','Topical','Other')),
  frequency       text check (frequency in ('Once daily','Twice daily','Three times daily','As needed','Custom')),
  times_of_day    text[] default '{}',    -- ['Morning','Afternoon','Evening','Bedtime']
  with_food       text check (with_food in ('Yes','No','Doesn''t matter')),
  start_date      date not null,
  end_date        date,
  notes           text,
  reminder_enabled boolean not null default true,
  is_active       boolean not null default true,
  interaction_warnings jsonb,           -- AI-flagged drug interactions
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_medications_user_id on public.medications(user_id);
create index idx_medications_family_member_id on public.medications(family_member_id);
create index idx_medications_is_active on public.medications(is_active);

alter table public.medications enable row level security;

create policy "Users can manage own medications"
  on public.medications for all
  using (auth.uid() = user_id);

-- ============================================================
-- MEDICATION LOGS (adherence tracking)
-- ============================================================
create table public.medication_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  medication_id   uuid not null references public.medications on delete cascade,
  family_member_id uuid not null references public.family_members on delete cascade,
  scheduled_time  timestamptz not null,
  taken_at        timestamptz,
  status          text not null check (status in ('taken','missed','skipped')),
  created_at      timestamptz not null default now()
);

create index idx_medication_logs_medication_id on public.medication_logs(medication_id);
create index idx_medication_logs_scheduled_time on public.medication_logs(scheduled_time desc);

alter table public.medication_logs enable row level security;

create policy "Users can manage own medication logs"
  on public.medication_logs for all
  using (auth.uid() = user_id);

-- ============================================================
-- EMERGENCY INFO
-- ============================================================
create table public.emergency_info (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid not null unique references public.family_members on delete cascade,
  allergies       jsonb not null default '[]'::jsonb,   -- [{name, severity: 'Mild'|'Moderate'|'Severe'}]
  conditions      text[] default '{}',
  emergency_contacts jsonb not null default '[]'::jsonb, -- [{name, relationship, phone, priority}]
  public_token    uuid unique default uuid_generate_v4(),  -- for QR code / public page
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_emergency_info_user_id on public.emergency_info(user_id);
create index idx_emergency_info_public_token on public.emergency_info(public_token);

alter table public.emergency_info enable row level security;

create policy "Users can manage own emergency info"
  on public.emergency_info for all
  using (auth.uid() = user_id);

-- Public read for emergency page (no auth required)
create policy "Public can read emergency info by token"
  on public.emergency_info for select
  using (public_token is not null);

-- ============================================================
-- TIMELINE ENTRIES
-- ============================================================
create table public.timeline_entries (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid not null references public.family_members on delete cascade,
  entry_type      text not null check (entry_type in (
    'lab_test','prescription','doctor_visit','hospital_visit','manual_note',
    'medication_started','medication_stopped','alert_triggered'
  )),
  title           text not null,
  description     text,
  related_document_id uuid references public.documents on delete set null,
  related_medication_id uuid references public.medications on delete set null,
  occurred_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index idx_timeline_entries_user_id on public.timeline_entries(user_id);
create index idx_timeline_entries_family_member_id on public.timeline_entries(family_member_id);
create index idx_timeline_entries_occurred_at on public.timeline_entries(occurred_at desc);

alter table public.timeline_entries enable row level security;

create policy "Users can manage own timeline entries"
  on public.timeline_entries for all
  using (auth.uid() = user_id);

-- ============================================================
-- AI CHAT
-- ============================================================
create table public.ai_chat_conversations (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid references public.family_members on delete set null,
  title           text,
  created_at      timestamptz not null default now()
);

create table public.ai_chat_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.ai_chat_conversations on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  attachment_url  text,
  created_at      timestamptz not null default now()
);

create index idx_ai_chat_conversations_user_id on public.ai_chat_conversations(user_id);
create index idx_ai_chat_messages_conversation_id on public.ai_chat_messages(conversation_id);

alter table public.ai_chat_conversations enable row level security;
alter table public.ai_chat_messages enable row level security;

create policy "Users can manage own conversations"
  on public.ai_chat_conversations for all
  using (auth.uid() = user_id);

create policy "Users can manage own messages"
  on public.ai_chat_messages for all
  using (
    exists (
      select 1 from public.ai_chat_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ============================================================
-- HEALTH INSIGHTS
-- ============================================================
create table public.ai_health_insights (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid references public.family_members on delete cascade,
  session_name    text,
  document_ids    uuid[] default '{}',
  insights        jsonb,    -- {summary, improving, declining, stable, recommendations}
  status          text check (status in ('processing','complete','error')) default 'processing',
  created_at      timestamptz not null default now()
);

create index idx_ai_health_insights_user_id on public.ai_health_insights(user_id);

alter table public.ai_health_insights enable row level security;

create policy "Users can manage own insights"
  on public.ai_health_insights for all
  using (auth.uid() = user_id);

-- ============================================================
-- HEALTH SCORES (cached)
-- ============================================================
create table public.health_scores (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid not null references public.family_members on delete cascade,
  score           numeric not null check (score between 0 and 100),
  grade           text not null check (grade in ('A','B','C','D')),
  breakdown       jsonb not null default '{}'::jsonb,  -- {metabolic: 72, cardiovascular: 65, ...}
  computed_at     timestamptz not null default now()
);

create index idx_health_scores_family_member_id on public.health_scores(family_member_id);

alter table public.health_scores enable row level security;

create policy "Users can manage own health scores"
  on public.health_scores for all
  using (auth.uid() = user_id);

-- ============================================================
-- PERSONALIZED PROTOCOLS
-- ============================================================
create table public.protocols (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  family_member_id uuid not null references public.family_members on delete cascade,
  title           text not null,
  duration_days   integer not null default 30,
  tasks           jsonb not null default '[]'::jsonb,  -- [{id, week, title, description}]
  start_date      date not null default current_date,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table public.protocol_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  protocol_id     uuid not null references public.protocols on delete cascade,
  task_id         text not null,
  completed_at    timestamptz not null default now(),
  notes           text
);

create index idx_protocols_family_member_id on public.protocols(family_member_id);
create index idx_protocol_logs_protocol_id on public.protocol_logs(protocol_id);

alter table public.protocols enable row level security;
alter table public.protocol_logs enable row level security;

create policy "Users can manage own protocols"
  on public.protocols for all using (auth.uid() = user_id);

create policy "Users can manage own protocol logs"
  on public.protocol_logs for all using (auth.uid() = user_id);

-- ============================================================
-- FAMILY CIRCLE — INVITE SYSTEM
-- ============================================================
create table public.circle_invites (
  id              uuid primary key default uuid_generate_v4(),
  host_user_id    uuid not null references public.profiles on delete cascade,
  token           uuid unique not null default uuid_generate_v4(),
  expires_at      timestamptz not null default (now() + interval '48 hours'),
  used            boolean not null default false,
  used_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_circle_invites_host_user_id on public.circle_invites(host_user_id);
create index idx_circle_invites_token on public.circle_invites(token);

alter table public.circle_invites enable row level security;

create policy "Users can manage own invites"
  on public.circle_invites for all
  using (auth.uid() = host_user_id);

-- Public read to validate token (no auth)
create policy "Anyone can read invite by token"
  on public.circle_invites for select
  using (true);

-- ============================================================
-- FAMILY CIRCLE — JOIN REQUESTS
-- ============================================================
create table public.circle_requests (
  id              uuid primary key default uuid_generate_v4(),
  invite_id       uuid not null references public.circle_invites on delete cascade,
  requester_user_id uuid not null references public.profiles on delete cascade,
  status          text not null check (status in ('pending','accepted','declined')) default 'pending',
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_circle_requests_invite_id on public.circle_requests(invite_id);
create index idx_circle_requests_requester_user_id on public.circle_requests(requester_user_id);

alter table public.circle_requests enable row level security;

create policy "Host can manage requests for their invites"
  on public.circle_requests for all
  using (
    exists (
      select 1 from public.circle_invites i
      where i.id = invite_id and i.host_user_id = auth.uid()
    )
  );

create policy "Requester can see own requests"
  on public.circle_requests for select
  using (auth.uid() = requester_user_id);

-- ============================================================
-- FAMILY CIRCLE — ACTIVE CONNECTIONS
-- ============================================================
create table public.circle_connections (
  id              uuid primary key default uuid_generate_v4(),
  user_a_id       uuid not null references public.profiles on delete cascade,
  user_b_id       uuid not null references public.profiles on delete cascade,
  connected_at    timestamptz not null default now(),
  revoked_at      timestamptz,
  revoked_by      uuid references public.profiles,
  unique(user_a_id, user_b_id)
);

create index idx_circle_connections_user_a on public.circle_connections(user_a_id);
create index idx_circle_connections_user_b on public.circle_connections(user_b_id);

alter table public.circle_connections enable row level security;

create policy "Users can see their own connections"
  on public.circle_connections for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can update connections they're part of"
  on public.circle_connections for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "System can insert connections"
  on public.circle_connections for insert
  with check (auth.uid() = user_a_id);

-- ============================================================
-- DOCTOR ACCESS (share records with doctor)
-- ============================================================
create table public.doctor_access_codes (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  code            text unique not null,   -- PRK-XXXX-XXXX format
  doctor_name     text,
  expires_at      timestamptz not null default (now() + interval '72 hours'),
  is_active       boolean not null default true,
  used_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_doctor_access_codes_user_id on public.doctor_access_codes(user_id);
create index idx_doctor_access_codes_code on public.doctor_access_codes(code);

alter table public.doctor_access_codes enable row level security;

create policy "Users can manage own access codes"
  on public.doctor_access_codes for all
  using (auth.uid() = user_id);

-- ============================================================
-- WHATSAPP (for future WhatsApp bot)
-- ============================================================
create table public.whatsapp_conversations (
  id              uuid primary key default uuid_generate_v4(),
  phone_number    text not null unique,
  user_id         uuid references public.profiles on delete set null,
  messages        jsonb not null default '[]'::jsonb,
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.whatsapp_conversations enable row level security;

-- Service role only (edge function uses service role key)
create policy "Service role only"
  on public.whatsapp_conversations for all
  using (false);  -- no direct client access; all through edge functions

-- ============================================================
-- UPDATED_AT AUTO-TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.family_members
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.medications
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.emergency_info
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- AUTO-CREATE TIMELINE ENTRY ON DOCUMENT UPLOAD
-- ============================================================
create or replace function public.create_timeline_on_document()
returns trigger language plpgsql security definer as $$
begin
  if new.family_member_id is not null then
    insert into public.timeline_entries
      (user_id, family_member_id, entry_type, title, related_document_id, occurred_at)
    values
      (new.user_id, new.family_member_id,
       case when new.document_type = 'Prescription' then 'prescription' else 'lab_test' end,
       new.title, new.id, new.created_at);
  end if;
  return new;
end;
$$;

create trigger on_document_created
  after insert on public.documents
  for each row execute procedure public.create_timeline_on_document();

-- ============================================================
-- AUTO-CREATE TIMELINE ENTRY ON MEDICATION ADDED
-- ============================================================
create or replace function public.create_timeline_on_medication()
returns trigger language plpgsql security definer as $$
begin
  insert into public.timeline_entries
    (user_id, family_member_id, entry_type, title, related_medication_id, occurred_at)
  values
    (new.user_id, new.family_member_id, 'medication_started',
     new.name || ' ' || coalesce(new.dosage, ''), new.id, new.created_at);
  return new;
end;
$$;

create trigger on_medication_created
  after insert on public.medications
  for each row execute procedure public.create_timeline_on_medication();

-- ============================================================
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard → Storage → New bucket
-- Or via API; listed here for reference
-- ============================================================
-- Bucket: "documents"   → private, max file size 20MB
-- Bucket: "avatars"     → public,  max file size 2MB
-- Bucket: "thumbnails"  → public,  max file size 500KB
