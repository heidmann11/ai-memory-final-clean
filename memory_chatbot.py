# memory_chatbot.py
from dotenv import load_dotenv
import os

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Init clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Store memory
def store_memory(note):
    embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=note
    ).data[0].embedding

    supabase_client.table("project_memory").insert({
        "content": note,
        "embedding": embedding
    }).execute()
    print(f"✅ Stored: {note}")

# Retrieve context
def retrieve_context(query, match_count=5):
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding

    response = supabase_client.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": match_count
    }).execute()

    return [item['content'] for item in response.data]

# Ask the AI
def ask_ai(question):
    context = "\n".join(retrieve_context(question))
    prompt = f"Context:\n{context}\n\nQuestion: {question}"

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert software architect."},
            {"role": "user", "content": prompt}
        ]
    )
    print("\n🤖 Answer:", response.choices[0].message.content)

# Interactive CLI
if __name__ == "__main__":
    print("🧠 AI Memory Chat (type 'exit' to quit, 'add: your note' to store memory)")
    while True:
        user_input = input("\n> ").strip()
        if user_input.lower() == "exit":
            break
        elif user_input.lower().startswith("add:"):
            note = user_input[4:].strip()
            store_memory(note)
        elif user_input:
            ask_ai(user_input)
