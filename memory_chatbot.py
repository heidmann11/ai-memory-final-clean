import os
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client

# ✅ Load environment variables (only for local development)
load_dotenv()

# ✅ Read environment variables (works locally + Railway)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# ✅ Safety check
if not OPENAI_API_KEY:
    raise ValueError("❌ Missing OPENAI_API_KEY. Set it in Railway Variables or .env locally.")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY.")

# ✅ Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Streamlit UI
import streamlit as st

st.title("🧠 AI Memory Chat")
st.write("Your AI-powered chatbot with memory (Powered by OpenAI + Supabase).")

# ✅ Memory Table
MEMORY_TABLE = "chat_memory"

# ✅ Initialize memory
def add_memory(note: str):
    supabase_client.table(MEMORY_TABLE).insert({"note": note}).execute()

def get_memory():
    response = supabase_client.table(MEMORY_TABLE).select("*").execute()
    return [item["note"] for item in response.data]

# ✅ UI for Chat
user_input = st.text_input("💬 Ask me anything or add memory (use 'add: your note'):")

if st.button("Send"):
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        add_memory(note)
        st.success(f"✅ Memory added: {note}")
    else:
        # Retrieve all memory
        memories = get_memory()
        context = "Previous notes:\n" + "\n".join(memories) if memories else "No previous memory."
        
        # Generate AI response
        with st.spinner("Thinking..."):
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are a helpful assistant. Context: {context}"},
                    {"role": "user", "content": user_input}
                ]
            )
            ai_reply = response.choices[0].message.content
            st.markdown(f"🤖 **AI:** {ai_reply}")

# ✅ Show stored memories
if st.checkbox("Show Memory"):
    st.subheader("📝 Stored Memory")
    st.write(get_memory())
