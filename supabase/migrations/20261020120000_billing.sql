-- Billing: Plus passes, payments and AI usage metering.
-- Users can only READ their own rows. All writes happen on the server with the
-- service-role key, so nobody can grant themselves Plus from the browser.

-- ---------------------------------------------------------------------------
-- Active Plus pass per user (absent row = Free plan).
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'plus' check (plan in ('plus')),
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view their own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- One row per checkout attempt.
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null check (product in ('plus_30d', 'plus_365d')),
  amount integer not null check (amount > 0), -- centavos
  currency text not null default 'PHP',
  provider text not null check (provider in ('paymongo', 'mock')),
  checkout_session_id text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_user_id_created_at_idx on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;
create policy "Users can view their own payments"
  on public.payments for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- AI usage log, for Free-plan monthly limits.
-- ---------------------------------------------------------------------------
create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  feature text not null check (feature in ('trip', 'visa', 'local', 'chat')),
  created_at timestamptz not null default now()
);

create index ai_usage_user_id_created_at_idx on public.ai_usage (user_id, created_at);

alter table public.ai_usage enable row level security;
create policy "Users can view their own AI usage"
  on public.ai_usage for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Mark a payment paid and extend the user's Plus pass, exactly once.
-- Safe to call repeatedly (webhook + success-page confirmation may both fire).
-- ---------------------------------------------------------------------------
create function public.activate_payment(p_payment_id uuid)
returns timestamptz
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid;
  v_product text;
  v_days integer;
  v_end timestamptz;
begin
  update public.payments
     set status = 'paid', paid_at = now()
   where id = p_payment_id and status = 'pending'
  returning user_id, product into v_user, v_product;

  if v_user is null then
    -- Already processed (or unknown id): just report the current period end.
    select s.current_period_end into v_end
      from public.payments p
      join public.subscriptions s on s.user_id = p.user_id
     where p.id = p_payment_id;
    return v_end;
  end if;

  v_days := case v_product when 'plus_30d' then 30 when 'plus_365d' then 365 end;

  insert into public.subscriptions (user_id, current_period_end)
  values (v_user, now() + make_interval(days => v_days))
  on conflict (user_id) do update
     set current_period_end = greatest(public.subscriptions.current_period_end, now()) + make_interval(days => v_days),
         updated_at = now()
  returning current_period_end into v_end;

  return v_end;
end;
$$;

revoke execute on function public.activate_payment(uuid) from public, anon, authenticated;
grant execute on function public.activate_payment(uuid) to service_role;
