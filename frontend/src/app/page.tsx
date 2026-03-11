import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans p-8">
      <main className="flex flex-col items-center justify-center max-w-2xl text-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Voice AI Platform
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg">
          Welcome to the Voice AI Platform. Click the button below to start your recording session.
        </p>
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
          Start Recording
        </button>
      </main>
    </div>
  );
}
