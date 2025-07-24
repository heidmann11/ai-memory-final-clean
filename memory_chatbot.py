import streamlit as st
from PIL import Image
import os
import base64
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
from datetime import datetime
import numpy as np
import hashlib

# ✅ Load environment variables
load_dotenv()  # Changed from .env.local to work with Railway
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
STREAMLIT_PASSWORD = os.getenv("STREAMLIT_PASSWORD", "")

# ✅ Simple password protection (optional)
def check_password():
    if not STREAMLIT_PASSWORD:
        return True  # No password required
    
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False
    
    if not st.session_state.authenticated:
        st.title("🔐 Access Required")
        password = st.text_input("Enter password:", type="password")
        if st.button("Login"):
            if password == STREAMLIT_PASSWORD:
                st.session_state.authenticated = True
                st.rerun()
            else:
                st.error("Incorrect password")
        return False
    return True

# ✅ Validate environment variables
if not OPENAI_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    st.error("❌ Missing API keys. Check environment variables.")
    st.stop()

# ✅ Check authentication
if not check_password():
    st.stop()

# ✅ Initialize clients
try:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    st.error(f"❌ Failed to initialize clients: {e}")
    st.stop()

# ✅ Page Config
st.set_page_config(
    page_title="Corval.ai Memory Assistant", 
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ✅ Enhanced UI Styling (same as before but optimized)
st.markdown("""
    <style>
        .stApp {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .main > div {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        
        .logo-container {
            display: none; /* We'll integrate logo into banner */
        }
        
        .banner {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            border-radius: 0;
            margin: 0;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 30px;
        }
        
        .banner-content {
            text-align: center;
        }
        
        .logo-in-banner {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            flex-shrink: 0;
            border: 3px solid rgba(255,255,255,0.3);
        }
        
        .logo-fallback {
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            width: 120px;
            height: 120px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-right: 30px;
            border: 3px solid rgba(255,255,255,0.3);
        }
        
        .brand-icon {
            font-size: 3.5rem;
            margin-bottom: 5px;
        }
        
        .brand-text {
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: 2px;
            font-family: 'Arial', sans-serif;
        }
        
        .banner h1 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .banner p {
            margin: 0;
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .chat-container {
            max-width: 800px;
            margin: 5px auto 10px auto;
            padding: 10px;
            min-height: 120px;
            max-height: 250px;
            overflow-y: auto;
            scroll-behavior: smooth;
        }
        
        .chat-message-wrapper {
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .user-message {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 20px 20px 5px 20px;
            margin: 10px 0;
            margin-left: 50px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .ai-message {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 20px 20px 20px 5px;
            margin: 10px 0;
            margin-right: 50px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .system-message {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 15px;
            margin: 8px auto;
            text-align: center;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }
        
        .empty-state {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px 15px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 15px;
            margin: 5px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .empty-state h3 {
            margin: 0 0 8px 0;
            font-size: 1.2rem;
        }
        
        .empty-state p {
            margin: 0;
            font-size: 0.9rem;
        }
        
        .input-section {
            max-width: 800px;
            margin: 5px auto;
            padding: 0 20px;
        }
        
        .stForm {
            border: none;
            background: transparent;
        }
        
        .stForm > div {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            padding: 8px 15px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .stButton > button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 12px 25px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            width: 100%;
        }
        
        .stButton > button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .stTextInput > div > div > input {
            border-radius: 20px;
            border: 2px solid transparent;
            padding: 12px 20px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.8);
        }
        
        .stTextInput > div > div > input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            background: rgba(255, 255, 255, 1);
        }
        
        .stats-container {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 5px 0 10px 0;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 15px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .stat-number {
            font-size: 1.2rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            font-size: 0.8rem;
            color: #666;
            margin-top: 2px;
        }
    </style>
""", unsafe_allow_html=True)

# ✅ Helper function for similarity search fallback
def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def fallback_search(query_embedding, threshold=0.2, limit=5):
    """Fallback search when RPC function doesn't work"""
    try:
        result = supabase.table("project_memory").select("id, content, embedding").execute()
        
        if not result.data:
            return []
        
        matches = []
        for item in result.data:
            if item['embedding']:
                similarity = cosine_similarity(query_embedding, item['embedding'])
                if similarity > threshold:
                    matches.append({
                        'id': item['id'],
                        'content': item['content'],
                        'similarity': similarity
                    })
        
        matches.sort(key=lambda x: x['similarity'], reverse=True)
        return matches[:limit]
    
    except Exception as e:
        return []

# ✅ Initialize Session State
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# ✅ Integrated Logo + Banner Header
logo_paths = [
    "corval_logo.png",  # Root directory
    "static/corval_logo.png",  # Static folder
    "app/static/corval_logo.png",  # App/static folder
    "assets/corval_logo.png"  # Assets folder
]

logo_found = False
logo_element = ""

for logo_path in logo_paths:
    if os.path.exists(logo_path):
        # Convert image to base64 for inline embedding
        with open(logo_path, "rb") as img_file:
            b64_string = base64.b64encode(img_file.read()).decode()
        logo_element = f'<div class="logo-in-banner"><img src="data:image/png;base64,{b64_string}" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover;"></div>'
        logo_found = True
        break

if not logo_found:
    logo_element = '''
    <div class="logo-fallback">
        <div class="brand-icon">🧠</div>
        <div class="brand-text">AI</div>
    </div>
    '''

# Unified header with logo + banner
st.markdown(f"""
<div class="banner">
    {logo_element}
    <div class="banner-content">
        <h1>Corval.ai Memory Assistant</h1>
        <p>Your intelligent knowledge companion that never forgets.</p>
    </div>
</div>
""", unsafe_allow_html=True)

# ✅ Stats with error handling
try:
    count_result = supabase.table("project_memory").select("id", count="exact").execute()
    memory_count = count_result.count if count_result.count else 0
    
    st.markdown(f"""
    <div class="stats-container">
        <div class="stat-card">
            <div class="stat-number">{memory_count}</div>
            <div class="stat-label">Memories Stored</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{len(st.session_state.chat_history)}</div>
            <div class="stat-label">Messages Today</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
except Exception:
    pass

# ✅ Chat Display
st.markdown('<div class="chat-container">', unsafe_allow_html=True)
if st.session_state.chat_history:
    for msg in st.session_state.chat_history[-10:]:
        st.markdown(msg, unsafe_allow_html=True)
# No welcome message - cleaner interface
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Sticky Input Section (like ChatGPT)
st.markdown('<div class="input-section">', unsafe_allow_html=True)
st.markdown('<div class="input-container">', unsafe_allow_html=True)

with st.form(key="chat_form", clear_on_submit=True):
    col1, col2 = st.columns([4, 1])
    
    with col1:
        user_input = st.text_area(
            "Message", 
            key="user_input_form", 
            label_visibility="collapsed",
            placeholder="Type 'add: your note' to store memory, or ask a question... (Press Enter to send)",
            height=80
        )
    
    with col2:
        # Remove type="primary" to avoid red button
        submit_btn = st.form_submit_button("💜 Send", use_container_width=True)

st.markdown('</div>', unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Process Input with production error handling
if submit_btn and user_input.strip():
    st.session_state.chat_history.append(
        f'<div class="chat-message-wrapper"><div class="user-message"><strong>You:</strong> {user_input}</div></div>'
    )
    
    with st.spinner('🤔 Thinking...'):
        try:
            if user_input.lower().startswith("add:"):
                content = user_input[4:].strip()
                
                if content:
                    try:
                        embedding_response = openai_client.embeddings.create(
                            model="text-embedding-3-small",
                            input=content
                        )
                        embedding = embedding_response.data[0].embedding
                        
                        result = supabase.table("project_memory").insert({
                            "content": content,
                            "embedding": embedding,
                            "created_at": datetime.utcnow().isoformat()
                        }).execute()
                        
                        if result.data:
                            response_text = f"✅ Memory added successfully!"
                            st.session_state.chat_history.append(
                                f'<div class="chat-message-wrapper"><div class="system-message">{response_text}</div></div>'
                            )
                        else:
                            st.session_state.chat_history.append(
                                f'<div class="chat-message-wrapper"><div class="system-message">❌ Failed to store memory</div></div>'
                            )
                    except Exception:
                        st.session_state.chat_history.append(
                            f'<div class="chat-message-wrapper"><div class="system-message">❌ Error creating embedding</div></div>'
                        )
                else:
                    st.session_state.chat_history.append(
                        f'<div class="chat-message-wrapper"><div class="system-message">❌ Please provide content after "add:"</div></div>'
                    )
            else:
                try:
                    query_embedding_response = openai_client.embeddings.create(
                        model="text-embedding-3-small",
                        input=user_input
                    )
                    query_embedding = query_embedding_response.data[0].embedding
                    
                    context_items = []
                    
                    # Try RPC function first, fallback silently
                    try:
                        context_result = supabase.rpc("match_project_memory", {
                            "query_embedding": query_embedding,
                            "match_threshold": 0.2,
                            "match_count": 5
                        }).execute()
                        
                        context_items = context_result.data if context_result.data else []
                        
                    except:
                        context_items = fallback_search(query_embedding)
                    
                    context = "\n".join([item['content'] for item in context_items])
                    
                    if context:
                        prompt = f"""You are a helpful AI assistant with access to the user's stored memories.

User Question: {user_input}

Relevant Memories:
{context}

Please provide a helpful answer based on the user's question and the relevant memories above."""
                        
                        found_memories_text = f" (Found {len(context_items)} relevant memories)"
                    else:
                        prompt = f"""You are a helpful AI assistant. The user asked: {user_input}

No relevant memories were found in the database. Please provide a helpful general response and suggest they might want to add relevant information to their memory first."""
                        
                        found_memories_text = f" (No relevant memories found)"
                    
                    chat_response = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a helpful AI assistant that helps users with their questions and manages their stored memories."},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=500,
                        temperature=0.7
                    )
                    
                    response_text = chat_response.choices[0].message.content
                    response_text += f"\n\n💡 *{found_memories_text}*"
                    
                    st.session_state.chat_history.append(
                        f'<div class="chat-message-wrapper"><div class="ai-message"><strong>🤖 AI:</strong> {response_text}</div></div>'
                    )
                    
                except Exception:
                    st.session_state.chat_history.append(
                        f'<div class="chat-message-wrapper"><div class="system-message">❌ Unable to process query</div></div>'
                    )
        
        except Exception:
            st.session_state.chat_history.append(
                f'<div class="chat-message-wrapper"><div class="system-message">❌ Something went wrong</div></div>'
            )
    
    st.rerun()

# ✅ Simple clear button (only show if there's chat history)
if st.session_state.chat_history:
    col1, col2, col3 = st.columns([2, 1, 2])
    with col2:
        if st.button("🗑️ Clear Chat", use_container_width=True, key="clear_chat"):
            st.session_state.chat_history = []
            st.rerun()