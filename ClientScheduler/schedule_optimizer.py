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
