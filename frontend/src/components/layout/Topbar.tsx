import { Bell, Book, MessageCircleQuestion } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const { isSignedIn } = useUser();

  return (
    <div className="h-14 border-b border-zinc-200 dark:border-border bg-zinc-50 dark:bg-background flex items-center justify-between px-6 text-zinc-800 dark:text-foreground">
      {/* Left side if needed, currently empty for Topbar as Sidebar is fixed */}
      <div className="flex-1"></div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-border pr-4">
          <button className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 rounded-md transition-all duration-200 hover:scale-[1.02] active:scale-95">
            <Book size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="hidden sm:inline">Docs</span>
          </button>
          <button className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 rounded-md transition-all duration-200 hover:scale-[1.02] active:scale-95">
            <MessageCircleQuestion size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 relative">
            <Bell size={18} />
            {/* Notification Badge indicator */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-background"></span>
          </button>
        </div>

        {/* User Profile / Auth */}
        <div className="flex items-center gap-4 pl-2">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-border rounded-full",
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
