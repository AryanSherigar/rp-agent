"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Key, ShieldCheck } from "lucide-react";

/**
 * UNIFIED USER FLOW: STEP 1 & 2
 * 1. Entry: Landing Page (Minimal, Value Prop)
 * 2. Auth: Simple Login / Guest (No onboarding)
 * 3. Hub: Browse vs Create
 */

type ViewState = "LANDING" | "AUTH" | "HUB";

export default function Page() {
  const [view, setView] = useState<ViewState>("LANDING");
  const [isLoading, setIsLoading] = useState(false);

  // Mock Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for realism
    setTimeout(() => {
      setIsLoading(false);
      setView("HUB");
    }, 800);
  };

  // --- VIEW 1: LANDING PAGE ---
  if (view === "LANDING") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
          {/* Minimal Branding */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Online
            </div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
              RP Agent
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              A story where characters <span className="text-emerald-400">remember</span>, <span className="text-blue-400">adapt</span>, and <span className="text-purple-400">choose</span>.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="pt-8">
            <button
              onClick={() => setView("AUTH")}
              className="group relative px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 rounded-full font-semibold transition-all w-full md:w-auto min-w-[200px] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
            >
              Enter World
              <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-slate-600 text-xs font-mono uppercase tracking-widest">
          Prototype v1.0.0 
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATION ---
  if (view === "AUTH") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Identify Yourself</h2>
            <p className="text-slate-500 text-sm mt-2">Access the simulation network.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Agent_01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/50 px-2 text-slate-500">Or continue as</span>
            </div>
          </div>

          <button
            onClick={() => setView("HUB")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition-all border border-slate-700 hover:border-slate-600"
          >
            Guest Observer
          </button>
        </div>

        <button
          onClick={() => setView("LANDING")}
          className="mt-8 text-slate-500 text-sm hover:text-emerald-400 transition-colors"
        >
          ← Return to Gateway
        </button>
      </div>
    );
  }

  // --- VIEW 3: POST-LOGIN HUB ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 animate-in fade-in duration-500">
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">Welcome, Storyteller.</h2>
          <p className="text-slate-400">Select a scenario to begin.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("LANDING")}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Log Out
          </button>
          <div className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20">
            ● System Ready
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* OPTION A: BROWSE STORIES (The Main Demo) */}
        <Link
          href="/play"
          className="group relative bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-900/10 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl">🌲</span>
          </div>

          <div className="relative z-10">
            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded uppercase tracking-wide font-bold border border-emerald-500/20">
              Featured Scenario
            </div>

            <div className="w-12 h-12 bg-slate-800 rounded-lg mb-6 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              🌲
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors">
              The Dark Forest
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You arrive at a secluded village on the edge of an ancient, cursed forest.
              The villagers are distrustful, and something watches from the trees.
            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase">
              <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded">Dark Fantasy</span>
              <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded">Mystery</span>
            </div>
          </div>
        </Link>

        {/* OPTION B: CREATE (Placeholder) */}
        <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 border-dashed hover:border-slate-700 transition-all cursor-not-allowed">
          <div className="absolute top-4 right-4 bg-slate-800 text-slate-500 text-[10px] px-2 py-1 rounded uppercase tracking-wide font-bold">
            Locked
          </div>
          <div className="w-12 h-12 bg-slate-900/50 rounded-lg mb-6 flex items-center justify-center border-2 border-slate-800 border-dashed text-slate-700">
            +
          </div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">
            Forge a New Legend
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Define your own world, create unique characters, and let the Director Agent handle the rest.
          </p>
        </div>
      </main>
    </div>
  );
}
