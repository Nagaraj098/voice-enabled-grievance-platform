import Image from "next/image";
import MicRecorder from "@/components/mic-recorder/MicRecorder";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans p-8">
      <main className="flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Voice AI Platform
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mb-4">
          Welcome to the Voice AI Platform. Use the microphone controls below to start your recording session.
        </p>

        <MicRecorder />
      </main>
    </div>
  );
}
