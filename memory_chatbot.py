import streamlit as st
from openai import OpenAI
from supabase import create_client
from datetime import datetime
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Check .env file and restart.")
    st.stop()

# ✅ Initialize OpenAI & Supabase
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Page config
st.set_page_config(page_title="Corval.ai Memory Assistant", page_icon="🧠", layout="wide")

# ✅ Custom CSS for professional look
st.markdown("""
<style>
    body {
        font-family: 'Inter', sans-serif;
        background-color: #f8f9fa;
    }
    /* Logo */
    .logo-container {
        text-align: center;
        margin-bottom: 1rem;
    }
    .logo-container img {
        height: 100px;
    }
    /* Header Banner */
    .header {
        text-align: center;
        background: linear-gradient(90deg, #0f172a, #1e3a8a, #2563eb);
        color: white;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
    }
    .header h1 {
        font-size: 2rem;
        margin: 0;
        font-weight: bold;
    }
    .header p {
        margin-top: 0.5rem;
        font-size: 1rem;
    }
    /* Chat box */
    .chat-container {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        height: 60vh;
        overflow-y: auto;
        margin-bottom: 1rem;
    }
    .user-msg {
        background: #2563eb;
        color: white;
        padding: 12px;
        border-radius: 10px;
        margin: 8px 0;
        text-align: right;
        max-width: 80%;
        float: right;
    }
    .ai-msg {
        background: #f3f4f6;
        padding: 12px;
        border-radius: 10px;
        margin: 8px 0;
        text-align: left;
        max-width: 80%;
        float: left;
        border-left: 4px solid #2563eb;
    }
    /* Sticky input container */
    .input-container {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        background: white;
        padding: 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .stTextArea textarea {
        height: 60px !important;
    }
</style>
""", unsafe_allow_html=True)

# ✅ Logo at top
st.markdown("""
<div class="logo-container">
    <img src="app/static/corval_logo.png" alt="Corval.ai Logo">
</div>
""", unsafe_allow_html=True)

# ✅ Header
st.markdown("""
<div class="header">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# ✅ Initialize chat state
if "messages" not in st.session_state:
    st.session_state.messages = []

# ✅ Chat display
st.markdown('<div class="chat-container">', unsafe_allow_html=True)
for msg in st.session_state.messages[-8:]:
    if msg["role"] == "user":
        st.markdown(f"<div class='user-msg'>{msg['content']}</div><div style='clear:both;'></div>", unsafe_allow_html=True)
    else:
        st.markdown(f"<div class='ai-msg'>{msg['content']}</div><div style='clear:both;'></div>", unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Sticky input at bottom
with st.container():
    st.markdown('<div class="input-container">', unsafe_allow_html=True)
    user_input = st.text_area("Ask or add a note:", placeholder="Type here...", label_visibility="collapsed")
    submit = st.button("Submit")
    st.markdown('</div>', unsafe_allow_html=True)

# ✅ Functions
def store_memory(note):
    embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=note).data[0].embedding
    supabase_client.table("project_memory").insert({"content": note, "embedding": embedding, "created_at": datetime.now().isoformat()}).execute()

def retrieve_context(query, match_count=5):
    query_embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=query).data[0].embedding
    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": match_count
    }).execute()
    return [item['content'] for item in response.data] if response.data else []

def ask_ai(question):
    context = retrieve_context(question)
    prompt = f"Context:\n{''.join(context)}\n\nQuestion: {question}\nAnswer clearly."
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# ✅ Handle submit
if submit and user_input.strip():
    st.session_state.messages.append({"role": "user", "content": user_input})
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        store_memory(note)
        st.session_state.messages.append({"role": "assistant", "content": f"✅ Memory saved: {note}"})
    else:
        with st.spinner("Thinking..."):
            answer = ask_ai(user_input)
            st.session_state.messages.append({"role": "assistant", "content": answer})
    st.experimental_rerun()
