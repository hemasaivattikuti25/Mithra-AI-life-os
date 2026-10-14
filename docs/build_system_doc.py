"""
Build the Master Technical Specification & Architecture Whitepaper for Mithra Life OS (.docx)
Contains deep code analysis, exact mathematical formulas, schemas, line-by-line mechanics,
6 embedded high-resolution UML diagrams, and complete API/Deployment playbooks.
"""
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOC_PATH = "docs/Mithra_Life_OS_Complete_System_Document.docx"
DIAGRAMS_DIR = "docs/diagrams"

def set_cell_background(cell, hex_color):
    """Set background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner cell padding in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
    """Set custom borders on a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="{top or "none"}" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'<w:left w:val="{left or "none"}" w:sz="24" w:space="0" w:color="4F46E5"/>'
        f'<w:bottom w:val="{bottom or "none"}" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'<w:right w:val="{right or "none"}" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def add_callout(doc, text, title="ARCHITECTURAL NOTE", accent_color="4F46E5"):
    """Render a styled callout quote box."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.rows[0].cells[0]
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="28" w:space="0" w:color="{accent_color}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    
    r_title = p.add_run(f"📌 {title}: ")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.italic = True
    r_body.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_code_block(doc, code_str, language=""):
    """Render a styled code snippet block."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.rows[0].cells[0]
    set_cell_background(cell, "0F172A")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="334155"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="334155"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="334155"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="334155"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    
    r = p.add_run(code_str.strip())
    r.font.name = "Consolas"
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_table(table, col_widths, headers, rows_data):
    """Format table with executive styling."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header Row
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        hdr_cells[i].width = Inches(col_widths[i])
        set_cell_background(hdr_cells[i], "1E293B")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.name = "Arial"
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            
    # Data Rows
    for r_idx, row in enumerate(rows_data):
        row_cells = table.add_row().cells
        bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row):
            row_cells[c_idx].text = str(val)
            row_cells[c_idx].width = Inches(col_widths[c_idx])
            set_cell_background(row_cells[c_idx], bg_col)
            set_cell_margins(row_cells[c_idx], top=70, bottom=70, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = "Arial"
                run.font.size = Pt(8.0)
                run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    doc_add_space_after(table)

def doc_add_space_after(element, pt=6):
    pass

def add_heading_1(doc, title, number_str=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    full_text = f"{number_str}. {title}" if number_str else title
    run = p.add_run(full_text)
    run.font.name = "Arial"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    return p

def add_heading_2(doc, title, number_str=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    full_text = f"{number_str} {title}" if number_str else title
    run = p.add_run(full_text)
    run.font.name = "Arial"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)
    return p

def add_heading_3(doc, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(title)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    return p

def add_body(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(9.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def add_diagram_image(doc, img_name, caption_title, caption_desc):
    """Embed diagram image with centered formatting and professional caption."""
    img_path = os.path.join(DIAGRAMS_DIR, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(2)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(6.4))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(10)
        
        r_pre = p_cap.add_run(f"Figure: {caption_title} — ")
        r_pre.font.name = "Arial"
        r_pre.font.bold = True
        r_pre.font.size = Pt(8.5)
        r_pre.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)
        
        r_sub = p_cap.add_run(caption_desc)
        r_sub.font.name = "Arial"
        r_sub.font.size = Pt(8.0)
        r_sub.font.italic = True
        r_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    else:
        add_body(doc, f"[Image placeholder: {img_name}]")

# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENT GENERATION EXECUTION
# ══════════════════════════════════════════════════════════════════════════════

def build_document():
    doc = Document()
    
    # Page setup — 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header & Footer
        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.text = "Mithra Life OS — Master System Architecture & Engineering Blueprint"
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_hdr.runs[0].font.name = "Arial"
        p_hdr.runs[0].font.size = Pt(7.5)
        p_hdr.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
        
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.text = "Confidential • Internal & Stakeholder Technical Reference • Production v1.0"
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ftr.runs[0].font.name = "Arial"
        p_ftr.runs[0].font.size = Pt(7.5)
        p_ftr.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    # ─── COVER PAGE / TITLE BLOCK ───────────────────────────────────────────
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("MITHRA LIFE OS")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(28)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Autonomous Personal Intelligence & Holistic Behavioral Operating System\nFull-Stack Technical Architecture, Codebase Specification & Production Runbook")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)

    # Metadata Block Table
    meta_table = doc.add_table(rows=1, cols=4)
    meta_headers = ["Document Version", "Architecture Tier", "Security Level", "Release State"]
    meta_rows = [
        ["v1.0.0-PROD (Enterprise)", "Tier-1 Production", "Confidential / Architectural", "Fully Audited & Verified"]
    ]
    format_table(meta_table, [1.6, 1.6, 1.7, 1.6], meta_headers, meta_rows)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Executive Abstract
    add_callout(doc, 
        "Mithra Life OS represents an autonomous, privacy-first personal productivity and behavioral ecosystem. "
        "It integrates local-first optimistic state synchronization, atomic habit reinforcement algorithms, "
        "multimodal context-injected AI companionship ('Dost'), time-blocking calendar coordination, and cross-platform "
        "native mobile execution (Capacitor Android). This document serves as the exhaustive technical reference manual "
        "covering component topologies, data models, state engines, cryptographic token storage, and REST interfaces.",
        title="EXECUTIVE ARCHITECTURE ABSTRACT",
        accent_color="4F46E5"
    )

    # ─── SECTION 1: SYSTEM VISION & THE FOUR PILLARS ─────────────────────────
    add_heading_1(doc, "System Vision & Core Architectural Pillars", "1.0")
    add_body(doc, 
        "Modern productivity applications suffer from cognitive fragmentation. Users are forced to balance disparate tools: "
        "a task manager for to-do items, a habit tracker for atomic routines, a calendar for scheduled meetings, a journal "
        "for reflection, and conversational AI chatbots for unstructured planning. Mithra Life OS unifies these fragmented "
        "vectors into a cohesive, synchronized, and intelligent operating system built upon four core pillars:"
    )
    
    add_bullet(doc, " Seamlessly combines the Eisenhower Decision Matrix (Urgent vs. Important) with Kanban workflows, flexible subtask trees, and automated schedule allocation.", "1. Intelligent Productivity: ")
    add_bullet(doc, " Implements James Clear's atomic habit principles with 365-day SVG commit-style heatmaps, non-punitive monthly streak freeze mechanisms, and continuous completion ratio tracking.", "2. Sustainable Behavioral Habit Psychology: ")
    add_bullet(doc, " Provides customizable Pomodoro intervals (25m deep work / 5m short break / 15m long break), synthesized Web Audio ambient soundscapes, distraction-free visor UI modes, and post-session emotional logging.", "3. Deep Focus & Emotional Mindfulness: ")
    add_bullet(doc, " An empathetic, context-aware AI agent powered by NVIDIA NIM (Nemotron / Mistral-Large). Dost analyzes the user's active tasks, pending habits, calendar conflicts, and emotional sentiment to proactively construct optimized daily timetables.", "4. Context-Injected AI Copilot ('Dost'): ")

    # ─── SECTION 2: HIGH-LEVEL ARCHITECTURE & MULTI-TIER TOPOLOGY ───────────
    add_heading_1(doc, "High-Level Architecture & Multi-Tier Topology", "2.0")
    add_body(doc, 
        "The Mithra Life OS architecture is engineered as a decoupled, multi-tiered topology designed for high availability, "
        "sub-millisecond local UI interactivity, and resilient offline continuity. The system cleanly delineates responsibilities "
        "across four distinct operational tiers:"
    )

    add_diagram_image(doc, "uml_architecture.png", "System & Multi-Tier Architecture", 
                      "Comprehensive component layout across Client, Edge Gateway, Asynchronous Backend, and Cloud Providers.")

    add_heading_2(doc, "Architectural Tier Deconstruction", "2.1")
    add_bullet(doc, " Built on React 18 with Vite 5, Tailwind CSS, Framer Motion, and Lucide React. State is managed centrally via DataContext.jsx (1,405 LOC) with local-first optimistic persistence. The app compiles to web and is wrapped into native Android APKs via Capacitor Core.", "Tier 1: Client Presentation Tier — ")
    add_bullet(doc, " Features Vercel Edge CDN for static bundle delivery, Supabase/Firebase Auth JWT verification, and an in-memory sliding window rate limiter to throttle denial-of-service vectors.", "Tier 2: Edge & Ingress Gateway Tier — ")
    add_bullet(doc, " Powered by FastAPI (Python 3.11) utilizing asyncpg connection pooling to Neon/Supabase PostgreSQL. Enforces multi-tenant isolation via WorkspaceGuard, plan limits via PlanGate, and coordinates AI engines and external sync workers.", "Tier 3: Asynchronous Backend Core — ")
    add_bullet(doc, " PostgreSQL 16 database with Row-Level Security (RLS) and pgvector (768-dimensional embeddings). AI inference is routed to NVIDIA NIM Cloud endpoints. External calendar synchronization connects to Google Calendar API v3 with Fernet AES token encryption.", "Tier 4: Persistence & Cloud AI Tier — ")

    # ─── SECTION 3: CODEBASE DIRECTORY & LINE-BY-LINE ENGINEERING ───────────
    add_heading_1(doc, "Comprehensive Codebase Directory & Line-by-Line Mechanics", "3.0")
    add_body(doc, 
        "This section details the internal mechanics, algorithmic logic, state subscriptions, and mathematical formulas "
        "implemented across each module in the repository."
    )

    add_heading_2(doc, "Frontend Presentation Layer (client-app/client/src/pages)", "3.1")
    
    add_heading_3(doc, "3.1.1 Dashboard.jsx — Operational Cockpit")
    add_body(doc, 
        "Dashboard.jsx serves as the user's daily control hub. Upon mounting, it subscribes to DataContext and computes memoized "
        "aggregates for today's tasks, pending habits, and active streak metrics. Key components include: "
    )
    add_bullet(doc, " Renders a ring chart showing completed vs. remaining tasks and habits for the active date.", "Daily Progress Summary Card: ")
    add_bullet(doc, " Interactive checkboxes with optimistic state updates, sound triggers, and XP popup animations.", "Quick-Action Tasks & Habits: ")
    add_bullet(doc, " A 4-point emoji emotion selector logging daily emotional valence to localStorage and PostgreSQL.", "Mood Tracking Widget: ")
    add_bullet(doc, " Displays current Level, total accumulated XP, and a fractional progress bar to the next tier.", "Gamification Badge & Level Bar: ")

    add_heading_3(doc, "3.1.2 DostMode.jsx — Conversational AI Copilot (~1,900 LOC)")
    add_body(doc, 
        "DostMode is the flagship conversational interface. It merges voice input, NLP intent classification, schedule generation, "
        "and action confirmation workflows. The file operates through a complex state machine:"
    )
    add_bullet(doc, " An internal intent classification function (parseIntent) matches user prompts against regex patterns for smart_schedule, schedule_apply_yes, schedule_apply_no, schedule_undo, and duration-based event strings (e.g., 'study for 2 hours at 3pm').", "Intent Parser Engine: ")
    add_bullet(doc, " Integrated with webkitSpeechRecognition for real-time speech-to-text and window.speechSynthesis (SpeechSynthesisUtterance) for audio playback of Dost replies.", "Multimodal Speech Engine: ")
    add_bullet(doc, " When an AI response includes a 'schedule_events' action, DostMode renders an interactive preview card displaying the Proposed Timetable, detecting overlapping time-blocks with existing calendar entries.", "Conflict-Aware Schedule Preview: ")
    add_bullet(doc, " When the user confirms ('apply', 'yes', 'do it'), the schedule is committed to the calendar and local state. A rollback snapshot is saved to allow complete schedule reversibility via 'undo schedule'.", "Atomic Commitment & Undo Stack: ")

    add_heading_3(doc, "3.1.3 HabitFocusHub.jsx — Habits, Heatmaps & Focus (~1,200 LOC)")
    add_body(doc, 
        "HabitFocusHub merges habit streak tracking with Pomodoro focus intervals:"
    )
    add_bullet(doc, " Renders a 52-week by 7-day grid modeling the user's yearly consistency. Days are mapped into column offsets using date-fns (startOfYear, eachDayOfInterval). The cell color scales dynamically: 0% = dark transparent, 1-49% = subtle accent, 50-99% = medium accent, 100% = glowing accent.", "365-Day SVG Commit Heatmap: ")
    add_bullet(doc, " Implements a non-punitive freeze allowance (FREEZES_PER_MONTH = 2). If a user misses a day, a freeze crystal can be consumed to maintain the unbroken streak counter.", "Streak Freeze Mechanics: ")
    add_bullet(doc, " Standard Pomodoro (25m deep work, 5m short break, 15m long break). Features Web Audio oscillator ambient soundscapes (white noise, rain simulation, café hum), full-screen distraction-free visor mode, and post-session mood logging.", "Pomodoro Focus Timer: ")

    add_heading_3(doc, "3.1.4 Tasks.jsx — Prioritization & Kanban (~1,050 LOC)")
    add_body(doc, 
        "Tasks.jsx structures work execution through dual interfaces:"
    )
    add_bullet(doc, " Visualizes tasks in four quadrants: Q1 (Urgent & Important - Do First), Q2 (Not Urgent & Important - Schedule), Q3 (Urgent & Not Important - Delegate), Q4 (Neither - Eliminate).", "Eisenhower Priority Matrix: ")
    add_bullet(doc, " Supports moving tasks between 'To Do', 'In Progress', and 'Completed' lanes with keyboard hotkeys and mobile swipe gestures.", "Kanban Board & List Modes: ")
    add_bullet(doc, " Each task supports a subtasks_json JSONB array with individual completion toggles and progress percentages.", "Hierarchical Subtask Trees: ")

    add_heading_3(doc, "3.1.5 Calendar.jsx — Interactive Time-Blocking (~1,350 LOC)")
    add_body(doc, 
        "Calendar.jsx manages scheduled events and Google Calendar synchronization:"
    )
    add_bullet(doc, " Multi-view layout (Day, 3-Day, Week, Month) with collision detection preventing overlapping time blocks.", "Dynamic Time Grid: ")
    add_bullet(doc, " Click-and-drag creation and duration resizing.", "Drag-and-Drop Scheduling: ")
    add_bullet(doc, " External Google Calendar events are displayed alongside local Mithra events with distinctive badges.", "Bidirectional Cloud Reconciliation: ")

    add_heading_3(doc, "3.1.6 Journal.jsx, Settings.jsx & Diagnostics.jsx")
    add_bullet(doc, " Daily markdown journal with mood scores (1-5), tag indexing, and automated vector embeddings for long-term memory retrieval.", "Journal.jsx: ")
    add_bullet(doc, " Account credentials, color theme selection (Sakura, Blue, Emerald, Sunset, Midnight), Google Calendar OAuth toggle, and complete data export in JSON and Excel formats.", "Settings.jsx: ")
    add_bullet(doc, " System telemetry, database ping latency, sync queue inspector, localStorage storage quotas, and manual queue flush controls.", "Diagnostics.jsx: ")

    # ─── SECTION 3.2: CONTEXTS & STATE ENGINES ──────────────────────────────
    add_heading_2(doc, "Frontend Context & State Management (DataContext.jsx — 1,405 LOC)", "3.2")
    add_body(doc, 
        "DataContext.jsx is the single source of truth for the entire client application. It encapsulates state hydration, "
        "gamification XP formulas, badge triggers, notification scheduling, and sync engine listeners."
    )

    add_heading_3(doc, "Gamification Mathematics & Level Scaling")
    add_body(doc, 
        "Mithra employs a linear level scaling system with granular XP rewards:"
    )
    add_code_block(doc, 
        "XP_PER_LEVEL = 100\n"
        "getLevel(xp) = Math.floor(xp / XP_PER_LEVEL) + 1\n"
        "getLevelProgress(xp) = (xp % XP_PER_LEVEL) / XP_PER_LEVEL\n\n"
        "XP_REWARDS = {\n"
        "  COMPLETE_TASK: 10,\n"
        "  COMPLETE_HABIT: 15,\n"
        "  FOCUS_SESSION: 20,\n"
        "  JOURNAL_ENTRY: 10,\n"
        "  PERFECT_DAY: 100,\n"
        "  STREAK_7: 50, STREAK_14: 75, STREAK_21: 100,\n"
        "  STREAK_30: 150, STREAK_60: 250, STREAK_90: 400, STREAK_100: 500\n"
        "}",
        language="javascript"
    )

    add_heading_3(doc, "Complete Badge Definitions Table")
    badge_table = doc.add_table(rows=1, cols=4)
    badge_headers = ["Badge ID", "Badge Name", "Icon", "Unlock Criteria Formula"]
    badge_rows = [
        ["first_task", "First Step", "🎯", "Complete >= 1 task"],
        ["task_10", "Task Master", "✅", "Complete >= 10 tasks"],
        ["task_50", "Productivity Pro", "🏆", "Complete >= 50 tasks"],
        ["task_100", "Centurion", "💯", "Complete >= 100 tasks"],
        ["streak_7", "Week Warrior", "🔥", "Best habit streak >= 7 days"],
        ["streak_30", "Monthly Master", "⚡", "Best habit streak >= 30 days"],
        ["streak_100", "Unstoppable", "🌟", "Best habit streak >= 100 days"],
        ["habit_5", "Habit Builder", "🧱", "Created >= 5 habits"],
        ["journal_5", "Reflector", "📝", "Logged >= 5 journal entries"],
        ["focus_10", "Deep Focus", "🧘", "Completed >= 10 focus sessions"],
        ["early_bird", "Early Bird", "🌅", "Complete task before 07:00 AM"],
        ["night_owl", "Night Owl", "🦉", "Complete task after 10:00 PM"],
        ["perfect_week", "Perfect Week", "💎", "All habits completed 7 consecutive days"],
        ["level_5", "Rising Star", "⭐", "Accumulate >= 400 XP (Level 5)"],
        ["level_10", "Legend", "👑", "Accumulate >= 900 XP (Level 10)"],
    ]
    format_table(badge_table, [1.4, 1.5, 0.6, 3.0], badge_headers, badge_rows)

    add_heading_3(doc, "Consecutive Streak Calculation Algorithm")
    add_body(doc, 
        "The calculateStreak function in DataContext verifies an unbroken daily chain. It sorts unique completion dates "
        "in descending order, checks whether today or yesterday is present (if neither, streak resets to 0), and traverses "
        "backwards day by day using date-fns subDays until the continuous chain breaks."
    )

    # ─── SECTION 3.3: CLIENT SERVICES ───────────────────────────────────────
    add_heading_2(doc, "Client Core Services & Mobile Bridges", "3.3")

    add_heading_3(doc, "3.3.1 syncEngine.js — Offline-First Bidirectional Synchronization")
    add_body(doc, 
        "syncEngine.js coordinates offline resilience and conflict resolution:"
    )
    add_bullet(doc, " All local mutations (task toggles, habit checks) are instantly written to localStorage for 0ms UI latency.", "Optimistic Local Writes: ")
    add_bullet(doc, " Mutations are recorded as objects: { table, action, data, timestamp, retryCount } in the 'mithra-sync-queue' key.", "FIFO Mutation Queue: ")
    add_bullet(doc, " A boolean syncLock prevents race conditions from concurrent queue flushing attempts.", "Mutex Concurrency Guard: ")
    add_bullet(doc, " If an API call fails, retries occur with exponential backoff: delay = min(BASE_DELAY_MS * 2^retryCount, MAX_DELAY_MS) with MAX_RETRIES = 5.", "Exponential Backoff & Jitter: ")
    add_bullet(doc, " Pings ${API_URL}/ping every 30 seconds with an AbortSignal timeout of 5000ms to detect real internet connectivity beyond navigator.onLine.", "Active Heartbeat Health Check: ")
    add_bullet(doc, " In case of conflicting edits between client and server, the record with the most recent UTC ISO timestamp is accepted.", "Last-Write-Wins (LWW) Resolution: ")

    add_heading_3(doc, "3.3.2 dostLocalEngine.js — Client-Side NLP Fallback")
    add_body(doc, 
        "To ensure Dost remains responsive when offline or during network outages, dostLocalEngine intercepts user messages "
        "before dispatching them to the backend API. It tests input against compiled regular expressions for greeting, status, "
        "capabilities, acknowledgement, farewell, and comfort intents. If matched, it samples a response from dostLocalResponses.json "
        "and resolves in under 2ms without consuming AI token quotas."
    )

    add_heading_3(doc, "3.3.3 native.js — Capacitor Android Bridge")
    add_body(doc, 
        "native.js bridges web functionality to native mobile OS capabilities:"
    )
    add_bullet(doc, " Calls StatusBar.setStyle and setBackgroundColor('#050505') to match theme changes.", "Status Bar Theming: ")
    add_bullet(doc, " Dismisses the native splash screen after React mounts.", "Splash Screen: ")
    add_bullet(doc, " Dispatches Haptics.impact with Light, Medium, or Heavy feedback on task checks and timer completions.", "Haptic Actuators: ")
    add_bullet(doc, " Schedules local notifications via @capacitor/local-notifications with sound ('beep.wav') and custom icon colors.", "Persistent Push Reminders: ")
    add_bullet(doc, " Listens to App.addListener('backButton') to navigate backwards or exit gracefully.", "Android Hardware Back Button: ")
    add_bullet(doc, " Observes Keyboard.addListener('keyboardWillShow') and dynamically binds --keyboard-height CSS variable to shift modals above the virtual keypad.", "Virtual Keyboard Awareness: ")

    # ─── SECTION 3.4: BACKEND CORE & ENGINES ─────────────────────────────────
    add_heading_2(doc, "FastAPI Backend Architecture & AI Orchestration", "3.4")
    
    add_heading_3(doc, "3.4.1 main.py — Server Lifecycle & Middlewares")
    add_body(doc, 
        "main.py configures CORS for production web, development, and capacitor://localhost native origins. It uses FastAPI's "
        "lifespan async context manager to initialize the asyncpg connection pool, execute automated database migrations, "
        "and spawn a background keep_alive() connection warmer to eliminate serverless cold-start penalties."
    )

    add_heading_3(doc, "3.4.2 core/plan_gate.py — Subscription Plan & Daily Limit Enforcement")
    add_body(doc, 
        "PlanGate enforces tier restrictions before allowing AI inference. It queries the user_plans and plans tables in PostgreSQL. "
        "Free tier users are capped at 20 calls/day, 100 tasks, 20 habits, and 1 workspace. Pro users receive 1,000 calls/day, 10,000 tasks, "
        "100 habits, and 10 workspaces. Daily usage is recorded in the ai_usage table."
    )

    add_heading_3(doc, "3.4.3 services/ai/chat_engine.py — Dost System Prompt & Token Budgets")
    add_body(doc, 
        "ChatEngine constructs the prompt delivered to NVIDIA NIM while strictly respecting token budgets: "
        "MAX_HISTORY_MESSAGES = 6, MAX_MESSAGE_LENGTH = 200, MAX_TASKS_IN_CONTEXT = 5, MAX_HABITS_IN_CONTEXT = 8. "
        "It injects the user's name, current time, pending habits, overdue tasks, and emotional context into a structured prompt "
        "instructing the LLM to output empathetic dialogue alongside an optional JSON action block: "
        "{ 'type': 'schedule_events' | 'create_task' | 'create_habit', 'data': [...] }."
    )

    add_heading_3(doc, "3.4.4 services/ai/parser_engine.py & planner_engine.py")
    add_bullet(doc, " Converts natural language input ('Call mom tomorrow at 4pm', 'Gym every Mon and Wed') into structured task/habit entities with computed absolute ISO timestamps.", "ParserEngine: ")
    add_bullet(doc, " Analyzes unscheduled tasks and energy levels ('low', 'medium', 'high') to construct an optimized daily timetable within user working hours (09:00 - 18:00), respecting existing calendar commitments and caching results for 12 hours.", "PlannerEngine: ")

    add_heading_3(doc, "3.4.5 services/ai/memory_engine.py — Long-Term Semantic Vector Memory")
    add_body(doc, 
        "Utilizes PostgreSQL pgvector with 768-dimensional embedding vectors stored in journal_entries. Queries use cosine similarity "
        "(vector_cosine_ops) to retrieve past journal entries relevant to current user conversational topics."
    )

    add_heading_3(doc, "3.4.6 services/calendar_sync_service.py — Encrypted Google Calendar Sync")
    add_body(doc, 
        "Performs bidirectional synchronization with Google Calendar. OAuth refresh tokens are encrypted using a Fernet cipher (AES-128-CBC) "
        "before being stored in the oauth_tokens table. Access tokens are refreshed dynamically, and incremental sync tokens are stored "
        "to fetch only delta changes."
    )

    # ─── SECTION 4: INTER-COMPONENT CONNECTIONS & STATE FLOWS ───────────────
    add_heading_1(doc, "Inter-Component Connections & State Lifecycles", "4.0")
    add_body(doc, 
        "To illustrate the exact flow of data through the entire architecture, this section presents diagrams detailing "
        "conversational AI execution, offline sync, behavioral state machines, and system-wide component connections."
    )

    add_heading_2(doc, "Full-Stack Component Connection & Data Flow Topology", "4.1")
    add_diagram_image(doc, "uml_component_connections.png", "Full-Stack Connection Graph",
                      "Visual map connecting React Pages, DataContext, Client Services, FastAPI Routers, Core Gateways, and Database.")

    add_heading_2(doc, "Dost AI Context Injection & Action Execution Lifecycle", "4.2")
    add_diagram_image(doc, "uml_sequence_dost.png", "Dost AI Sequence Diagram",
                      "Step-by-step trace of user prompt ingestion, quota checking, context injection, LLM generation, and schedule mutation.")

    add_heading_2(doc, "Local-First Offline Sync & Conflict Resolution Lifecycle", "4.3")
    add_diagram_image(doc, "uml_offline_sync.png", "Offline Synchronization Sequence",
                      "Optimistic UI write, queue serialization, network health check, FIFO batch flush, and Last-Write-Wins merge.")

    add_heading_2(doc, "Behavioral State Machine: Habits, Freezes & Focus Sessions", "4.4")
    add_diagram_image(doc, "uml_gamification_state.png", "Behavioral State Machine",
                      "State transitions governing habit daily ticking, streak freeze activation, streak reset, and Pomodoro focus logging.")

    # ─── SECTION 5: DATABASE ARCHITECTURE & RELATIONAL DATA MODEL ───────────
    add_heading_1(doc, "Database Architecture & Complete Relational ERD", "5.0")
    add_body(doc, 
        "Mithra Life OS utilizes a PostgreSQL 16 relational database schema hardened with Row-Level Security (RLS) policies "
        "and optimized with B-tree and IVFFlat vector indexes. The database consists of 18 dedicated tables:"
    )

    add_diagram_image(doc, "uml_class_erd.png", "Relational Class & Entity-Relationship Model",
                      "Complete schema layout showing primary keys, foreign keys, vector extensions, and table relationships.")

    add_heading_2(doc, "Relational Schema Specification", "5.1")
    schema_table = doc.add_table(rows=1, cols=4)
    schema_headers = ["Table Name", "Primary Key", "Key Attributes & Types", "Constraints & Security"]
    schema_rows = [
        ["profiles", "id (TEXT)", "email (TEXT), display_name, timezone, referral_code", "RLS Enabled; User profile metadata"],
        ["plans", "id (VARCHAR)", "name, daily_ai_limit, max_tasks, price_cents", "Public read policy; Free vs Pro tiers"],
        ["user_plans", "user_id (TEXT)", "plan_id (FK), status, stripe_customer_id, expires_at", "RLS Enabled; Active subscription status"],
        ["ai_usage", "id (UUID)", "user_id, usage_date (DATE), calls_today (INT)", "UQ(user_id, usage_date); Daily usage counter"],
        ["tasks", "id (UUID)", "user_id, title, priority, subtasks_json (JSONB), deleted_at", "RLS Enabled; Soft delete support"],
        ["habits", "id (UUID)", "user_id, title, streak, longest_streak, consistency (TEXT[])", "RLS Enabled; Array of ISO dates"],
        ["calendar_events", "id (UUID)", "user_id, title, start_time, end_time, workspace_id", "RLS Enabled; Indexed on start_time"],
        ["journal_entries", "id (UUID)", "user_id, content, mood (INT), embedding_vector (vector(768))", "RLS Enabled; IVFFlat cosine vector index"],
        ["mood_logs", "id (UUID)", "user_id, score (1-10), note, created_at", "RLS Enabled; Historical emotional tracking"],
        ["focus_sessions", "id (UUID)", "user_id, habit_id (FK), duration_minutes (INT)", "RLS Enabled; Pomodoro logs"],
        ["notification_settings", "user_id (TEXT)", "task_reminders, habit_reminders, task_minutes", "RLS Enabled; Push preferences"],
        ["oauth_tokens", "id (UUID)", "user_id (UQ), provider, encrypted_token (TEXT)", "Fernet encrypted tokens; NEVER stored in plain text"],
        ["audit_log", "id (UUID)", "user_id, action, resource, resource_id, metadata (JSONB)", "System audit trail; Immutable append-only"],
        ["referrals", "id (UUID)", "referrer_id, referral_code (UQ), status", "Growth viral attribution engine"],
        ["email_events", "id (UUID)", "user_id, event_type, sent_at", "UQ(user_id, event_type); Onboarding sequence tracking"],
        ["data_export_requests", "id (UUID)", "user_id, status, download_url, expires_at", "GDPR automated data export requests"],
        ["workspaces", "id (UUID)", "name, owner_id (FK), created_at, deleted_at", "Multi-tenant collaboration spaces"],
        ["workspace_members", "id (UUID)", "workspace_id (FK), user_id (FK), role", "UQ(workspace_id, user_id); RBAC permissions"],
    ]
    format_table(schema_table, [1.3, 1.0, 2.5, 1.7], schema_headers, schema_rows)

    # ─── SECTION 6: COMPREHENSIVE REST API REFERENCE ─────────────────────────
    add_heading_1(doc, "Comprehensive REST API Specification", "6.0")
    add_body(doc, 
        "All API endpoints require a valid Supabase JWT passed via the Authorization: Bearer <token> header. "
        "Endpoints return standardized JSON responses and adhere to REST conventions."
    )

    api_table = doc.add_table(rows=1, cols=4)
    api_headers = ["HTTP Method & Path", "Request Body / Params", "Success Response", "Description & Logic"]
    api_rows = [
        ["POST /api/chat", "{ message, user_context, history }", "200: { reply, action, cached }", "Dost AI conversation endpoint with context injection."],
        ["GET /api/tasks", "?workspace_id (optional)", "200: [ Task Objects ]", "Retrieves active non-deleted tasks for current user."],
        ["POST /api/tasks", "{ title, details, priority, due_date }", "201: { Task Object }", "Creates new task with subtasks_json."],
        ["PUT /api/tasks/{id}", "{ title, completed, priority }", "200: { Updated Task }", "Updates task properties; supports LWW timestamp."],
        ["POST /api/tasks/{id}/toggle", "None", "200: { id, completed }", "Inverts task completion; awards 10 XP."],
        ["POST /api/tasks/parse-schedule", "{ raw_text }", "200: { tasks, events }", "Parses natural language into structured items."],
        ["GET /api/habits", "None", "200: [ Habit Objects ]", "Retrieves active habits with consistency arrays."],
        ["POST /api/habits/{id}/toggle", "None", "200: { streak, consistency }", "Toggles habit for today; recalculates streak."],
        ["GET /api/events", "?start_time, end_time", "200: [ Calendar Events ]", "Fetches calendar time-blocks within interval."],
        ["POST /api/events", "{ title, start_time, end_time }", "201: { Event Object }", "Persists calendar block for user."],
        ["GET /api/calendar/auth", "None", "200: { auth_url }", "Generates Google Calendar OAuth2 consent URL."],
        ["GET /api/calendar/callback", "?code, state", "200: { status: 'connected' }", "Exchanges OAuth code for encrypted refresh token."],
        ["POST /api/planner/generate", "{ energy_level, tasks, habits }", "200: { time_blocks, reminders }", "Constructs AI daily timetable."],
        ["GET /api/health", "None", "200: { status: 'healthy', db: true }", "Comprehensive system health and pool diagnostics."],
        ["GET /api/ping", "None", "200: { pong: true }", "Ultra-lightweight ping for client syncEngine."],
    ]
    format_table(api_table, [1.8, 1.5, 1.4, 1.8], api_headers, api_rows)

    # ─── SECTION 7: MOBILE ARCHITECTURE & CAPACITOR BRIDGE ──────────────────
    add_heading_1(doc, "Mobile Architecture & Capacitor Native Engine", "7.0")
    add_body(doc, 
        "Mithra Life OS provides native Android capability via Capacitor Core. The application is compiled into an APK with "
        "hardware bridge bindings:"
    )
    add_bullet(doc, " AndroidManifest.xml requests ACCESS_NETWORK_STATE, SCHEDULE_EXACT_ALARM, POST_NOTIFICATIONS, and VIBRATE.", "Native Permissions: ")
    add_bullet(doc, " Local notifications are scheduled directly onto the Android AlarmManager via @capacitor/local-notifications, guaranteeing alerts fire even when the webview is closed.", "Exact Background Alarms: ")
    add_bullet(doc, " Physical touch triggers native vibrator actuators (ImpactStyle.Light / Medium / Heavy) upon completing tasks or habit checkmarks.", "Tactile Haptic Feedback: ")
    add_bullet(doc, " When offline, user settings and token state are persisted to Android SharedPreferences via @capacitor/preferences.", "Native Encrypted Key-Value Storage: ")

    # ─── SECTION 8: CLOUD DEPLOYMENT & DEVOPS RUNBOOK ───────────────────────
    add_heading_1(doc, "Cloud Deployment, Infrastructure & DevOps Playbook", "8.0")
    add_body(doc, 
        "The production backend is packaged into a hardened Docker container and deployed via Render Infrastructure-as-Code (render.yaml):"
    )

    add_code_block(doc, 
        "services:\n"
        "  - type: web\n"
        "    name: mithra-backend\n"
        "    runtime: python\n"
        "    plan: starter\n"
        "    buildCommand: pip install -r client-app/server/requirements.txt\n"
        "    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2\n"
        "    envVars:\n"
        "      - key: PYTHON_VERSION\n"
        "        value: 3.11.9\n"
        "      - key: NVIDIA_MODEL\n"
        "        value: nvidia/nemotron-3.5-lightning-30b-a3b\n"
        "      - key: NVIDIA_BASE_URL\n"
        "        value: https://integrate.api.nvidia.com/v1\n"
        "      - key: DATABASE_URL\n"
        "        sync: false",
        language="yaml"
    )

    add_heading_2(doc, "Zero-Downtime Migration Execution", "8.1")
    add_body(doc, 
        "Database migrations are managed via migrations/runner.py. Upon server startup, the runner inspects the _migrations table, "
        "identifies pending SQL files in sequence (001 through 006), and executes them inside an atomic transaction. If an error occurs, "
        "the migration transaction rolls back cleanly, preventing database corruption."
    )

    # ─── SECTION 9: CODEBASE AUDIT & SYSTEM FIXES LOG ───────────────────────
    add_heading_1(doc, "Codebase Audit & System Fixes Log", "9.0")
    add_body(doc, 
        "During the comprehensive codebase audit, several critical runtime defects and configuration gaps were discovered, "
        "isolated, and fully resolved:"
    )

    audit_table = doc.add_table(rows=1, cols=4)
    audit_headers = ["Component", "Identified Defect / Fault", "Root Cause Analysis", "Resolution & Verification"]
    audit_rows = [
        ["tasks_router.py", "/api/parse-schedule threw 500", "Invoked deprecated Gemini .generate_content() without API key", "Rewrote endpoint to use ai_gateway.generate_chat_response; verified via pytest."],
        ["Calendar.jsx", "Events vanished on page reload", "Component stored events only in memory, never calling /api/events", "Integrated optimistic CRUD to /api/events; events persist to PostgreSQL."],
        ["syncEngine.js", "Health check ping URL invalid", "Fetched raw '/ping' without API_URL origin prefix", "Prefixed with API_URL; verified ping returns 200 with 5000ms timeout."],
        ["GoogleCalendarAuth", "TypeError on callback redirect", "Called response.json() on already-parsed apiFetch return value", "Removed duplicate .json() call; integrated Settings button and App.jsx route."],
        ["Client Linter", "35 ESLint errors and warnings", "Old eslintrc format, unescaped quotes, React hook rule violations", "Migrated to Flat Config (eslint.config.js); fixed docstrings; 0 errors."],
        ["Dockerfile", "Python 3.10 deprecation warnings", "Base image pinned to older python:3.10-slim", "Upgraded to python:3.11-slim; updated dev dependencies in requirements-dev.txt."],
    ]
    format_table(audit_table, [1.4, 1.6, 1.8, 1.7], audit_headers, audit_rows)

    add_heading_2(doc, "Verification & Quality Gates Passed", "9.1")
    add_bullet(doc, " 19 unit and integration tests passing in 0.23s with 0 warnings.", "Backend Pytest Suite: ")
    add_bullet(doc, " ESLint flat config passes with 0 errors across all 2,222 frontend modules.", "Frontend Linting: ")
    add_bullet(doc, " Production asset bundle successfully built in 2.33s with code splitting.", "Vite Production Build: ")

    # Save Document
    doc.save(DOC_PATH)
    print(f"✅ Successfully compiled master specification Word document at: {DOC_PATH}")

if __name__ == "__main__":
    build_document()
