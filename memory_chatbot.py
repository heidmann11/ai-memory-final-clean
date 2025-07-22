import os
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
import streamlit as st

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ Missing OPENAI_API_KEY. Set it in Railway Variables or .env locally.")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials.")

# Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Streamlit UI
st.set_page_config(page_title="🧠 AI Memory Chatbot", page_icon="🤖", layout="wide")
st.title("🧠 AI Memory Chatbot")
st.caption("Powered by OpenAI + Supabase | Memory-Persistent Chat")

# Sidebar
st.sidebar.header("Add Notes / Memory")
user_note = st.sidebar.text_area("Enter note to store:")
if st.sidebar.button("Store Note"):
    supabase_client.table("memories").insert({"note": user_note}).execute()
    st.sidebar.success("✅ Note added!")

# Chat Interface
st.subheader("💬 Chat with AI")
if "history" not in st.session_state:
    st.session_state["history"] = []

user_input = st.text_input("Type your message...")
if st.button("Send"):
    if user_input:
        # Fetch past memories
        memories = supabase_client.table("memories").select("note").execute()
        memory_text = "\n".join([m["note"] for m in memories.data]) if memories.data else ""

        # AI Response
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You have access to user memory:\n{memory_text}"},
                {"role": "user", "content": user_input}
            ]
        )
        answer = response.choices[0].message["content"]
        st.session_state["history"].append(("User", user_input))
        st.session_state["history"].append(("AI", answer))

# Display chat history
for role, msg in st.session_state["history"]:
    st.write(f"**{role}:** {msg}")

