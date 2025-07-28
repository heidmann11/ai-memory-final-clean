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
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
STREAMLIT_PASSWORD = os.getenv("STREAMLIT_PASSWORD", "")

# ✅ Simple password protection (optional)
def check_password():
    if not STREAMLIT_PASSWORD:
        return True
    
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

# ✅ ChatGPT-Style CSS
st.markdown("""
    <style>
        /* Hide Streamlit elements */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .stDeployButton {display: none;}
        
        /* Main app styling */
        .stApp {
            background-color: #ffffff;
            color: #333333;
        }
        
        /* Remove default padding */
        .main .block-container {
            padding-top: 2rem;
            padding-bottom: 8rem;
            max-width: 100%;
        }
        
        /* Header styling - minimal and clean */
        .header-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e5e5e5;
            padding: 12px 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .header-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0;
        }
        
        /* Chat container */
        .chat-container {
            max-width: 800px;
            margin: 60px auto 0 auto;
            padding: 20px;
            min-height: calc(100vh - 200px);
        }
        
        /* Message styling */
        .message {
            margin: 20px 0;
            display: flex;
            width: 100%;
        }
        
        .user-message {
            justify-content: flex-end;
        }
        
        .ai-message {
            justify-content: flex-start;
        }
        
        .message-content {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 15px;
            line-height: 1.4;
        }
        
        .user-message .message-content {
            background-color: #f0f0f0;
            color: #333;
            border-bottom-right-radius: 4px;
        }
        
        .ai-message .message-content {
            background-color: #000000;
            color: #ffffff;
            border-bottom-left-radius: 4px;
        }
        
        .system-message {
            text-align: center;
            margin: 15px 0;
        }
        
        .system-message .message-content {
            background-color: #f8f8f8;
            color: #666;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 14px;
            max-width: 400px;
            margin: 0 auto;
        }
        
        /* Fixed bottom input */
        .input-container {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid #e5e5e5;
            padding: 20px;
            z-index: 1000;
        }
        
        .input-wrapper {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }
        
        /* Input field styling */
        .stTextArea > div > div > textarea {
            border: 2px solid #e5e5e5 !important;
            border-radius: 20px !important;
            padding: 12px 16px !important;
            font-size: 15px !important;
            resize: none !important;
            max-height: 120px !important;
            min-height: 44px !important;
            background-color: #ffffff !important;
            color: #333 !important;
            box-shadow: none !important;
        }
        
        .stTextArea > div > div > textarea:focus {
            border-color: #333 !important;
            box-shadow: 0 0 0 1px #333 !important;
        }
        
        /* Send button styling */
        .stButton > button {
            background-color: #000000 !important;
            color: white !important;
            border: none !important;
            border-radius: 20px !important;
            padding: 10px 20px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            height: 44px !important;
            min-width: 80px !important;
            transition: all 0.2s ease !important;
        }
        
        .stButton > button:hover {
            background-color: #333333 !important;
            transform: none !important;
        }
        
        .stButton > button:active {
            background-color: #555555 !important;
        }
        
        /* Clear button styling */
        .clear-button {
            background-color: transparent !important;
            color: #666 !important;
            border: 1px solid #e5e5e5 !important;
            border-radius: 16px !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
            margin: 20px auto !important;
            display: block !important;
        }
        
        .clear-button:hover {
            background-color: #f8f8f8 !important;
            color: #333 !important;
        }
        
        /* Welcome message */
        .welcome-container {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .welcome-title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
        }
        
        .welcome-subtitle {
            font-size: 16px;
            margin-bottom: 30px;
            color: #666;
        }
        
        .tip-card {
            background-color: #f8f8f8;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            padding: 16px;
            margin: 12px auto;
            max-width: 400px;
            text-align: left;
        }
        
        .tip-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        
        .tip-description {
            font-size: 14px;
            color: #666;
        }
        
        /* Stats */
        .stats-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }
        
        .stat-item {
            text-align: center;
            padding: 12px 20px;
            background-color: #f8f8f8;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
        }
        
        .stat-number {
            font-size: 20px;
            font-weight: 600;
            color: #333;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }
    </style>
""", unsafe_allow_html=True)

# ✅ Helper function for similarity search fallback
def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def fallback_search(query_embedding, threshold=0.05, limit=5):
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

# ✅ Fixed Header
st.markdown('''
<div class="header-container">
    <h1 class="header-title">🧠 Corval.ai Memory Assistant</h1>
</div>
''', unsafe_allow_html=True)

# ✅ Chat Container
st.markdown('<div class="chat-container">', unsafe_allow_html=True)

# Show welcome message if no chat history
if not st.session_state.chat_history:
    # Stats
    try:
        count_result = supabase.table("project_memory").select("id", count="exact").execute()
        memory_count = count_result.count if count_result.count else 0
        
        st.markdown(f'''
        <div class="stats-container">
            <div class="stat-item">
                <div class="stat-number">{memory_count}</div>
                <div class="stat-label">Memories Stored</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">{len(st.session_state.chat_history)}</div>
                <div class="stat-label">Messages Today</div>
            </div>
        </div>
        ''', unsafe_allow_html=True)
    except Exception:
        pass
    
    st.markdown('''
    <div class="welcome-container">
        <div class="welcome-title">Welcome to your Memory Assistant</div>
        <div class="welcome-subtitle">Your intelligent knowledge companion that never forgets</div>
        
        <div class="tip-card">
            <div class="tip-title">💾 Save Information</div>
            <div class="tip-description">Type "add: your information here" to store memories</div>
        </div>
        
        <div class="tip-card">
            <div class="tip-title">💬 Ask Questions</div>
            <div class="tip-description">Just type your question normally to search your memories</div>
        </div>
    </div>
    ''', unsafe_allow_html=True)

# Display chat messages
for msg in st.session_state.chat_history:
    st.markdown(msg, unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# ✅ Fixed Bottom Input
st.markdown('''
<div class="input-container">
    <div class="input-wrapper">
''', unsafe_allow_html=True)

# Input form
with st.form(key="chat_form", clear_on_submit=True):
    col1, col2 = st.columns([5, 1])
    
    with col1:
        user_input = st.text_area(
            "Message",
            key="user_input", 
            label_visibility="collapsed",
            placeholder="Type 'add: your note' to save info, or ask me anything...",
            height=44
        )
    
    with col2:
        submit_btn = st.form_submit_button("Send")

st.markdown('''
    </div>
</div>
''', unsafe_allow_html=True)

# ✅ Process Input
if submit_btn and user_input and user_input.strip():
    # Add user message
    st.session_state.chat_history.append(
        f'''<div class="message user-message">
            <div class="message-content">{user_input}</div>
        </div>'''
    )
    
    with st.spinner('Thinking...'):
        try:
            if user_input.lower().startswith("add:"):
                # Store Note
                content = user_input[4:].strip()
                
                if content:
                    try:
                        # Create embedding
                        embedding_response = openai_client.embeddings.create(
                            model="text-embedding-3-small",
                            input=content
                        )
                        embedding = embedding_response.data[0].embedding
                        
                        # Save to Supabase  
                        result = supabase.table("project_memory").insert({
                            "content": content,
                            "embedding": embedding,
                            "created_at": datetime.utcnow().isoformat()
                        }).execute()
                        
                        if result.data and len(result.data) > 0:
                            st.session_state.chat_history.append(
                                f'''<div class="message system-message">
                                    <div class="message-content">✅ Memory saved: "{content[:50]}{"..." if len(content) > 50 else ""}"</div>
                                </div>'''
                            )
                        else:
                            st.session_state.chat_history.append(
                                f'''<div class="message system-message">
                                    <div class="message-content">❌ Failed to save memory</div>
                                </div>'''
                            )
                            
                    except Exception as embed_error:
                        st.session_state.chat_history.append(
                            f'''<div class="message system-message">
                                <div class="message-content">❌ Error: {str(embed_error)[:60]}...</div>
                            </div>'''
                        )
                else:
                    st.session_state.chat_history.append(
                        f'''<div class="message system-message">
                            <div class="message-content">❌ Please provide content after "add:"</div>
                        </div>'''
                    )
            else:
                # Query Mode
                try:
                    # Create query embedding
                    query_embedding_response = openai_client.embeddings.create(
                        model="text-embedding-3-small",
                        input=user_input
                    )
                    query_embedding = query_embedding_response.data[0].embedding
                    
                    context_items = []
                    
                    # Search memories
                    try:
                        context_result = supabase.rpc("match_project_memory", {
                            "query_embedding": query_embedding,
                            "match_threshold": 0.05,
                            "match_count": 5
                        }).execute()
                        
                        context_items = context_result.data if context_result.data else []
                        
                    except Exception:
                        context_items = fallback_search(query_embedding)
                    
                    context = "\n".join([item['content'] for item in context_items])
                    
                    # Call OpenAI
                    if context:
                        prompt = f"""You are a helpful AI assistant with access to the user's stored memories.

User Question: {user_input}

Relevant Memories:
{context}

Please provide a helpful answer based on the user's question and the relevant memories above."""
                    else:
                        prompt = f"""You are a helpful AI assistant. The user asked: {user_input}

No relevant memories were found. Please provide a helpful general response."""
                    
                    chat_response = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a helpful AI assistant."},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=500,
                        temperature=0.7
                    )
                    
                    response_text = chat_response.choices[0].message.content
                    
                    if context_items:
                        response_text += f"\n\n*Found {len(context_items)} relevant memories*"
                    
                    st.session_state.chat_history.append(
                        f'''<div class="message ai-message">
                            <div class="message-content">{response_text}</div>
                        </div>'''
                    )
                    
                except Exception as query_error:
                    st.session_state.chat_history.append(
                        f'''<div class="message system-message">
                            <div class="message-content">❌ Query failed: {str(query_error)[:60]}...</div>
                        </div>'''
                    )
        
        except Exception:
            st.session_state.chat_history.append(
                f'''<div class="message system-message">
                    <div class="message-content">❌ Something went wrong</div>
                </div>'''
            )
    
    st.rerun()

# Clear chat button (only show if there's chat history)
if st.session_state.chat_history:
    if st.button("🗑️ Clear Chat", key="clear_chat"):
        st.session_state.chat_history = []
        st.rerun()