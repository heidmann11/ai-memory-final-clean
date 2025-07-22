FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose the Railway port
EXPOSE 8080

# Use shell to evaluate $PORT dynamically
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port=$PORT --server.address=0.0.0.0"]

