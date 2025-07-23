import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# ------------------------
# ✅ Page Configuration
# ------------------------
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ------------------------
# ✅ Custom CSS for Branding
# ------------------------
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(90deg, #0A1D37 0%, #0056FF 100%);
        padding: 1.5rem 2rem;
        border-radius: 10px;
        color: white;
    }
    .header-title h1 {
        margin: 0;
        font-size: 2.2rem;
        font-weight: bold;
    }
    .header-title p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
    }
    .header-logo img {
        height: 60px;
        margin-left: 20px;
    }

    .input-container {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .response-container {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# ------------------------
# ✅ Environment Variables
# ------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing API keys. Check your environment variables in Railway or .env.")
    st.stop()

# ------------------------
# ✅ Initialize Clients
# ------------------------
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ------------------------
# ✅ Header with Logo
# ------------------------
st.markdown("""
<div class="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1>Corval.ai Memory Assistant</h1>
            <p>Your intelligent knowledge companion that never forgets.</p>
        </div>
        <img src="corval_logo.png" alt="Corval.ai Logo" style="height:80px; border-radius:8px;" />
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------------
# ✅ State for Latest Response
# ------------------------
if "latest_response" not in st.session_state:
    st.session_state.latest_response = None

# ------------------------
# ✅ Input Section
# ------------------------
st.markdown('<div class="input-container">', unsafe_allow_html=True)
with st.form("input_form", clear_on_submit=True):
    user_input = st.text_area("💬 Type your message...", placeholder="Add memory with 'add:' or ask a question", height=100)
    submitted = st.form_submit_button("📤 Submit")
st.markdown('</div>', unsafe_allow_html=True)

# ------------------------
# ✅ Functions
# ------------------------
def store_memory(note):
    embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=note).data[0].embedding
    supabase_client.table("project_memory").insert({
        "content": note,
        "embedding": embedding,
        "created_at": datetime.now().isoformat()
    }).execute()
    return "✅ Memory stored successfully!"

def retrieve_context(query, match_count=5):
    query_embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=query).data[0].embedding
    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": match_count
    }).execute()
    return [item['content'] for item in response.data]

def ask_ai(question):
    context = "\n".join(retrieve_context(question)) or "No relevant memories found."
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an AI assistant with access to stored knowledge."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content

# ------------------------
# ✅ Process Input
# ------------------------
if submitted and user_input.strip():
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        st.session_state.latest_response = store_memory(note)
    else:
        st.session_state.latest_response = ask_ai(user_input)

# ------------------------
# ✅ Display Latest Response
# ------------------------
if st.session_state.latest_response:
    st.markdown('<div class="response-container">', unsafe_allow_html=True)
    st.markdown(f"**Latest Response:**\n\n{st.session_state.latest_response}")
    st.markdown('</div>', unsafe_allow_html=True)

