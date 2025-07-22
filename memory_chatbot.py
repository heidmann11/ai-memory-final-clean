import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime

# Page Config
st.set_page_config(
    page_title="Corval.ai Memory Assistant",
    page_icon="🧠",
    layout="wide"
)

# Custom CSS for Better UI
st.markdown("""
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

.main-header {
    background: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    color: white;
}
.main-header h1 {
    font-size: 2.5rem;
    margin: 0;
}
.input-container {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 10px;
    margin: 1rem 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.ai-response {
    background: #f8f9fa;
    padding: 1rem;
    border-left: 5px solid #007BFF;
    margin: 1rem 0;
    border-radius: 10px;
}
.user-message {
    background: #007BFF;
    color: white;
    padding: 1rem;
    border-radius: 10px;
    margin: 1rem 0;
}
</style>
""", unsafe_allow_html=True)

# Header Section
st.markdown("""
<div class="main-header">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# Environment Variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please check your API keys.")
    st.stop()

# Initialize Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Session State
if "messages" not in st.session_state:
    st.session_state.messages = []

# Functions
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
    context_text = "\n".join(context) if context else "No relevant memories found."

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an AI assistant helping with knowledge recall."},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content, context

# Input UI
with st.container():
    st.markdown('<div class="input-container">', unsafe_allow_html=True)
    user_input = st.text_area("💬 Type your message...", key="user_input", placeholder="Example: add: Project meeting notes", height=80)
    submit = st.button("📤 Submit", type="primary")
    st.markdown('</div>', unsafe_allow_html=True)

# Handle Submit
if submit and user_input.strip():
    message = user_input.strip()
    st.session_state.messages.insert(0, {"role": "user", "content": message})

    # Clear input immediately
    st.session_state.user_input = ""

    if message.lower().startswith("add:"):
        note = message[4:].strip()
        store_memory(note)
        st.session_state.messages.insert(0, {"role": "system", "content": f"✅ Memory stored: {note}"})
    else:
        with st.spinner("🤔 Thinking..."):
            answer, context = ask_ai(message)
            st.session_state.messages.insert(0, {
                "role": "assistant",
                "content": answer,
                "context": context
            })

# Show Latest Response Directly Under Input
for msg in st.session_state.messages[:1]:  # Show only latest
    if msg["role"] == "user":
        st.markdown(f'<div class="user-message">{msg["content"]}</div>', unsafe_allow_html=True)
    elif msg["role"] == "assistant":
        st.markdown(f'<div class="ai-response"><strong>🤖 AI:</strong> {msg["content"]}</div>', unsafe_allow_html=True)
        if msg.get("context"):
            with st.expander("📚 Relevant Memories"):
                for i, memory in enumerate(msg["context"], 1):
                    st.markdown(f"**{i}.** {memory}")
    else:
        st.success(msg["content"])
