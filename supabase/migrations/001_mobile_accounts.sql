-- CryptoCoach: let the mobile app read and write each user's own data safely.
-- The app signs users in with Supabase Auth (Google). Every rule below says:
-- "you can only touch the rows whose email is YOUR email" (Row Level Security).
-- The Streamlit app is not affected: it connects directly as the database owner.

-- 1. Lesson rewards (extra virtual cash), tracked apart from trading gains
alter table users add column if not exists rewards numeric not null default 0;

-- 2. Row Level Security policies: each signed-in user sees only their own rows
create policy "own user row" on users for all to authenticated
  using (email = auth.jwt() ->> 'email') with check (email = auth.jwt() ->> 'email');
create policy "own holdings" on holdings for all to authenticated
  using (email = auth.jwt() ->> 'email') with check (email = auth.jwt() ->> 'email');
create policy "own transactions" on transactions for all to authenticated
  using (email = auth.jwt() ->> 'email') with check (email = auth.jwt() ->> 'email');
create policy "own lesson progress" on lesson_progress for all to authenticated
  using (email = auth.jwt() ->> 'email') with check (email = auth.jwt() ->> 'email');

-- 3. Functions called by the app. Each one runs as ONE transaction:
--    either everything is saved, or nothing is (same idea as buy() in Streamlit).

-- Create the user's row the first time they sign in
create or replace function ensure_user(p_name text) returns void
language sql security invoker as $$
  insert into users (email, name) values (auth.jwt() ->> 'email', p_name)
  on conflict (email) do nothing;
$$;

-- Buy: check the cash on the server, then update cash + holdings + history
create or replace function buy_crypto(p_coin text, p_amount numeric, p_price numeric) returns void
language plpgsql security invoker as $$
declare
  v_email text := auth.jwt() ->> 'email';
  v_qty numeric := p_amount / p_price;
begin
  if p_amount <= 0 or p_price <= 0 then raise exception 'Montant invalide'; end if;
  update users set cash = cash - p_amount where email = v_email and cash >= p_amount;
  if not found then raise exception 'Cash insuffisant'; end if;
  insert into holdings (email, coin, amount) values (v_email, p_coin, v_qty)
    on conflict (email, coin) do update set amount = holdings.amount + excluded.amount;
  insert into transactions (email, coin, side, quantity, price, total)
    values (v_email, p_coin, 'buy', v_qty, p_price, p_amount);
end;
$$;

-- Sell: check the quantity owned on the server, then update everything
create or replace function sell_crypto(p_coin text, p_quantity numeric, p_price numeric) returns void
language plpgsql security invoker as $$
declare
  v_email text := auth.jwt() ->> 'email';
  v_total numeric := p_quantity * p_price;
begin
  if p_quantity <= 0 or p_price <= 0 then raise exception 'Quantité invalide'; end if;
  update holdings set amount = amount - p_quantity
    where email = v_email and coin = p_coin and amount >= p_quantity - 0.000000001;
  if not found then raise exception 'Quantité insuffisante'; end if;
  update users set cash = cash + v_total where email = v_email;
  insert into transactions (email, coin, side, quantity, price, total)
    values (v_email, p_coin, 'sell', p_quantity, p_price, v_total);
end;
$$;

-- Finish a lesson: keep the best score, and give the cash reward only the first time
create or replace function complete_lesson(p_lesson_id text, p_score int, p_xp int, p_reward numeric) returns boolean
language plpgsql security invoker as $$
declare
  v_email text := auth.jwt() ->> 'email';
  v_first boolean := not exists (select 1 from lesson_progress where email = v_email and lesson_id = p_lesson_id);
begin
  insert into lesson_progress (email, lesson_id, score, xp) values (v_email, p_lesson_id, p_score, p_xp)
    on conflict (email, lesson_id) do update set
      score = greatest(lesson_progress.score, excluded.score),
      xp = greatest(lesson_progress.xp, excluded.xp),
      completed_at = now();
  if v_first then
    update users set cash = cash + p_reward, rewards = rewards + p_reward where email = v_email;
  end if;
  return v_first;
end;
$$;

-- Start over: 10 000 $, no crypto, empty history (lesson progress is kept)
create or replace function reset_portfolio() returns void
language plpgsql security invoker as $$
declare
  v_email text := auth.jwt() ->> 'email';
begin
  update users set cash = 10000, rewards = 0 where email = v_email;
  delete from holdings where email = v_email;
  delete from transactions where email = v_email;
end;
$$;
