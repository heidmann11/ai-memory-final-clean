import streamlit as st
from PIL import Image
import os

# ✅ Page Configuration
st.set_page_config(page_title="Corval.ai Memory Assistant", layout="wide")

# ✅ Load Logo
logo_path = os.path.join("app", "static", "corval_logo.png")
if os.path.exists(logo_path):
    logo = Image.open(logo_path)
else:
    st.error("Logo file not found. Please ensure corval_logo.png is in app/static/")

# ✅ Custom CSS for Styling
st.markdown("""
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background-color: #f9fafb;
        }
        .logo-container {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .banner {
            text-align: center;
            background: linear-gradient(90deg, #0f172a, #1d4ed8);
            color: white;
            padding: 40px 20px;
            border-radius: 12px;
            margin: 10px auto;
            width: 90%;
        }
        .banner h1 {
            font-size: 36px;
            font-weight: 700;
            margin: 0;
        }
        .banner p {
            font-size: 16px;
            margin: 10px 0 0;
        }
        .response-container {
            background: white;
            padding: 20px;
            margin: 20px auto;
            width: 90%;
            min-height: 350px;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .input-container {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 800px;
            background: white;
            padding: 15px;
            border-radius: 50px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            display: flex;
            justify-content: space-between;
        }
        .input-container input {
            width: 85%;
            padding: 10px 15px;
            border: none;
            outline: none;
            font-size: 16px;
        }
        .input-container button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 16px;
            cursor: pointer;
        }
        .input-container button:hover {
            background: #1d4ed8;
        }
    </style>
""", unsafe_allow_html=True)

# ✅ Logo at Top Center
st.markdown('<div class="logo-container">', unsafe_allow_html=True)
if logo:
    st.image(logo, width=180)
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Header Banner
st.markdown("""
<div class="banner">
    <h1>Corval.ai Memory Assistant</h1>
    <p>Your intelligent knowledge companion that never forgets.</p>
</div>
""", unsafe_allow_html=True)

# ✅ Response Section
st.markdown('<div class="response-container">', unsafe_allow_html=True)
st.write("Latest responses will appear here...")
st.markdown('</div>', unsafe_allow_html=True)

# ✅ Floating Input Bar
st.markdown("""
<div class="input-container">
    <input type="text" placeholder="Ask me something or add your note..." />
    <button>Submit</button>
</div>
""", unsafe_allow_html=True)
