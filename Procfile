### FILE 1: Procfile (NO FILE EXTENSION!)
web: streamlit run app.py --server.port $PORT --server.address 0.0.0.0 --server.headless true

### FILE 2: requirements.txt
streamlit==1.28.1
openai==1.3.0
supabase==2.0.0
python-dotenv==1.0.0
Pillow==10.0.1
numpy==1.24.3

### FILE 3: .streamlit/config.toml (create .streamlit folder first)
[server]
headless = true
port = 8501

[theme]
base = "light"

### FILE 4: .gitignore (optional but recommended)
__pycache__/
*.pyc
*.pyo
*.pyd
.env
.env.local
.env.example
node_modules/
.DS_Store
*.log