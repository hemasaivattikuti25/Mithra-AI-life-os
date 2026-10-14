"""
Generate comprehensive high-resolution professional UML diagrams for Mithra Life OS documentation.
Includes 6 detailed diagrams:
1. Component & System Architecture (Tiered Topology)
2. Dost AI Context Injection & Action Execution Sequence
3. Relational Class & Entity-Relationship Data Model (ERD)
4. Offline-First Sync & Conflict Resolution Sequence
5. Behavioral State Machine (Habit Streaks, Freeze Power-ups, XP & Focus Engine)
6. Full-Stack Inter-Component Connection & Data Flow Topology
"""
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs("docs/diagrams", exist_ok=True)
plt.rcParams['font.sans-serif'] = 'Helvetica', 'Arial', 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAM 1: Component & Architecture Diagram
# ─────────────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

ax.text(6.5, 7.6, "Mithra Life OS — Enterprise Full-Stack Architecture", 
        fontsize=16, fontweight='bold', color='#38bdf8', ha='center')
ax.text(6.5, 7.25, "Client (SPA / Capacitor) • Edge Gateway • Async Backend Core • Database & AI Services", 
        fontsize=10, color='#94a3b8', ha='center')

def draw_tier(x, y, w, h, title, border_color='#334155', bg_color='#1e293b'):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1,rounding_size=0.15",
                                fc=bg_color, ec=border_color, linewidth=1.5)
    ax.add_patch(box)
    ax.text(x + w/2, y + h - 0.35, title, fontsize=11, fontweight='bold', color='#f8fafc', ha='center')

def draw_component(x, y, w, h, title, subtitle="", bg='#0284c7', text_color='#ffffff'):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.1",
                                fc=bg, ec='#38bdf8', linewidth=1)
    ax.add_patch(box)
    if subtitle:
        ax.text(x + w/2, y + h/2 + 0.12, title, fontsize=9, fontweight='bold', color=text_color, ha='center', va='center')
        ax.text(x + w/2, y + h/2 - 0.15, subtitle, fontsize=7.5, color='#e0f2fe', ha='center', va='center')
    else:
        ax.text(x + w/2, y + h/2, title, fontsize=9, fontweight='bold', color=text_color, ha='center', va='center')

# 1. Client Tier
draw_tier(0.5, 0.6, 2.7, 6.3, "Client Tier (Web / Mobile)", '#334155', '#1e293b')
draw_component(0.7, 5.3, 2.3, 0.8, "React 18 SPA", "Vite + Tailwind + Lucide", '#0369a1')
draw_component(0.7, 4.2, 2.3, 0.8, "DataContext Store", "XP, Habits, Tasks, Sync", '#0284c7')
draw_component(0.7, 3.1, 2.3, 0.8, "syncEngine.js", "Offline Queue & Retry", '#0ea5e9')
draw_component(0.7, 2.0, 2.3, 0.8, "dostLocalEngine", "Client Intent Classifier", '#38bdf8', '#0f172a')
draw_component(0.7, 0.9, 2.3, 0.8, "Capacitor Native Bridge", "Android APK • Haptics • Push", '#64748b')

# 2. Gateway Tier
draw_tier(3.6, 1.5, 2.5, 5.4, "Gateway & Ingress Tier", '#334155', '#1e293b')
draw_component(3.8, 5.1, 2.1, 0.9, "Vercel Edge / Static CDN", "HTTP/2 Asset Delivery", '#475569')
draw_component(3.8, 3.8, 2.1, 0.9, "Supabase / Firebase Auth", "JWT Bearer Token Verifier", '#f59e0b', '#0f172a')
draw_component(3.8, 2.5, 2.1, 0.9, "Rate Limiting Engine", "Sliding Window IP / User", '#ef4444')

# 3. Backend Core
draw_tier(6.5, 0.6, 3.2, 6.3, "FastAPI Backend Core (Python 3.11)", '#334155', '#1e293b')
draw_component(6.8, 5.3, 2.6, 0.8, "FastAPI Application", "Async Endpoints & Routers", '#047857')
draw_component(6.8, 4.2, 2.6, 0.8, "Core Middleware", "WorkspaceGuard • PlanGate", '#059669')
draw_component(6.8, 3.1, 2.6, 0.8, "AI Orchestration Engines", "Chat • Planner • Parser • Memory", '#10b981')
draw_component(6.8, 2.0, 2.6, 0.8, "External Sync Services", "Google Calendar OAuth Sync", '#14b8a6')
draw_component(6.8, 0.9, 2.6, 0.8, "asyncpg Pooler & Migrations", "Idempotent Schema Runner", '#0d9488')

# 4. Persistence & External AI
draw_tier(10.1, 0.6, 2.5, 6.3, "Data & AI Providers", '#334155', '#1e293b')
draw_component(10.3, 5.3, 2.1, 0.8, "NVIDIA NIM Cloud", "Nemotron / Mistral-Large", '#7c3aed')
draw_component(10.3, 4.2, 2.1, 0.8, "Neon / Supabase PG", "PostgreSQL 16 + RLS", '#6d28d9')
draw_component(10.3, 3.1, 2.1, 0.8, "pgvector Extension", "768-dim Journal Vectors", '#8b5cf6')
draw_component(10.3, 2.0, 2.1, 0.8, "Google Calendar API", "REST v3 Two-Way Sync", '#4285f4')
draw_component(10.3, 0.9, 2.1, 0.8, "AES Fernet Token Vault", "Encrypted Refresh Tokens", '#64748b')

def connect(p1, p2, label=""):
    arrow = patches.FancyArrowPatch(p1, p2, arrowstyle="->", mutation_scale=14, 
                                   color='#38bdf8', linewidth=1.5)
    ax.add_patch(arrow)
    if label:
        mx = (p1[0] + p2[0]) / 2
        my = (p1[1] + p2[1]) / 2 + 0.15
        ax.text(mx, my, label, fontsize=7.5, color='#94a3b8', ha='center',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#0f172a', edgecolor='none'))

connect((3.0, 4.6), (3.8, 4.2), "HTTPS / Auth")
connect((5.9, 4.2), (6.8, 4.6), "Validated JWT")
connect((9.4, 3.5), (10.3, 5.7), "LLM Inference")
connect((9.4, 1.3), (10.3, 4.6), "SQL Pool")
connect((9.4, 2.4), (10.3, 2.4), "OAuth Sync")

plt.tight_layout()
plt.savefig("docs/diagrams/uml_architecture.png", facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
plt.close()
print("Saved docs/diagrams/uml_architecture.png")

# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAM 2: Dost AI Context Injection & Action Execution Sequence
# ─────────────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8.5)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

ax.text(6.5, 8.1, "UML Sequence: Dost AI Context Assembly, Inference & Action Execution", 
        fontsize=15, fontweight='bold', color='#38bdf8', ha='center')

actors = [
    ("User Interface\n(DostMode.jsx)", 1.2),
    ("dostLocalEngine\n(Regex/Cache)", 3.4),
    ("Chat Router &\nPlanGate", 5.6),
    ("ChatEngine &\nContext Aggregator", 7.8),
    ("NVIDIA NIM\n(LLM Service)", 10.0),
    ("PostgreSQL DB\n(Pooler)", 12.0),
]

for name, x in actors:
    box = patches.FancyBboxPatch((x - 0.9, 7.2), 1.8, 0.65, boxstyle="round,pad=0.05",
                                fc='#1e293b', ec='#38bdf8', lw=1.2)
    ax.add_patch(box)
    ax.text(x, 7.52, name, fontsize=8, fontweight='bold', color='#f8fafc', ha='center', va='center')
    ax.plot([x, x], [0.4, 7.2], color='#334155', linestyle='--', lw=1.2)

def seq_msg(x1, x2, y, text, is_reply=False, is_self=False):
    if is_self:
        ax.plot([x1, x1 + 0.4, x1 + 0.4, x1], [y, y, y - 0.3, y - 0.3], color='#f59e0b', lw=1.2)
        arrow = patches.FancyArrowPatch((x1 + 0.4, y - 0.3), (x1, y - 0.3), arrowstyle="->",
                                       mutation_scale=10, color='#f59e0b', lw=1.2)
        ax.add_patch(arrow)
        ax.text(x1 + 0.5, y - 0.15, text, fontsize=7.5, color='#fbbf24', va='center')
    else:
        color = '#10b981' if is_reply else '#38bdf8'
        ls = '--' if is_reply else '-'
        arrow = patches.FancyArrowPatch((x1, y), (x2, y), arrowstyle="->", mutation_scale=12,
                                       color=color, linestyle=ls, lw=1.2)
        ax.add_patch(arrow)
        ax.text((x1 + x2)/2, y + 0.12, text, fontsize=7.5, color='#e2e8f0', ha='center')

seq_msg(1.2, 3.4, 6.7, "1. User submits: 'Gym at 6pm tomorrow & schedule deep work'")
seq_msg(3.4, 3.4, 6.2, "classifyLocal() -> Miss (Complex multi-entity prompt)", is_self=True)
seq_msg(3.4, 5.6, 5.6, "2. POST /api/chat {message, user_context, history}")
seq_msg(5.6, 12.0, 5.1, "3. Check Daily Plan Quota & Increment ai_usage")
seq_msg(12.0, 5.6, 4.6, "Quota Approved (e.g., Call 14 of 1,000)", is_reply=True)
seq_msg(5.6, 7.8, 4.1, "4. build_system_prompt() with Injected User Context")
seq_msg(7.8, 12.0, 3.6, "5. Fetch Overdue Tasks, Today Habits & Calendar Blocks")
seq_msg(12.0, 7.8, 3.1, "Contextual Records Returned", is_reply=True)
seq_msg(7.8, 10.0, 2.6, "6. Forward Enriched Prompt to NVIDIA NIM REST API")
seq_msg(10.0, 7.8, 2.1, "7. LLM Streamed JSON Response: {reply, action: {type: 'schedule_events'}}", is_reply=True)
seq_msg(7.8, 5.6, 1.6, "8. Parse & Validate Action Schema", is_reply=True)
seq_msg(5.6, 1.2, 1.1, "9. Return {reply, action, cached: false} to Frontend", is_reply=True)
seq_msg(1.2, 1.2, 0.6, "Render Dost message + Interactive Conflict-Aware Schedule Card", is_self=True)

plt.tight_layout()
plt.savefig("docs/diagrams/uml_sequence_dost.png", facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
plt.close()
print("Saved docs/diagrams/uml_sequence_dost.png")

# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAM 3: UML Class / Entity Relationship Diagram (Database Data Models)
# ─────────────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 8.5), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8.5)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

ax.text(6.5, 8.1, "UML Class & Entity-Relationship Data Model (PostgreSQL 16 Schema)", 
        fontsize=15, fontweight='bold', color='#38bdf8', ha='center')

def draw_class(x, y, w, h, title, fields, border_color='#38bdf8', header_color='#0284c7'):
    hh = 0.45
    hb = patches.FancyBboxPatch((x, y + h - hh), w, hh, boxstyle="square,pad=0.0",
                               fc=header_color, ec=border_color, lw=1.2)
    ax.add_patch(hb)
    ax.text(x + w/2, y + h - hh/2, title, fontsize=9, fontweight='bold', color='#ffffff', ha='center', va='center')
    
    bb = patches.FancyBboxPatch((x, y), w, h - hh, boxstyle="square,pad=0.0",
                               fc='#1e293b', ec=border_color, lw=1.2)
    ax.add_patch(bb)
    
    line_y = y + h - hh - 0.22
    for f in fields:
        ax.text(x + 0.12, line_y, f, fontsize=7.2, color='#e2e8f0', va='center')
        line_y -= 0.20

# Profiles
draw_class(0.4, 4.8, 2.7, 3.0, "UserProfile (profiles)", [
    "+ id: TEXT [PK]",
    "+ email: TEXT NOT NULL",
    "+ display_name: TEXT",
    "+ timezone: TEXT = 'UTC'",
    "+ referral_code: VARCHAR(12)",
    "+ tos_accepted_at: TIMESTAMPTZ",
    "+ created_at: TIMESTAMPTZ",
    "+ updated_at: TIMESTAMPTZ",
], '#38bdf8', '#0284c7')

# Tasks
draw_class(3.4, 4.6, 2.8, 3.2, "Task (tasks)", [
    "+ id: UUID [PK]",
    "+ user_id: TEXT [FK -> profiles]",
    "+ title: TEXT NOT NULL",
    "+ details: TEXT",
    "+ list_id: TEXT = 'default'",
    "+ priority: VARCHAR(20)",
    "+ completed: BOOLEAN = FALSE",
    "+ starred: BOOLEAN = FALSE",
    "+ due_date: TIMESTAMPTZ",
    "+ subtasks_json: JSONB",
    "+ deleted_at: TIMESTAMPTZ",
], '#10b981', '#059669')

# Habits
draw_class(6.5, 4.6, 2.9, 3.2, "Habit (habits)", [
    "+ id: UUID [PK]",
    "+ user_id: TEXT [FK -> profiles]",
    "+ title: TEXT NOT NULL",
    "+ category: TEXT",
    "+ color: TEXT",
    "+ streak: INT = 0",
    "+ longest_streak: INT = 0",
    "+ consistency: TEXT[]",
    "+ repeat_days: INT[]",
    "+ streak_goal: INT = 30",
    "+ deleted_at: TIMESTAMPTZ",
], '#f59e0b', '#d97706')

# Calendar Events
draw_class(9.7, 4.8, 2.9, 3.0, "CalendarEvent (calendar_events)", [
    "+ id: UUID [PK]",
    "+ user_id: TEXT [FK -> profiles]",
    "+ title: TEXT NOT NULL",
    "+ start_time: TIMESTAMPTZ",
    "+ end_time: TIMESTAMPTZ",
    "+ category: TEXT = 'Personal'",
    "+ workspace_id: UUID [Opt]",
    "+ created_at: TIMESTAMPTZ",
    "+ updated_at: TIMESTAMPTZ",
], '#8b5cf6', '#7c3aed')

# Journal Entries
draw_class(0.4, 1.0, 2.7, 3.2, "JournalEntry (journal_entries)", [
    "+ id: UUID [PK]",
    "+ user_id: TEXT [FK -> profiles]",
    "+ content: TEXT NOT NULL",
    "+ mood: INT (1-5)",
    "+ tags: TEXT[]",
    "+ date: DATE = CURRENT_DATE",
    "+ embedding_vector: vector(768)",
    "+ deleted_at: TIMESTAMPTZ",
], '#ec4899', '#db2777')

# Focus Sessions
draw_class(3.4, 1.2, 2.8, 2.8, "FocusSession (focus_sessions)", [
    "+ id: UUID [PK]",
    "+ user_id: TEXT [FK -> profiles]",
    "+ habit_id: UUID [FK -> habits]",
    "+ duration_minutes: INT = 25",
    "+ workspace_id: UUID [Opt]",
    "+ created_at: TIMESTAMPTZ",
], '#06b6d4', '#0891b2')

# AI Usage & Plans
draw_class(6.5, 1.0, 2.9, 3.0, "AIUsage & Plans (ai_usage/plans)", [
    "+ user_id: TEXT [PK, FK]",
    "+ plan_id: VARCHAR(50) = 'free'",
    "+ usage_date: DATE = CURRENT_DATE",
    "+ calls_today: INT = 1",
    "+ daily_ai_limit: INT = 20",
    "+ stripe_customer_id: VARCHAR",
    "+ expires_at: TIMESTAMPTZ",
], '#ef4444', '#dc2626')

# OAuth Tokens
draw_class(9.7, 1.2, 2.9, 2.8, "OAuthToken (oauth_tokens)", [
    "+ id: UUID [PK]",
    "+ user_id: TEXT NOT NULL UNIQUE",
    "+ provider: VARCHAR(50) = 'google'",
    "+ encrypted_token: TEXT [Fernet]",
    "+ token_type: VARCHAR(50)",
    "+ authorized_at: TIMESTAMPTZ",
    "+ last_used_at: TIMESTAMPTZ",
], '#64748b', '#475569')

# Connective relationship lines
def draw_rel(x1, y1, x2, y2, card1="1", card2="*"):
    ax.plot([x1, x2], [y1, y2], color='#64748b', lw=1.2, linestyle=':')
    ax.text(x1 + 0.1, y1, card1, fontsize=8, color='#94a3b8')
    ax.text(x2 - 0.2, y2, card2, fontsize=8, color='#94a3b8')

draw_rel(3.1, 6.2, 3.4, 6.2, "1", "0..*")
draw_rel(3.1, 5.5, 6.5, 5.5, "1", "0..*")
draw_rel(3.1, 5.0, 9.7, 5.5, "1", "0..*")
draw_rel(1.7, 4.8, 1.7, 4.2, "1", "0..*")
draw_rel(6.5, 4.8, 4.8, 4.0, "1", "0..*")
draw_rel(3.1, 4.8, 6.5, 3.8, "1", "1..*")
draw_rel(3.1, 4.8, 9.7, 3.8, "1", "0..1")

plt.tight_layout()
plt.savefig("docs/diagrams/uml_class_erd.png", facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
plt.close()
print("Saved docs/diagrams/uml_class_erd.png")

# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAM 4: Sequence Diagram — Bidirectional Offline State Sync Engine
# ─────────────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8.5)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

ax.text(6.5, 8.1, "UML Sequence: Local-First Offline Mutation Queue & Conflict Reconciliation", 
        fontsize=15, fontweight='bold', color='#38bdf8', ha='center')

sync_actors = [
    ("User Action", 1.2),
    ("DataContext State\n(React Hooks)", 3.6),
    ("localStorage / IDB\n(Instant Cache)", 6.2),
    ("syncEngine.js\n(Mutation Queue)", 8.8),
    ("FastAPI Backend\n(PostgreSQL)", 11.4),
]

for name, x in sync_actors:
    box = patches.FancyBboxPatch((x - 1.0, 7.2), 2.0, 0.65, boxstyle="round,pad=0.05",
                                fc='#1e293b', ec='#38bdf8', lw=1.2)
    ax.add_patch(box)
    ax.text(x, 7.52, name, fontsize=8, fontweight='bold', color='#f8fafc', ha='center', va='center')
    ax.plot([x, x], [0.4, 7.2], color='#334155', linestyle='--', lw=1.2)

seq_msg(1.2, 3.6, 6.7, "1. User checks habit or creates task offline")
seq_msg(3.6, 6.2, 6.1, "2. Optimistic Mutation in Local Cache (0ms UI Latency)")
seq_msg(6.2, 3.6, 5.6, "3. Confirm Cache Persistence", is_reply=True)
seq_msg(3.6, 8.8, 5.1, "4. enqueue({table, action: 'update', data, timestamp})")
seq_msg(8.8, 8.8, 4.6, "Deduplicate & Append to mithra-sync-queue in storage", is_self=True)
seq_msg(8.8, 11.4, 4.0, "5. Periodic Ping /api/ping with 5000ms AbortSignal")
seq_msg(11.4, 8.8, 3.4, "6. Network Restored: 200 OK Response", is_reply=True)
seq_msg(8.8, 8.8, 2.9, "Acquire syncLock mutex; begin FIFO queue processing", is_self=True)
seq_msg(8.8, 11.4, 2.3, "7. Batch Flush: PUT /api/habits/{id}/toggle with client_timestamp")
seq_msg(11.4, 8.8, 1.7, "8. Execute ACID Row Mutation & Return Updated Record", is_reply=True)
seq_msg(8.8, 8.8, 1.2, "Verify Last-Write-Wins (LWW); remove item from queue", is_self=True)
seq_msg(8.8, 3.6, 0.7, "9. notify('synced', {table: 'habits', flushedCount: 1})", is_reply=True)

plt.tight_layout()
plt.savefig("docs/diagrams/uml_offline_sync.png", facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
plt.close()
print("Saved docs/diagrams/uml_offline_sync.png")

# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAM 5: State Machine Diagram — Habit Streaks, Freezes & Focus Engine
# ─────────────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

ax.text(6.5, 7.6, "UML State Machine: Habit Lifecycles, Streak Freezes & Focus Sessions", 
        fontsize=15, fontweight='bold', color='#38bdf8', ha='center')

def draw_state(x, y, w, h, title, subtext="", color='#0284c7'):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.15",
                                fc='#1e293b', ec=color, linewidth=1.5)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2 + (0.12 if subtext else 0), title, fontsize=9, fontweight='bold', 
            color='#ffffff', ha='center', va='center')
    if subtext:
        ax.text(x + w/2, y + h/2 - 0.18, subtext, fontsize=7.2, color='#94a3b8', ha='center', va='center')

# Initial pseudo state
ax.plot(0.8, 6.2, marker='o', markersize=14, color='#38bdf8')
ax.plot(0.8, 6.2, marker='o', markersize=8, color='#0f172a')

# States
draw_state(1.8, 5.7, 2.4, 1.0, "PENDING_TODAY", "Habit not yet checked", '#38bdf8')
draw_state(5.4, 5.7, 2.5, 1.0, "COMPLETED_TODAY", "+15 XP • consistency updated", '#10b981')
draw_state(9.0, 5.7, 2.6, 1.0, "STREAK_ACTIVE", "Streak count incremented", '#f59e0b')

draw_state(1.8, 3.2, 2.4, 1.0, "DAY_MISSED", "Midnight rollover detected", '#ef4444')
draw_state(5.4, 3.2, 2.5, 1.0, "STREAK_FROZEN", "Ice freeze applied (max 2/mo)", '#06b6d4')
draw_state(9.0, 3.2, 2.6, 1.0, "STREAK_RESET", "Streak reset to 0; history kept", '#64748b')

draw_state(1.8, 0.8, 2.4, 1.1, "FOCUS_IDLE", "Pomodoro timer ready (25m)", '#8b5cf6')
draw_state(5.4, 0.8, 2.5, 1.1, "FOCUS_RUNNING", "Ambient audio active • Tick", '#a855f7')
draw_state(9.0, 0.8, 2.6, 1.1, "SESSION_LOGGED", "+20 XP • DB record committed", '#d946ef')

# Transitions
def draw_trans(p1, p2, label="", color='#38bdf8'):
    arrow = patches.FancyArrowPatch(p1, p2, arrowstyle="->", mutation_scale=12,
                                   color=color, linewidth=1.3)
    ax.add_patch(arrow)
    if label:
        mx = (p1[0] + p2[0]) / 2
        my = (p1[1] + p2[1]) / 2 + 0.12
        ax.text(mx, my, label, fontsize=7.5, color='#cbd5e1', ha='center',
                bbox=dict(boxstyle='round,pad=0.15', facecolor='#0f172a', edgecolor='none'))

draw_trans((0.9, 6.2), (1.8, 6.2), "Create")
draw_trans((4.2, 6.2), (5.4, 6.2), "toggleHabit()")
draw_trans((7.9, 6.2), (9.0, 6.2), "Streak >= 1")
draw_trans((3.0, 5.7), (3.0, 4.2), "Midnight: No log", '#ef4444')
draw_trans((4.2, 3.7), (5.4, 3.7), "Freezes > 0", '#06b6d4')
draw_trans((7.9, 3.7), (9.0, 3.7), "No Freezes Left", '#64748b')
draw_trans((6.65, 4.2), (6.65, 5.7), "Next Day Tick", '#10b981')

# Focus transitions
draw_trans((4.2, 1.35), (5.4, 1.35), "Start Pomodoro", '#a855f7')
draw_trans((7.9, 1.35), (9.0, 1.35), "Timer = 00:00", '#d946ef')
draw_trans((10.3, 1.9), (3.0, 3.2), "Link to Habit", '#cbd5e1')

plt.tight_layout()
plt.savefig("docs/diagrams/uml_gamification_state.png", facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
plt.close()
print("Saved docs/diagrams/uml_gamification_state.png")

# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAM 6: Inter-Component & Service Connection Graph
# ─────────────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 8.5), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8.5)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

ax.text(6.5, 8.1, "Full-Stack Inter-Component Connection & State Data Flow", 
        fontsize=15, fontweight='bold', color='#38bdf8', ha='center')

def draw_node(x, y, w, h, title, sub, color='#0284c7'):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06,rounding_size=0.1",
                                fc='#1e293b', ec=color, linewidth=1.2)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2 + 0.1, title, fontsize=8.5, fontweight='bold', color='#ffffff', ha='center')
    ax.text(x + w/2, y + h/2 - 0.14, sub, fontsize=7.2, color='#94a3b8', ha='center')

# Pages (Top Row)
draw_node(0.5, 6.7, 2.0, 0.8, "DostMode.jsx", "Voice • Chat • AI Agent", '#38bdf8')
draw_node(2.9, 6.7, 2.0, 0.8, "HabitFocusHub", "Heatmap • Focus Timer", '#10b981')
draw_node(5.3, 6.7, 2.0, 0.8, "Calendar.jsx", "Time Grid • GCal Sync", '#8b5cf6')
draw_node(7.7, 6.7, 2.0, 0.8, "Tasks.jsx", "Eisenhower • Kanban", '#f59e0b')
draw_node(10.1, 6.7, 2.2, 0.8, "Settings & Diag", "Export • Theme • Ping", '#06b6d4')

# Context & State (Middle Row)
draw_node(1.5, 4.7, 3.2, 0.9, "DataContext (1,405 LOC)", "XP • Streaks • Tasks • Habits • Badges", '#0284c7')
draw_node(5.3, 4.7, 2.4, 0.9, "AuthContext", "Supabase Session • JWT", '#6366f1')
draw_node(8.3, 4.7, 3.2, 0.9, "syncEngine.js & native.js", "Queue • Heartbeat • Haptics • LocalPush", '#0ea5e9')

# Services & Gateway (Lower Middle Row)
draw_node(1.5, 2.8, 3.2, 0.8, "firebaseClient.js", "Bearer Header • Error Interceptor", '#f59e0b')
draw_node(5.3, 2.8, 2.4, 0.8, "dostLocalEngine", "Regex Intent • Local Cache", '#10b981')
draw_node(8.3, 2.8, 3.2, 0.8, "FastAPI Routers", "Chat • Tasks • Planner • Calendar", '#047857')

# Backend Core & DB (Bottom Row)
draw_node(0.5, 0.8, 3.6, 0.9, "AI Gateway & Engines", "ChatEngine • PlannerEngine • Parser", '#7c3aed')
draw_node(4.7, 0.8, 3.6, 0.9, "Core Security & DB Pool", "WorkspaceGuard • PlanGate • asyncpg", '#059669')
draw_node(8.9, 0.8, 3.6, 0.9, "PostgreSQL 16 + NIM", "RLS • pgvector • NVIDIA Inference", '#dc2626')

def draw_arrow(p1, p2, color='#64748b'):
    arrow = patches.FancyArrowPatch(p1, p2, arrowstyle="->", mutation_scale=10,
                                   color=color, linewidth=1.1)
    ax.add_patch(arrow)

# Top to Mid
draw_arrow((1.5, 6.7), (2.8, 5.6))
draw_arrow((3.9, 6.7), (3.1, 5.6))
draw_arrow((6.3, 6.7), (3.6, 5.6))
draw_arrow((8.7, 6.7), (4.1, 5.6))
draw_arrow((11.2, 6.7), (9.9, 5.6))

# Mid to Lower
draw_arrow((3.1, 4.7), (3.1, 3.6))
draw_arrow((6.5, 4.7), (3.6, 3.6))
draw_arrow((9.9, 4.7), (9.9, 3.6))
draw_arrow((3.1, 2.8), (8.3, 3.2))

# Lower to Bottom
draw_arrow((9.9, 2.8), (9.9, 1.7))
draw_arrow((8.3, 2.8), (6.5, 1.7))
draw_arrow((8.3, 2.8), (2.3, 1.7))
draw_arrow((4.1, 1.2), (4.7, 1.2))
draw_arrow((8.3, 1.2), (8.9, 1.2))

plt.tight_layout()
plt.savefig("docs/diagrams/uml_component_connections.png", facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
plt.close()
print("Saved docs/diagrams/uml_component_connections.png")
