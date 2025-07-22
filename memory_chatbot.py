import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# ✅ Configure Page
st.set_page_config(
    page_title="Corval.AI Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ✅ Custom CSS with Corval.AI branding
st.markdown("""
<style>
    /* Hide Streamlit default */
    #MainMenu, footer, header {visibility: hidden;}

    /* Background and Font */
    body {
        background-color: #0D0D0D;
        font-family: 'Segoe UI', sans-serif;
        color: white;
    }

    /* Header */
    .main-header {
        background: linear-gradient(90deg, #000000, #2E2E2E);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }

    .main-header h1 {
        font-size: 2.8rem;
        font-weight: 700;
        color: #4C6EF5; /* Corval Blue */
        margin: 0;
    }

    .main-header p {
        font-size: 1.2rem;
        opacity: 0.9;
    }

    /* Chat Cards */
    .ai-response, .memory-card {
        background: #1E1E1E;
        color: white;
        border-left: 4px solid #4C6EF5;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .success-message {
        background: #153D26;
        border-left: 4px solid #28a745;
        padding: 1rem;
        border-radius: 8px;
    }

    /* Input Section */
    .input-container textarea {
        background: #1E1E1E;
        color: white;
        border: 2px solid #4C6EF5;
        border-radius: 8px;
        font-size: 16px;
    }

    .stButton button {
        background-color: #4C6EF5;
        color: white;
        font-size: 18px;
        border-radius: 8px;
        padding: 10px 20px;
    }

    .stButton button:hover {
        background-color: #3756d4;
    }

    /* Sidebar */
    .sidebar .sidebar-content {
        background: #101010;
    }
</style>
""", unsafe_allow_html=True)

# ✅ Environment Variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please configure your API keys.")
    st.stop()

# ✅ Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Header with Logo
st.markdown(f"""
<div class="main-header">
    <img src="https://raw.githubusercontent.com/yourusername/yourrepo/main/logo.png" width="90" style="margin-bottom: 10px;">
    <h1>Corval.AI Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets</p>
</div>
""", unsafe_allow_html=True)

# ✅ Sidebar Stats
with st.sidebar:
    st.markdown("### 📊 Quick Stats")
    if 'total_memories' not in st.session_state:
        st.session_state.total_memories = 0
    if 'total_questions' not in st.session_state:
        st.session_state.total_questions = 0
    st.metric("Total Memories", st.session_state.total_memories)
    st.metric("Questions Asked", st.session_state.total_questions)

# ✅ Input Section
st.markdown('<div class="input-container">', unsafe_allow_html=True)
st.markdown("### 💬 Enter your message")
user_input = st.text_area("Type your message here...", height=100,
                          placeholder="Add a memory with 'add: your note' or ask any question",
                          label_visibility="collapsed")

col_submit, col_clear = st.columns([1, 4])
with col_submit:
    submit_button = st.button("📤 Submit", type="primary", use_container_width=True)

st.markdown('</div>', unsafe_allow_html=True)

# ✅ Initialize Chat
if "messages" not in st.session_state:
    st.session_state.messages = []

# ✅ Functions
def store_memory(note):
    embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=note).data[0].embedding
    supabase_client.table("project_memory").insert({
        "content": note,
        "embedding": embedding,
        "created_at": datetime.now().isoformat()
    }).execute()
    st.session_state.total_memories += 1
    return True

def retrieve_context(query, match_count=5):
    query_embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=query).data[0].embedding
    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": match_count
    }).execute()
    return [item['content'] for item in response.data]

def ask_ai(question):
    context = retrieve_context(question)
    context_text = "\n".join(context) if context else "No relevant memories found."
    prompt = f"Context:\n{context_text}\n\nQuestion: {question}"
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert business and technology assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    st.session_state.total_questions += 1
    return response.choices[0].message.content, context

# ✅ Handle Submit
if submit_button and user_input.strip():
    st.session_state.messages.append({"role": "user", "content": user_input.strip(), "timestamp": datetime.now()})
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        if store_memory(note):
            st.session_state.messages.append({"role": "system", "content": f"✅ Memory stored: '{note}'", "timestamp": datetime.now()})
    else:
        with st.spinner("🤔 Thinking..."):
            ai_response, context = ask_ai(user_input)
            st.session_state.messages.append({"role": "assistant", "content": ai_response, "context": context, "timestamp": datetime.now()})

# ✅ Display Chat
if st.session_state.messages:
    st.markdown("### 💬 Conversation History")
    for msg in reversed(st.session_state.messages[-10:]):
        if msg["role"] == "user":
            st.markdown(f'<div class="ai-response"><strong>You:</strong> {msg["content"]}</div>', unsafe_allow_html=True)
        elif msg["role"] == "system":
            st.markdown(f'<div class="success-message"><strong>System:</strong> {msg["content"]}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="ai-response"><strong>🤖 AI Assistant:</strong> {msg["content"]}</div>', unsafe_allow_html=True)
            if 'context' in msg and msg['context']:
                with st.expander("📚 Relevant Memories Used"):
                    for i, memory in enumerate(msg['context'][:3], 1):
                        st.markdown(f"**{i}.** {memory}")
