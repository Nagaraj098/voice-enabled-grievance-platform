import re
import os

files_to_edit = [
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/app/knowledge-base/page.tsx',
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/app/page.tsx',
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/components/layout/Sidebar.tsx',
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/components/layout/Topbar.tsx'
]

replacements = [
    (r'bg-\[\#000000\]', 'bg-background'),
    (r'\bbg-black\b(?!\/)', 'bg-background'),
    (r'\bbg-zinc-900\b(?!\/)', 'bg-background'),
    (r'bg-\[\#0a0a0a\]', 'bg-background'),

    (r'\bbg-zinc-800\b(?!\/)', 'bg-card'),
    (r'bg-\[\#111\]', 'bg-card'),
    (r'bg-\[\#1a1a1a\]', 'bg-card'),

    (r'\btext-white\b', 'text-foreground'),
    (r'\btext-zinc-100\b', 'text-foreground'),
    (r'\btext-zinc-200\b', 'text-foreground'),

    (r'\btext-zinc-400\b', 'text-muted-foreground'),
    (r'\btext-zinc-500\b', 'text-muted-foreground'),

    (r'\bborder-zinc-700\b(?!\/)', 'border-border'),
    (r'\bborder-zinc-800\b(?!\/)', 'border-border'),
]

card_replacements = [
    (r'bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"', 'bg: "bg-card border-border hover:bg-card/80"'),
    (r'bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20"', 'bg: "bg-card border-border hover:bg-card/80"'),
    (r'bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"', 'bg: "bg-card border-border hover:bg-card/80"'),
    (r'bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"', 'bg: "bg-card border-border hover:bg-card/80"'),
    (r'bg: "bg-\[\#0f1f35\] border-blue-900/40 hover:bg-\[\#1a2d48\]"', 'bg: "bg-card border-border hover:bg-card/80"'),
    (r'bg: "bg-\[\#0f2820\] border-emerald-900/40 hover:bg-\[\#15362b\]"', 'bg: "bg-card border-border hover:bg-card/80"'),
    (r'border-blue-900/40', 'border-border'),   # fallback if split up
    (r'border-emerald-900/40', 'border-border')
]

for file_path in files_to_edit:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}, does not exist.")
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    for old, new in card_replacements:
        content = re.sub(old, new, content)

    for old, new in replacements:
        content = re.sub(old, new, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")
