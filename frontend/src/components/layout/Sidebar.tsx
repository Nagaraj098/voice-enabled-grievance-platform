import { Home, Bot, Database, Wrench, Puzzle, Mic2, MessageSquare, Users, Activity, Phone, MessageCircle, PhoneOutgoing } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-zinc-800 p-4 flex flex-col h-full text-zinc-300">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center text-black font-bold text-xl">
          V
        </div>
        <span className="font-semibold text-zinc-100 text-lg">Voice AI</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
        {/* Main Section */}
        <nav className="space-y-1">
          <NavItem icon={<Home size={18} />} label="Home" />
          <NavItem icon={<Bot size={18} />} label="Agents" active />
          <NavItem icon={<Database size={18} />} label="Knowledge Base" disabled />
          <NavItem icon={<Wrench size={18} />} label="Tools" disabled />
          <NavItem icon={<Puzzle size={18} />} label="Integrations" badge="Alpha" disabled />
          <NavItem icon={<Mic2 size={18} />} label="Voices" disabled />
        </nav>

        {/* Monitor Section */}
        <div>
          <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Monitor</div>
          <nav className="space-y-1">
            <NavItem icon={<MessageSquare size={18} />} label="Conversations" disabled />
            <NavItem icon={<Users size={18} />} label="Users" disabled />
            <NavItem icon={<Activity size={18} />} label="Tests" disabled />
          </nav>
        </div>

        {/* Deploy Section */}
        <div>
          <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Deploy</div>
          <nav className="space-y-1">
            <NavItem icon={<Phone size={18} />} label="Phone Numbers" disabled />
            <NavItem icon={<MessageCircle size={18} />} label="WhatsApp" disabled />
            <NavItem icon={<PhoneOutgoing size={18} />} label="Outbound" disabled />
          </nav>
        </div>
      </div>
      
      {/* Bottom Profile / Settings placeholder if needed */}
      <div className="mt-8 pt-4 border-t border-zinc-800 px-2 space-y-1">
          <NavItem icon={<Activity size={18} />} label="Settings" disabled />
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false, 
  disabled = false, 
  badge 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  disabled?: boolean; 
  badge?: string; 
}) {
  return (
    <button
      className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
        active
          ? "bg-zinc-800/80 text-white font-medium shadow-sm ring-1 ring-zinc-700/50"
          : disabled
          ? "opacity-40 cursor-not-allowed"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 hover:translate-x-1"
      }`}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors duration-200 ${
          active ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-300"
        }`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded transition-colors group-hover:bg-blue-500/20">
          {badge}
        </span>
      )}
    </button>
  );
}
