# File Structure

.
./full_source_code.md
./requirements.txt
./uv.lock
./nlp_processor.py
./schedule_optimizer.py
./mitra_ai.db
./database.py
./pyproject.toml
./server
./server/config.py
./server/requirements.txt
./server/vector_store.py
./server/mitra_ai.db
./server/api.py
./server/mitra_vectordb
./server/mitra_vectordb/chroma.sqlite3
./server/main.py
./mitra_vectordb
./mitra_vectordb/chroma.sqlite3
./utils.py
./task_manager.py
./temp_header.md
./attached_assets
./attached_assets/focus_stopwatch.png
./attached_assets/settings.png
./attached_assets/calender.png
./attached_assets/hemasai.jpeg
./attached_assets/tasks.png
./attached_assets/focus_timer.png
./attached_assets/habbits.png
./attached_assets/dosth(ai).png
./attached_assets/tehemes_notificationssettings.png
./attached_assets/journals.png
./attached_assets/home_2.png
./attached_assets/home_1.png
./attached_assets/logo.png
./attached_assets/Pasted-You-are-an-AI-coding-assistant-My-name-is-Hema-Sai-Vartikotti-and-I-am-the-founder-of-a-new-app-ca-1748319127283.txt
./attached_assets/Pasted-You-are-an-AI-coding-assistant-My-name-is-Hema-Sai-Vartikotti-and-I-am-the-founder-of-a-new-app-ca-1748319261240.txt
./client
./client/index.html
./client/tailwind.config.js
./client/PLAY_STORE_LISTING.md
./client/vite.config.js
./client/docs
./client/docs/screenshots
./client/DATA_SAFETY.md
./client/public
./client/public/demo
./client/public/demo/demo6.png
./client/public/demo/demo7.png
./client/public/demo/demo5.png
./client/public/demo/demo4.png
./client/public/demo/demo1.png
./client/public/demo/demo3.png
./client/public/demo/demo2.png
./client/public/demo/demo11.png
./client/public/demo/demo10.png
./client/public/demo/demo9.png
./client/public/demo/demo8.png
./client/public/hemasai.jpg
./client/public/icon-192.svg
./client/public/icon-512.svg
./client/public/manifest.json
./client/public/sitemap.xml
./client/public/robots.txt
./client/public/assets
./client/public/assets/focus_stopwatch.png
./client/public/assets/settings.png
./client/public/assets/calender.png
./client/public/assets/hemasai.jpeg
./client/public/assets/tasks.png
./client/public/assets/focus_timer.png
./client/public/assets/habbits.png
./client/public/assets/dosth(ai).png
./client/public/assets/tehemes_notificationssettings.png
./client/public/assets/journals.png
./client/public/assets/home_2.png
./client/public/assets/home_1.png
./client/public/assets/logo.png
./client/public/assets/Pasted-You-are-an-AI-coding-assistant-My-name-is-Hema-Sai-Vartikotti-and-I-am-the-founder-of-a-new-app-ca-1748319127283.txt
./client/public/assets/Pasted-You-are-an-AI-coding-assistant-My-name-is-Hema-Sai-Vartikotti-and-I-am-the-founder-of-a-new-app-ca-1748319261240.txt
./client/package-lock.json
./client/package.json
./client/android
./client/android/capacitor.settings.gradle
./client/android/app
./client/android/app/proguard-rules.pro
./client/android/app/build.gradle
./client/android/app/capacitor.build.gradle
./client/android/app/build
./client/android/app/src
./client/android/capacitor-cordova-android-plugins
./client/android/capacitor-cordova-android-plugins/build.gradle
./client/android/capacitor-cordova-android-plugins/build
./client/android/capacitor-cordova-android-plugins/cordova.variables.gradle
./client/android/capacitor-cordova-android-plugins/src
./client/android/variables.gradle
./client/android/local.properties
./client/android/gradle
./client/android/gradle/wrapper
./client/android/gradlew
./client/android/keystore.properties.example
./client/android/build.gradle
./client/android/gradle.properties
./client/android/build
./client/android/build/reports
./client/android/gradlew.bat
./client/android/settings.gradle
./client/capacitor.config.json
./client/postcss.config.js
./client/build-release.sh
./client/src
./client/src/context
./client/src/context/AuthContext.jsx
./client/src/context/DataContext.jsx
./client/src/native.js
./client/src/index.css
./client/src/components
./client/src/components/ClockPicker.jsx
./client/src/components/Layout.jsx
./client/src/components/SearchDialog.jsx
./client/src/components/ErrorBoundary.jsx
./client/src/components/Skeleton.jsx
./client/src/components/EmptyState.jsx
./client/src/components/NetworkStatus.jsx
./client/src/components/SyncStatus.jsx
./client/src/components/Toast.jsx
./client/src/components/ConfirmDialog.jsx
./client/src/main.jsx
./client/src/App.jsx
./client/src/pages
./client/src/pages/Onboarding.jsx
./client/src/pages/Insights.jsx
./client/src/pages/Journal.jsx
./client/src/pages/Privacy.jsx
./client/src/pages/Calendar.jsx
./client/src/pages/Dashboard.jsx
./client/src/pages/Terms.jsx
./client/src/pages/Settings.jsx
./client/src/pages/HabitFocusHub.jsx
./client/src/pages/LandingPage.jsx
./client/src/pages/Tasks.jsx
./client/src/pages/AuthPage.jsx
./client/src/pages/DostMode.jsx
./client/src/services
./client/src/services/googleCalendar.js
./client/src/services/supabaseClient.js
./client/src/services/syncEngine.js
./focus_mode.py



# Project Source Code Dump


## File: database.py

```
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
```

## File: focus_mode.py

```
import streamlit as st
import time
import datetime

class FocusMode:
    def __init__(self):
        if 'timer_running' not in st.session_state:
            st.session_state.timer_running = False
        if 'time_remaining' not in st.session_state:
            st.session_state.time_remaining = 25 * 60  # Default 25 minutes
        if 'focus_mode_type' not in st.session_state:
            st.session_state.focus_mode_type = "Pomodoro" # Pomodoro, Short Break, Long Break

    def render(self):
        st.header("🧘 Focus & Zen Mode")
        st.markdown("Use this timer to stay focused on your tasks. The **Pomodoro Technique** uses intervals of 25 minutes of work followed by 5 minutes of break.")

        col1, col2, col3 = st.columns([1, 1, 1])
        
        with col1:
            if st.button("🍅 Pomodoro (25m)", use_container_width=True):
                st.session_state.time_remaining = 25 * 60
                st.session_state.focus_mode_type = "Pomodoro"
                st.session_state.timer_running = False
                
        with col2:
            if st.button("☕ Short Break (5m)", use_container_width=True):
                st.session_state.time_remaining = 5 * 60
                st.session_state.focus_mode_type = "Short Break"
                st.session_state.timer_running = False
                
        with col3:
            if st.button("💤 Long Break (15m)", use_container_width=True):
                st.session_state.time_remaining = 15 * 60
                st.session_state.focus_mode_type = "Long Break"
                st.session_state.timer_running = False

        # Timer Display
        st.markdown("---")
        timer_container = st.empty()
        
        minutes = st.session_state.time_remaining // 60
        seconds = st.session_state.time_remaining % 60
        
        timer_html = f"""
            <div style="text-align: center; font-size: 80px; font-weight: bold; color: #2E8B57; margin: 20px 0;">
                {minutes:02d}:{seconds:02d}
            </div>
            <div style="text-align: center; font-size: 24px; color: #666;">
                Mode: {st.session_state.focus_mode_type}
            </div>
        """
        timer_container.markdown(timer_html, unsafe_allow_html=True)

        # Controls
        c1, c2, c3 = st.columns([1, 1, 1])
        with c2:
            if st.session_state.timer_running:
                if st.button("⏸️ Pause", use_container_width=True):
                    st.session_state.timer_running = False
                    st.rerun()
            else:
                if st.button("▶️ Start", use_container_width=True):
                    st.session_state.timer_running = True
                    st.rerun()

        # Timer Logic (runs if state is True)
        if st.session_state.timer_running:
            if st.session_state.time_remaining > 0:
                time.sleep(1)
                st.session_state.time_remaining -= 1
                st.rerun()
            else:
                st.session_state.timer_running = False
                st.balloons()
                st.success("Timer completed!")
                if st.session_state.focus_mode_type == "Pomodoro":
                    st.info("Great job! Take a short break now.")
                st.rerun()

        # Todo List Integration
        st.markdown("---")
        st.subheader("Current Focus Task")
        # In a real app, this would pull from the TaskManager
        focus_task = st.text_input("What are you working on right now?", placeholder="e.g., Finish Math Assignment")
        if focus_task:
            st.caption("Keep this task in mind while the timer runs!")

```

## File: nlp_processor.py

```
import spacy
import re
import datetime
from typing import List, Dict, Any
from dateutil import parser
import logging

class NLPProcessor:
    """Natural Language Processing component for parsing schedule inputs."""
    
    def __init__(self):
        self.nlp = self._load_spacy_model()
        self.time_patterns = [
            r'\b(\d{1,2}):?(\d{0,2})\s*(am|pm|AM|PM)?\b',
            r'\b(\d{1,2})\s*o\'?clock\b',
            r'\b(morning|afternoon|evening|night)\b',
            r'\b(noon|midnight)\b'
        ]
        self.duration_patterns = [
            r'\b(\d+)\s*(hour|hours|hr|hrs)\b',
            r'\b(\d+)\s*(minute|minutes|min|mins)\b',
            r'\b(\d+)\s*(h)\b',
            r'\b(\d+)\s*(m)\b'
        ]
        self.priority_keywords = {
            'high': ['urgent', 'important', 'critical', 'asap', 'priority', 'must', 'deadline'],
            'medium': ['should', 'need', 'would like', 'prefer'],
            'low': ['maybe', 'if time', 'optional', 'when possible']
        }
        self.category_keywords = {
            'academic': ['study', 'class', 'lecture', 'exam', 'assignment', 'homework', 'research', 'project', 'paper', 'essay', 'lab', 'tutorial', 'seminar'],
            'wellness': ['gym', 'exercise', 'workout', 'run', 'jog', 'yoga', 'meditation', 'walk', 'sport', 'fitness', 'health'],
            'personal': ['lunch', 'dinner', 'breakfast', 'eat', 'meal', 'break', 'rest', 'sleep', 'relax', 'hobby', 'friends', 'family', 'social']
        }
    
    def _load_spacy_model(self):
        """Load spaCy model with fallback options."""
        try:
            # Try to load the English model
            nlp = spacy.load("en_core_web_sm")
            return nlp
        except IOError:
            logging.warning("spaCy English model not found. Using basic text processing.")
            return spacy.blank("en")
    
    def parse_schedule_input(self, text: str) -> List[Dict[str, Any]]:
        """
        Parse natural language input and extract structured task information.
        
        Args:
            text (str): Natural language description of schedule
            
        Returns:
            List[Dict]: List of parsed tasks with structured information
        """
        if not text.strip():
            return []
        
        try:
            # Process text with spaCy
            doc = self.nlp(text.lower())
            
            # Split text into potential task segments
            task_segments = self._segment_tasks(text)
            
            parsed_tasks = []
            for segment in task_segments:
                task_info = self._parse_task_segment(segment)
                if task_info:
                    parsed_tasks.append(task_info)
            
            return parsed_tasks
            
        except Exception as e:
            logging.error(f"Error parsing input: {str(e)}")
            return []
    
    def _segment_tasks(self, text: str) -> List[str]:
        """Split input text into individual task segments."""
        # Common separators for tasks
        separators = [',', ';', 'and then', 'then', 'after that', 'next', 'also', '\n']
        
        segments = [text]
        for separator in separators:
            new_segments = []
            for segment in segments:
                new_segments.extend([s.strip() for s in segment.split(separator) if s.strip()])
            segments = new_segments
        
        return [seg for seg in segments if len(seg.split()) >= 2]  # Filter out very short segments
    
    def _parse_task_segment(self, segment: str) -> Dict[str, Any]:
        """Parse an individual task segment to extract structured information."""
        task_info = {
            'task': '',
            'start_time': None,
            'duration': None,
            'priority': 'medium',
            'category': 'personal',
            'specific_time': False
        }
        
        # Extract task name (remove time and duration info for cleaner name)
        task_name = self._extract_task_name(segment)
        if not task_name:
            return None
        
        task_info['task'] = task_name
        
        # Extract time information
        time_info = self._extract_time_info(segment)
        if time_info:
            task_info.update(time_info)
        
        # Extract duration
        duration = self._extract_duration(segment)
        if duration:
            task_info['duration'] = duration
        
        # Determine priority
        priority = self._determine_priority(segment)
        task_info['priority'] = priority
        
        # Determine category
        category = self._determine_category(segment)
        task_info['category'] = category
        
        return task_info
    
    def _extract_task_name(self, segment: str) -> str:
        """Extract the main task name from a segment."""
        # Remove time patterns
        cleaned = segment
        for pattern in self.time_patterns + self.duration_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Remove common prepositions and articles
        stop_words = ['at', 'for', 'in', 'on', 'the', 'a', 'an', 'and', 'then', 'after']
        words = cleaned.split()
        filtered_words = [word for word in words if word.lower() not in stop_words]
        
        # Clean up and return
        task_name = ' '.join(filtered_words).strip()
        task_name = re.sub(r'\s+', ' ', task_name)  # Remove extra spaces
        
        return task_name if len(task_name) > 2 else segment.strip()
    
    def _extract_time_info(self, segment: str) -> Dict[str, Any]:
        """Extract time information from segment."""
        time_info = {}
        
        # Look for specific times
        for pattern in self.time_patterns:
            matches = re.finditer(pattern, segment, re.IGNORECASE)
            for match in matches:
                try:
                    time_str = match.group(0)
                    parsed_time = self._parse_time_string(time_str)
                    if parsed_time:
                        time_info['start_time'] = parsed_time
                        time_info['specific_time'] = True
                        break
                except:
                    continue
        
        return time_info
    
    def _parse_time_string(self, time_str: str) -> datetime.time:
        """Parse various time string formats."""
        time_str = time_str.lower().strip()
        
        # Handle special cases
        if 'noon' in time_str:
            return datetime.time(12, 0)
        elif 'midnight' in time_str:
            return datetime.time(0, 0)
        
        # Handle morning/afternoon/evening
        if 'morning' in time_str:
            return datetime.time(9, 0)  # Default morning time
        elif 'afternoon' in time_str:
            return datetime.time(14, 0)  # Default afternoon time
        elif 'evening' in time_str:
            return datetime.time(18, 0)  # Default evening time
        elif 'night' in time_str:
            return datetime.time(20, 0)  # Default night time
        
        # Handle numeric times
        try:
            # Try to parse with dateutil
            parsed = parser.parse(time_str, fuzzy=True)
            return parsed.time()
        except:
            pass
        
        # Manual parsing for common formats
        time_match = re.search(r'(\d{1,2}):?(\d{0,2})\s*(am|pm)?', time_str, re.IGNORECASE)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2)) if time_match.group(2) else 0
            am_pm = time_match.group(3)
            
            if am_pm and am_pm.lower() == 'pm' and hour != 12:
                hour += 12
            elif am_pm and am_pm.lower() == 'am' and hour == 12:
                hour = 0
            
            if 0 <= hour <= 23 and 0 <= minute <= 59:
                return datetime.time(hour, minute)
        
        return None
    
    def _extract_duration(self, segment: str) -> int:
        """Extract duration in minutes from segment."""
        total_minutes = 0
        
        for pattern in self.duration_patterns:
            matches = re.finditer(pattern, segment, re.IGNORECASE)
            for match in matches:
                try:
                    value = int(match.group(1))
                    unit = match.group(2).lower()
                    
                    if unit in ['hour', 'hours', 'hr', 'hrs', 'h']:
                        total_minutes += value * 60
                    elif unit in ['minute', 'minutes', 'min', 'mins', 'm']:
                        total_minutes += value
                except:
                    continue
        
        # Default durations based on task type if no duration specified
        if total_minutes == 0:
            if any(keyword in segment.lower() for keyword in self.category_keywords['academic']):
                return 90  # 1.5 hours for academic tasks
            elif any(keyword in segment.lower() for keyword in self.category_keywords['wellness']):
                return 60  # 1 hour for wellness
            else:
                return 30  # 30 minutes default
        
        return total_minutes
    
    def _determine_priority(self, segment: str) -> str:
        """Determine task priority based on keywords."""
        segment_lower = segment.lower()
        
        for priority, keywords in self.priority_keywords.items():
            if any(keyword in segment_lower for keyword in keywords):
                return priority
        
        # Default priority based on category
        if any(keyword in segment_lower for keyword in self.category_keywords['academic']):
            return 'high'  # Academic tasks are generally high priority
        
        return 'medium'
    
    def _determine_category(self, segment: str) -> str:
        """Determine task category based on keywords."""
        segment_lower = segment.lower()
        
        for category, keywords in self.category_keywords.items():
            if any(keyword in segment_lower for keyword in keywords):
                return category
        
        return 'personal'  # Default category
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities from text using spaCy."""
        try:
            doc = self.nlp(text)
            entities = {
                'subjects': [],
                'locations': [],
                'times': [],
                'durations': []
            }
            
            for ent in doc.ents:
                if ent.label_ in ['ORG', 'PERSON']:
                    entities['subjects'].append(ent.text)
                elif ent.label_ in ['GPE', 'LOC']:
                    entities['locations'].append(ent.text)
                elif ent.label_ in ['TIME', 'DATE']:
                    entities['times'].append(ent.text)
            
            return entities
        except:
            return {'subjects': [], 'locations': [], 'times': [], 'durations': []}
    
    def suggest_improvements(self, text: str) -> List[str]:
        """Suggest improvements for better parsing."""
        suggestions = []
        
        if not re.search(r'\d+', text):
            suggestions.append("💡 Add specific times (e.g., '10 AM') or durations (e.g., '2 hours') for better scheduling")
        
        if len(text.split(',')) == 1 and len(text.split()) > 10:
            suggestions.append("💡 Use commas or 'and' to separate different tasks")
        
        academic_keywords = sum(1 for keyword in self.category_keywords['academic'] if keyword in text.lower())
        if academic_keywords == 0:
            suggestions.append("💡 Specify if tasks are academic (study, class, exam) for better categorization")
        
        if not any(priority_word in text.lower() for priority_list in self.priority_keywords.values() for priority_word in priority_list):
            suggestions.append("💡 Mention urgency (urgent, important, optional) to set proper priorities")
        
        return suggestions

```

## File: schedule_optimizer.py

```
import datetime
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
import logging
from utils import time_to_minutes, minutes_to_time

class ScheduleOptimizer:
    """Intelligent schedule optimization algorithms for task arrangement."""
    
    def __init__(self):
        self.default_preferences = {
            'start_time': datetime.time(8, 0),
            'end_time': datetime.time(22, 0),
            'break_duration': 15,
            'wellness_priority': 3,
            'max_continuous_study': 120,  # minutes
            'min_break_between_academic': 15,  # minutes
            'preferred_wellness_times': ['morning', 'evening']
        }
    
    def generate_schedule(
        self, 
        tasks: List[Dict[str, Any]], 
        date: datetime.date,
        preferences: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate an optimized schedule from parsed tasks.
        
        Args:
            tasks: List of parsed task dictionaries
            date: Target date for the schedule
            preferences: User preferences for scheduling
            
        Returns:
            List of scheduled tasks with time slots
        """
        if not tasks:
            return []
        
        # Merge preferences with defaults
        prefs = {**self.default_preferences, **(preferences or {})}
        
        try:
            # Prepare tasks for scheduling
            prepared_tasks = self._prepare_tasks_for_scheduling(tasks, prefs)
            
            # Generate time slots
            available_slots = self._generate_time_slots(date, prefs)
            
            # Schedule tasks using optimization algorithm
            scheduled_tasks = self._optimize_task_placement(prepared_tasks, available_slots, prefs)
            
            # Add wellness activities and breaks
            final_schedule = self._add_wellness_and_breaks(scheduled_tasks, available_slots, prefs)
            
            # Sort by start time
            final_schedule.sort(key=lambda x: x['start_time'])
            
            return final_schedule
            
        except Exception as e:
            st.error(f"Error in schedule optimization: {str(e)}")
            return []
    
    def _prepare_tasks_for_scheduling(self, tasks: List[Dict], prefs: Dict) -> List[Dict]:
        """Prepare and validate tasks for scheduling."""
        prepared = []
        
        for task in tasks:
            # Ensure required fields
            prepared_task = {
                'task': task.get('task', 'Unnamed Task'),
                'duration': task.get('duration', 60),
                'priority': task.get('priority', 'medium'),
                'category': task.get('category', 'personal'),
                'start_time': task.get('start_time'),
                'specific_time': task.get('specific_time', False),
                'flexibility': self._calculate_flexibility(task),
                'original_index': len(prepared)
            }
            
            # Validate duration
            if prepared_task['duration'] < 5:
                prepared_task['duration'] = 5
            elif prepared_task['duration'] > 480:  # 8 hours max
                prepared_task['duration'] = 480
            
            prepared.append(prepared_task)
        
        return prepared
    
    def _calculate_flexibility(self, task: Dict) -> float:
        """Calculate how flexible a task is for scheduling (0-1, higher = more flexible)."""
        flexibility = 1.0
        
        # Reduce flexibility for specific times
        if task.get('specific_time', False):
            flexibility *= 0.1
        
        # Reduce flexibility for high priority
        if task.get('priority') == 'high':
            flexibility *= 0.3
        elif task.get('priority') == 'medium':
            flexibility *= 0.6
        
        # Academic tasks are less flexible
        if task.get('category') == 'academic':
            flexibility *= 0.5
        
        return max(0.1, flexibility)  # Minimum flexibility
    
    def _generate_time_slots(self, date: datetime.date, prefs: Dict) -> List[Dict]:
        """Generate available time slots for the day."""
        slots = []
        start_minutes = time_to_minutes(prefs['start_time'])
        end_minutes = time_to_minutes(prefs['end_time'])
        slot_duration = 15  # 15-minute slots
        
        current_minutes = start_minutes
        while current_minutes < end_minutes:
            slot_end = min(current_minutes + slot_duration, end_minutes)
            slots.append({
                'start_minutes': current_minutes,
                'end_minutes': slot_end,
                'duration': slot_end - current_minutes,
                'occupied': False,
                'task': None
            })
            current_minutes = slot_end
        
        return slots
    
    def _optimize_task_placement(
        self, 
        tasks: List[Dict], 
        slots: List[Dict], 
        prefs: Dict
    ) -> List[Dict]:
        """Optimize task placement using priority-based scheduling."""
        scheduled_tasks = []
        
        # Sort tasks by priority and flexibility
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        sorted_tasks = sorted(
            tasks,
            key=lambda x: (
                priority_order[x['priority']],
                -x['flexibility'],
                -x['duration']
            ),
            reverse=True
        )
        
        for task in sorted_tasks:
            best_slot = self._find_best_slot_for_task(task, slots, prefs)
            if best_slot:
                scheduled_task = self._schedule_task_in_slot(task, best_slot, slots)
                if scheduled_task:
                    scheduled_tasks.append(scheduled_task)
        
        return scheduled_tasks
    
    def _find_best_slot_for_task(
        self, 
        task: Dict, 
        slots: List[Dict], 
        prefs: Dict
    ) -> Optional[Dict]:
        """Find the best available slot for a task."""
        required_slots = (task['duration'] + 14) // 15  # Round up to 15-min slots
        
        # If task has specific time, try to place it there first
        if task['specific_time'] and task['start_time']:
            target_minutes = time_to_minutes(task['start_time'])
            best_slot = self._find_slot_at_time(target_minutes, required_slots, slots)
            if best_slot:
                return best_slot
        
        # Find best available slot based on task category and preferences
        best_score = -1
        best_slot = None
        
        for i in range(len(slots) - required_slots + 1):
            if self._can_place_task_at_slot(i, required_slots, slots):
                score = self._calculate_slot_score(task, i, slots, prefs)
                if score > best_score:
                    best_score = score
                    best_slot = {'start_index': i, 'slot_count': required_slots}
        
        return best_slot
    
    def _find_slot_at_time(
        self, 
        target_minutes: int, 
        required_slots: int, 
        slots: List[Dict]
    ) -> Optional[Dict]:
        """Find slot at specific time."""
        for i, slot in enumerate(slots):
            if slot['start_minutes'] <= target_minutes < slot['end_minutes']:
                if self._can_place_task_at_slot(i, required_slots, slots):
                    return {'start_index': i, 'slot_count': required_slots}
                break
        return None
    
    def _can_place_task_at_slot(
        self, 
        start_index: int, 
        required_slots: int, 
        slots: List[Dict]
    ) -> bool:
        """Check if task can be placed at given slot."""
        if start_index + required_slots > len(slots):
            return False
        
        for i in range(start_index, start_index + required_slots):
            if slots[i]['occupied']:
                return False
        
        return True
    
    def _calculate_slot_score(
        self, 
        task: Dict, 
        slot_index: int, 
        slots: List[Dict], 
        prefs: Dict
    ) -> float:
        """Calculate how suitable a slot is for a task."""
        score = 1.0
        slot_start_minutes = slots[slot_index]['start_minutes']
        slot_hour = slot_start_minutes // 60
        
        # Category-based time preferences
        if task['category'] == 'academic':
            # Academic tasks better in morning and early afternoon
            if 8 <= slot_hour <= 12:
                score += 2.0
            elif 13 <= slot_hour <= 16:
                score += 1.5
            elif 17 <= slot_hour <= 20:
                score += 1.0
            else:
                score += 0.5
        
        elif task['category'] == 'wellness':
            # Wellness tasks better in morning or evening
            if 6 <= slot_hour <= 9 or 17 <= slot_hour <= 21:
                score += 2.0
            else:
                score += 1.0
        
        # Avoid late night unless specified
        if slot_hour >= 22:
            score *= 0.5
        
        # Priority boost
        priority_multiplier = {'high': 1.5, 'medium': 1.0, 'low': 0.8}
        score *= priority_multiplier[task['priority']]
        
        return score
    
    def _schedule_task_in_slot(
        self, 
        task: Dict, 
        slot_info: Dict, 
        slots: List[Dict]
    ) -> Dict:
        """Schedule a task in the selected slot."""
        start_index = slot_info['start_index']
        slot_count = slot_info['slot_count']
        
        # Mark slots as occupied
        for i in range(start_index, start_index + slot_count):
            slots[i]['occupied'] = True
            slots[i]['task'] = task['task']
        
        # Create scheduled task
        start_minutes = slots[start_index]['start_minutes']
        end_minutes = slots[start_index + slot_count - 1]['end_minutes']
        
        return {
            'task': task['task'],
            'start_time': minutes_to_time(start_minutes).strftime('%H:%M'),
            'end_time': minutes_to_time(end_minutes).strftime('%H:%M'),
            'duration': task['duration'],
            'priority': task['priority'],
            'category': task['category'],
            'start_minutes': start_minutes,
            'end_minutes': end_minutes
        }
    
    def _add_wellness_and_breaks(
        self, 
        scheduled_tasks: List[Dict], 
        slots: List[Dict], 
        prefs: Dict
    ) -> List[Dict]:
        """Add wellness activities and breaks to the schedule."""
        final_schedule = scheduled_tasks.copy()
        
        # Add breaks between academic tasks
        academic_tasks = [t for t in scheduled_tasks if t['category'] == 'academic']
        academic_tasks.sort(key=lambda x: x['start_minutes'])
        
        for i in range(len(academic_tasks) - 1):
            current_task = academic_tasks[i]
            next_task = academic_tasks[i + 1]
            
            gap_start = current_task['end_minutes']
            gap_end = next_task['start_minutes']
            gap_duration = gap_end - gap_start
            
            # Add break if gap is sufficient and no break exists
            if gap_duration >= prefs['break_duration'] and gap_duration <= 60:
                break_task = {
                    'task': 'Break',
                    'start_time': minutes_to_time(gap_start).strftime('%H:%M'),
                    'end_time': minutes_to_time(gap_start + prefs['break_duration']).strftime('%H:%M'),
                    'duration': prefs['break_duration'],
                    'priority': 'low',
                    'category': 'wellness',
                    'start_minutes': gap_start,
                    'end_minutes': gap_start + prefs['break_duration']
                }
                final_schedule.append(break_task)
        
        # Suggest wellness activities if not enough wellness time
        wellness_time = sum(t['duration'] for t in scheduled_tasks if t['category'] == 'wellness')
        if wellness_time < 60:  # Less than 1 hour of wellness
            self._suggest_wellness_slots(final_schedule, slots, prefs)
        
        return final_schedule
    
    def _suggest_wellness_slots(
        self, 
        schedule: List[Dict], 
        slots: List[Dict], 
        prefs: Dict
    ):
        """Suggest wellness activity slots."""
        # Find available slots for wellness
        available_slots = [slot for slot in slots if not slot['occupied']]
        
        if len(available_slots) >= 4:  # At least 1 hour available
            # Suggest morning or evening wellness
            morning_slots = [s for s in available_slots if s['start_minutes'] < 10 * 60]  # Before 10 AM
            evening_slots = [s for s in available_slots if s['start_minutes'] > 17 * 60]  # After 5 PM
            
            target_slots = evening_slots if evening_slots else morning_slots
            
            if len(target_slots) >= 4:
                wellness_start = target_slots[0]['start_minutes']
                wellness_suggestion = {
                    'task': 'Wellness Activity (Suggested)',
                    'start_time': minutes_to_time(wellness_start).strftime('%H:%M'),
                    'end_time': minutes_to_time(wellness_start + 60).strftime('%H:%M'),
                    'duration': 60,
                    'priority': 'medium',
                    'category': 'wellness',
                    'start_minutes': wellness_start,
                    'end_minutes': wellness_start + 60
                }
                schedule.append(wellness_suggestion)
    
    def detect_conflicts(
        self, 
        schedule: List[Dict], 
        existing_tasks: List[Dict] = None
    ) -> List[str]:
        """Detect scheduling conflicts and return conflict descriptions."""
        conflicts = []
        
        if not schedule:
            return conflicts
        
        # Sort schedule by start time
        sorted_schedule = sorted(schedule, key=lambda x: x.get('start_minutes', 0))
        
        # Check for overlapping tasks
        for i in range(len(sorted_schedule) - 1):
            current = sorted_schedule[i]
            next_task = sorted_schedule[i + 1]
            
            current_end = current.get('end_minutes', current.get('start_minutes', 0) + current.get('duration', 0))
            next_start = next_task.get('start_minutes', 0)
            
            if current_end > next_start:
                conflicts.append(
                    f"⚠️ Overlap between '{current['task']}' and '{next_task['task']}' "
                    f"({current['end_time']} vs {next_task['start_time']})"
                )
        
        # Check for excessive continuous academic work
        continuous_academic_time = 0
        for task in sorted_schedule:
            if task['category'] == 'academic':
                continuous_academic_time += task['duration']
            else:
                if continuous_academic_time > 180:  # More than 3 hours
                    conflicts.append(
                        f"📚 Extended academic session detected ({continuous_academic_time} min). "
                        "Consider adding breaks."
                    )
                continuous_academic_time = 0
        
        # Check against existing tasks if provided
        if existing_tasks:
            for existing in existing_tasks:
                for scheduled in schedule:
                    if self._tasks_overlap(existing, scheduled):
                        conflicts.append(
                            f"📅 Conflict with existing task: '{existing.get('name', 'Unknown')}' "
                            f"overlaps with '{scheduled['task']}'"
                        )
        
        return conflicts
    
    def _tasks_overlap(self, task1: Dict, task2: Dict) -> bool:
        """Check if two tasks overlap in time."""
        # This is a simplified overlap check
        # In a real implementation, you'd need to handle date/time parsing more carefully
        return False  # Placeholder implementation
    
    def optimize_for_energy_levels(self, schedule: List[Dict]) -> List[Dict]:
        """Optimize schedule based on typical energy level patterns."""
        # This could incorporate user's energy patterns
        # For now, a simple implementation that prioritizes high-energy tasks in the morning
        
        optimized = schedule.copy()
        
        # Sort high-priority academic tasks to morning hours
        morning_cutoff = 12 * 60  # 12 PM in minutes
        
        for task in optimized:
            if (task['category'] == 'academic' and 
                task['priority'] == 'high' and 
                task.get('start_minutes', 0) > morning_cutoff):
                # Could implement task swapping logic here
                pass
        
        return optimized
    
    def suggest_schedule_improvements(self, schedule: List[Dict]) -> List[str]:
        """Suggest improvements for the current schedule."""
        suggestions = []
        
        if not schedule:
            return suggestions
        
        # Analyze schedule composition
        total_time = sum(task['duration'] for task in schedule)
        academic_time = sum(task['duration'] for task in schedule if task['category'] == 'academic')
        wellness_time = sum(task['duration'] for task in schedule if task['category'] == 'wellness')
        
        # Wellness suggestions
        if wellness_time < 60:
            suggestions.append("💪 Consider adding more wellness activities (currently less than 1 hour)")
        
        # Academic balance
        if academic_time > 480:  # More than 8 hours
            suggestions.append("📚 Academic load is quite heavy. Consider breaking into multiple days")
        
        # Break suggestions
        continuous_periods = self._find_continuous_academic_periods(schedule)
        for period in continuous_periods:
            if period > 120:  # More than 2 hours
                suggestions.append(f"⏰ Consider adding breaks during {period}-minute academic session")
        
        return suggestions
    
    def _find_continuous_academic_periods(self, schedule: List[Dict]) -> List[int]:
        """Find continuous academic work periods."""
        periods = []
        current_period = 0
        
        sorted_schedule = sorted(schedule, key=lambda x: x.get('start_minutes', 0))
        
        for task in sorted_schedule:
            if task['category'] == 'academic':
                current_period += task['duration']
            else:
                if current_period > 0:
                    periods.append(current_period)
                    current_period = 0
        
        if current_period > 0:
            periods.append(current_period)
        
        return periods

```

## File: task_manager.py

```
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

```

## File: utils.py

```
import datetime
from typing import Any, Dict, List, Optional, Union
import re

def time_to_minutes(time_obj: datetime.time) -> int:
    """
    Convert a time object to minutes since midnight.
    
    Args:
        time_obj: datetime.time object
        
    Returns:
        int: Minutes since midnight (0-1439)
    """
    if not isinstance(time_obj, datetime.time):
        # Handle string conversion if passed accidently, or return 0
        return 0
    
    return time_obj.hour * 60 + time_obj.minute

def minutes_to_time(minutes: int) -> datetime.time:
    """
    Convert minutes since midnight to a time object.
    
    Args:
        minutes: Minutes since midnight (0-1439)
        
    Returns:
        datetime.time: Time object
    """
    # Clamp minutes to valid range
    minutes = max(0, min(1439, int(minutes)))
    
    hour = minutes // 60
    minute = minutes % 60
    
    return datetime.time(hour, minute)

def format_time_duration(minutes: int) -> str:
    """Format duration in minutes to human readable string."""
    hours = minutes // 60
    mins = minutes % 60
    
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}m"

```

## File: server/api.py

```
"""
Mithra OS — FastAPI Backend
The Brain of Mithra Life OS

Endpoints:
  GET  /                     → Health check
  POST /api/auth/signup      → Register new user
  POST /api/auth/login       → Sign in
  POST /api/auth/reset-password → Request password reset
  POST /api/auth/confirm-reset  → Set new password
  POST /api/chat             → Dost AI chat (RAG)
  POST /api/parse-schedule   → Natural language → calendar events
  GET  /api/tasks            → List all tasks
  POST /api/tasks            → Create a task
  PUT  /api/tasks/{id}       → Update a task
  DELETE /api/tasks/{id}     → Delete a task
  GET  /api/journal          → Get journal entries
  POST /api/journal          → Add journal entry
  GET  /api/notifications    → Get notification settings
  POST /api/notifications    → Update notification settings

Run: uvicorn api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, date
import uuid
import hashlib
import secrets

# Import clients (gracefully handles missing credentials)
from config import supabase, model, get_embedding

app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS — Auth, Tasks, AI Chat, Schedule",
    version="2.0.0",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Stores (for demo mode without Supabase) ---
_users_store: Dict[str, dict] = {}
_tasks_store: Dict[str, dict] = {}
_journal_store: List[dict] = []
_notification_settings: dict = {"enabled": False, "reminderMinutes": 15}
_reset_tokens: Dict[str, str] = {}  # token -> email

# --- Utility ---
def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# --- Data Models ---
class SignUpRequest(BaseModel):
    fullName: str
    email: str
    password: str

class SignInRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str

class ConfirmResetRequest(BaseModel):
    email: str
    newPassword: str
    token: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"
    context_window: int = 5

class ScheduleRequest(BaseModel):
    text: str

class TaskCreate(BaseModel):
    title: str
    details: str = ""
    listId: str = "default"
    priority: str = "medium"
    completed: bool = False
    starred: bool = False
    dueDate: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    details: Optional[str] = None
    listId: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    starred: Optional[bool] = None
    dueDate: Optional[str] = None

class JournalCreate(BaseModel):
    content: str
    mood: Optional[str] = None
    tags: Optional[str] = ""
    date: Optional[str] = None

class NotificationSettings(BaseModel):
    enabled: bool = False
    reminderMinutes: int = 15

# ═══════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════

@app.get("/")
def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "system": "Mithra Brain Active",
        "version": "2.0.0",
        "services": {
            "supabase": "connected" if supabase else "demo mode",
            "gemini": "connected" if model else "demo mode",
        },
        "timestamp": datetime.now().isoformat(),
    }


# ─── AUTHENTICATION ───
@app.post("/api/auth/signup")
async def signup(request: SignUpRequest):
    """Register a new user."""
    email = request.email.lower().strip()
    if email in _users_store:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    _users_store[email] = {
        "id": user_id,
        "email": email,
        "fullName": request.fullName,
        "passwordHash": _hash_password(request.password),
        "createdAt": datetime.now().isoformat(),
    }
    return {"user": {"id": user_id, "email": email, "fullName": request.fullName}}


@app.post("/api/auth/login")
async def login(request: SignInRequest):
    """Sign in an existing user."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")
    if user["passwordHash"] != _hash_password(request.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"user": {"id": user["id"], "email": user["email"], "fullName": user["fullName"]}}


@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Request a password reset. Returns a token (demo mode — in production, send via email)."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = email
    return {
        "message": "Password reset authorized",
        "token": token,  # In production, this would be sent via email
        "email": email,
    }


@app.post("/api/auth/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    """Set a new password after reset verification."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if len(request.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Verify token if provided
    if request.token:
        stored_email = _reset_tokens.get(request.token)
        if stored_email != email:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        del _reset_tokens[request.token]

    user["passwordHash"] = _hash_password(request.newPassword)
    return {"message": "Password updated successfully"}


# ─── DOST CHAT (RAG Engine) ───
@app.post("/api/chat")
async def chat_with_dost(request: ChatRequest):
    """AI chat with Dost — stoic companion with memory."""
    try:
        user_msg = request.message

        # If Gemini isn't configured, return demo response
        if not model:
            return {
                "reply": f"I hear you. '{user_msg}' — Let me reflect on that. In demo mode, I can't generate AI responses. Please configure your Gemini API key in the .env file to unlock my full wisdom.",
                "action": None,
                "memory_used": False,
                "demo_mode": True,
            }

        # A. RETRIEVAL — Search memory
        memory_context = ""
        if supabase:
            try:
                msg_embedding = get_embedding(user_msg)
                related_data = supabase.rpc(
                    'match_journal_entries',
                    {'query_embedding': msg_embedding, 'match_threshold': 0.7, 'match_count': 3}
                ).execute()
                if related_data.data:
                    memory_context = "\n".join([
                        f"- {item['content']} (Mood: {item.get('mood_score', 'N/A')})"
                        for item in related_data.data
                    ])
            except Exception:
                pass  # Memory search failed — continue without it

        # B. GENERATION
        system_prompt = f"""
        You are Dost, a digital stoic companion for the Mithra Life OS app.
        User's Context from Journal Memory:
        {memory_context if memory_context else "No previous context available."}

        Style Guide:
        - Be concise, calm, and insightful.
        - If the user seems stressed, offer a stoic perspective.
        - If the user mentions a task like "Remind me to..." or "I need to...",
          output a JSON action at the end:
          ||JSON||{{"action": "create_task", "task": {{"title": "...", "priority": "medium"}}}}

        User: {user_msg}
        Dost:
        """

        response = model.generate_content(system_prompt)
        text_response = response.text

        # C. ACTION PARSING
        action_data = None
        if "||JSON||" in text_response:
            parts = text_response.split("||JSON||")
            text_response = parts[0].strip()
            try:
                action_data = json.loads(parts[1])
            except Exception:
                pass

        return {
            "reply": text_response,
            "action": action_data,
            "memory_used": bool(memory_context),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── SCHEDULE PARSER ───
@app.post("/api/parse-schedule")
async def parse_schedule(request: ScheduleRequest):
    """Parse natural language text into calendar events using Gemini."""
    try:
        if not model:
            return {
                "events": [],
                "demo_mode": True,
                "message": "Gemini not configured. Add GEMINI_API_KEY to .env file.",
            }

        today_str = date.today().isoformat()
        prompt = f"""
        Extract calendar events from this text: "{request.text}".
        Today's date is {today_str}.
        Return ONLY a JSON array of objects with keys:
        - title (string)
        - start (ISO timestamp)
        - end (ISO timestamp, default 1 hour after start)
        - category (one of: Work, Personal, Health, Meeting, Focus)
        """

        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        events = json.loads(clean_json)

        return {"events": events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── TASK CRUD ───
@app.get("/api/tasks")
async def list_tasks():
    """List all tasks."""
    return {"tasks": list(_tasks_store.values())}


@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    """Create a new task."""
    task_id = str(uuid.uuid4())[:8]
    task_data = {
        "id": task_id,
        **task.dict(),
        "createdAt": datetime.now().isoformat(),
        "subtasks": [],
    }
    _tasks_store[task_id] = task_data
    return {"task": task_data}


@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate):
    """Update an existing task."""
    if task_id not in _tasks_store:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in updates.dict(exclude_unset=True).items():
        _tasks_store[task_id][key] = value
    _tasks_store[task_id]["updatedAt"] = datetime.now().isoformat()
    return {"task": _tasks_store[task_id]}


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task."""
    if task_id not in _tasks_store:
        raise HTTPException(status_code=404, detail="Task not found")
    deleted = _tasks_store.pop(task_id)
    return {"deleted": deleted}


# ─── NOTIFICATION SETTINGS ───
@app.get("/api/notifications")
async def get_notifications():
    """Get notification settings."""
    return {"settings": _notification_settings}


@app.post("/api/notifications")
async def update_notifications(settings: NotificationSettings):
    """Update notification settings."""
    _notification_settings.update(settings.dict())
    return {"settings": _notification_settings}


# ─── JOURNAL ───
@app.get("/api/journal")
async def list_journal():
    """Get all journal entries."""
    return {"entries": _journal_store}


@app.post("/api/journal")
async def create_journal(entry: JournalCreate):
    """Create a journal entry."""
    entry_data = {
        "id": str(uuid.uuid4())[:8],
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags,
        "date": entry.date or date.today().isoformat(),
        "createdAt": datetime.now().isoformat(),
    }
    _journal_store.insert(0, entry_data)
    return {"entry": entry_data}


# ─── DATA SYNC ───
@app.get("/api/sync")
async def sync_data():
    """Get all data for offline sync."""
    return {
        "tasks": list(_tasks_store.values()),
        "journal": _journal_store,
        "notifications": _notification_settings,
        "syncedAt": datetime.now().isoformat(),
    }


# ═══════════════════════════════════════════════
#  SERVER STARTUP
# ═══════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)

```

## File: server/config.py

```
"""
Mithra OS — Backend Configuration
Gracefully handles missing credentials so the server can start in demo mode.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# --- Clients (lazy init — only created if credentials exist) ---
supabase = None
model = None

def _init_supabase():
    global supabase
    if SUPABASE_URL and SUPABASE_KEY and "your-" not in SUPABASE_URL:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("✅ Supabase connected")
        except Exception as e:
            print(f"⚠️  Supabase init failed: {e}")
    else:
        print("ℹ️  Supabase not configured — running in demo mode")

def _init_gemini():
    global model
    if GEMINI_API_KEY and "your-" not in GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            print("✅ Gemini AI connected")
        except Exception as e:
            print(f"⚠️  Gemini init failed: {e}")
    else:
        print("ℹ️  Gemini API not configured — AI features in demo mode")

def get_embedding(text: str):
    """Generates vector embedding for RAG memory using Gemini."""
    if not GEMINI_API_KEY or "your-" in GEMINI_API_KEY:
        return [0.0] * 768  # dummy embedding
    try:
        import google.generativeai as genai
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document",
            title="Mithra Memory"
        )
        return result['embedding']
    except Exception:
        return [0.0] * 768

# Initialize on import
_init_supabase()
_init_gemini()

```

## File: server/main.py

```
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
    current_tasks: Optional[List[Dict[str, Any]]] = None
    current_habits: Optional[List[Dict[str, Any]]] = None

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
        similar_memories = await search_similar_memories(message_embedding, request.user_id)
        
        context_str = ""
        if similar_memories:
            context_str = "\n".join([f"- {m['content']} (Similarity: {m['similarity']:.2f})" for m in similar_memories])
        
        # 3. Contextual Data (Tasks/Habits)
        task_context = ""
        if request.current_tasks:
            pending = [t for t in request.current_tasks if not t.get('completed')]
            high_pri = [t for t in pending if t.get('priority') == 'high']
            task_context = f"User has {len(pending)} pending tasks ({len(high_pri)} high priority)."
            if high_pri:
                task_context += f" Top priorities: {', '.join([t['title'] for t in high_pri[:3]])}."

        habit_context = ""
        if request.current_habits:
            done = [h for h in request.current_habits if h.get('todayDone')]
            habit_context = f"Habits done today: {len(done)}/{len(request.current_habits)}."

        # 4. Generate
        system_prompt = f"""You are Dost, a supportive, insightful, and slightly strict productivity companion. 
        Your goal is to help the user master their time and emotions.
        
        [Current Status]:
        {task_context}
        {habit_context}

        Use the following Context (retrieved from the user's past journals) to inform your response.
        If the user refers to past events, check the context.
        Keep your response concise (under 100 words), conversational, and empathetic but action-oriented.
        """
        
        full_prompt = f"{system_prompt}\n\n[Context Memory]:\n{context_str}\n\n[User]: {request.message}\n[Dost]:"
        
        response = model.generate_content(full_prompt)
        dost_reply = response.text
        
        # 5. Save to Journal (Memory)
        if supabase:
            supabase.table("journal_entries").insert({
                "content": request.message, 
                "user_id": request.user_id,
                "embedding": message_embedding,
                "mood_score": 5 
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
        You are an expert scheduler. Extract schedule events from the following text: "{request.text}".
        
        Today is: {datetime.now().strftime("%A, %Y-%m-%d")}.
        
        - If the text says "Plan my week", generate a thoughtful schedule for the next 5-7 days based on any context provided or general productivity best practices (Work 9-5, Workout in morning, etc).
        - If dates are implied (e.g., "next Friday"), calculate the exact ISO date.
        
        Return a JSON object with a list of "events". 
        Each event should have:
        - title: A short description.
        - start_time: ISO 8601 string (YYYY-MM-DDTHH:MM:SS) 
        - category: One of "Work", "Health", "Personal", "Learning".
        - priority: "High" or "Medium".
        
        Example Output:
        {{
            "events": [
                {{ "title": "Team Meeting", "start_time": "2024-02-14T10:00:00", "category": "Work", "priority": "High" }}
            ]
        }}
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
             print(f"Failed to parse JSON: {response.text}")
             raise HTTPException(status_code=500, detail="Failed to parse schedule from AI response")

    except Exception as e:
        logging.error(f"Schedule parse error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Hot reload enabled for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

```

## File: server/vector_store.py

```
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

```

## File: server/requirements.txt

```
fastapi==0.109.0
uvicorn==0.27.0
supabase==2.3.4
google-generativeai==0.3.2
python-dotenv==1.0.0
pydantic==2.6.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pgvector==0.2.4

```

## File: client/vite.config.js

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base must be relative for Capacitor Android to load assets correctly
  base: './',
  build: {
    outDir: 'dist',
    // Produce relative asset paths for Android WebView
    assetsDir: 'assets',
    // Performance optimizations
    minify: 'esbuild', // Use default esbuild (faster, no extra dependency)
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'lucide': ['lucide-react'],
          // Large pages
          'dost': ['./src/pages/DostMode.jsx'],
          'calendar': ['./src/pages/Calendar.jsx'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
  },
})

```

## File: client/tailwind.config.js

```
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mithra: {
          black: 'var(--body-bg)', // Semantic mapping
          surface: 'var(--surface-bg)',
          merino: 'rgb(var(--color-merino) / <alpha-value>)',
          text: 'var(--text-primary)',
          dim: 'var(--text-dim)',
          border: 'var(--glass-border)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          visor: 'rgb(var(--color-visor) / <alpha-value>)',
          wine: 'rgb(var(--color-wine) / <alpha-value>)',
          soft: 'var(--accent-soft)',
          glow: 'var(--accent-glow)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}


```

## File: client/postcss.config.js

```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

## File: client/package.json

```
{
  "name": "mitra-ai-client",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "npx cap sync",
    "cap:open": "npx cap open android",
    "cap:run": "npx cap run android",
    "android": "vite build && npx cap sync android && npx cap open android",
    "android:run": "vite build && npx cap sync android && npx cap run android",
    "android:live": "npx cap run android --livereload --external",
    "android:release": "bash build-release.sh",
    "android:bundle": "vite build && npx cap sync android && cd android && ./gradlew bundleRelease",
    "android:apk": "vite build && npx cap sync android && cd android && ./gradlew assembleRelease"
  },
  "dependencies": {
    "@capacitor/android": "^8.0.2",
    "@capacitor/app": "^8.0.0",
    "@capacitor/browser": "^8.0.0",
    "@capacitor/cli": "^8.0.2",
    "@capacitor/core": "^8.0.2",
    "@capacitor/haptics": "^8.0.0",
    "@capacitor/keyboard": "^8.0.0",
    "@capacitor/local-notifications": "^8.0.0",
    "@capacitor/network": "^8.0.0",
    "@capacitor/preferences": "^8.0.0",
    "@capacitor/splash-screen": "^8.0.0",
    "@capacitor/status-bar": "^8.0.0",
    "@supabase/supabase-js": "^2.95.3",
    "axios": "^1.6.7",
    "clsx": "^2.1.1",
    "date-fns": "^3.3.1",
    "framer-motion": "^11.0.8",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.13.0",
    "tailwind-merge": "^3.4.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4"
  }
}

```

## File: client/index.html

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    
    <!-- Primary Meta Tags -->
    <title>Mithra AI — Your AI-Powered Life Operating System</title>
    <meta name="title" content="Mithra AI — Your AI-Powered Life Operating System" />
    <meta name="description" content="Mithra AI is your intelligent productivity companion. Manage tasks, build habits, track goals, journal your thoughts, and let AI optimize your schedule. All in one beautiful app." />
    <meta name="keywords" content="AI productivity app, task manager, habit tracker, calendar app, journal app, AI assistant, life OS, personal organizer, goal tracker, schedule optimizer" />
    <meta name="author" content="Hema Sai Vartikotti" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://mithra.ai/" />
    
    <!-- Viewport & Mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#C2185B" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Mithra AI" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://mithra.ai/" />
    <meta property="og:title" content="Mithra AI — Your AI-Powered Life Operating System" />
    <meta property="og:description" content="Manage tasks, build habits, track goals, journal your thoughts, and let AI optimize your schedule. All in one beautiful app." />
    <meta property="og:image" content="https://mithra.ai/og-image.png" />
    <meta property="og:site_name" content="Mithra AI" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://mithra.ai/" />
    <meta property="twitter:title" content="Mithra AI — Your AI-Powered Life Operating System" />
    <meta property="twitter:description" content="Manage tasks, build habits, track goals, journal your thoughts, and let AI optimize your schedule. All in one beautiful app." />
    <meta property="twitter:image" content="https://mithra.ai/og-image.png" />
    
    <!-- Icons -->
    <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
    <link rel="apple-touch-icon" href="/icon-192.svg" />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      /* Safe area inset support for Android notch */
      :root {
        --sat: env(safe-area-inset-top, 0px);
        --sab: env(safe-area-inset-bottom, 0px);
        --sal: env(safe-area-inset-left, 0px);
        --sar: env(safe-area-inset-right, 0px);
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

## File: client/src/native.js

```
/**
 * Mithra Native Bridge — Capacitor integration layer
 * Provides native Android features when running in Capacitor,
 * falls back to web APIs when running in browser.
 */
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';

/** Is the app running inside a native Capacitor shell? */
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

/* ─── Status Bar ─── */
export const configureStatusBar = async (isDark = true) => {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: isDark ? '#050505' : '#FFFFFF' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) { console.warn('StatusBar config failed:', e); }
};

/* ─── Splash Screen ─── */
export const hideSplash = async () => {
  if (!isNative) return;
  try { await SplashScreen.hide(); } catch (e) { /* silent */ }
};

/* ─── Haptics ─── */
export const hapticLight = async () => {
  if (!isNative) return;
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { /* silent */ }
};
export const hapticMedium = async () => {
  if (!isNative) return;
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { /* silent */ }
};
export const hapticHeavy = async () => {
  if (!isNative) return;
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) { /* silent */ }
};

/* ─── Local Notifications ─── */
export const requestNotificationPermission = async () => {
  try {
    if (isNative) {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } else {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  } catch (e) { return false; }
};

export const scheduleNotification = async ({ id, title, body, at }) => {
  try {
    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: typeof id === 'number' ? id : Math.floor(Math.random() * 100000),
          schedule: { at: new Date(at) },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#22d3ee',
        }],
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // Web fallback — schedule with setTimeout
      const delay = new Date(at).getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => new Notification(title, { body, icon: '/vite.svg' }), delay);
      }
    }
  } catch (e) { console.warn('Notification scheduling failed:', e); }
};

export const cancelAllNotifications = async () => {
  if (!isNative) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  } catch (e) { /* silent */ }
};

/* ─── Network ─── */
export const getNetworkStatus = async () => {
  try {
    if (isNative) {
      return await Network.getStatus();
    }
    return { connected: navigator.onLine, connectionType: 'wifi' };
  } catch (e) {
    return { connected: true, connectionType: 'unknown' };
  }
};

export const onNetworkChange = (callback) => {
  if (isNative) {
    return Network.addListener('networkStatusChange', callback);
  }
  const handler = () => callback({ connected: navigator.onLine, connectionType: 'unknown' });
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return { remove: () => { window.removeEventListener('online', handler); window.removeEventListener('offline', handler); } };
};

/* ─── Preferences (Native key-value storage) ─── */
export const nativeStorage = {
  get: async (key) => {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      }
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: async (key, value) => {
    if (isNative) {
      await Preferences.set({ key, value: JSON.stringify(value) });
    }
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
  },
  remove: async (key) => {
    if (isNative) await Preferences.remove({ key });
    localStorage.removeItem(key);
  },
};

/* ─── Open URL in native browser ─── */
export const openUrl = async (url) => {
  if (isNative) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

/* ─── Back Button Handler (Android) ─── */
export const setupBackButton = (navigateBack) => {
  if (!isNative) return { remove: () => { } };
  return CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      navigateBack();
    } else {
      CapApp.exitApp();
    }
  });
};

/* ─── Keyboard Listeners ─── */
export const setupKeyboard = () => {
  if (!isNative) return;
  try {
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-open');
    });
  } catch (e) { /* silent */ }
};

/* ─── Initialize all native features ─── */
export const initNative = async () => {
  if (!isNative) return;
  try {
    await configureStatusBar(true);
    setupKeyboard();
    // Hide splash after small delay to let React render
    setTimeout(() => hideSplash(), 300);
  } catch (e) { console.warn('Native init failed:', e); }
};

```

## File: client/src/index.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: var(--body-bg);
    color: var(--text-primary);
    @apply font-sans antialiased;
    transition: background-color 0.4s ease, color 0.4s ease;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px 128px;
  }

  [data-theme="light"] body::before {
    opacity: 0.01;
  }
}

/* ═══════════════════════════════════════
   DARK THEME (Default) — Royal Maroon + Black
   ═══════════════════════════════════════ */
:root {
  /* Base Colors */
  --color-merino: 242 235 227;
  /* Off-white text */
  --color-black: 5 5 5;
  /* Deepest black */
  --color-surface: 10 12 16;
  /* Slightly lighter black */

  /* Accent Colors (Default/Fallback) */
  --color-visor: 34 211 238;
  /* Cyan */
  --color-wine: 8 47 73;
  /* Deep Blue/Wine */
  --color-warning: 245 158 11;

  /* Semantic Mappings */
  --body-bg: #050505;
  --surface-bg: #0A0C10;
  --nav-bg: rgba(5, 5, 5, 0.85);
  --text-primary: #F2EBE3;
  --text-dim: rgba(242, 235, 227, 0.6);
  --selection-bg: rgba(34, 211, 238, 0.3);
  --selection-text: #050505;

  /* Glass System (Dark) */
  --glass-bg: rgba(10, 12, 16, 0.7);
  --glass-bg-hover: rgba(15, 20, 25, 0.85);
  --glass-border: transparent;
  /* Seamless */
  --glass-border-hover: rgba(34, 211, 238, 0.1);
  /* Subtle hover hint */
  --glass-blur: 16px;
  --glass-blur-heavy: 32px;

  /* Glows */
  --merino-glow: rgba(242, 235, 227, 0.02);
  --visor-glow: rgba(34, 211, 238, 0.05);
  /* Reduced */
  --accent-glow: rgba(34, 211, 238, 0.08);
  /* Reduced */

  /* Dynamic Accents (set by JS, defaults here) */
  --accent-color: #22d3ee;
  --accent-soft: #0891b2;
  --accent-secondary: #38bdf8;
}

/* ═══════════════════════════════════════
   LIGHT THEME — Warm Cream + Deep Maroon
   ═══════════════════════════════════════ */
[data-theme="light"] {
  /* Base Colors */
  --color-merino: 15 23 42;
  /* Dark Slate (Text) */
  --color-black: 248 250 252;
  /* Off-white (Background) */
  --color-surface: 255 255 255;
  /* Pure White */

  /* Semantic Mappings */
  --body-bg: #F8FAFC;
  --surface-bg: #ffffff;
  --nav-bg: rgba(248, 250, 252, 0.95);
  /* More opaque for performance */
  --text-primary: #0F172A;
  /* Slate 900 */
  --text-dim: rgba(15, 23, 42, 0.65);
  --selection-bg: rgba(6, 182, 212, 0.15);
  --selection-text: #050505;

  /* Glass System (Light) */
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-bg-hover: rgba(248, 250, 252, 0.95);
  --glass-border: transparent;
  /* Seamless */
  --glass-border-hover: rgba(6, 182, 212, 0.1);
  /* Subtle hover hint */

  /* Glows */
  --merino-glow: rgba(15, 23, 42, 0.02);
  --visor-glow: rgba(6, 182, 212, 0.05);
  --accent-glow: rgba(6, 182, 212, 0.08);

  /* Dynamic Accents (Light Mode Defaults) */
  --accent-color: #06b6d4;
  --accent-soft: #0891b2;
  --accent-secondary: #0ea5e9;
  --color-visor: 6 182 212;
}

/* ═══════════════════════════════════════
   GLASS SYSTEM — Optimized
   ═══════════════════════════════════════ */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  /* Seamless borderless look */
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  /* Diffuse shadow for depth */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  /* Removed inset */
}

[data-theme="dark"] .glass-panel {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  /* Stronger diffuse shadow for dark mode */
}

/* Interactive Hover for ALL glass panels */
.glass-panel:hover {
  border-color: var(--glass-border-hover);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .glass-panel:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-panel-hover {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* Optimized transition: only essential properties */
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-panel-hover:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.glass-heavy {
  background: var(--nav-bg);
  backdrop-filter: blur(var(--glass-blur-heavy));
  -webkit-backdrop-filter: blur(var(--glass-blur-heavy));
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  /* Fixed low blur */
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  /* Optimized transition */
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.glass-btn {
  @apply px-4 py-2 rounded-xl text-sm font-medium;
  color: var(--text-primary);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  /* Optimized transition */
  transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.glass-btn:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.glass-btn:active {
  transform: translateY(0) scale(0.98);
}

.glass-input {
  @apply w-full rounded-xl px-4 py-3;
  color: var(--text-primary);
  background: var(--glass-bg);
  /* Use shared var */
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-input::placeholder {
  color: var(--text-dim);
}

.glass-input:focus {
  border-color: rgba(var(--color-visor), 0.4);
  box-shadow: 0 0 0 2px rgba(var(--color-visor), 0.15), 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--color-merino), 0.2);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-merino), 0.4);
}

/* 3D Utilities */
.perspective-1000 {
  perspective: 1000px;
}

.backface-hidden {
  backface-visibility: hidden;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.origin-bottom {
  transform-origin: bottom;
}

.origin-top {
  transform-origin: top;
}

/* Shine Accent */
.glass-shine {
  position: relative;
  overflow: hidden;
}

.glass-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent 0%, var(--accent-glow) 50%, transparent 100%);
}

/* ═══════════════════════════════════════
   DYNAMIC ACCENT — Maps hardcoded hex classes to CSS vars
   These apply in BOTH dark and light so color themes work
   ═══════════════════════════════════════ */
.text-\[\#C2185B\] {
  color: var(--accent-color) !important;
}

.bg-\[\#C2185B\] {
  background-color: var(--accent-color) !important;
}

.bg-\[\#C2185B\]\/5 {
  background-color: rgb(var(--color-visor) / 0.05) !important;
}

.bg-\[\#C2185B\]\/10 {
  background-color: rgb(var(--color-visor) / 0.1) !important;
}

.bg-\[\#C2185B\]\/20 {
  background-color: rgb(var(--color-visor) / 0.2) !important;
}

.bg-\[\#C2185B\]\/30 {
  background-color: rgb(var(--color-visor) / 0.3) !important;
}

.bg-\[\#C2185B\]\/90 {
  background-color: rgb(var(--color-visor) / 0.9) !important;
}

.bg-\[\#C2185B\]\/\[0\.02\] {
  background-color: rgb(var(--color-visor) / 0.02) !important;
}

.bg-\[\#C2185B\]\/\[0\.03\] {
  background-color: rgb(var(--color-visor) / 0.03) !important;
}

.border-\[\#C2185B\] {
  border-color: var(--accent-color) !important;
}

.border-\[\#C2185B\]\/20 {
  border-color: rgb(var(--color-visor) / 0.2) !important;
}

.border-\[\#C2185B\]\/30 {
  border-color: rgb(var(--color-visor) / 0.3) !important;
}

.border-\[\#C2185B\]\/40 {
  border-color: rgb(var(--color-visor) / 0.4) !important;
}

.border-\[\#C2185B\]\/50 {
  border-color: rgb(var(--color-visor) / 0.5) !important;
}

.hover\:text-\[\#C2185B\]:hover {
  color: var(--accent-color) !important;
}

.hover\:bg-\[\#C2185B\]\/5:hover {
  background-color: rgb(var(--color-visor) / 0.05) !important;
}

.hover\:bg-\[\#C2185B\]\/10:hover {
  background-color: rgb(var(--color-visor) / 0.1) !important;
}

.hover\:bg-\[\#C2185B\]\/20:hover {
  background-color: rgb(var(--color-visor) / 0.2) !important;
}

.hover\:bg-\[\#C2185B\]\/90:hover {
  background-color: rgb(var(--color-visor) / 0.9) !important;
}

.hover\:border-\[\#C2185B\]\/30:hover {
  border-color: rgb(var(--color-visor) / 0.3) !important;
}

.hover\:border-\[\#C2185B\]\/40:hover {
  border-color: rgb(var(--color-visor) / 0.4) !important;
}

.hover\:border-\[\#C2185B\]\/50:hover {
  border-color: rgb(var(--color-visor) / 0.5) !important;
}

.shadow-\[0_0_8px_\#C2185B\] {
  box-shadow: 0 0 8px var(--accent-color) !important;
}

.shadow-\[0_0_6px_\#C2185B\] {
  box-shadow: 0 0 6px var(--accent-color) !important;
}

.group-hover\:border-\[\#C2185B\]\/30 {}

.group:hover .group-hover\:border-\[\#C2185B\]\/30 {
  border-color: rgb(var(--color-visor) / 0.3) !important;
}

.group:hover .group-hover\:bg-\[\#C2185B\]\/5 {
  background-color: rgb(var(--color-visor) / 0.05) !important;
}

/* Light-mode specific accent mapping to --accent-soft */
.text-\[\#9B1B30\] {
  color: var(--accent-soft, var(--accent-color)) !important;
}

.bg-\[\#9B1B30\] {
  background-color: var(--accent-soft, var(--accent-color)) !important;
}

/* Background overrides */
[data-theme="light"] .bg-\[\#0A0A0A\] {
  background-color: var(--body-bg) !important;
}

[data-theme="light"] .bg-\[\#0a0a0a\] {
  background-color: var(--body-bg) !important;
}

[data-theme="light"] .bg-\[\#1a1a1a\] {
  background-color: #f0ebe6 !important;
}

[data-theme="light"] .bg-\[\#2a2a2a\] {
  background-color: #e8e0d8 !important;
}

[data-theme="light"] .bg-\[\#111\] {
  background-color: #f5f1ed !important;
}

[data-theme="light"] .bg-\[\#C2185B\] {
  background-color: var(--accent-color) !important;
}

[data-theme="light"] .bg-\[\#C2185B\]\/5 {
  background-color: rgb(var(--color-visor) / 0.05) !important;
}

[data-theme="light"] .bg-\[\#C2185B\]\/10 {
  background-color: rgb(var(--color-visor) / 0.08) !important;
}

[data-theme="light"] .bg-\[\#C2185B\]\/20 {
  background-color: rgb(var(--color-visor) / 0.14) !important;
}

[data-theme="light"] .bg-\[\#C2185B\]\/30 {
  background-color: rgb(var(--color-visor) / 0.2) !important;
}

[data-theme="light"] .bg-\[\#C2185B\]\/90 {
  background-color: rgb(var(--color-visor) / 0.9) !important;
}

[data-theme="light"] .bg-\[\#4A0404\] {
  background-color: #fce4ec !important;
}

[data-theme="light"] .bg-\[\#4A0404\]\/10 {
  background-color: rgba(240, 228, 230, 0.4) !important;
}

[data-theme="light"] .bg-\[\#4A0404\]\/20 {
  background-color: rgba(240, 228, 230, 0.6) !important;
}

[data-theme="light"] .bg-\[\#F2EBE3\] {
  background-color: #2D1B1E !important;
}

[data-theme="light"] .bg-\[\#F2EBE3\]\/10 {
  background-color: rgba(45, 27, 30, 0.1) !important;
}

[data-theme="light"] .bg-\[\#F2EBE3\]\/30 {
  background-color: rgba(45, 27, 30, 0.3) !important;
}

[data-theme="light"] .bg-\[\#F2EBE3\]\/40 {
  background-color: rgba(45, 27, 30, 0.4) !important;
}

[data-theme="light"] .bg-\[\#F2EBE3\]\/50 {
  background-color: rgba(45, 27, 30, 0.5) !important;
}

[data-theme="light"] .bg-\[\#9B1B30\] {
  background-color: var(--accent-soft, var(--accent-color)) !important;
}

/* Border overrides */
[data-theme="light"] .border-\[\#F2EBE3\] {
  border-color: var(--glass-border) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/5 {
  border-color: rgb(var(--color-visor) / 0.06) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/10 {
  border-color: var(--glass-border) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/12 {
  border-color: var(--glass-border) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/15 {
  border-color: rgb(var(--color-visor) / 0.12) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/20 {
  border-color: rgb(var(--color-visor) / 0.16) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/25 {
  border-color: rgb(var(--color-visor) / 0.2) !important;
}

[data-theme="light"] .border-\[\#F2EBE3\]\/30 {
  border-color: rgb(var(--color-visor) / 0.25) !important;
}

[data-theme="light"] .border-\[\#C2185B\] {
  border-color: var(--accent-color) !important;
}

[data-theme="light"] .border-\[\#C2185B\]\/20 {
  border-color: rgb(var(--color-visor) / 0.2) !important;
}

[data-theme="light"] .border-\[\#C2185B\]\/30 {
  border-color: rgb(var(--color-visor) / 0.3) !important;
}

[data-theme="light"] .border-\[\#C2185B\]\/40 {
  border-color: rgb(var(--color-visor) / 0.4) !important;
}

[data-theme="light"] .border-\[\#C2185B\]\/50 {
  border-color: rgb(var(--color-visor) / 0.5) !important;
}

[data-theme="light"] .border-\[\#4A0404\]\/30 {
  border-color: rgba(240, 228, 230, 0.5) !important;
}

[data-theme="light"] .border-\[\#4A0404\]\/40 {
  border-color: rgba(240, 228, 230, 0.6) !important;
}

[data-theme="light"] .border-\[\#4A0404\]\/50 {
  border-color: rgba(240, 228, 230, 0.7) !important;
}

[data-theme="light"] .border-\[\#4A0404\]\/60 {
  border-color: rgba(240, 228, 230, 0.8) !important;
}

[data-theme="light"] .border-\[\#9B1B30\]\/30 {
  border-color: rgb(var(--color-visor) / 0.3) !important;
}

/* Shadow overrides */
[data-theme="light"] .shadow-\[0_0_4px_rgba\(0\,255\,65\,0\.4\)\] {
  box-shadow: 0 0 4px var(--accent-glow) !important;
}

[data-theme="light"] .shadow-\[0_0_12px_rgba\(0\,255\,65\,0\.3\)\] {
  box-shadow: 0 0 12px var(--accent-glow) !important;
}

[data-theme="light"] .shadow-\[0_0_30px_rgba\(0\,255\,65\,0\.25\)\] {
  box-shadow: 0 0 20px var(--accent-glow) !important;
}

[data-theme="light"] .shadow-\[0_0_20px_rgba\(0\,255\,65\,0\.3\)\] {
  box-shadow: 0 0 16px var(--accent-glow) !important;
}

/* White bg overrides */
[data-theme="light"] .hover\:bg-white\/10:hover {
  background-color: rgb(var(--color-visor) / 0.05) !important;
}

[data-theme="light"] .hover\:bg-white\/5:hover {
  background-color: rgb(var(--color-visor) / 0.03) !important;
}

[data-theme="light"] .hover\:bg-white\/\[0\.03\]:hover {
  background-color: rgb(var(--color-visor) / 0.03) !important;
}

[data-theme="light"] .bg-white\/5 {
  background-color: rgb(var(--color-visor) / 0.04) !important;
}

[data-theme="light"] .bg-white\/10 {
  background-color: rgb(var(--color-visor) / 0.06) !important;
}

/* Hover variant overrides */
[data-theme="light"] .hover\:bg-\[\#C2185B\]\/10:hover {
  background-color: rgb(var(--color-visor) / 0.08) !important;
}

[data-theme="light"] .hover\:bg-\[\#C2185B\]\/20:hover {
  background-color: rgb(var(--color-visor) / 0.14) !important;
}

[data-theme="light"] .hover\:bg-\[\#C2185B\]\/5:hover {
  background-color: rgb(var(--color-visor) / 0.05) !important;
}

[data-theme="light"] .hover\:bg-\[\#C2185B\]\/90:hover {
  background-color: rgb(var(--color-visor) / 0.9) !important;
}

[data-theme="light"] .hover\:bg-\[\#9B1B30\]:hover {
  background-color: var(--accent-soft) !important;
}

[data-theme="light"] .hover\:bg-\[\#2a2a2a\]:hover {
  background-color: #ddd5cc !important;
}

[data-theme="light"] .hover\:bg-\[\#4A0404\]\/10:hover {
  background-color: rgba(240, 228, 230, 0.4) !important;
}

[data-theme="light"] .hover\:border-\[\#C2185B\]\/30:hover {
  border-color: rgb(var(--color-visor) / 0.3) !important;
}

[data-theme="light"] .hover\:border-\[\#C2185B\]\/40:hover {
  border-color: rgb(var(--color-visor) / 0.4) !important;
}

[data-theme="light"] .hover\:border-\[\#C2185B\]\/50:hover {
  border-color: rgb(var(--color-visor) / 0.5) !important;
}

[data-theme="light"] .hover\:border-\[\#4A0404\]\/60:hover {
  border-color: rgba(240, 228, 230, 0.8) !important;
}

[data-theme="light"] .hover\:border-\[\#F2EBE3\]\/15:hover {
  border-color: rgb(var(--color-visor) / 0.12) !important;
}

[data-theme="light"] .hover\:border-\[\#F2EBE3\]\/20:hover {
  border-color: rgb(var(--color-visor) / 0.16) !important;
}

[data-theme="light"] .hover\:border-\[\#F2EBE3\]\/25:hover {
  border-color: rgb(var(--color-visor) / 0.2) !important;
}

[data-theme="light"] .hover\:text-\[\#C2185B\]:hover {
  color: var(--accent-color) !important;
}

[data-theme="light"] .hover\:text-\[\#F2EBE3\]:hover {
  color: #2D1B1E !important;
}

[data-theme="light"] .hover\:text-\[\#F2EBE3\]\/50:hover {
  color: rgba(45, 27, 30, 0.52) !important;
}

[data-theme="light"] .hover\:text-\[\#F2EBE3\]\/60:hover {
  color: rgba(45, 27, 30, 0.62) !important;
}

[data-theme="light"] .hover\:text-\[\#F2EBE3\]\/70:hover {
  color: rgba(45, 27, 30, 0.72) !important;
}

/* ═══════════════════════════════════════
   MOBILE / ANDROID NATIVE SUPPORT
   ═══════════════════════════════════════ */

/* Keyboard open state — adjust layout when virtual keyboard shows */
body.keyboard-open {
  --keyboard-height: 0px;
}

body.keyboard-open main {
  padding-bottom: var(--keyboard-height) !important;
}

/* Hide bottom nav when keyboard is open */
body.keyboard-open .md\:hidden:last-child {
  display: none !important;
}

/* Safe area padding for Android notch/gesture bar */
@supports (padding: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
}

/* Touch feedback for mobile */
@media (max-width: 767px) {

  /* Prevent text selection on tap */
  button,
  a,
  [role="button"] {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    user-select: none;
  }

  /* Smooth scrolling */
  .overflow-y-auto,
  .overflow-auto {
    -webkit-overflow-scrolling: touch;
  }

  /* Fix 100vh on mobile (address bar issue) */
  .min-h-screen {
    min-height: 100dvh;
  }

  .h-screen {
    height: 100dvh;
  }
}

/* Scrollbar styling for Android WebView */
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

[data-theme="light"] ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Hide scrollbar utility */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth hover lift for interactive cards */
.glass-card-interactive {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.glass-card-interactive:hover {
  transform: translateY(-2px);
}

.glass-card-interactive:active {
  transform: translateY(0) scale(0.99);
}

/* Pulse glow for active states */
@keyframes pulseGlow {

  0%,
  100% {
    box-shadow: 0 0 8px var(--accent-glow);
  }

  50% {
    box-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow);
  }
}

.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Gradient text utility */
.text-gradient {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══════════════════════════════════════
   RANGE SLIDER — Notifications
   ═══════════════════════════════════════ */
input[type="range"].reminder-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  outline: none;
  cursor: pointer;
}

input[type="range"].reminder-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 8px var(--accent-glow), 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: grab;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

input[type="range"].reminder-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 14px var(--accent-glow), 0 2px 8px rgba(0, 0, 0, 0.4);
}

input[type="range"].reminder-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}

input[type="range"].reminder-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 8px var(--accent-glow), 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: grab;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

input[type="range"].reminder-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
}

input[type="range"].reminder-slider::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: transparent;
}

[data-theme="light"] input[type="range"].reminder-slider::-webkit-slider-thumb {
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 6px var(--accent-glow), 0 1px 4px rgba(0, 0, 0, 0.15);
}

[data-theme="light"] input[type="range"].reminder-slider::-moz-range-thumb {
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 6px var(--accent-glow), 0 1px 4px rgba(0, 0, 0, 0.15);
}

/* ═══ Skeleton shimmer animation ═══ */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ═══════════════════════════════════════
   MOBILE PERFORMANCE — reduce GPU overhead
   ═══════════════════════════════════════ */
@media (max-width: 640px) {

  /* Reduce heavy blur on mobile for snappier scrolling */
  .backdrop-blur-xl {
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }

  .backdrop-blur-2xl {
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
  }

  body::before {
    display: none;
  }

  /* disable noise overlay on mobile — saves a compositing layer */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* remove tap flash */
}

/* Safe-area bottom padding for notched phones */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

## File: client/src/main.jsx

```
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initNative } from './native.js'

// Initialize native platform features (Capacitor)
initNative();

/* ══════════════════════════════════════════════════════════════
   DATA MIGRATION v2 — Clear stale mock data from localStorage
   Old versions shipped hardcoded demo entries (journal, calendar).
   This one-time cleanup removes them so users start fresh.
   ══════════════════════════════════════════════════════════════ */
try {
  const DATA_VERSION = 'mithra-data-v2';
  if (!localStorage.getItem(DATA_VERSION)) {
    // Known mock entry titles from old versions
    const MOCK_JOURNAL_TITLES = ['Great breakthrough at work', 'Feeling drained', 'New PR at the Gym', 'Quiet Morning', 'Anxiety about deadline', 'Meditated for 20 minutes'];
    const MOCK_EVENT_TITLES = ['Deep Work Session', 'Team Standup', 'Client Review', 'Gym', 'Design Sprint', 'Lunch w/ Sam', 'Weekly Review', 'Reading Block'];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Clean journal entries
      if (key.includes('journal-entries') || key.includes('journal')) {
        try {
          const entries = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(entries)) {
            const cleaned = entries.filter(e => !MOCK_JOURNAL_TITLES.includes(e.title));
            if (cleaned.length !== entries.length) {
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch {}
      }

      // Clean calendar events
      if (key.includes('calendar-events')) {
        try {
          const events = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(events)) {
            const cleaned = events.filter(e => !MOCK_EVENT_TITLES.includes(e.title));
            if (cleaned.length !== events.length) {
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch {}
      }
    }
    localStorage.setItem(DATA_VERSION, Date.now().toString());
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

```

## File: client/src/App.jsx

```
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import SearchDialog from './components/SearchDialog';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import { setupBackButton, isNative } from './native';

/* Lazy-load heavy page components for faster initial paint */
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MithraCalendar = lazy(() => import('./pages/Calendar'));
const MithraTasks = lazy(() => import('./pages/Tasks'));
const MithraJournal = lazy(() => import('./pages/Journal'));
const DostMode = lazy(() => import('./pages/DostMode'));
const Settings = lazy(() => import('./pages/Settings'));
const HabitFocusHub = lazy(() => import('./pages/HabitFocusHub'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

/* Lightweight page loading fallback (shows instantly, no cumulative layout shift) */
const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #22d3ee)', borderTopColor: 'transparent' }} />
  </div>
);

/* OAuth Callback Handler — detects ?code= and waits for auth before redirecting */
const OAuthCallbackGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hasCode = new URLSearchParams(window.location.search).has('code');

  // If this is an OAuth callback (?code= in URL), show loading while AuthContext exchanges it
  if (hasCode) {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary, #0A0A0A)' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #22d3ee)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--text-dim, #888)' }}>Signing you in...</p>
          </div>
        </div>
      );
    }
    // Auth exchange done — redirect to dashboard
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  }

  // Also redirect if already authenticated and visiting landing page
  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

/* Guard: redirect to /auth if not authenticated */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('mithra-onboarding-done');
  });
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout — if auth loading takes longer than 10s, stop waiting
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Wait for Supabase session to be checked (OAuth callback, token refresh, etc.)
  if (loading && !timedOut) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary, #0A0A0A)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #22d3ee)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-dim, #888)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  return children;
};

/* Guard: redirect to /dashboard if already authenticated */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // While loading, show the auth page (don't redirect yet)
  if (loading) return children;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

/* Android hardware back button handler */
const BackButtonHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNative) return;
    const listener = setupBackButton(() => navigate(-1));
    return () => { listener?.remove?.(); };
  }, [navigate]);
  return null;
};

/* Global Cmd+K search */
const GlobalSearch = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <SearchDialog open={open} onClose={() => setOpen(false)} />;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Global redirect safety net: if authenticated and on public page, go to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (location.pathname === '/' || location.pathname === '/auth') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, loading, location, navigate]);

  return (
    <>
      <BackButtonHandler />
      <GlobalSearch />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<OAuthCallbackGuard><Suspense fallback={<PageLoader />}><LandingPage /></Suspense></OAuthCallbackGuard>} />

        {/* Auth routes — no sidebar/layout */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/reset-password" element={<AuthPage isPasswordReset={true} />} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/dost" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><DostMode /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><MithraCalendar /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><MithraTasks /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><HabitFocusHub /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><MithraJournal /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><Settings /></Suspense></Layout></ProtectedRoute>} />

        {/* Public Pages */}
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

```

## File: client/src/context/AuthContext.jsx

```
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { authService, isSupabaseConfigured, supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

/* Google icon SVG as a component */
const GOOGLE_PROVIDER = 'google';

/* ── SHA-256 hashing with salt (Web Crypto API) — used for offline/fallback auth ── */
const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password, salt) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password, salt, storedHash) => {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
};

/* ── localStorage helpers ── */
const loadAuth = () => {
  try {
    const stored = localStorage.getItem('mithra-auth');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const loadProfile = () => {
  try {
    const auth = loadAuth();
    if (auth?.id) {
      const scoped = localStorage.getItem(`mithra-profile-${auth.id}`);
      if (scoped) return JSON.parse(scoped);
    }
    const stored = localStorage.getItem('mithra-profile');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const loadUsers = () => {
  try {
    const stored = localStorage.getItem('mithra-users');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuth());
  const [profile, setProfile] = useState(() => loadProfile() || {
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateJoined: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(isSupabaseConfigured && !user); // Optimistic: if user exists locally, don't show loading
  const authListenerRef = useRef(null);

  const isAuthenticated = !!user;

  /* ══════════════════════════════════════════════════════════════
     Supabase Auth State Listener
     — Automatically restores session from cookies/localStorage
     — Handles token refresh, sign-in/out events
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check for existing session on mount
    const initSession = async () => {
      try {
        // If we have an OAuth code, we need to wait for Supabase's auto-exchange 
        // (which happens async) before we declare 'loading' over.
        const hasCode = new URLSearchParams(window.location.search).has('code');

        let session = null;

        if (hasCode) {
          // Poll for session - give auto-exchange time to complete
          for (let i = 0; i < 5; i++) {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
              session = data.session;
              break;
            }
            await new Promise(r => setTimeout(r, 800)); // wait 800ms between checks
          }
        } else {
          // Normal load
          const { data } = await supabase.auth.getSession();
          session = data?.session;
        }

        if (session?.user) {
          const supaUser = {
            id: session.user.id,
            email: session.user.email,
            provider: 'supabase',
          };
          setUser(supaUser);

          // Pull profile from Supabase
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfile(prev => ({
                ...prev,
                fullName: profileData.full_name || prev.fullName,
                email: session.user.email,
                avatarUrl: profileData.avatar_url || prev.avatarUrl,
                dateJoined: profileData.created_at || prev.dateJoined,
              }));
            } else {
              // Fallback for new OAuth users where profile might not exist yet
              setProfile(prev => ({
                ...prev,
                fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || prev.fullName,
                email: session.user.email,
                avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || prev.avatarUrl,
              }));
            }
          } catch (err) {
            console.warn('[Mithra] Profile fetch warning:', err);
          }
        }
      } catch (err) {
        console.warn('[Mithra] Session restore error:', err);
        // If session restore fails hard, clear local storage to prevent loops
        if (err.message?.includes('JWT')) {
          localStorage.removeItem('mithra-supabase-auth');
        }
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (sign in, sign out, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Mithra] Auth event:', event);

        if (event === 'PASSWORD_RECOVERY') {
          sessionStorage.setItem('mithra-password-recovery', 'true');
          window.location.hash = '#/reset-password';
        } else if (event === 'SIGNED_IN' && session?.user) {
          const supaUser = {
            id: session.user.id,
            email: session.user.email,
            provider: 'supabase',
          };
          setUser(supaUser);

          // Force navigation to dashboard if we're on landing page or auth page
          // This fixes the issue where OAuth redirects to root but doesn't navigate
          const currentHash = window.location.hash;
          if (!currentHash || currentHash === '#/' || currentHash === '#/auth') {
            window.location.hash = '#/dashboard';
          }

          // Pull profile logic...
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfile(prev => ({
                ...prev,
                fullName: profileData.full_name || session.user.user_metadata?.full_name || prev.fullName,
                email: session.user.email,
                avatarUrl: profileData.avatar_url || session.user.user_metadata?.avatar_url || prev.avatarUrl,
                dateJoined: profileData.created_at || prev.dateJoined,
              }));
            } else {
              // New OAuth user — set profile from metadata
              setProfile(prev => ({
                ...prev,
                fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || prev.fullName,
                email: session.user.email,
                avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || prev.avatarUrl,
              }));
            }
          } catch { }

          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    authListenerRef.current = subscription;

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Persist auth state to localStorage (cache for offline)
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('mithra-auth', JSON.stringify(user));
      } else {
        localStorage.removeItem('mithra-auth');
      }
    } catch { }
  }, [user]);

  // Persist profile scoped to user
  useEffect(() => {
    try {
      if (profile && user?.id) {
        localStorage.setItem(`mithra-profile-${user.id}`, JSON.stringify(profile));
        localStorage.setItem('mithra-profile', JSON.stringify(profile));
      }
    } catch { }
  }, [profile, user]);

  /* ── Helper to clear old user data for fresh start ── */
  const clearOldUserData = useCallback((userId) => {
    // Clear any global (non-scoped) mithra data that might have lingered
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mithra-') && !key.includes(userId)) {
        // Remove old user-scoped data and global data
        if (key.match(/mithra-(tasks|habits|calendar-events|journal|mood|focus|chat-history)/)) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }, []);

  /* ══════════════════════════════════════════════════════════════
     SIGN UP — Supabase-first, localStorage fallback
     ═══════════════════════════════════════════════════════════ */
  const signUp = useCallback(async ({ fullName, email, password }) => {
    // ── Supabase path ──
    if (isSupabaseConfigured) {
      const data = await authService.signUp(email, password, fullName);
      if (!data || !data.user) throw new Error('Sign up failed - please try again');
      const supaUser = data.user;

      // Clear any old demo/test data for this new user
      clearOldUserData(supaUser.id);

      const authUser = { id: supaUser.id, email: supaUser.email, provider: 'supabase' };
      setUser(authUser);
      setProfile(prev => ({
        ...prev,
        fullName,
        email: supaUser.email,
        dateJoined: new Date().toISOString(),
      }));

      // Also cache in localStorage for offline access
      _cacheUserLocally({ fullName, email, password, id: supaUser.id });

      return authUser;
    }

    // ── localStorage fallback path ──
    const users = loadUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists');

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
    };

    // Clear any old demo/test data for this new user
    clearOldUserData(newUser.id);

    users.push(newUser);
    try {
      localStorage.setItem('mithra-users', JSON.stringify(users));
    } catch {
      try {
        const keysToTrim = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('mood-history') || key.includes('focus-sessions'))) {
            keysToTrim.push(key);
          }
        }
        keysToTrim.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('mithra-users', JSON.stringify(users));
      } catch {
        throw new Error('Storage full — please clear browser data and try again');
      }
    }

    const authUser = { id: newUser.id, email: newUser.email };
    setUser(authUser);
    setProfile(prev => ({
      ...prev,
      fullName,
      email: newUser.email,
      dateJoined: newUser.createdAt,
    }));

    return authUser;
  }, []);

  /* ══════════════════════════════════════════════════════════════
     SIGN IN — Supabase-first, localStorage fallback
     ═══════════════════════════════════════════════════════════ */
  const signIn = useCallback(async ({ email, password }) => {
    // ── Supabase path ──
    if (isSupabaseConfigured) {
      const { session, error } = await authService.signIn(email, password);
      if (error) throw new Error(error.message || 'Sign in failed');

      const supaUser = session.user;
      const authUser = { id: supaUser.id, email: supaUser.email, provider: 'supabase' };
      setUser(authUser);

      // Pull profile from Supabase
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supaUser.id)
          .single();

        if (profileData) {
          setProfile(prev => ({
            ...prev,
            fullName: profileData.full_name || prev.fullName,
            email: supaUser.email,
            avatarUrl: profileData.avatar_url || prev.avatarUrl,
            dateJoined: profileData.created_at || prev.dateJoined,
          }));
        }
      } catch { }

      return authUser;
    }

    // ── localStorage fallback path ──
    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email');

    if (found.salt) {
      const valid = await verifyPassword(password, found.salt, found.password);
      if (!valid) throw new Error('Incorrect password');
    } else {
      try {
        if (atob(found.password) !== password) throw new Error('Incorrect password');
      } catch { throw new Error('Incorrect password'); }
      const salt = generateSalt();
      found.salt = salt;
      found.password = await hashPassword(password, salt);
      try { localStorage.setItem('mithra-users', JSON.stringify(users)); } catch { }
    }

    const authUser = { id: found.id, email: found.email };
    setUser(authUser);

    try {
      const scopedProfile = localStorage.getItem(`mithra-profile-${found.id}`);
      if (scopedProfile) {
        setProfile(JSON.parse(scopedProfile));
      } else {
        const storedProfile = loadProfile();
        if (storedProfile && storedProfile.email === found.email) {
          setProfile(storedProfile);
        } else {
          setProfile(prev => ({ ...prev, email: found.email }));
        }
      }
    } catch {
      setProfile(prev => ({ ...prev, email: found.email }));
    }

    return authUser;
  }, []);

  /* ══════════════════════════════════════════════════════════════
     SIGN OUT
     ═══════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════
     SIGN OUT
     ═══════════════════════════════════════════════════════════ */
  const signOut = useCallback(async () => {
    // 1. Immediate local cleanup (Optimistic UI)
    setUser(null);
    setProfile({
      fullName: '',
      email: '',
      phone: '',
      bio: '',
      avatarUrl: '',
      location: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateJoined: new Date().toISOString(),
    });

    try {
      localStorage.removeItem('mithra-auth');
      // Aggressively clear other keys to ensure no stale state
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mithra-') && !key.includes('theme')) {
          localStorage.removeItem(key);
        }
      });
    } catch { }

    // 2. Background server cleanup
    if (isSupabaseConfigured) {
      try {
        await authService.signOut();
      } catch (err) {
        console.warn('Background signout error:', err);
      }
    }

    // 3. Force Hard Reload to clear all React state and memory
    window.location.href = '/';
  }, []);

  /* ══════════════════════════════════════════════════════════════
     SIGN IN WITH GOOGLE (OAuth)
     ═══════════════════════════════════════════════════════════ */
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Google sign-in requires Supabase to be configured. Please set up your Supabase credentials.');
    }
    return await authService.signInWithGoogle();
  }, []);

  /* ══════════════════════════════════════════════════════════════
     PASSWORD RESET
     ═══════════════════════════════════════════════════════════ */
  const resetPassword = useCallback(async (email) => {
    if (isSupabaseConfigured) {
      const { error } = await authService.resetPassword(email);
      if (error) throw new Error(error.message);
      return true;
    }

    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email');
    localStorage.setItem('mithra-reset-email', email.toLowerCase());
    return true;
  }, []);

  const confirmResetPassword = useCallback(async (email, newPassword) => {
    if (isSupabaseConfigured) {
      // With Supabase, the reset flow is handled via email link + updatePassword
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw new Error(error.message);
      return true;
    }

    const users = loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) throw new Error('No account found with this email');
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters');

    const salt = generateSalt();
    users[idx].password = await hashPassword(newPassword, salt);
    users[idx].salt = salt;
    try { localStorage.setItem('mithra-users', JSON.stringify(users)); } catch { }
    localStorage.removeItem('mithra-reset-email');
    return true;
  }, []);

  /* ══════════════════════════════════════════════════════════════
     PROFILE & PASSWORD UPDATE
     ═══════════════════════════════════════════════════════════ */
  const updateProfile = useCallback(async (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));

    // Sync profile to Supabase
    if (isSupabaseConfigured && user?.provider === 'supabase') {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: updates.fullName || undefined,
          avatar_url: updates.avatarUrl || undefined,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch { }
    }
  }, [user]);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) throw new Error('Not authenticated');

    if (isSupabaseConfigured && user.provider === 'supabase') {
      // Supabase handles password verification internally
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw new Error(error.message);
      return true;
    }

    // localStorage fallback
    const users = loadUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx === -1) throw new Error('User not found');

    if (users[idx].salt) {
      const valid = await verifyPassword(currentPassword, users[idx].salt, users[idx].password);
      if (!valid) throw new Error('Current password is incorrect');
    } else {
      try { if (atob(users[idx].password) !== currentPassword) throw new Error('Current password is incorrect'); }
      catch { throw new Error('Current password is incorrect'); }
    }

    const salt = generateSalt();
    users[idx].password = await hashPassword(newPassword, salt);
    users[idx].salt = salt;
    try { localStorage.setItem('mithra-users', JSON.stringify(users)); } catch { }
    return true;
  }, [user]);

  /* ── Helper: cache Supabase user locally for offline access ── */
  const _cacheUserLocally = async ({ fullName, email, password, id }) => {
    try {
      const users = loadUsers();
      if (!users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);
        users.push({
          id,
          email: email.toLowerCase(),
          password: hashedPassword,
          salt,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('mithra-users', JSON.stringify(users));
      }
    } catch { }
  };

  const value = useMemo(() => ({
    user,
    profile,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    confirmResetPassword,
    updateProfile,
    updatePassword,
  }), [user, profile, isAuthenticated, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, confirmResetPassword, updateProfile, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

```

## File: client/src/context/DataContext.jsx

```
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns';
import { scheduleNotification, isNative, requestNotificationPermission as nativeRequestPermission } from '../native';
import { syncEngine } from '../services/syncEngine';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { listGoogleEvents } from '../services/googleCalendar';

/* ═══════════════════════════════════════════════════════════════
   SHARED DATA CONTEXT
   Tasks, Habits, Focus sessions, Theme, and Sync settings
   shared across Calendar, Tasks, Habits, and Settings pages
   ═══════════════════════════════════════════════════════════════ */

const DataContext = createContext(null);

/* ═══════════════════════════════════════════════════════════════
   COLOR THEME PALETTES — Each palette defines accent colors
   for both dark and light modes
   ═══════════════════════════════════════════════════════════════ */
const COLOR_THEMES = {
  sakura: {
    name: 'Sakura',
    preview: { top: '#6B1525', bottomLeft: '#0A0505', bottomRight: '#F8BBD0' },
    dark: {
      '--accent-color': '#C2185B',
      '--accent-soft': '#8B1A2B',
      '--accent-glow': 'rgba(194,24,91,0.15)',
      '--accent-secondary': '#D4AF37',
      '--color-visor': '139 26 43',
      '--visor-glow': 'rgba(139,26,43,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#9B1B30',
      '--accent-soft': '#6B1525',
      '--accent-glow': 'rgba(155,27,48,0.1)',
      '--accent-secondary': '#8B6914',
      '--color-visor': '107 21 37',
      '--visor-glow': 'rgba(107,21,37,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },
  blue: {
    name: 'Blue',
    preview: { top: '#1565C0', bottomLeft: '#0A1628', bottomRight: '#90CAF9' },
    dark: {
      '--accent-color': '#42A5F5',
      '--accent-soft': '#1565C0',
      '--accent-glow': 'rgba(66,165,245,0.15)',
      '--accent-secondary': '#80DEEA',
      '--color-visor': '66 165 245',
      '--visor-glow': 'rgba(66,165,245,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#1565C0',
      '--accent-soft': '#0D47A1',
      '--accent-glow': 'rgba(21,101,192,0.1)',
      '--accent-secondary': '#00838F',
      '--color-visor': '21 101 192',
      '--visor-glow': 'rgba(21,101,192,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },
  forest: {
    name: 'Forest',
    preview: { top: '#2E7D32', bottomLeft: '#0A1409', bottomRight: '#A5D6A7' },
    dark: {
      '--accent-color': '#66BB6A',
      '--accent-soft': '#2E7D32',
      '--accent-glow': 'rgba(102,187,106,0.15)',
      '--accent-secondary': '#AED581',
      '--color-visor': '102 187 106',
      '--visor-glow': 'rgba(102,187,106,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#2E7D32',
      '--accent-soft': '#1B5E20',
      '--accent-glow': 'rgba(46,125,50,0.1)',
      '--accent-secondary': '#558B2F',
      '--color-visor': '46 125 50',
      '--visor-glow': 'rgba(46,125,50,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },
  vapourwave: {
    name: 'Vapour Wave',
    preview: { top: '#00838F', bottomLeft: '#081214', bottomRight: '#80DEEA' },
    dark: {
      '--accent-color': '#26C6DA',
      '--accent-soft': '#00838F',
      '--accent-glow': 'rgba(38,198,218,0.15)',
      '--accent-secondary': '#CE93D8',
      '--color-visor': '38 198 218',
      '--visor-glow': 'rgba(38,198,218,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#00838F',
      '--accent-soft': '#006064',
      '--accent-glow': 'rgba(0,131,143,0.1)',
      '--accent-secondary': '#7B1FA2',
      '--color-visor': '0 131 143',
      '--visor-glow': 'rgba(0,131,143,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },
  nightfall: {
    name: 'Nightfall',
    preview: { top: '#283593', bottomLeft: '#050718', bottomRight: '#9FA8DA' },
    dark: {
      '--accent-color': '#7986CB',
      '--accent-soft': '#283593',
      '--accent-glow': 'rgba(121,134,203,0.15)',
      '--accent-secondary': '#4FC3F7',
      '--color-visor': '121 134 203',
      '--visor-glow': 'rgba(121,134,203,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#283593',
      '--accent-soft': '#1A237E',
      '--accent-glow': 'rgba(40,53,147,0.1)',
      '--accent-secondary': '#0277BD',
      '--color-visor': '40 53 147',
      '--visor-glow': 'rgba(40,53,147,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },
  cocoa: {
    name: 'Cocoa',
    preview: { top: '#8D6E63', bottomLeft: '#1A0E0A', bottomRight: '#D7CCC8' },
    dark: {
      '--accent-color': '#A1887F',
      '--accent-soft': '#6D4C41',
      '--accent-glow': 'rgba(161,136,127,0.15)',
      '--accent-secondary': '#FFB74D',
      '--color-visor': '161 136 127',
      '--visor-glow': 'rgba(161,136,127,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#5D4037',
      '--accent-soft': '#3E2723',
      '--accent-glow': 'rgba(93,64,55,0.1)',
      '--accent-secondary': '#E65100',
      '--color-visor': '93 64 55',
      '--visor-glow': 'rgba(93,64,55,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },
  neon: {
    name: 'Neon',
    preview: { top: '#06b6d4', bottomLeft: '#0a0f14', bottomRight: '#22d3ee' },
    dark: {
      '--accent-color': '#22d3ee',
      '--accent-soft': '#06b6d4',
      '--accent-glow': 'rgba(34,211,238,0.15)',
      '--accent-secondary': '#3b82f6',
      '--color-visor': '34 211 238',
      '--visor-glow': 'rgba(34,211,238,0.12)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#0891b2',
      '--accent-soft': '#0e7490',
      '--accent-glow': 'rgba(8,145,178,0.1)',
      '--accent-secondary': '#1d4ed8',
      '--color-visor': '8 145 178',
      '--visor-glow': 'rgba(8,145,178,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
  },

};

/* Helper to apply a color theme's CSS variables */
const applyColorTheme = (themeId, mode) => {
  const palette = COLOR_THEMES[themeId];
  if (!palette) return;
  const vars = mode === 'light' ? palette.light : palette.dark;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION REMINDER OPTIONS
   ═══════════════════════════════════════════════════════════════ */
const REMINDER_OPTIONS = [
  { value: 1, label: '1 minute before' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 360, label: '6 hours before' },
  { value: 720, label: '12 hours before' },
  { value: 1440, label: '1 day before' },
];

const today = new Date();

/* ── localStorage helpers ── */
const loadFromStorage = (key, fallback) => {
  try {
    // Try user-scoped key first, fall back to global key for migration
    const userId = (() => { try { const a = JSON.parse(localStorage.getItem('mithra-auth') || 'null'); return a?.id; } catch { return null; } })();
    const scopedKey = userId ? `mithra-${userId}-${key}` : `mithra-${key}`;
    const stored = localStorage.getItem(scopedKey);
    if (stored !== null) return JSON.parse(stored);
    // Migrate from unscopped key if user-scoped doesn't exist
    if (userId) {
      const globalStored = localStorage.getItem(`mithra-${key}`);
      if (globalStored !== null) {
        const parsed = JSON.parse(globalStored);
        localStorage.setItem(scopedKey, globalStored); // migrate
        return parsed;
      }
    }
    return fallback;
  } catch { return fallback; }
};
const saveToStorage = (key, value) => {
  try {
    const userId = (() => { try { const a = JSON.parse(localStorage.getItem('mithra-auth') || 'null'); return a?.id; } catch { return null; } })();
    const scopedKey = userId ? `mithra-${userId}-${key}` : `mithra-${key}`;
    localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch { }
};

/** Get user-scoped localStorage key — use this in pages that manage their own storage */
export const getUserScopedKey = (baseKey) => {
  try {
    const a = JSON.parse(localStorage.getItem('mithra-auth') || 'null');
    if (a?.id) return `mithra-${a.id}-${baseKey}`;
  } catch { }
  return `mithra-${baseKey}`;
};

/** Load from user-scoped localStorage with migration from global key */
export const loadUserStorage = (baseKey, fallback) => {
  try {
    const scopedKey = getUserScopedKey(baseKey);
    const stored = localStorage.getItem(scopedKey);
    if (stored !== null) return JSON.parse(stored);
    // Migrate from global key
    const globalKey = `mithra-${baseKey}`;
    if (scopedKey !== globalKey) {
      const globalStored = localStorage.getItem(globalKey);
      if (globalStored !== null) {
        localStorage.setItem(scopedKey, globalStored);
        return JSON.parse(globalStored);
      }
    }
    return fallback;
  } catch { return fallback; }
};

/** Save to user-scoped localStorage */
export const saveUserStorage = (baseKey, value) => {
  try {
    localStorage.setItem(getUserScopedKey(baseKey), JSON.stringify(value));
  } catch { }
};

/* ── initial tasks — empty for new users ── */
const INITIAL_TASKS = [];

/* ── initial habits ── */
function generateConsistency(probability) {
  const start = new Date(today.getFullYear(), 0, 1);
  const days = [];
  let d = new Date(start);
  while (d <= today) {
    if (Math.random() < probability) days.push(format(d, 'yyyy-MM-dd'));
    d = addDays(d, 1);
  }
  return days;
}

/* ── initial habits — empty for new users ── */
const INITIAL_HABITS = [];

/* ── initial lists ── */
const INITIAL_LISTS = [
  { id: 'default', name: 'My Tasks', color: 'var(--accent-color)' },
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#f97316' },
];

/* ── habit → calendar category mapping ── */
const HABIT_CATEGORY_MAP = {
  Work: 'Work',
  Health: 'Health',
  Personal: 'Personal',
  Learning: 'Focus',
  Mindfulness: 'Focus',
};

/* ═══════════════════════════════════════════════════════════════ */
export function DataProvider({ children }) {
  // Tasks — load from localStorage, fall back to initial data
  const [tasks, setTasks] = useState(() => {
    const stored = loadFromStorage('tasks', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      // Rehydrate date objects
      return stored.map(t => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      }));
    }
    return INITIAL_TASKS;
  });
  const [taskLists] = useState(INITIAL_LISTS);

  // Habits — load from localStorage, fall back to initial data
  const [habits, setHabits] = useState(() => {
    const stored = loadFromStorage('habits', null);
    if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    return INITIAL_HABITS;
  });

  // Theme: 'dark' | 'light' — defaults to system preference
  const [theme, setTheme] = useState(() => {
    const stored = loadFromStorage('theme', null);
    if (stored) return stored;
    // Auto-detect system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Color theme palette
  const [colorTheme, setColorTheme] = useState(() => loadFromStorage('colorTheme', 'neon'));

  // Preferences
  const [notifications, setNotifications] = useState(() => loadFromStorage('notifications', true));
  const [focusSound, setFocusSound] = useState(() => loadFromStorage('focusSound', false));

  // Notification settings — per-category
  const [notificationSettings, setNotificationSettings] = useState(() =>
    loadFromStorage('notificationSettings', {
      enabled: false,
      reminderMinutes: 15,
      taskReminders: true,
      eventReminders: true,
      habitReminders: true,
      streakLossAlerts: true,
      overdueTaskAlerts: true,
      taskReminderMinutes: 15,
      eventReminderMinutes: 15,
      habitReminderMinutes: 60,
    })
  );

  // Sync settings
  const [syncSettings, setSyncSettings] = useState(() => loadFromStorage('syncSettings', {
    syncTasksToCalendar: true,
    syncHabitsToCalendar: true,
    syncFocusToTracker: true,
    syncGoogleCalendar: false, // User toggle for G-Cal
  }));

  // Google Calendar Events State
  const [googleEvents, setGoogleEvents] = useState([]);

  const fetchGoogleEvents = useCallback(async () => {
    if (!isSupabaseConfigured || !syncSettings.syncGoogleCalendar) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1 month back
        const end = new Date(now.getFullYear(), now.getMonth() + 3, 1);   // 3 months forward
        const events = await listGoogleEvents(session.provider_token, start, end);
        setGoogleEvents(events);
        console.log('[Mithra] Synced', events.length, 'Google Calendar events');
      }
    } catch (err) {
      console.warn('[Mithra] Google Calendar sync failed:', err);
    }
  }, [syncSettings.syncGoogleCalendar]);

  // Initial sync and poll
  useEffect(() => {
    fetchGoogleEvents();
    const interval = setInterval(fetchGoogleEvents, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchGoogleEvents]);

  // Persist settings to localStorage whenever they change
  useEffect(() => { saveToStorage('theme', theme); }, [theme]);
  useEffect(() => { saveToStorage('colorTheme', colorTheme); }, [colorTheme]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('focusSound', focusSound); }, [focusSound]);
  useEffect(() => { saveToStorage('syncSettings', syncSettings); }, [syncSettings]);
  useEffect(() => { saveToStorage('notificationSettings', notificationSettings); }, [notificationSettings]);

  // Persist tasks and habits to localStorage
  useEffect(() => { saveToStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('habits', habits); }, [habits]);

  /* ══════════════════════════════════════════════════════════════
     SUPABASE SYNC — Pull on mount, push on CRUD
     ═══════════════════════════════════════════════════════════ */
  const hasPulledRef = useRef(false);

  // Initial pull from Supabase when user is authenticated
  useEffect(() => {
    if (!isSupabaseConfigured || hasPulledRef.current) return;

    const pullFromCloud = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        const userId = session.user.id;

        // Pull tasks
        const { data: cloudTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId);

        if (cloudTasks && cloudTasks.length > 0) {
          const mapped = cloudTasks.map(t => ({
            id: t.id,
            title: t.title,
            details: t.details || '',
            listId: t.list_id || 'default',
            completed: t.completed,
            starred: t.starred,
            priority: t.priority || 'low',
            dueDate: t.due_date ? new Date(t.due_date) : null,
            subtasks: t.subtasks || [],
            recurrence: t.recurrence || 'none',
          }));
          setTasks(mapped);
        }

        // Pull habits
        const { data: cloudHabits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId);

        if (cloudHabits && cloudHabits.length > 0) {
          const mapped = cloudHabits.map(h => ({
            id: h.id,
            title: h.title,
            category: h.category || 'Personal',
            streak: h.streak || 0,
            bestStreak: h.best_streak || 0,
            consistency: h.consistency || [],
            todayDone: h.today_done || false,
            focusDuration: h.focus_duration || 25,
          }));
          setHabits(mapped);
        }

        hasPulledRef.current = true;
        console.log('[Sync] Initial pull complete');
      } catch (err) {
        console.warn('[Sync] Initial pull failed:', err);
      }
    };

    pullFromCloud();
  }, []);

  // Helper: push a change to Supabase in the background
  const syncToCloud = useCallback((table, action, data) => {
    if (!isSupabaseConfigured) return;
    syncEngine.enqueue({ table, action, data });
  }, []);

  // Computed accent colors for JS usage (charts, inline styles, etc.)
  const accentColor = useMemo(() => {
    const palette = COLOR_THEMES[colorTheme];
    if (!palette) return { color: '#22d3ee', soft: '#06b6d4', secondary: '#3b82f6', glow: 'rgba(34,211,238,0.15)' };
    const vars = theme === 'light' ? palette.light : palette.dark;
    return {
      color: vars['--accent-color'],
      soft: vars['--accent-soft'],
      secondary: vars['--accent-secondary'],
      glow: vars['--accent-glow'],
    };
  }, [colorTheme, theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    applyColorTheme(colorTheme, theme);
  }, [theme, colorTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeColorTheme = useCallback((id) => {
    if (COLOR_THEMES[id]) setColorTheme(id);
  }, []);

  const toggleNotifications = useCallback(() => setNotifications(prev => !prev), []);
  const toggleFocusSound = useCallback(() => setFocusSound(prev => !prev), []);

  // Notification functions
  const updateNotificationSettings = useCallback((updates) => {
    setNotificationSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    return nativeRequestPermission();
  }, []);

  // Helper: fire an immediate notification via native bridge or web API
  const fireNotification = useCallback(async (title, body, tag) => {
    try {
      if (isNative) {
        await scheduleNotification({
          id: Math.floor(Math.random() * 100000),
          title,
          body,
          at: new Date(),
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico', tag });
      }
    } catch (e) { console.warn('Notification error:', e); }
  }, []);

  // Notification check interval — checks every 30s if any task is due within reminder window
  // Also sends daily habit reminders, streak loss alerts, and overdue task alerts
  useEffect(() => {
    if (!notificationSettings.enabled) return;
    // Request permission on first enable (native or web)
    nativeRequestPermission();
    const checkNotifications = async () => {
      // On web, check permission; on native, permission was already requested
      if (!isNative && (!('Notification' in window) || Notification.permission !== 'granted')) return;
      const now = new Date();

      // Task reminder notifications
      if (notificationSettings.taskReminders) {
        const reminderMs = (notificationSettings.taskReminderMinutes || notificationSettings.reminderMinutes) * 60 * 1000;
        tasks.forEach(task => {
          if (!task.dueDate || task.completed) return;
          const dueTime = new Date(task.dueDate).getTime();
          const diff = dueTime - now.getTime();
          if (diff > 0 && diff <= reminderMs + 30000) {
            const notifKey = `mithra-notif-${task.id}-${format(new Date(task.dueDate), 'yyyy-MM-dd-HH-mm')}`;
            if (!sessionStorage.getItem(notifKey)) {
              const mins = notificationSettings.taskReminderMinutes || notificationSettings.reminderMinutes;
              const timeLabel = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)} hr` : '1 day';
              fireNotification('Mithra — Task Reminder', `"${task.title}" is due in ${timeLabel}`, notifKey);
              sessionStorage.setItem(notifKey, 'true');
            }
          }
        });
      }

      // Overdue task notifications
      if (notificationSettings.overdueTaskAlerts) {
        tasks.forEach(task => {
          if (!task.dueDate || task.completed) return;
          const dueTime = new Date(task.dueDate).getTime();
          const diff = dueTime - now.getTime();
          if (diff < 0 && diff > -86400000) {
            const overdueKey = `mithra-overdue-${task.id}-${format(now, 'yyyy-MM-dd')}`;
            if (!sessionStorage.getItem(overdueKey)) {
              fireNotification('Mithra — Overdue Task', `"${task.title}" is overdue! Time to get it done.`, overdueKey);
              sessionStorage.setItem(overdueKey, 'true');
            }
          }
        });
      }

      // Habit reminders — remind about incomplete habits in the evening (after 6pm)
      if (notificationSettings.habitReminders) {
        const hour = now.getHours();
        if (hour >= 18 && hour < 22) {
          const habitReminderKey = `mithra-habit-reminder-${format(now, 'yyyy-MM-dd')}`;
          if (!sessionStorage.getItem(habitReminderKey)) {
            const incompleteHabits = habits.filter(h => !h.todayDone);
            if (incompleteHabits.length > 0) {
              fireNotification('Mithra — Habit Reminder', `You have ${incompleteHabits.length} habit${incompleteHabits.length > 1 ? 's' : ''} left today: ${incompleteHabits.map(h => h.title).slice(0, 3).join(', ')}${incompleteHabits.length > 3 ? '...' : ''}`, habitReminderKey);
              sessionStorage.setItem(habitReminderKey, 'true');
            }
          }
        }
      }

      // Streak loss alerts — warn if a habit streak might be lost today
      if (notificationSettings.streakLossAlerts) {
        const hour = now.getHours();
        if (hour >= 20 && hour < 23) {
          const streakKey = `mithra-streak-alert-${format(now, 'yyyy-MM-dd')}`;
          if (!sessionStorage.getItem(streakKey)) {
            const atRisk = habits.filter(h => !h.todayDone && h.streak >= 3);
            if (atRisk.length > 0) {
              fireNotification('Mithra — Streak at Risk!', `Don't lose your streak! ${atRisk.map(h => `${h.title} (${h.streak} days)`).slice(0, 3).join(', ')}`, streakKey);
              sessionStorage.setItem(streakKey, 'true');
            }
          }
        }
      }

      // Calendar event reminders
      if (notificationSettings.eventReminders) {
        try {
          const savedEvents = JSON.parse(localStorage.getItem(getUserScopedKey('calendar-events')) || '[]');
          const eventReminderMs = (notificationSettings.eventReminderMinutes || 15) * 60 * 1000;
          savedEvents.forEach(evt => {
            if (!evt.start) return;
            const startTime = new Date(evt.start).getTime();
            const diff = startTime - now.getTime();
            if (diff > 0 && diff <= eventReminderMs + 30000) {
              const evtKey = `mithra-evt-notif-${evt.id}-${format(new Date(evt.start), 'yyyy-MM-dd-HH-mm')}`;
              if (!sessionStorage.getItem(evtKey)) {
                const mins = notificationSettings.eventReminderMinutes || 15;
                const timeLabel = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)} hr` : '1 day';
                fireNotification('Mithra — Event Starting Soon', `"${evt.title}" starts in ${timeLabel}${evt.location ? ` at ${evt.location}` : ''}`, evtKey);
                sessionStorage.setItem(evtKey, 'true');
              }
            }
          });
        } catch (e) { console.warn('Event notification error:', e); }
      }
    };
    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();
    return () => clearInterval(interval);
  }, [notificationSettings, tasks, habits, fireNotification]);

  /* ── Task CRUD (with cloud sync) ── */
  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, task]);
    syncToCloud('tasks', 'upsert', {
      id: task.id,
      title: task.title,
      details: task.details || '',
      list_id: task.listId || 'default',
      completed: task.completed || false,
      starred: task.starred || false,
      priority: task.priority || 'low',
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      subtasks: task.subtasks || [],
      recurrence: task.recurrence || 'none',
    });
  }, [syncToCloud]);

  const updateTask = useCallback((updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    syncToCloud('tasks', 'upsert', {
      id: updated.id,
      title: updated.title,
      details: updated.details || '',
      list_id: updated.listId || 'default',
      completed: updated.completed || false,
      starred: updated.starred || false,
      priority: updated.priority || 'low',
      due_date: updated.dueDate ? new Date(updated.dueDate).toISOString() : null,
      subtasks: updated.subtasks || [],
      recurrence: updated.recurrence || 'none',
    });
  }, [syncToCloud]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    syncToCloud('tasks', 'delete', { id });
  }, [syncToCloud]);
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const willComplete = !t.completed;
      // If completing a recurring task, auto-create next occurrence
      if (willComplete && t.recurrence && t.recurrence !== 'none' && t.dueDate) {
        const due = new Date(t.dueDate);
        let nextDate;
        switch (t.recurrence) {
          case 'daily': nextDate = addDays(due, 1); break;
          case 'weekly': nextDate = addDays(due, 7); break;
          case 'monthly': nextDate = new Date(due.getFullYear(), due.getMonth() + 1, due.getDate()); break;
          default: nextDate = null;
        }
        if (nextDate) {
          setTimeout(() => {
            setTasks(p => [...p, {
              ...t,
              id: `${t.id}-${Date.now()}`,
              completed: false,
              dueDate: nextDate,
            }]);
          }, 0);
        }
      }
      return { ...t, completed: willComplete };
    }));
  }, []);
  const starTask = useCallback((id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t)), []);

  /* ── Habit CRUD (with cloud sync) ── */
  const addHabit = useCallback((habit) => {
    setHabits(prev => [...prev, habit]);
    syncToCloud('habits', 'upsert', {
      id: habit.id,
      title: habit.title,
      category: habit.category || 'Personal',
      streak: habit.streak || 0,
      best_streak: habit.bestStreak || 0,
      consistency: habit.consistency || [],
      today_done: habit.todayDone || false,
      focus_duration: habit.focusDuration || 25,
    });
  }, [syncToCloud]);

  const updateHabit = useCallback((updated) => {
    setHabits(prev => prev.map(h => h.id === updated.id ? updated : h));
    syncToCloud('habits', 'upsert', {
      id: updated.id,
      title: updated.title,
      category: updated.category || 'Personal',
      streak: updated.streak || 0,
      best_streak: updated.bestStreak || 0,
      consistency: updated.consistency || [],
      today_done: updated.todayDone || false,
      focus_duration: updated.focusDuration || 25,
    });
  }, [syncToCloud]);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    syncToCloud('habits', 'delete', { id });
  }, [syncToCloud]);

  // Streak milestones
  const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 100, 180, 365];
  const [lastMilestone, setLastMilestone] = useState(null);

  const toggleHabit = useCallback((id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const willBeDone = !h.todayDone;
      const newStreak = willBeDone ? h.streak + 1 : Math.max(0, h.streak - 1);
      const updated = {
        ...h,
        todayDone: willBeDone,
        streak: newStreak,
        bestStreak: Math.max(h.bestStreak || 0, newStreak),
        consistency: willBeDone
          ? [...h.consistency, format(new Date(), 'yyyy-MM-dd')]
          : h.consistency.filter(d => d !== format(new Date(), 'yyyy-MM-dd')),
      };

      // Check for streak milestones
      if (willBeDone && STREAK_MILESTONES.includes(newStreak)) {
        setLastMilestone({ habit: updated.title, streak: newStreak, color: updated.color });
        setTimeout(() => setLastMilestone(null), 5000);
      }

      // Sync the toggled habit to cloud
      syncToCloud('habits', 'upsert', {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        streak: updated.streak,
        best_streak: updated.bestStreak,
        consistency: updated.consistency,
        today_done: updated.todayDone,
        focus_duration: updated.focusDuration,
      });
      return updated;
    }));
  }, [syncToCloud]);

  /* ── Generate calendar events from tasks ── */
  const taskCalendarEvents = useMemo(() => {
    if (!syncSettings.syncTasksToCalendar) return [];
    return tasks
      .filter(t => t.dueDate && !t.completed)
      .map(t => ({
        id: `task-${t.id}`,
        title: `📋 ${t.title}`,
        start: setMinutes(setHours(startOfDay(t.dueDate), 8), 0),
        end: setMinutes(setHours(startOfDay(t.dueDate), 8), 30),
        category: t.listId === 'work' ? 'Work' : 'Personal',
        location: '',
        description: t.details || '',
        isTask: true,
        priority: t.priority,
      }));
  }, [tasks, syncSettings.syncTasksToCalendar]);

  /* ── Generate calendar events from habits (today only) ── */
  const habitCalendarEvents = useMemo(() => {
    if (!syncSettings.syncHabitsToCalendar) return [];
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0=Sun, 1=Mon...
    let slotHour = 7; // Fallback start hour if no scheduleTime

    return habits
      .filter(h => {
        // Only show habits scheduled for today (based on repeatDays)
        if (h.repeatDays && h.repeatDays.length > 0) {
          return h.repeatDays.includes(dayOfWeek);
        }
        return true; // If no repeat days set, show every day
      })
      .map(h => {
        let startHour, startMin;
        if (h.scheduleTime) {
          const [sh, sm] = h.scheduleTime.split(':').map(Number);
          startHour = sh;
          startMin = sm || 0;
        } else {
          startHour = slotHour;
          startMin = 0;
          slotHour += 1;
        }

        const evt = {
          id: `habit-${h.id}`,
          title: `${h.todayDone ? '✅' : '🔄'} ${h.title}`,
          start: setMinutes(setHours(startOfDay(todayDate), startHour), startMin),
          end: setMinutes(setHours(startOfDay(todayDate), startHour), startMin + (h.focusDuration || 25)),
          category: HABIT_CATEGORY_MAP[h.category] || 'Focus',
          location: '',
          description: `Streak: ${h.streak} days | Duration: ${h.focusDuration || 25}m`,
          isHabit: true,
          todayDone: h.todayDone,
          habitColor: h.color,
        };
        return evt;
      });
  }, [habits, syncSettings.syncHabitsToCalendar]);

  /* ── Sync toggles ── */
  const toggleSyncTasks = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncTasksToCalendar: !prev.syncTasksToCalendar }));
  }, []);
  const toggleSyncHabits = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncHabitsToCalendar: !prev.syncHabitsToCalendar }));
  }, []);
  const toggleSyncFocus = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncFocusToTracker: !prev.syncFocusToTracker }));
  }, []);
  const toggleSyncGoogleCalendar = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncGoogleCalendar: !prev.syncGoogleCalendar }));
  }, []);

  /* ── Export ALL data ── */
  const exportData = useCallback(() => {
    // Gather all user data from localStorage
    let events = [], journal = [], moodHistory = [], focusSessions = [];
    try { events = JSON.parse(localStorage.getItem(getUserScopedKey('calendar-events')) || '[]'); } catch { }
    try { journal = JSON.parse(localStorage.getItem(getUserScopedKey('journal')) || '[]'); } catch { }
    try { moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]'); } catch { }
    try { focusSessions = JSON.parse(localStorage.getItem(getUserScopedKey('focus-sessions')) || '[]'); } catch { }

    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      habits,
      events,
      journal,
      moodHistory,
      focusSessions,
      syncSettings,
      notificationSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mithra-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks, habits, syncSettings, notificationSettings]);

  const value = useMemo(() => ({
    // Tasks
    tasks, taskLists, addTask, updateTask, deleteTask, toggleTask, starTask,
    // Habits
    habits, addHabit, updateHabit, deleteHabit, toggleHabit, setHabits, lastMilestone,
    // Calendar sync events
    taskCalendarEvents, habitCalendarEvents,
    // Theme
    theme, toggleTheme,
    colorTheme, changeColorTheme, COLOR_THEMES,
    accentColor,
    // Preferences
    notifications, toggleNotifications,
    focusSound, toggleFocusSound,
    // Notifications
    notificationSettings, updateNotificationSettings, requestNotificationPermission, REMINDER_OPTIONS,
    // Settings
    syncSettings, toggleSyncTasks, toggleSyncHabits, toggleSyncFocus, toggleSyncGoogleCalendar,
    googleEvents,
    // Export
    exportData,
  }), [tasks, taskLists, habits, taskCalendarEvents, habitCalendarEvents, syncSettings,
    theme, colorTheme, accentColor, notifications, focusSound, notificationSettings, googleEvents,
    addTask, updateTask, deleteTask, toggleTask, starTask,
    addHabit, updateHabit, deleteHabit, toggleHabit,
    toggleTheme, changeColorTheme, toggleNotifications, toggleFocusSound,
    updateNotificationSettings, requestNotificationPermission,
    toggleSyncTasks, toggleSyncHabits, toggleSyncFocus, toggleSyncGoogleCalendar, exportData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

```

## File: client/src/components/ClockPicker.jsx

```
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { useData } from '../context/DataContext';

/* ═══════════════════════════════════════════════════════════════
   MATERIAL DESIGN CLOCK PICKER — Themed & Beautiful
   Circular time picker matching the app's glassmorphism aesthetic
   ═══════════════════════════════════════════════════════════════ */

const ClockPicker = ({ value, onChange, label }) => {
  const { theme, accentColor } = useData();
  const isLight = theme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('hour'); // 'hour' | 'minute'
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');

  // Parse initial value (HH:mm format)
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setHour(h > 12 ? h - 12 : h === 0 ? 12 : h);
        setMinute(m);
        setPeriod(h >= 12 ? 'PM' : 'AM');
      }
    }
  }, [value]);

  const handleConfirm = useCallback(() => {
    let h24 = hour;
    if (period === 'PM' && hour !== 12) h24 += 12;
    if (period === 'AM' && hour === 12) h24 = 0;
    const timeStr = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onChange(timeStr);
    setIsOpen(false);
  }, [hour, minute, period, onChange]);

  const handleNumberClick = useCallback((num) => {
    if (mode === 'hour') {
      setHour(num);
      setTimeout(() => setMode('minute'), 400);
    } else {
      setMinute(num);
    }
  }, [mode]);

  // Clock face numbers
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const numbers = mode === 'hour' ? hourNumbers : minuteNumbers;
  const selectedValue = mode === 'hour' ? hour : minute;

  // Circle geometry
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 95;
  const dotRadius = 18;

  // Calculate positions (12 numbers evenly spaced, starting at top)
  const getPosition = (index) => {
    const angle = ((index * 30) - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Selected number position for the hand line
  const selectedIdx = numbers.indexOf(selectedValue);
  const selectedPos = selectedIdx >= 0 ? getPosition(selectedIdx) : null;

  // Display value
  const displayHour = String(hour).padStart(2, '0');
  const displayMinute = String(minute).padStart(2, '0');

  // Formatted display for the button
  const displayTime = value
    ? (() => {
        const [h, m] = value.split(':').map(Number);
        const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ap = h >= 12 ? 'PM' : 'AM';
        return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
      })()
    : 'Set time';

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setIsOpen(true); setMode('hour'); }}
        className="glass-input !py-2.5 !text-sm w-full flex items-center gap-2 cursor-pointer text-left"
      >
        <Clock size={14} style={{ color: 'var(--accent-color)', opacity: 0.7 }} />
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-dim)' }}>
          {displayTime}
        </span>
      </button>

      {/* Clock Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{
                width: 320,
                background: isLight
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,240,235,0.98) 100%)'
                  : 'linear-gradient(180deg, rgba(20,18,18,0.98) 0%, rgba(12,10,10,0.99) 100%)',
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Header: "Select time" */}
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--text-dim)' }}>
                  Select time
                </p>
              </div>

              {/* Time Display */}
              <div className="px-6 pb-4 flex items-center gap-1">
                {/* Hour box */}
                <button
                  onClick={() => setMode('hour')}
                  className="rounded-xl px-4 py-3 text-4xl font-bold transition-all"
                  style={{
                    background: mode === 'hour' ? accentColor.color : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                    color: mode === 'hour' ? '#fff' : 'var(--text-primary)',
                    minWidth: 72,
                  }}
                >
                  {displayHour}
                </button>

                <span className="text-4xl font-light mx-1" style={{ color: 'var(--text-dim)' }}>:</span>

                {/* Minute box */}
                <button
                  onClick={() => setMode('minute')}
                  className="rounded-xl px-4 py-3 text-4xl font-bold transition-all"
                  style={{
                    background: mode === 'minute' ? accentColor.color : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                    color: mode === 'minute' ? '#fff' : 'var(--text-primary)',
                    minWidth: 72,
                  }}
                >
                  {displayMinute}
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* AM/PM Toggle */}
                <div className="flex flex-col rounded-xl overflow-hidden border"
                  style={{ borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }}>
                  <button
                    onClick={() => setPeriod('AM')}
                    className="px-3 py-1.5 text-sm font-bold transition-all"
                    style={{
                      background: period === 'AM' ? accentColor.color : 'transparent',
                      color: period === 'AM' ? '#fff' : 'var(--text-dim)',
                    }}
                  >
                    AM
                  </button>
                  <div style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }} />
                  <button
                    onClick={() => setPeriod('PM')}
                    className="px-3 py-1.5 text-sm font-bold transition-all"
                    style={{
                      background: period === 'PM' ? accentColor.color : 'transparent',
                      color: period === 'PM' ? '#fff' : 'var(--text-dim)',
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Clock Face */}
              <div className="flex items-center justify-center py-4 px-6">
                <div
                  className="relative rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Center dot */}
                  <div
                    className="absolute rounded-full z-10"
                    style={{
                      width: 8,
                      height: 8,
                      top: cy - 4,
                      left: cx - 4,
                      background: accentColor.color,
                    }}
                  />

                  {/* Hand line to selected number */}
                  {selectedPos && (
                    <svg
                      className="absolute inset-0 z-0"
                      width={size}
                      height={size}
                    >
                      <line
                        x1={cx}
                        y1={cy}
                        x2={selectedPos.x}
                        y2={selectedPos.y}
                        stroke={accentColor.color}
                        strokeWidth={2}
                      />
                    </svg>
                  )}

                  {/* Number dots */}
                  {numbers.map((num, i) => {
                    const pos = getPosition(i);
                    const isSelected = num === selectedValue;
                    const displayNum = mode === 'minute' ? String(num).padStart(2, '0') : num;

                    return (
                      <motion.button
                        key={`${mode}-${num}`}
                        onClick={() => handleNumberClick(num)}
                        className="absolute rounded-full flex items-center justify-center z-20 transition-colors"
                        style={{
                          width: dotRadius * 2,
                          height: dotRadius * 2,
                          left: pos.x - dotRadius,
                          top: pos.y - dotRadius,
                          background: isSelected ? accentColor.color : 'transparent',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          fontSize: 14,
                          fontWeight: isSelected ? 700 : 400,
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {displayNum}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer: Cancel + OK */}
              <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: accentColor.color }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                  style={{ color: accentColor.color }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClockPicker;

```

## File: client/src/components/Layout.jsx

```
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Layout as LayoutIcon, MessageSquare, Calendar as CalendarIcon,
    CheckSquare, BookOpen, Settings, User, Activity, Bot, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { hapticLight } from '../native';
import NetworkStatus from './NetworkStatus';
import SyncStatus from './SyncStatus';

const luxuryEase = [0.22, 1, 0.36, 1];

/* Sidebar profile helpers */
const ProfileAvatar = ({ size = 'w-9 h-9' }) => {
    const { profile } = useAuth();
    const { theme } = useData();
    const isLight = theme === 'light';
    const getInitials = () => {
        const name = profile?.fullName || profile?.email || 'U';
        const parts = name.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };
    if (profile?.avatarUrl) {
        return <img src={profile.avatarUrl} alt="" className={`${size} rounded-full object-cover ring-1`} style={{ ringColor: isLight ? 'var(--accent-color)' : 'rgba(242,235,227,0.1)' }} />;
    }
    return (
        <div className={`${size} rounded-full flex items-center justify-center text-xs font-bold ring-1`}
            style={{
                background: `linear-gradient(135deg, var(--accent-color), var(--accent-soft))`,
                color: 'white',
                ringColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.1)',
            }}>
            {getInitials()}
        </div>
    );
};

const ProfileName = () => {
    const { profile } = useAuth();
    const name = profile?.fullName || profile?.email || 'User';
    if (name.length > 16) return name.substring(0, 15) + '…';
    return name;
};

/* ═══ NAV ITEMS ═══ */
const navItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutIcon },
    { path: '/habits', label: 'Habits', icon: Activity },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/dost', label: 'Dost Mode', icon: MessageSquare },
];

/* Bottom bar items (subset for mobile) — Settings moved to top-right */
const bottomNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutIcon },
    { path: '/habits', label: 'Habits', icon: Activity },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/dost', label: 'Dost', icon: MessageSquare },
];

/* ═══════════════════════════════════════════════════════════════
   DESKTOP SIDEBAR — Hidden on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   DESKTOP SIDEBAR — Hidden on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
const DesktopSidebar = () => {
    const location = useLocation();

    return (
        <aside className="hidden md:flex w-20 lg:w-64 h-screen fixed left-0 top-0 z-30 flex-col transition-all duration-400"
            style={{
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                borderRight: 'none'
            }}>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-7">
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-glow)] border border-[var(--accent-glow)] shadow-[0_0_15px_var(--accent-glow)]">
                    <Bot className="w-5 h-5 text-[var(--accent-color)]" />
                    <div className="absolute inset-0 rounded-xl border border-[var(--accent-glow)] animate-pulse opacity-50" />
                </div>
                <div className="hidden lg:block ml-3">
                    <h1 className="font-sans font-bold text-lg tracking-wide text-[var(--text-primary)]">Mithra</h1>
                    <p className="text-[10px] font-medium -mt-0.5 tracking-widest uppercase text-[var(--accent-color)] opacity-60">Life OS</p>
                </div>
            </div>

            <nav className="flex-1 py-5 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink key={item.path} to={item.path}
                            className="relative flex items-center p-3 rounded-xl transition-all duration-200 group">
                            {isActive && (<motion.div layoutId="sidebar-tab-pill" className="absolute inset-0 rounded-xl bg-[var(--accent-glow)] border border-[var(--glass-border)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />)}
                            {isActive && (<motion.div layoutId="sidebar-active-bar" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />)}
                            <item.icon size={20} className={`relative z-10 transition-all duration-300 ${isActive ? 'text-[var(--accent-color)] drop-shadow-[0_0_8px_var(--accent-glow)]' : 'text-[var(--text-dim)] group-hover:text-[var(--text-primary)]'}`} />
                            <span className={`hidden lg:block ml-4 text-sm relative z-10 transition-all duration-300 ${isActive ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-dim)] group-hover:text-[var(--text-primary)]'}`}>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-3 space-y-1">
                <NavLink to="/settings" className="relative flex items-center p-3 rounded-xl transition-all duration-200 group">
                    <Settings size={20} className="relative z-10 transition-all duration-300 text-[var(--text-dim)] group-hover:text-[var(--text-primary)]" />
                    <span className="hidden lg:block ml-4 text-sm relative z-10 transition-all duration-300 font-medium text-[var(--text-dim)] group-hover:text-[var(--text-primary)]">Settings</span>
                </NavLink>

                <NavLink to="/settings" className="flex items-center p-3 rounded-xl cursor-pointer group hover:bg-[var(--glass-bg-hover)] border border-transparent hover:border-[var(--glass-border)] transition-all">
                    <ProfileAvatar />
                    <div className="hidden lg:block ml-3">
                        <div className="text-sm font-medium transition-colors text-[var(--text-primary)] group-hover:text-[var(--accent-color)]"><ProfileName /></div>
                        <div className="text-[10px] font-medium text-[var(--text-dim)]">Pro Workspace</div>
                    </div>
                </NavLink>
                <div className="hidden lg:flex justify-center pt-1">
                    <SyncStatus />
                </div>
            </div>
        </aside>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE TOP BAR — Visible only on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   MOBILE TOP BAR — Visible only on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
const MobileTopBar = () => {
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const currentPage = [...navItems, { path: '/settings', label: 'Settings' }].find(i => i.path === location.pathname)?.label || 'Mithra';

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
                style={{
                    paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
                    height: 'calc(56px + env(safe-area-inset-top, 0px))',
                    background: 'var(--nav-bg)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: 'none'
                }}>
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent-glow)] border border-[var(--accent-glow)]">
                        <Bot className="w-4 h-4 text-[var(--accent-color)]" />
                    </div>
                    <h1 className="font-bold text-sm tracking-wide text-[var(--text-primary)]">{currentPage}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <NavLink to="/settings" onClick={() => hapticLight()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-dim)]">
                        <Settings size={18} />
                    </NavLink>
                    <button onClick={() => { setDrawerOpen(!drawerOpen); hapticLight(); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        {drawerOpen ? <X size={18} className="text-[var(--text-primary)]" /> : <Menu size={18} className="text-[var(--text-dim)]" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {drawerOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-50" onClick={() => setDrawerOpen(false)}>
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            className="absolute right-0 top-0 bottom-0 w-72 p-6 pt-20 space-y-2"
                            style={{
                                background: 'var(--body-bg)',
                                borderLeft: 'none'
                            }}
                            onClick={e => e.stopPropagation()}>
                            {navItems.map(item => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink key={item.path} to={item.path}
                                        onClick={() => { setDrawerOpen(false); hapticLight(); }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-[var(--accent-glow)] border border-[var(--accent-glow)]' : 'hover:bg-[var(--glass-bg-hover)] border border-transparent'}`}>
                                        <item.icon size={20} className={isActive ? 'text-[var(--accent-color)]' : 'text-[var(--text-dim)]'} />
                                        <span className="text-sm font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-dim)' }}>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                            <div className="pt-4">
                                <NavLink to="/settings" onClick={() => setDrawerOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-bg-hover)]">
                                    <ProfileAvatar size="w-8 h-8" />
                                    <div>
                                        <div className="text-sm font-medium text-[var(--text-primary)]"><ProfileName /></div>
                                        <div className="text-[10px] text-[var(--text-dim)]">Settings & Profile</div>
                                    </div>
                                </NavLink>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV — Android-style bottom navigation
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV — Android-style bottom navigation
   ═══════════════════════════════════════════════════════════════ */
const MobileBottomNav = () => {
    const location = useLocation();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
            style={{
                paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)',
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                borderTop: 'none'
            }}>
            <div className="flex items-center justify-around px-2 py-1">
                {bottomNavItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink key={item.path} to={item.path} onClick={() => hapticLight()}
                            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl relative transition-all min-w-[56px]">
                            {isActive && (
                                <motion.div layoutId="bottom-nav-pill"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                            )}
                            <item.icon size={20} className="transition-all" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-dim)' }} />
                            <span className="text-[11px] font-semibold transition-all" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-dim)' }}>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

/* ═══════════════════════════════════════════════════════════════
   LAYOUT — Responsive: Sidebar on desktop, Bottom bar on mobile
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   LAYOUT — Responsive: Sidebar on desktop, Bottom bar on mobile
   ═══════════════════════════════════════════════════════════════ */
export const Layout = ({ children }) => {
    const { theme } = useData();
    const isLight = theme === 'light';

    return (
        <div className="min-h-screen font-sans transition-all duration-400 text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]" style={{ backgroundColor: 'var(--body-bg)' }}>
            <NetworkStatus />
            <DesktopSidebar />
            <MobileTopBar />
            <main className="md:ml-20 lg:ml-64 min-h-screen relative overflow-x-hidden pt-14 md:pt-0 pb-20 md:pb-0">
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    {/* Theme-aware Ambient Glows */}
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-40 animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-30" />
                    <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[800px] h-[400px] bg-[var(--visor-glow)] rounded-full blur-[150px] opacity-20" />
                </div>
                <div className="relative z-10">
                    {children}
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
};

```

## File: client/src/components/SearchDialog.jsx

```
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckSquare, Calendar, BookOpen, Activity, Settings, Layout as LayoutIcon, MessageSquare, ArrowRight, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData, getUserScopedKey } from '../context/DataContext';

const PAGE_RESULTS = [
  { type: 'page', title: 'Home', path: '/', icon: LayoutIcon },
  { type: 'page', title: 'Tasks', path: '/tasks', icon: CheckSquare },
  { type: 'page', title: 'Calendar', path: '/calendar', icon: Calendar },
  { type: 'page', title: 'Habits & Focus', path: '/habits', icon: Activity },
  { type: 'page', title: 'Journal', path: '/journal', icon: BookOpen },
  { type: 'page', title: 'Dost Mode (AI Chat)', path: '/dost', icon: MessageSquare },
  { type: 'page', title: 'Settings', path: '/settings', icon: Settings },
];

export default function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { tasks, habits } = useData();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape only — Cmd+K toggle is handled by parent GlobalSearch
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return PAGE_RESULTS.slice(0, 7);

    const matched = [];

    // Search pages
    PAGE_RESULTS.forEach(p => {
      if (p.title.toLowerCase().includes(q)) matched.push(p);
    });

    // Search tasks
    if (tasks) {
      tasks.forEach(t => {
        if ((t.title || '').toLowerCase().includes(q) || (t.details && t.details.toLowerCase().includes(q))) {
          matched.push({ type: 'task', title: t.title, subtitle: t.completed ? 'Completed' : (t.priority || 'medium'), path: '/tasks', icon: CheckSquare, id: t.id });
        }
      });
    }

    // Search habits
    if (habits) {
      habits.forEach(h => {
        if ((h.title || '').toLowerCase().includes(q) || (h.category && h.category.toLowerCase().includes(q))) {
          matched.push({ type: 'habit', title: h.title, subtitle: `${h.streak} day streak`, path: '/habits', icon: Activity, id: h.id });
        }
      });
    }

    // Search journal entries
    try {
      const journal = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]');
      journal.forEach(entry => {
        const text = `${entry.title || ''} ${entry.body || ''} ${entry.content || ''}`.toLowerCase();
        if (text.includes(q)) {
          matched.push({ type: 'journal', title: entry.title || 'Journal entry', subtitle: entry.date, path: '/journal', icon: BookOpen });
        }
      });
    } catch { }

    return matched.slice(0, 12);
  }, [query, tasks, habits]);

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(0); }, [results]);

  const handleSelect = useCallback((item) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9997] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-xl p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl overflow-hidden glass-heavy shadow-2xl"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <Search size={20} className="text-[var(--text-dim)] flex-shrink-0 opacity-40" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, habits, pages..."
              className="flex-1 bg-transparent text-[var(--text-primary)] text-sm outline-none placeholder:text-[var(--text-dim)]/30"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium text-[var(--text-dim)]/30 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-dim)] text-sm opacity-40">
                No results found for "{query}"
              </div>
            ) : (
              results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.title}-${i}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all ${i === selectedIndex ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: i === selectedIndex ? 'var(--accent-glow)' : 'var(--glass-bg)' }}>
                      <Icon size={16} className={i === selectedIndex ? 'text-[var(--accent-color)]' : 'text-[var(--text-dim)] opacity-40'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] opacity-80 truncate">{item.title}</div>
                      {item.subtitle && <div className="text-xs text-[var(--text-dim)] opacity-30 truncate">{item.subtitle}</div>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] opacity-25 flex-shrink-0">{item.type}</span>
                    {i === selectedIndex && <ArrowRight size={14} className="text-[var(--accent-color)] flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t text-[10px] text-[var(--text-dim)] opacity-25" style={{ borderColor: 'var(--glass-border)' }}>
            <span>Navigate with ↑↓ &middot; Select with ↵</span>
            <span className="flex items-center gap-1">
              <Command size={10} />K to toggle
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

```

## File: client/src/components/ErrorBoundary.jsx

```
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary, #050505)' }}>
          <div className="max-w-md w-full text-center space-y-6 glass-card rounded-3xl p-10">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={32} className="text-[var(--accent-color)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Something went wrong</h2>
              <p className="text-[var(--text-dim)] text-sm leading-relaxed opacity-50">
                An unexpected error occurred. Your data is safe — try refreshing the app.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-xs text-red-400/60 bg-red-500/5 rounded-xl p-3 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--accent-color, #C2185B)', color: 'white' }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium glass-card text-[var(--text-dim)] hover:text-[var(--text-primary)] opacity-70 hover:opacity-100 transition-all"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

```

## File: client/src/components/Skeleton.jsx

```
import React from 'react';

/**
 * Skeleton loading placeholder components.
 * Usage: <SkeletonCard />, <SkeletonLine />, <SkeletonList count={5} />
 */

const shimmer = {
  background: 'linear-gradient(90deg, rgba(var(--color-merino), 0.03) 25%, rgba(var(--color-merino), 0.08) 50%, rgba(var(--color-merino), 0.03) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

export function SkeletonLine({ width = '100%', height = '12px', className = '' }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{ width, height, ...shimmer }}
    />
  );
}

export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <div
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size, ...shimmer }}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl p-5 glass-card space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonCircle size={36} />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" height="14px" />
          <SkeletonLine width="40%" height="10px" />
        </div>
      </div>
      <SkeletonLine height="10px" />
      <SkeletonLine width="80%" height="10px" />
    </div>
  );
}

export function SkeletonList({ count = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <SkeletonCircle size={20} />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine width={`${60 + Math.random() * 30}%`} height="12px" />
            <SkeletonLine width={`${30 + Math.random() * 20}%`} height="9px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8 animate-pulse">
      {/* Hero card */}
      <div className="rounded-3xl p-8 md:p-10 glass-card space-y-4">
        <SkeletonLine width="120px" height="12px" />
        <SkeletonLine width="280px" height="32px" />
        <SkeletonLine width="200px" height="14px" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl p-5 glass-card space-y-3">
            <SkeletonCircle size={36} />
            <SkeletonLine width="60px" height="24px" />
            <SkeletonLine width="80px" height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

```

## File: client/src/components/EmptyState.jsx

```
import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component for lists.
 * Usage: <EmptyState icon={ListTodo} title="No tasks yet" action={{ label: 'Add Task', onClick: fn }} />
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,  // { label: string, onClick: fn }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(var(--color-visor, 194 24 91), 0.06)', border: '1px solid rgba(var(--color-visor, 194 24 91), 0.1)' }}
      >
        <Icon size={28} className="text-accent-visor opacity-50" />
      </div>
      <h3 className="text-[var(--text-primary)] text-base font-semibold mb-1 opacity-70">{title}</h3>
      {description && (
        <p className="text-[var(--text-dim)] text-sm max-w-xs leading-relaxed opacity-40">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--accent-color)', color: 'white' }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

```

## File: client/src/components/NetworkStatus.jsx

```
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   NETWORK STATUS — Banner that shows when offline/back online
   ═══════════════════════════════════════════════════════════════ */
export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  const [justCameBack, setJustCameBack] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
      setJustCameBack(false);
    };

    const goOnline = () => {
      setIsOffline(false);
      setJustCameBack(true);
      // Show "back online" for 3s then hide
      setTimeout(() => {
        setShowBanner(false);
        setJustCameBack(false);
      }, 3000);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[9999] py-2 px-4 text-center text-sm font-medium
            ${isOffline ? 'bg-amber-500 text-black' : 'bg-green-500 text-white'}`}
        >
          {isOffline ? (
            <span className="flex items-center justify-center gap-2">
              <WifiOff size={16} />
              You're offline — changes will sync when you reconnect
            </span>
          ) : (
            <span>✓ Back online — syncing your data</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

## File: client/src/components/SyncStatus.jsx

```
import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { syncEngine } from '../services/syncEngine';

/* ═══════════════════════════════════════════════════════════════
   SYNC STATUS — Shows cloud sync state in the sidebar/UI
   ═══════════════════════════════════════════════════════════════ */
export default function SyncStatus() {
  const [status, setStatus] = useState('idle'); // idle | syncing | synced | offline | error | partial
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((event) => {
      setStatus(event);
      setPendingCount(syncEngine.getPendingCount());

      // Auto-reset "synced" back to idle after 3s
      if (event === 'synced') {
        setTimeout(() => setStatus('idle'), 3000);
      }
      if (event === 'partial') {
        setTimeout(() => setStatus('idle'), 5000);
      }
    });

    // Initial state
    setPendingCount(syncEngine.getPendingCount());
    if (!navigator.onLine) setStatus('offline');

    return unsubscribe;
  }, []);

  // Don't show anything if Supabase isn't configured
  if (!syncEngine.isConfigured) return null;

  const config = {
    idle: {
      icon: <Cloud size={13} />,
      label: pendingCount > 0 ? `${pendingCount} pending` : 'Synced',
      className: 'text-white/40',
    },
    syncing: {
      icon: <RefreshCw size={13} className="animate-spin" />,
      label: 'Syncing…',
      className: 'text-cyan-400',
    },
    synced: {
      icon: <Check size={13} />,
      label: 'All synced',
      className: 'text-green-400',
    },
    offline: {
      icon: <CloudOff size={13} />,
      label: 'Offline',
      className: 'text-amber-400',
    },
    error: {
      icon: <AlertCircle size={13} />,
      label: 'Sync failed',
      className: 'text-red-400',
    },
    partial: {
      icon: <AlertCircle size={13} />,
      label: 'Partial sync',
      className: 'text-amber-400',
    },
  };

  const c = config[status] || config.idle;

  return (
    <button
      onClick={() => status !== 'syncing' && syncEngine.processQueue()}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium
        bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${c.className}`}
      title={`Click to sync • ${syncEngine.getLastSyncTime()?.toLocaleTimeString() || 'Never synced'}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </button>
  );
}

```

## File: client/src/components/Toast.jsx

```
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, Undo2 } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: '#22c55e' },
  error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: '#ef4444' },
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: '#3b82f6' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b' },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000, undoAction = null }) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-4), { id, message, type, undoAction }]);
    timers.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const handleUndo = useCallback((toast) => {
    if (toast.undoAction) toast.undoAction();
    removeToast(toast.id);
  }, [removeToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => {
            const Icon = ICONS[toast.type] || Info;
            const color = COLORS[toast.type] || COLORS.info;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                }}
              >
                <Icon size={18} style={{ color: color.icon }} className="flex-shrink-0" />
                <span className="text-sm text-[var(--text-primary)] flex-1 opacity-90">{toast.message}</span>
                {toast.undoAction && (
                  <button
                    onClick={() => handleUndo(toast)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{ color: color.icon, background: `${color.icon}15` }}
                  >
                    <Undo2 size={12} /> Undo
                  </button>
                )}
                <button onClick={() => removeToast(toast.id)} className="p-1 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)] opacity-40 hover:opacity-70 transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

```

## File: client/src/components/ConfirmDialog.jsx

```
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable confirmation dialog for destructive actions
 * Usage: <ConfirmDialog open={bool} onConfirm={fn} onCancel={fn} title="..." message="..." />
 */
export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
}) {
  const colors = {
    danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)', btn: '#ef4444', icon: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', btn: '#f59e0b', icon: '#f59e0b' },
    info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', btn: 'var(--accent-color)', icon: 'var(--accent-color)' },
  };
  const c = colors[variant] || colors.danger;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl overflow-hidden glass-heavy"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <AlertTriangle size={20} style={{ color: c.icon }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[var(--text-primary)] text-base font-semibold">{title}</h3>
                  <p className="text-[var(--text-dim)] text-sm mt-1 leading-relaxed opacity-50">{message}</p>
                </div>
                <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)] opacity-40 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl text-sm font-medium glass-card text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: c.btn }}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

## File: client/src/pages/Onboarding.jsx

```
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle2, Activity, Calendar, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';

const luxuryEase = [0.22, 1, 0.36, 1];

/* ═══════════ ONBOARDING SLIDES — Clean & Minimal ═══════════ */
const SLIDES = [
  {
    icon: Bot,
    title: 'Welcome to Mithra',
    subtitle: 'Your intelligent Life OS',
    description: 'Organize tasks, build habits, focus deeply, and reflect — all in one beautiful app.',
    color: 'var(--accent-color)',
  },
  {
    icon: CheckCircle2,
    title: 'Smart Task Management',
    subtitle: 'Never miss a deadline',
    description: 'Create tasks with priorities, due dates, and recurring schedules. Get notified before anything slips.',
    color: '#3b82f6',
  },
  {
    icon: Activity,
    title: 'Habit & Focus Tracking',
    subtitle: 'Build consistency',
    description: 'Track daily habits with streak counters, and use the Pomodoro timer to maintain deep focus.',
    color: '#f97316',
  },
  {
    icon: Calendar,
    title: 'Calendar & Journal',
    subtitle: 'Plan and reflect',
    description: 'Visualize your schedule, sync tasks to your calendar, and journal your thoughts with mood tracking.',
    color: '#a855f7',
  },
  {
    icon: Sparkles,
    title: 'Dost Mode AI',
    subtitle: 'Your AI assistant',
    description: 'Chat with Dost — your AI companion who understands your tasks, habits, and can help you plan.',
    color: 'var(--accent-color)',
  },
];

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const slide = SLIDES[current];
  const Icon = slide.icon;
  const isLast = current === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('mithra-onboarding-done', 'true');
      onComplete();
    } else {
      setCurrent(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(prev => prev - 1);
  };

  const handleSkip = () => {
    localStorage.setItem('mithra-onboarding-done', 'true');
    onComplete();
  };

  /* Helper to handle colors that might be CSS vars or Hex */
  const getSlideColor = (c) => c.startsWith('var') ? c : c;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--body-bg)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5, ease: luxuryEase }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: luxuryEase }}
            className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
            style={{
              background: slide.color.startsWith('var') ? `color-mix(in srgb, ${slide.color}, transparent 90%)` : `${slide.color}15`,
              border: `1px solid ${slide.color.startsWith('var') ? `color-mix(in srgb, ${slide.color}, transparent 70%)` : `${slide.color}30`}`
            }}
          >
            <Icon size={40} style={{ color: getSlideColor(slide.color) }} />
          </motion.div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {slide.title}
            </h1>
            <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: getSlideColor(slide.color) }}>
              {slide.subtitle}
            </p>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-dim)', opacity: 0.8 }}>
              {slide.description}
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  background: i === current ? getSlideColor(slide.color) : 'var(--glass-border)',
                }}
                layout
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      <div className="mt-12 w-full max-w-md flex items-center justify-between">
        {current > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: 'var(--text-dim)', opacity: 0.5 }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-dim)', opacity: 0.5 }}
          >
            Skip
          </button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all"
          style={{
            background: getSlideColor(slide.color),
            boxShadow: `0 0 20px ${slide.color.startsWith('var') ? 'var(--accent-glow)' : `${slide.color}33`}`
          }}
        >
          {isLast ? 'Get Started' : 'Next'}
          {isLast ? <Sparkles size={16} /> : <ArrowRight size={16} />}
        </motion.button>
      </div>
    </div>
  );
}

```

## File: client/src/pages/Insights.jsx

```
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, Flame, Target, Clock,
  BarChart3, Calendar, BookOpen, Zap, Award,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useData, getUserScopedKey } from '../context/DataContext';

const luxuryEase = [0.22, 1, 0.36, 1];

const GlassCard = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: luxuryEase }}
    className={`rounded-2xl glass-card glass-shine ${className}`}
  >
    {children}
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, change, changeType = 'neutral', delay = 0 }) => {
  const ChangeIcon = changeType === 'up' ? ArrowUpRight : changeType === 'down' ? ArrowDownRight : Minus;
  const changeColor = changeType === 'up' ? 'text-green-400' : changeType === 'down' ? 'text-red-400' : 'text-[var(--text-dim)] opacity-40';

  return (
    <GlassCard className="p-5" delay={delay}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(var(--color-visor), 0.1)', border: '1px solid rgba(var(--color-visor), 0.15)' }}>
          <Icon className="w-4 h-4 text-accent-visor" />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${changeColor}`}>
            <ChangeIcon size={12} /> {change}
          </span>
        )}
      </div>
      <p className="text-[var(--text-primary)] text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[var(--text-dim)] text-xs mt-1 font-medium opacity-50">{label}</p>
    </GlassCard>
  );
};

/* Mini bar chart */
const MiniBarChart = ({ data, color = 'var(--accent-color)', maxHeight = 60 }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 justify-between" style={{ height: maxHeight }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.value / maxVal) * 100, 4)}%` }}
            transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: luxuryEase }}
            className="w-full max-w-[12px] rounded-t-sm"
            style={{ background: color, opacity: d.value > 0 ? 1 : 0.15, minHeight: 2 }}
          />
          <span className="text-[8px] text-[var(--text-dim)] opacity-30">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function Insights() {
  const { tasks, habits, theme } = useData();
  const isLight = theme === 'light';

  /* ── Computed analytics ── */
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    // Tasks
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Today's tasks
    const todayTasks = tasks?.filter(t => {
      if (!t.dueDate) return false;
      return format(new Date(t.dueDate), 'yyyy-MM-dd') === todayStr;
    }) || [];
    const todayDone = todayTasks.filter(t => t.completed).length;

    // Overdue
    const overdue = tasks?.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length || 0;

    // Priority breakdown
    const highPriority = tasks?.filter(t => t.priority === 'high' && !t.completed).length || 0;
    const medPriority = tasks?.filter(t => t.priority === 'medium' && !t.completed).length || 0;
    const lowPriority = tasks?.filter(t => t.priority === 'low' && !t.completed).length || 0;

    // Habits
    const totalHabits = habits?.length || 0;
    const todayHabits = habits?.filter(h => h.todayDone).length || 0;
    const bestStreak = habits?.reduce((max, h) => Math.max(max, h.bestStreak || h.streak || 0), 0) || 0;
    const avgStreak = totalHabits > 0 ? Math.round(habits.reduce((s, h) => s + (h.streak || 0), 0) / totalHabits) : 0;

    // Focus sessions — stored as plain number count + total time
    let focusSessions = 0;
    let totalFocusMin = 0;
    try {
      focusSessions = parseInt(localStorage.getItem(getUserScopedKey('focus-sessions')) || '0', 10);
      totalFocusMin = Math.round(parseInt(localStorage.getItem(getUserScopedKey('focus-total-time')) || '0', 10));
    } catch { }

    // Journal entries
    let journalCount = 0;
    try {
      const entries = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]');
      journalCount = entries.length;
    } catch { }

    // Mood history
    let avgMood = 0;
    let moodTrend = 'neutral';
    try {
      const moods = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
      if (moods.length > 0) {
        avgMood = (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1);
        if (moods.length >= 3) {
          const recent = moods.slice(-3).reduce((s, m) => s + m.mood, 0) / 3;
          const older = moods.slice(-6, -3).reduce((s, m) => s + m.mood, 0) / Math.min(moods.length - 3, 3) || recent;
          moodTrend = recent > older ? 'up' : recent < older ? 'down' : 'neutral';
        }
      }
    } catch { }

    // Weekly task trend (last 7 days)
    const weeklyTasks = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = tasks?.filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length || 0;
      weeklyTasks.push({ label: format(d, 'E'), value: count, date: dateStr });
    }

    // Weekly habit trend
    const weeklyHabits = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = habits?.filter(h => h.consistency?.includes(dateStr)).length || 0;
      weeklyHabits.push({ label: format(d, 'E'), value: count, date: dateStr });
    }

    // Category breakdown
    const categories = {};
    tasks?.forEach(t => {
      const cat = t.listId || 'default';
      if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
      categories[cat].total++;
      if (t.completed) categories[cat].done++;
    });

    return {
      totalTasks, completedTasks, taskCompletionRate,
      todayTasks: todayTasks.length, todayDone,
      overdue, highPriority, medPriority, lowPriority,
      totalHabits, todayHabits, bestStreak, avgStreak,
      focusSessions, totalFocusMin,
      journalCount, avgMood, moodTrend,
      weeklyTasks, weeklyHabits, categories,
    };
  }, [tasks, habits]);

  const moodEmoji = stats.avgMood >= 4.5 ? '😊' : stats.avgMood >= 3.5 ? '😌' : stats.avgMood >= 2.5 ? '😐' : stats.avgMood >= 1.5 ? '😔' : stats.avgMood > 0 ? '😤' : '—';

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-6 h-6 text-accent-visor" />
          <h1 className="text-2xl md:text-3xl font-light text-[var(--text-primary)] tracking-tight">
            Insights & <span className="font-semibold">Analytics</span>
          </h1>
        </div>
        <p className="text-[var(--text-dim)] text-sm ml-9 opacity-40">Your productivity at a glance</p>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Task Completion" value={`${stats.taskCompletionRate}%`}
          change={`${stats.completedTasks}/${stats.totalTasks}`} changeType="neutral" delay={0.1} />
        <StatCard icon={Flame} label="Best Streak" value={`${stats.bestStreak}d`}
          change={`avg ${stats.avgStreak}d`} changeType={stats.avgStreak > 3 ? 'up' : 'neutral'} delay={0.15} />
        <StatCard icon={Zap} label="Focus Sessions" value={String(stats.focusSessions)}
          change={`${Math.round(stats.totalFocusMin / 60)}h total`} changeType="neutral" delay={0.2} />
        <StatCard icon={BookOpen} label="Journal Entries" value={String(stats.journalCount)}
          change="All time" changeType="neutral" delay={0.25} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Tasks */}
        <GlassCard className="p-6" delay={0.3}>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 size={16} className="text-accent-visor" />
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Tasks Completed This Week</h3>
          </div>
          <MiniBarChart data={stats.weeklyTasks} color="var(--accent-color)" maxHeight={80} />
          <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-[var(--text-dim)] opacity-40">Total this week</span>
            <span className="text-sm font-semibold text-accent-visor">{stats.weeklyTasks.reduce((s, d) => s + d.value, 0)}</span>
          </div>
        </GlassCard>

        {/* Weekly Habits */}
        <GlassCard className="p-6" delay={0.35}>
          <div className="flex items-center gap-2 mb-5">
            <Flame size={16} className="text-accent-visor" />
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Habits Completed This Week</h3>
          </div>
          <MiniBarChart data={stats.weeklyHabits} color="var(--accent-color)" maxHeight={80} />
          <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-[var(--text-dim)] opacity-40">Avg per day</span>
            <span className="text-sm font-semibold text-accent-visor">
              {(stats.weeklyHabits.reduce((s, d) => s + d.value, 0) / 7).toFixed(1)}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <GlassCard className="p-6" delay={0.4}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-accent-visor" />
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Today</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-dim)] text-xs opacity-50">Tasks</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{stats.todayDone}/{stats.todayTasks}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'var(--glass-border)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.todayTasks > 0 ? (stats.todayDone / stats.todayTasks) * 100 : 0}%` }}
                transition={{ delay: 0.6, duration: 0.8, ease: luxuryEase }}
                className="h-full rounded-full" style={{ background: 'var(--accent-color)', minWidth: stats.todayDone > 0 ? 8 : 0 }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-dim)] text-xs opacity-50">Habits</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{stats.todayHabits}/{stats.totalHabits}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'var(--glass-border)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.totalHabits > 0 ? (stats.todayHabits / stats.totalHabits) * 100 : 0}%` }}
                transition={{ delay: 0.7, duration: 0.8, ease: luxuryEase }}
                className="h-full rounded-full" style={{ background: 'var(--accent-color)', minWidth: stats.todayHabits > 0 ? 8 : 0 }} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[var(--text-dim)] text-xs opacity-50">Mood</span>
              <span className="text-lg">{moodEmoji}</span>
            </div>
          </div>
        </GlassCard>

        {/* Priority Breakdown */}
        <GlassCard className="p-6" delay={0.45}>
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-accent-visor" />
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Pending by Priority</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'High', count: stats.highPriority, color: '#ef4444' },
              { label: 'Medium', count: stats.medPriority, color: '#f59e0b' },
              { label: 'Low', count: stats.lowPriority, color: '#22c55e' },
              { label: 'Overdue', count: stats.overdue, color: '#dc2626' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-[var(--text-dim)] text-xs flex-1 opacity-60">{item.label}</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{item.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard className="p-6" delay={0.5}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-accent-visor" />
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Tasks by Category</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.categories).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
              const catName = cat === 'default' ? 'My Tasks' : cat === 'work' ? 'Work' : cat === 'personal' ? 'Personal' : cat;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--text-dim)] text-xs capitalize opacity-60">{catName}</span>
                    <span className="text-xs text-[var(--text-dim)] opacity-40">{data.done}/{data.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--glass-border)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.7, duration: 0.6, ease: luxuryEase }}
                      className="h-full rounded-full" style={{ background: 'var(--accent-color)', minWidth: data.done > 0 ? 4 : 0 }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.categories).length === 0 && (
              <p className="text-[var(--text-dim)] text-xs text-center py-4 opacity-30">No task data yet</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

```

## File: client/src/pages/Journal.jsx

```
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, BarChart2, Calendar as CalIcon, X, Maximize2,
  Image as ImageIcon, Mic, Book, TrendingUp, Heart, Feather,
  Sparkles, ChevronDown, Pencil, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';

/* ═══════════════════════════════════════════════════════════════
   MOOD EMOJI MAP
   ═══════════════════════════════════════════════════════════════ */
const moodEmoji = (score) => {
  if (score >= 9) return '🌟';
  if (score >= 7) return '😊';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😞';
};

const moodGradient = (score, isLight) => {
  if (score >= 8) return 'from-[var(--accent-color)]/15 to-transparent';
  return 'from-[var(--text-primary)]/[0.05] to-transparent';
};

const moodBorder = (score, isLight) => {
  if (score >= 8) return 'border-[var(--accent-color)]/20 hover:border-[var(--accent-color)]/40';
  return 'border-[var(--glass-border)] hover:border-[var(--glass-border-hover)]';
};

/* No mock entries — start with empty journal */

/* ═══════════════════════════════════════════════════════════════
   ZEN EDITOR (Full-screen composing experience)
   ═══════════════════════════════════════════════════════════════ */
const ZenEditor = ({ isOpen, onClose, onSave, editingEntry, isLight }) => {
  const [mood, setMood] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setMood(editingEntry.mood);
        setTitle(editingEntry.title);
        setBody(editingEntry.body);
        setTags(editingEntry.tags.map(t => t.replace('#', '')).join(', '));
      } else {
        setMood(5);
        setTitle('');
        setBody('');
        setTags('');
      }
      setTimeout(() => titleRef.current?.focus(), 200);
    }
  }, [isOpen, editingEntry]);

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return;
    onSave({
      id: editingEntry?.id || Date.now(),
      title: title.trim() || 'Untitled',
      body: body.trim(),
      mood,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`),
      date: editingEntry?.date || new Date(),
      color: mood >= 8 ? 'var(--accent-color)' : 'var(--text-primary)',
    });
    onClose();
  };

  const moodLabel = mood >= 8 ? 'Wonderful' : mood >= 6 ? 'Good' : mood >= 4 ? 'Neutral' : mood >= 2 ? 'Low' : 'Rough';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="w-full max-w-3xl h-[85vh] rounded-2xl overflow-hidden flex flex-col relative glass-heavy glass-shine"
          >
            {/* Dynamic Mood Bar */}
            <div
              className={clsx('absolute top-0 left-0 w-full h-1 transition-all duration-500')}
              style={{
                background: mood >= 8 ? 'var(--accent-color)' : 'var(--glass-border)',
                boxShadow: mood >= 8 ? '0 0 15px var(--accent-color)' : 'none'
              }}
            />

            {/* Toolbar */}
            <div className="flex justify-between items-center px-6 py-4">
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors" style={{ color: 'var(--text-dim)' }}>
                <X size={22} />
              </button>
              <span className="text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>
                <Feather size={14} /> {editingEntry ? 'Edit Entry' : 'New Entry'}
              </span>
              <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-[var(--accent-glow)] text-[var(--accent-color)] text-sm font-medium hover:bg-[var(--accent-color)]/20 transition-all">
                Save
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-8">
              {/* Mood Selector */}
              <div className="mb-10">
                <div className="flex justify-between text-xs mb-3 tracking-widest uppercase" style={{ color: 'var(--text-dim)', opacity: 0.4 }}>
                  <span>Rough</span>
                  <span className="text-sm font-medium transition-colors" style={{ color: mood >= 8 ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                    {moodEmoji(mood)} {moodLabel}
                  </span>
                  <span>Wonderful</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: 'linear-gradient(to right, #ef4444, var(--text-dim), var(--accent-color))' }}
                />
              </div>

              {/* Title */}
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-3xl lg:text-4xl font-light border-none outline-none mb-6"
                style={{ color: 'var(--text-primary)' }}
              />

              {/* Body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Let your thoughts flow freely..."
                className="w-full h-48 lg:h-64 bg-transparent text-lg border-none outline-none resize-none leading-relaxed"
                style={{ color: 'var(--text-dim)' }}
              />

              {/* Tags */}
              <div className="mt-6 pt-6">
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma separated): gratitude, work, calm"
                  className="w-full bg-transparent text-sm border-none outline-none"
                  style={{ color: 'var(--text-dim)', opacity: 0.6 }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 flex gap-3">
              <button className="p-3 rounded-xl transition-all" style={{ background: 'var(--glass-bg)', color: 'var(--text-dim)', opacity: 0.4 }}>
                <ImageIcon size={18} />
              </button>
              <button className="p-3 rounded-xl transition-all" style={{ background: 'var(--glass-bg)', color: 'var(--text-dim)', opacity: 0.4 }}>
                <Mic size={18} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   JOURNAL CARD
   ═══════════════════════════════════════════════════════════════ */
const JournalCard = ({ entry, onClick, onEdit, onDelete, index, isLight }) => {
  const due = entry.date;
  const textPrimary = 'var(--text-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={clsx(
        'break-inside-avoid p-6 rounded-2xl cursor-pointer group relative overflow-hidden transition-shadow glass-card',
        moodBorder(entry.mood, isLight),
      )}
    >
      {/* Top gradient based on mood */}
      <div className={clsx('absolute top-0 left-0 w-full h-24 bg-gradient-to-b pointer-events-none', moodGradient(entry.mood, isLight))} />

      {/* Action buttons — always visible */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
          style={{ color: 'var(--text-dim)' }}
          className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-all opacity-40 hover:opacity-100">
          <Pencil size={15} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
          className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Mood Dot */}
      <div className="flex items-center justify-between mb-4 relative pr-20">
        <span className="text-2xl">{moodEmoji(entry.mood)}</span>
        <span style={{ color: 'var(--text-dim)' }} className="text-xs opacity-40">{format(due, 'MMM d')}</span>
      </div>

      {/* Title */}
      <h3 style={{ color: textPrimary }} className="font-medium text-lg mb-3 opacity-90 group-hover:opacity-100 transition-colors relative">
        {entry.title}
      </h3>

      {/* Body Preview */}
      <p style={{ color: 'var(--text-dim)' }} className="text-sm leading-relaxed mb-5 line-clamp-4 relative opacity-60">
        {entry.body}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 relative">
        {entry.tags.map(tag => (
          <span key={tag} style={{ color: 'var(--text-dim)' }} className="text-xs px-2.5 py-1 rounded-full bg-[var(--glass-bg)] opacity-60">
            {tag}
          </span>
        ))}
      </div>

      <div className={clsx(
        'absolute top-14 right-5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border',
        entry.mood >= 8 ? 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-glow)]' :
          'border-[var(--glass-border)] text-[var(--text-dim)] bg-[var(--glass-bg)] opacity-50'
      )}>
        {entry.mood}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN JOURNAL PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function MithraJournal() {
  const { theme } = useData();
  const isLight = theme === 'light';
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserScopedKey('journal-entries'));
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(e => ({ ...e, date: new Date(e.date) }));
      }
    } catch { }
    return [];
  });
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high' | 'low'
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Persist entries to localStorage
  useEffect(() => {
    try {
      try {
        localStorage.setItem(getUserScopedKey('journal-entries'), JSON.stringify(entries));
      } catch (e) {
        console.warn('Failed to save journal entries:', e.message);
      }
    } catch { }
  }, [entries]);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeFilter === 'high') return matchesSearch && e.mood >= 7;
    if (activeFilter === 'low') return matchesSearch && e.mood < 5;
    return matchesSearch;
  });

  const handleSaveEntry = (entry) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      if (selectedEntry?.id === entry.id) setSelectedEntry(entry);
    } else {
      setEntries(prev => [entry, ...prev]);
    }
    setEditingEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setEditorOpen(true);
  };

  const handleDeleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  // Stats
  const avgMood = entries.length > 0 ? (entries.reduce((a, e) => a + e.mood, 0) / entries.length).toFixed(1) : 0;
  // Real streak: count consecutive days with entries from today backwards
  const streakDays = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDates = new Set(entries.map(e => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));
    let streak = 0;
    let checkDate = new Date(today);
    while (entryDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  })();
  const weekMoods = entries.slice(0, 7).map(e => e.mood);

  return (
    <div className="flex gap-8 h-[calc(100vh-100px)] relative" style={{ color: 'var(--text-primary)' }}>

      <ZenEditor isOpen={isEditorOpen} onClose={() => { setEditorOpen(false); setEditingEntry(null); }} onSave={handleSaveEntry} editingEntry={editingEntry} isLight={isLight} />

      {/* ── ENTRY DETAIL OVERLAY ── */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl p-8 lg:p-12 relative overflow-hidden glass-heavy glass-shine"
              style={{ background: 'var(--body-bg)' }}
            >
              <div className={clsx('absolute top-0 left-0 w-full h-1', selectedEntry.mood >= 8 ? 'bg-accent-visor' : 'bg-[var(--glass-border)]')} />
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <button onClick={() => handleEditEntry(selectedEntry)}
                  style={{ color: 'var(--text-dim)' }}
                  className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-all opacity-40 hover:opacity-100" title="Edit">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeleteEntry(selectedEntry.id)}
                  style={{ color: 'var(--text-dim)' }}
                  className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all opacity-40 hover:opacity-100" title="Delete">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setSelectedEntry(null)} style={{ color: 'var(--text-dim)' }} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] opacity-60 hover:opacity-100">
                  <X size={20} />
                </button>
              </div>
              <div style={{ color: 'var(--text-dim)' }} className="flex items-center gap-3 mb-6 text-sm opacity-60">
                <span className="text-3xl">{moodEmoji(selectedEntry.mood)}</span>
                <span>{format(selectedEntry.date, 'EEEE, MMMM d, yyyy')}</span>
                <span className="ml-auto px-3 py-1 rounded-full text-xs" style={{ background: 'var(--glass-bg)' }}>Mood: {selectedEntry.mood}/10</span>
              </div>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl lg:text-3xl font-light mb-6">{selectedEntry.title}</h2>
              <p style={{ color: 'var(--text-dim)' }} className="leading-relaxed text-lg whitespace-pre-wrap opacity-80">{selectedEntry.body}</p>
              <div className="flex flex-wrap gap-2 mt-8 pt-6">
                {selectedEntry.tags.map(t => (
                  <span key={t} style={{ color: 'var(--text-dim)' }} className="text-xs px-3 py-1.5 rounded-full bg-[var(--glass-bg)] opacity-60">{t}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight flex items-center gap-3">
              <Book size={28} className="text-[var(--accent-color)]" /> Journal
            </h1>
            <p style={{ color: 'var(--text-dim)' }} className="mt-1 text-sm opacity-40">Capture your mind. Track your soul.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            {[{ key: 'all', label: 'All' }, { key: 'high', label: '😊 Good Days' }, { key: 'low', label: '😔 Tough Days' }].map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={clsx(
                  'px-4 py-2 rounded-full text-xs font-medium border transition-all',
                  activeFilter === f.key
                    ? 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-glow)]'
                    : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)] opacity-40 hover:opacity-100'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        {/* Search */}
        <div className="relative group">
          <Search style={{ color: 'var(--text-dim)' }} className="absolute left-4 top-3.5 group-focus-within:text-[var(--accent-color)] transition-colors opacity-30" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full glass-input !pl-12"
          />
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 xl:columns-3 gap-5 space-y-5 pb-16">
          {/* New Entry Card */}
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: 'var(--accent-glow)' }}
            onClick={() => setEditorOpen(true)}
            style={{ color: 'var(--text-dim)', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}
            className="break-inside-avoid p-8 rounded-2xl border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[220px] hover:text-[var(--accent-color)] transition-all group"
          >
            <div style={{ background: 'var(--glass-bg)' }} className="p-4 rounded-full group-hover:bg-[var(--accent-glow)] transition-all">
              <Plus size={28} />
            </div>
            <span className="font-light tracking-[0.2em] uppercase text-sm">New Entry</span>
          </motion.div>

          {/* Entry Cards */}
          {filteredEntries.map((entry, i) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              index={i}
              isLight={isLight}
              onClick={() => setSelectedEntry(entry)}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>

        {filteredEntries.length === 0 && !searchQuery && (
          <div className="text-center py-20">
            <Feather size={48} style={{ color: 'var(--text-dim)' }} className="mx-auto mb-4 opacity-10" />
            <p style={{ color: 'var(--text-dim)' }} className="text-sm opacity-20">No entries yet. Start writing.</p>
          </div>
        )}
      </div>

      {/* ── SIDEBAR: SOUL ANALYTICS ── */}
      <aside className="w-72 hidden xl:flex flex-col gap-6 flex-shrink-0">
        <div className="rounded-2xl p-5 flex flex-col gap-6 h-full overflow-y-auto glass-card glass-shine">

          {/* Average Mood */}
          <div className="text-center py-4">
            <div className="text-5xl mb-2">{moodEmoji(Math.round(avgMood))}</div>
            <div style={{ color: 'var(--text-primary)' }} className="text-2xl font-light">{avgMood}</div>
            <div style={{ color: 'var(--text-dim)' }} className="text-xs mt-1 uppercase tracking-wider opacity-40">Avg Mood</div>
          </div>

          {/* Mood Bars */}
          <div>
            <h4 style={{ color: 'var(--text-dim)' }} className="text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2 opacity-50">
              <BarChart2 size={14} /> This Week
            </h4>
            <div className="h-32 flex items-end justify-between gap-1.5 pb-2">
              {weekMoods.map((val, i) => (
                <div key={i} style={{ background: 'var(--glass-bg-hover)' }} className="w-full rounded-t-sm relative group h-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${val * 10}%` }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={clsx(
                      'w-full rounded-t-sm transition-opacity',
                      val >= 8 ? 'bg-accent-visor' : 'bg-[var(--text-primary)]',
                      'opacity-40 group-hover:opacity-100'
                    )}
                  />
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--text-dim)' }} className="text-xs text-center mt-3 opacity-40">
              Trending <span className="text-[var(--accent-color)]">upward</span> this week
            </p>
          </div>

          {/* Tag Cloud */}
          <div>
            <h4 style={{ color: 'var(--text-dim)' }} className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">Mind Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {entries.length > 0 ? (
                [...new Set(entries.flatMap(e => (e.tags || []).map(t => t.replace('#', ''))))].slice(0, 12).map((word, i) => (
                  <span
                    key={word}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-full border transition-colors cursor-default',
                      i % 3 === 0 ? 'border-accent-visor/20 text-accent-visor/60 hover:bg-accent-visor/5' :
                        'border-[var(--glass-border)] text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)] opacity-50 hover:opacity-100'
                    )}
                  >
                    {word}
                  </span>
                ))
              ) : (
                <p style={{ color: 'var(--text-dim)' }} className="text-xs opacity-20">No tags yet</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-auto pt-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>Total Entries</span>
              <span style={{ color: 'var(--text-dim)', opacity: 0.8 }}>{entries.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>Writing Streak</span>
              <span className="text-[var(--accent-color)] opacity-60">{streakDays} days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>Best Day</span>
              <span style={{ color: 'var(--text-dim)', opacity: 0.8 }}>{entries.length > 0 ? `${moodEmoji(Math.max(...entries.map(e => e.mood)))} ${Math.max(...entries.map(e => e.mood))}/10` : '—'}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

```

## File: client/src/pages/Privacy.jsx

```
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen p-6 md:p-12" style={{ background: '#0A0A0A', color: '#E5E5E5' }}>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm mb-8 hover:text-white transition-colors"
                    style={{ color: '#888' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 md:p-12 rounded-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Shield size={24} className="text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                    </div>

                    <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#A3A3A3' }}>
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
                            <p>
                                Welcome to Mithra AI ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
                            <p className="mb-2">We collect information that you voluntarily provide to us when you register on the application, specifically:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Personal information (Name, Email address)</li>
                                <li>Authentication credentials (via Google OAuth or Email/Password)</li>
                                <li>User content (Tasks, Journal entries, Calendar events)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">3. Google User Data</h2>
                            <p className="mb-2">Our application's use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                            <p>Specifically, if you choose to connect your Google Calendar:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>We access your calendar events solely to display them within the Mithra dashboard.</li>
                                <li>We do not store your calendar data permanently on our servers; it is fetched in real-time or cached locally.</li>
                                <li>We do not share your Google user data with third-party AI models without your explicit consent.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">4. How We Use Your Information</h2>
                            <p>We use the information we collect or receive:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>To facilitate account creation and logon process.</li>
                                <li>To send you administrative information.</li>
                                <li>To protect our Services.</li>
                                <li>To improve your user experience through AI-driven insights (processed locally or securely).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">5. Contact Us</h2>
                            <p>
                                If you have questions or comments about this policy, you may email us at support@mithra.ai.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-white/5 text-xs">
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

```

## File: client/src/pages/Calendar.jsx

```
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Calendar as CalIcon, Trash2, GripVertical, Check, AlertTriangle,
  Download, ExternalLink
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, addWeeks, subWeeks,
  isSameMonth, isSameDay, isToday, getHours, getMinutes,
  setHours, setMinutes, startOfDay, differenceInMinutes,
  parseISO, addHours, eachDayOfInterval, addYears, isBefore, isAfter
} from 'date-fns';
import { clsx } from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';

/* ═══════════════════════════════════════════════════════════════
   COLOR PALETTE FOR EVENT CATEGORIES
   ═══════════════════════════════════════════════════════════════ */
const CATEGORY_COLORS = {
  Work: { bg: 'bg-blue-500/15', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500', hex: '#3b82f6' },
  Meeting: { bg: 'bg-purple-500/15', border: 'border-purple-500', text: 'text-purple-400', dot: 'bg-purple-500', hex: '#a855f7' },
  Personal: { bg: 'bg-[var(--accent-color)]/10', border: 'border-[var(--accent-color)]', text: 'text-[var(--accent-color)]', dot: 'bg-[var(--accent-color)]', hex: 'var(--accent-color)' },
  Health: { bg: 'bg-orange-500/15', border: 'border-orange-500', text: 'text-orange-400', dot: 'bg-orange-500', hex: '#f97316' },
  Focus: { bg: 'bg-[var(--accent-color)]/10', border: 'border-[var(--accent-color)]', text: 'text-[var(--accent-color)]', dot: 'bg-[var(--accent-color)]', hex: 'var(--accent-color)' },
  default: { bg: 'bg-[var(--text-dim)]/10', border: 'border-[var(--text-dim)]/30', text: 'text-[var(--text-primary)]', dot: 'bg-[var(--text-dim)]', hex: 'var(--text-dim)' },
};

const getColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;

/* Get the display color for an event — prefers custom eventColor/habitColor, falls back to category */
const getEventDisplayColor = (evt) => {
  const customHex = evt.eventColor || evt.habitColor;
  if (customHex && customHex !== '#3b82f6') {
    // Return inline-style-friendly object for custom colors
    return {
      hex: customHex,
      isCustom: true,
      bg: `${customHex}22`,        // 13% opacity
      text: customHex,
      border: customHex,
    };
  }
  const cat = getColor(evt.category);
  return { hex: cat.hex, isCustom: false, ...cat };
};

/* ═══════════════════════════════════════════════════════════════
   GOOGLE CALENDAR EXPORT UTILITIES
   ═══════════════════════════════════════════════════════════════ */
const toICSDate = (d) => {
  const dt = new Date(d);
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

const buildGoogleCalendarUrl = (evt) => {
  const start = new Date(evt.start);
  const end = new Date(evt.end || addHours(start, 1));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evt.title || 'Event',
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    ...(evt.location && { location: evt.location }),
    ...(evt.description && { details: evt.description }),
  });
  return `https://www.google.com/calendar/render?${params}`;
};

const exportEventsAsICS = (events) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mithra AI//Life OS//EN',
    'CALSCALE:GREGORIAN',
  ];
  events.forEach(evt => {
    const start = new Date(evt.start);
    const end = new Date(evt.end || addHours(start, 1));
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${(evt.title || 'Event').replace(/[,;]/g, ' ')}`,
      ...(evt.location ? [`LOCATION:${evt.location.replace(/[,;]/g, ' ')}`] : []),
      ...(evt.description ? [`DESCRIPTION:${evt.description.replace(/\n/g, '\\n').replace(/[,;]/g, ' ')}`] : []),
      `UID:${evt.id || Date.now()}@mithra.ai`,
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mithra-calendar.ics';
  a.click();
  URL.revokeObjectURL(url);
};

/* ═══════════════════════════════════════════════════════════════
   OVERLAP DETECTION — Column-based layout for overlapping events
   ═══════════════════════════════════════════════════════════════ */
const computeEventColumns = (events) => {
  if (!events.length) return [];

  // Sort by start time, then by duration (longer first)
  const sorted = [...events].sort((a, b) => {
    const diff = a.start - b.start;
    if (diff !== 0) return diff;
    return (b.end - b.start) - (a.end - a.start);
  });

  // Assign columns using greedy algorithm
  const columns = []; // array of arrays of events
  const eventMeta = new Map(); // eventId → { col, totalCols }

  sorted.forEach(evt => {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastInCol = columns[col][columns[col].length - 1];
      // No overlap if event starts at or after the last event ends
      if (evt.start >= lastInCol.end) {
        columns[col].push(evt);
        eventMeta.set(evt.id, { col });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([evt]);
      eventMeta.set(evt.id, { col: columns.length - 1 });
    }
  });

  // Find overlapping groups and set totalCols per group
  const groups = [];
  sorted.forEach(evt => {
    let addedToGroup = false;
    for (const group of groups) {
      const overlaps = group.some(g => evt.start < g.end && evt.end > g.start);
      if (overlaps) {
        group.push(evt);
        addedToGroup = true;
        break;
      }
    }
    if (!addedToGroup) groups.push([evt]);
  });

  groups.forEach(group => {
    const colsUsed = new Set(group.map(e => eventMeta.get(e.id).col));
    const totalCols = colsUsed.size;
    group.forEach(e => {
      eventMeta.get(e.id).totalCols = totalCols;
    });
  });

  return sorted.map(evt => ({
    ...evt,
    _col: eventMeta.get(evt.id).col,
    _totalCols: eventMeta.get(evt.id).totalCols,
  }));
};

/* ═══════════════════════════════════════════════════════════════
   LOAD/SAVE EVENTS FROM LOCALSTORAGE
   ═══════════════════════════════════════════════════════════════ */
const loadEvents = () => {
  try {
    const stored = localStorage.getItem(getUserScopedKey('calendar-events'));
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    }
  } catch { }
  return null;
};

const saveEvents = (events) => {
  try {
    try {
      localStorage.setItem(getUserScopedKey('calendar-events'), JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save calendar events:', e.message);
    }
  } catch { }
};

/* ═══════════════════════════════════════════════════════════════
   REPEAT EVENT EXPANSION — generates occurrences for repeating events
   within a given date window (±90 days from today)
   ═══════════════════════════════════════════════════════════════ */
const expandRepeatingEvents = (events) => {
  const windowStart = addDays(startOfDay(new Date()), -90);
  const windowEnd = addDays(startOfDay(new Date()), 180);
  const expanded = [];

  events.forEach(evt => {
    expanded.push(evt); // always include the original

    if (!evt.repeat || evt.repeat === 'Does not repeat') return;

    const durationMs = evt.end.getTime() - evt.start.getTime();
    let currentDate = new Date(evt.start);
    let occurrenceCount = 0;
    const maxOccurrences = 365; // safety limit

    while (occurrenceCount < maxOccurrences) {
      // Advance to next occurrence
      if (evt.repeat === 'Daily') {
        currentDate = addDays(currentDate, 1);
      } else if (evt.repeat === 'Weekly') {
        currentDate = addDays(currentDate, 7);
      } else if (evt.repeat === 'Monthly') {
        currentDate = addMonths(currentDate, 1);
      } else if (evt.repeat === 'Yearly') {
        currentDate = addYears(currentDate, 1);
      } else {
        break;
      }

      if (isAfter(currentDate, windowEnd)) break;
      if (isBefore(currentDate, windowStart)) {
        occurrenceCount++;
        continue;
      }

      const newStart = new Date(currentDate);
      const newEnd = new Date(newStart.getTime() + durationMs);

      expanded.push({
        ...evt,
        id: `${evt.id}-repeat-${occurrenceCount}`,
        start: newStart,
        end: newEnd,
        isRepeatInstance: true,
        originalId: evt.id,
      });
      occurrenceCount++;
    }
  });

  return expanded;
};

/* ═══════════════════════════════════════════════════════════════
   INITIAL EVENTS
   ═══════════════════════════════════════════════════════════════ */
const now = new Date();
const makeEvent = (id, title, dayOffset, startH, startM, endH, endM, category) => ({
  id,
  title,
  start: setMinutes(setHours(addDays(startOfDay(now), dayOffset), startH), startM),
  end: setMinutes(setHours(addDays(startOfDay(now), dayOffset), endH), endM),
  category,
  location: '',
  description: '',
});

/* No mock events — start with empty calendar */
const INITIAL_EVENTS = [];

/* ═══════════════════════════════════════════════════════════════
   HOUR LABELS (6AM - 11PM)
   ═══════════════════════════════════════════════════════════════ */
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23
const HOUR_HEIGHT = 60; // px per hour

/* ═══════════════════════════════════════════════════════════════
   MINI CALENDAR (Sidebar)
   ═══════════════════════════════════════════════════════════════ */
const MiniCalendar = ({ currentDate, onDateClick, events }) => {
  const { accentColor } = useData();
  const [viewMonth, setViewMonth] = useState(startOfMonth(currentDate));

  // Keep viewMonth in sync when parent navigates months
  useEffect(() => {
    setViewMonth(startOfMonth(currentDate));
  }, [currentDate]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const hasEvent = (day) => events.some(e => isSameDay(e.start, day));

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{format(viewMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <button aria-label="Previous month" onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1 rounded hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronLeft size={16} /></button>
          <button aria-label="Next month" onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1 rounded hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-xs font-medium text-[var(--text-dim)] opacity-50 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, viewMonth);
          const selected = isSameDay(day, currentDate);
          const todayMark = isToday(day);
          return (
            <button
              key={i}
              onClick={() => onDateClick(day)}
              className={clsx(
                'aspect-square flex flex-col items-center justify-center rounded-full text-xs relative transition-all',
                !inMonth && 'opacity-20',
                selected && 'text-white font-bold',
                todayMark && !selected && 'font-bold',
                !selected && inMonth && 'text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)]',
              )}
              style={selected ? { backgroundColor: 'var(--accent-color)' } : todayMark ? { color: 'var(--accent-color)' } : {}}
            >
              {format(day, 'd')}
              {hasEvent(day) && !selected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EVENT CREATION / EDIT MODAL — Google Calendar-style redesign
   ═══════════════════════════════════════════════════════════════ */
const EVENT_COLORS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Maroon', hex: 'var(--accent-color)' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
];

const REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

const EventModal = ({ isOpen, onClose, onSave, onDelete, event, selectedDate }) => {
  const { accentColor } = useData();
  const isSynced = event?.isTask || event?.isHabit;
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [eventColor, setEventColor] = useState('#3b82f6');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [category, setCategory] = useState('Work');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      if (event) {
        setTitle(event.title);
        setAllDay(event.allDay || false);
        setStartDate(format(event.start, 'yyyy-MM-dd'));
        setStartTime(format(event.start, 'HH:mm'));
        setEndDate(format(event.end, 'yyyy-MM-dd'));
        setEndTime(format(event.end, 'HH:mm'));
        setLocation(event.location || '');
        setEventColor(event.eventColor || getColor(event.category).hex || '#3b82f6');
        setRepeat(event.repeat || 'Does not repeat');
        setCategory(event.category || 'Work');
        setDescription(event.description || '');
      } else {
        setTitle('');
        setAllDay(false);
        const day = selectedDate || new Date();
        setStartDate(format(day, 'yyyy-MM-dd'));
        setEndDate(format(day, 'yyyy-MM-dd'));
        const slotHour = selectedDate ? getHours(selectedDate) : 9;
        const slotMin = selectedDate ? getMinutes(selectedDate) : 0;
        setStartTime(`${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`);
        setEndTime(`${String(Math.min(slotHour + 1, 23)).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`);
        setLocation('');
        setEventColor('#3b82f6');
        setRepeat('Does not repeat');
        setCategory('Work');
        setDescription('');
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, event, selectedDate]);

  // Auto-adjust end time when start time changes (keep same duration, minimum 30min)
  const handleStartTimeChange = (newStartTime) => {
    const [sh, sm] = newStartTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const currentDuration = endMins - startMins;

    setStartTime(newStartTime);

    // If end would be before start, push it forward keeping at least 30 min
    if (currentDuration <= 0) {
      const newEndMins = Math.min(startMins + 60, 24 * 60 - 1);
      const newEh = Math.floor(newEndMins / 60);
      const newEm = newEndMins % 60;
      setEndTime(`${String(newEh).padStart(2, '0')}:${String(newEm).padStart(2, '0')}`);
    }
  };

  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const sDay = startDate ? new Date(startDate + 'T00:00:00') : startOfDay(new Date());
    const eDay = endDate ? new Date(endDate + 'T00:00:00') : sDay;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const computedStart = allDay ? startOfDay(sDay) : setMinutes(setHours(sDay, sh), sm);
    const computedEnd = allDay ? startOfDay(eDay) : setMinutes(setHours(eDay, eh), em);

    // If end is before or equal to start (same day), push end to next day or fix
    let finalEnd = computedEnd;
    if (!allDay && finalEnd <= computedStart) {
      finalEnd = new Date(computedStart.getTime() + 60 * 60 * 1000); // default 1hr
    }

    onSave({
      id: event?.id || Date.now().toString(),
      title: title.trim(),
      start: computedStart,
      end: finalEnd,
      category,
      location,
      description,
      allDay,
      eventColor,
      repeat,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl overflow-hidden glass-heavy glass-shine max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 flex-shrink-0">
              <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/15 flex items-center justify-center">
                  <CalIcon size={18} className="text-[var(--accent-color)]" />
                </div>
                {event ? 'Edit Event' : 'Add Event'}
              </h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Synced event notice */}
              {isSynced && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15 text-blue-300/80 text-xs">
                  <span>{event.isTask ? '📋' : '🔄'}</span>
                  <span>This event is synced from <strong>{event.isTask ? 'Tasks' : 'Habits'}</strong>. Edit it there to make changes.</span>
                </div>
              )}
              {/* Title */}
              <div>
                <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Event Title</label>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="glass-input !text-lg !font-light"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-dim)]">All day</span>
                <button onClick={() => setAllDay(!allDay)}
                  className={clsx('w-11 h-6 rounded-full transition-all relative', !allDay && 'bg-[var(--glass-border)]/50')}
                  style={allDay ? { backgroundColor: 'var(--accent-color)' } : {}}>
                  <motion.div animate={{ x: allDay ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={clsx('w-5 h-5 rounded-full absolute top-0.5', allDay ? 'bg-white' : 'bg-[var(--text-dim)] opacity-40')} />
                </button>
              </div>

              {/* Start Date/Time Row */}
              <div className="flex items-center gap-3">
                <CalIcon size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 block opacity-50">Start</label>
                  <div className="flex gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="glass-input !py-2 !px-3 !text-sm flex-1" />
                    {!allDay && (
                      <input type="time" value={startTime} onChange={e => handleStartTimeChange(e.target.value)}
                        className="glass-input !py-2 !px-3 !text-sm !w-auto" />
                    )}
                  </div>
                </div>
              </div>

              {/* End Date/Time Row */}
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 block opacity-50">End</label>
                  <div className="flex gap-2">
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="glass-input !py-2 !px-3 !text-sm flex-1" />
                    {!allDay && (
                      <input type="time" value={endTime} onChange={e => handleEndTimeChange(e.target.value)}
                        className="glass-input !py-2 !px-3 !text-sm !w-auto" />
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Add location" className="flex-1 glass-input !py-2 !px-3 !text-sm" />
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-3 block opacity-60">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {EVENT_COLORS.map(c => (
                    <button key={c.hex} onClick={() => setEventColor(c.hex)}
                      className={clsx('w-8 h-8 rounded-full transition-all', eventColor === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-offset-[var(--body-bg)]' : 'hover:scale-105')}
                      style={{ backgroundColor: c.hex.startsWith('var') ? `var(--accent-color)` : c.hex }} />
                  ))}
                </div>
              </div>

              {/* Repeat */}
              <div>
                <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Repeat</label>
                <select value={repeat} onChange={e => setRepeat(e.target.value)}
                  className="glass-input !py-2.5 !text-sm appearance-none cursor-pointer">
                  {REPEAT_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-[var(--body-bg)] text-[var(--text-primary)]">{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 flex-shrink-0">
              {event ? (
                event.isTask || event.isHabit ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] text-xs text-[var(--text-dim)]">
                      {event.isTask ? '📋 From Tasks' : '🔄 From Habits'}
                    </span>
                    <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1.5 rounded-lg text-red-400 text-xs hover:bg-red-500/10 transition-colors flex items-center gap-1.5">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2">
                    <Trash2 size={16} /> Delete
                  </button>
                )
              ) : <div />}
              <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-[var(--text-dim)] text-sm hover:bg-[var(--glass-bg-hover)] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={isSynced} className={clsx('px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors', isSynced ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90')} style={{ backgroundColor: 'var(--accent-color)' }}>Save</button>
              </div>
            </div>

            {/* Delete Confirmation Overlay */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="glass-heavy glass-shine rounded-2xl p-6 max-w-sm mx-4 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto">
                      <AlertTriangle size={28} className="text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                        {event?.isTask ? 'Delete Task?' : event?.isHabit ? 'Delete Habit?' : 'Delete Event?'}
                      </h4>
                      <p className="text-sm text-[var(--text-dim)] opacity-60">
                        <span className="font-medium text-red-300">"{title}"</span> will be permanently removed
                        {event?.isTask ? ' from Tasks.' : event?.isHabit ? ' from Habits.' : ' from your calendar.'}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center pt-1">
                      <button onClick={() => setShowDeleteConfirm(false)}
                        className="px-5 py-2.5 rounded-xl text-[var(--text-dim)] text-sm font-medium hover:bg-[var(--glass-bg-hover)] transition-colors">
                        Keep It
                      </button>
                      <button onClick={() => { onDelete(event.id); onClose(); }}
                        className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        Yes, Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WEEK VIEW — THE CORE (Google Calendar Style)
   ═══════════════════════════════════════════════════════════════ */
const WeekView = ({ currentDate, events, onEventClick, onSlotClick }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const gridRef = useRef(null);

  // Current time indicator
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Scroll to 8AM on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 2 * HOUR_HEIGHT; // 6 + 2 = 8AM
    }
  }, []);

  const getEventsForDay = (day) => events.filter(e => isSameDay(e.start, day));

  const getEventStyle = (event) => {
    const startMin = getHours(event.start) * 60 + getMinutes(event.start);
    const endMin = getHours(event.end) * 60 + getMinutes(event.end);
    const top = ((startMin - 360) / 60) * HOUR_HEIGHT; // 360 = 6 * 60 (start at 6AM)
    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
    return { top: `${top}px`, height: `${height}px` };
  };

  const nowTop = useMemo(() => {
    const mins = getHours(currentTime) * 60 + getMinutes(currentTime);
    return ((mins - 360) / 60) * HOUR_HEIGHT;
  }, [currentTime]);

  // Handle click on empty slot
  const handleGridClick = (e, day) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / HOUR_HEIGHT) + 6;
    const roundedHour = Math.min(Math.max(hour, 6), 23);
    onSlotClick(day, roundedHour);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Day Headers */}
      <div className="flex border-b border-white/[0.04] flex-shrink-0">
        <div className="w-10 sm:w-16 flex-shrink-0" /> {/* gutter */}
        {weekDays.map((day, i) => (
          <div key={i} className={clsx('flex-1 text-center py-2 sm:py-3 border-l border-white/[0.04]', isToday(day) && 'bg-[var(--accent-color)]/5')}>
            <div className="text-[10px] sm:text-xs text-[var(--text-dim)] uppercase tracking-wider opacity-50">{format(day, 'EEEEE')}<span className="hidden sm:inline">{format(day, 'EEE').slice(1)}</span></div>
            <div className={clsx(
              'text-lg sm:text-2xl font-light mt-0.5 sm:mt-1',
              isToday(day) ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]',
              isSameDay(day, currentDate) && !isToday(day) && 'text-[var(--text-primary)]'
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div ref={gridRef} className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
          {/* Hour Labels */}
          <div className="w-10 sm:w-16 flex-shrink-0 relative">
            {HOURS.map((hour) => (
              <div key={hour} className="absolute w-full text-right pr-1 sm:pr-3 text-[10px] sm:text-xs text-[var(--text-dim)] -mt-2 opacity-50" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px` }}>
                {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, col) => {
            const dayEvents = getEventsForDay(day);
            const layoutEvents = computeEventColumns(dayEvents);
            const showNowLine = isToday(day);
            return (
              <div
                key={col}
                className={clsx('flex-1 relative border-l border-white/[0.04]', isToday(day) && 'bg-[var(--accent-color)]/[0.02]')}
                onClick={(e) => handleGridClick(e, day)}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div key={hour} className="absolute w-full border-t border-white/[0.04]" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
                ))}

                {/* Events */}
                {layoutEvents.map((evt) => {
                  const style = getEventStyle(evt);
                  const dc = getEventDisplayColor(evt);
                  const colWidth = 100 / evt._totalCols;
                  const colLeft = evt._col * colWidth;
                  return (
                    <motion.div
                      key={evt.id}
                      layoutId={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                      className={clsx(
                        'absolute rounded-lg px-2 py-1.5 cursor-pointer border-l-[3px] overflow-hidden group transition-shadow',
                        !dc.isCustom && dc.bg, !dc.isCustom && dc.border,
                        'hover:shadow-lg hover:z-20'
                      )}
                      style={{
                        ...style,
                        left: `calc(${colLeft}% + 2px)`,
                        width: `calc(${colWidth}% - 4px)`,
                        ...(dc.isCustom ? { backgroundColor: dc.bg, borderLeftColor: dc.border } : {}),
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={clsx('text-xs font-semibold truncate', !dc.isCustom && dc.text)} style={dc.isCustom ? { color: dc.text } : {}}>{evt.title}</div>
                      <div className="text-[10px] text-[var(--text-dim)] opacity-60 mt-0.5">
                        {format(evt.start, 'h:mm a')} – {format(evt.end, 'h:mm a')}
                      </div>
                      {evt.location && <div className="text-[10px] text-[var(--text-dim)] opacity-40 truncate">{evt.location}</div>}
                    </motion.div>
                  );
                })}

                {/* Now indicator */}
                {showNowLine && nowTop > 0 && nowTop < HOURS.length * HOUR_HEIGHT && (
                  <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${nowTop}px` }}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--accent-color)] -ml-1.5 shadow-[0_0_8px_var(--accent-color)]" />
                      <div className="flex-1 h-[2px] bg-[var(--accent-color)] shadow-[0_0_6px_var(--accent-color)]" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MONTH VIEW
   ═══════════════════════════════════════════════════════════════ */
const MonthView = ({ currentDate, events, onDateClick, onEventClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="flex-1 flex flex-col">
      {/* Headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.04] flex-shrink-0">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center py-1.5 sm:py-2 text-[10px] sm:text-xs text-[var(--text-dim)] uppercase tracking-wider opacity-60">{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentDate);
          const dayEvents = events.filter(e => isSameDay(e.start, day));
          return (
            <div
              key={i}
              onClick={() => onDateClick(day)}
              className={clsx(
                'border-b border-r border-white/[0.04] p-1 sm:p-2 cursor-pointer transition-colors min-h-[60px] sm:min-h-[100px]',
                !inMonth && 'opacity-30',
                isToday(day) && 'bg-[var(--accent-color)]/[0.03]',
                'hover:bg-white/[0.03]'
              )}
            >
              <div className={clsx(
                'text-sm mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                isToday(day) ? 'bg-[var(--accent-color)] text-white font-bold' : 'text-[var(--text-dim)] opacity-60',
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(evt => {
                  const dc = getEventDisplayColor(evt);
                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                      className={clsx('text-[11px] px-2 py-0.5 rounded truncate cursor-pointer', !dc.isCustom && dc.bg, !dc.isCustom && dc.text, 'hover:opacity-80')}
                      style={dc.isCustom ? { backgroundColor: dc.bg, color: dc.text } : {}}
                    >
                      {format(evt.start, 'h:mm')} {evt.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[var(--text-dim)] opacity-40 px-2">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DAY VIEW
   ═══════════════════════════════════════════════════════════════ */
const DayView = ({ currentDate, events, onEventClick, onSlotClick }) => {
  const dayEvents = events.filter(e => isSameDay(e.start, currentDate));
  const layoutEvents = computeEventColumns(dayEvents);
  const gridRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 2 * HOUR_HEIGHT;
  }, []);

  const nowTop = useMemo(() => {
    const mins = getHours(currentTime) * 60 + getMinutes(currentTime);
    return ((mins - 360) / 60) * HOUR_HEIGHT;
  }, [currentTime]);

  const getEventStyle = (event) => {
    const startMin = getHours(event.start) * 60 + getMinutes(event.start);
    const endMin = getHours(event.end) * 60 + getMinutes(event.end);
    const top = ((startMin - 360) / 60) * HOUR_HEIGHT;
    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
    return { top: `${top}px`, height: `${height}px` };
  };

  const handleGridClick = (e) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / HOUR_HEIGHT) + 6;
    onSlotClick(currentDate, Math.min(Math.max(hour, 6), 23));
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="text-center py-4 border-b border-white/[0.04] flex-shrink-0">
        <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider opacity-60">{format(currentDate, 'EEEE')}</div>
        <div className={clsx('text-3xl font-light mt-1', isToday(currentDate) ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]')}>
          {format(currentDate, 'd')}
        </div>
      </div>
      <div ref={gridRef} className="flex-1 overflow-y-auto">
        <div className="flex relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
          <div className="w-10 sm:w-16 flex-shrink-0 relative">
            {HOURS.map((hour) => (
              <div key={hour} className="absolute w-full text-right pr-1 sm:pr-3 text-[10px] sm:text-xs text-[var(--text-dim)] opacity-30 -mt-2" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px` }}>
                {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
              </div>
            ))}
          </div>
          <div className="flex-1 relative border-l border-white/[0.04]" onClick={handleGridClick}>
            {HOURS.map((hour) => (
              <div key={hour} className="absolute w-full border-t border-white/[0.04]" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
            ))}
            {layoutEvents.map(evt => {
              const style = getEventStyle(evt);
              const dc = getEventDisplayColor(evt);
              const colWidth = 100 / evt._totalCols;
              const colLeft = evt._col * colWidth;
              return (
                <motion.div
                  key={evt.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                  className={clsx('absolute rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer border-l-[3px] overflow-hidden', !dc.isCustom && dc.bg, !dc.isCustom && dc.border, 'hover:shadow-lg hover:z-20')}
                  style={{
                    ...style,
                    left: `calc(${colLeft}% + 4px)`,
                    width: `calc(${colWidth}% - 8px)`,
                    ...(dc.isCustom ? { backgroundColor: dc.bg, borderLeftColor: dc.border } : {}),
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={clsx('text-sm font-semibold', !dc.isCustom && dc.text)} style={dc.isCustom ? { color: dc.text } : {}}>{evt.title}</div>
                  <div className="text-xs text-[var(--text-dim)] opacity-50 mt-0.5">{format(evt.start, 'h:mm a')} – {format(evt.end, 'h:mm a')}</div>
                </motion.div>
              );
            })}
            {isToday(currentDate) && nowTop > 0 && (
              <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${nowTop}px` }}>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent-color)] -ml-1.5 shadow-[0_0_8px_var(--accent-color)]" />
                  <div className="flex-1 h-[2px] bg-[var(--accent-color)] shadow-[0_0_6px_var(--accent-color)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN CALENDAR COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const MithraCalendar = () => {
  const {
    taskCalendarEvents,
    habitCalendarEvents,
    googleEvents,
    syncSettings,
    toggleSyncGoogleCalendar,
    deleteTask,
    deleteHabit
  } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => loadEvents() || INITIAL_EVENTS);
  const [view, setView] = useState('week'); // 'month' | 'week' | 'day'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);

  // Persist events to localStorage
  React.useEffect(() => { saveEvents(events); }, [events]);

  // Merge own events (with repeat expansion) with synced task/habit/google events
  const allEvents = useMemo(() => {
    const expandedEvents = expandRepeatingEvents(events);
    const gEvents = syncSettings.syncGoogleCalendar ? googleEvents : [];
    return [...expandedEvents, ...taskCalendarEvents, ...habitCalendarEvents, ...gEvents];
  }, [events, taskCalendarEvents, habitCalendarEvents, googleEvents, syncSettings.syncGoogleCalendar]);

  // Navigation
  const navigateForward = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const navigateBack = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const goToToday = () => setCurrentDate(new Date());

  // Event CRUD
  const handleSaveEvent = (evt) => {
    setEvents(prev => {
      const exists = prev.find(e => e.id === evt.id);
      if (exists) return prev.map(e => e.id === evt.id ? evt : e);
      return [...prev, evt];
    });
  };
  const handleDeleteEvent = (id) => {
    // Handle synced task/habit deletion
    if (typeof id === 'string' && id.startsWith('task-')) {
      deleteTask(id.replace('task-', ''));
      return;
    }
    if (typeof id === 'string' && id.startsWith('habit-')) {
      deleteHabit(id.replace('habit-', ''));
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const openNewEvent = (day, hour) => {
    setEditingEvent(null);
    setSelectedSlotDate(day ? setHours(day, hour || 9) : null);
    setModalOpen(true);
  };

  const openEditEvent = (evt) => {
    setEditingEvent(evt);
    setModalOpen(true);
  };

  // Title text
  const headerTitle = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'day') return format(currentDate, 'MMMM d, yyyy');
    const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
    const we = addDays(ws, 6);
    if (ws.getMonth() === we.getMonth()) return format(ws, 'MMMM yyyy');
    return `${format(ws, 'MMM')} – ${format(we, 'MMM yyyy')}`;
  }, [currentDate, view]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100dvh-140px)] md:h-[calc(100vh-32px)] flex gap-0 rounded-2xl overflow-hidden glass-heavy glass-shine mx-2 sm:mx-0"
    >
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-60 flex-shrink-0 p-4 hidden lg:flex flex-col gap-6">
        {/* Create Button */}
        <button
          onClick={() => openNewEvent(currentDate, 9)}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl glass-card text-[var(--text-primary)] hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/30 hover:text-[var(--accent-color)] transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-medium">Create</span>
        </button>

        {/* Mini Calendar */}
        <MiniCalendar
          currentDate={currentDate}
          onDateClick={(d) => { setCurrentDate(d); setView('day'); }}
          events={allEvents}
        />

        {/* Categories Legend */}
        <div className="mt-auto space-y-2">
          <h4 className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-3 opacity-40">Categories</h4>
          {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== 'default').map(([cat, c]) => (
            <div key={cat} className="flex items-center gap-3 text-sm text-[var(--text-dim)] opacity-70">
              <span className={clsx('w-3 h-3 rounded-sm', c.dot)} />
              {cat}
            </div>
          ))}

          <div className="pt-4 mt-4">
            <h4 className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-3 opacity-40">Sync</h4>
            <button
              onClick={toggleSyncGoogleCalendar}
              className="flex items-center gap-3 text-sm text-[var(--text-dim)] opacity-70 hover:opacity-100 hover:text-[var(--text-primary)] transition-all w-full text-left"
            >
              <div className={clsx("w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                syncSettings.syncGoogleCalendar ? "bg-green-500 border-green-500" : "border-[var(--glass-border)]")}
              >
                {syncSettings.syncGoogleCalendar && <Check size={8} className="text-black" />}
              </div>
              Google Calendar
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-6 py-2 sm:py-4 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={goToToday} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors">Today</button>
            <div className="flex gap-0.5 sm:gap-1">
              <button aria-label="Navigate back" onClick={navigateBack} className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronLeft size={18} /></button>
              <button aria-label="Navigate forward" onClick={navigateForward} className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronRight size={18} /></button>
            </div>
            <h2 className="text-sm sm:text-xl font-light text-[var(--text-primary)] tracking-tight truncate">{headerTitle}</h2>
          </div>
          <div className="flex gap-1 items-center">
            <button onClick={() => exportEventsAsICS(allEvents)} title="Export to .ics (Google Calendar, Apple Calendar)"
              className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)] transition-colors mr-1" aria-label="Export calendar">
              <Download size={16} />
            </button>
            <div className="flex gap-1 rounded-lg p-0.5 sm:p-1 glass-card">
              {['day', 'week', 'month'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx(
                    'px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm capitalize transition-all',
                    view === v
                      ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30'
                      : 'text-[var(--text-dim)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] border border-transparent'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Content */}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={allEvents}
            onEventClick={openEditEvent}
            onSlotClick={(day, hour) => openNewEvent(day, hour)}
          />
        )}
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={allEvents}
            onDateClick={(d) => { setCurrentDate(d); setView('day'); }}
            onEventClick={openEditEvent}
          />
        )}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            events={allEvents}
            onEventClick={openEditEvent}
            onSlotClick={(day, hour) => openNewEvent(day, hour)}
          />
        )}
      </div>

      {/* Mobile FAB — Create Event (since left sidebar is hidden) */}
      <button onClick={() => openNewEvent(currentDate, 9)}
        className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'var(--accent-color)', boxShadow: '0 4px 20px var(--accent-glow)' }}>
        <Plus size={24} className="text-white" />
      </button>

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={editingEvent}
        selectedDate={selectedSlotDate}
      />
    </motion.div>
  );
};

export default MithraCalendar;

```

## File: client/src/pages/Dashboard.jsx

```
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, CloudSun, Calendar, CheckCircle2, Circle,
  Star, Clock, ArrowRight, Zap, BookOpen,
  ChevronRight, Sparkles, Target, Flame, Dumbbell,
  Code, Brain, Heart, AlertTriangle,
  TrendingUp, BarChart3, Inbox, FileText
} from 'lucide-react';
import { format, isToday as isTodayFn } from 'date-fns';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useData, getUserScopedKey } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

/* ───── animation config ───── */
const luxuryEase = [0.22, 1, 0.36, 1];
const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: luxuryEase },
  }),
};

/* ───── greeting logic ───── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: Sun, period: 'morning' };
  if (h < 17) return { text: 'Good Afternoon', icon: CloudSun, period: 'afternoon' };
  return { text: 'Good Evening', icon: Moon, period: 'evening' };
};

/* ───── config data ───── */
const CATEGORY_COLORS = {
  Work: '#3b82f6',
  Health: '#f97316',
  Personal: '#a855f7',
  Focus: '#06b6d4',
  Social: '#FACC15',
  default: 'var(--accent-color)',
};

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy', value: 5, message: "You're radiating positivity! Keep spreading that joy — the world needs your light. ✨" },
  { emoji: '😌', label: 'Calm', value: 4, message: "Beautiful inner peace. Stay in this flow — calmness is your superpower. 🧘" },
  { emoji: '😐', label: 'Neutral', value: 3, message: "It's okay to feel neutral — not every day has to be extraordinary. You're doing just fine. 💛" },
  { emoji: '😔', label: 'Sad', value: 2, message: "It's okay to feel this way. Be gentle with yourself — brighter days are ahead. You matter. 💙" },
  { emoji: '😤', label: 'Stressed', value: 1, message: "Take a deep breath. You've overcome tough days before, and you'll get through this too. 💪" },
];

/* ───── habit category config ───── */
const HABIT_CATEGORY_CONFIG = {
  Work: { icon: Code, color: '#3b82f6' },
  Health: { icon: Dumbbell, color: '#f97316' },
  Personal: { icon: Heart, color: '#a855f7' },
  Learning: { icon: BookOpen, color: '#06b6d4' },
  Mindfulness: { icon: Brain, color: '#C2185B' },
};

/* ───── glass card wrapper ───── */
const GlassCard = ({ children, className = '', custom = 0, shine = true, ...props }) => (
  <motion.div
    custom={custom}
    variants={sectionReveal}
    initial="hidden"
    animate="visible"
    className={clsx(
      'rounded-2xl glass-card',
      shine && 'glass-shine',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

/* ───── Weekly Analytics Chart ───── */
const WeeklyAnalyticsChart = ({ tasks, habits, isLight }) => {
  const data = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');

      const tasksCompleted = tasks.filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length;

      const totalTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length;

      const habitsCompleted = habits.filter(h =>
        h.consistency?.includes(dateStr)
      ).length;
      const totalHabits = habits.length;

      days.push({
        label: dayLabel,
        date: dateStr,
        tasksCompleted,
        totalTasks: Math.max(totalTasks, 1),
        habitsCompleted,
        totalHabits: Math.max(totalHabits, 1),
        taskPct: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0,
        habitPct: totalHabits > 0 ? Math.round((habitsCompleted / totalHabits) * 100) : 0,
      });
    }
    return days;
  }, [tasks, habits]);

  const maxPct = 100;

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="flex items-end gap-2 justify-between h-40">
        {data.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex gap-1 items-end flex-1 w-full justify-center">
              {/* Tasks bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(day.taskPct, 4)}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-3 md:w-4 rounded-t-md relative group cursor-pointer"
                style={{ background: 'var(--accent-color)', minHeight: '4px', opacity: day.taskPct > 0 ? 1 : 0.2 }}
                title={`${day.tasksCompleted} tasks done`}
              />
              {/* Habits bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(day.habitPct, 4)}%` }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-3 md:w-4 rounded-t-md relative group cursor-pointer"
                style={{ background: '#f97316', minHeight: '4px', opacity: day.habitPct > 0 ? 1 : 0.2 }}
                title={`${day.habitsCompleted} habits done`}
              />
            </div>
            <span className="text-[10px] text-[var(--text-dim)] font-medium mt-1 opacity-40">{day.label}</span>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-visor" />
          <span className="text-xs text-[var(--text-dim)] opacity-50">
            {data.reduce((s, d) => s + d.tasksCompleted, 0)} tasks &middot; {data.reduce((s, d) => s + d.habitsCompleted, 0)} habits this week
          </span>
        </div>
        <div className="text-xs font-semibold text-accent-visor">
          {Math.round(data.reduce((s, d) => s + d.habitPct, 0) / 7)}% avg habit rate
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DASHBOARD — Royal Merino + Black Glassmorphism
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const { theme, accentColor, tasks: realTasks, toggleTask: ctxToggleTask, habits, toggleHabit, taskCalendarEvents, habitCalendarEvents } = useData();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const greeting = useMemo(getGreeting, []);
  const GreetingIcon = greeting.icon;
  const today = new Date();

  /* ── Today's events from real calendar data (deduplicated) ── */
  const todayEvents = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const events = [];
    const seenIds = new Set();
    // Load saved calendar events from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(getUserScopedKey('calendar-events')) || '[]');
      saved.forEach(evt => {
        if (!evt.start || seenIds.has(evt.id)) return;
        const evtDate = format(new Date(evt.start), 'yyyy-MM-dd');
        if (evtDate === todayStr) {
          seenIds.add(evt.id);
          events.push({
            id: evt.id,
            title: evt.title,
            time: `${format(new Date(evt.start), 'h:mm a')}${evt.end ? ` – ${format(new Date(evt.end), 'h:mm a')}` : ''}`,
            color: CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.default,
            source: 'calendar',
          });
        }
      });
    } catch { }
    // Also add synced task events (skip duplicates)
    if (taskCalendarEvents) {
      taskCalendarEvents.forEach(evt => {
        if (seenIds.has(evt.id)) return;
        if (format(new Date(evt.start), 'yyyy-MM-dd') === todayStr) {
          seenIds.add(evt.id);
          events.push({
            id: evt.id,
            title: evt.title,
            time: format(new Date(evt.start), 'h:mm a'),
            color: CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.default,
            source: 'task',
          });
        }
      });
    }
    // Habits are shown in their own section — not mixed into Events
    // Sort by time string
    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [taskCalendarEvents]);

  /* Map real tasks into dashboard format — show empty state if no tasks */
  const dashTasks = useMemo(() => {
    if (realTasks && realTasks.length > 0) {
      return realTasks
        .filter(t => {
          if (!t.dueDate) return true;
          const d = new Date(t.dueDate);
          return d.toDateString() === today.toDateString();
        })
        .slice(0, 6)
        .map(t => ({
          id: t.id,
          title: t.title,
          priority: (t.priority || 'med').toUpperCase(),
          done: !!t.completed,
          starred: !!t.starred,
        }));
    }
    return [];
  }, [realTasks]);

  const toggleTask = (id) => {
    if (ctxToggleTask) ctxToggleTask(id);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setMoodSaved(false);
    /* Persist mood to localStorage */
    const moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
    moodHistory.push({ date: new Date().toISOString(), mood: mood.value, label: mood.label });
    try {
      localStorage.setItem(getUserScopedKey('mood-history'), JSON.stringify(moodHistory.slice(-30)));
    } catch (e) {
      // Quota exceeded — trim more aggressively
      try { localStorage.setItem(getUserScopedKey('mood-history'), JSON.stringify(moodHistory.slice(-10))); } catch { }
    }
    setTimeout(() => setMoodSaved(true), 600);
  };

  const pendingCount = dashTasks.filter((t) => !t.done).length;
  const doneCount = dashTasks.filter((t) => t.done).length;

  /* Compute real stats from data */
  const completedTasks = realTasks ? realTasks.filter(t => t.completed).length : doneCount;
  const totalHabits = habits ? habits.length : 0;

  /* Best streak across all habits */
  const bestStreakData = useMemo(() => {
    if (!habits || habits.length === 0) return { streak: 0, habit: 'None' };
    let best = habits[0];
    for (const h of habits) {
      if ((h.bestStreak || h.streak) > (best.bestStreak || best.streak)) best = h;
    }
    return { streak: best.bestStreak || best.streak, habit: best.title };
  }, [habits]);
  const bestStreak = bestStreakData.streak;
  const bestStreakHabit = bestStreakData.habit;

  /* Streak alerts — habits where streak < bestStreak / 2 or streak = 0 */
  const streakAlerts = useMemo(() => {
    if (!habits) return [];
    return habits.filter(h => {
      if (h.bestStreak > 3 && h.streak === 0) return true;
      if (h.bestStreak > 5 && h.streak <= Math.floor(h.bestStreak * 0.3)) return true;
      return false;
    });
  }, [habits]);

  /* Last mood from localStorage */
  const lastMood = useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
      if (history.length === 0) return null;
      const last = history[history.length - 1];
      const matching = MOOD_EMOJIS.find(m => m.value === last.mood);
      return matching || null;
    } catch { return null; }
  }, [selectedMood]);

  /* Overdue tasks (past due, not completed) */
  const overdueTasks = useMemo(() => {
    if (!realTasks) return [];
    const now = new Date();
    return realTasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    });
  }, [realTasks]);

  /* Recent journal entries */
  const recentJournals = useMemo(() => {
    try {
      const entries = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]');
      return entries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
    } catch { return []; }
  }, []);

  const MOOD_EMOJI_MAP = { 5: '😊', 4: '😌', 3: '😐', 2: '😔', 1: '😤' };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8">

      {/* ════════════════════════════════════
          GREETING CARD — Hero glass panel
          ════════════════════════════════════ */}
      {/* ════════════════════════════════════
          GREETING CARD — Hero glass panel
          ════════════════════════════════════ */}
      <motion.div
        custom={0}
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl p-8 md:p-10"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.05)' : '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* ambient glows inside the card */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-[20%] w-56 h-56 rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

        <div className="relative flex items-center justify-between flex-wrap gap-5">
          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: luxuryEase }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-glow)]">
                <GreetingIcon className="w-5 h-5 text-[var(--accent-color)]" />
              </div>
              <span className="text-[var(--text-dim)] text-sm font-medium tracking-widest uppercase">
                {format(today, 'EEEE')}
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-4xl font-light text-[var(--text-primary)] tracking-tight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: luxuryEase }}
            >
              {greeting.text},&nbsp;
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-secondary)]">
                {profile?.fullName || 'there'}
              </span>
            </motion.h1>

            <motion.p
              className="text-[var(--text-dim)] text-base mt-2 font-light"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: luxuryEase }}
            >
              {format(today, 'MMMM d, yyyy')} &middot;&nbsp;
              <span className="text-[var(--accent-color)] opacity-80">{pendingCount} tasks pending</span>
            </motion.p>
          </div>

          {/* Date badge — frosted glass */}
          <motion.div
            className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-[var(--glass-bg)] shadow-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.5, ease: luxuryEase }}
          >
            <span className="text-[var(--accent-color)] text-2xl font-bold leading-none">{format(today, 'd')}</span>
            <span className="text-[var(--text-dim)] text-xs uppercase mt-1 tracking-wider">{format(today, 'MMM')}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════
          STREAK ALERTS — if any habit streak dropped
          ════════════════════════════════════ */}
      <AnimatePresence>
        {streakAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} custom={0.5}>
            <GlassCard custom={0.5} className="p-4 border-l-4 border-orange-500/60 !bg-orange-500/05">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Streak Alert!</h3>
                  <div className="space-y-1">
                    {streakAlerts.map(a => (
                      <p key={a.id} className="text-white/60 text-xs">
                        <span className="font-medium text-orange-400">{a.title}</span> — streak dropped to {a.streak} {a.streak === 0 ? '(lost!)' : `from best of ${a.bestStreak}`}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          OVERDUE TASKS — warning section
          ════════════════════════════════════ */}
      <AnimatePresence>
        {overdueTasks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard custom={0.6} className="p-4 border-l-4 border-red-500/60 !bg-red-500/05">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Overdue Tasks</h3>
                  <div className="space-y-1">
                    {overdueTasks.slice(0, 5).map(t => (
                      <p key={t.id} className="text-white/60 text-xs">
                        <span className="font-medium text-red-400">{t.title}</span>
                        <span className="text-white/30"> — due {format(new Date(t.dueDate), 'MMM d')}</span>
                      </p>
                    ))}
                    {overdueTasks.length > 5 && (
                      <p className="text-white/40 text-xs">...and {overdueTasks.length - 5} more</p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          EVENTS + TASKS + HABITS — three-column glass grid
          ════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Events */}
        <GlassCard custom={1} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-[18px] h-[18px] text-[var(--accent-color)]" />
              <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Events</h2>
            </div>
            <button onClick={() => navigate('/calendar')} className="text-[var(--accent-color)] text-xs font-semibold hover:opacity-80 transition-opacity">
              {todayEvents.length} today →
            </button>
          </div>

          {todayEvents.length > 0 ? (
            <div className="space-y-2">
              {todayEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                  className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-[var(--glass-bg-hover)] border border-transparent hover:border-[var(--glass-border)]"
                  onClick={() => {
                    if (event.source === 'task') navigate('/tasks');
                    else if (event.source === 'habit') navigate('/habits');
                    else navigate('/calendar');
                  }}
                >
                  <div className="w-1 h-10 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: event.color, boxShadow: `0 0 8px ${event.color}33` }} />

                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] opacity-90 text-sm font-medium truncate group-hover:opacity-100 transition-colors duration-300">
                      {event.title}
                    </p>
                    <p className="text-[var(--text-dim)] text-xs mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {event.time}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[var(--text-dim)] transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox size={24} className="text-[var(--text-dim)] mb-2 opacity-20" />
              <p className="text-[var(--text-dim)] text-sm opacity-40">No events today</p>
              <p className="text-[var(--text-dim)] text-xs mt-1 opacity-25">Add events in Calendar</p>
            </div>
          )}
        </GlassCard>

        {/* Priority Tasks */}
        <GlassCard custom={2} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-[18px] h-[18px] text-[var(--accent-color)]" />
              <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Tasks</h2>
            </div>
            <button onClick={() => navigate('/tasks')} className="text-[var(--accent-color)] text-xs font-semibold hover:opacity-80 transition-opacity px-2 py-0.5 rounded-lg bg-[var(--accent-glow)]">
              {doneCount}/{dashTasks.length} →
            </button>
          </div>

          <div className="space-y-1.5">
            {dashTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--glass-bg-hover)] transition-all duration-300 border border-transparent hover:border-[var(--glass-border)]"
                style={{
                  background: task.priority === 'HIGH'
                    ? 'rgba(239,68,68,0.08)'
                    : task.priority === 'MED'
                      ? 'rgba(245,158,11,0.07)'
                      : task.priority === 'LOW'
                        ? 'rgba(34,197,94,0.06)'
                        : 'transparent',
                }}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 transition-transform duration-200 active:scale-90"
                >
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--accent-color)] drop-shadow-[0_0_8px_var(--accent-glow)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--text-dim)] opacity-40 group-hover:text-[var(--text-primary)] group-hover:opacity-100 transition-colors duration-300" />
                  )}
                </button>

                <span className={clsx(
                  'flex-1 text-sm transition-all duration-300 truncate',
                  task.done
                    ? 'line-through text-[var(--text-dim)]'
                    : 'text-[var(--text-primary)] opacity-90 group-hover:opacity-100'
                )}>
                  {task.title}
                </span>

                {task.starred && (
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
                )}

                <span className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase tracking-wider',
                  task.priority === 'HIGH' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                )}>
                  {task.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Habit Tracker — in main grid */}
        <GlassCard custom={3} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Flame className="w-[18px] h-[18px] text-[var(--accent-color)]" />
              <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Habits</h2>
            </div>
            <button onClick={() => navigate('/habits')} className="text-[var(--accent-color)] text-xs font-semibold hover:opacity-80 transition-opacity px-2 py-0.5 rounded-lg bg-[var(--accent-glow)]">
              {habits ? habits.filter(h => h.todayDone).length : 0}/{habits ? habits.length : 0} →
            </button>
          </div>

          <div className="space-y-2">
            {habits && habits.length > 0 ? habits.map((habit, i) => {
              const catConfig = HABIT_CATEGORY_CONFIG[habit.category] || HABIT_CATEGORY_CONFIG.Work;
              const HabitIcon = catConfig.icon;
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                    habit.todayDone ? 'opacity-70' : 'hover:bg-[var(--glass-bg-hover)]'
                  )}
                  style={{
                    background: habit.todayDone
                      ? `${habit.color || catConfig.color}12`
                      : `${habit.color || catConfig.color}08`,
                    borderLeft: `3px solid ${habit.color || catConfig.color}${habit.todayDone ? '60' : '30'}`,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${habit.color || catConfig.color}15` }}>
                    <HabitIcon size={14} style={{ color: habit.color || catConfig.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={clsx(
                      'text-sm font-medium transition-all truncate block',
                      habit.todayDone ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text-primary)] opacity-90 group-hover:opacity-100'
                    )}>
                      {habit.title}
                    </span>
                    <span className="text-xs flex items-center gap-1 mt-0.5">
                      <Flame size={10} className="text-orange-500" />
                      <span className="text-orange-400 font-semibold">{habit.streak}</span>
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleHabit(habit.id)}
                    className={clsx('w-7 h-7 rounded-full flex items-center justify-center transition-all border flex-shrink-0',
                      habit.todayDone
                        ? 'bg-[var(--accent-color)] border-[var(--accent-glow)] text-[var(--selection-text)] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
                    )}
                  >
                    {habit.todayDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  </motion.button>
                </motion.div>
              );
            }) : (
              <p className="text-white/40 text-sm text-center py-8">
                No habits yet — create some in the Focus Hub!
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ════════════════════════════════════
          MOOD PICKER — glass panel with animated emojis
          ════════════════════════════════════ */}
      <GlassCard custom={4} className="p-6 md:p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Sparkles className="w-[18px] h-[18px] text-[var(--accent-color)]" />
          <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
            How are you feeling?
          </h2>
        </div>

        <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
          {MOOD_EMOJIS.map((mood, i) => (
            <motion.button
              key={mood.value}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: luxuryEase }}
              whileHover={{ scale: 1.18, y: -8, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleMoodSelect(mood)}
              className={clsx(
                'flex flex-col items-center gap-2.5 p-4 md:p-5 rounded-2xl transition-all duration-300',
                selectedMood?.value === mood.value
                  ? 'bg-[var(--accent-glow)] shadow-lg border border-[var(--glass-border)]'
                  : 'hover:bg-[var(--glass-bg-hover)]'
              )}
            >
              <span className="text-4xl md:text-5xl select-none drop-shadow-lg">{mood.emoji}</span>
              <span className={clsx(
                'text-xs font-medium transition-colors duration-300',
                selectedMood?.value === mood.value
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-dim)]'
              )}>
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {moodSaved && selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-5 p-4 rounded-xl text-center bg-[var(--accent-glow)] border border-[var(--glass-border)]"
            >
              <p className="text-[var(--accent-color)] text-sm font-medium mb-1">✓ Mood logged</p>
              <p className="text-[var(--text-dim)] text-sm leading-relaxed italic">
                "{selectedMood.message}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* ════════════════════════════════════
          STATS ROW — live computed stat cards
          ════════════════════════════════════ */}
      <motion.div
        custom={5}
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Tasks Done', value: String(completedTasks), icon: CheckCircle2, change: `${pendingCount} left` },
          { label: 'Habits Done', value: `${habits ? habits.filter(h => h.todayDone).length : 0}/${totalHabits}`, icon: Flame, change: 'Today' },
          { label: 'Best Streak', value: `${bestStreak}d`, icon: Target, change: bestStreakHabit },
          { label: 'Focus Sessions', value: (() => { try { return localStorage.getItem(getUserScopedKey('focus-sessions')) || '0'; } catch { return '0'; } })(), icon: BookOpen, change: 'Total' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: luxuryEase }}
              className="rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300"
              style={{
                background: 'var(--glass-bg)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent-glow)]">
                  <Icon className="w-4 h-4 text-[var(--accent-color)]" />
                </div>
                <span className="text-[var(--accent-color)] text-xs font-semibold">{stat.change}</span>
              </div>
              <p className="text-[var(--text-primary)] text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[var(--text-dim)] text-xs mt-1 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ════════════════════════════════════
          WEEKLY ANALYTICS GRAPH 
          ════════════════════════════════════ */}
      <GlassCard custom={6} className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-[18px] h-[18px] text-[var(--accent-color)]" />
            <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
              Weekly Progress
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-color)' }} />
              Tasks
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-orange-500" />
              Habits
            </span>
          </div>
        </div>
        <WeeklyAnalyticsChart tasks={realTasks || []} habits={habits || []} isLight={isLight} />
      </GlassCard>

      {/* ════════════════════════════════════
          JOURNAL ENTRIES — recent entries
          ════════════════════════════════════ */}
      <GlassCard custom={7} className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-[18px] h-[18px] text-accent-visor" />
            <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
              Recent Journal
            </h2>
          </div>
          <button
            onClick={() => navigate('/journal')}
            className="flex items-center gap-1 text-xs text-accent-visor/70 hover:text-accent-visor transition-colors font-medium"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>

        {recentJournals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentJournals.map((entry, i) => (
              <motion.div
                key={entry.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                onClick={() => navigate('/journal')}
                className="p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] group"
                style={{
                  background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                  boxShadow: `0 4px 16px rgba(0,0,0,0.08)`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{MOOD_EMOJI_MAP[entry.mood] || '📝'}</span>
                  <span className="text-[10px] font-medium" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>
                    {entry.date ? format(new Date(entry.date), 'MMM d') : ''}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition-colors opacity-85">
                  {entry.title || 'Untitled'}
                </h4>
                <p className="text-xs text-[var(--text-dim)] mt-1 line-clamp-2 leading-relaxed opacity-35">
                  {entry.body || entry.content || ''}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {entry.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
                        color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)',
                        background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText size={24} className="text-[var(--text-dim)] mb-2 opacity-20" />
            <p className="text-[var(--text-dim)] text-sm opacity-40">No journal entries yet</p>
            <button
              onClick={() => navigate('/journal')}
              className="text-accent-visor/70 text-xs mt-2 hover:text-accent-visor transition-colors"
            >
              Write your first entry →
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

```

## File: client/src/pages/Terms.jsx

```
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen p-6 md:p-12" style={{ background: '#0A0A0A', color: '#E5E5E5' }}>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm mb-8 hover:text-white transition-colors"
                    style={{ color: '#888' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 md:p-12 rounded-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <FileText size={24} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold">Terms of Service</h1>
                    </div>

                    <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#A3A3A3' }}>
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using Mithra AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">2. User Accounts</h2>
                            <p>
                                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">3. Intellectual Property</h2>
                            <p>
                                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Mithra AI and its licensors.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">4. Termination</h2>
                            <p>
                                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">5. Limitation of Liability</h2>
                            <p>
                                In no event shall Mithra AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">6. Changes</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-white/5 text-xs">
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

```

## File: client/src/pages/Settings.jsx

```
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Database, LogOut, Calendar, Bell, BellOff, Download,
  ChevronDown, Clock, User, Mail, Phone, MapPin, Globe, Camera,
  Edit3, Check, X, Lock, Shield, AlertCircle, Loader2, Pencil,
  CheckSquare, Activity, Flame, AlertTriangle, Info, Star, ExternalLink, Heart, Linkedin, Instagram
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

/* ═══════ SHARED TOGGLE ═══════ */
const Toggle = ({ label, description, isActive, onToggle }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <span style={{ color: 'var(--text-primary)' }}>{label}</span>
      {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{description}</p>}
    </div>
    <button
      onClick={onToggle}
      className="w-12 h-6 rounded-full p-1 transition-colors duration-300"
      style={{ background: isActive ? 'var(--accent-color)' : 'var(--glass-border)' }}
    >
      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
        style={{ backgroundColor: '#fff' }} />
    </button>
  </div>
);

/* ═══════ PROFILE FIELD ═══════ */
const ProfileField = ({ icon: Icon, label, value, name, editing, editValues, onChange, type = 'text', isLast = false }) => (
  <div className={`flex items-center gap-4 py-3.5`}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'var(--accent-glow)' }}>
      <Icon size={16} style={{ color: 'var(--accent-color)' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
      {editing ? (
        <input
          type={type}
          value={editValues[name] ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full bg-transparent text-sm outline-none border-b-2 py-1 transition-colors"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <p className="text-sm truncate" style={{ color: value ? 'var(--text-primary)' : 'var(--text-dim)' }}>
          {value || 'Not set'}
        </p>
      )}
    </div>
  </div>
);

/* ═══════ THEME PREVIEW CIRCLE ═══════ */
const ThemeCircle = ({ palette, isSelected, onClick, isDark }) => {
  const { preview } = palette;
  const size = 72;
  const half = size / 2;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-full transition-all duration-300"
        style={{
          width: size, height: size,
          boxShadow: isSelected ? `0 0 0 3px ${isDark ? '#050505' : '#FAF7F4'}, 0 0 0 5px ${preview.top}, 0 0 24px ${preview.top}55` : 'none',
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={`M 0 ${half} A ${half} ${half} 0 0 1 ${size} ${half} L ${half} ${half} Z`} fill={preview.top} />
          <path d={`M 0 ${half} A ${half} ${half} 0 0 0 ${half} ${size} L ${half} ${half} Z`} fill={preview.bottomLeft} />
          <path d={`M ${half} ${size} A ${half} ${half} 0 0 0 ${size} ${half} L ${half} ${half} Z`} fill={preview.bottomRight} />
          <circle cx={half} cy={half} r={half - 1} fill="none" stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'} strokeWidth="1.5" />
          {isSelected && <circle cx={half} cy={half} r={half - 1} fill="none" stroke={preview.top} strokeWidth="2.5" />}
        </svg>
      </motion.div>
      <span className="text-xs font-medium transition-colors"
        style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-dim)', fontWeight: isSelected ? 700 : 500 }}>
        {palette.name}
      </span>
    </button>
  );
};

/* ═══════ TOGGLE WITH ICON (for notification categories) ═══════ */
const IconToggle = ({ label, description, icon: Icon, isActive, onToggle, disabled = false }) => (
  <div className={`flex items-center justify-between py-4 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {Icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-glow)' }}>
          <Icon size={16} style={{ color: 'var(--accent-color)' }} />
        </div>
      )}
      <div className="min-w-0">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{description}</p>}
      </div>
    </div>
    <button onClick={onToggle}
      className="w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ml-3"
      style={{ background: isActive ? 'var(--accent-color)' : 'var(--glass-border)' }}>
      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
        style={{ backgroundColor: '#fff' }} />
    </button>
  </div>
);

/* ═══════ REMINDER SLIDER ═══════ */
const SLIDER_STEPS = [
  { value: 0, label: '0' }, { value: 1, label: '1m' }, { value: 5, label: '5m' },
  { value: 10, label: '10m' }, { value: 15, label: '15m' }, { value: 30, label: '30m' },
  { value: 60, label: '1h' }, { value: 120, label: '2h' }, { value: 360, label: '6h' },
  { value: 720, label: '12h' }, { value: 1440, label: '1d' },
];

const formatMinutes = (mins) => {
  if (mins === 0) return 'Off';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} before`;
  if (mins < 1440) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m before` : `${h} hour${h > 1 ? 's' : ''} before`;
  }
  return '1 day before';
};

const ReminderSlider = ({ label, value, onChange }) => {
  const { theme } = useData();
  const isDark = theme === 'dark';
  const stepIndex = useMemo(() => {
    const idx = SLIDER_STEPS.findIndex(s => s.value === value);
    return idx >= 0 ? idx : SLIDER_STEPS.findIndex(s => s.value >= value) || 4;
  }, [value]);
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-glow)', color: 'var(--accent-color)' }}>
          {formatMinutes(value)}
        </span>
      </div>
      <input type="range" min={0} max={SLIDER_STEPS.length - 1} value={stepIndex}
        onChange={(e) => onChange(SLIDER_STEPS[parseInt(e.target.value, 10)].value)}
        className="w-full h-2 rounded-full appearance-none cursor-pointer reminder-slider"
        style={{ background: `linear-gradient(to right, var(--accent-color) ${(stepIndex / (SLIDER_STEPS.length - 1)) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${(stepIndex / (SLIDER_STEPS.length - 1)) * 100}%)` }}
      />
      <div className="flex justify-between mt-2 px-0.5">
        {SLIDER_STEPS.map((s, i) => (
          <span key={s.value} className="text-[9px]"
            style={{ color: i <= stepIndex ? 'var(--accent-color)' : 'var(--text-dim)', fontWeight: i === stepIndex ? 700 : 400 }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ═══════ NOTIFICATIONS SECTION ═══════ */
const NotificationsSection = ({ isDarkMode, notificationSettings, updateNotificationSettings, requestNotificationPermission }) => {
  const [expanded, setExpanded] = useState(false);

  const handleEnableNotifications = async () => {
    if (!notificationSettings.enabled) {
      const granted = await requestNotificationPermission();
      if (granted) updateNotificationSettings({ enabled: true });
      else alert('Please allow notifications in your browser settings to enable this feature.');
    } else {
      updateNotificationSettings({ enabled: false });
    }
  };

  return (
    <section className="glass-panel glass-shine rounded-2xl p-6">
      {/* Header with master toggle */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: notificationSettings.enabled ? 'var(--accent-glow)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') }}>
            {notificationSettings.enabled
              ? <Bell size={20} style={{ color: 'var(--accent-color)' }} />
              : <BellOff size={20} style={{ color: 'var(--text-dim)' }} />}
          </div>
          <div>
            <h2 className="uppercase text-xs font-bold tracking-widest" style={{ color: 'var(--accent-color)' }}>Notifications</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {notificationSettings.enabled ? 'Active — receiving reminders' : 'Disabled'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button onClick={handleEnableNotifications} whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background: notificationSettings.enabled ? 'rgba(239,68,68,0.08)' : 'var(--accent-glow)',
              color: notificationSettings.enabled ? '#ef4444' : 'var(--accent-color)',
              border: `1px solid ${notificationSettings.enabled ? 'rgba(239,68,68,0.15)' : 'var(--accent-color)'}`,
            }}>
            {notificationSettings.enabled ? 'Disable' : 'Enable'}
          </motion.button>
          <button onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-dim)' }}>
            <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Browser permission */}
      {'Notification' in window && (
        <div className="flex items-center gap-2 mt-2 mb-3">
          <Shield size={13} style={{ color: 'var(--text-dim)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            Browser: <span className="font-semibold" style={{
              color: Notification.permission === 'granted' ? '#22c55e'
                : Notification.permission === 'denied' ? '#ef4444' : 'var(--accent-color)'
            }}>{Notification.permission === 'granted' ? 'Allowed' : Notification.permission === 'denied' ? 'Blocked' : 'Requesting'}</span>
          </span>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">

            {/* Reminder Timing */}
            <div className={`mt-4 pt-4 transition-opacity ${!notificationSettings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="uppercase text-[10px] font-bold tracking-widest mb-1 flex items-center gap-2"
                style={{ color: 'var(--text-dim)' }}>
                <Clock size={12} /> Reminder Timing
              </h3>
              <ReminderSlider label="Tasks"
                value={notificationSettings.taskReminderMinutes || notificationSettings.reminderMinutes}
                onChange={(v) => updateNotificationSettings({ taskReminderMinutes: v, reminderMinutes: v })} />
              <div className="h-px bg-white/5" />
              <ReminderSlider label="Calendar Events"
                value={notificationSettings.eventReminderMinutes || notificationSettings.reminderMinutes}
                onChange={(v) => updateNotificationSettings({ eventReminderMinutes: v })} />
              <div className="h-px bg-white/5" />
              <ReminderSlider label="Habits"
                value={notificationSettings.habitReminderMinutes || 60}
                onChange={(v) => updateNotificationSettings({ habitReminderMinutes: v })} />
            </div>

            {/* Notification Types */}
            <div className={`mt-4 pt-4 transition-opacity ${!notificationSettings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="uppercase text-[10px] font-bold tracking-widest mb-2 flex items-center gap-2"
                style={{ color: 'var(--text-dim)' }}>
                <Bell size={12} /> Notification Types
              </h3>
              <IconToggle label="Task Reminders" description="Get notified before tasks are due" icon={CheckSquare}
                isActive={notificationSettings.taskReminders !== false}
                onToggle={() => updateNotificationSettings({ taskReminders: !notificationSettings.taskReminders })} />
              <IconToggle label="Event Reminders" description="Get notified before calendar events start" icon={Calendar}
                isActive={notificationSettings.eventReminders !== false}
                onToggle={() => updateNotificationSettings({ eventReminders: !notificationSettings.eventReminders })} />
              <IconToggle label="Habit Reminders" description="Evening reminder for incomplete daily habits" icon={Activity}
                isActive={notificationSettings.habitReminders !== false}
                onToggle={() => updateNotificationSettings({ habitReminders: !notificationSettings.habitReminders })} />
              <IconToggle label="Streak Loss Alerts" description="Warn when you're about to lose a habit streak" icon={Flame}
                isActive={notificationSettings.streakLossAlerts !== false}
                onToggle={() => updateNotificationSettings({ streakLossAlerts: !notificationSettings.streakLossAlerts })} />
              <IconToggle label="Overdue Task Alerts" description="Notified about tasks past their due date" icon={AlertTriangle}
                isActive={notificationSettings.overdueTaskAlerts !== false}
                onToggle={() => updateNotificationSettings({ overdueTaskAlerts: !notificationSettings.overdueTaskAlerts })} />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-xl"
              style={{ background: 'var(--glass-bg-hover)' }}>
              <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text-dim)' }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Notifications use your browser's built-in system. Make sure browser notifications are allowed for this site.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
export default function Settings() {
  const {
    theme, toggleTheme,
    colorTheme, changeColorTheme, COLOR_THEMES, accentColor,
    notifications, toggleNotifications,
    focusSound, toggleFocusSound,
    notificationSettings, updateNotificationSettings, requestNotificationPermission,
    syncSettings, toggleSyncTasks, toggleSyncHabits, toggleSyncFocus,
    exportData,
  } = useData();

  const { profile, updateProfile, updatePassword, signOut } = useAuth();

  const isDarkMode = theme === 'dark';

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Avatar file input ref
  const avatarInputRef = useRef(null);

  const startEditProfile = () => {
    setEditValues({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      location: profile.location || '',
    });
    setEditingProfile(true);
    setProfileSaved(false);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setEditValues({});
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    await new Promise(r => setTimeout(r, 500));
    updateProfile(editValues);
    setEditingProfile(false);
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleEditField = (name, value) => {
    setEditValues(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatarUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmNewPw) { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await updatePassword(currentPw, newPw);
      setPwSuccess(true);
      setTimeout(() => { setShowPasswordModal(false); setPwSuccess(false); setCurrentPw(''); setNewPw(''); setConfirmNewPw(''); }, 2000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const getInitials = () => {
    const name = profile.fullName || profile.email || 'U';
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const memberSince = profile.dateJoined
    ? new Date(profile.dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="p-4 pt-2 md:p-12 max-w-4xl mx-auto pb-28 md:pb-20" style={{ color: 'var(--text-primary)' }}>
      <h1 className="text-2xl md:text-4xl font-light mb-6 md:mb-8">Settings</h1>

      <div className="space-y-8">

        {/* ═══════ PROFILE CARD ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl overflow-hidden">
          {/* Centered Profile Header */}
          <div className="flex flex-col items-center py-10 px-6"
            style={{ background: 'var(--glass-bg-hover)' }}>
            {/* Circular Avatar */}
            <div className="relative group mb-5">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl transition-transform group-hover:scale-105"
                style={{ background: 'var(--glass-bg)' }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'} />
                      <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" fill={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'} />
                    </svg>
                  </div>
                )}
              </div>
              <button onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                style={{ background: 'var(--accent-color)', color: 'white' }}>
                <Camera size={14} />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold tracking-wider text-center uppercase"
              style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
              {profile.fullName || 'YOUR NAME'}
            </h2>
          </div>

          <div className="px-6 pb-6">
            {/* Edit button row */}
            <div className="flex justify-end gap-2 py-4">
              {editingProfile ? (
                <>
                  <motion.button
                    onClick={cancelEditProfile}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--text-dim)', background: 'var(--glass-bg-hover)' }}>
                    <X size={14} /> Cancel
                  </motion.button>
                  <motion.button
                    onClick={saveProfile}
                    whileTap={{ scale: 0.95 }}
                    disabled={profileSaving}
                    className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-white disabled:opacity-60"
                    style={{ background: 'var(--accent-color)' }}>
                    {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={startEditProfile}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                  style={{
                    color: 'var(--accent-color)',
                    background: 'var(--glass-bg-hover)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}>
                  <Pencil size={14} /> Edit Profile
                </motion.button>
              )}
            </div>

            {/* Saved indicator */}
            <AnimatePresence>
              {profileSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#22c55e' }}>
                  <Check size={16} /> Profile saved successfully
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Fields */}
            <div>
              <ProfileField icon={User} label="Full Name" value={profile.fullName} name="fullName"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />
              <ProfileField icon={Mail} label="Email" value={profile.email} name="email" type="email"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />
              <ProfileField icon={Phone} label="Phone" value={profile.phone} name="phone" type="tel"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />
              <ProfileField icon={MapPin} label="Location" value={profile.location} name="location"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />

              {/* Bio field */}
              <div className="flex items-start gap-4 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-glow)' }}>
                  <Edit3 size={16} style={{ color: 'var(--accent-color)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-dim)' }}>Bio</p>
                  {editingProfile ? (
                    <textarea
                      value={editValues.bio ?? ''}
                      onChange={(e) => handleEditField('bio', e.target.value)}
                      rows={3}
                      className="w-full bg-transparent text-sm outline-none border-b-2 py-1 resize-none transition-colors"
                      style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}
                      placeholder="Tell us about yourself"
                    />
                  ) : (
                    <p className="text-sm" style={{ color: profile.bio ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                      {profile.bio || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              <ProfileField icon={Globe} label="Timezone" value={profile.timezone} name="timezone"
                editing={false} editValues={editValues} onChange={handleEditField} isLast />
            </div>

            {/* Security Actions */}
            <div className="mt-5 flex gap-3">
              <button onClick={() => { setShowPasswordModal(true); setPwError(''); setPwSuccess(false); setCurrentPw(''); setNewPw(''); setConfirmNewPw(''); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: 'var(--text-primary)',
                  background: 'var(--glass-bg-hover)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                <Lock size={14} style={{ color: 'var(--accent-color)' }} /> Change Password
              </button>
            </div>
          </div>
        </section>

        {/* ═══════ APPEARANCE ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>Appearance</h2>
          <div className="flex items-center justify-between py-4">
            <span className="flex items-center gap-3">
              {isDarkMode ? <Moon size={20} style={{ color: 'var(--accent-color)' }} /> : <Sun size={20} style={{ color: 'var(--accent-color)' }} />}
              <div>
                <span>Dark Mode</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {isDarkMode ? 'Using dark theme' : 'Using light theme'}
                </p>
              </div>
            </span>
            <button onClick={toggleTheme}
              className="w-14 h-7 rounded-full p-1 transition-colors duration-300"
              style={{ background: isDarkMode ? 'var(--accent-color)' : 'var(--glass-border)' }}>
              <div className="w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                style={{ transform: isDarkMode ? 'translateX(28px)' : 'translateX(0)', backgroundColor: isDarkMode ? '#fff' : 'var(--accent-color)' }} />
            </button>
          </div>
        </section>

        {/* ═══════ APP THEME ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-5" style={{ color: 'var(--accent-color)' }}>App Theme</h2>
          <div className="flex flex-wrap gap-6 justify-start">
            {Object.entries(COLOR_THEMES).map(([id, palette]) => (
              <ThemeCircle key={id} palette={palette} isSelected={colorTheme === id}
                onClick={() => changeColorTheme(id)} isDark={isDarkMode} />
            ))}
          </div>
        </section>

        {/* ═══════ NOTIFICATIONS ═══════ */}
        <NotificationsSection isDarkMode={isDarkMode} notificationSettings={notificationSettings} updateNotificationSettings={updateNotificationSettings} requestNotificationPermission={requestNotificationPermission} />

        {/* ═══════ PREFERENCES ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>Preferences</h2>
          <Toggle label="Daily AI Briefing" description="Get a smart summary of your day every morning" isActive={notifications} onToggle={toggleNotifications} />
          <Toggle label="Focus Mode Sounds" description="Play ambient sounds during focus sessions" isActive={focusSound} onToggle={toggleFocusSound} />
        </section>

        {/* ═══════ SYNC SETTINGS ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
            <Calendar size={14} /> Sync Settings
          </h2>
          <Toggle label="Sync Tasks to Calendar" description="Show tasks with due dates as events on your calendar" isActive={syncSettings.syncTasksToCalendar} onToggle={toggleSyncTasks} />
          <Toggle label="Sync Habits to Calendar" description="Show daily habits as scheduled blocks" isActive={syncSettings.syncHabitsToCalendar} onToggle={toggleSyncHabits} />
          <Toggle label="Sync Focus to Tracker" description="Automatically log focus sessions as habit progress" isActive={syncSettings.syncFocusToTracker} onToggle={toggleSyncFocus} />
        </section>

        {/* ═══════ SUPPORT & ABOUT ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>Support & About</h2>

          {/* Star on GitHub */}
          <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors text-left group"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                <Star size={18} className="text-white" fill="white" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Star us on GitHub</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Support the project with a star</div>
              </div>
            </div>
            <ExternalLink size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-color)' }} />
          </a>

          {/* About */}
          <div className="w-full flex items-center justify-between p-4 rounded-lg text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
                <Info size={18} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>About</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Mithra AI v1.0.0</div>
              </div>
            </div>
          </div>

          {/* Footer with Social Links */}
          <div className="pt-6 text-center">
            <p className="text-sm flex items-center justify-center gap-1" style={{ color: 'var(--text-dim)' }}>
              Crafted with <Heart size={14} className="text-red-500" fill="#ef4444" /> by
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--accent-color)' }}>
              Hemasai Vattikuti
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--glass-bg-hover)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: 'var(--text-primary)' }}>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/hemsaivattikuti" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #0077b5, #00a0dc)' }}>
                <Linkedin size={18} className="text-white" />
              </a>
              <a href="https://www.instagram.com/hemasai_chowdary/" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #E4405F, #C13584, #833AB4)' }}>
                <Instagram size={18} className="text-white" />
              </a>
            </div>
          </div>
        </section>

        {/* ═══════ DATA ZONE ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="text-red-500 uppercase text-xs font-bold tracking-widest mb-4">Data Zone</h2>
          <button onClick={exportData}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors text-left group"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <Database size={20} style={{ color: 'var(--text-dim)' }} />
              <div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Export My Data</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Download JSON of all journals & tasks</div>
              </div>
            </div>
            <Download size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-color)' }} />
          </button>
          <button onClick={signOut}
            className="w-full flex items-center justify-between p-4 mt-2 rounded-lg transition-colors text-left group"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <LogOut size={20} className="text-red-500/50" />
              <div className="text-red-500">Log Out</div>
            </div>
          </button>
        </section>
      </div>

      {/* ═══════ CHANGE PASSWORD MODAL ═══════ */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{
                background: 'var(--body-bg)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Lock size={18} style={{ color: 'var(--accent-color)' }} /> Change Password
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-dim)' }}>
                  <X size={18} />
                </button>
              </div>

              {pwSuccess ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="text-center py-8">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Check size={24} className="text-green-400" />
                  </div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Password Updated</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>Your password has been changed successfully</p>
                </motion.div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-dim)' }}>Current Password</label>
                    <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: 'var(--text-primary)',
                      }} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-dim)' }}>New Password</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: 'var(--text-primary)',
                      }} required minLength={6} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-dim)' }}>Confirm New Password</label>
                    <input type="password" value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: 'var(--text-primary)',
                      }} required minLength={6} />
                  </div>

                  {pwError && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <AlertCircle size={14} /> {pwError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        color: 'var(--text-primary)',
                      }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={pwLoading}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'var(--accent-color)' }}>
                      {pwLoading ? <Loader2 size={14} className="animate-spin" /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

```

## File: client/src/pages/HabitFocusHub.jsx

```
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, CheckCircle2, Circle, Play, Pause, RotateCcw, Plus, X,
  Activity, Clock, Zap, Target, Dumbbell, BookOpen, Code, Brain,
  Heart, Trash2, TrendingUp, Pencil, Timer
} from 'lucide-react';
import { format, subDays, isSameDay, eachDayOfInterval, startOfYear } from 'date-fns';
import clsx from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';

const luxuryEase = [0.22, 1, 0.36, 1];

const CATEGORY_CONFIG = {
  Work: { icon: Code, color: '#3b82f6' },
  Health: { icon: Dumbbell, color: '#f97316' },
  Personal: { icon: Heart, color: '#a855f7' },
  Learning: { icon: BookOpen, color: '#06b6d4' },
  Mindfulness: { icon: Brain, color: 'var(--accent-color)' },
};

/* roman numeral helper */
const toRoman = (num) => {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let result = '';
  for (const [value, symbol] of map) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result || '0';
};

/* ═══════════ HEATMAP — GitHub-style 365-day contribution graph ═══════════ */
/* ═══════════ HEATMAP — GitHub-style 365-day contribution graph ═══════════ */
const Heatmap = ({ habits, accentColor }) => {
  const today = new Date();
  const [hoveredDay, setHoveredDay] = useState(null);
  const { theme } = useData();
  const startDate = startOfYear(today);
  const days = useMemo(() => eachDayOfInterval({ start: startDate, end: today }), []);
  const totalDaysInYear = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const weeks = useMemo(() => {
    const r = []; let cw = [];
    const firstDayOfWeek = days[0].getDay();
    for (let i = 0; i < firstDayOfWeek; i++) cw.push(null);
    days.forEach((d, i) => { cw.push(d); if (cw.length === 7) { r.push([...cw]); cw = []; } });
    if (cw.length > 0) r.push([...cw]);
    return r;
  }, [days]);

  // Accent-derived color levels (matching theme)
  // We use opacity levels applied to the base accent color
  const OPACITY_LEVELS = [0.2, 0.4, 0.65, 0.9];

  // Build map: dateStr -> completion ratio (for ALL 365 days)
  const completionMap = useMemo(() => {
    const map = {};
    if (!habits || habits.length === 0) return map;
    days.forEach(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const total = habits.length;
      const done = habits.filter(h => h.consistency?.includes(dateStr)).length;
      if (done > 0) map[dateStr] = done / total;
    });
    return map;
  }, [habits, days]);

  const getOpacity = (ratio) => {
    if (!ratio || ratio <= 0) return 0.05; // Empty state
    if (ratio <= 0.25) return OPACITY_LEVELS[0];
    if (ratio <= 0.5) return OPACITY_LEVELS[1];
    if (ratio <= 0.75) return OPACITY_LEVELS[2];
    return OPACITY_LEVELS[3];
  };

  const totalActiveDays = Object.keys(completionMap).length;

  // Month labels for the top axis
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const m = firstDay.getMonth();
        if (m !== lastMonth) {
          labels.push({ month: format(firstDay, 'MMM'), col: wi });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Empty state — no habits at all
  if (!habits || habits.length === 0) {
    return (
      <div className="glass-card glass-shine rounded-2xl p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} className="text-[var(--accent-color)]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">Consistency Map</h3>
        </div>
        <div className="flex items-center justify-center py-12 rounded-xl">
          <p className="text-sm text-center text-[var(--text-dim)] opacity-60">
            Add your first habit to start tracking consistency!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glass-shine rounded-2xl p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--text-dim)]">
          <Activity size={14} className="text-[var(--accent-color)]" /> Consistency Map — {format(today, 'yyyy')}
        </h3>
        <div className="flex items-center gap-3 text-xs text-[var(--text-dim)]">
          <span>{totalActiveDays} active days</span>
          <span className="text-[var(--accent-color)] font-semibold">{Math.round((totalActiveDays / totalDaysInYear) * 100)}%</span>
        </div>
      </div>

      {/* Month labels row */}
      <div className="flex overflow-x-auto pb-0.5 scrollbar-hide">
        <div className="w-7 flex-shrink-0" /> {/* spacer for day labels */}
        <div className="flex gap-[3px] relative" style={{ minWidth: weeks.length * 14 }}>
          {monthLabels.map((m, i) => (
            <span key={i} className="absolute text-[10px] font-medium text-[var(--text-dim)] opacity-60" style={{ left: m.col * 14 }}>
              {m.month}
            </span>
          ))}
        </div>
      </div>

      {/* Grid with day labels */}
      <div className="flex overflow-x-auto pb-1 scrollbar-hide mt-4">
        {/* Day labels column */}
        <div className="flex flex-col gap-[3px] mr-1.5 flex-shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[11px] sm:h-3 flex items-center justify-end pr-0.5">
              <span className="text-[9px] leading-none text-[var(--text-dim)] opacity-50">{label}</span>
            </div>
          ))}
        </div>
        {/* Contribution grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) return <div key={`empty-${di}`} className="w-[11px] h-[11px] sm:w-3 sm:h-3" />;
                const dateStr = format(day, 'yyyy-MM-dd');
                const ratio = completionMap[dateStr] || 0;
                const opacity = getOpacity(ratio);
                const isAcitve = ratio > 0;
                const isH = hoveredDay && isSameDay(hoveredDay, day);

                return (
                  <div key={day.toISOString()} onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(null)} className="relative">
                    <div
                      className="w-[11px] h-[11px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-[3px] transition-all cursor-pointer"
                      style={{
                        backgroundColor: isAcitve ? 'var(--accent-color)' : 'var(--text-dim)',
                        opacity: opacity,
                        outline: isH ? `2px solid var(--accent-color)` : 'none',
                        outlineOffset: isH ? '-1px' : '0',
                      }}
                    />
                    {isH && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap z-50 pointer-events-none shadow-lg glass-heavy border border-white/10"
                        style={{ background: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
                        <span className="font-bold">
                          {ratio >= 1 ? 'All habits done' : ratio > 0 ? `${Math.round(ratio * 100)}% completed` : 'No activity'}
                        </span>
                        <span className="ml-1.5 opacity-70 border-l border-white/10 pl-1.5">{format(day, 'MMM d, yyyy')}</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-[var(--surface-bg)]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend — GitHub style */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-[var(--text-dim)]">
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: 'var(--text-dim)', opacity: 0.05 }} />
        {OPACITY_LEVELS.map((op, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: 'var(--accent-color)', opacity: op }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

/* ═══════════ HABIT CARD — always-visible edit & delete ═══════════ */
const HabitCard = ({ habit, onToggle, onDelete, onEdit, index }) => {
  const catConfig = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.Work;
  const Icon = catConfig.icon;
  const { theme } = useData();
  const isLight = theme === 'light';
  const habitColor = habit.color || catConfig.color;



  // Streak goal progress
  const goalProgress = habit.streakGoal ? Math.min(100, (habit.streak / habit.streakGoal) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: luxuryEase }}
      className={clsx('glass-card glass-shine rounded-xl p-4 flex items-center gap-4 group transition-all relative', habit.todayDone && 'opacity-60')}
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${habitColor}, transparent 85%), color-mix(in srgb, ${habitColor}, transparent 95%), transparent)`,
        borderLeft: `3px solid ${habitColor}`,
      }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `color-mix(in srgb, ${habitColor}, transparent 85%)` }}>
        <Icon size={20} style={{ color: habitColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={clsx('font-medium text-sm transition-all', habit.todayDone && 'line-through')} style={{ color: habit.todayDone ? 'var(--text-dim)' : 'var(--text-primary)' }}>{habit.title}</h4>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs flex items-center gap-1">
            <Flame size={12} className="text-orange-500" />
            <span className="text-orange-400 font-semibold">{habit.streak}</span>
            <span style={{ color: 'var(--text-dim)', opacity: 0.6, fontSize: '11px' }}>day streak</span>
          </span>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: habitColor, opacity: 0.7 }}>{habit.category}</span>
          {habit.scheduleTime && (
            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
              <Clock size={10} /> {(() => { const [h, m] = habit.scheduleTime.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; })()}
            </span>
          )}
        </div>
        {/* Streak goal progress bar */}
        {habit.streakGoal > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--glass-border)' }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} transition={{ duration: 0.5 }}
                style={{ backgroundColor: habitColor }} />
            </div>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>{habit.streak}/{habit.streakGoal} {habit.streakUnit || 'Day'}</span>
          </div>
        )}
      </div>

      {/* Always visible action buttons */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => onEdit(habit)}
          className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: 'var(--text-dim)' }} title="Edit">
          <Pencil size={16} />
        </button>
        <button onClick={() => onDelete(habit.id)}
          className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
          <Trash2 size={16} />
        </button>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggle(habit.id)}
          className={clsx('w-9 h-9 rounded-full flex items-center justify-center transition-all border ml-1',
            habit.todayDone ? 'border-transparent' : 'border-[var(--glass-border)]'
          )}
          style={habit.todayDone ? {
            backgroundColor: habitColor,
            color: 'var(--body-bg)',
            boxShadow: `0 0 12px ${habitColor}`,
          } : {
            color: 'var(--text-dim)',
          }}>
          {habit.todayDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ═══════════ HABIT MODAL — Rich fields with schedule time ═══════════ */
const HABIT_COLORS = ['var(--accent-color)', '#3b82f6', '#f97316', '#a855f7', '#06b6d4', '#ef4444', '#eab308', '#ec4899', '#14b8a6', '#f2ebe3'];
const DAY_LABELS_MODAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const HabitModal = ({ isOpen, onClose, onSave, editingHabit }) => {
  const { theme } = useData();
  const isLight = theme === 'light';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [color, setColor] = useState('#C2185B');
  const [repeatDays, setRepeatDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [frequency, setFrequency] = useState(1);
  const [reminder, setReminder] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [streakGoal, setStreakGoal] = useState(30);
  const [streakUnit, setStreakUnit] = useState('Day');
  const [duration, setDuration] = useState(25);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingHabit) {
        setTitle(editingHabit.title || ''); setCategory(editingHabit.category || 'Work');
        setColor(editingHabit.color || '#C2185B'); setRepeatDays(editingHabit.repeatDays || [0, 1, 2, 3, 4, 5, 6]);
        setFrequency(editingHabit.frequency || 1); setReminder(editingHabit.reminder || false);
        setScheduleTime(editingHabit.scheduleTime || '08:00');
        setStreakGoal(editingHabit.streakGoal || 30);
        setStreakUnit(editingHabit.streakUnit || 'Day'); setDuration(editingHabit.focusDuration || 25);
      } else {
        setTitle(''); setCategory('Work'); setColor('var(--accent-color)'); setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
        setFrequency(1); setReminder(false); setStreakGoal(30);
        setScheduleTime('08:00');
        setStreakUnit('Day'); setDuration(25);
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, editingHabit]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (editingHabit) {
      onSave({ ...editingHabit, title: title.trim(), category, color, repeatDays, frequency, reminder, scheduleTime, streakGoal, streakUnit, focusDuration: duration });
    } else {
      onSave({ id: `h-${Date.now()}`, title: title.trim(), category, color, repeatDays, frequency, reminder, scheduleTime, streakGoal, streakUnit, streak: 0, bestStreak: 0, consistency: [], todayDone: false, focusDuration: duration });
    }
    onClose();
  };

  const toggleDay = (idx) => setRepeatDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);

  const getRepeatSummary = () => {
    if (repeatDays.length === 7) return 'Every day';
    if (repeatDays.length === 0) return 'No days selected';
    if (repeatDays.length === 5 && !repeatDays.includes(0) && !repeatDays.includes(6)) return 'Weekdays';
    if (repeatDays.length === 2 && repeatDays.includes(0) && repeatDays.includes(6)) return 'Weekends';
    return repeatDays.map(d => DAY_NAMES[d].slice(0, 3)).join(', ');
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md glass-heavy glass-shine rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header with colored accent bar */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: color }} />
          <div className="flex items-center justify-between p-5 pt-6">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingHabit ? 'Edit Habit' : 'New Habit'}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-dim)' }}><X size={20} /></button>
          </div>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Habit Name */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Habit Name</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="e.g. Morning Run, Read 30 pages..." className="glass-input !text-base" />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5',
                    category === cat ? 'text-white font-bold' : 'text-[var(--text-dim)] hover:opacity-80'
                  )} style={category === cat ? { background: cfg.color, borderColor: cfg.color } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)' }}>
                  <cfg.icon size={12} /> {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {HABIT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={clsx('w-8 h-8 rounded-full transition-all border-2', color === c ? 'scale-110' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent', boxShadow: color === c ? `0 0 12px ${c}60` : undefined }} />
              ))}
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-1 block" style={{ color: 'var(--text-dim)' }}>Repeat</label>
            <p className="text-[11px] mb-3" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>{getRepeatSummary()}</p>
            <div className="flex gap-2">
              {DAY_LABELS_MODAL.map((label, idx) => (
                <button key={idx} onClick={() => toggleDay(idx)}
                  className={clsx('w-10 h-10 rounded-full text-xs font-bold transition-all border',
                    repeatDays.includes(idx) ? 'text-white border-transparent' : 'hover:opacity-80'
                  )} style={repeatDays.includes(idx) ? { backgroundColor: color, borderColor: color } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)', color: 'var(--text-dim)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Time */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Schedule Time</label>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>When do you want to do this habit?</p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="glass-input !py-2.5 !pl-9 !text-sm w-full" />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>
                {scheduleTime ? (() => { const [h, m] = scheduleTime.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`; })() : ''}
              </span>
            </div>
          </div>

          {/* Focus Duration */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Focus Duration</label>
            <div className="flex gap-2 flex-wrap">
              {[10, 15, 25, 30, 45, 60, 90].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    duration === d ? 'text-white' : ''
                  )} style={duration === d ? { borderColor: `${color}50`, color: color, background: `${color}15` } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)', color: 'var(--text-dim)' }}>{d}m</button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Frequency</label>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Completions per day</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setFrequency(f => Math.max(1, f - 1))} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>−</button>
                <span className="w-8 text-center font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{frequency}</span>
                <button onClick={() => setFrequency(f => Math.min(10, f + 1))} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>+</button>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Reminder</label>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>Get a notification — timing is set in Settings → Notifications</p>
              </div>
              <button onClick={() => setReminder(!reminder)} className={clsx('w-11 h-6 rounded-full transition-all relative')} style={{ backgroundColor: reminder ? color : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(242,235,227,0.1)' }}>
                <motion.div animate={{ x: reminder ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={clsx('w-5 h-5 rounded-full absolute top-0.5')} style={{ backgroundColor: reminder ? (isLight ? '#fff' : '#000') : 'var(--text-dim)' }} />
              </button>
            </div>
          </div>

          {/* Streak Goal */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Streak Goal</label>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
              {streakUnit === 'Day' ? `Complete ${streakGoal} consecutive days` : streakUnit === 'Week' ? `Maintain for ${streakGoal} weeks` : `Keep going for ${streakGoal} months`}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setStreakGoal(g => Math.max(1, g - 1))} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>−</button>
                <span className="w-10 text-center font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{streakGoal}</span>
                <button onClick={() => setStreakGoal(g => g + 1)} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>+</button>
              </div>
              <div className="flex gap-1.5 ml-2">
                {['Day', 'Week', 'Month'].map(u => (
                  <button key={u} onClick={() => setStreakUnit(u)}
                    className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all')}
                    style={streakUnit === u ? { borderColor: `${color}50`, color: color, background: `${color}15` } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)', color: 'var(--text-dim)' }}>{u}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-dim)' }}>Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className={clsx('px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all', !title.trim() && 'opacity-40 cursor-not-allowed')}
            style={{ backgroundColor: color, boxShadow: title.trim() ? `0 0 20px ${color}40` : undefined }}>
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════ SESSION MODAL — Add Custom Focus Session ═══════════ */
const SessionModal = ({ isOpen, onClose, onSave, editingSession }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState(25);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingSession) { setName(editingSession.name); setTime(editingSession.time); }
      else { setName(''); setTime(25); }
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, editingSession]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: editingSession?.id || `s-${Date.now()}`, name: name.trim(), time });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-sm glass-heavy glass-shine rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">{editingSession ? 'Edit Session' : 'Add Session'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Session Name</label>
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Deep Work" className="glass-input" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Duration (minutes)</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setTime(t => Math.max(1, t - 5))} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text-primary)] font-bold text-lg">−</button>
              <span className="w-16 text-center font-bold text-2xl text-[var(--text-primary)] tabular-nums">{time}</span>
              <button onClick={() => setTime(t => Math.min(120, t + 5))} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text-primary)] font-bold text-lg">+</button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[5, 10, 15, 25, 30, 45, 60, 90].map(d => (
                <button key={d} onClick={() => setTime(d)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    time === d ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-glow)]' : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:border-[var(--text-dim)] opacity-50 hover:opacity-100'
                  )}>{d}m</button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[var(--text-dim)] text-sm hover:bg-[var(--glass-bg-hover)] transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-sm hover:shadow-[0_0_20px_var(--accent-glow)] transition-all">
            {editingSession ? 'Save' : 'Add Session'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════ CIRCULAR PROGRESS RING (heartbeat animation) ═══════════ */
const CircularTimer = ({ progress, timeStr, label, isActive, color = 'var(--accent-color)', isLight }) => {
  const size = 280;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(242,235,227,0.06)'} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </svg>

      {/* Dot at progress tip */}
      {progress > 0 && (
        <motion.div
          className="absolute w-3.5 h-3.5 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
            top: size / 2 - radius * Math.cos((progress / 100) * 2 * Math.PI) - 7,
            left: size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI) - 7,
          }}
        />
      )}

      {/* Heartbeat pulse ring when active */}
      {isActive && (
        <motion.div
          className="absolute rounded-full border-2"
          style={{ width: size + 20, height: size + 20, borderColor: `${color}20` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {isActive && (
        <motion.div
          className="absolute rounded-full border"
          style={{ width: size + 40, height: size + 40, borderColor: `${color}10` }}
          animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      )}

      {/* Center text */}
      <div className="text-center z-10">
        <div className="text-5xl font-light tabular-nums tracking-tight" style={{ color: 'var(--text-primary)' }}>{timeStr}</div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{label}</div>
      </div>
    </div>
  );
};

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function HabitFocusHub() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabit, theme, accentColor, lastMilestone } = useData();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('tracker');
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Focus state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null); // habit or custom session
  const [sessions, setSessions] = useState(() => {
    try { return parseInt(localStorage.getItem(getUserScopedKey('focus-sessions')) || '0', 10); } catch { return 0; }
  });
  const [totalFocusTime, setTotalFocusTime] = useState(() => {
    try { return parseInt(localStorage.getItem(getUserScopedKey('focus-total-time')) || '0', 10); } catch { return 0; }
  });
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(getUserScopedKey('focus-history')) || '[]'); } catch { return []; }
  });
  const [editingHistorySession, setEditingHistorySession] = useState(null);
  const [editDuration, setEditDuration] = useState('');

  // Custom sessions list
  const [customSessions, setCustomSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserScopedKey('custom-sessions'));
      if (saved) return JSON.parse(saved);
    } catch { }
    return [
      { id: 's-1', name: 'Deep Work', time: 45 },
      { id: 's-2', name: 'Quick Sprint', time: 15 },
    ];
  });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Persist focus data
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('focus-sessions'), String(sessions)); } catch { } }, [sessions]);
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('focus-total-time'), String(totalFocusTime)); } catch { } }, [totalFocusTime]);
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('focus-history'), JSON.stringify(sessionHistory)); } catch { } }, [sessionHistory]);
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('custom-sessions'), JSON.stringify(customSessions)); } catch { } }, [customSessions]);

  // Stopwatch state
  const [mode, setMode] = useState('timer'); // 'timer' | 'stopwatch'
  const [stopwatchTime, setStopwatchTime] = useState(0);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const swMin = Math.floor(stopwatchTime / 60);
  const swSec = stopwatchTime % 60;
  const swStr = `${String(swMin).padStart(2, '0')}:${String(swSec).padStart(2, '0')}`;

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && mode === 'timer' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && !isPaused && mode === 'stopwatch') {
      interval = setInterval(() => setStopwatchTime(t => t + 1), 1000);
    } else if (mode === 'timer' && timeLeft === 0 && isActive) {
      // Timer completed naturally
      setIsActive(false);
      setIsPaused(false);
      const dur = selectedSession?.focusDuration || selectedSession?.time || 25;
      setSessions(s => s + 1);
      setTotalFocusTime(t => t + dur);
      setSessionHistory(prev => [...prev, {
        id: `sh-${Date.now()}`, name: selectedSession?.title || selectedSession?.name || 'Session',
        duration: dur, endedAt: new Date().toISOString(),
      }]);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, mode, stopwatchTime, selectedSession]);

  const startSession = (item, type) => {
    const dur = (type === 'habit' ? item.focusDuration : item.time) || 25;
    setSelectedSession(type === 'habit' ? { ...item, _type: 'habit' } : { ...item, _type: 'custom' });
    setTimeLeft(dur * 60);
    setIsActive(false);
    setIsPaused(false);
    setMode('timer');
  };

  const handlePlayPause = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // End = finishes current timer and counts elapsed time as a session
  const endSession = () => {
    setIsActive(false);
    setIsPaused(false);
    let elapsed = 0;
    if (mode === 'stopwatch') {
      elapsed = Math.floor(stopwatchTime / 60);
      setStopwatchTime(0);
    } else {
      const dur = selectedSession?.focusDuration || selectedSession?.time || 25;
      elapsed = Math.floor((dur * 60 - timeLeft) / 60);
      setTimeLeft(dur * 60);
    }
    if (elapsed > 0) {
      setSessions(s => s + 1);
      setTotalFocusTime(t => t + elapsed);
      setSessionHistory(prev => [...prev, {
        id: `sh-${Date.now()}`, name: selectedSession?.title || selectedSession?.name || 'Session',
        duration: elapsed, endedAt: new Date().toISOString(),
      }]);
    }
  };

  // Restart = reset timer and start again
  const restartSession = () => {
    if (mode === 'stopwatch') { setStopwatchTime(0); }
    else { const dur = selectedSession?.focusDuration || selectedSession?.time || 25; setTimeLeft(dur * 60); }
    setIsActive(true);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    if (mode === 'stopwatch') { setStopwatchTime(0); }
    else { const dur = selectedSession?.focusDuration || selectedSession?.time || 25; setTimeLeft(dur * 60); }
  };

  // Session history management
  const deleteHistorySession = (id) => {
    const s = sessionHistory.find(x => x.id === id);
    if (s) {
      setSessionHistory(prev => prev.filter(x => x.id !== id));
      setSessions(prev => Math.max(0, prev - 1));
      setTotalFocusTime(prev => Math.max(0, prev - s.duration));
    }
  };

  const saveHistoryEdit = (id) => {
    const dur = parseInt(editDuration);
    if (isNaN(dur) || dur <= 0) return;
    setSessionHistory(prev => prev.map(s => {
      if (s.id === id) {
        const diff = dur - s.duration;
        setTotalFocusTime(t => Math.max(0, t + diff));
        return { ...s, duration: dur };
      }
      return s;
    }));
    setEditingHistorySession(null);
    setEditDuration('');
  };

  const totalDuration = selectedSession?.focusDuration * 60 || selectedSession?.time * 60 || 25 * 60;
  const progress = mode === 'timer' ? ((totalDuration - timeLeft) / totalDuration) * 100 : Math.min(100, (stopwatchTime / 3600) * 100);

  const addCustomSession = (s) => {
    if (editingSession) setCustomSessions(prev => prev.map(x => x.id === s.id ? s : x));
    else setCustomSessions(prev => [...prev, s]);
  };
  const deleteCustomSession = (id) => setCustomSessions(prev => prev.filter(s => s.id !== id));

  // Sort habits: done last
  const sortedHabits = useMemo(() => [...habits].sort((a, b) => {
    if (a.todayDone !== b.todayDone) return a.todayDone ? 1 : -1;
    return b.streak - a.streak;
  }), [habits]);

  const doneToday = habits.filter(h => h.todayDone).length;
  const combinedConsistency = useMemo(() => {
    const all = new Set(); habits.forEach(h => h.consistency.forEach(d => all.add(d))); return Array.from(all);
  }, [habits]);

  const sessionLabel = selectedSession
    ? (selectedSession._type === 'habit' ? selectedSession.title : selectedSession.name)
    : 'Custom';

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto pb-24 md:pb-8">
      {/* STREAK MILESTONE CELEBRATION */}
      <AnimatePresence>
        {lastMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass-heavy glass-shine rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl max-w-md"
            style={{ border: `2px solid ${lastMilestone.color || 'var(--accent-color)'}40` }}
          >
            <div className="text-4xl">🏆</div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {lastMilestone.streak}-Day Streak!
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                <span className="font-semibold" style={{ color: lastMilestone.color || 'var(--accent-color)' }}>
                  {lastMilestone.habit}
                </span>{' '}
                — {lastMilestone.streak >= 365 ? 'Legendary! A full year! 🌟' : lastMilestone.streak >= 100 ? 'Incredible dedication! 💎' : lastMilestone.streak >= 60 ? 'Two months strong! 🔥🔥' : lastMilestone.streak >= 30 ? 'One month champion! 🎖️' : lastMilestone.streak >= 21 ? 'Habit formed! 🧠' : lastMilestone.streak >= 14 ? 'Two weeks! Keep going!' : 'First week conquered! 💪'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* TOP TOGGLE */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="glass-card rounded-full p-1 flex gap-1 relative w-full max-w-xs sm:max-w-sm">
          <motion.div className="absolute top-1 bottom-1 rounded-full" initial={false}
            animate={{ left: activeTab === 'tracker' ? '4px' : 'calc(50%)', width: 'calc(50% - 4px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ background: 'rgb(var(--color-visor) / 0.1)', boxShadow: '0 0 16px rgb(var(--color-visor) / 0.08)' }} />
          <button onClick={() => setActiveTab('tracker')} className={clsx('flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-full z-10 flex items-center justify-center gap-2 transition-colors', activeTab === 'tracker' ? 'text-[#C2185B]' : 'text-[#F2EBE3]/35')}>
            <Activity size={16} /> Tracker
          </button>
          <button onClick={() => setActiveTab('focus')} className={clsx('flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-full z-10 flex items-center justify-center gap-2 transition-colors', activeTab === 'focus' ? 'text-[#C2185B]' : 'text-[#F2EBE3]/35')}>
            <Zap size={16} /> Focus
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════ TRACKER VIEW ═══════ */}
        {activeTab === 'tracker' && (
          <motion.div key="tracker" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35, ease: luxuryEase }} className="space-y-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
                <Target size={16} className="text-accent-visor" />
                <span className="text-sm font-semibold">{doneToday}/{habits.length}</span>
                <span className="text-xs text-[#F2EBE3]/30">today</span>
              </div>
              <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
                <Flame size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-400">{Math.max(...habits.map(h => h.streak), 0)}</span>
                <span className="text-xs text-[#F2EBE3]/30">best streak</span>
              </div>
              <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
                <TrendingUp size={16} className="text-accent-visor" />
                <span className="text-sm font-semibold text-accent-visor">{Math.round((doneToday / Math.max(habits.length, 1)) * 100)}%</span>
                <span className="text-xs text-[#F2EBE3]/30">completion</span>
              </div>
            </div>
            <Heatmap habits={habits} accentColor={accentColor} />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Your Habits</h2>
                <button onClick={() => { setEditingHabit(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-accent-visor text-xs font-bold hover:bg-[#C2185B]/10 transition-all">
                  <Plus size={16} /> Add Habit
                </button>
              </div>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {sortedHabits.map((habit, i) => (
                    <HabitCard key={habit.id} habit={habit} index={i} onToggle={toggleHabit} onDelete={deleteHabit}
                      onEdit={(h) => { setEditingHabit(h); setShowModal(true); }} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ FOCUS VIEW — Circular heartbeat timer ═══════ */}
        {activeTab === 'focus' && (
          <motion.div key="focus" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: luxuryEase }} className="flex flex-col items-center">

            {/* Timer/Stopwatch toggle */}
            <div className="flex gap-2 mb-8">
              <button onClick={() => { setMode('timer'); setIsActive(false); }}
                className={clsx('px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2',
                  mode === 'timer' ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/35')}>
                <Timer size={14} /> Timer
              </button>
              <button onClick={() => { setMode('stopwatch'); setIsActive(false); setStopwatchTime(0); }}
                className={clsx('px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2',
                  mode === 'stopwatch' ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/35')}>
                <Clock size={14} /> Stopwatch
              </button>
            </div>

            {/* Session label */}
            {selectedSession && mode === 'timer' && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-[#F2EBE3]/30 mb-4 flex items-center gap-2">
                <Flame size={14} className="text-orange-500" />
                Focusing on <span className="text-[#F2EBE3]/60 font-medium ml-1">{sessionLabel}</span>
              </motion.p>
            )}

            {/* Circular timer */}
            <div className="py-6">
              <CircularTimer
                progress={mode === 'timer' ? progress : Math.min(100, (stopwatchTime / 3600) * 100)}
                timeStr={mode === 'timer' ? timeStr : swStr}
                label={mode === 'stopwatch' ? 'Stopwatch' : sessionLabel}
                isActive={isActive}
                isLight={isLight}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
              {/* Play / Pause */}
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handlePlayPause}
                className={clsx('px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all',
                  isActive && !isPaused ? 'glass-card text-orange-400 border border-orange-400/30' : 'bg-[#C2185B] text-white shadow-[0_0_30px_rgba(194,24,91,0.25)]')}>
                {isActive && !isPaused
                  ? <span className="flex items-center gap-2"><Pause size={18} /> Pause</span>
                  : <span className="flex items-center gap-2"><Play size={18} /> {isPaused ? 'Resume' : 'Start'}</span>}
              </motion.button>

              {/* End — counts elapsed as a session */}
              {isActive && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }} onClick={endSession}
                  className="px-6 py-3.5 rounded-full font-bold tracking-widest text-sm text-[#C2185B] border border-[#C2185B]/30 glass-card flex items-center gap-2">
                  <CheckCircle2 size={16} /> End
                </motion.button>
              )}

              {/* Restart */}
              {isActive && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }} onClick={restartSession}
                  className="px-5 py-3.5 rounded-full font-bold tracking-widest text-sm text-blue-400 border border-blue-400/30 glass-card flex items-center gap-2">
                  <RotateCcw size={16} /> Restart
                </motion.button>
              )}

              {/* Reset when paused or not started */}
              {!isActive && (
                <button onClick={resetTimer} className="p-3 rounded-full text-[#F2EBE3]/25 hover:text-[#F2EBE3]/60 transition-colors">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>

            {/* Stats bar + Sync toggle */}
            <div className="flex gap-4 mt-8 mb-6 flex-wrap justify-center">
              <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-2.5">
                <Timer size={16} className="text-blue-400" />
                <span className="text-sm font-semibold">{sessions}</span>
                <span className="text-xs text-[#F2EBE3]/30">Sessions</span>
              </div>
              <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-2.5">
                <Clock size={16} className="text-[#C2185B]" />
                <span className="text-sm font-semibold text-[#C2185B]">{totalFocusTime}m</span>
                <span className="text-xs text-[#F2EBE3]/30">Total Time</span>
              </div>
            </div>

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <div className="w-full max-w-2xl mb-6">
                <h3 className="text-xs text-[#F2EBE3]/30 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                  <Clock size={12} /> Today's Sessions
                </h3>
                <div className="space-y-2">
                  {sessionHistory.map((s) => (
                    <div key={s.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 border border-[#C2185B]/20 flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-[#C2185B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-[#F2EBE3]/80">{s.name}</span>
                        <span className="text-xs text-[#F2EBE3]/25 ml-2">
                          {new Date(s.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {editingHistorySession === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg glass-input !py-1 !px-2 !text-xs text-center"
                            placeholder="min" autoFocus onKeyDown={e => e.key === 'Enter' && saveHistoryEdit(s.id)} />
                          <button onClick={() => saveHistoryEdit(s.id)} className="text-[#C2185B] text-xs font-bold px-2 py-1 rounded hover:bg-[#C2185B]/10">✓</button>
                          <button onClick={() => { setEditingHistorySession(null); setEditDuration(''); }} className="text-[#F2EBE3]/30 text-xs px-2 py-1 rounded hover:bg-white/5">✕</button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-[#C2185B] tabular-nums">{s.duration}m</span>
                          <button onClick={() => { setEditingHistorySession(s.id); setEditDuration(String(s.duration)); }}
                            className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-[#F2EBE3]/60 hover:bg-white/5 transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteHistorySession(s.id)}
                            className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Sessions — at top */}
            <div className="w-full max-w-2xl">
              <h3 className="text-xs text-[#F2EBE3]/30 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Zap size={12} /> Custom Sessions
              </h3>
              <div className="space-y-2 mb-4">
                {customSessions.map((s, i) => {
                  const isSelected = selectedSession?._type === 'custom' && selectedSession?.id === s.id;
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={clsx('glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all group',
                        isSelected ? 'border border-[#C2185B]/30 bg-[#C2185B]/5' : 'hover:bg-white/[0.03]')}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#C2185B]/10 border border-[#C2185B]/20"
                        onClick={() => startSession(s, 'custom')}>
                        <Zap size={16} className="text-[#C2185B]" />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => startSession(s, 'custom')}>
                        <span className="text-sm font-medium text-[#F2EBE3]/80">{s.name}</span>
                        <span className="text-xs text-[#F2EBE3]/25 ml-2">{s.time}m</span>
                      </div>
                      <span className="text-xs text-[#F2EBE3]/15 font-mono uppercase mr-2">{toRoman(i + 1)}</span>
                      <button onClick={() => { setEditingSession(s); setShowSessionModal(true); }}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-[#F2EBE3]/60 hover:bg-white/5 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteCustomSession(s.id)}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <button onClick={() => { setEditingSession(null); setShowSessionModal(true); }}
                className="w-full py-3 rounded-xl border border-dashed border-[#C2185B]/20 text-[#C2185B] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#C2185B]/5 transition-all mb-6">
                <Plus size={16} /> Add Custom Session
              </button>

              {/* Sessions from Habits — below custom */}
              <h3 className="text-xs text-[#F2EBE3]/30 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Activity size={12} /> From Your Habits
              </h3>
              <div className="space-y-2">
                {habits.map((h, i) => {
                  const cfg = CATEGORY_CONFIG[h.category] || CATEGORY_CONFIG.Work;
                  const Icon = cfg.icon;
                  const isSelected = selectedSession?._type === 'habit' && selectedSession?.id === h.id;
                  return (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={clsx('glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all group',
                        isSelected ? 'border border-[#C2185B]/30 bg-[#C2185B]/5' : 'hover:bg-white/[0.03]')}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${h.color || cfg.color}15` }}
                        onClick={() => startSession(h, 'habit')}>
                        <Icon size={16} style={{ color: h.color || cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => startSession(h, 'habit')}>
                        <span className="text-sm font-medium text-[#F2EBE3]/80">{h.title}</span>
                        <span className="text-xs text-[#F2EBE3]/25 ml-2">{h.focusDuration}m</span>
                      </div>
                      <span className="text-xs text-[#F2EBE3]/15 font-mono uppercase mr-2">{toRoman(i + 1)}</span>
                      <button onClick={(e) => { e.stopPropagation(); setEditingHabit(h); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-[#F2EBE3]/60 hover:bg-white/5 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <HabitModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingHabit(null); }}
            onSave={(h) => { if (editingHabit) updateHabit(h); else addHabit(h); }} editingHabit={editingHabit} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSessionModal && (
          <SessionModal isOpen={showSessionModal} onClose={() => { setShowSessionModal(false); setEditingSession(null); }}
            onSave={addCustomSession} editingSession={editingSession} />
        )}
      </AnimatePresence>
    </div>
  );
}

```

## File: client/src/pages/LandingPage.jsx

```

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, ChevronDown, Github,
    Menu, X, Globe, Zap, Shield, Users,
    Layout, Calendar, BookOpen, Clock, Smile, Sparkles, Linkedin, Instagram, Code, Database, Cpu
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            title: "Task Management",
            desc: "Organize your life with precision.",
            icon: Layout,
            image: "/assets/tasks.png",
            details: [
                "Deep hierarchy support",
                "Priority-based sorting",
                "AI-driven suggestions"
            ]
        },
        {
            title: "Unified Calendar",
            desc: "Time-blocking made simple.",
            icon: Calendar,
            image: "/assets/calender.png",
            details: [
                "Drag-and-drop scheduling",
                "Google Calendar sync",
                "Smart conflict detection"
            ]
        },
        {
            title: "Habit Tracking",
            desc: "Build consistency that lasts.",
            icon: Zap,
            image: "/assets/habbits.png",
            details: [
                "Streak visualization",
                "Daily check-ins",
                "Progress analytics"
            ]
        },
        {
            title: "Mood Journal",
            desc: "Reflect and understand yourself.",
            icon: Smile,
            image: "/assets/journals.png",
            details: [
                "Sentiment analysis",
                "Emotional trends",
                "Private & secure"
            ]
        },
        {
            title: "Focus Timer",
            desc: "Deep work, distraction free.",
            icon: Clock,
            image: "/assets/focus_timer.png",
            details: [
                "Pomodoro technique",
                "Custom intervals",
                "Focus statistics"
            ]
        },
        {
            title: "Dost AI",
            desc: "Your personal AI companion.",
            icon: BookOpen,
            image: "/assets/dosth(ai).png",
            details: [
                "Context-aware chat",
                "Task automation",
                "Personalized advice"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--body-bg)] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[800px] h-[400px] bg-cyan-400/5 rounded-full blur-[150px] opacity-20"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-[var(--nav-bg)] backdrop-blur-xl z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-white/10" style={{ background: 'linear-gradient(135deg, var(--accent-color, #06b6d4), var(--accent-soft, #0891b2))' }}>
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Mithra AI</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-cyan-400 transition-colors">Product</a>
                        <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <div className="h-4 w-px bg-white/10"></div>
                        <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Log in</button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-cyan-50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-semibold"
                        >
                            Get Mithra free
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 bg-[var(--surface-bg)] z-40 p-6 md:hidden border-t border-white/10"
                    >
                        <div className="flex flex-col gap-6 text-lg font-medium text-gray-300">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400">Product</a>
                            <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400">About</a>
                            <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400">GitHub</a>
                            <hr className="border-white/10" />
                            <div className="flex flex-col gap-4">
                                <button onClick={() => navigate('/auth')}>Log in</button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-4 py-3 rounded-lg text-center font-bold"
                                >
                                    Get Mithra free
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 text-center max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-xs font-medium text-cyan-300 uppercase tracking-widest">v2.0 Now Live</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                        <span className="block text-white">One workspace.</span>
                        <span className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">
                            Your entire life.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                        Mithra is the precision-engineered OS for high achievers.
                        <br className="hidden md:block" />
                        Tasks, habits, notes, and AI — synchronized in <span className="text-white font-medium">real-time</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2 group"
                        >
                            Start Using Mithra
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all font-medium text-lg text-white"
                        >
                            <Github className="w-5 h-5" />
                            Star on GitHub
                        </a>
                    </div>
                </motion.div>

                {/* Hero Image with Glow */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-cyan-800 rounded-2xl blur-lg opacity-30"></div>
                    <div className="relative rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-[var(--surface-bg)]">
                        <img
                            src="/assets/home_1.png"
                            alt="Mithra Dashboard"
                            className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-700"
                            loading="eager"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--body-bg)] via-transparent to-transparent opacity-60"></div>
                    </div>
                </motion.div>
            </header>

            {/* Social Proof */}
            <section className="border-y border-white/5 bg-white/[0.02] py-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by students & engineers at</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {['VIT-AP', 'DRDO', 'Google', 'Microsoft', 'Notion'].map((brand) => (
                            <span key={brand} className="text-xl font-bold font-mono text-white/80">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="mb-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
                        Precision Tools. <br />
                        Zero Friction.
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stop fighting with clunky software. Mithra is built for speed and flow.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all duration-500"
                        >
                            <div className="bg-[var(--surface-bg)] h-full rounded-xl p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <feature.icon className="w-24 h-24 text-white" />
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-black transition-colors duration-300">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-gray-400 mb-6">{feature.desc}</p>

                                <ul className="space-y-2 mb-8">
                                    {feature.details?.map((detail, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                                            <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>

                                <div className="rounded-lg overflow-hidden border border-white/10 aspect-video relative group-hover:border-cyan-500/30 transition-colors">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About the Creator - Detailed & Professional */}
            <section id="about" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Engineered by a Builder</h2>
                        <p className="text-gray-400 text-lg">"I built Mithra because I needed a tool that could keep up."</p>
                    </motion.div>

                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-sm hover:border-cyan-500/30 transition-colors duration-500">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 p-[2px] shadow-2xl shadow-cyan-500/20">
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-black relative group">
                                        <img src="/assets/hemasai.jpeg" alt="Hemasai Vattikuti" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-center gap-4">
                                    <a href="https://www.linkedin.com/in/hemsaivattikuti" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-[#0077b5] hover:text-white transition-all text-gray-400">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white hover:text-black transition-all text-gray-400">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.instagram.com/hemasai_chowdary/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-[#E4405F] hover:text-white transition-all text-gray-400">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Hemasai Vattikuti</h3>
                                    <p className="text-cyan-400 font-mono text-sm tracking-wide uppercase mb-4">Software Engineer & Data Scientist</p>
                                    <p className="text-gray-300 leading-relaxed text-lg">
                                        I’m a pre-final year <span className="text-white font-semibold">Computer Science</span> student at VIT-AP University, obsessed with building scalable systems and intuitive UIs.
                                        Mithra AI isn't just a project; it's the culmination of my experience in <span className="text-white font-semibold">backend engineering</span>, <span className="text-white font-semibold">machine learning</span>, and <span className="text-white font-semibold">product design</span>.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold">
                                            <Database className="w-4 h-4" />
                                            <span>Internship @ DRDO</span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Designed high-availability distributed database systems and optimized backend pipelines for critical defense applications (MongoDB Replica Sets).
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
                                            <Cpu className="w-4 h-4" />
                                            <span>ML & Algorithms</span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Certified in Advanced Learning Algorithms (Andrew Ng). Built "Newton's Playground," a 3D physics engine using React + WebGL.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'FastAPI', 'Supabase', 'Python', 'Machine Learning', 'System Design'].map((skill) => (
                                            <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
                        Get your life back. <br />
                        <span className="text-gray-500">For free. Forever.</span>
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/auth')}
                        className="px-12 py-5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] transition-all font-bold text-xl text-white inline-flex items-center gap-3"
                    >
                        Launch Mithra
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10 bg-[var(--body-bg)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <img src="/assets/logo.png" alt="Mithra" className="w-6 h-6 rounded grayscale hover:grayscale-0 transition-all" />
                        <span className="font-semibold text-sm">Mithra AI © 2026</span>
                    </div>

                    <div className="text-xs text-gray-500 font-mono">
                        System Status: <span className="text-green-500">Operational</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

```

## File: client/src/pages/Tasks.jsx

```
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Circle, CheckCircle2, Star, Trash2, Calendar as CalIcon,
  ChevronDown, ChevronRight, MoreVertical, X, Clock,
  ListTodo, SortAsc, Flag, Edit3, ArrowRight, FileText,
  User, Briefcase, Heart, Hash, BarChart3, Target, TrendingUp, Zap
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, startOfDay, addDays, subDays } from 'date-fns';
import { clsx } from 'clsx';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ClockPicker from '../components/ClockPicker';

/* ═══════════════════════════════════════════════════════════════
   PRIORITY CONFIG
   ═══════════════════════════════════════════════════════════════ */
const PRIORITY_CONFIG = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'High', icon: '!' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Med' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Low' },
};

const TASK_CATEGORIES = [
  { id: 'default', name: 'My Tasks', icon: ListTodo, color: 'var(--accent-color)' },
  { id: 'work', name: 'Work', icon: Briefcase, color: '#3b82f6' },
  { id: 'personal', name: 'Personal', icon: Heart, color: '#f97316' },
];

/* ═══════════════════════════════════════════════════════════════
   ADD TASK MODAL — Rich input form
   ═══════════════════════════════════════════════════════════════ */
const AddTaskModal = ({ isOpen, onClose, onSave, taskLists, initialCategory }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory && initialCategory !== 'all' ? initialCategory : 'default');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(''); setDescription('');
      setCategory(initialCategory && initialCategory !== 'all' ? initialCategory : 'default');
      setPriority('medium'); setDueDate('');
      setDueTime(''); setRecurrence('none'); setShowCatDropdown(false);
      // Slight delay to allow animation to start before potential keyboard shift
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [isOpen, initialCategory]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      details: description.trim(),
      listId: category,
      completed: false,
      starred: false,
      priority,
      dueDate: dueDate ? new Date(dueDate + 'T' + (dueTime || '00:00') + ':00') : null,
      recurrence,
      subtasks: [],
    });
    onClose();
  };

  const selectedCat = TASK_CATEGORIES.find(c => c.id === category) || TASK_CATEGORIES[0];
  const CatIcon = selectedCat.icon;

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xl sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: '100%', opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[85dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          marginBottom: 'env(safe-area-inset-bottom)',
          background: 'var(--body-bg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[var(--text-dim)] opacity-20" />
        </div>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5">
          <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'var(--accent-color)' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--accent-color)' }} />
            </div>
            Add New Task
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {/* Task Title */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Task Title</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="What needs to be done?"
              className="glass-input" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5 opacity-60">
              <FileText size={12} /> Description <span className="text-[var(--text-dim)] normal-case tracking-normal font-normal ml-1 opacity-40">(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Add details about this task..." rows={3}
              className="glass-input !text-sm resize-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Category</label>
            <button onClick={() => setShowCatDropdown(!showCatDropdown)}
              className="w-full glass-input !py-3 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <CatIcon size={16} style={{ color: selectedCat.color }} />
                <span className="text-[var(--text-primary)] opacity-80">{selectedCat.name}</span>
              </span>
              <ChevronDown size={16} className="text-[var(--text-dim)] opacity-30" />
            </button>
            <AnimatePresence>
              {showCatDropdown && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 glass-heavy rounded-xl overflow-hidden z-20 shadow-lg">
                  {TASK_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setCategory(cat.id); setShowCatDropdown(false); }}
                      className={clsx('w-full px-4 py-3 flex items-center gap-2.5 text-sm transition-all',
                        category === cat.id ? 'bg-[var(--glass-bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-dim)] opacity-50 hover:bg-[var(--glass-bg-hover)]')}>
                      <cat.icon size={16} style={{ color: cat.color }} />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-40">Priority</label>
            <div className="flex gap-2">
              {[
                { key: 'low', label: 'LOW', color: '#22c55e', bgActive: 'bg-green-500/15 border-green-500/40', bgInactive: 'border-green-500/20 text-green-400/40' },
                { key: 'medium', label: 'MEDIUM', color: '#f97316', bgActive: 'bg-orange-500/15 border-orange-500/40', bgInactive: 'border-orange-500/20 text-orange-400/40' },
                { key: 'high', label: 'HIGH', color: '#ef4444', bgActive: 'bg-red-500/15 border-red-500/40', bgInactive: 'border-red-500/20 text-red-400/40' },
              ].map(p => (
                <button key={p.key} onClick={() => setPriority(p.key)}
                  className={clsx('flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-all flex items-center justify-center gap-1.5',
                    priority === p.key ? p.bgActive : p.bgInactive)}>
                  <Flag size={13} style={{ color: p.color }} />
                  <span style={{ color: priority === p.key ? p.color : undefined }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5 opacity-40">
                <CalIcon size={12} /> Date <span className="text-[var(--text-dim)] normal-case tracking-normal font-normal ml-1 opacity-20">(optional)</span>
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="glass-input !py-2.5 !text-sm w-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-dim)' }}>
                <Clock size={12} /> Time <span className="normal-case tracking-normal font-normal ml-1" style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <ClockPicker value={dueTime} onChange={setDueTime} />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-40">Repeat</label>
            <div className="flex gap-2">
              {[
                { key: 'none', label: 'Once' },
                { key: 'daily', label: 'Daily' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
              ].map(r => (
                <button key={r.key} onClick={() => setRecurrence(r.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${recurrence === r.key
                    ? 'border-[var(--accent-color)]/40 bg-[var(--accent-glow)] text-[var(--accent-color)]'
                    : 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-30 hover:opacity-100 hover:border-[var(--glass-border-hover)]'
                    }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — always visible at bottom */}
        <div className="flex-shrink-0 p-5 flex justify-end gap-3 sticky bottom-0 bg-inherit backdrop-blur-xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[var(--text-dim)] text-sm hover:bg-[var(--glass-bg-hover)] transition-colors opacity-60">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-sm hover:shadow-[0_0_20px_var(--accent-glow)] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            Add Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DUE DATE FORMATTER
   ═══════════════════════════════════════════════════════════════ */
const formatDueDate = (date) => {
  if (!date) return null;
  if (isToday(date)) return { text: 'Today', class: 'text-[var(--accent-color)]' };
  if (isTomorrow(date)) return { text: 'Tomorrow', class: 'text-blue-400' };
  if (isPast(startOfDay(date))) return { text: format(date, 'MMM d'), class: 'text-red-400' };
  return { text: format(date, 'MMM d'), class: 'text-[var(--text-dim)] opacity-40' };
};

/* ═══════════════════════════════════════════════════════════════
   TASK DETAIL PANEL (Right side, Google Tasks style)
   ═══════════════════════════════════════════════════════════════ */
const TaskDetailPanel = ({ task, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [details, setDetails] = useState(task.details);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editingDate, setEditingDate] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(task.title);
    setDetails(task.details);
  }, [task]);

  const saveChanges = () => {
    onUpdate({ ...task, title, details });
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSub = { id: Date.now().toString(), title: subtaskInput.trim(), completed: false };
    onUpdate({ ...task, subtasks: [...task.subtasks, newSub] });
    setSubtaskInput('');
  };

  const toggleSubtask = (subId) => {
    onUpdate({
      ...task,
      subtasks: task.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    });
  };

  const deleteSubtask = (subId) => {
    onUpdate({ ...task, subtasks: task.subtasks.filter(s => s.id !== subId) });
  };

  const cyclePriority = () => {
    const order = ['low', 'medium', 'high'];
    const idx = order.indexOf(task.priority);
    onUpdate({ ...task, priority: order[(idx + 1) % 3] });
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      onUpdate({ ...task, dueDate: new Date(val + 'T00:00:00') });
    } else {
      onUpdate({ ...task, dueDate: null });
    }
    setEditingDate(false);
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[380px] flex-shrink-0 flex flex-col h-full shadow-2xl"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)] transition-colors"><X size={20} /></button>
        <div className="flex gap-1">
          <button onClick={cyclePriority}
            className={clsx('p-2 rounded-lg hover:bg-white/10 transition-colors', PRIORITY_CONFIG[task.priority].color)}
            title="Cycle priority">
            <Flag size={18} />
          </button>
          <button onClick={() => onUpdate({ ...task, starred: !task.starred })}
            className={clsx('p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors', task.starred ? 'text-yellow-400' : 'text-[var(--text-dim)] opacity-50')}>
            <Star size={18} fill={task.starred ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => { onDelete(task.id); onClose(); }}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title (editable) */}
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveChanges}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="w-full bg-transparent text-lg font-medium text-[var(--text-primary)] border-none outline-none placeholder:text-[var(--text-dim)]"
          placeholder="Task title"
        />

        {/* Details */}
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onBlur={saveChanges}
          placeholder="Add details"
          rows={3}
          className="glass-input !text-sm !text-[var(--text-dim)] resize-none"
        />

        {/* Due Date — clickable with mini date picker */}
        <div className="flex items-center gap-3 text-sm">
          <CalIcon size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
          {editingDate ? (
            <input
              type="date"
              autoFocus
              defaultValue={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              onBlur={() => setEditingDate(false)}
              className="glass-input !py-1.5 !px-3 !w-auto !text-sm"
            />
          ) : (
            <button
              onClick={() => setEditingDate(true)}
              className="text-left hover:bg-[var(--glass-bg-hover)] px-2 py-1 rounded-lg transition-colors"
            >
              {task.dueDate ? (
                <span className={formatDueDate(task.dueDate)?.class}>{formatDueDate(task.dueDate)?.text}</span>
              ) : (
                <span className="text-[var(--text-dim)] opacity-30">Add date</span>
              )}
            </button>
          )}
        </div>

        {/* Priority Badge */}
        <button onClick={cyclePriority} className="flex items-center gap-3 text-sm hover:bg-[var(--glass-bg-hover)] -mx-2 px-2 py-1 rounded-lg transition-colors">
          <Flag size={16} className="text-[var(--text-dim)] opacity-40" />
          <span className={clsx('px-3 py-1 rounded-full text-xs font-medium', PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].color)}>
            {PRIORITY_CONFIG[task.priority].label} Priority
          </span>
        </button>

        {/* Subtasks */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold opacity-60">Subtasks</h4>
          <AnimatePresence>
            {task.subtasks.map(sub => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 group py-1"
              >
                <button onClick={() => toggleSubtask(sub.id)} className="flex-shrink-0">
                  {sub.completed ? (
                    <CheckCircle2 size={18} className="text-[var(--accent-color)]" />
                  ) : (
                    <Circle size={18} className="text-[var(--text-dim)] opacity-35 hover:text-[var(--accent-color)] transition-colors" />
                  )}
                </button>
                <span className={clsx('flex-1 text-sm', sub.completed ? 'line-through text-[var(--text-dim)] opacity-30' : 'text-[var(--text-primary)] opacity-80')}>
                  {sub.title}
                </span>
                <button onClick={() => deleteSubtask(sub.id)}
                  className="p-1 rounded hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all">
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Subtask */}
          <div className="flex items-center gap-3">
            <Plus size={18} className="text-[var(--text-dim)] opacity-35 flex-shrink-0" />
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              placeholder="Add subtask"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] border-none outline-none opacity-60"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TASK ITEM ROW
   ═══════════════════════════════════════════════════════════════ */
const TaskItem = ({ task, onToggle, onStar, onSelect, onDelete, isSelected }) => {
  const due = formatDueDate(task.dueDate);
  const subtasksDone = task.subtasks.filter(s => s.completed).length;
  const subtasksTotal = task.subtasks.length;
  const listColor = TASK_CATEGORIES.find(c => c.id === task.listId)?.color || 'var(--accent-color)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      onClick={() => onSelect(task)}
      className={clsx(
        'flex items-start gap-3.5 px-4 py-3.5 cursor-pointer group transition-all rounded-lg mb-1',
        isSelected
          ? 'bg-[var(--accent-glow)] shadow-sm'
          : 'hover:bg-[var(--glass-bg-hover)]',
        task.completed && 'opacity-45'
      )}
      style={{
        borderLeft: `3px solid ${task.completed ? `color-mix(in srgb, ${listColor}, transparent 80%)` : `color-mix(in srgb, ${listColor}, transparent 60%)`}`,
        background: isSelected
          ? `color-mix(in srgb, ${listColor}, transparent 92%)`
          : task.priority === 'high'
            ? 'rgba(239,68,68,0.06)'
            : task.priority === 'medium'
              ? 'rgba(245,158,11,0.04)'
              : task.priority === 'low'
                ? 'rgba(34,197,94,0.04)'
                : undefined,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className="flex-shrink-0 mt-0.5"
      >
        {task.completed ? (
          <CheckCircle2 size={20} className="text-[var(--accent-color)]" />
        ) : (
          <Circle size={20} className={clsx(
            'transition-colors',
            task.priority === 'high' ? 'text-red-400/60 hover:text-[var(--accent-color)]' :
              task.priority === 'medium' ? 'text-yellow-400/40 hover:text-[var(--accent-color)]' :
                'text-[var(--text-dim)] opacity-20 hover:text-[var(--accent-color)]'
          )} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={clsx(
          'text-[14px] leading-snug transition-all',
          task.completed ? 'line-through text-[var(--text-dim)] opacity-30' : 'text-[var(--text-primary)] opacity-90 group-hover:opacity-100'
        )}>
          {task.title}
        </div>
        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
          {due && (
            <span className={clsx('text-[11px] flex items-center gap-1', due.class)}>
              <CalIcon size={11} /> {due.text}
            </span>
          )}
          {task.priority === 'high' && (
            <span className="text-[11px] text-red-400/80 flex items-center gap-0.5">
              <Flag size={11} />
            </span>
          )}
          {subtasksTotal > 0 && (
            <span className="text-[12px] text-[var(--text-dim)] opacity-45">
              {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {task.details && !task.completed && (
            <span className="text-[12px] text-[var(--text-dim)] opacity-35 truncate max-w-[140px]">{task.details}</span>
          )}
        </div>
      </div>

      {/* Action Buttons — always visible */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(task); }}
          className="p-1.5 rounded-lg text-[var(--text-dim)] opacity-50 hover:opacity-100 hover:bg-[var(--glass-bg-hover)] transition-all"
          title="Edit"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
          className="p-1.5 rounded-lg transition-all"
        >
          <Star size={16} className={task.starred ? 'text-yellow-400 fill-yellow-400' : 'text-[var(--text-dim)] opacity-40 hover:text-yellow-400/70'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN TASKS PAGE  — Google Tasks layout
   ═══════════════════════════════════════════════════════════════ */
export default function MithraTasks() {
  const { tasks, taskLists, addTask, updateTask, deleteTask, toggleTask, starTask, theme, accentColor } = useData();
  const isLight = theme === 'light';
  const { addToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // task ID pending delete
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState(null); // 'overdue' | 'high' | 'pending' | null

  // ── Task Analytics ──
  const analytics = useMemo(() => {
    const now = new Date();
    const totalTasks = tasks?.length || 0;
    const completedCount = tasks?.filter(t => t.completed).length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const overdue = tasks?.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length || 0;
    const highP = tasks?.filter(t => t.priority === 'high' && !t.completed).length || 0;
    const medP = tasks?.filter(t => t.priority === 'medium' && !t.completed).length || 0;
    const lowP = tasks?.filter(t => t.priority === 'low' && !t.completed).length || 0;

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = tasks?.filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length || 0;
      weeklyTrend.push({ label: format(d, 'EEE'), value: count });
    }

    // Category breakdown
    const categories = {};
    tasks?.forEach(t => {
      const cat = t.listId || 'default';
      if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
      categories[cat].total++;
      if (t.completed) categories[cat].done++;
    });

    return { totalTasks, completedCount, completionRate, overdue, highP, medP, lowP, weeklyTrend, categories };
  }, [tasks]);

  // Filter & Sort — show ALL tasks, with optional list filter + analytics filter
  const filteredTasks = useMemo(() => {
    let result = activeFilter === 'all' ? tasks : tasks.filter(t => t.listId === activeFilter);
    if (analyticsFilter === 'overdue') {
      const now = new Date();
      result = result.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
    } else if (analyticsFilter === 'high') {
      result = result.filter(t => t.priority === 'high' && !t.completed);
    } else if (analyticsFilter === 'pending') {
      result = result.filter(t => !t.completed);
    }
    return result;
  }, [tasks, activeFilter, analyticsFilter]);
  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      if (sortBy === 'date') {
        const ad = a.dueDate ? a.dueDate.getTime() : Infinity;
        const bd = b.dueDate ? b.dueDate.getTime() : Infinity;
        return ad - bd;
      }
      if (sortBy === 'priority') {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  };

  const sortedActive = sortTasks(activeTasks);
  const sortedCompleted = sortTasks(completedTasks);

  const handleToggle = useCallback((id) => {
    toggleTask(id);
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  }, [toggleTask, selectedTask]);

  const handleAdd = (taskData) => {
    addTask(taskData);
  };

  const handleUpdate = useCallback((updated) => {
    updateTask(updated);
    setSelectedTask(updated);
  }, [updateTask]);

  const handleDelete = useCallback((id) => {
    setDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      const taskToDelete = tasks.find(t => t.id === deleteConfirm);
      deleteTask(deleteConfirm);
      if (selectedTask?.id === deleteConfirm) setSelectedTask(null);
      setDeleteConfirm(null);
      // Undo toast
      if (taskToDelete) {
        addToast({
          message: `"${taskToDelete.title}" deleted`,
          type: 'success',
          duration: 5000,
          undoAction: () => addTask(taskToDelete),
        });
      }
    }
  }, [deleteTask, selectedTask, deleteConfirm, tasks, addTask, addToast]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Keep detail panel in sync
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTask)) {
        setSelectedTask(updated);
      }
    }
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-100px)] flex flex-col md:flex-row rounded-2xl overflow-hidden glass-heavy"
    >
      {/* ── MAIN TASK LIST ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with filter chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
            <h2 className="text-lg sm:text-xl font-medium tracking-tight text-[var(--text-primary)] flex-shrink-0">Tasks</h2>
            {/* Filter chips */}
            <div className="flex gap-1.5 ml-2 sm:ml-4">
              <button
                onClick={() => { setActiveFilter('all'); setSelectedTask(null); }}
                className={clsx(
                  'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap',
                  activeFilter === 'all'
                    ? 'border-[var(--accent-color)]/30 bg-[var(--accent-glow)] text-[var(--accent-color)]'
                    : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)]'
                )}
              >
                All
              </button>
              {taskLists.map(list => {
                const count = tasks.filter(t => t.listId === list.id && !t.completed).length;
                return (
                  <button
                    key={list.id}
                    onClick={() => { setActiveFilter(list.id); setSelectedTask(null); }}
                    className={clsx(
                      'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap',
                      activeFilter === list.id
                        ? 'bg-[var(--glass-bg-hover)] text-[var(--text-primary)] font-semibold'
                        : 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-60 hover:opacity-100'
                    )}
                    style={activeFilter === list.id ? { borderColor: `color-mix(in srgb, ${list.color}, transparent 50%)` } : {}}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    {list.name}
                    {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalytics(p => !p)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border transition-all uppercase tracking-wider font-medium',
                showAnalytics
                  ? 'border-[var(--accent-color)]/30 bg-[var(--accent-glow)]'
                  : 'border-[var(--accent-color)]/15 bg-[var(--accent-glow)] hover:bg-[var(--accent-glow)] hover:border-[var(--accent-color)]/25'
              )}
            >
              <BarChart3 size={13} />
              Analytics
            </button>
            <button
              onClick={() => setSortBy(s => s === 'date' ? 'priority' : s === 'priority' ? 'name' : 'date')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-[var(--text-dim)] opacity-40 hover:opacity-100 hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] transition-colors uppercase tracking-wider font-medium"
            >
              <SortAsc size={13} />
              {sortBy}
            </button>
          </div>
        </div>

        {/* Add Task Button — opens rich modal */}
        <div className="px-5 py-3 flex-shrink-0 flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/25 text-[var(--accent-color)] text-sm font-medium hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/40 transition-all">
            <Plus size={16} /> New Task
          </button>
        </div>

        {/* ── ANALYTICS PANEL ── */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Completion Rate + Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl p-3 border border-[var(--glass-border)] cursor-default" style={{ background: 'var(--glass-bg)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <TrendingUp size={12} className="text-accent-visor" />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Completion</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.completionRate}%</span>
                    <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-dim)' }}>{analytics.completedCount}/{analytics.totalTasks}</span>
                  </div>
                  <div onClick={() => setAnalyticsFilter(f => f === 'overdue' ? null : 'overdue')}
                    className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'overdue' ? 'ring-1 ring-red-400/50' : '')}
                    style={{ background: analytics.overdue > 0 ? 'rgba(239,68,68,0.06)' : 'var(--glass-bg)', borderColor: analyticsFilter === 'overdue' ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock size={12} className={analytics.overdue > 0 ? 'text-red-400' : 'text-accent-visor'} />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Overdue</span>
                    </div>
                    <span className={clsx('text-xl font-bold', analytics.overdue > 0 ? 'text-red-400' : '')} style={analytics.overdue === 0 ? { color: 'var(--text-primary)' } : {}}>{analytics.overdue}</span>
                  </div>
                  <div onClick={() => setAnalyticsFilter(f => f === 'high' ? null : 'high')}
                    className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'high' ? 'ring-1 ring-red-400/50' : '')}
                    style={{ background: 'var(--glass-bg)', borderColor: analyticsFilter === 'high' ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Flag size={12} className="text-red-400" />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>High</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.highP}</span>
                  </div>
                  <div onClick={() => setAnalyticsFilter(f => f === 'pending' ? null : 'pending')}
                    className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'pending' ? 'ring-1 ring-accent-visor/50' : '')}
                    style={{ background: 'var(--glass-bg)', borderColor: analyticsFilter === 'pending' ? 'var(--accent-color)' : 'var(--glass-border)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap size={12} className="text-accent-visor" />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Pending</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.totalTasks - analytics.completedCount}</span>
                  </div>
                </div>

                {/* Weekly Bar Chart + Priority Breakdown side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weekly Trend */}
                  <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-1.5 mb-3">
                      <BarChart3 size={12} className="text-accent-visor" />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>This Week</span>
                    </div>
                    <div className="flex items-end gap-1 justify-between h-14">
                      {analytics.weeklyTrend.map((d, i) => {
                        const maxVal = Math.max(...analytics.weeklyTrend.map(x => x.value), 1);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max((d.value / maxVal) * 100, 6)}%` }}
                              transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              className="w-full max-w-[10px] rounded-t-sm"
                              style={{ background: 'var(--accent-color)', opacity: d.value > 0 ? 1 : 0.15, minHeight: 2 }}
                            />
                            <span className="text-[8px]" style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}>{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-right mt-2" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>
                      {analytics.weeklyTrend.reduce((s, d) => s + d.value, 0)} completed
                    </div>
                  </div>

                  {/* Priority Breakdown */}
                  <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Target size={12} className="text-accent-visor" />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Priority Breakdown</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'High', count: analytics.highP, color: '#ef4444', total: analytics.totalTasks },
                        { label: 'Medium', count: analytics.medP, color: '#f59e0b', total: analytics.totalTasks },
                        { label: 'Low', count: analytics.lowP, color: '#22c55e', total: analytics.totalTasks },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-[11px] flex-1" style={{ color: isLight ? 'rgba(26,26,26,0.5)' : 'rgba(242,235,227,0.5)' }}>{item.label}</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
                          <div className="w-16 h-1.5 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                              transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full"
                              style={{ background: item.color, minWidth: item.count > 0 ? 3 : 0 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {analytics.overdue > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
                        <span className="text-[11px] flex-1 text-red-400">Overdue</span>
                        <span className="text-xs font-bold text-red-400">{analytics.overdue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category completion bars */}
                {Object.keys(analytics.categories).length > 0 && (
                  <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>By Category</span>
                    <div className="space-y-2 mt-3">
                      {Object.entries(analytics.categories).map(([cat, data]) => {
                        const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
                        const catObj = TASK_CATEGORIES.find(c => c.id === cat);
                        const catName = catObj?.name || cat;
                        const catColor = catObj?.color || '#C2185B';
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px]" style={{ color: catColor }}>{catName}</span>
                              <span className="text-[10px]" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>{data.done}/{data.total} ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{ background: catColor, minWidth: data.done > 0 ? 3 : 0 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Banner */}
        {analyticsFilter && (
          <div className="flex items-center justify-between px-5 py-2 border-b" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)', background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              Showing: <span className="text-accent-visor capitalize">{analyticsFilter}</span> ({filteredTasks.length} tasks)
            </span>
            <button onClick={() => setAnalyticsFilter(null)} className="text-xs text-accent-visor hover:underline">Clear filter</button>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {sortedActive.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onStar={starTask}
                onSelect={setSelectedTask}
                onDelete={handleDelete}
                isSelected={selectedTask?.id === task.id}
              />
            ))}
          </AnimatePresence>

          {sortedActive.length === 0 && (
            <div className="text-center py-20">
              <ListTodo size={40} className="text-white/[0.06] mx-auto mb-4" />
              <p className="text-white/25 text-sm font-medium">No tasks yet</p>
              <p className="text-white/15 text-xs mt-1">Add one above to get started</p>
            </div>
          )}

          {/* Completed Section */}
          {sortedCompleted.length > 0 && (
            <div className="border-t border-[#F2EBE3]/5">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 px-5 py-3 text-[13px] text-white/30 hover:text-white/50 transition-colors w-full"
              >
                <motion.div animate={{ rotate: showCompleted ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={16} />
                </motion.div>
                Completed ({sortedCompleted.length})
              </button>
              <AnimatePresence>
                {showCompleted && sortedCompleted.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onStar={starTask}
                    onSelect={setSelectedTask}
                    onDelete={handleDelete}
                    isSelected={selectedTask?.id === task.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailPanel
            key={selectedTask.id}
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Remove This Task?"
        message={`"${tasks.find(t => t.id === deleteConfirm)?.title || 'this task'}" will be permanently removed. Don't worry — you can undo this right after.`}
        confirmLabel="Yes, Remove It"
        cancelLabel="No, Keep It"
        variant="danger"
      />

      {/* ── ADD TASK MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAdd} taskLists={taskLists} initialCategory={activeFilter} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

```

## File: client/src/pages/AuthPage.jsx

```
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ChevronLeft, Check, AlertCircle, Loader2, Sparkles, Shield, Zap, Calendar, Heart, Brain, Bot, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════
   MITHRA AUTH — Premium Dark/Cyan Aesthetic
   ═══════════════════════════════════════════════════════════════ */

const heroParticles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 25 + 10,
  delay: Math.random() * 8,
}));

/* ── Floating Input ── */
const FloatingInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, error, autoFocus }) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative group">
      <div className={`relative flex items-center rounded-2xl transition-all duration-500 ${error ? 'ring-2 ring-red-500/50' : focused ? 'ring-2' : 'ring-1 border border-[var(--glass-border)]'
        }`}
        style={{
          background: focused ? 'var(--accent-glow)' : 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="pl-4 pr-2 py-4">
          <Icon size={18} className="transition-colors duration-300" style={{ color: focused ? 'var(--accent-color)' : 'var(--text-dim)' }} />
        </div>
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          autoComplete={isPassword ? 'current-password' : type === 'email' ? 'email' : 'off'}
          className="flex-1 bg-transparent py-4 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)]/40 outline-none font-medium"
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
            className="pr-4 text-[var(--text-dim)]/40 hover:text-[var(--text-dim)] transition-colors">
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <motion.div
        className="absolute bottom-0 left-1/2 h-[2px] rounded-full -translate-x-1/2"
        animate={{ width: focused ? '60%' : '0%', opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-red-400 mt-2 pl-1 font-medium">
          <AlertCircle size={12} /> {error}
        </motion.p>
      )}
    </div>
  );
};

/* ── Password Strength Meter ── */
const PasswordStrength = ({ password }) => {
  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (pw.length >= 12) s++;
    return s;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', 'var(--accent-color)'];
  if (!password) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 px-1">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <p className="text-[10px] font-medium tracking-wide" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </motion.div>
  );
};

/* ── Feature Cards for Hero Panel ── */
const features = [
  { icon: Brain, title: 'Your AI Life Companion', desc: 'Mithra learns your patterns and helps you plan smarter every day' },
  { icon: Calendar, title: 'Unified Dashboard', desc: 'Tasks, habits, journal & calendar — all in one beautiful view' },
  { icon: Flame, title: 'Build Streaks & Habits', desc: 'Track consistency with GitHub-style maps & never break your streak' },
  { icon: Zap, title: 'Dost Focus Mode', desc: 'AI-powered deep work sessions with your personal focus companion' },
];

export default function AuthPage({ isPasswordReset = false }) {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, confirmResetPassword, signInWithGoogle } = useAuth();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Check for password recovery session on mount
  React.useEffect(() => {
    const isRecovery = sessionStorage.getItem('mithra-password-recovery');
    const recoveryEmail = sessionStorage.getItem('mithra-recovery-email');
    if (isPasswordReset || isRecovery) {
      setView('resetNew');
      if (recoveryEmail) {
        setEmail(recoveryEmail);
      }
      // Clear the flags
      sessionStorage.removeItem('mithra-password-recovery');
      sessionStorage.removeItem('mithra-recovery-email');
    }
  }, [isPasswordReset]);

  const clearForm = () => {
    setFullName(''); setEmail(''); setPassword(''); setConfirmPw('');
    setNewPassword(''); setConfirmNewPw('');
    setFieldErrors({}); setGlobalError(''); setAgreeTerms(false);
  };
  const switchView = (v) => { clearForm(); setView(v); };

  const validate = () => {
    const errs = {};
    if (view === 'signup' && !fullName.trim()) errs.fullName = 'Full name is required';
    if (view !== 'resetNew' && !email.trim()) errs.email = 'Email is required';
    else if (view !== 'resetNew' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (view !== 'forgot' && view !== 'resetSent' && view !== 'resetNew') {
      if (!password) errs.password = 'Password is required';
      else if (password.length < 6) errs.password = 'Min 6 characters';
    }
    if (view === 'signup') {
      if (password !== confirmPw) errs.confirmPw = 'Passwords do not match';
      if (!agreeTerms) errs.terms = 'You must agree to continue';
    }
    if (view === 'resetNew') {
      if (!newPassword) errs.newPassword = 'New password is required';
      else if (newPassword.length < 6) errs.newPassword = 'Min 6 characters';
      if (newPassword !== confirmNewPw) errs.confirmNewPw = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to convert Supabase error messages to user-friendly messages
  const getReadableError = (message) => {
    const errorMap = {
      'Invalid login credentials': 'Email or password is incorrect',
      'Email not confirmed': 'Please verify your email first. Check inbox & spam folder for the confirmation link.',
      'User already registered': 'An account with this email already exists. Try signing in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'Unable to validate email address': 'Please enter a valid email address',
      'Token has expired': 'Your session has expired. Please sign in again.',
      'invalid_grant': 'Your session has expired. Please sign in again.',
      'Refresh Token Not Found': 'Your session has expired. Please sign in again.',
      'JWT expired': 'Your session has expired. Please sign in again.',
      'Database error saving new user': 'Account created successfully! Please sign in now.',
      'Database error': 'Account created! Please try signing in.',
      'rate limit exceeded': 'Too many attempts. Please wait a few minutes and try again.',
      'email rate limit exceeded': 'Email limit reached. Please wait 5 minutes or try a different email address.',
      'over_email_send_rate_limit': 'Email limit reached. Please wait 5 minutes and try again.',
      'Auth session missing': 'Password reset link expired. Please request a new one.',
      'session missing': 'Your session expired. Please sign in again.',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (message?.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return message || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setGlobalError('');
    try {
      if (view === 'login') {
        await signIn({ email, password });
        navigate('/dashboard');
      } else if (view === 'signup') {
        await signUp({ fullName, email, password });
        navigate('/dashboard');
      } else if (view === 'forgot') {
        await resetPassword(email);
        setView('resetSent');
      } else if (view === 'resetNew') {
        const resetEmail = localStorage.getItem('mithra-reset-email') || email;
        await confirmResetPassword(resetEmail, newPassword);
        setView('resetSuccess');
      }
    } catch (err) {
      setGlobalError(getReadableError(err.message));
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGlobalError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setGlobalError(getReadableError(err.message));
    } finally {
      setGoogleLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };
  const direction = view === 'signup' ? 1 : view === 'forgot' ? 1 : -1;

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden" style={{ background: 'var(--body-bg)' }}>

      {/* ══════════ LEFT PANEL — Hero / Branding (desktop only) ══════════ */}
      <div className="hidden lg:flex w-[52%] relative flex-col items-center justify-center p-12 overflow-hidden bg-[var(--body-bg)]">
        {/* Mesh gradient background */}
        <div className="absolute inset-0">
          <motion.div className="absolute w-[800px] h-[800px] rounded-full blur-[250px]"
            style={{ background: '#22d3ee', opacity: 0.12, top: '-30%', left: '-20%' }}
            animate={{ x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-[200px]"
            style={{ background: '#3b82f6', opacity: 0.08, bottom: '-20%', right: '-10%' }}
            animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} />
          {heroParticles.map(p => (
            <motion.div key={p.id} className="absolute rounded-full"
              style={{
                width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`,
                background: p.id % 3 === 0 ? '#22d3ee' : 'rgba(255,255,255,0.12)'
              }}
              animate={{ y: [0, -80, 0], opacity: [0.08, 0.5, 0.08] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-lg text-center">
          <motion.div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 relative"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              boxShadow: '0 20px 60px rgba(34,211,238,0.3)'
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Sparkles className="w-11 h-11 text-white" />
            <div className="absolute inset-0 rounded-3xl border border-white/10" />
            <motion.div className="absolute -inset-1 rounded-[28px]"
              style={{ border: '1px solid rgba(34,211,238,0.5)' }}
              animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity }} />
          </motion.div>

          <motion.h1 className="text-5xl font-bold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}>Mithra</motion.h1>
          <motion.p className="text-lg text-white/50 font-light mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}>Your AI-Powered Life Operating System</motion.p>
          <motion.div className="w-16 h-[2px] mx-auto rounded-full mb-10"
            style={{ backgroundColor: 'var(--accent-color)' }}
            initial={{ width: 0 }} animate={{ width: 64 }}
            transition={{ delay: 0.5, duration: 0.6 }} />

          {/* Visuals only - text removed per user request */}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — Auth Forms ══════════ */}
      <div className="flex-1 flex items-center justify-center relative p-6 lg:p-12">
        <div className="absolute inset-0">
          <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-[200px]"
            style={{ background: '#0e7490', opacity: 0.1, top: '20%', right: '-20%' }}
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="absolute inset-0 opacity-[0.01]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="hidden lg:block absolute left-0 top-[15%] bottom-[15%] w-px"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)' }} />

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <motion.div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                boxShadow: '0 8px 32px rgba(34,211,238,0.3)'
              }}>
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mithra</h1>
            <p className="text-xs text-white/30 mt-1">AI Life Operating System</p>
          </div>

          {/* Glass card */}
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(40px) saturate(1.4)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 0 80px rgba(0,0,0,0.5), inset 0 1px 0 var(--glass-border)'
            }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full bg-[var(--accent-color)] opacity-50" />

            <div className="p-8 pt-10 pb-10">
              {/* Header */}
              <div className="text-center mb-8">
                <AnimatePresence mode="wait">
                  <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                      {view === 'login' && 'Welcome back'}
                      {view === 'signup' && 'Create account'}
                      {view === 'forgot' && 'Reset password'}
                      {view === 'resetSent' && 'Verify your account'}
                      {view === 'resetNew' && 'Set new password'}
                      {view === 'resetSuccess' && 'Password updated!'}
                    </h2>
                    <p className="text-sm text-[var(--text-dim)] mt-1.5 opacity-60">
                      {view === 'login' && 'Sign in to your Mithra workspace'}
                      {view === 'signup' && 'Start your journey with Mithra'}
                      {view === 'forgot' && "Enter your email to verify your account"}
                      {view === 'resetSent' && 'Account verified — set your new password'}
                      {view === 'resetNew' && 'Choose a strong password for your account'}
                      {view === 'resetSuccess' && 'You can now sign in with your new password'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Global Error */}
              <AnimatePresence>
                {globalError && (
                  <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    {globalError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forms */}
              <AnimatePresence mode="wait" custom={direction}>
                {/* LOGIN */}
                {view === 'login' && (
                  <motion.form key="login" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput icon={Mail} type="email" placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)} error={fieldErrors.email} autoFocus />
                    <FloatingInput icon={Lock} type="password" placeholder="Password"
                      value={password} onChange={e => setPassword(e.target.value)} error={fieldErrors.password} />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => switchView('forgot')}
                        className="text-xs font-medium transition-colors hover:underline underline-offset-4 text-[var(--accent-color)]">Forgot password?</button>
                    </div>
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-color), var(--accent-soft))',
                        boxShadow: '0 4px 24px var(--accent-glow)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px var(--accent-glow)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
                      </span>
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <span className="text-[11px] text-white/30 uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    {/* Google Sign In */}
                    <motion.button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                      className="w-full py-3.5 rounded-2xl text-[var(--text-primary)] font-medium text-sm relative overflow-hidden group disabled:opacity-60 flex items-center justify-center gap-3"
                      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                      whileHover={{ scale: 1.01, background: 'var(--glass-bg-hover)' }}
                      whileTap={{ scale: 0.98 }}>
                      {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-sm text-[var(--text-dim)] pt-2 opacity-60">
                      Don't have an account?{' '}
                      <button type="button" onClick={() => switchView('signup')}
                        className="font-semibold transition-colors hover:underline underline-offset-4 text-[var(--accent-color)]">Sign up</button>
                    </p>
                  </motion.form>
                )}

                {/* SIGN UP */}
                {view === 'signup' && (
                  <motion.form key="signup" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput icon={User} type="text" placeholder="Full name"
                      value={fullName} onChange={e => setFullName(e.target.value)} error={fieldErrors.fullName} autoFocus />
                    <FloatingInput icon={Mail} type="email" placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)} error={fieldErrors.email} />
                    <div>
                      <FloatingInput icon={Lock} type="password" placeholder="Create password"
                        value={password} onChange={e => setPassword(e.target.value)} error={fieldErrors.password} />
                      <PasswordStrength password={password} />
                    </div>
                    <FloatingInput icon={Lock} type="password" placeholder="Confirm password"
                      value={confirmPw} onChange={e => setConfirmPw(e.target.value)} error={fieldErrors.confirmPw} />
                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                      <button type="button" onClick={() => setAgreeTerms(!agreeTerms)}
                        className="w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-all font-bold"
                        style={{
                          borderColor: fieldErrors.terms ? 'rgba(239,68,68,0.5)' : agreeTerms ? 'var(--accent-color)' : 'var(--glass-border)',
                          background: agreeTerms ? 'var(--accent-color)' : 'transparent',
                          color: '#fff'
                        }}>
                        {agreeTerms && <Check size={12} strokeWidth={4} />}
                      </button>
                      <span className="text-xs text-[var(--text-dim)] leading-relaxed opacity-60">
                        I agree to the <span className="cursor-pointer hover:underline text-[var(--accent-color)]">Terms of Service</span> and{' '}
                        <span className="cursor-pointer hover:underline text-[var(--accent-color)]">Privacy Policy</span>
                      </span>
                    </label>
                    {fieldErrors.terms && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 pl-1">
                        <AlertCircle size={12} /> {fieldErrors.terms}
                      </p>
                    )}
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
                      </span>
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <span className="text-[11px] text-white/30 uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    {/* Google Sign Up */}
                    <motion.button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                      className="w-full py-3.5 rounded-2xl text-white/80 font-medium text-sm relative overflow-hidden group disabled:opacity-60 flex items-center justify-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.07)' }}
                      whileTap={{ scale: 0.98 }}>
                      {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-sm text-[var(--text-dim)] pt-2 opacity-60">
                      Already have an account?{' '}
                      <button type="button" onClick={() => switchView('login')}
                        className="font-semibold transition-colors hover:underline underline-offset-4 text-[var(--accent-color)]">Sign in</button>
                    </p>
                  </motion.form>
                )}

                {/* FORGOT PASSWORD */}
                {view === 'forgot' && (
                  <motion.form key="forgot" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-white/40 mb-2">
                      Enter the email address associated with your account and we'll send you a link to reset your password.
                    </p>
                    <FloatingInput icon={Mail} type="email" placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)} error={fieldErrors.email} autoFocus />
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <Mail size={16} /></>}
                      </span>
                    </motion.button>
                    <button type="button" onClick={() => switchView('login')}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mx-auto pt-2">
                      <ChevronLeft size={16} /> Back to sign in
                    </button>
                  </motion.form>
                )}

                {/* RESET SENT → Set New Password */}
                {view === 'resetSent' && (
                  <motion.div key="resetSent" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center space-y-5 py-4">
                    <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}>
                      <Check size={28} className="text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-white/70 text-sm">Account verified for</p>
                      <p className="text-white font-semibold mt-1">{email}</p>
                    </div>
                    <motion.button type="button" onClick={() => setView('resetNew')}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        Set New Password <ArrowRight size={16} />
                      </span>
                    </motion.button>
                    <button type="button" onClick={() => switchView('login')}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mx-auto pt-2">
                      <ChevronLeft size={16} /> Back to sign in
                    </button>
                  </motion.div>
                )}

                {/* RESET NEW PASSWORD FORM */}
                {view === 'resetNew' && (
                  <motion.form key="resetNew" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-white/40 mb-2">
                      Create a new password for <span className="text-white font-medium">{email || localStorage.getItem('mithra-reset-email')}</span>
                    </p>
                    <div>
                      <FloatingInput icon={Lock} type="password" placeholder="New password"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)} error={fieldErrors.newPassword} autoFocus />
                      <PasswordStrength password={newPassword} />
                    </div>
                    <FloatingInput icon={Lock} type="password" placeholder="Confirm new password"
                      value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} error={fieldErrors.confirmNewPw} />
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Update Password <Shield size={16} /></>}
                      </span>
                    </motion.button>
                    <button type="button" onClick={() => switchView('login')}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mx-auto pt-2">
                      <ChevronLeft size={16} /> Back to sign in
                    </button>
                  </motion.form>
                )}

                {/* RESET SUCCESS */}
                {view === 'resetSuccess' && (
                  <motion.div key="resetSuccess" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center space-y-5 py-4">
                    <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}>
                      <Check size={28} className="text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-white font-semibold text-lg">Password Updated Successfully!</p>
                      <p className="text-white/50 text-sm mt-2">You can now sign in with your new password.</p>
                    </div>
                    <motion.button type="button" onClick={() => switchView('login')}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        Go to Sign In <ArrowRight size={16} />
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Footer — Developed by */}
          <div className="lg:hidden text-center mt-8 space-y-4">
            <div className="flex items-center justify-center gap-4 text-xs text-white/40">
              <a href="#/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <a href="#/terms" className="hover:text-white/70 transition-colors">Terms of Service</a>
            </div>
            <p className="text-[11px] text-white/40 tracking-wide">
              Developed by <span className="text-white/60 font-medium">Hemasai Vattikuti</span>
            </p>
          </div>

          {/* Desktop Footer Links (Absolute bottom of right panel) */}
          <div className="hidden lg:flex absolute bottom-6 w-full justify-center gap-6 text-xs text-white/20">
            <a href="#/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="#/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

```

## File: client/src/pages/DostMode.jsx

```
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Trash2, Calendar, Wifi, WifiOff,
  Plus, Edit3, CheckCircle2, Circle, Flame, FileText,
  Upload, AlertTriangle, Clock, BarChart3, Sparkles,
  X, FileSpreadsheet, Image as ImageIcon
} from 'lucide-react';
import { useData, getUserScopedKey } from '../context/DataContext';
import { format, addDays, parse } from 'date-fns';
import axios from 'axios';
import * as XLSX from 'xlsx';

/* =========================================
   DOST MODE — AI Companion with full power:
   ✅ Data summarization (tasks, habits, mood, journal)
   ✅ Create / edit / delete tasks, habits
   ✅ Conflict detection for scheduling
   ✅ Voice input (Web Speech API)
   ✅ File import (CSV, Excel/xlsx, JPG/image)
   ========================================= */

// Only use API if explicitly configured - NEVER fall back to localhost
const API_BASE = import.meta.env.VITE_API_URL || null;
const isAPIConfigured = !!API_BASE;

const INITIAL_MSG = [
  {
    id: 1, sender: 'ai', type: 'text',
    content: "Hey! I'm Dost — your AI companion in Mithra. Here's what I can do:\n\n🗂 **Create tasks/habits** — \"Add task: Finish report by tomorrow\"\n✏️ **Edit/Delete** — \"Delete task Finish report\" or \"Edit habit Reading to 45 min\"\n📊 **Summarize** — \"Summarize my day\" or \"How are my habits?\"\n🎤 **Voice** — Tap the mic to speak\n📎 **Import files** — Upload CSV, Excel, or images\n⚠️ **Conflicts** — I'll warn you about scheduling overlaps\n\nWhat would you like to do?"
  },
];

/* ═══════════════════════════════
   INTENT PARSER — detects user commands
   ═══════════════════════════════ */
function parseIntent(input, tasks, habits) {
  const lower = input.toLowerCase().trim();

  // ── CREATE TASK ──
  const addTaskPatterns = [
    /(?:add|create|new|make)\s+(?:a\s+)?task[:\s]+(.+)/i,
    /(?:add|create)\s+(?:a\s+)?(?:new\s+)?todo[:\s]+(.+)/i,
    /(?:remind me to|i need to|i have to)\s+(.+)/i,
  ];
  for (const p of addTaskPatterns) {
    const m = input.match(p);
    if (m) {
      const rest = m[1].trim();
      const byMatch = rest.match(/(.+?)\s+by\s+(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i);
      let title = rest, dueDate = new Date();
      if (byMatch) {
        title = byMatch[1].trim();
        dueDate = parseFuzzyDate(byMatch[2]);
      }
      let priority = 'medium';
      if (/urgent|asap|critical|important/i.test(rest)) priority = 'high';
      if (/low\s*priority|whenever|eventually/i.test(rest)) priority = 'low';
      return { type: 'create_task', title, dueDate, priority };
    }
  }

  // ── CREATE HABIT ──
  const addHabitMatch = input.match(/(?:add|create|new|start)\s+(?:a\s+)?habit[:\s]+(.+)/i);
  if (addHabitMatch) {
    const rest = addHabitMatch[1].trim();
    const durMatch = rest.match(/(.+?)\s+(?:for\s+)?(\d+)\s*(?:min|minutes?)/i);
    let title = rest, duration = 30;
    if (durMatch) { title = durMatch[1].trim(); duration = parseInt(durMatch[2]); }
    const category = detectCategory(title);
    return { type: 'create_habit', title, duration, category };
  }

  // ── DELETE TASK ──
  const deleteTaskMatch = input.match(/(?:delete|remove|cancel)\s+(?:the\s+)?task[:\s]*(.+)/i);
  if (deleteTaskMatch) {
    const query = deleteTaskMatch[1].trim().toLowerCase();
    const found = tasks.find(t => t.title.toLowerCase().includes(query));
    return { type: 'delete_task', query, found };
  }

  // ── DELETE HABIT ──
  const deleteHabitMatch = input.match(/(?:delete|remove|stop)\s+(?:the\s+)?habit[:\s]*(.+)/i);
  if (deleteHabitMatch) {
    const query = deleteHabitMatch[1].trim().toLowerCase();
    const found = habits.find(h => h.title.toLowerCase().includes(query));
    return { type: 'delete_habit', query, found };
  }

  // ── EDIT TASK ──
  const editTaskMatch = input.match(/(?:edit|update|change|rename)\s+(?:the\s+)?task[:\s]*(.+?)(?:\s+to\s+(.+))?$/i);
  if (editTaskMatch) {
    const query = editTaskMatch[1].trim().toLowerCase();
    const newValue = editTaskMatch[2]?.trim();
    const found = tasks.find(t => t.title.toLowerCase().includes(query));
    return { type: 'edit_task', query, newValue, found };
  }

  // ── EDIT HABIT ──
  const editHabitMatch = input.match(/(?:edit|update|change)\s+(?:the\s+)?habit[:\s]*(.+?)(?:\s+to\s+(.+))?$/i);
  if (editHabitMatch) {
    const query = editHabitMatch[1].trim().toLowerCase();
    const newValue = editHabitMatch[2]?.trim();
    const found = habits.find(h => h.title.toLowerCase().includes(query));
    return { type: 'edit_habit', query, newValue, found };
  }

  // ── COMPLETE TASK ──
  if (/(?:complete|done|finish|mark done)\s+(?:the\s+)?task[:\s]*(.+)/i.test(lower)) {
    const query = input.match(/(?:complete|done|finish|mark done)\s+(?:the\s+)?task[:\s]*(.+)/i)[1].trim().toLowerCase();
    const found = tasks.find(t => t.title.toLowerCase().includes(query) && !t.completed);
    return { type: 'complete_task', query, found };
  }

  // ── HABIT STATUS ── (check before summarize to avoid false matches)
  if (/how.*(?:are|is).*(?:my\s+)?habits?|habit.*status|my\s+habits?|habits?\s+status|show.*habits?|habits?\??$/i.test(lower)) {
    return { type: 'habit_status' };
  }

  // ── STREAK CHECK ──
  if (/(?:my\s+)?streak|(?:\d+)\s*days?\s*(?:of\s+)?streak|show.*streak|streak.*status/i.test(lower)) {
    return { type: 'habit_status' };
  }

  // ── MOOD CHECK ──
  if (/mood|how.*feel|emotion|feeling|how\s+am\s+i/i.test(lower)) {
    return { type: 'mood_check' };
  }

  // ── SUMMARIZE ── (check after specific queries)
  if (/summar|overview|daily.*report|weekly.*report|recap|my\s+day\b|today.*glance/i.test(lower)) {
    return { type: 'summarize' };
  }

  // ── SMART RESPONSES ──
  if (/hello|hi|hey|what's up|howdy/i.test(lower)) return { type: 'greeting' };
  if (/stress|overwhelm|anxious|worried/i.test(lower)) return { type: 'wellbeing' };
  if (/motivat|lazy|procrastinat|can't start/i.test(lower)) return { type: 'motivation' };
  if (/focus|pomodoro|concentrate|distract/i.test(lower)) return { type: 'focus' };
  if (/thank|thanks|appreciate/i.test(lower)) return { type: 'thanks' };

  return { type: 'general', input };
}

/* ── Helper: fuzzy date parser ── */
function parseFuzzyDate(text) {
  const lower = text.toLowerCase();
  const today = new Date();
  if (lower === 'today') return today;
  if (lower === 'tomorrow') return addDays(today, 1);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIdx = days.indexOf(lower);
  if (dayIdx >= 0) {
    const todayDay = today.getDay();
    const diff = ((dayIdx - todayDay) + 7) % 7 || 7;
    return addDays(today, diff);
  }
  try {
    const parsed = parse(text, 'M/d', new Date());
    if (!isNaN(parsed)) return parsed;
  } catch { }
  return today;
}

/* ── Detect category from title ── */
function detectCategory(title) {
  const l = title.toLowerCase();
  if (/exercise|gym|run|walk|workout|yoga|stretch/i.test(l)) return 'Health';
  if (/read|book|study|learn|course|class/i.test(l)) return 'Learning';
  if (/meditat|breath|mindful|calm|relax/i.test(l)) return 'Mindfulness';
  if (/code|work|meeting|email|project|document/i.test(l)) return 'Work';
  return 'Personal';
}

/* ── Build daily summary from real data ── */
function buildSummary(tasks, habits) {
  const today = new Date();
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return true;
    return new Date(t.dueDate).toDateString() === today.toDateString();
  });
  const completed = todayTasks.filter(t => t.completed).length;
  const pending = todayTasks.filter(t => !t.completed).length;
  const highPriority = todayTasks.filter(t => !t.completed && t.priority === 'high').length;

  const habitsDone = habits.filter(h => h.todayDone).length;
  const habitsTotal = habits.length;
  const bestStreakHabit = habits.length > 0
    ? habits.reduce((best, h) => (h.bestStreak || h.streak) > (best.bestStreak || best.streak) ? h : best, habits[0])
    : { title: 'None', streak: 0, bestStreak: 0 };

  let moodText = 'Not logged yet';
  try {
    const moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
    const todayMood = moodHistory.filter(m => new Date(m.date).toDateString() === today.toDateString());
    if (todayMood.length > 0) {
      const last = todayMood[todayMood.length - 1];
      moodText = `${last.label} (logged at ${format(new Date(last.date), 'h:mm a')})`;
    }
  } catch { }

  const droppedStreaks = habits.filter(h => h.bestStreak > 3 && h.streak === 0);

  let summary = `📊 **Your Day at a Glance** — ${format(today, 'EEEE, MMMM d')}\n\n`;
  summary += `📋 **Tasks**: ${completed} done, ${pending} pending${highPriority > 0 ? ` (⚠️ ${highPriority} high priority!)` : ''}\n`;
  summary += `🔥 **Habits**: ${habitsDone}/${habitsTotal} completed today\n`;
  summary += `🏆 **Best Streak**: ${bestStreakHabit.title} — ${bestStreakHabit.bestStreak || bestStreakHabit.streak} days\n`;
  summary += `😊 **Mood**: ${moodText}\n`;

  if (droppedStreaks.length > 0) {
    summary += `\n⚠️ **Streak Alerts**: ${droppedStreaks.map(h => h.title).join(', ')} — streaks dropped to 0!`;
  }

  if (pending > 0) {
    summary += `\n\n📌 **Remaining Tasks**:\n`;
    todayTasks.filter(t => !t.completed).slice(0, 5).forEach(t => {
      summary += `  • ${t.title}${t.priority === 'high' ? ' 🔴' : ''}\n`;
    });
  }

  return summary;
}

/* ── Check for scheduling conflicts ── */
function checkConflicts(tasks, newTaskDate) {
  return tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return new Date(t.dueDate).toDateString() === newTaskDate.toDateString();
  });
}

/* ── Parse CSV text into tasks ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const titleIdx = headers.findIndex(h => /title|name|task|item/i.test(h));
  const priorityIdx = headers.findIndex(h => /priority|importance/i.test(h));
  const dateIdx = headers.findIndex(h => /date|due|deadline/i.test(h));

  if (titleIdx < 0) return [];

  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    return {
      id: `import-${Date.now()}-${i}`,
      title: cols[titleIdx] || `Task ${i + 1}`,
      priority: priorityIdx >= 0 ? (cols[priorityIdx] || 'medium').toLowerCase() : 'medium',
      dueDate: dateIdx >= 0 && cols[dateIdx] ? new Date(cols[dateIdx]) : new Date(),
      completed: false,
      starred: false,
      subtasks: [],
      listId: 'default',
      details: '',
    };
  }).filter(t => t.title && t.title !== 'Task');
}


/* ═══════════════════════════════
   DOST MODE COMPONENT
   ═══════════════════════════════ */
export default function DostMode() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(getUserScopedKey('chat-history'));
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.length > 0 ? parsed : INITIAL_MSG;
      }
    } catch { }
    return INITIAL_MSG;
  });
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const {
    theme, tasks, habits,
    addTask, updateTask, deleteTask, toggleTask,
    addHabit, updateHabit, deleteHabit, toggleHabit,
  } = useData();
  const isLight = theme === 'light';

  // Check if API server is reachable - ONLY if API is configured
  useEffect(() => {
    if (!isAPIConfigured) {
      setIsOnline(false);
      return;
    }
    const checkAPI = async () => {
      try {
        const res = await axios.get(`${API_BASE}/`, { timeout: 3000 });
        setIsOnline(res.data?.status === 'online');
      } catch { setIsOnline(false); }
    };
    checkAPI();
    const interval = setInterval(checkAPI, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save chat history
  useEffect(() => {
    try {
      try {
        localStorage.setItem(getUserScopedKey('chat-history'), JSON.stringify(messages.slice(-80)));
      } catch { }
    } catch { }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Web Speech API — Voice Input ── */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addAiMsg("Sorry, your browser doesn't support voice input. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  /* ── Helper: add AI message ── */
  const addAiMsg = useCallback((content, extras = {}) => {
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'ai',
      type: 'text',
      content,
      ...extras,
    }]);
  }, []);

  /* ── File Import Handler ── */
  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    setIsThinking(true);

    // Add user message showing the upload
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: `📎 Uploaded: ${file.name}`,
    }]);

    try {
      if (ext === 'csv') {
        const text = await file.text();
        const importedTasks = parseCSV(text);
        if (importedTasks.length === 0) {
          addAiMsg("I couldn't parse any tasks from that CSV. Make sure it has a 'title' column header.");
        } else {
          importedTasks.forEach(t => addTask(t));
          addAiMsg(`📋 **Imported ${importedTasks.length} tasks** from ${file.name}!\n\n${importedTasks.slice(0, 5).map(t => `• ${t.title}`).join('\n')}${importedTasks.length > 5 ? `\n• ...and ${importedTasks.length - 5} more` : ''}`, { type: 'action' });
        }
      } else if (ext === 'xlsx' || ext === 'xls') {
        // Parse Excel file using SheetJS
        try {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          if (jsonData.length === 0) {
            addAiMsg(`📄 The Excel file "${file.name}" appears to be empty.`);
          } else {
            // Find title column (first row as headers)
            const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
            const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('task') || h.includes('name') || h.includes('item'));
            const priorityIdx = headers.findIndex(h => h.includes('priority'));
            const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('due'));

            const importedTasks = [];
            for (let i = 1; i < Math.min(jsonData.length, 101); i++) {
              const row = jsonData[i];
              if (!row || row.length === 0) continue;

              // Use title column if found, otherwise use first non-empty cell
              let title = titleIdx >= 0 ? String(row[titleIdx] || '') : String(row[0] || '');
              title = title.trim();
              if (!title || title.length < 2) continue;

              const priority = priorityIdx >= 0 && row[priorityIdx]
                ? String(row[priorityIdx]).toLowerCase().includes('high') ? 'high'
                  : String(row[priorityIdx]).toLowerCase().includes('low') ? 'low' : 'medium'
                : 'medium';

              let dueDate = new Date();
              if (dateIdx >= 0 && row[dateIdx]) {
                const excelDate = row[dateIdx];
                // Excel stores dates as numbers (days since 1/1/1900)
                if (typeof excelDate === 'number') {
                  dueDate = new Date((excelDate - 25569) * 86400 * 1000);
                } else {
                  try { dueDate = new Date(excelDate); } catch { }
                }
              }

              importedTasks.push({
                id: `import-${Date.now()}-${i}`,
                title,
                priority,
                dueDate: isNaN(dueDate.getTime()) ? new Date() : dueDate,
                completed: false,
                starred: false,
                subtasks: [],
                listId: 'default',
                details: '',
              });
            }

            if (importedTasks.length === 0) {
              addAiMsg(`📄 I couldn't find any tasks in "${file.name}". Make sure the first row has column headers like "Title" or "Task".`);
            } else {
              importedTasks.forEach(t => addTask(t));
              addAiMsg(`📊 **Imported ${importedTasks.length} tasks** from Excel!\n\n${importedTasks.slice(0, 5).map(t => `• ${t.title}`).join('\n')}${importedTasks.length > 5 ? `\n• ...and ${importedTasks.length - 5} more` : ''}`, { type: 'action' });
            }
          }
        } catch (xlsxErr) {
          console.error('Excel parse error:', xlsxErr);
          addAiMsg(`📄 I had trouble reading "${file.name}". Try saving it as CSV (File → Save As → CSV) for better compatibility.`);
        }
      } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        const url = URL.createObjectURL(file);
        addAiMsg(`🖼 I received your image "${file.name}". I can see the image, but I can't automatically extract text from it yet.\n\nHere's what you can do:\n1. Type out the tasks/events you see\n2. Use "Add task: <title>" to create each one\n3. Or export the data as CSV/Excel for bulk import`, { imageUrl: url });
      } else {
        try {
          const text = await file.text();
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            const imported = lines.slice(0, 20).map((line, i) => ({
              id: `import-${Date.now()}-${i}`,
              title: line.trim().replace(/^[-•*]\s*/, ''),
              priority: 'medium',
              dueDate: new Date(),
              completed: false,
              starred: false,
              subtasks: [],
              listId: 'default',
              details: '',
            })).filter(t => t.title.length > 1);

            imported.forEach(t => addTask(t));
            addAiMsg(`📋 Imported ${imported.length} items from "${file.name}" as tasks:\n\n${imported.slice(0, 8).map(t => `• ${t.title}`).join('\n')}`);
          }
        } catch {
          addAiMsg(`I couldn't read that file format. Try CSV, Excel, TXT, or image files.`);
        }
      }
    } catch (err) {
      addAiMsg(`Error processing file: ${err.message}`);
    } finally {
      setIsThinking(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [addTask, addAiMsg]);

  /* ── Rate limiter: max 5 AI API calls per 60 seconds ── */
  const apiCallTimestamps = useRef([]);
  const isRateLimited = useCallback(() => {
    const now = Date.now();
    apiCallTimestamps.current = apiCallTimestamps.current.filter(t => now - t < 60000);
    if (apiCallTimestamps.current.length >= 5) return true;
    apiCallTimestamps.current.push(now);
    return false;
  }, []);

  /* ═══════════════════════════════
     MAIN SEND HANDLER — Intent-based routing
     ═══════════════════════════════ */
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', type: 'text', content: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsThinking(true);

    await new Promise(r => setTimeout(r, 400));

    try {
      const intent = parseIntent(userInput, tasks, habits);

      switch (intent.type) {
        /* ── CREATE TASK ── */
        case 'create_task': {
          if (!intent.title || !intent.title.trim()) {
            addAiMsg(`I couldn't figure out the task title. Try saying something like "Add task: review the report by Friday".`);
            break;
          }
          const conflicts = checkConflicts(tasks, intent.dueDate);
          const newTask = {
            id: `task-${Date.now()}`,
            title: intent.title,
            priority: intent.priority,
            dueDate: intent.dueDate,
            completed: false,
            starred: intent.priority === 'high',
            subtasks: [],
            listId: intent.priority === 'high' ? 'work' : 'default',
            details: '',
          };
          addTask(newTask);

          let msg = `✅ **Task created!**\n\n📋 "${intent.title}"\n📅 Due: ${format(intent.dueDate, 'EEEE, MMM d')}\n🎯 Priority: ${intent.priority.toUpperCase()}`;

          if (conflicts.length > 0) {
            msg += `\n\n⚠️ **Heads up** — you already have ${conflicts.length} task${conflicts.length > 1 ? 's' : ''} on that day:`;
            conflicts.slice(0, 3).forEach(c => { msg += `\n  • ${c.title}`; });
            msg += `\n\nMake sure you have enough bandwidth!`;
          }

          addAiMsg(msg, { type: 'task_created', taskData: newTask });
          break;
        }

        /* ── CREATE HABIT ── */
        case 'create_habit': {
          const newHabit = {
            id: `h-${Date.now()}`,
            title: intent.title,
            category: intent.category,
            streak: 0,
            bestStreak: 0,
            consistency: [],
            todayDone: false,
            focusDuration: intent.duration,
          };
          addHabit(newHabit);
          addAiMsg(`🔥 **Habit created!**\n\n"${intent.title}"\n⏱ ${intent.duration} min/day\n🏷 Category: ${intent.category}\n\nLet's build that streak! 💪`, {
            type: 'habit_created', habitData: newHabit,
          });
          break;
        }

        /* ── DELETE TASK ── */
        case 'delete_task': {
          if (intent.found) {
            deleteTask(intent.found.id);
            addAiMsg(`🗑 **Task deleted**: "${intent.found.title}"\n\nIt's off your plate!`, {
              type: 'action', actionData: { task: intent.found.title },
            });
          } else {
            const suggestions = tasks.filter(t => !t.completed).slice(0, 5);
            addAiMsg(`I couldn't find a task matching "${intent.query}". Your tasks:\n\n${suggestions.map(t => `• ${t.title}`).join('\n')}\n\nTry: "Delete task <exact name>"`);
          }
          break;
        }

        /* ── DELETE HABIT ── */
        case 'delete_habit': {
          if (intent.found) {
            deleteHabit(intent.found.id);
            addAiMsg(`🗑 **Habit removed**: "${intent.found.title}" (had ${intent.found.streak}-day streak)\n\nFocus on what matters most!`);
          } else {
            addAiMsg(`I couldn't find a habit matching "${intent.query}". Your habits:\n\n${habits.map(h => `• ${h.title} (${h.streak}🔥)`).join('\n')}`);
          }
          break;
        }

        /* ── EDIT TASK ── */
        case 'edit_task': {
          if (intent.found && intent.newValue) {
            const dateMatch = intent.newValue.match(/(?:due\s+)?(?:by\s+)?(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            if (dateMatch) {
              updateTask({ ...intent.found, dueDate: parseFuzzyDate(dateMatch[1]) });
              addAiMsg(`✏️ Updated "${intent.found.title}" — new due date: ${format(parseFuzzyDate(dateMatch[1]), 'EEEE, MMM d')}`);
            } else {
              updateTask({ ...intent.found, title: intent.newValue });
              addAiMsg(`✏️ Updated: "${intent.found.title}" → "${intent.newValue}"`);
            }
          } else if (intent.found) {
            addAiMsg(`Which part of "${intent.found.title}" do you want to change? Try:\n\n• "Edit task ${intent.found.title} to New Title"\n• "Edit task ${intent.found.title} to due tomorrow"`);
          } else {
            addAiMsg(`I couldn't find a task matching "${intent.query}". Try again with the exact task name.`);
          }
          break;
        }

        /* ── EDIT HABIT ── */
        case 'edit_habit': {
          if (intent.found && intent.newValue) {
            const durMatch = intent.newValue.match(/(\d+)\s*(?:min|minutes?)/i);
            if (durMatch) {
              updateHabit({ ...intent.found, focusDuration: parseInt(durMatch[1]) });
              addAiMsg(`✏️ Updated "${intent.found.title}" — now ${durMatch[1]} min/day`);
            } else {
              updateHabit({ ...intent.found, title: intent.newValue });
              addAiMsg(`✏️ Renamed: "${intent.found.title}" → "${intent.newValue}"`);
            }
          } else {
            addAiMsg(`Which part of "${intent.found?.title || intent.query}" do you want to change?`);
          }
          break;
        }

        /* ── COMPLETE TASK ── */
        case 'complete_task': {
          if (intent.found) {
            toggleTask(intent.found.id);
            addAiMsg(`✅ Done! "${intent.found.title}" is marked complete. Great job! 🎉`);
          } else {
            addAiMsg(`I couldn't find an incomplete task matching "${intent.query}".`);
          }
          break;
        }

        /* ── SUMMARIZE ── */
        case 'summarize': {
          const summary = buildSummary(tasks, habits);
          addAiMsg(summary, { type: 'summary' });
          break;
        }

        /* ── HABIT STATUS ── */
        case 'habit_status': {
          if (!habits || habits.length === 0) {
            addAiMsg("You don't have any habits yet! Try: \"Add habit: Morning Meditation for 15 min\"");
            break;
          }
          let msg = `🔥 **Habit Status**\n\n`;
          habits.forEach(h => {
            const status = h.todayDone ? '✅' : '⬜';
            const streakEmoji = h.streak > 10 ? '🔥' : h.streak > 0 ? '✨' : '❄️';
            msg += `${status} **${h.title}** — ${h.streak} day streak ${streakEmoji} (best: ${h.bestStreak || h.streak})\n`;
          });
          const total = habits.length;
          const done = habits.filter(h => h.todayDone).length;
          msg += `\n📊 Progress: ${done}/${total} done today (${Math.round(done / total * 100)}%)`;
          if (done === total) msg += '\n\n🎉 All habits done — incredible day!';
          else if (done >= total * 0.5) msg += '\n\nAlmost there — keep pushing! 💪';
          else msg += '\n\nStill time to knock these out! Start with one. 🚀';
          addAiMsg(msg);
          break;
        }

        /* ── MOOD CHECK ── */
        case 'mood_check': {
          let moodMsg = '😊 **Mood History**\n\n';
          try {
            const moods = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
            const recent = moods.slice(-7);
            if (recent.length === 0) {
              moodMsg += "You haven't logged any moods yet. Go to the Dashboard and tap an emoji to log your mood!";
            } else {
              recent.forEach(m => {
                const date = format(new Date(m.date), 'MMM d, h:mm a');
                const emoji = ['', '😤', '😔', '😐', '😌', '😊'][m.mood] || '😐';
                moodMsg += `${emoji} **${m.label}** — ${date}\n`;
              });
              const avg = recent.reduce((s, m) => s + m.mood, 0) / recent.length;
              moodMsg += `\n📊 Average mood: ${avg.toFixed(1)}/5 ${avg >= 4 ? '— great vibes! 🌟' : avg >= 3 ? '— steady' : '— take care of yourself 💛'}`;
            }
          } catch { moodMsg += 'No mood data available.'; }
          addAiMsg(moodMsg);
          break;
        }

        /* ── WELLBEING ── */
        case 'wellbeing':
          addAiMsg("Take a deep breath. 🧘\n\nHere's a quick exercise:\n1. **Breathe in** for 4 seconds\n2. **Hold** for 4 seconds\n3. **Breathe out** for 6 seconds\n\nRepeat 3 times. Remember — you don't have to do everything at once. Pick the ONE most important thing and start there.\n\nProgress, not perfection. 💛");
          break;

        case 'motivation':
          addAiMsg("Here's a trick: commit to **just 2 minutes**. Start the task for just 2 minutes — most of the time, you'll keep going once you start. The hardest part is beginning.\n\n\"A journey of a thousand miles begins with a single step.\" — Lao Tzu 🚀\n\nWhat's that one small thing you can start right now?");
          break;

        case 'focus':
          addAiMsg("🎯 **Focus Mode Tips**:\n\n1. Go to the **Habit & Focus Hub** — use the Pomodoro timer\n2. Put your phone in Do Not Disturb\n3. Close unnecessary tabs\n4. Start with 25 min of focused work, then 5 min break\n\nI believe in you — let's lock in! 🔒");
          break;

        case 'greeting':
          addAiMsg(`Hey there! 👋 It's ${format(new Date(), 'EEEE, MMMM d')}.\n\nYou have ${tasks.filter(t => !t.completed).length} pending tasks and ${habits.filter(h => !h.todayDone).length} habits left today.\n\nWhat would you like to work on?`);
          break;

        case 'thanks':
          addAiMsg("You're welcome! 😊 That's what I'm here for. Anything else you need?");
          break;

        /* ── GENERAL / SCOPED RESPONSE ── */
        case 'general':
        default: {
          // Check if the question is relevant to our app capabilities
          const appKeywords = /task|habit|mood|journal|summar|schedule|remind|focus|pomodoro|productiv|streak|goal|timer|break|meditat|stress|motivat|wellness|wellbeing|breath|import|csv|excel/i;
          const isAppRelated = appKeywords.test(userInput);

          if (isAppRelated && isOnline) {
            if (isRateLimited()) {
              addAiMsg("⏳ You're sending messages too quickly. Please wait a moment before trying again.");
              break;
            }
            try {
              const res = await axios.post(`${API_BASE}/api/chat`, {
                message: userInput,
                user_id: 'default',
                current_tasks: tasks.map(t => ({ title: t.title, priority: t.priority, completed: t.completed, dueDate: t.dueDate })),
                current_habits: habits.map(h => ({ title: h.title, streak: h.streak, todayDone: h.todayDone })),
              }, { timeout: 30000 });
              addAiMsg(res.data?.reply || "That's interesting! Tell me more.");
            } catch {
              addAiMsg(getSmartResponse());
            }
          } else if (isAppRelated) {
            addAiMsg(getSmartResponse());
          } else {
            addAiMsg("I appreciate your curiosity! 😊 However, I'm best at helping you with things related to **Mithra** — your productivity companion.\n\nHere's what I can help with:\n\n📋 **Tasks** — Create, edit, delete, or complete tasks\n🔥 **Habits** — Add, track, and review habit streaks\n📊 **Summaries** — Get a daily overview of your progress\n😊 **Mood** — Check your mood history and patterns\n🎤 **Voice** — Speak to me using the mic\n📎 **Import** — Upload CSV or Excel files\n⏱ **Focus** — Tips for concentration and productivity\n🧘 **Wellness** — Breathing exercises and motivation\n\nTry asking something like: *\"Summarize my day\"* or *\"Add task: Finish report by tomorrow\"* 💬");
          }
        }
      }
    } catch (err) {
      addAiMsg("Hmm, something went wrong. Try rephrasing your request!");
    } finally {
      setIsThinking(false);
    }
  }, [input, isOnline, tasks, habits, addTask, updateTask, deleteTask, toggleTask, addHabit, updateHabit, deleteHabit, addAiMsg]);

  function getSmartResponse() {
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const doneHabits = habits.filter(h => h.todayDone).length;
    const totalHabits = habits.length;
    const now = new Date();
    const hour = now.getHours();

    let greeting = '';
    if (hour < 12) greeting = 'Good morning!';
    else if (hour < 17) greeting = 'Good afternoon!';
    else greeting = 'Good evening!';

    let contextual = '';
    if (pendingTasks > 3) {
      contextual = `\n\nYou have **${pendingTasks} pending tasks** — want me to help prioritize them? Try \"Summarize my day\" for a full overview.`;
    } else if (doneHabits === totalHabits && totalHabits > 0) {
      contextual = '\n\n🌟 All your habits are done today — incredible discipline! Keep this momentum going.';
    } else if (totalHabits > 0) {
      contextual = `\n\nYou've completed **${doneHabits}/${totalHabits}** habits today. Want to check your streak? Say \"How are my habits?\"`;
    }

    return `${greeting} I'm here to help. 😊${contextual}\n\nHere's what I can do:\n\n📋 **\"Add task: <title>\"** — create a task\n🔥 **\"Add habit: <title>\"** — start a new habit\n📊 **\"Summarize my day\"** — get your daily overview\n🗑 **\"Delete task <name>\"** — remove a task\n✏️ **\"Edit task <name> to <new>\"** — update it\n😊 **\"How is my mood?\"** — review mood history\n\nOr just chat — I'm always here for you! 💬`;
  }

  /* ── Render message content with markdown-like bold ── */
  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
          }
          // Handle bullet points
          if (part.trim().startsWith('•') || part.trim().startsWith('-')) {
            return <span key={j} className="text-[var(--text-dim)] opacity-70">{part}</span>;
          }
          return part;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatMsgTime = (id) => {
    try {
      const ts = typeof id === 'number' ? new Date(id) : new Date();
      return format(ts, 'h:mm a');
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-hidden rounded-2xl shadow-2xl"
      style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)' }}>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => { handleFileImport(e); if (fileInputRef.current) fileInputRef.current.setAttribute('accept', '.csv,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.webp'); }} />

      {/* BACKGROUND: Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[100px] rounded-full pointer-events-none"
        style={{ background: isLight ? 'rgb(var(--color-visor) / 0.05)' : 'rgb(var(--color-visor) / 0.08)' }} />

      {/* HEADER */}
      <header className="p-4 md:p-6 flex items-center justify-between z-10 backdrop-blur-md"
        style={{ backgroundColor: 'var(--glass-bg-hover)' }}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full transition-all ${isThinking ? 'bg-accent-visor animate-ping' : isListening ? 'bg-red-500 animate-pulse' : isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h1 className="text-xl font-light tracking-wide">Dost <span className="text-[var(--text-dim)] text-sm opacity-50">AI Companion</span></h1>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isListening ? 'bg-red-500/10 text-red-400 animate-pulse' : isOnline ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
            {isListening ? '🎤 Listening...' : isOnline ? 'AI Online' : 'Smart Mode'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-accent-visor cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] text-xs"
            title="Import CSV, Excel, or Image">
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={() => { setMessages(INITIAL_MSG); localStorage.removeItem(getUserScopedKey('chat-history')); }}
            className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-red-400 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] text-xs" title="Clear chat">
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* IMPORT MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: 'var(--body-bg)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Import Files</h3>
                <button onClick={() => setShowImportModal(false)} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm mb-4" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
                  Choose a file type to import tasks or data:
                </p>
                {/* CSV Option */}
                <button
                  onClick={() => { fileInputRef.current?.setAttribute('accept', '.csv,.txt'); fileInputRef.current?.click(); setShowImportModal(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: isLight ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.1)',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
                    <FileSpreadsheet size={20} className="text-green-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>CSV File</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Import tasks from .csv or .txt</span>
                  </div>
                </button>
                {/* Excel Option */}
                <button
                  onClick={() => { fileInputRef.current?.setAttribute('accept', '.xlsx,.xls'); fileInputRef.current?.click(); setShowImportModal(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: isLight ? 'rgb(var(--color-accent) / 0.08)' : 'rgb(var(--color-accent) / 0.1)',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-glow">
                    <Flame size={16} className="text-accent-visor" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>Excel File</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Import from .xlsx or .xls</span>
                  </div>
                </button>
                {/* Image Option */}
                <button
                  onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); setShowImportModal(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: isLight ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.1)',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-600/20">
                    <ImageIcon size={20} className="text-accent-visor" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>Image File</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Upload JPG, PNG, or screenshot</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-md p-4 rounded-2xl relative overflow-hidden shadow-sm
              ${msg.sender === 'user'
                ? ''
                : 'text-[var(--text-primary)]'
              }`}
              style={
                msg.sender === 'user'
                  ? { background: 'var(--accent-color)', opacity: 0.9, backdropFilter: 'blur(20px) saturate(180%)' }
                  : { background: 'var(--glass-bg)', backdropFilter: 'blur(20px) saturate(180%)', boxShadow: '0 0 15px var(--accent-glow)' }
              }
            >
              {/* Text Content with markdown rendering */}
              <div className="leading-relaxed text-sm md:text-base">{renderContent(msg.content)}</div>

              {/* Timestamp */}
              <div className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-white/40 text-right' : 'text-[var(--text-dim)]/40'}`}>
                {formatMsgTime(msg.id)}
              </div>

              {/* WIDGET: Task Created */}
              {msg.type === 'task_created' && msg.taskData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 rounded-lg flex items-center gap-3"
                  style={{ background: isLight ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.1)' }}>
                  <Plus size={16} className="text-green-500" />
                  <span className="text-sm font-medium">{msg.taskData.title}</span>
                  <span className="ml-auto text-[10px] text-green-400 font-bold uppercase">Added</span>
                </motion.div>
              )}

              {/* WIDGET: Habit Created */}
              {msg.type === 'habit_created' && msg.habitData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 rounded-lg flex items-center gap-3"
                  style={{ background: isLight ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.1)' }}>
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">{msg.habitData.title}</span>
                  <span className="ml-auto text-[10px] text-accent-visor font-bold uppercase">New Habit</span>
                </motion.div>
              )}

              {/* WIDGET: Action Feedback (Deleted) */}
              {msg.type === 'action' && msg.actionData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-red-900/20 rounded-lg flex items-center gap-3">
                  <Trash2 size={16} className="text-red-500" />
                  <span className="text-sm text-red-200 line-through">{msg.actionData.task}</span>
                  <span className="ml-auto text-xs text-red-400 font-bold uppercase">Removed</span>
                </motion.div>
              )}

              {/* WIDGET: Image preview */}
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Imported" className="mt-3 rounded-lg max-h-40 object-cover w-full" />
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
              <span className="w-2 h-2 bg-accent-visor rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent-visor rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-accent-visor rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[var(--text-dim)] text-xs ml-2 opacity-50">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* ─── QUICK ACTIONS BAR ─── */}
      <div className="px-4 md:px-6 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide z-10"
        style={{ backgroundColor: 'var(--glass-bg)' }}>
        {[
          { label: '📊 Summary', cmd: 'Summarize my day' },
          { label: '🔥 Habits', cmd: 'How are my habits?' },
          { label: '😊 Mood', cmd: 'How is my mood?' },
          { label: '📋 Add Task', cmd: 'Add task: ' },
          { label: '📎 Import', cmd: '__import_modal__' },
        ].map(q => (
          <button
            key={q.label}
            onClick={() => {
              if (q.cmd === '__import_modal__') {
                setShowImportModal(true);
              } else if (q.cmd.endsWith(': ')) {
                setInput(q.cmd);
              } else {
                // Direct send
                const userMsg = { id: Date.now(), sender: 'user', type: 'text', content: q.cmd };
                setMessages(p => [...p, userMsg]);
                setIsThinking(true);
                setTimeout(async () => {
                  await new Promise(r => setTimeout(r, 300));
                  const intent = parseIntent(q.cmd, tasks, habits);
                  if (intent.type === 'summarize') {
                    addAiMsg(buildSummary(tasks, habits), { type: 'summary' });
                  } else if (intent.type === 'habit_status') {
                    let msg = `🔥 **Habit Status**\n\n`;
                    habits.forEach(h => {
                      msg += `${h.todayDone ? '✅' : '⬜'} **${h.title}** — ${h.streak} day streak\n`;
                    });
                    const done = habits.filter(h => h.todayDone).length;
                    msg += `\n📊 Progress: ${done}/${habits.length} done today (${Math.round(done / Math.max(habits.length, 1) * 100)}%)`;
                    addAiMsg(msg);
                  } else if (intent.type === 'mood_check') {
                    let moodMsg = '😊 **Mood History**\n\n';
                    try {
                      const moods = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
                      const recent = moods.slice(-7);
                      if (recent.length === 0) { moodMsg += 'No moods logged yet! Go to the Dashboard and tap an emoji to get started.'; }
                      else {
                        recent.forEach(m => {
                          const emoji = ['', '😤', '😔', '😐', '😌', '😊'][m.mood] || '😐';
                          moodMsg += `${emoji} **${m.label}** — ${format(new Date(m.date), 'MMM d, h:mm a')}\n`;
                        });
                        const avg = recent.reduce((s, m) => s + m.mood, 0) / recent.length;
                        moodMsg += `\n📊 Average: ${avg.toFixed(1)}/5 ${avg >= 4 ? '— amazing vibes! 🌟' : avg >= 3 ? '— staying steady' : '— take care of yourself 💛'}`;
                      }
                    } catch { }
                    addAiMsg(moodMsg);
                  }
                  setIsThinking(false);
                }, 50);
              }
            }}
            className="whitespace-nowrap text-xs px-3.5 py-2 rounded-full text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-accent-visor/5 transition-all flex-shrink-0 font-medium"
            style={{ background: 'var(--glass-bg)' }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 md:p-6 z-20"
        style={{ backgroundColor: 'var(--glass-bg-hover)' }}>
        <div className="relative group flex items-center gap-2">
          <input
            type="text"
            data-dost-input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening... speak now 🎤" : "Add task, ask anything, or import files..."}
            className={`w-full text-[var(--text-primary)] rounded-full py-3.5 pl-5 pr-28 focus:outline-none focus:shadow-[0_0_20px_var(--accent-glow)] transition-all placeholder-[var(--text-dim)] text-sm md:text-base shadow-inner bg-black/5`}
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px) saturate(180%)' }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {/* Import button (opens modal) */}
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 rounded-full text-[var(--text-dim)] hover:text-accent-visor hover:bg-accent-visor/10 transition-all opacity-60 hover:opacity-100"
              title="Import files (CSV, Excel, Image)"
            >
              <Plus size={18} />
            </button>
            {/* Mic Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] opacity-60 hover:opacity-100'}`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2 rounded-full text-white transition-all ${input.trim() ? 'bg-accent-visor hover:scale-105 active:scale-95' : 'bg-[var(--glass-border)] text-[var(--text-dim)] opacity-20'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

```

## File: client/src/services/googleCalendar.js

```
import axios from 'axios';

/**
 * Fetch calendar events from Google Calendar API
 * @param {string} providerToken - The OAuth provider token from Supabase session
 * @param {Date} timeMin - Start of the range
 * @param {Date} timeMax - End of the range
 */
export const listGoogleEvents = async (providerToken, timeMin, timeMax) => {
    try {
        const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: {
                Authorization: `Bearer ${providerToken}`,
            },
            params: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            },
        });

        return response.data.items.map(item => ({
            id: item.id,
            title: item.summary,
            start: new Date(item.start.dateTime || item.start.date),
            end: new Date(item.end.dateTime || item.end.date), // Full day events use 'date'
            allDay: !item.start.dateTime,
            location: item.location,
            description: item.description,
            htmlLink: item.htmlLink,
            source: 'google', // To distinguish from internal events
        }));
    } catch (error) {
        console.warn('Error fetching Google Calendar events:', error);
        if (error.response?.status === 401) {
            // Token might be expired or invalid
            throw new Error('Unauthorized');
        }
        return [];
    }
};

```

## File: client/src/services/supabaseClient.js

```
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════════
   SUPABASE CLIENT — Singleton instance
   
   Gracefully handles missing credentials (offline-only mode).
   When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set,
   the app falls back to localStorage-only operation.
   ═══════════════════════════════════════════════════════════════ */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Mithra] Supabase credentials missing — running in offline mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sync.'
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: localStorage,
      storageKey: 'mithra-supabase-auth',
    },
    realtime: {
      params: { eventsPerSecond: 2 },
    },
  })
  : null;

export const isSupabaseConfigured = isConfigured;

/* ═══════════════════════════════════════════════════════════════
   AUTH SERVICE — Wraps Supabase Auth with offline fallback
   ═══════════════════════════════════════════════════════════════ */
export const authService = {
  /** Sign up with email + password, stores fullName in metadata */
  async signUp(email, password, fullName) {
    if (!supabase) return null; // fall back to localStorage auth

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    // Handle "Database error saving new user" - user was created but trigger failed
    // This happens when the handle_new_user trigger fails, but auth user exists
    if (error) {
      // Check if this is a trigger failure (user was still created)
      if (error.message?.includes('Database error')) {
        // Try to sign in with the newly created credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInData?.user) {
          // User exists, manually create profile
          await supabase
            .from('profiles')
            .upsert({
              id: signInData.user.id,
              full_name: fullName || '',
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .select();

          return { user: signInData.user, session: signInData.session };
        }
      }
      throw error;
    }

    // If signup succeeded, also try to ensure profile exists (belt and suspenders)
    if (data?.user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName || '',
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })
          .select();
      } catch {
        // Profile upsert failed, but that's ok - user is created
        console.warn('[Mithra] Could not create profile, but user signup succeeded');
      }
    }

    return data;
  },

  /** Sign in with email + password */
  async signIn(email, password) {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign out */
  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get current session (null if not logged in) */
  async getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** Get current user */
  async getUser() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /** Subscribe to auth state changes */
  onAuthStateChange(callback) {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => { } } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  /** Sign in with Google OAuth */
  async signInWithGoogle() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
      },
    });
    if (error) throw error;
    return data;
  },

  /** Reset password (sends email) */
  async resetPassword(email) {
    if (!supabase) return null;
    const siteUrl = 'https://mithra-life-os.vercel.app';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/#/reset-password`,
    });
    if (error) throw error;
    return true;
  },

  /** Update password (for logged-in user) */
  async updatePassword(newPassword) {
    if (!supabase) return null;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },
};

```

## File: client/src/services/syncEngine.js

```
import { supabase, isSupabaseConfigured } from './supabaseClient';

/* ═══════════════════════════════════════════════════════════════
   SYNC ENGINE — Offline-first bidirectional sync
   
   Strategy:
   • localStorage is the fast cache (reads are instant)
   • Supabase is the source of truth (writes are queued)
   • Changes made offline are queued and flushed on reconnect
   • Conflict resolution: server-wins with timestamp comparison
   ═══════════════════════════════════════════════════════════════ */

const SYNC_QUEUE_KEY = 'mithra-sync-queue';
const LAST_SYNC_KEY = 'mithra-last-sync';

class SyncEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.listeners = new Set();

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notify('online');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify('offline');
    });
  }

  /* ── Event system ── */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach(fn => {
      try { fn(event, data); } catch (e) { console.error('Sync listener error:', e); }
    });
  }

  /* ── Queue management ── */
  _getQueue() {
    try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); }
    catch { return []; }
  }

  _saveQueue(queue) {
    try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue)); }
    catch { /* quota exceeded — drop oldest entries */
      try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.slice(-50))); }
      catch {}
    }
  }

  /** Enqueue a write operation for sync */
  enqueue(operation) {
    const queue = this._getQueue();
    queue.push({
      ...operation,
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retries: 0,
    });
    this._saveQueue(queue);

    if (this.isOnline && isSupabaseConfigured) {
      this.processQueue();
    }
  }

  /** Process all pending operations */
  async processQueue() {
    if (!supabase || this.syncInProgress || !this.isOnline) return;
    this.syncInProgress = true;
    this.notify('syncing');

    const queue = this._getQueue();
    if (queue.length === 0) {
      this.syncInProgress = false;
      this.notify('idle');
      return;
    }

    const failed = [];
    for (const op of queue) {
      try {
        await this._executeOperation(op);
      } catch (e) {
        console.warn('[Sync] Operation failed:', op.table, op.action, e.message);
        op.retries += 1;
        if (op.retries < 5) {
          failed.push(op);
        } else {
          console.error('[Sync] Dropping operation after 5 retries:', op);
        }
      }
    }

    this._saveQueue(failed);
    try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch {}
    this.syncInProgress = false;
    this.notify(failed.length > 0 ? 'partial' : 'synced');
  }

  /** Execute a single sync operation against Supabase */
  async _executeOperation(op) {
    if (!supabase) throw new Error('Supabase not configured');

    switch (op.action) {
      case 'upsert': {
        const { error } = await supabase.from(op.table).upsert(op.data, { onConflict: op.onConflict || 'id' });
        if (error) throw error;
        break;
      }
      case 'insert': {
        const { error } = await supabase.from(op.table).insert(op.data);
        if (error) throw error;
        break;
      }
      case 'update': {
        const { error } = await supabase.from(op.table).update(op.data).match(op.match);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await supabase.from(op.table).delete().match(op.match);
        if (error) throw error;
        break;
      }
      default:
        throw new Error(`Unknown sync action: ${op.action}`);
    }
  }

  /* ── Full table sync (pull + merge) ── */

  /** Pull all rows for a user from a table */
  async pull(table, userId, select = '*') {
    if (!supabase || !this.isOnline) return null;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  /** Full sync: push local data + pull server data, merge by timestamp */
  async syncTable(table, userId, localData, { onConflict = 'id', mergeKey = 'id' } = {}) {
    if (!supabase || !this.isOnline) return localData;

    try {
      // 1. Push local data
      if (localData && localData.length > 0) {
        const rows = localData.map(item => ({
          ...item,
          user_id: userId,
          updated_at: item.updated_at || new Date().toISOString(),
        }));
        const { error } = await supabase.from(table).upsert(rows, { onConflict });
        if (error) {
          console.warn(`[Sync] Push to ${table} failed:`, error.message);
        }
      }

      // 2. Pull server data
      const serverData = await this.pull(table, userId);
      if (!serverData) return localData;

      // 3. Merge: newer timestamp wins
      const merged = new Map();
      (localData || []).forEach(item => merged.set(item[mergeKey], item));
      serverData.forEach(item => {
        const local = merged.get(item[mergeKey]);
        if (!local || new Date(item.updated_at) > new Date(local.updated_at || 0)) {
          merged.set(item[mergeKey], item);
        }
      });

      try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch {}
      return Array.from(merged.values());
    } catch (e) {
      console.error(`[Sync] Table sync failed for ${table}:`, e);
      return localData; // fallback to local
    }
  }

  /* ── Status helpers ── */
  getPendingCount() {
    return this._getQueue().length;
  }

  getLastSyncTime() {
    const ts = localStorage.getItem(LAST_SYNC_KEY);
    return ts ? new Date(parseInt(ts)) : null;
  }

  get isConfigured() {
    return isSupabaseConfigured;
  }
}

export const syncEngine = new SyncEngine();

```
