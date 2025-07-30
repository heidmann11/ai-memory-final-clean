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

# ✅ Enhanced CSS - Purple theme with sticky bottom input
st.markdown("""
    <style>
        /* Hide Streamlit elements */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .stDeployButton {display: none;}
        
        /* Main app styling */
        .stApp {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        /* Remove default padding and add space for fixed input */
        .main .block-container {
            padding-top: 1rem;
            padding-bottom: 120px;
            max-width: 100%;
        }
        
        /* Logo and Header */
        .header-banner {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            border-radius: 0;
            margin: 0 0 20px 0;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;
        }
        
        .logo-container {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(255,255,255,0.3);
            flex-shrink: 0;
        }
        
        .logo-fallback {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .brand-icon {
            font-size: 2rem;
            margin-bottom: 2px;
        }
        
        .brand-text {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 1px;
        }
        
        .header-content h1 {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .header-content p {
            margin: 0;
            font-size: 1rem;
            opacity: 0.9;
        }
        
        /* Stats */
        .stats-container {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 15px 0 25px 0;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 16px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
        
        /* Chat container */
        .chat-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 20px;
            min-height: 60vh;
        }
        
        /* Message styling */
        .message {
            margin: 15px 0;
            display: flex;
            width: 100%;
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .user-message {
            justify-content: flex-end;
        }
        
        .ai-message {
            justify-content: flex-start;
        }
        
        .system-message {
            justify-content: center;
        }
        
        .message-content {
            max-width: 75%;
            padding: 12px 18px;
            border-radius: 18px;
            font-size: 15px;
            line-height: 1.4;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .user-message .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .ai-message .message-content {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            border: 1px solid rgba(102, 126, 234, 0.2);
            border-bottom-left-radius: 4px;
        }
        
        .system-message .message-content {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
            font-size: 14px;
            max-width: 400px;
            text-align: center;
        }
        
        /* Welcome screen */
        .welcome-container {
            text-align: center;
            padding: 30px 20px;
        }
        
        .welcome-title {
            font-size: 24px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .welcome-subtitle {
            font-size: 16px;
            margin-bottom: 25px;
            color: #666;
        }
        
        .tip-card {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(102, 126, 234, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin: 12px auto;
            max-width: 350px;
            text-align: left;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .tip-title {
            font-weight: 600;
            color: #667eea;
            margin-bottom: 6px;
        }
        
        .tip-description {
            font-size: 14px;
            color: #666;
        }
        
        /* Fixed bottom input container - more aggressive positioning */
        .input-container {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(15px) !important;
            border-top: 1px solid rgba(102, 126, 234, 0.2) !important;
            padding: 15px 20px !important;
            z-index: 9999 !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1) !important;
            width: 100% !important;
            height: auto !important;
            min-height: 80px !important;
        }
        
        /* Target the Streamlit form directly */
        .input-container [data-testid="stForm"] {
            max-width: 800px !important;
            margin: 0 auto !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            width: 100% !important;
        }
        
        .input-container .stForm {
            max-width: 800px !important;
            margin: 0 auto !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            width: 100% !important;
        }
        
        /* Make sure the fixed container is always visible */
        #fixed-input-container {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(15px) !important;
            border-top: 1px solid rgba(102, 126, 234, 0.2) !important;
            padding: 15px 20px !important;
            z-index: 99999 !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1) !important;
            width: 100% !important;
            display: block !important;
        }
        
        /* Force the main content to have bottom padding */
        .main .block-container {
            padding-top: 1rem !important;
            padding-bottom: 100px !important;
            max-width: 100% !important;
        }
        
        /* Ensure nothing overlaps our fixed input */
        .stApp > div:last-child {
            margin-bottom: 80px !important;
        }
        
        /* Input field styling */
        .input-container .stTextArea > div > div > textarea {
            border: 2px solid rgba(102, 126, 234, 0.3) !important;
            border-radius: 20px !important;
            padding: 12px 18px !important;
            font-size: 15px !important;
            resize: none !important;
            max-height: 120px !important;
            min-height: 48px !important;
            background: rgba(255, 255, 255, 0.9) !important;
            color: #333 !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            transition: all 0.3s ease !important;
        }
        
        .input-container .stTextArea > div > div > textarea:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
            background: rgba(255, 255, 255, 1) !important;
        }
        
        /* Send button styling */
        .stButton > button,
        .stFormSubmitButton > button,
        [data-testid="stFormSubmitButton"] button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 20px !important;
            padding: 12px 24px !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            height: 48px !important;
            min-width: 90px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
        }
        
        .stButton > button:hover,
        .stFormSubmitButton > button:hover,
        [data-testid="stFormSubmitButton"] button:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
        }
        
        /* Clear button styling */
        .clear-button {
            background: transparent !important;
            color: #667eea !important;
            border: 2px solid rgba(102, 126, 234, 0.3) !important;
            border-radius: 16px !important;
            padding: 8px 20px !important;
            font-size: 14px !important;
            margin: 20px auto !important;
            display: block !important;
            transition: all 0.3s ease !important;
        }
        
        .clear-button:hover {
            background: rgba(102, 126, 234, 0.1) !important;
            border-color: #667eea !important;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(245, 247, 250, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
            background: rgba(102, 126, 234, 0.3);
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(102, 126, 234, 0.5);
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

# ✅ Logo Detection and Header
logo_paths = [
    "corval_logo.png",
    "static/corval_logo.png", 
    "app/static/corval_logo.png",
    "assets/corval_logo.png"
]

logo_found = False
logo_element = ""

for logo_path in logo_paths:
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as img_file:
            b64_string = base64.b64encode(img_file.read()).decode()
        logo_element = f'<img src="data:image/png;base64,{b64_string}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover;">'
        logo_found = True
        break

if not logo_found:
    logo_element = '''
    <div class="logo-fallback">
        <div class="brand-icon">🧠</div>
        <div class="brand-text">AI</div>
    </div>
    '''

# Header with logo and branding
st.markdown(f'''
<div class="header-banner">
    <div class="logo-container">
        {logo_element}
    </div>
    <div class="header-content">
        <h1>Corval.ai Memory Assistant</h1>
        <p>Your intelligent knowledge companion that never forgets</p>
    </div>
</div>
''', unsafe_allow_html=True)

# ✅ Stats
try:
    count_result = supabase.table("project_memory").select("id", count="exact").execute()
    memory_count = count_result.count if count_result.count else 0
    
    st.markdown(f'''
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
    ''', unsafe_allow_html=True)
except Exception:
    pass

# ✅ Chat Container
st.markdown('<div class="chat-container">', unsafe_allow_html=True)

# Show welcome message if no chat history
if not st.session_state.chat_history:
    st.markdown('''
    <div class="welcome-container">
        <div class="welcome-title">Welcome to your Memory Assistant</div>
        <div class="welcome-subtitle">Start a conversation below</div>
        
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

st.markdown('</div>', unsafe_allow_html=True)  # Close chat container

# Clear chat button (only show if there's chat history) - moved before input
if st.session_state.chat_history:
    st.markdown('<div style="text-align: center; margin: 20px 0;">', unsafe_allow_html=True)
    if st.button("🗑️ Clear Chat", key="clear_chat"):
        st.session_state.chat_history = []
        st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)

# Add spacer to push content up and ensure input is visible
st.markdown('<div style="height: 120px;"></div>', unsafe_allow_html=True)

# Clear chat button (only show if there's chat history)
if st.session_state.chat_history:
    if st.button("🗑️ Clear Chat", key="clear_chat"):
        st.session_state.chat_history = []
        st.rerun()

# ✅ TRULY FIXED BOTTOM INPUT - Moved to very end
st.markdown("""
<div id="fixed-input-container" class="input-container">
    <!-- Input form will be moved here by JavaScript -->
</div>

<script>
// Wait for page to load then move the input to the bottom
setTimeout(function() {
    // Find the form (it will be at the bottom of the page)
    const forms = document.querySelectorAll('[data-testid="stForm"]');
    const lastForm = forms[forms.length - 1]; // Get the last form (our input form)
    const container = document.getElementById('fixed-input-container');
    
    if (lastForm && container) {
        // Move the form to our fixed container
        container.appendChild(lastForm);
        
        // Make sure it's styled correctly
        lastForm.style.maxWidth = '800px';
        lastForm.style.margin = '0 auto';
        lastForm.style.background = 'transparent';
        lastForm.style.border = 'none';
        lastForm.style.padding = '0';
    }
}, 500); // Wait 500ms for Streamlit to render

// Also try moving it when the page is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const forms = document.querySelectorAll('[data-testid="stForm"]');
        const lastForm = forms[forms.length - 1];
        const container = document.getElementById('fixed-input-container');
        
        if (lastForm && container && !container.contains(lastForm)) {
            container.appendChild(lastForm);
            lastForm.style.maxWidth = '800px';
            lastForm.style.margin = '0 auto';
            lastForm.style.background = 'transparent';
            lastForm.style.border = 'none';
            lastForm.style.padding = '0';
        }
    }, 100);
});
</script>
""", unsafe_allow_html=True)

# Input form - placed at the very end so JavaScript can move it
with st.form(key="chat_form", clear_on_submit=True):
    col1, col2 = st.columns([6, 1])
    
    with col1:
        user_input = st.text_area(
            "Message",
            key="user_input", 
            label_visibility="collapsed",
            placeholder="💡 Type 'add: your note' to save info, or ask me anything...",
            height=48
        )
    
    with col2:
        submit_btn = st.form_submit_button("💜 Send")
if submit_btn and user_input and user_input.strip():
    # Add user message
    st.session_state.chat_history.append(
        f'''<div class="message user-message">
            <div class="message-content">{user_input}</div>
        </div>'''
    )
    
    with st.spinner('🤔 Thinking...'):
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
                        response_text += f"\n\n💡 *Found {len(context_items)} relevant memories*"
                    
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