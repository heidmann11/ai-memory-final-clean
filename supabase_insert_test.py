import os
from supabase import create_client
from dotenv import load_dotenv

# ✅ Load environment
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Must be service_role for writes!

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Insert Test Row
test_data = {
    "content": "This is a test entry",
    "embedding": [0.0] * 1536  # exactly 1536 dimensions
}

try:
    response = supabase.table("project_memory").insert(test_data).execute()
    print("✅ Insert Successful:", response.data)
except Exception as e:
    print("❌ Error:", e)

# ✅ Fetch latest rows
try:
    response = supabase.table("project_memory").select("*").limit(5).execute()
    print("📌 Latest Rows:", response.data)
except Exception as e:
    print("❌ Fetch Error:", e)
