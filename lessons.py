"""
CryptoCoach Academy content.

Each unit contains lessons. Each lesson has:
- "cards": short explanations shown one by one (like Duolingo tips)
- "questions": the quiz that follows. Every question has a list of
  choices, the index of the correct answer, and an explanation
  shown after answering.
"""

UNITS = [
    {
        "id": "basics",
        "title": "Unit 1 · Crypto basics",
        "lessons": [
            {
                "id": "basics-1",
                "title": "What is a cryptocurrency?",
                "xp": 10,
                "cards": [
                    "A cryptocurrency is digital money that no bank or government controls. "
                    "Transactions are recorded on a public ledger called a **blockchain**.",
                    "**Bitcoin** (2009) was the first one. Since then, thousands have appeared: "
                    "Ethereum, Solana, and many more.",
                    "Its price is set only by supply and demand, which is why it can move "
                    "10% or more in a single day.",
                ],
                "questions": [
                    {
                        "question": "Who controls Bitcoin?",
                        "choices": ["A central bank", "No single entity", "The US government"],
                        "answer": 1,
                        "explanation": "Bitcoin is decentralised: the network is run by thousands of computers worldwide.",
                    },
                    {
                        "question": "What is a blockchain?",
                        "choices": ["A public ledger of transactions", "A crypto wallet", "A trading app"],
                        "answer": 0,
                        "explanation": "The blockchain records every transaction, and anyone can check it.",
                    },
                    {
                        "question": "True or false: a crypto can lose 10% of its value in one day.",
                        "choices": ["True", "False"],
                        "answer": 0,
                        "explanation": "True. That volatility is exactly why you should only invest what you can afford to lose.",
                    },
                ],
            },
            {
                "id": "basics-2",
                "title": "Bitcoin, Ethereum, Solana",
                "xp": 10,
                "cards": [
                    "**Bitcoin** is often called digital gold: a store of value with a limited supply of 21 million coins.",
                    "**Ethereum** is a platform for applications: smart contracts, NFTs, decentralised finance.",
                    "**Solana** is a faster, cheaper blockchain, popular for payments and apps, but younger and riskier.",
                ],
                "questions": [
                    {
                        "question": "How many bitcoins will ever exist?",
                        "choices": ["Unlimited", "21 million", "100 million"],
                        "answer": 1,
                        "explanation": "The supply is capped at 21 million, which is why people compare it to gold.",
                    },
                    {
                        "question": "Which blockchain is best known for smart contracts?",
                        "choices": ["Bitcoin", "Ethereum", "None of them"],
                        "answer": 1,
                        "explanation": "Ethereum popularised smart contracts: programs that run on the blockchain.",
                    },
                    {
                        "question": "True or false: a newer crypto is automatically a safer investment.",
                        "choices": ["True", "False"],
                        "answer": 1,
                        "explanation": "False. Younger projects usually carry more risk, not less.",
                    },
                ],
            },
        ],
    },
    {
        "id": "trading",
        "title": "Unit 2 · Trade without panic",
        "lessons": [
            {
                "id": "trading-1",
                "title": "FOMO and panic selling",
                "xp": 15,
                "cards": [
                    "**FOMO** (fear of missing out) is buying because everyone is talking about a coin, "
                    "often right after it has already gone up.",
                    "**Panic selling** is the opposite: selling in a hurry after a drop, which locks in the loss.",
                    "Both come from emotions. The fix is to decide your rules **before** you buy.",
                ],
                "questions": [
                    {
                        "question": "A friend says a coin is 'going to the moon'. What is the best reaction?",
                        "choices": ["Invest everything now", "Do my own research first", "Borrow money to buy more"],
                        "answer": 1,
                        "explanation": "DYOR: Do Your Own Research. Hype is not a strategy.",
                    },
                    {
                        "question": "Your crypto drops 15% in a day. What is panic selling?",
                        "choices": ["Selling immediately out of fear", "Holding and reviewing your plan", "Buying a little more"],
                        "answer": 0,
                        "explanation": "Selling out of fear locks in the loss. Check whether your reason for buying has changed.",
                    },
                    {
                        "question": "When should you set your exit rules?",
                        "choices": ["After the price moves", "Before you buy", "Never"],
                        "answer": 1,
                        "explanation": "Deciding in advance keeps emotions out of your decisions.",
                    },
                ],
            },
            {
                "id": "trading-2",
                "title": "DCA: buying step by step",
                "xp": 15,
                "cards": [
                    "**DCA** (Dollar Cost Averaging) means investing the same amount at regular intervals, "
                    "for example $100 every month.",
                    "You buy more when the price is low and less when it is high, "
                    "so you do not have to guess the perfect moment.",
                    "Your **average buy price** is total spent ÷ quantity bought. "
                    "CryptoCoach shows it in your wallet.",
                ],
                "questions": [
                    {
                        "question": "What does DCA mean?",
                        "choices": ["Investing everything at once", "Investing a fixed amount regularly", "Only buying during drops"],
                        "answer": 1,
                        "explanation": "DCA spreads your purchases over time to smooth out volatility.",
                    },
                    {
                        "question": "You spent $2,000 to buy 0.03 BTC. What is your average price?",
                        "choices": ["About $66,667", "About $60,000", "$2,000"],
                        "answer": 0,
                        "explanation": "2,000 ÷ 0.03 ≈ $66,667 per bitcoin.",
                    },
                    {
                        "question": "True or false: with DCA, you need to predict the best moment to buy.",
                        "choices": ["True", "False"],
                        "answer": 1,
                        "explanation": "False. That is the whole point of DCA: no timing needed.",
                    },
                ],
            },
        ],
    },
    {
        "id": "safety",
        "title": "Unit 3 · Stay safe",
        "lessons": [
            {
                "id": "safety-1",
                "title": "Scams and security",
                "xp": 15,
                "cards": [
                    "Never share your **seed phrase** (the 12 or 24 words of your wallet). "
                    "Whoever has it owns your crypto.",
                    "Promises of guaranteed returns are always a scam, especially on social media or in private messages.",
                    "Turn on **two-factor authentication (2FA)** on every exchange account.",
                ],
                "questions": [
                    {
                        "question": "Someone from 'support' asks for your seed phrase. What do you do?",
                        "choices": ["Send it to fix the issue", "Refuse: support never asks for it", "Send only half"],
                        "answer": 1,
                        "explanation": "No legitimate service will ever ask for your seed phrase.",
                    },
                    {
                        "question": "An account promises '+20% guaranteed every week'. It is…",
                        "choices": ["A great opportunity", "Almost certainly a scam", "Normal for crypto"],
                        "answer": 1,
                        "explanation": "No investment can guarantee returns. Guaranteed gains are a classic scam sign.",
                    },
                    {
                        "question": "What does 2FA add to your account?",
                        "choices": ["A second verification step", "Higher returns", "Lower fees"],
                        "answer": 0,
                        "explanation": "2FA asks for a second proof (code, app) so a stolen password is not enough.",
                    },
                ],
            },
        ],
    },
]


def all_lessons():
    """Flat list of lessons, in the order they must be completed."""
    return [lesson for unit in UNITS for lesson in unit["lessons"]]
