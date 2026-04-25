import re
import os
import glob

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Cards in KB
    card_replacements = [
        (r'bg: "bg-[a-z]+-[0-9]+/10 border-[a-z]+-[0-9]+/20 hover:bg-[a-z]+-[0-9]+/20"', 'bg: "bg-card border-border border hover:bg-muted"'),
        (r'bg: "bg-\[\#0f1f35\] border-blue-900/40 hover:bg-\[\#1a2d48\]"', 'bg: "bg-card border-border border hover:bg-muted"'),
        (r'bg: "bg-\[\#0f2820\] border-emerald-900/40 hover:bg-\[\#15362b\]"', 'bg: "bg-card border-border border hover:bg-muted"')
    ]
    for old, new in card_replacements:
        content = re.sub(old, new, content)

    # General semantic tokens
    replacements = [
        (r'\bbg-black\b', 'bg-background'),
        (r'bg-\[\#000000\]', 'bg-background'),
        (r'bg-\[\#0a0a0a\]', 'bg-background'),
        (r'\bbg-zinc-900(?!/)', 'bg-background'),
        (r'\bbg-zinc-950(?!/)', 'bg-background'),
        (r'\bbg-zinc-900/', 'bg-background/'),
        (r'\bbg-zinc-950/', 'bg-background/'),

        (r'\bbg-zinc-800(?!/)', 'bg-card'),
        (r'\bbg-zinc-700(?!/)', 'bg-card'),
        (r'\bbg-zinc-800/', 'bg-card/'),
        (r'\bbg-zinc-700/', 'bg-card/'),
        (r'bg-\[\#111\]', 'bg-card'),
        (r'bg-\[\#1a1a1a\]', 'bg-card'),
        (r'bg-\[\#18181b\]', 'bg-card'),

        (r'\btext-white\b', 'text-foreground'),
        (r'\btext-zinc-100\b', 'text-foreground'),
        (r'\btext-zinc-200\b', 'text-foreground'),
        (r'\btext-zinc-300\b', 'text-foreground'),

        (r'\btext-zinc-400\b', 'text-muted-foreground'),
        (r'\btext-zinc-500\b', 'text-muted-foreground'),
        (r'\btext-zinc-600\b', 'text-muted-foreground'),

        (r'\bborder-zinc-600\b', 'border-border'),
        (r'\bborder-zinc-700\b', 'border-border'),
        (r'\bborder-zinc-800\b', 'border-border'),
        (r'\bborder-zinc-900\b', 'border-border'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    # Some remaining hardcoded ones in main containers
    content = content.replace("bg-[#000000] text-zinc-100", "bg-background text-foreground")
    content = content.replace("bg-[#000000]", "bg-background")
    content = content.replace("bg-[#0a0a0a]", "bg-background")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

FILES_TO_PROCESS = [
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/app/knowledge-base/page.tsx',
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/app/page.tsx',
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/components/layout/Sidebar.tsx',
    'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/components/layout/Topbar.tsx'
]

for file_path in FILES_TO_PROCESS:
    if os.path.exists(file_path):
        process_file(file_path)
        print(f"Processed: {file_path}")

print("Done")
