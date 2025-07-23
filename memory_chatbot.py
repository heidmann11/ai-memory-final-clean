import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime
import base64

# -------------------------------
# Load environment variables
# -------------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please configure your API keys.")
    st.stop()

# Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -------------------------------
# Streamlit Page Config
# -------------------------------
st.set_page_config(page_title="Corval.ai Memory Assistant", layout="wide")

# -------------------------------
# Load Logo and Encode Base64
# -------------------------------
def get_base64_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()

logo_base64 = get_base64_image("corval_logo.png")

# -------------------------------
# Custom CSS
# -------------------------------
st.markdown("""
<style>
    #MainMenu, header, footer {visibility: hidden;}
    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(90deg, #1E3A8A, #2563EB);
        padding: 1.5rem;
        border-radius: 8px;
        color: white;
        margin-bottom: 1.5rem;
    }
    .header-title {
        font-size: 2rem;
        font-weight: 700;
    }
    .header-subtitle {
        font-size: 1rem;
        opacity: 0.9;
    }
    .logo-img {
        height: 60px;
    }
    .message-box {
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem 0;
    }
    .user-message {
        background: #2563EB;
        color: white;
        text-align: right;
    }
    .assistant-message {
        background: #F3F4F6;
        color: #111827;
        border-left: 4px solid #2563EB;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------
# Header with Logo
# -------------------------------
st.markdown(f"""
<div class="header-container">
    <div>
        <div class="header-title">Corval.ai Memory Assistant</div>
        <div class="header-subtitle">Your intelligent knowledge companion that never forgets.</div>
    </div>
    <div>
        <img src="data:image/png;base64,{logo_base64}" class="logo-img" alt="Corval.ai Logo">
    </div>
</div>
""", unsafe_allow_html=True)

# -------------------------------
# Session State
# -------------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

# -------------------------------
# Functions
# -------------------------------
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
        return True
    except Exception as e:
        st.error(f"❌ Failed to store memory: {str(e)}")
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
        st.error(f"❌ Failed to retrieve context: {str(e)}")
        return []

def ask_ai(question):
    try:
        context = retrieve_context(question)
        context_text = "\n".join(context) if context else "No relevant memories found."

        prompt = f"""
Based on the following context from previous conversations and stored memories, answer the question:

Context:
{context_text}

Question: {question}

Please provide a clear and helpful response.
"""
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert AI assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content, context
    except Exception as e:
        st.error(f"❌ Failed to get AI response: {str(e)}")
        return "Sorry, I encountered an error.", []

# -------------------------------
# Chat Display (Latest Response Only)
# -------------------------------
placeholder = st.container()

with placeholder:
    if st.session_state.messages:
        last_msg = st.session_state.messages[-1]
        st.markdown("### **Latest Response:**")
        if last_msg["role"] == "assistant":
            st.markdown(f"""
            <div class='message-box assistant-message'><b>🤖 AI:</b> {last_msg['content']}</div>
            """, unsafe_allow_html=True)

# -------------------------------
# Input Section at Bottom
# -------------------------------
with st.form("input_form", clear_on_submit=True):
    user_input = st.text_area("💬 Type your message...", placeholder="Add memory: 'add: your note' or ask a question...")
    submitted = st.form_submit_button("📤 Submit")

if submitted and user_input.strip():
    st.session_state.messages.append({"role": "user", "content": user_input})

    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        if store_memory(note):
            st.session_state.messages.append({"role": "assistant", "content": f"✅ Memory stored: {note}"})
    else:
        with st.spinner("🤔 Thinking..."):
            ai_response, _ = ask_ai(user_input)
            st.session_state.messages.append({"role": "assistant", "content": ai_response})

    st.experimental_rerun()
