-- CryptoCoach: let the mobile app use the same tables as the Streamlit app, securely.
-- Every user is identified by the email of their Google account (inside their login token).
-- Users can only READ their own rows (row level security), and they can only CHANGE data
-- through the functions below, which check everything (enough cash, enough crypto…).

alter table users add column if not exists rewards numeric not null default 0;

-- Email of the signed-in user, read from their login token
create or replace function public.current_email() returns text
language sql stable as $$ select auth.jwt() ->> 'email' $$;

-- Read access: each user sees only their own rows
drop policy if exists "read own user" on users;
create policy "read own user" on users for select to authenticated using (email = public.current_email());
drop policy if exists "read own holdings" on holdings;
create policy "read own holdings" on holdings for select to authenticated using (email = public.current_email());
drop policy if exists "read own transactions" on transactions;
create policy "read own transactions" on transactions for select to authenticated using (email = public.current_email());
drop policy if exists "read own progress" on lesson_progress;
create policy "read own progress" on lesson_progress for select to authenticated using (email = public.current_email());

-- Create the user's row the first time they sign in (10 000 $ to start)
create or replace function public.ensure_user(p_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.current_email() is null then raise exception 'Not signed in'; end if;
  insert into users (email, name) values (public.current_email(), p_name) on conflict (email) do nothing;
end $$;

-- Buy: remove cash, add the crypto, record the transaction. All or nothing.
create or replace function public.buy_coin(p_coin text, p_amount numeric, p_price numeric) returns numeric
language plpgsql security definer set search_path = public as $$
declare v_email text := public.current_email(); v_qty numeric;
begin
  if p_amount <= 0 or p_price <= 0 then raise exception 'Invalid amount'; end if;
  if (select cash from users where email = v_email) < p_amount then raise exception 'Not enough cash'; end if;
  v_qty := p_amount / p_price;
  update users set cash = cash - p_amount where email = v_email;
  insert into holdings (email, coin, amount) values (v_email, p_coin, v_qty)
    on conflict (email, coin) do update set amount = holdings.amount + excluded.amount;
  insert into transactions (email, coin, side, quantity, price, total)
    values (v_email, p_coin, 'buy', v_qty, p_price, p_amount);
  return v_qty;
end $$;

-- Sell: add cash, remove the crypto, record the transaction. All or nothing.
create or replace function public.sell_coin(p_coin text, p_quantity numeric, p_price numeric) returns numeric
language plpgsql security definer set search_path = public as $$
declare v_email text := public.current_email(); v_owned numeric; v_qty numeric; v_total numeric;
begin
  if p_quantity <= 0 or p_price <= 0 then raise exception 'Invalid quantity'; end if;
  select amount into v_owned from holdings where email = v_email and coin = p_coin;
  if v_owned is null or v_owned < p_quantity * 0.999999 then raise exception 'Not enough crypto'; end if;
  v_qty := least(p_quantity, v_owned);
  v_total := v_qty * p_price;
  update users set cash = cash + v_total where email = v_email;
  update holdings set amount = amount - v_qty where email = v_email and coin = p_coin;
  insert into transactions (email, coin, side, quantity, price, total)
    values (v_email, p_coin, 'sell', v_qty, p_price, v_total);
  return v_total;
end $$;

-- Lesson passed: keep the best result, and give the cash reward only the first time
create or replace function public.complete_lesson(p_lesson_id text, p_score int, p_xp int, p_reward numeric) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_email text := public.current_email(); v_first boolean; v_reward numeric := least(greatest(p_reward, 0), 1000);
begin
  v_first := not exists (select 1 from lesson_progress where email = v_email and lesson_id = p_lesson_id);
  insert into lesson_progress (email, lesson_id, score, xp) values (v_email, p_lesson_id, p_score, least(p_xp, 50))
    on conflict (email, lesson_id) do update set
      score = greatest(lesson_progress.score, excluded.score),
      xp = greatest(lesson_progress.xp, excluded.xp),
      completed_at = now();
  if v_first and v_reward > 0 then
    update users set cash = cash + v_reward, rewards = rewards + v_reward where email = v_email;
  end if;
  return v_first;
end $$;

-- Start over: 10 000 $, no crypto, empty history (lesson progress is kept)
create or replace function public.reset_portfolio() returns void
language plpgsql security definer set search_path = public as $$
declare v_email text := public.current_email();
begin
  update users set cash = 10000, rewards = 0 where email = v_email;
  delete from holdings where email = v_email;
  delete from transactions where email = v_email;
end $$;

-- Only signed-in users may call these functions
revoke execute on function public.ensure_user(text), public.buy_coin(text, numeric, numeric),
  public.sell_coin(text, numeric, numeric), public.complete_lesson(text, int, int, numeric),
  public.reset_portfolio() from public, anon;
grant execute on function public.ensure_user(text), public.buy_coin(text, numeric, numeric),
  public.sell_coin(text, numeric, numeric), public.complete_lesson(text, int, int, numeric),
  public.reset_portfolio() to authenticated;
