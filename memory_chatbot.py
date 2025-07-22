import streamlit as st
from openai import OpenAI
from supabase import create_client
import os
from datetime import datetime
import time

# Configure the page with custom styling
st.set_page_config(
    page_title="Enterprise AI Memory Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for professional styling
st.markdown("""
<style>
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Custom styling */
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }
    
    .main-header h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 600;
    }
    
    .main-header p {
        margin: 0.5rem 0 0 0;
        font-size: 1.1rem;
        opacity: 0.9;
    }
    
    .memory-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #667eea;
        margin: 1rem 0;
    }
    
    .stats-container {
        display: flex;
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .stat-card {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        flex: 1;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #667eea;
    }
    
    .stat-label {
        color: #666;
        font-size: 0.9rem;
    }
    
    .chat-container {
        background: white;
        border-radius: 10px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin: 2rem 0;
    }
    
    .success-message {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #c3e6cb;
        margin: 1rem 0;
    }
    
    .ai-response {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #28a745;
        margin: 1rem 0;
    }
    
    .input-container {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Validate environment variables
if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    st.error("⚠️ Missing environment variables. Please configure your API keys.")
    st.stop()

# Initialize clients
try:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    st.error(f"❌ Failed to initialize services: {str(e)}")
    st.stop()

# Header section
st.markdown("""
<div class="main-header">
    <h1>🧠 Enterprise AI Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets</p>
</div>
""", unsafe_allow_html=True)

# Sidebar for settings and info
with st.sidebar:
    st.markdown("### 📊 Quick Stats")
    
    # Simple stats (you can enhance these)
    if 'total_memories' not in st.session_state:
        st.session_state.total_memories = 0
    if 'total_questions' not in st.session_state:
        st.session_state.total_questions = 0
    
    st.metric("Total Memories", st.session_state.total_memories)
    st.metric("Questions Asked", st.session_state.total_questions)
    
    st.markdown("---")
    st.markdown("### 💡 How to Use")
    st.markdown("""
    **Add Memory:**
    `add: Your important note here`
    
    **Ask Questions:**
    Simply type your question and get contextual responses based on your stored memories.
    
    **Examples:**
    - `add: Meeting with client about new feature requirements`
    - `What features did the client request?`
    - `add: Bug found in payment system`
    - `What bugs are currently open?`
    """)

# Main content area
col1, col2 = st.columns([3, 1])

with col1:
    # Input section
    st.markdown('<div class="input-container">', unsafe_allow_html=True)
    st.markdown("### 💬 Enter your message")
    
    user_input = st.text_area(
        "Type your message here...",
        height=100,
        placeholder="Add a memory with 'add: your note' or ask any question",
        label_visibility="collapsed"
    )
    
    col_submit, col_clear = st.columns([1, 4])
    with col_submit:
        submit_button = st.button("📤 Submit", type="primary", use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.markdown("### 🔧 Actions")
    if st.button("🗑️ Clear Chat", use_container_width=True):
        st.session_state.messages = []
        st.rerun()
    
    if st.button("📥 Export Memories", use_container_width=True):
        st.info("Export feature coming soon!")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Functions
def store_memory(note):
    """Store memory in Supabase with timestamp"""
    try:
        # Create embedding
        embedding = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=note
        ).data[0].embedding
        
        # Store in Supabase
        supabase_client.table("project_memory").insert({
            "content": note,
            "embedding": embedding,
            "created_at": datetime.now().isoformat()
        }).execute()
        
        st.session_state.total_memories += 1
        return True
    except Exception as e:
        st.error(f"❌ Failed to store memory: {str(e)}")
        return False

def retrieve_context(query, match_count=5):
    """Retrieve similar context from stored memories"""
    try:
        # Create query embedding
        query_embedding = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        ).data[0].embedding
        
        # Search similar memories
        response = supabase_client.rpc("match_project_memory", {
            "query_embedding": query_embedding,
            "match_threshold": 0.0,
            "match_count": match_count
        }).execute()
        
        return [item['content'] for item in response.data]
    except Exception as e:
        st.error(f"❌ Failed to retrieve context: {str(e)}")
        return []

def ask_ai(question):
    """Get AI response with memory context"""
    try:
        # Get relevant context
        context = retrieve_context(question)
        context_text = "\n".join(context) if context else "No relevant memories found."
        
        # Create prompt with context
        prompt = f"""Based on the following context from previous conversations and stored memories, please answer the question.

Context:
{context_text}

Question: {question}

Please provide a helpful and accurate response. If the context doesn't contain relevant information, let the user know."""

        # Get AI response
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert AI assistant helping with enterprise software development. You have access to stored memories and context from previous conversations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        st.session_state.total_questions += 1
        return response.choices[0].message.content, context
    except Exception as e:
        st.error(f"❌ Failed to get AI response: {str(e)}")
        return "Sorry, I encountered an error processing your request.", []

# Handle form submission
if submit_button and user_input.strip():
    # Add user message to chat history
    st.session_state.messages.append({
        "role": "user",
        "content": user_input.strip(),
        "timestamp": datetime.now()
    })
    
    if user_input.lower().startswith("add:"):
        # Store memory
        note = user_input[4:].strip()
        if store_memory(note):
            success_msg = f"✅ Memory stored successfully: '{note}'"
            st.session_state.messages.append({
                "role": "system",
                "content": success_msg,
                "timestamp": datetime.now()
            })
    else:
        # Get AI response
        with st.spinner("🤔 Thinking..."):
            ai_response, context = ask_ai(user_input)
            st.session_state.messages.append({
                "role": "assistant",
                "content": ai_response,
                "context": context,
                "timestamp": datetime.now()
            })

# Display chat history
if st.session_state.messages:
    st.markdown("### 💬 Conversation History")
    
    for msg in reversed(st.session_state.messages[-10:]):  # Show last 10 messages
        timestamp = msg["timestamp"].strftime("%H:%M")
        
        if msg["role"] == "user":
            st.markdown(f"""
            <div style="text-align: right; margin: 1rem 0;">
                <div style="background: #667eea; color: white; padding: 1rem; border-radius: 15px 15px 5px 15px; display: inline-block; max-width: 80%;">
                    <strong>You</strong> <span style="opacity: 0.8; font-size: 0.8rem;">({timestamp})</span><br>
                    {msg['content']}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        elif msg["role"] == "system":
            st.markdown(f"""
            <div class="success-message">
                <strong>System</strong> <span style="opacity: 0.8; font-size: 0.8rem;">({timestamp})</span><br>
                {msg['content']}
            </div>
            """, unsafe_allow_html=True)
            
        else:  # assistant
            st.markdown(f"""
            <div class="ai-response">
                <strong>🤖 AI Assistant</strong> <span style="opacity: 0.8; font-size: 0.8rem;">({timestamp})</span><br>
                {msg['content']}
            </div>
            """, unsafe_allow_html=True)
            
            # Show context if available
            if 'context' in msg and msg['context']:
                with st.expander("📚 Relevant Memories Used"):
                    for i, memory in enumerate(msg['context'][:3], 1):
                        st.markdown(f"**{i}.** {memory}")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 2rem;">
    <p>🧠 Enterprise AI Memory Assistant - Built with Streamlit, OpenAI, and Supabase</p>
    <p>Your intelligent companion for enterprise knowledge management</p>
</div>
""", unsafe_allow_html=True)