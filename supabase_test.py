from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env.local or .env file

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
    exit()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Check stored memories
try:
    data = supabase.table("project_memory").select("*").limit(5).execute()
    print("\n✅ Table Data:")
    print(data.data)

    # ✅ Test RPC (pgvector search)
    query_embedding = [0.1] * 1536  # Dummy vector
    resp = supabase.rpc("match_project_memory", {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": 5
    }).execute()
    print("\n✅ RPC Response:")
    print(resp.data)
except Exception as e:
    print(f"❌ Error: {e}")

