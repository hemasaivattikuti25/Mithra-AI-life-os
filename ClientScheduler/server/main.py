import os
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from supabase import create_client, Client
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# --- 1. Infrastructure Setup ---

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Validate env vars
if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    logging.warning("Missing one or more required environment variables: SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
genai.configure(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Set up Gemini Model
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

app = FastAPI(title="Mithra API", description="The Brain of the Mithra Productivity System")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    # In production, specify exact domains e.g., ["https://mithra-app.com"]
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Data Models ---

class Task(BaseModel):
    title: str
    status: str = "pending" # pending, completed, cancelled
    priority: str = "Medium" # High, Medium, Low
    due_date: Optional[str] = None
    category: Optional[str] = "Personal" # Work, Health, Personal
    user_id: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    user_id: str

class ScheduleRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class ScheduleEvent(BaseModel):
    title: str
    start_time: Optional[str] = None
    category: str
    priority: str

class ScheduleResponse(BaseModel):
    events: List[ScheduleEvent]

# --- 3. Helper Functions ---

async def get_embedding(text: str) -> List[float]:
    """
    Generates a vector embedding for the given text using Gemini.
    """
    if not GEMINI_API_KEY:
         raise HTTPException(status_code=500, detail="Gemini API Key not configured")
         
    try:
        # Use embedding-001 or similar suitable model for retrieval
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
            title="Mithra Journal Entry"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return a zero vector or raise error depending on strictness
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

async def search_similar_memories(query_embedding: List[float], user_id: str, threshold: float = 0.5, count: int = 5):
    """
    Searches Supabase for similar journal entries using pgvector.
    Requires the 'match_journal_entries' RPC function to exist in DB.
    """
    if not supabase:
        print("Supabase client not initialized")
        return []

    try:
        response = supabase.rpc(
            "match_journal_entries",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": count
            }
        ).execute()
        return response.data
    except Exception as e:
        print(f"Vector search failed: {e}")
        return []

# --- 4. API Endpoints ---

@app.get("/")
def health_check():
    return {"status": "active", "system": "Mithra Brain Online"}

@app.post("/api/chat")
async def chat_with_dost(request: ChatRequest):
    """
    The 'Dost' AI Engine.
    1. Embeds user message.
    2. Retrieves context from past journals.
    3. Generates helpful response using detailed context.
    4. Saves the interaction.
    """
    try:
        # 1. Embed
        message_embedding = await get_embedding(request.message)
        
        # 2. Recall (RAG)
        # Note: We filter by user_id in retrieval ideally, but the simple RPC might need modification to accept user_id
        # For now, we assume the RPC handles it or we're in single-user mode for MVP
        similar_memories = await search_similar_memories(message_embedding, request.user_id)
        
        context_str = ""
        if similar_memories:
            context_str = "\n".join([f"- {m['content']} (Similarity: {m['similarity']:.2f})" for m in similar_memories])
        
        # 3. Generate
        system_prompt = """You are Dost, a supportive, insightful, and slightly strict productivity companion. 
        Your goal is to help the user master their time and emotions.
        
        Use the following Context (retrieved from the user's past journals) to inform your response.
        If the user refers to past events, check the context.
        Keep your response concise (under 100 words), conversational, and empathetic but action-oriented.
        """
        
        full_prompt = f"{system_prompt}\n\n[Context Memory]:\n{context_str}\n\n[User]: {request.message}\n[Dost]:"
        
        response = model.generate_content(full_prompt)
        dost_reply = response.text
        
        # 4. Save to Journal (Memory)
        # We save the *user's* message to build the memory bank.
        # Ideally, we also save the AI's reply or the conversation turn, but for now, we index the user's input/feelings.
        if supabase:
            supabase.table("journal_entries").insert({
                "content": request.message, # In a real app, might want to categorize valid "memories" vs chatter
                "user_id": request.user_id,
                "embedding": message_embedding,
                "mood_score": 5 # Placeholder, or extract from text using Gemini
            }).execute()

        return {
            "reply": dost_reply,
            "context_used": len(similar_memories) > 0
        }

    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-schedule")
async def parse_schedule(request: ScheduleRequest):
    """
    Parses natural language into structured schedule events using Gemini Structured Output.
    """
    try:
        # Define the schema we want back
        prompt = f"""
        Extract schedule events from the following text: "{request.text}".
        
        Return a JSON object with a list of "events". 
        Each event should have:
        - title: A short description.
        - start_time: ISO 8601 string (assume today is {datetime.now().date()} if not specified).
        - category: One of "Work", "Health", "Personal".
        - priority: "High" or "Medium".
        
        If no time is mentioned, set start_time to null.
        """
        
        # Using Gemini 1.5 Flash's ability to output JSON
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON string result
        import json
        try:
            cleaned_text = response.text.strip()
            # Handle potential markdown code blocks ```json ... ```
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text.split("\n", 1)[1].rsplit("\n", 1)[0]
                
            data = json.loads(cleaned_text)
            return data # Should match {"events": [...]} format
            
        except json.JSONDecodeError:
             # Fallback parsing or re-prompting logic could go here
             print(f"Failed to parse JSON: {response.text}")
             raise HTTPException(status_code=500, detail="Failed to parse schedule from AI response")

    except Exception as e:
        logging.error(f"Schedule parse error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Hot reload enabled for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
