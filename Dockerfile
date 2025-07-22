# Use official Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Environment variables (placeholders, real values injected by Railway)
ENV OPENAI_API_KEY=""
ENV SUPABASE_URL=""
ENV SUPABASE_KEY=""

# Expose port for Streamlit (Railway injects $PORT)
EXPOSE 8080

# Run Streamlit app
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port $PORT --server.address 0.0.0.0"]
