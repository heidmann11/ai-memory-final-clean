import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
import sys

# Set page config first
st.set_page_config(page_title="AI Memory Chatbot", page_icon="🧠", layout="wide")

# 🔍 ENHANCED DEBUG SECTION
st.sidebar.write("**🔍 Enhanced Debug Info:**")

# Show ALL relevant environment variables (first 10 chars only for security)
st.sidebar.write("**All Relevant Environment Variables:**")
relevant_vars = []
for key, value in os.environ.items():
    if any(keyword in key.upper() for keyword in ['API', 'KEY', 'URL', 'SUPABASE', 'OPENAI', 'PORT', 'RAILWAY']):
        masked_value = f"{value[:10]}..." if value else "None"
        relevant_vars.append(f"- {key}: {masked_value}")
        st.sidebar.write(f"- {key}: {masked_value}")

if not relevant_vars:
    st.sidebar.write("❌ No relevant environment variables found!")

# Specific variable checks
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL") 
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

st.sidebar.write("**Direct Variable Access:**")
st.sidebar.write(f"OPENAI_API_KEY type: {type(OPENAI_API_KEY)}")
st.sidebar.write(f"OPENAI_API_KEY length: {len(OPENAI_API_KEY) if OPENAI_API_KEY else 0}")
st.sidebar.write(f"OPENAI_API_KEY starts with 'sk-': {OPENAI_API_KEY.startswith('sk-') if OPENAI_API_KEY else False}")

st.sidebar.write(f"SUPABASE_URL type: {type(SUPABASE_URL)}")
st.sidebar.write(f"SUPABASE_URL length: {len(SUPABASE_URL) if SUPABASE_URL else 0}")
st.sidebar.write(f"SUPABASE_URL contains 'supabase': {'supabase' in SUPABASE_URL.lower() if SUPABASE_URL else False}")

st.sidebar.write(f"SUPABASE_KEY type: {type(SUPABASE_KEY)}")
st.sidebar.write(f"SUPABASE_KEY length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")

# Check Railway-specific variables
railway_vars = [key for key in os.environ.keys() if 'RAILWAY' in key.upper()]
if railway_vars:
    st.sidebar.write(f"**Railway Variables Found:** {len(railway_vars)}")
    for var in railway_vars[:5]:  # Show first 5
        st.sidebar.write(f"- {var}")
else:
    st.sidebar.write("**Railway Variables:** None found")

# System info
st.sidebar.write(f"**System Info:**")
st.sidebar.write(f"Python version: {sys.version[:5]}")
st.sidebar.write(f"Platform: {sys.platform}")
st.sidebar.write(f"Total env vars: {len(os.environ)}")

# Original debug info for comparison
st.sidebar.write("**Original Debug:**")
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