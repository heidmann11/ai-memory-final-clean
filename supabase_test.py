import os
from supabase import create_client
from dotenv import load_dotenv

# ✅ Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file!")
    exit()

# ✅ Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Test query: Check latest memory entries
try:
    response = supabase.table("project_memory").select("*").limit(5).execute()

    print("\n✅ Supabase Connection Successful!")
    print(f"📌 Total rows fetched: {len(response.data)}")

    if response.data:
        print("\nLatest Entries:")
        for row in response.data:
            print(f"- {row.get('content', 'No content')} (ID: {row.get('id')})")
    else:
        print("⚠ No data found in project_memory table.")
except Exception as e:
    print(f"❌ Error: {e}")
