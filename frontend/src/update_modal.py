import re

file_path = 'e:/Internship/GRS/voice-enabled-grievance-platform/frontend/src/app/knowledge-base/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update View File Modal Container
content = content.replace(
    'className="bg-background border border-border rounded-2xl w-full max-w-[900px] shadow-2xl flex flex-col h-auto max-h-[90vh]"',
    'className="bg-background border border-border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col h-auto max-h-[90vh]"'
)

# 2. Update Header Border and spacing
content = content.replace(
    'className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border/60 bg-background rounded-t-2xl gap-4"',
    'className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border/60 bg-background rounded-t-xl border-l-[6px] border-l-indigo-500 gap-4"'
)

# 3. Update File Icon and Title
# We need to replace the exact h2 and inner span
old_icon_block = """<h2 className="text-lg font-semibold text-foreground flex items-center gap-3 truncate">
                      <span className="text-amber-400 capitalize flex-shrink-0">
                        {getFileType(selectedFile.filename) === 'json' ? <Icons.FileJson /> : <Icons.File />}
                      </span>"""
new_icon_block = """<h2 className="text-xl font-semibold text-foreground flex items-center gap-4 truncate">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-500/20">
                        {getFileType(selectedFile.filename) === 'json' ? <Icons.FileJson /> : <Icons.File />}
                      </div>"""
content = content.replace(old_icon_block, new_icon_block)

# Category Badge px-2.5 -> px-3
old_cat_badge = '<span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${severityColor(selectedFile.category)}`}>'
new_cat_badge = '<span className={`text-xs px-3 py-1 rounded-full border font-medium ${severityColor(selectedFile.category)}`}>'
content = content.replace(old_cat_badge, new_cat_badge)

# Policies badge
old_pol_badge = '<span className="text-xs text-muted-foreground font-medium bg-background px-2.5 py-1 rounded-lg border border-border/60">'
new_pol_badge = '<span className="text-xs text-muted-foreground font-medium px-3 py-1 rounded-full border border-border">'
content = content.replace(old_pol_badge, new_pol_badge)

# Size badge
old_size_badge = '<span className="text-xs text-muted-foreground font-medium px-2 py-1">'
new_size_badge = '<span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-muted/40 rounded-full">'
content = content.replace(old_size_badge, new_size_badge)

# 4. Action Buttons (Copy, Download, Close)
# Copy button
old_copy_btn = """className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors border border-border/0 hover:border-border\""""
new_copy_btn = """className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors rounded-md shadow-sm\""""
content = content.replace(old_copy_btn, new_copy_btn)

# Remove the line with <div className="w-px h-5 bg-card mx-1 hidden sm:block"></div>
content = content.replace('<div className="w-px h-5 bg-card mx-1 hidden sm:block"></div>', '<div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>')

# Close button
old_close_btn = 'className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors ml-1"'
new_close_btn = 'className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors ml-1"'
content = content.replace(old_close_btn, new_close_btn)

# 5. Tab Bar
old_tab_container = '<div className="flex items-center bg-background/30 px-5 pt-3 border-b border-border/60 gap-4">'
new_tab_container = '<div className="flex items-center bg-background/30 px-6 pt-2 border-b border-border gap-6">'
content = content.replace(old_tab_container, new_tab_container)

# Tab Active/Inactive classes
content = content.replace('viewerTab === "formatted" ? "border-violet-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"', 'viewerTab === "formatted" ? "border-indigo-500 text-foreground tracking-wide font-medium" : "border-transparent text-muted-foreground hover:border-border/50 hover:text-foreground tracking-wide"')
content = content.replace('viewerTab === "raw" ? "border-violet-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"', 'viewerTab === "raw" ? "border-indigo-500 text-foreground tracking-wide font-medium" : "border-transparent text-muted-foreground hover:border-border/50 hover:text-foreground tracking-wide"')

# 6. Formatted Tab (Rules list)
old_formatted = '''          return (
            <div className="space-y-4">
              {policies.map((item: any, idx: number) => (
                <div key={idx} className="bg-background border border-border rounded-xl p-5 flex flex-col gap-2 shadow-inner">
                  <div className="flex gap-3 items-start text-foreground font-medium">
                    <span className="text-violet-400 mt-0.5 whitespace-nowrap">Rule {idx + 1}:</span>
                    <span className="flex-1 leading-relaxed">{item.rule || item.title || item.name || "Untitled Rule"}</span>
                  </div>
                  {(item.description || item.desc) && (
                    <div className="flex gap-3 items-start text-muted-foreground text-xs mt-1">
                      <span className="text-muted-foreground w-12 shrink-0 font-sans tracking-wide">DESC:</span>
                      <span className="flex-1 leading-relaxed text-sm">{item.description || item.desc}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );'''

new_formatted = '''          return (
            <div className="space-y-4">
              <div className="text-muted-foreground text-sm mb-3 font-medium flex items-center gap-3">
                <span className="bg-muted px-3 py-1 rounded-full border border-border/60 shadow-sm">{policies.length} Rules Extract</span>
                <div className="flex-1 h-px bg-border/50"></div>
              </div>
              {policies.map((item: any, idx: number) => (
                <div key={idx} className="bg-muted/40 dark:bg-card border border-border border-l-4 border-l-indigo-500 rounded-lg p-5 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md hover:bg-muted/60 dark:hover:bg-zinc-900/80">
                  <div className="flex gap-3 items-start">
                    <span className="text-indigo-500 font-semibold text-sm whitespace-nowrap mt-0.5 tracking-wide">Rule {idx + 1}:</span>
                    <span className="text-foreground text-sm ml-1 leading-relaxed font-medium">{item.rule || item.title || item.name || "Untitled Rule"}</span>
                  </div>
                  {(item.description || item.desc) && (
                    <div className="text-muted-foreground text-sm md:ml-14 leading-relaxed bg-background/50 border border-border/40 p-3 rounded-md">
                      {item.description || item.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );'''
content = content.replace(old_formatted, new_formatted)

# 7. Raw JSON Tab
old_raw = '''        return (
          <div className="h-full w-full overflow-auto bg-background rounded-lg border border-border">
            <pre
              className="font-mono text-sm p-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightJson(rawJson) }}
            />
          </div>
        );'''
new_raw = '''        return (
          <div className="h-full w-full overflow-auto bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-border p-5 relative shadow-inner">
            <div className="absolute top-3 right-3 text-[10px] font-bold tracking-widest text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 rounded shadow-sm opacity-80 select-none">JSON</div>
            <pre
              className="font-mono text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightJson(rawJson) }}
            />
          </div>
        );'''
content = content.replace(old_raw, new_raw)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully.")
