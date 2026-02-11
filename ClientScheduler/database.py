import os
import sqlite3
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from datetime import datetime, date

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create base class for database models
Base = declarative_base()

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), default='personal')
    priority = Column(String(20), default='medium')
    due_date = Column(Date, nullable=False)
    duration = Column(Integer, default=60)
    notes = Column(Text, default='')
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Schedule(Base):
    __tablename__ = 'schedules'
    
    id = Column(Integer, primary_key=True)
    task_name = Column(String(200), nullable=False)
    start_time = Column(String(10))
    end_time = Column(String(10))
    duration = Column(Integer)
    category = Column(String(50))
    priority = Column(String(20))
    schedule_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analytics(Base):
    __tablename__ = 'analytics'
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer)
    task_name = Column(String(200))
    category = Column(String(50))
    priority = Column(String(20))
    completed = Column(Boolean)
    completion_date = Column(Date)
    duration_minutes = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class JournalEntry(Base):
    __tablename__ = 'journal_entries'
    
    id = Column(Integer, primary_key=True)
    entry_date = Column(Date, default=date.today)
    mood = Column(String(50))
    content = Column(Text, nullable=False)
    sentiment_score = Column(Integer, default=0)  # -10 to 10 scale
    tags = Column(String(200)) # Comma separated tags
    created_at = Column(DateTime, default=datetime.utcnow)

class DatabaseManager:
    def __init__(self):
        self.engine = None
        self.Session = None
        self.setup_database()
    
    def setup_database(self):
        """Setup database connection"""
        try:
            # Check if DATABASE_URL is available (for production)
            database_url = os.getenv('DATABASE_URL')
            
            if database_url:
                # Use PostgreSQL for production
                self.engine = create_engine(database_url)
                logger.info("✅ Connected to PostgreSQL database!")
            else:
                # Use SQLite for development/demo
                db_path = "mitra_ai.db"
                self.engine = create_engine(f"sqlite:///{db_path}")
                logger.info("📁 Using local SQLite database for demo")
            
            # Create all tables
            Base.metadata.create_all(self.engine)
            
            # Create session factory
            self.Session = sessionmaker(bind=self.engine)
            
        except Exception as e:
            logger.error(f"❌ Database setup error: {str(e)}")
            # Fallback to session state storage
            self.engine = None
            self.Session = None
    
    def get_session(self):
        """Get database session"""
        if self.Session:
            return self.Session()
        return None
    
    def add_task(self, task_data):
        """Add task to database"""
        session = self.get_session()
        if not session:
            return False
        
        try:
            task = Task(
                name=task_data['name'],
                category=task_data['category'],
                priority=task_data['priority'],
                due_date=task_data['due_date'],
                duration=task_data['duration'],
                notes=task_data.get('notes', ''),
                completed=task_data.get('completed', False)
            )
            session.add(task)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting task: {str(e)}")
            return False
        finally:
            session.close()
    
    def get_tasks(self, category=None, priority=None, completed=None):
        """Get tasks from database"""
        session = self.get_session()
        if not session:
            return []
        
        try:
            query = session.query(Task)
            
            if category:
                query = query.filter(Task.category == category)
            if priority:
                query = query.filter(Task.priority == priority)
            if completed is not None:
                query = query.filter(Task.completed == completed)
            
            tasks = query.order_by(Task.priority.desc(), Task.due_date).all()
            
            # Convert to dict format
            result = []
            for task in tasks:
                result.append({
                    'id': task.id,
                    'name': task.name,
                    'category': task.category,
                    'priority': task.priority,
                    'due_date': task.due_date,
                    'duration': task.duration,
                    'notes': task.notes,
                    'completed': task.completed,
                    'created_at': task.created_at
                })
            
            return result
        except Exception as e:
            st.error(f"Error getting tasks: {str(e)}")
            return []
        finally:
            session.close()
    
    def update_task_status(self, task_id, completed):
        """Update task completion status"""
        session = self.get_session()
        if not session:
            return False
        
        try:
            task = session.query(Task).filter(Task.id == task_id).first()
            if task:
                task.completed = completed
                task.updated_at = datetime.utcnow()
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            st.error(f"Error updating task: {str(e)}")
            return False
        finally:
            session.close()
    
    def delete_task(self, task_id):
        """Delete task from database"""
        session = self.get_session()
        if not session:
            return False
        
        try:
            task = session.query(Task).filter(Task.id == task_id).first()
            if task:
                session.delete(task)
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            st.error(f"Error deleting task: {str(e)}")
            return False
        finally:
            session.close()
    
    def save_schedule(self, schedule_items, schedule_date):
        """Save schedule to database"""
        session = self.get_session()
        if not session:
            return False
        
        try:
            # Clear existing schedule for this date
            session.query(Schedule).filter(Schedule.schedule_date == schedule_date).delete()
            
            # Add new schedule items
            for item in schedule_items:
                schedule = Schedule(
                    task_name=item['task'],
                    start_time=item.get('start_time'),
                    end_time=item.get('end_time'),
                    duration=item.get('duration', 60),
                    category=item.get('category', 'personal'),
                    priority=item.get('priority', 'medium'),
                    schedule_date=schedule_date
                )
                session.add(schedule)
            
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error saving schedule: {str(e)}")
            return False
        finally:
            session.close()
    
    def get_schedule(self, schedule_date):
        """Get schedule for a specific date"""
        session = self.get_session()
        if not session:
            return []
        
        try:
            schedules = session.query(Schedule).filter(
                Schedule.schedule_date == schedule_date
            ).order_by(Schedule.start_time).all()
            
            result = []
            for schedule in schedules:
                result.append({
                    'task': schedule.task_name,
                    'start_time': schedule.start_time,
                    'end_time': schedule.end_time,
                    'duration': schedule.duration,
                    'category': schedule.category,
                    'priority': schedule.priority
                })
            return result
        except Exception as e:
            logger.error(f"Error getting schedule: {str(e)}")
            return []
        finally:
            session.close()

    def add_journal_entry(self, entry_data):
        """Add a journal entry"""
        session = self.get_session()
        if not session:
            return False
        
        try:
            entry = JournalEntry(
                entry_date=entry_data.get('date', date.today()),
                mood=entry_data.get('mood'),
                content=entry_data['content'],
                sentiment_score=entry_data.get('sentiment_score', 0),
                tags=entry_data.get('tags', '')
            )
            session.add(entry)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding journal entry: {str(e)}")
            return False
        finally:
            session.close()

    def get_journal_entries(self, limit=10):
        """Get recent journal entries"""
        session = self.get_session()
        if not session:
            return []
        
        try:
            entries = session.query(JournalEntry).order_by(JournalEntry.created_at.desc()).limit(limit).all()
            return entries
        except Exception as e:
            logger.error(f"Error getting journal entries: {str(e)}")
            return []
        finally:
            session.close()
def get_database_manager():
    return DatabaseManager()