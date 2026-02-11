# Mithra Backend Setup

## 1. Environment Setup
Make sure you have your API keys ready.
Open `server/config.py` and replace the placeholder strings with your actual keys:
- **SUPABASE_URL**: Your project URL.
- **SUPABASE_KEY**: Your `service_role` key (for backend usage) or `anon` key.
- **GEMINI_API_KEY**: Your Google AI Studio key.

## 2. Database Initialization
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> SQL Editor.
2. Copy the contents of `server/setup_database.sql`.
3. Paste and run it to create the tables and vector extension.

## 3. Install Dependencies
```bash
pip install -r requirements.txt
```

## 4. Run the Server
```bash
python api.py
```
or 
```bash
uvicorn api:app --reload
```

The API will be live at `http://localhost:8000`.
Docs are at `http://localhost:8000/docs`.
