import streamlit as st
import requests
import pandas as pd
from sqlalchemy import text

# 1. Setup & Memory
st.set_page_config(page_title="CryptoCoach", page_icon="💰", layout="wide")


# --- LOGIN ---
if not st.user.is_logged_in:
    st.title("CryptoCoach")
    st.write("Sign in with your Google account to access your virtual portfolio.")
    if st.button("Sign in with Google"):
        st.login()
    st.stop()

# --- DATABASE ---
conn = st.connection("supabase", type="sql")
email = st.user.email

with conn.session as s:
    s.execute(
        text("insert into users (email, name) values (:email, :name) on conflict (email) do nothing;"),
        {"email": email, "name": st.user.name},
    )
    s.commit()

user = conn.query("select cash from users where email = :email;", params={"email": email}, ttl=0)
st.session_state.balance = float(user["cash"].iloc[0])
holdings = conn.query("select coin, amount from holdings where email = :email;", params={"email": email}, ttl=0)
st.session_state.portfolio = {"bitcoin": 0.0, "ethereum": 0.0, "solana": 0.0}
for _, row in holdings.iterrows():
    st.session_state.portfolio[row["coin"]] = float(row["amount"])

# Custom CSS for Dark Mode visibility
st.markdown("""
    <style>
    .stMetric { border: 1px solid #4e4e4e; padding: 15px; border-radius: 10px; background-color: rgba(255,255,255,0.05); }
    .welcome-text { font-size: 1.5rem; font-weight: bold; color: #FF4B4B; margin-bottom: 20px; }
    .portfolio-box { padding: 10px; border-radius: 5px; background-color: #262730; margin-bottom: 10px; border-left: 5px solid #FF4B4B; }
    </style>
    """, unsafe_allow_html=True)

st.title("CryptoCoach 🚀")
st.markdown('<p class="welcome-text">Welcome! Learn everything about crypto without spending a single cent.</p>', unsafe_allow_html=True)

# 2. Function to get Live Prices
@st.cache_data(ttl=60)
def get_crypto_price(coin_id):
    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        return requests.get(url, timeout=3).json()[coin_id]['usd']
    except:
        backup = {"bitcoin": 65230, "ethereum": 3410, "solana": 145}
        return backup.get(coin_id)
   
@st.cache_data(ttl=300)
def get_price_history(coin_id, days=7):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
    reponse = requests.get(url, timeout=5)
    reponse.raise_for_status()
    donnees = reponse.json()
    df = pd.DataFrame(donnees["prices"], columns=["date", "prix"])
    df["date"] = pd.to_datetime(df["date"], unit="ms")
    return df

def buy(email, coin, amount_usd, price):
    quantity = amount_usd / price
    params = {"email": email, "coin": coin, "qty": quantity, "price": price, "amount": amount_usd}
    with conn.session as s:
        s.execute(text("update users set cash = cash - :amount where email = :email;"), params)
        s.execute(text("""
            insert into holdings (email, coin, amount) values (:email, :coin, :qty)
            on conflict (email, coin) do update set amount = holdings.amount + excluded.amount;
        """), params)
        s.execute(text("""
            insert into transactions (email, coin, side, quantity, price, total)
            values (:email, :coin, 'buy', :qty, :price, :amount);
        """), params)
        s.commit()
    return quantity

def sell(email, coin, quantity, price):
    amount_usd = quantity * price
    params = {"email": email, "coin": coin, "qty": quantity, "price": price, "amount": amount_usd}
    with conn.session as s:
        s.execute(text("update users set cash = cash + :amount where email = :email;"), params)
        s.execute(text("update holdings set amount = amount - :qty where email = :email and coin = :coin;"), params)
        s.execute(text("""
            insert into transactions (email, coin, side, quantity, price, total)
            values (:email, :coin, 'sell', :qty, :price, :amount);
        """), params)
        s.commit()
    return amount_usd

def reset_account(email):
    params = {"email": email}
    with conn.session as s:
        s.execute(text("update users set cash = 10000 where email = :email;"), params)
        s.execute(text("delete from holdings where email = :email;"), params)
        s.execute(text("delete from transactions where email = :email;"), params)
        s.commit()



def get_average_cost(email, coin):
    # Average price paid for this coin, across all of this user's purchases.
    result = conn.query("""
        select sum(total) / sum(quantity) as avg_cost
        from transactions
        where email = :email and coin = :coin and side = 'buy';
    """, params={"email": email, "coin": coin}, ttl=0)
    avg = result["avg_cost"].iloc[0]
    if pd.isna(avg):
        return None
    return float(avg)


def get_transactions(email):
    return conn.query("""
        select created_at, side, coin, quantity, price, total
        from transactions
        where email = :email
        order by created_at desc;
    """, params={"email": email}, ttl=0)


def buy_feedback(coin, quantity, price, amount_usd, cash_before, avg_cost_before):
    message = f"You bought {quantity:.5f} {coin.upper()} at ${price:,.2f}."
    if amount_usd > 0.5 * cash_before:
        tip = ("You just put more than half of your cash into a single trade. "
               "Buying in several smaller steps (DCA) reduces the risk of buying right before a drop.")
    elif avg_cost_before is not None and price < avg_cost_before:
        tip = (f"You bought below your average price (${avg_cost_before:,.2f}), which lowers it. "
               "Only do this if you still believe in the asset, not just to 'get your money back'.")
    elif avg_cost_before is not None:
        tip = (f"You already own {coin.capitalize()}: this purchase raises your exposure to one asset. "
               "Spreading your money across several assets limits the damage if one of them crashes.")
    else:
        tip = ("Before buying, set yourself a rule: at what price would you take profits, "
               "and at what loss would you exit? Deciding in advance avoids emotional choices.")
    return "info", message, tip


def sell_feedback(coin, quantity, price, received, avg_cost):
    if avg_cost is None:
        return "info", f"You sold {quantity:.5f} {coin.upper()} for ${received:,.2f}.", ""
    pnl = (price - avg_cost) * quantity
    pnl_pct = (price / avg_cost - 1) * 100
    message = (f"You sold {quantity:.5f} {coin.upper()} for ${received:,.2f}. "
               f"You had paid ${avg_cost:,.2f} on average, so this sale is a "
               f"{'gain' if pnl >= 0 else 'loss'} of ${abs(pnl):,.2f} ({pnl_pct:+.2f}%).")
    if pnl >= 0:
        tip = ("Taking part of your profits is a healthy habit. "
               "In real life, remember that crypto gains are taxable and platforms charge fees.")
        return "success", message, tip
    tip = ("Selling after a drop locks in the loss. Ask yourself: has your reason for buying changed, "
           "or are you selling out of fear? Panic selling is the most common beginner mistake.")
    return "warning", message, tip


# --- USER ACCOUNT ---
st.sidebar.write(f"Signed in as **{st.user.name}**")
if st.sidebar.button("Log out"):
    st.logout()

# --- SIDEBAR: YOUR REAL-TIME WALLET ---
st.sidebar.header("🎒 Your Live Wallet")
st.sidebar.metric("Cash (USD)", f"${st.session_state.balance:,.2f}")

st.sidebar.write("---")
st.sidebar.subheader("My Assets")

total_crypto_value = 0.0
has_assets = False

for coin, amount in st.session_state.portfolio.items():
    if amount > 0:
        has_assets = True
        current_p = get_crypto_price(coin)
        value_in_usd = amount * current_p
        total_crypto_value += value_in_usd
        
        # Gain or loss compared with the average buy price
        avg_cost = get_average_cost(email, coin)
        if avg_cost:
            pnl = (current_p - avg_cost) * amount
            pnl_pct = (current_p / avg_cost - 1) * 100
            pnl_color = "#00C853" if pnl >= 0 else "#FF5252"
            pnl_line = f'<span style="color: {pnl_color};">{pnl:+,.2f} $ ({pnl_pct:+.2f}%)</span>'
        else:
            pnl_line = ""

        # Display each coin with its current value
        st.sidebar.markdown(f"""
        <div class="portfolio-box">
            <b>{coin.capitalize()}</b>: {amount:.5f}<br>
            Value: ${value_in_usd:,.2f}<br>
            {pnl_line}
        </div>
        """, unsafe_allow_html=True)

if not has_assets:
    st.sidebar.caption("Your wallet is empty. Start trading!")

st.sidebar.write("---")
# TOTAL NET WORTH (Cash + Crypto Value)
net_worth = st.session_state.balance + total_crypto_value
st.sidebar.metric("Total Net Worth", f"${net_worth:,.2f}", delta=f"{((net_worth/10000)-1)*100:.2f}%")

if st.sidebar.button("Reset Account"):
    reset_account(email)
    st.rerun()

# --- TABS ---
tab1, tab_history, tab2, tab3 = st.tabs(["📈 SIMULATOR", "📜 HISTORY", "📚 ACADEMY", "📰 NEWS"])

with tab1:
    col1, col2 = st.columns([2, 1])
    
    with col2:
        st.subheader("Market Action")
        choice = st.selectbox("Select asset", ["bitcoin", "ethereum", "solana"])
        price = get_crypto_price(choice)
        st.metric(f"Current {choice.capitalize()} Price", f"${price:,}")

        side = st.radio("Action", ["Buy", "Sell"], horizontal=True)

        # Coaching feedback on the last trade (kept after the page reloads)
        if "last_trade" in st.session_state:
            level, message, tip = st.session_state.pop("last_trade")
            getattr(st, level)(message)
            if tip:
                st.caption(f"💡 Coach tip: {tip}")

        if side == "Buy":
            max_spend = float(st.session_state.balance)
            if max_spend > 0:
                amount_to_spend = st.slider("Investment amount ($)", 0.0, max_spend, min(1000.0, max_spend))

                if st.button("🚀 CONFIRM PURCHASE"):
                    if amount_to_spend > 0:
                        avg_cost_before = get_average_cost(email, choice)
                        quantity = buy(email, choice, amount_to_spend, price)
                        st.session_state.last_trade = buy_feedback(
                            choice, quantity, price, amount_to_spend, max_spend, avg_cost_before
                        )
                        st.rerun()
            else:
                st.error("No cash left! Use the Reset button.")

        else:
            owned = st.session_state.portfolio[choice]
            if owned > 0:
                quantity_to_sell = st.slider(
                    f"Quantity to sell ({choice.upper()})",
                    0.0, owned, owned,
                    step=0.000001, format="%.6f",
                )
                st.caption(f"You will receive about ${quantity_to_sell * price:,.2f}")

                if st.button("💸 CONFIRM SALE"):
                    if quantity_to_sell > 0:
                        avg_cost = get_average_cost(email, choice)
                        received = sell(email, choice, quantity_to_sell, price)
                        st.session_state.last_trade = sell_feedback(
                            choice, quantity_to_sell, price, received, avg_cost
                        )
                        st.rerun()
            else:
                st.info(f"You don't own any {choice.capitalize()} yet.")

    with col1:
        st.subheader(f"{choice.capitalize()} — Last 7 days")
        try:
            historique = get_price_history(choice)
            st.line_chart(historique, x="date", y="prix")
        except Exception:
            st.warning("Price history is temporarily unavailable. Please try again in a minute.")

        # Dashboard Summary
        c1, c2 = st.columns(2)
        c1.metric("Crypto Assets Value", f"${total_crypto_value:,.2f}")
        c2.metric("Cash Left", f"${st.session_state.balance:,.2f}")

with tab_history:
    st.subheader("Your transactions")
    history = get_transactions(email)

    if history.empty:
        st.info("No transactions yet. Make your first trade in the Simulator tab!")
    else:
        # Quick summary
        buys = history[history["side"] == "buy"]
        sells = history[history["side"] == "sell"]
        h1, h2, h3 = st.columns(3)
        h1.metric("Trades", len(history))
        h2.metric("Total bought", f"${buys['total'].sum():,.2f}")
        h3.metric("Total sold", f"${sells['total'].sum():,.2f}")

        # Readable table
        table = history.copy()
        table["created_at"] = pd.to_datetime(table["created_at"], utc=True).dt.tz_convert("Europe/Paris").dt.strftime("%d/%m/%Y %H:%M")
        table["side"] = table["side"].map({"buy": "🟢 Buy", "sell": "🔴 Sell"})
        table["coin"] = table["coin"].str.capitalize()
        table = table.rename(columns={
            "created_at": "Date", "side": "Type", "coin": "Asset",
            "quantity": "Quantity", "price": "Price ($)", "total": "Total ($)",
        })
        st.dataframe(
            table,
            hide_index=True,
            use_container_width=True,
            column_config={
                "Quantity": st.column_config.NumberColumn(format="%.6f"),
                "Price ($)": st.column_config.NumberColumn(format="$%.2f"),
                "Total ($)": st.column_config.NumberColumn(format="$%.2f"),
            },
        )

with tab2:
    st.subheader("🎓 Academy: Master the Market")
    st.markdown("### 📝 INTERACTIVE QUIZ: FOMO")
    q1 = st.radio("A friend tells you to buy a coin because 'it's going to the moon'. What do you do?", 
                 ["Invest everything!", "Do my own research and stay calm."])
    if st.button("Check Answer"):
        if "research" in q1: st.success("Correct! DYOR (Do Your Own Research) is key.")
        else: st.error("Wrong! That's how most beginners lose money.")

with tab3:
    st.subheader("📰 Crypto News & Tips")
    st.write("🔔 **Market Tip**: High volatility is normal. Don't panic sell.")
    st.write("🔔 **Security**: Always use Two-Factor Authentication (2FA).")