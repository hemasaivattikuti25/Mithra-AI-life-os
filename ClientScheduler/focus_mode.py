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
