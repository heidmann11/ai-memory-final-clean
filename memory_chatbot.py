import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# --------------------------
# ✅ Page Config
# --------------------------
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --------------------------
# ✅ CSS Styling
# --------------------------
st.markdown("""
<style>
/* Hide Streamlit default branding */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

/* Header styling */
.main-header {
    background: linear-gradient(90deg, #000428 0%, #004e92 100%);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    text-align: center;
    color: white;
}
.main-header h1 {
    font-size: 2.8rem;
    font-weight: bold;
    margin: 0;
}
.main-header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

/* Input container */
.input-container {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 10px;
    margin-top: 1rem;
    box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
}

/* Chat messages */
.user-msg {
    text-align: right;
    background: #004e92;
    color: white;
    padding: 1rem;
    border-radius: 12px 12px 0 12px;
    margin: 0.5rem 0;
    display: inline-block;
    max-width: 75%;
}
.ai-msg {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 12px 12px 12px 0;
    border-left: 4px solid #004e92;
    margin: 0.5rem 0;
    display: inline-block;
    max-width: 75%;
}
.success-msg {
    background: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #c3e6cb;
    margin: 1rem 0;
}
</style>
""", unsafe_allow_html=True)

# --------------------------
# ✅ Load API Keys
# --------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please configure your API keys.")
    st.stop()

# --------------------------
# ✅ Initialize Clients
# --------------------------
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --------------------------
# ✅ Header
# --------------------------
st.markdown("""
<div class="main-header">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# --------------------------
# ✅ Sidebar
# --------------------------
with st.sidebar:
    st.markdown("### 📊 Quick Stats")
    if 'total_memories' not in st.session_state:
        st.session_state.total_memories = 0
    if 'total_questions' not in st.session_state:
        st.session_state.total_questions = 0

    st.metric("Memories", st.session_state.total_memories)
    st.metric("Questions", st.session_state.total_questions)

    st.markdown("### 💡 How to Use")
    st.markdown("""
- **Add Memory:**  
`add: Project meeting notes`
- **Ask a Question:**  
`What did we decide about deadlines?`
""")

# --------------------------
# ✅ Input Box (with Enter Key)
# --------------------------
st.markdown('<div class="input-container">', unsafe_allow_html=True)
st.markdown("### 💬 Type your message...")
user_input = st.text_area(
    "",
    height=80,
    placeholder="Add a memory with 'add: your note' or ask any question",
    key="input"
)

# Submit button
submit_button = st.button("📤 Submit", type="primary")

# Enter key handling
if st.session_state.get("enter_pressed", False):
    st.session_state.enter_pressed = False
    st.experimental_rerun()
st.text_input("Hidden field", key="hidden_input", on_change=lambda: st.session_state.update({"enter_pressed": True}))
st.markdown('</div>', unsafe_allow_html=True)

# --------------------------
# ✅ Chat History
# --------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

def store_memory(note):
    try:
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
        return True
    except Exception as e:
        st.error(f"❌ Error storing memory: {e}")
        return False

def retrieve_context(query, match_count=5):
    try:
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
    except Exception as e:
        st.error(f"❌ Error retrieving context: {e}")
        return []

def ask_ai(question):
    context = "\n".join(retrieve_context(question))
    prompt = f"Context:\n{context}\n\nQuestion: {question}"
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        st.session_state.total_questions += 1
        return response.choices[0].message.content, context
    except Exception as e:
        return f"❌ Error generating response: {e}", []

# --------------------------
# ✅ Handle Submission
# --------------------------
if submit_button and user_input.strip():
    st.session_state.messages.append({"role": "user", "content": user_input, "timestamp": datetime.now()})
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        if store_memory(note):
            st.session_state.messages.append({"role": "system", "content": f"✅ Memory stored: {note}", "timestamp": datetime.now()})
    else:
        with st.spinner("🤔 Thinking..."):
            ai_response, context = ask_ai(user_input)
            st.session_state.messages.append({"role": "assistant", "content": ai_response, "context": context, "timestamp": datetime.now()})

# --------------------------
# ✅ Display Chat
# --------------------------
if st.session_state.messages:
    st.markdown("### 🗂 Conversation")
    for msg in reversed(st.session_state.messages[-10:]):
        timestamp = msg["timestamp"].strftime("%H:%M")
        if msg["role"] == "user":
            st.markdown(f"<div class='user-msg'><strong>You:</strong> {msg['content']} <br><span style='font-size:0.8rem;opacity:0.7;'>({timestamp})</span></div>", unsafe_allow_html=True)
        elif msg["role"] == "system":
            st.markdown(f"<div class='success-msg'>{msg['content']}</div>", unsafe_allow_html=True)
        else:
            st.markdown(f"<div class='ai-msg'><strong>🤖 AI:</strong> {msg['content']}</div>", unsafe_allow_html=True)
            if msg.get("context"):
                with st.expander("📚 Relevant Memories"):
                    for memory in msg["context"][:3]:
                        st.markdown(f"- {memory}")
