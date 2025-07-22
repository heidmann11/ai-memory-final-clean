# ✅ Use official Python image
FROM python:3.10-slim

# ✅ Set work directory
WORKDIR /app

# ✅ Copy project files
COPY . .

# ✅ Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ✅ Expose Streamlit port
EXPOSE 8501

# ✅ Run Streamlit
CMD ["streamlit", "run", "memory_chatbot.py", "--server.port=8501", "--server.address=0.0.0.0"]

