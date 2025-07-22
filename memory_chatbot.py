import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# ------------------------------
# ✅ Page Configuration
# ------------------------------
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ------------------------------
# ✅ Custom CSS for Branding
# ------------------------------
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    .main-header {
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        background: linear-gradient(90deg, #0f172a 0%, #2563eb 100%);
        padding: 1.5rem 2rem; 
        border-radius: 10px;
        margin-bottom: 2rem;
        color: white;
    }
    .main-header h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
    }
    .main-header p {
        margin-top: 0.5rem;
        font-size: 1.1rem;
        opacity: 0.9;
    }
    .chat-container {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
    }
    .ai-response {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #2563eb;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# ------------------------------
# ✅ Environment Variables
# ------------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please configure your API keys.")
    st.stop()

# ------------------------------
# ✅ Initialize Clients
# ------------------------------
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ------------------------------
# ✅ Header with Logo
# ------------------------------
logo_url = "https://github.com/heidmann11/ai-memory-final-clean/blob/main/Gemini_Generated_Image_61btwa61btwa61bt.png"

st.markdown(f"""
<div class="main-header">
    <div>
        <h1>Corval.ai Memory Assistant</h1>
        <p>Your intelligent knowledge companion that never forgets.</p>
    </div>
    <div>
        <img src="{logo_url}" alt="Corval.ai Logo" style="height:80px; max-height:80px;">
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------------------
# ✅ Sidebar
# ------------------------------
with st.sidebar:
    st.markdown("### 📊 Quick Stats")
    st.metric("Memories", st.session_state.get("total_memories", 0))
    st.metric("Questions", st.session_state.get("total_questions", 0))
    st.markdown("---")
    st.markdown("### 💡 How to Use")
    st.write("**Add Memory:** `add: Project meeting notes`")
    st.write("**Ask a Question:** `What did we decide about deadlines?`")

# ------------------------------
# ✅ Session State for Responses
# ------------------------------
if "latest_response" not in st.session_state:
    st.session_state.latest_response = None

# ------------------------------
# ✅ Functions
# ------------------------------
def store_memory(note):
    """Store memory in Supabase with embedding"""
    embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=note
    ).data[0].embedding

    supabase_client.table("project_memory").insert({
        "content": note,
        "embedding": embedding,
        "created_at": datetime.now().isoformat()
    }).execute()

    st.session_state["total_memories"] = st.session_state.get("total_memories", 0) + 1

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
    context = "\n".join(retrieve_context(question))
    prompt = f"Context:\n{context}\n\nQuestion: {question}"
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert memory assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    st.session_state["total_questions"] = st.session_state.get("total_questions", 0) + 1
    return response.choices[0].message.content

# ------------------------------
# ✅ Chat Input and Auto-Submit
# ------------------------------
with st.form("chat_form", clear_on_submit=True):
    user_input = st.text_area("💬 Type your message...", height=80, placeholder="Add memory or ask a question...")
    submitted = st.form_submit_button("📤 Submit")

if submitted and user_input.strip():
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        store_memory(note)
        st.session_state.latest_response = f"✅ Memory added: **{note}**"
    else:
        with st.spinner("🤔 Thinking..."):
            ai_response = ask_ai(user_input)
            st.session_state.latest_response = ai_response

# ------------------------------
# ✅ Display Latest Response
# ------------------------------
if st.session_state.latest_response:
    st.markdown(f"""
    <div class="ai-response">
        <strong>Latest Response:</strong><br>
        {st.session_state.latest_response}
    </div>
    """, unsafe_allow_html=True)

