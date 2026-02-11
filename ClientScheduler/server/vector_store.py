import chromadb
from chromadb.utils import embedding_functions
import os
import uuid
from typing import List, Dict, Any

class VectorStore:
    def __init__(self, persist_dir="mitra_vectordb"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        # Use default embedding function (all-MiniLM-L6-v2)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        
        self.collection = self.client.get_or_create_collection(
            name="tasks",
            embedding_function=self.embedding_fn
        )

    def add_task_embedding(self, task: Dict[str, Any]):
        """Add a task to the vector database for semantic search."""
        # Create a rich textual representation of the task
        document = f"{task['name']} - Category: {task['category']} - Priority: {task['priority']} - Note: {task.get('notes', '')}"
        
        self.collection.upsert(
            documents=[document],
            metadatas=[{
                "category": task['category'],
                "priority": task['priority'],
                "duration": task.get('duration', 60),
                "task_id": str(task.get('id', uuid.uuid4()))
            }],
            ids=[str(task.get('id', uuid.uuid4()))]
        )

    def find_similar_tasks(self, query: str, n_results=3) -> List[Dict[str, Any]]:
        """Find meaningful similar tasks (e.g., to suggest duration)."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Parse results back to list of dicts
        similar_tasks = []
        if results['metadatas']:
            for i, meta in enumerate(results['metadatas'][0]):
                 similar_tasks.append({
                     'task_context': results['documents'][0][i],
                     **meta
                 })
                 
        return similar_tasks
