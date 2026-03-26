import { Bell, Book, MessageCircleQuestion } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Topbar() {
  const { isSignedIn } = useUser();

  return (
    <div className="h-14 border-b border-zinc-800 bg-[#0a0a0a] flex items-center justify-between px-6 text-zinc-300">
      {/* Left side if needed, currently empty for Topbar as Sidebar is fixed */}
      <div className="flex-1"></div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-1 border-r border-zinc-800 pr-4">
          <button className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md transition-all duration-200 hover:scale-[1.02] active:scale-95">
            <Book size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            <span className="hidden sm:inline">Docs</span>
          </button>
          <button className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md transition-all duration-200 hover:scale-[1.02] active:scale-95">
            <MessageCircleQuestion size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
          <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 relative">
            <Bell size={18} />
            {/* Notification Badge indicator */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-[#0a0a0a]"></span>
          </button>
        </div>

        {/* User Profile / Auth */}
        <div className="pl-2">
          {isSignedIn ? (
            <div className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-zinc-700 rounded-full",
                  }
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 bg-zinc-100 text-zinc-900 text-sm font-semibold rounded-md hover:bg-white transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
}
