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
