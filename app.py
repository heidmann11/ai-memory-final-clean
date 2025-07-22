# app.py - Enhanced Streamlit UI for AI Memory Chatbot
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

# Validate environment
if not OPENAI_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    st.error("❌ Missing environment variables in .env file")
    st.stop()

# Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Page config
st.set_page_config(
    page_title="AI Memory Chatbot",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Sidebar navigation
st.sidebar.title("Navigation")
menu = st.sidebar.radio("Go to", ["💬 Chat", "📝 Manage Memory", "⚙ Settings"])

st.sidebar.markdown("---")
st.sidebar.info("Built with OpenAI + Supabase")

# Helper Functions
def store_memory(note):
    embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=note
    ).data[0].embedding
    supabase_client.table("project_memory").insert({"content": note, "embedding": embedding}).execute()

def list_memories():
    return supabase_client.table("project_memory").select("id, content").execute().data

def delete_memory(mem_id):
    supabase_client.table("project_memory").delete().eq("id", mem_id).execute()

def clear_memories():
    supabase_client.table("project_memory").delete().neq("id", "").execute()

def retrieve_context(query, match_count=3):
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding
    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.8,
        "match_count": match_count
    }).execute()
    return [item['content'] for item in response.data]

def ask_ai(question):
    context = "\n".join(retrieve_context(question))
    prompt = f"Context:\n{context}\n\nQuestion: {question}"
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

# Session state for chat history
if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = []

# UI Pages
if menu == "💬 Chat":
    st.title("💬 AI Chat with Memory")
    st.caption("Ask questions and leverage stored context.")
    
    question = st.text_input("Enter your question:")
    if st.button("Ask AI"):
        if question:
            answer = ask_ai(question)
            st.session_state["chat_history"].append({"Q": question, "A": answer})
            st.success(f"🤖 {answer}")
    
    st.subheader("Chat History")
    for chat in st.session_state["chat_history"]:
        st.markdown(f"**Q:** {chat['Q']}")
        st.markdown(f"**A:** {chat['A']}")
        st.markdown("---")

elif menu == "📝 Manage Memory":
    st.title("📝 Memory Management")
    note = st.text_input("Add a new memory:")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Add Memory"):
            if note:
                store_memory(note)
                st.success("✅ Memory added!")
    with col2:
        if st.button("Clear All Memories"):
            clear_memories()
            st.warning("🗑️ All memories cleared!")
    
    st.subheader("Stored Memories")
    memories = list_memories()
    if memories:
        for mem in memories:
            col_a, col_b = st.columns([3, 1])
            with col_a:
                st.write(f"{mem['id']} - {mem['content']}")
            with col_b:
                if st.button("Delete", key=mem['id']):
                    delete_memory(mem['id'])
                    st.warning(f"Deleted {mem['id']}")
    else:
        st.info("No memories stored yet.")

elif menu == "⚙ Settings":
    st.title("⚙ Settings")
    st.write("Environment Variables")
    st.code(f"OPENAI_API_KEY Loaded: {'Yes' if OPENAI_API_KEY else 'No'}")
    st.code(f"SUPABASE_URL: {SUPABASE_URL}")
