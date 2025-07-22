import streamlit as st
from openai import OpenAI
from supabase import create_client
import os

# Set page config first
st.set_page_config(page_title="AI Memory Chatbot", page_icon="🧠", layout="wide")

# ✅ Get keys from environment (Railway will provide them)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# ✅ Debug logs (only for deployment troubleshooting)
st.sidebar.write("**Debug Info:**")
st.sidebar.write(f"OPENAI_API_KEY found: {bool(OPENAI_API_KEY)}")
st.sidebar.write(f"SUPABASE_URL found: {bool(SUPABASE_URL)}")
st.sidebar.write(f"SUPABASE_KEY found: {bool(SUPABASE_KEY)}")

# ✅ Validate env variables
if not OPENAI_API_KEY:
    st.error("❌ Missing OPENAI_API_KEY. Please set it in Railway Variables.")
    st.stop()
if not SUPABASE_URL:
    st.error("❌ Missing SUPABASE_URL. Please set it in Railway Variables.")
    st.stop()
if not SUPABASE_KEY:
    st.error("❌ Missing SUPABASE_KEY. Please set it in Railway Variables.")
    st.stop()

try:
    # ✅ Initialize clients
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    st.sidebar.success("✅ All clients initialized successfully!")
except Exception as e:
    st.error(f"❌ Failed to initialize clients: {str(e)}")
    st.stop()

# Streamlit UI
st.title("🧠 AI Memory Chatbot")
st.write("Type `add: your note` to store memory or ask any question.")

# Function to store memory in Supabase
def store_memory(note):
    try:
        embedding = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=note
        ).data[0].embedding

        supabase_client.table("project_memory").insert({
            "content": note,
            "embedding": embedding
        }).execute()
        st.success(f"✅ Stored: {note}")
    except Exception as e:
        st.error(f"❌ Failed to store memory: {str(e)}")

# Function to retrieve similar context
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

# Function to ask AI with memory context
def ask_ai(question):
    try:
        context = "\n".join(retrieve_context(question))
        prompt = f"Context:\n{context}\n\nQuestion: {question}"

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert software architect."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        st.error(f"❌ Failed to get AI response: {str(e)}")
        return "Sorry, I encountered an error processing your request."

# Streamlit app input
user_input = st.text_input("💬 Enter your message:")
if st.button("Submit") and user_input:
    if user_input.lower().startswith("add:"):
        note = user_input[4:].strip()
        store_memory(note)
    else:
        with st.spinner("Thinking..."):
            answer = ask_ai(user_input)
            st.write("🤖 **AI Response:**", answer)