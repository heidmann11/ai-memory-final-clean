import streamlit as st
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import datetime

# ✅ Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please set them in your .env or Railway config.")
    st.stop()

# ✅ Initialize OpenAI and Supabase clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Page Config
st.set_page_config(page_title="Corval.ai Memory Assistant", layout="wide")

# ✅ Custom CSS for Modern UI with Sticky Input Bar
st.markdown("""
<style>
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', sans-serif;
}
.header-logo {
    text-align: center;
    margin: 20px 0;
}
.header-logo img {
    max-width: 200px;
    margin-top: 5px;
}
.main-header {
    background: linear-gradient(90deg, #0f172a 0%, #2563eb 100%);
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
    color: white;
    margin-bottom: 20px;
}
.main-header h1 {
    font-size: 2.2rem;
    margin: 0;
}
.main-header p {
    font-size: 1rem;
    opacity: 0.9;
}
.chat-container {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    margin-top: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    height: 450px;
    overflow-y: auto;
}
.message-user {
    text-align: right;
    background: #2563eb;
    color: white;
    padding: 12px;
    border-radius: 12px 12px 0 12px;
    margin: 10px 0;
    display: inline-block;
    max-width: 70%;
}
.message-ai {
    text-align: left;
    background: #e5e7eb;
    padding: 12px;
    border-radius: 12px 12px 12px 0;
    margin: 10px 0;
    display: inline-block;
    max-width: 70%;
}
.input-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: white;
    padding: 15px 20px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.input-bar textarea {
    width: 80%;
    height: 60px;
    border-radius: 8px;
    padding: 10px;
    border: 1px solid #ccc;
    resize: none;
}
.input-bar button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 12px 18px;
    margin-left: 10px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}
.new-chat-btn {
    position: fixed;
    bottom: 100px;
    right: 30px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    font-size: 22px;
    text-align: center;
    line-height: 60px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
</style>
""", unsafe_allow_html=True)

# ✅ Logo Section
st.markdown('<div class="header-logo"><img src="app/static/corval_logo.png" alt="Corval.ai Logo"></div>', unsafe_allow_html=True)

# ✅ Gradient Header
st.markdown("""
<div class="main-header">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# ✅ Session State
if "messages" not in st.session_state:
    st.session_state.messages = []

# ✅ Chat Display
st.markdown('<div class="chat-container" id="chat-box">', unsafe_allow_html=True)
for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.markdown(f"<div class='message-user'>{msg['content']}</div>", unsafe_allow_html=True)
    else:
        st.markdown(f"<div class='message-ai'>{msg['content']}</div>", unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Input Bar at Bottom
with st.container():
    st.markdown('<div class="input-bar">', unsafe_allow_html=True)
    user_input = st.text_area("", placeholder="Ask me something or add: your note", label_visibility="collapsed")
    if st.button("Submit"):
        if user_input.strip():
            st.session_state.messages.append({"role": "user", "content": user_input})

            if user_input.lower().startswith("add:"):
                note = user_input[4:].strip()
                embedding = openai_client.embeddings.create(model="text-embedding-3-small", input=note).data[0].embedding
                supabase_client.table("project_memory").insert({"content": note, "embedding": embedding}).execute()
                st.session_state.messages.append({"role": "assistant", "content": f"✅ Memory stored: {note}"})
            else:
                context = "\n".join([m["content"] for m in st.session_state.messages if m["role"] == "user"])
                response = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are Corval.ai's expert assistant."},
                        {"role": "user", "content": f"Context: {context}\nQuestion: {user_input}"}
                    ]
                )
                ai_reply = response.choices[0].message.content
                st.session_state.messages.append({"role": "assistant", "content": ai_reply})
    st.markdown('</div>', unsafe_allow_html=True)

# ✅ Floating New Chat Button
st.markdown('<button class="new-chat-btn" onclick="window.location.reload()">+</button>', unsafe_allow_html=True)

# ✅ Auto-scroll
st.markdown("""
<script>
var chatBox = document.getElementById('chat-box');
chatBox.scrollTop = chatBox.scrollHeight;
</script>
""", unsafe_allow_html=True)
