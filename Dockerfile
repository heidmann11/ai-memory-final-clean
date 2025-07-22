FROM python:3.9

# Set work directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose Railway port
EXPOSE 8080

# ✅ Pass environment variables to Streamlit
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port=$PORT --server.address=0.0.0.0"]

