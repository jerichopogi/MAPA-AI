-- AI booking suggestions saved with each trip, and a usage type for "Where should I go?".

alter table public.trips add column booking_suggestions jsonb;

alter table public.ai_usage drop constraint ai_usage_feature_check;
alter table public.ai_usage add constraint ai_usage_feature_check
  check (feature in ('trip', 'visa', 'local', 'chat', 'ideas'));
