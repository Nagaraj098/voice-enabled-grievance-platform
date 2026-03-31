"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/home");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    router.prefetch("/sign-in");
    router.prefetch("/sign-up");
  }, [router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.05 }
    );
    document.querySelectorAll('.scroll-animate').forEach((el) => 
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white/20 font-sans overflow-x-hidden relative">
      {/* Background Soft Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-blue-600 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-medium tracking-tight">AI Voice</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
          <Link href="#developers" className="hover:text-white transition-colors">Developers</Link>
          <Link href="#resources" className="hover:text-white transition-colors">Resources</Link>
        </div>
        <div className="flex items-center">
          <Link
            href="/sign-in"
            prefetch={true}
            className="text-sm font-medium px-5 py-2.5 rounded-full border border-zinc-800 hover:border-zinc-600 hover:text-white text-zinc-300 transition-colors bg-black/50 backdrop-blur-sm"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center mt-24 md:mt-32 px-4 pb-0">
        <div style={{ animation: 'fade-up 0.9s ease forwards' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            Next-Generation Voice AI
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.02em] leading-[1.1] mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            AI Voice Platform
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-10">
            Build interactive, ultra-low latency conversational AI experiences.
            Connect your users with intelligent voice agents seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/sign-up"
              prefetch={true}
              className="group relative flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-base font-medium overflow-hidden transition-all hover:scale-105"
              style={{ boxShadow: '0 0 40px -10px rgba(255,255,255,0.4)' }}
            >
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, #f97316, #2563eb, #f97316)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 2s linear infinite',
                  mixBlendMode: 'overlay'
                }}
              />
              <span className="relative z-10">Get Started</span>
              <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/sign-in"
              prefetch={true}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-medium text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Floating Orb */}
        <div className="relative mt-10 flex items-center justify-center pb-4 mb-0">
          <div className="absolute w-64 h-64 rounded-full border border-white/10 animate-[pulse-ring_2s_ease-out_infinite]" />
          <div className="absolute w-64 h-64 rounded-full border border-white/10 animate-[pulse-ring_2s_ease-out_infinite_0.5s]" />
          <div
            className="w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #f97316, #2563eb)',
              animation: 'float 4s ease-in-out infinite',
              boxShadow: '0 0 80px 20px rgba(249,115,22,0.2), 0 0 120px 40px rgba(37,99,235,0.15)'
            }}
          />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">
            For Enterprise · Government · Developers
          </p>
          <h2 className="text-4xl font-semibold text-center mb-16 tracking-tight">
            Built for real conversations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Ultra-low latency', desc: 'Real-time voice streaming with sub-200ms response time using LiveKit WebRTC.' },
              { title: 'Multilingual AI', desc: 'Voice agents that understand context, intent, and language naturally.' },
              { title: 'Secure by design', desc: 'End-to-end encrypted sessions with Clerk authentication and role-based access.' },
            ].map((card, i) => (
              <div
                key={i}
                className="scroll-animate bg-zinc-50 border border-zinc-100 rounded-2xl p-8"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-black mb-5 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .scroll-animate {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}