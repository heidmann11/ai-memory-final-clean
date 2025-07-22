FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set $PORT automatically)
EXPOSE 8080

# Use Railway's PORT environment variable
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port=$PORT --server.address=0.0.0.0 --server.headless=true"]

