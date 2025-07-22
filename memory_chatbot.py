import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# ---------- CONFIG ----------
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------- ENV VARIABLES ----------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Configure API keys.")
    st.stop()

openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- STYLES ----------
def load_styles(dark_mode=True):
    bg_gradient = "#0f172a" if dark_mode else "#f8f9fa"
    text_color = "white" if dark_mode else "#333"
    header_gradient = (
        "linear-gradient(90deg, #1E293B 0%, #334155 100%)"
        if dark_mode else
        "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
    )
    return f"""
    <style>
    body {{
        background-color: {bg_gradient};
        color: {text_color};
    }}
    .main-header {{
        background: {header_gradient};
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        color: white;
    }}
    .chat-container {{
        background: {'#1f2937' if dark_mode else 'white'};
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }}
    .user-msg {{
        text-align: right;
        background: #4f46e5;
        color: white;
        padding: 10px;
        border-radius: 15px 15px 5px 15px;
        margin-bottom: 8px;
    }}
    .ai-msg {{
        background: #334155;
        color: white;
        padding: 10px;
        border-radius: 15px 15px 15px 5px;
        margin-bottom: 8px;
    }}
    </style>
    """

# ---------- SIDEBAR ----------
st.sidebar.image("https://your-logo-url.com", width=150)
st.sidebar.title("⚙️ Settings")

dark_mode = st.sidebar.checkbox("🌙 Dark Mode", value=True)
persona = st.sidebar.selectbox("🤖 AI Persona", ["Business Advisor", "Technical Architect", "Creative Strategist"])
st.sidebar.markdown("---")
st.sidebar.markdown("**Press Enter** to submit. Use Shift+Enter for new line.")

st.markdown(load_styles(dark_mode), unsafe_allow_html=True)

# ---------- HEADER ----------
st.markdown("""
<div class="main-header">
    <h1>🧠 Corval.ai Memory Assistant</h1>
    <p>Your intelligent business knowledge companion</p>
</div>
""", unsafe_allow_html=True)

# ---------- SESSION STATE ----------
if "messages" not in st.session_state:
    st.session_state.messages = []
if "enter_pressed" not in st.session_state:
    st.session_state.enter_pressed = False

# ---------- FUNCTIONS ----------
def store_memory(note):
    embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=note).data[0].embedding
    supabase_client.table("project_memory").insert({
        "content": note,
        "embedding": embedding,
        "created_at": datetime.now().isoformat()
    }).execute()

def retrieve_context(query, match_count=5):
    query_embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=query).data[0].embedding
    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": match_count
    }).execute()
    return [item['content'] for item in response.data]

def ask_ai(question, persona):
    context = "\n".join(retrieve_context(question))
    persona_prompts = {
        "Business Advisor": "You are an expert business advisor focused on growth and profitability.",
        "Technical Architect": "You are a senior technical architect providing system design and optimization advice.",
        "Creative Strategist": "You are an innovative strategist generating creative ideas and campaigns."
    }
    system_prompt = persona_prompts.get(persona, "You are a helpful assistant.")
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content

# ---------- CHAT UI ----------
with st.container():
    st.markdown('<div class="chat-container">', unsafe_allow_html=True)
    for msg in st.session_state.messages[-10:]:
        if msg["role"] == "user":
            st.markdown(f"<div class='user-msg'>{msg['content']}</div>", unsafe_allow_html=True)
        else:
            st.markdown(f"<div class='ai-msg'>{msg['content']}</div>", unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# ---------- INPUT ----------
user_input = st.text_area("Type your message...", key="input_text", placeholder="Type your message...")

# Keyboard shortcut simulation
if st.session_state.enter_pressed or st.button("📤 Submit", type="primary"):
    if user_input.strip():
        if user_input.lower().startswith("add:"):
            note = user_input[4:].strip()
            store_memory(note)
            st.session_state.messages.append({"role": "system", "content": f"✅ Memory stored: {note}"})
        else:
            ai_response = ask_ai(user_input, persona)
            st.session_state.messages.append({"role": "user", "content": user_input})
            st.session_state.messages.append({"role": "assistant", "content": ai_response})
        st.session_state.enter_pressed = False
        st.rerun()  # ✅ Correct method for latest Streamlit

# Trigger Enter key
st.session_state.enter_pressed = st.text_input("Press Enter to send", key="hidden_input", label_visibility="collapsed") == "send"
