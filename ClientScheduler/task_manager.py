import datetime
import pandas as pd
from typing import List, Dict, Any, Optional
import logging
from database import DatabaseManager

class TaskManager:
    """Comprehensive task management with CRUD operations and organization."""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db = db_manager if db_manager else DatabaseManager()
    
    def add_task(self, task_data: Dict[str, Any]) -> bool:
        try:
            required_fields = ['name', 'category', 'priority', 'due_date', 'duration']
            for field in required_fields:
                if field not in task_data:
                    logging.error(f"Missing required field: {field}")
                    return False
            return self.db.add_task(task_data)
        except Exception as e:
            logging.error(f"Error adding task: {str(e)}")
            return False

    def update_task(self, task_id: int, updates: Dict[str, Any]) -> bool:
        logging.warning("Update task not fully implemented in DB-backed TaskManager yet.")
        return False
        
    def delete_task(self, task_id: int) -> bool:
        logging.warning("Delete by ID needs DB update. Wrapper implementation pending.")
        return False
        
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        # Fetch directly from DB session
        session = self.db.get_session()
        if not session:
            return []
        try:
            # We import Task here to avoid circular dependencies if any
            from database import Task
            tasks = session.query(Task).all()
            return [{
                'id': t.id,
                'name': t.name,
                'category': t.category,
                'priority': t.priority,
                'due_date': t.due_date,
                'duration': t.duration,
                'completed': t.completed
            } for t in tasks]
        except Exception as e:
            logging.error(f"Error fetching tasks: {e}")
            return []
        finally:
            session.close()

    def get_tasks(self, **kwargs) -> List[Dict[str, Any]]:
        # Simple wrapper around get_all_tasks with manual filtering for now
        tasks = self.get_all_tasks()
        # TODO: Implement filtering logic if needed
        return tasks

    def get_task_statistics(self) -> Dict[str, Any]:
        all_tasks = self.get_all_tasks()
        if not all_tasks:
            return {'total_tasks': 0}
            
        pending = len([t for t in all_tasks if not t['completed']])
        completed = len(all_tasks) - pending
        
        return {
            'total_tasks': len(all_tasks),
            'pending_tasks': pending,
            'completed_tasks': completed,
            'completion_rate': (completed / len(all_tasks) * 100)
        }
    
    def search_tasks(self, query: str) -> List[Dict[str, Any]]:
        tasks = self.get_all_tasks()
        return [t for t in tasks if query.lower() in t['name'].lower()]
