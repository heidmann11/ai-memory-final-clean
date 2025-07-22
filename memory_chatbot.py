import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# Page Config
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Branding & Clean Layout
st.markdown("""
<style>
    #MainMenu, footer, header {visibility: hidden;}
    
    .main-header {
        background: linear-gradient(90deg, #0d1b2a, #1b263b, #415a77, #1a73e8);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }

    .main-header h1 {
        margin: 0;
        font-size: 2.8rem;
        font-weight: 700;
    }

    .main-header p {
        margin-top: 0.5rem;
        font-size: 1.2rem;
        opacity: 0.9;
    }

    .input-box {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 1rem;
    }

    .response-box {
        background: #ffffff;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
        margin-top: 1rem;
        border-left: 5px solid #1a73e8;
    }

    .submit-btn button {
        background-color: #1a73e8 !important;
        color: white !important;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="main-header">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# ✅ Load Environment Variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# ✅ Validate Environment
if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please check API keys in Railway or .env.")
    st.stop()

# ✅ Initialize Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ State Variables
if "latest_response" not in st.session_state:
    st.session_state.latest_response = None

# ✅ Functions
def store_memory(note):
    embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=note
    ).data[0].embedding

    supabase_client.table("project_memory").insert({
        "content": note,
        "embedding": embedding,
        "created_at": datetime.now().isoformat()
    }).execute()

def retrieve_context(query, match_count=5):
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding

    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": match_count
    }).execute()

    return [item['content'] for item in response.data]

def ask_ai(question):
    context = retrieve_context(question)
    context_text = "\n".join(context) if context else "No relevant context found."

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert AI memory assistant."},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content

# ✅ Input Section
with st.container():
    st.markdown('<div class="input-box">', unsafe_allow_html=True)
    user_input = st.text_area("💬 Type your message...", placeholder="Example: add: Project meeting notes", key="user_input")
    submit = st.button("📤 Submit", key="submit_btn")
    st.markdown('</div>', unsafe_allow_html=True)

# ✅ Handle Submission
if submit and user_input.strip():
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        store_memory(note)
        st.session_state.latest_response = f"✅ Memory stored: {note}"
    else:
        st.session_state.latest_response = ask_ai(user_input)
    
    # ✅ Clear text input after submit
    st.session_state.user_input = ""

# ✅ Show Latest Response Directly Under Input
if st.session_state.latest_response:
    st.markdown(f"""
    <div class="response-box">
        <strong>🤖 AI Assistant:</strong><br>{st.session_state.latest_response}
    </div>
    """, unsafe_allow_html=True)

# ✅ Sidebar: Quick Stats
with st.sidebar:
    st.markdown("### 📊 Quick Stats")
    st.metric("Memories", "∞")  # Replace with actual count later
    st.metric("Questions", "∞")
    st.markdown("---")
    st.markdown("### 💡 How to Use")
    st.markdown("- **Add Memory:** `add: Project meeting notes`")
    st.markdown("- **Ask Question:** `What did we decide about deadlines?`")

