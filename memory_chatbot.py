import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# -------------------------
# ✅ PAGE CONFIG & STYLING
# -------------------------
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ✅ Custom CSS for professional look
st.markdown("""
<style>
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Main header */
    .main-header {
        background: linear-gradient(90deg, #1a1a1a, #0d6efd);
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        color: white;
        margin-bottom: 1rem;
    }
    .main-header h1 {
        font-size: 2.8rem;
        font-weight: bold;
    }
    .main-header p {
        font-size: 1.1rem;
        opacity: 0.9;
    }

    /* Chat bubbles */
    .user-msg {
        text-align: right;
        background: #0d6efd;
        color: white;
        padding: 10px 15px;
        border-radius: 15px 15px 0 15px;
        margin: 8px 0;
        max-width: 75%;
        float: right;
        clear: both;
    }
    .ai-msg {
        text-align: left;
        background: #f1f1f1;
        color: black;
        padding: 10px 15px;
        border-radius: 15px 15px 15px 0;
        margin: 8px 0;
        max-width: 75%;
        float: left;
        clear: both;
    }

    /* Chat container scroll */
    .chat-box {
        height: 60vh;
        overflow-y: auto;
        padding: 10px;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin-bottom: 15px;
    }

    /* Sticky input */
    .sticky-input {
        position: fixed;
        bottom: 0;
        width: 80%;
        background: white;
        padding: 10px;
        border-top: 1px solid #ddd;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------
# ✅ ENVIRONMENT VARIABLES
# -------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please configure your API keys.")
    st.stop()

# -------------------------
# ✅ INITIALIZE CLIENTS
# -------------------------
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -------------------------
# ✅ HEADER
# -------------------------
st.markdown("""
<div class="main-header">
    <img src="https://i.imgur.com/0D1h8uG.png" width="60">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# -------------------------
# ✅ SIDEBAR
# -------------------------
with st.sidebar:
    st.markdown("### 📊 Quick Stats")
    if 'total_memories' not in st.session_state:
        st.session_state.total_memories = 0
    if 'total_questions' not in st.session_state:
        st.session_state.total_questions = 0
    st.metric("Memories", st.session_state.total_memories)
    st.metric("Questions", st.session_state.total_questions)

    st.markdown("---")
    st.markdown("### 💡 How to Use")
    st.markdown("""
    - **Add Memory:**  
      `add: Project meeting notes`

    - **Ask a Question:**  
      `What did we decide about deadlines?`
    """)

# -------------------------
# ✅ CHAT HISTORY
# -------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

chat_box = st.container()
with chat_box:
    st.markdown('<div class="chat-box">', unsafe_allow_html=True)
    for msg in st.session_state.messages[-50:]:
        if msg["role"] == "user":
            st.markdown(f"<div class='user-msg'>{msg['content']}</div>", unsafe_allow_html=True)
        else:
            st.markdown(f"<div class='ai-msg'>{msg['content']}</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

# -------------------------
# ✅ FUNCTIONS
# -------------------------
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
    st.session_state.total_memories += 1

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
            {"role": "system", "content": "You are an expert assistant helping with project memory and context."},
            {"role": "user", "content": prompt}
        ]
    )
    st.session_state.total_questions += 1
    return response.choices[0].message.content

# -------------------------
# ✅ STICKY INPUT + ENTER TO SEND
# -------------------------
with st.container():
    user_input = st.text_area("Type your message...", height=80, key="input_text", placeholder="Add a memory with 'add:' or ask a question...")
    if st.button("📤 Send") or st.session_state.get("enter_pressed", False):
        if user_input.strip():
            st.session_state.messages.append({"role": "user", "content": user_input})
            if user_input.lower().startswith("add:"):
                note = user_input[4:].strip()
                store_memory(note)
                st.session_state.messages.append({"role": "assistant", "content": f"✅ Memory stored: '{note}'"})
            else:
                with st.spinner("Thinking..."):
                    ai_response = ask_ai(user_input)
                    st.session_state.messages.append({"role": "assistant", "content": ai_response})
            st.session_state["input_text"] = ""  # clear input
            st.rerun()

# ✅ JS to detect Enter key
st.markdown("""
<script>
const textarea = window.parent.document.querySelector('textarea');
if(textarea){
    textarea.addEventListener('keydown', function(e){
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            const btn = window.parent.document.querySelector('button[kind="primary"]');
            if(btn){ btn.click(); }
        }
    });
}
</script>
""", unsafe_allow_html=True)
