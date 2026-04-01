"use client";
import { Bot, Database, Wrench, Puzzle, Mic2, MessageSquare, Users, Activity, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Sidebar({ activePage = "home" }: { activePage?: string }) {
  return (
    <div className="w-60 bg-[#0a0a0a] border-r border-zinc-800/60 p-4 flex flex-col h-full text-zinc-300">
      
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="font-semibold text-zinc-100 text-base tracking-tight">GRS</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
        
        {/* Main Section */}
        <nav className="space-y-0.5">
          <NavItem icon={<Bot size={16} />} label="Agents" active={activePage === 'home'} accent="blue" href="/home" />
          <NavItem icon={<Database size={16} />} label="Knowledge Base" active={activePage === 'knowledge-base'} accent="violet" href="/knowledge-base" />
          <NavItem icon={<Wrench size={16} />} label="Tools" accent="amber" />
          <NavItem icon={<Puzzle size={16} />} label="Integrations" badge="Alpha" accent="blue" />
          <NavItem icon={<Mic2 size={16} />} label="Voices" accent="emerald" />
        </nav>

        {/* Monitor Section */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-600 mb-2 px-3 uppercase tracking-widest">Monitor</div>
          <nav className="space-y-0.5">
            <NavItem icon={<MessageSquare size={16} />} label="Conversations" accent="blue" />
            <NavItem icon={<Users size={16} />} label="Users" accent="violet" />
            <NavItem icon={<Activity size={16} />} label="Tests" accent="emerald" />
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-4 border-t border-zinc-800/60 px-1 space-y-0.5">
        <NavItem 
          icon={<Settings size={16} />} 
          label="Settings" 
          active={activePage === 'settings'} 
          accent="blue"
          href="/settings"
        />
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/40 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">U</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">My Account</p>
            <p className="text-[10px] text-zinc-600 truncate">user@email.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  badge,
  accent = "blue",
  href
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  accent?: "blue" | "violet" | "amber" | "emerald";
  href?: string;
}) {
  const router = useRouter();
  const accentMap = {
    blue:    { bg: "bg-blue-500/10",   text: "text-blue-400",   icon: "text-blue-400",   ring: "ring-blue-500/20"   },
    violet:  { bg: "bg-violet-500/10", text: "text-violet-400", icon: "text-violet-400", ring: "ring-violet-500/20" },
    amber:   { bg: "bg-amber-500/10",  text: "text-amber-400",  icon: "text-amber-400",  ring: "ring-amber-500/20"  },
    emerald: { bg: "bg-emerald-500/10",text: "text-emerald-400",icon: "text-emerald-400",ring: "ring-emerald-500/20"},
  };
  const a = accentMap[accent];

  return (
    <button
      onClick={() => href && router.push(href)}
      className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
        active
          ? `${a.bg} ${a.text} font-medium ring-1 ${a.ring}`
          : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors ${active ? a.icon : "text-zinc-600 group-hover:text-zinc-400"}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[9px] uppercase tracking-wider font-semibold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-md">
          {badge}
        </span>
      )}
    </button>
  );
}
