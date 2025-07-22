# Use official Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# ✅ Explicitly set environment variables for Streamlit from Railway
ENV STREAMLIT_SERVER_PORT=$PORT
ENV STREAMLIT_SERVER_ADDRESS=0.0.0.0

# ✅ Expose port (important for Railway)
EXPOSE 8080

# ✅ Command to run the app
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port $PORT --server.address 0.0.0.0"]
