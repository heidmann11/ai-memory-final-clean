# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Railway's dynamic port
EXPOSE 8080

# Command to run the app
CMD streamlit run memory_chatbot.py --server.port=$PORT --server.address=0.0.0.0
