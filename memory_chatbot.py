import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
from datetime import datetime
import os

# ✅ Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# ✅ Validate keys
if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("❌ Missing API keys. Check .env or Railway variables.")
    st.stop()

# ✅ Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Streamlit Page Config
st.set_page_config(page_title="Corval AI Memory Assistant", layout="wide")
st.title("🧠 Corval AI Memory Assistant")
st.caption("Add notes, ask questions, and get contextual answers from stored memory.")

# ✅ Session State for Messages
if "messages" not in st.session_state:
    st.session_state.messages = []

# ✅ Helper Functions
def store_memory(note):
    """Store note and embedding in Supabase"""
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
        st.error(f"Error storing memory: {e}")
        return False

def retrieve_context(query, match_count=5):
    """Fetch similar memories from Supabase"""
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

        if response.data:
            return [item["content"] for item in response.data]
        return []
    except Exception as e:
        st.error(f"Error retrieving context: {e}")
        return []

def ask_ai(question):
    """Generate AI response with context"""
    context_list = retrieve_context(question)
    context = "\n".join(context_list) if context_list else "No relevant memories found."
    prompt = f"Context:\n{context}\n\nQuestion: {question}"

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that uses stored context to answer questions."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content, context_list
    except Exception as e:
        st.error(f"Error from OpenAI: {e}")
        return "Error generating response", []

# ✅ UI Input
user_input = st.text_input("💬 Enter your question or add a note (use 'add: your note')", "")

if st.button("Submit"):
    if user_input.strip():
        if user_input.lower().startswith("add:"):
            note = user_input[4:].strip()
            if store_memory(note):
                st.success(f"✅ Memory stored: {note}")
        else:
            with st.spinner("🤔 Thinking..."):
                answer, context_used = ask_ai(user_input)
                st.session_state.messages.append({"question": user_input, "answer": answer, "context": context_used})

# ✅ Display Latest Answer
if st.session_state.messages:
    st.subheader("Latest Response")
    last_msg = st.session_state.messages[-1]
    st.markdown(f"**You asked:** {last_msg['question']}")
    st.write(f"**AI Answer:** {last_msg['answer']}")
    if last_msg['context']:
        with st.expander("📚 Context Used"):
            for i, c in enumerate(last_msg['context'], 1):
                st.write(f"{i}. {c}")
