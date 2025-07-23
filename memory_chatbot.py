from dotenv import load_dotenv
load_dotenv()
import streamlit as st
from openai import OpenAI
from supabase import create_client
from datetime import datetime
import os

# ✅ Page Config
st.set_page_config(page_title="Corval.ai Memory Assistant", layout="wide")

# ✅ Custom CSS Styling
st.markdown("""
<style>
    /* Remove Streamlit's default header/footer */
    #MainMenu, footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Full-width gradient header */
    .header-container {
        background: linear-gradient(90deg, #0f172a, #1e3a8a, #2563eb);
        color: white;
        padding: 20px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .header-title {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    .header-subtitle {
        font-size: 1rem;
        opacity: 0.85;
    }
    .header-logo img {
        height: 80px;
    }

    /* Chat Container */
    .chat-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-height: 70vh;
        overflow-y: auto;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    /* Messages */
    .user-msg {
        background: #2563eb;
        color: white;
        align-self: flex-end;
        padding: 12px 16px;
        border-radius: 16px 16px 0 16px;
        max-width: 75%;
    }
    .ai-msg {
        background: white;
        color: #111;
        align-self: flex-start;
        padding: 12px 16px;
        border-radius: 16px 16px 16px 0;
        max-width: 75%;
        border: 1px solid #ddd;
    }

    /* Input bar fixed at bottom */
    .input-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: white;
        padding: 10px 20px;
        box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
        display: flex;
        gap: 10px;
    }
    textarea {
        flex: 1;
        border-radius: 8px !important;
        font-size: 16px !important;
        resize: none !important;
    }
    .stButton>button {
        background: #2563eb;
        color: white;
        border-radius: 8px;
        font-size: 16px;
        padding: 8px 16px;
    }
</style>
""", unsafe_allow_html=True)

# ✅ Load environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠ Missing environment variables. Please set them in your .env or Railway config.")
    st.stop()

# ✅ Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ App Header with Logo
st.markdown(f"""
<div class="header-container">
    <div>
        <div class="header-title">Corval.ai Memory Assistant</div>
        <div class="header-subtitle">Your intelligent knowledge companion that never forgets.</div>
    </div>
    <div class="header-logo">
        <img src="corval_logo.png" alt="Corval.ai Logo">

    </div>
</div>
""", unsafe_allow_html=True)

# ✅ Chat History in Session State
if "messages" not in st.session_state:
    st.session_state.messages = []

# ✅ Chat Display
st.markdown('<div class="chat-container" id="chat-box">', unsafe_allow_html=True)
for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.markdown(f"<div class='user-msg'>{msg['content']}</div>", unsafe_allow_html=True)
    else:
        st.markdown(f"<div class='ai-msg'>{msg['content']}</div>", unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Input Bar
with st.form(key="chat_form", clear_on_submit=True):
    user_input = st.text_area("Type your message...", placeholder="Ask me something or add: your note", height=70, label_visibility="collapsed")
    submitted = st.form_submit_button("Submit")

if submitted and user_input.strip():
    # Save user message
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Check if it's memory addition
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=note).data[0].embedding
        supabase_client.table("project_memory").insert({"content": note, "embedding": embedding}).execute()
        st.session_state.messages.append({"role": "assistant", "content": f"✅ Memory added: {note}"})
    else:
        # Fetch context from Supabase
        query_embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=user_input).data[0].embedding
        context = supabase_client.rpc("match_project_memory", {
            "query_embedding": query_embedding,
            "match_threshold": 0.0,
            "match_count": 5
        }).execute()
        context_text = "\n".join([item['content'] for item in context.data]) if context.data else "No relevant context."
        prompt = f"Context:\n{context_text}\n\nQuestion: {user_input}"
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert assistant for Corval.ai."},
                {"role": "user", "content": prompt}
            ]
        )
        ai_reply = response.choices[0].message.content
        st.session_state.messages.append({"role": "assistant", "content": ai_reply})

    st.experimental_rerun()
