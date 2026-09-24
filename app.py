import streamlit as st
import requests
import pandas as pd

# 1. Setup & Memory
st.set_page_config(page_title="CryptoCoach", page_icon="💰", layout="wide")
st.caption("Made by Prizel, Camélia and Rania")

if 'balance' not in st.session_state:
    st.session_state.balance = 10000.0 
if 'portfolio' not in st.session_state:
    st.session_state.portfolio = {"bitcoin": 0.0, "ethereum": 0.0, "solana": 0.0}

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
    donnees = reponse.json()
    reponse.raise_for_status()
    df = pd.DataFrame(donnees["prices"], columns=["date", "prix"])
    df["date"] = pd.to_datetime(df["date"], unit="ms")
    return df

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
        
        # Display each coin with its current value
        st.sidebar.markdown(f"""
        <div class="portfolio-box">
            <b>{coin.capitalize()}</b>: {amount:.5f}<br>
            <span style="color: #00FF00;">Value: ${value_in_usd:,.2f}</span>
        </div>
        """, unsafe_allow_html=True)

if not has_assets:
    st.sidebar.caption("Your wallet is empty. Start trading!")

st.sidebar.write("---")
# TOTAL NET WORTH (Cash + Crypto Value)
net_worth = st.session_state.balance + total_crypto_value
st.sidebar.metric("Total Net Worth", f"${net_worth:,.2f}", delta=f"{((net_worth/10000)-1)*100:.2f}%")

if st.sidebar.button("Reset Account"):
    st.session_state.balance = 10000.0
    st.session_state.portfolio = {"bitcoin": 0.0, "ethereum": 0.0, "solana": 0.0}
    st.rerun()

# --- TABS ---
tab1, tab2, tab3 = st.tabs(["📈 SIMULATOR", "📚 ACADEMY", "📰 NEWS"])

with tab1:
    col1, col2 = st.columns([2, 1])
    
    with col2:
        st.subheader("Market Action")
        choice = st.selectbox("Select Asset to Buy", ["bitcoin", "ethereum", "solana"])
        price = get_crypto_price(choice)
        st.metric(f"Current {choice.capitalize()} Price", f"${price:,}")
        
        max_spend = float(st.session_state.balance)
        if max_spend > 0:
            amount_to_spend = st.slider("Investment amount ($)", 0.0, max_spend, min(1000.0, max_spend))
            
            if st.button("🚀 CONFIRM PURCHASE"):
                if amount_to_spend > 0:
                    st.session_state.balance -= amount_to_spend
                    st.session_state.portfolio[choice] += (amount_to_spend / price)
                    st.success(f"Success! You bought {(amount_to_spend/price):.5f} {choice.upper()}.")
                    st.balloons()
                    st.rerun()
        else:
            st.error("No cash left! Use the Reset button.")

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