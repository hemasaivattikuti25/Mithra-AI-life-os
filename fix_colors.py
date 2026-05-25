import re

with open('/Users/sai2005/Downloads/gitprojects/mithra_web.ai/client-app/client/src/pages/LandingPage.jsx', 'r') as f:
    content = f.read()

replacements = {
    'text-white/80': 'text-[var(--text-primary)] opacity-80',
    'text-white/60': 'text-[var(--text-dim)]',
    'text-white/50': 'text-[var(--text-dim)] opacity-80',
    'text-white/40': 'text-[var(--text-dim)] opacity-60',
    'text-white': 'text-[var(--text-primary)]',
    'bg-[#0A0A0B]/80': 'bg-[var(--surface-bg)]',
    'bg-black/80': 'bg-[var(--surface-bg)]',
    'bg-black/60': 'bg-[var(--surface-bg)] opacity-90',
    'bg-black/50': 'bg-[var(--glass-bg)]',
    'bg-black/40': 'bg-[var(--glass-bg)]',
    'bg-black/20': 'bg-[var(--glass-bg)]',
    'border-white/20': 'border-[var(--glass-border)]',
    'border-white/10': 'border-[var(--glass-border)]',
    'border-white/5': 'border-[var(--glass-border)]',
    'bg-white/5': 'bg-[var(--glass-bg)]',
    'bg-white/10': 'bg-[var(--glass-bg-hover)]',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('/Users/sai2005/Downloads/gitprojects/mithra_web.ai/client-app/client/src/pages/LandingPage.jsx', 'w') as f:
    f.write(content)
print("Done")
