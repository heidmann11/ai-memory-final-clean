FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# ✅ Streamlit uses Railway PORT dynamically
CMD ["sh", "-c", "streamlit run memory_chatbot.py --server.port=$PORT --server.address=0.0.0.0"]

