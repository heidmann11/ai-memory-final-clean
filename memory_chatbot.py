import streamlit as st
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not OPENAI_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    st.error("❌ Missing environment variables in .env file")
    st.stop()

# Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Streamlit Page Config
st.set_page_config(page_title="AI Memory Chatbot", page_icon="🧠", layout="wide")

# --- Sidebar ---
st.sidebar.title("📚 Memory Control")
with st.sidebar.expander("Stored Memories", expanded=True):
    memories = supabase_client.table("project_memory").select("*").execute().data
    if memories:
        for m in memories:
            st.write(f"- {m['content']}")
    else:
        st.write("No memories yet.")

if st.sidebar.button("🗑 Clear All Memories"):
    supabase_client.table("project_memory").delete().neq("id", 0).execute()
    st.sidebar.success("✅ All memories cleared. Refresh the page!")

# --- Main Chat UI ---
st.title("🧠 AI Memory Chat")
st.markdown("**💡 Tip:** Use `add: your note` to store new info.")

# Session state for Q&A history
if "history" not in st.session_state:
    st.session_state.history = []

# Input
user_input = st.text_input("💬 Ask a question or add a memory", "")

if st.button("Send") and user_input:
    if user_input.lower().startswith("add:"):
        new_note = user_input[4:].strip()
        supabase_client.table("project_memory").insert({"content": new_note}).execute()
        st.success(f"✅ Memory added: {new_note}")
    else:
        with st.spinner("🤔 Thinking..."):
            context = " ".join([m['content'] for m in memories])
            prompt = f"Answer based on this context: {context}. Question: {user_input}"
            response = openai_client.responses.create(
                model="gpt-4.1-mini",
                input=prompt
            )
            answer = response.output_text
            st.session_state.history.append({"q": user_input, "a": answer})
            st.info(answer)

# Show last 5 Q&A
if st.session_state.history:
    with st.expander("📝 Recent Q&A History", expanded=True):
        for item in st.session_state.history[-5:]:
            st.markdown(f"**Q:** {item['q']}")
            st.markdown(f"**A:** {item['a']}")
            st.markdown("---")
