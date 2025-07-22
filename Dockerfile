# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Streamlit default port
EXPOSE 8501

# Set environment variable to disable Streamlit telemetry
ENV STREAMLIT_TELEMETRY=False

# Run Streamlit app
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port=$PORT --server.address=0.0.0.0"]

