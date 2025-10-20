"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { CheckCircleIcon, PlusIcon, MagnifyingGlassIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";

// --- Confetti Animation for Success (Very lightweight, custom SVG burst) ---
function ConfettiBurst({ show }: { show: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute z-[120] left-1/2 top-6 -translate-x-1/2 ${
        show ? "opacity-100 animate-sparkle-burst" : "opacity-0"
      }`}
      aria-hidden
    >
      <svg width="140" height="60" viewBox="0 0 120 60" className="block">
        {[...Array(16)].map((_, i) => {
          const angle = (i / 16) * 2 * Math.PI;
          const x = 60 + Math.cos(angle) * 34;
          const y = 30 + Math.sin(angle) * 18;
          const color =
            [
              "#38bdf8",
              "#06b6d4",
              "#60a5fa",
              "#818cf8",
              "#c026d3",
              "#fbbf24",
              "#e879f9",
              "#22d3ee",
            ][i % 8];
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3 + ((i * 3) % 4)}
              fill={color}
              opacity={0.78}
            />
          );
        })}
      </svg>
    </span>
  );
}

// --- Animated Logo ---
function AnimatedLogo() {
  return (
    <span className="flex items-center gap-2 select-none">
      <span className="relative font-black text-2xl sm:text-3xl tracking-tight">
        <span className="text-gradient-logo animate-gradient-move bg-clip-text text-transparent drop-shadow">
          <span className="inline-block animate-bounce-slow">B</span>ook
          <span className="inline-block animate-bounce-medium">m</span>ark
        </span>
      </span>
      <span className="h-6 w-6 relative inline-flex items-center justify-center">
        <svg className="absolute w-full h-full animate-rotate-gradient" viewBox="0 0 22 22">
          <defs>
            <radialGradient id="logoOrb" cx="50%" cy="50%" r="72%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#f472b6" />
            </radialGradient>
          </defs>
          <circle
            cx="11"
            cy="11"
            r="9"
            fill="url(#logoOrb)"
            opacity={0.93}
            filter="url(#gooeyOrb)"
          />
        </svg>
      </span>
    </span>
  );
}

// --- Gradient Generator based on Website Domain ---
function getDomainAccent(url: string) {
  try {
    const u = new URL(url);
    const domain = u.hostname.replace(/^www./, "");
    // Algorithmically assign color based on domain hash
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `linear-gradient(100deg, hsl(${h},90%,72%) 0%, hsl(${(h +
      36) % 360},92%,93%) 84%)`;
  } catch {
    return `linear-gradient(100deg, #36c6f7 0%, #b7f2fc 84%)`;
  }
}

// --- Skeleton Loading Card with Shimmer ---
function BookmarkCardSkeleton() {
  return (
    <div className="animate-shimmer bg-[linear-gradient(100deg,#e3eafb_40%,#e7eff6_60%,#e3eafb_100%)] rounded-2xl p-6 h-[175px] flex flex-col gap-3 relative border-2 border-transparent opacity-70 glass-bg overflow-hidden">
      <div className="h-5 w-3/4 bg-white/30 rounded shimmer-block mb-3" />
      <div className="h-4 w-2/5 bg-white/25 rounded shimmer-block mb-2" />
      <div className="h-3 w-5/12 bg-white/20 rounded shimmer-block mb-1" />
      <div className="h-3 w-1/4 bg-white/10 rounded shimmer-block mt-auto" />
    </div>
  );
}

type Bookmark = {
  id: number;
  url: string;
  title: string;
  description: string;
  created_at: string;
  public: boolean;
};

const categories = ["All", "Tech", "Design", "Productivity", "AI", "Business", "Learning"];

function getCategory(bookmark: Bookmark) {
  // Simple logic: tag by url/content, stub for now
  if (/ai|gpt|openai/i.test(bookmark.title + bookmark.url)) return "AI";
  if (/design|figma|css|ui|ux/i.test(bookmark.title + bookmark.url)) return "Design";
  if (/code|dev|github|js|react|typescript/i.test(bookmark.title + bookmark.url)) return "Tech";
  if (/learn|mentor|course|tutorial/i.test(bookmark.title + bookmark.url)) return "Learning";
  if (/product|boost|note|tool/i.test(bookmark.title + bookmark.url)) return "Productivity";
  if (/startup|business|saas/i.test(bookmark.title + bookmark.url)) return "Business";
  return "All";
}

// ---- Main Component ----
export default function BookmarkApp() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ url: "", title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notificationCount, setNotificationCount] = useState(0);
  const bookmarksEndRef = useRef<HTMLDivElement>(null);
  const [confetti, setConfetti] = useState(false);

  // Page Transition Fade-in Animation
  useEffect(() => {
    document.body.classList.add("saas-fade-in");
    return () => document.body.classList.remove("saas-fade-in");
  }, []);

  // Fetch bookmarks, Subscriptions & Real-time
  useEffect(() => {
    let isMounted = true;
    async function fetchBookmarks() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("public", true)
        .order("created_at", { ascending: false });
      if (!isMounted) return;
      if (error) setError(error.message);
      else setBookmarks(data as Bookmark[]);
      setLoading(false);
    }
    fetchBookmarks();

    // Real-time subscription
    const channel = supabase
      .channel("public-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          const newRow = payload.new as Bookmark | null;
          if (newRow && newRow.public) {
            setBookmarks((curr) => {
              let found = false;
              const updated = curr.map((b) => {
                if (b.id === newRow.id) {
                  found = true;
                  return newRow;
                }
                return b;
              });
              if (!found) return [newRow, ...updated];
              return updated;
            });
            setTimeout(() => {
              bookmarksEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
            // Show notification badge
            setNotificationCount((prev) => prev + 1);
          }
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number } | null;
            if (oldRow) {
              setBookmarks((curr) => curr.filter((b) => b.id !== oldRow.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (notificationCount > 0) {
      const timeout = setTimeout(() => setNotificationCount(0), 2700);
      return () => clearTimeout(timeout);
    }
  }, [notificationCount]);

  // Form handlers
  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Simple URL validation
    try {
      new URL(form.url || "invalid");
    } catch {
      setError("Please enter a valid URL.");
      setSubmitting(false);
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("bookmarks").insert([
      {
        url: form.url,
        title: form.title,
        description: form.description,
        public: true,
      },
    ]);
    if (error) setError(error.message);
    else {
      setForm({ url: "", title: "", description: "" });
      setSuccessMsg("Bookmark added!");
      setShowForm(false);
      setConfetti(true);
      setTimeout(() => setSuccessMsg(null), 2400);
      setTimeout(() => setConfetti(false), 1500);
    }
    setSubmitting(false);
  }

  // Filtering logic
  const filtered =
    bookmarks.filter((b) => {
      const cat = getCategory(b);
      const matchesCategory = activeCategory === "All" || cat === activeCategory;
      const matchesSearch =
        b.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        b.url.toLowerCase().includes(search.trim().toLowerCase()) ||
        b.description.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });

  // --- Animated Searchbar Expand/Blur Routine ---
  const [searchFocused, setSearchFocused] = useState(false);

  // --- Particle Background Canvas for Premium Feel ---
  const particleRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
    }[] = [];

    const colors = [
      "#38bdf8", "#fbbf24", "#fff", "#818cf8", "#e879f9", "#1e293b",
      "#f472b6", "#10b981", "#e0e7ef"
    ];
    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 30; i++) {
      if (!canvas) return;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0.25 + Math.random() * 0.8,
        vy: 0.15 + Math.random() * 1,
        r: 6 + Math.random() * 9,
        color: colors[i % colors.length],
      });
    }

    let running = true;
    function animate() {
      if (!running || !canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Subtle grid
      for (let y = 0; y < canvas.height; y += 80) {
        for (let x = 0; x < canvas.width; x += 80) {
          ctx.beginPath();
          ctx.arc(x, y, 0.56, 0, 2 * Math.PI);
          ctx.fillStyle = "#d6e1f4";
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      // Animate particles
      for (let p of particles) {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(
          p.x, p.y, 1,
          p.x, p.y, p.r
        );
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, "#ffffff11");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.17 + Math.random() * 0.26;
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) p.y = 0;
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      running = false;
    };
  }, []);

  // --- FAB Morph Animation ---
  const [fabMorphed, setFabMorphed] = useState(false);
  useEffect(() => {
    setFabMorphed(showForm);
  }, [showForm]);

  // --- Smooth scroll on showForm open on mobile ---
  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        document.getElementById("add-bookmark-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  }, [showForm]);

  return (
    <div className="min-h-screen relative font-sans flex flex-col bg-gradient-saas dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-all duration-500">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Background, layered */}
      <canvas
        ref={particleRef}
        className="pointer-events-none fixed inset-0 z-0 w-screen h-screen"
        style={{ width: "100vw", height: "100vh" }}
        width={1920}
        height={1080}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-saas-grid dark:bg-gray-900/50 animate-bg-grid" />

      {/* NAVIGATION Bar */}
      <nav
        className="fixed left-0 top-0 w-full z-40 flex justify-center px-2 pt-safe bg-opacity-90"
        style={{ minHeight: 66 }}
      >
        <div className="mt-4 sm:mt-5 backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/40 dark:border-gray-700/40 shadow-lg shadow-blue-300/10 dark:shadow-gray-900/20 rounded-full flex items-center w-[96vw] max-w-5xl p-3.5 sm:p-4 px-6 justify-between relative glass-nav-glow transition-all duration-500">
          <div className="flex items-center gap-4">
            <AnimatedLogo />
            <span className="hidden sm:inline text-gradient-subtitle bg-clip-text text-lg font-semibold text-transparent ml-2 opacity-95 tracking-tight animate-fade-in-right">
              Cloud Bookmarks
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/services"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white/95 dark:hover:bg-gray-600/95 text-blue-900 dark:text-gray-100 font-semibold text-sm border border-blue-200/50 dark:border-gray-600/50 hover:border-blue-300/70 dark:hover:border-gray-500/70 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Services
            </Link>
            <button
              className="relative outline-none"
              onClick={() => setShowForm((v) => !v)}
              aria-label={showForm ? "Close Add Bookmark" : "Add Bookmark"}
              type="button"
            >
              <span
                className={`fab-morph flex items-center justify-center ${
                  fabMorphed ? "fab-morph-open" : ""
                }`}
              >
                <PlusIcon className="text-white w-7 h-7 drop-shadow" />
              </span>
              <span
                className="absolute -top-2 -right-2 pointer-events-none overflow-visible"
                aria-live="polite"
              >
                {notificationCount > 0 && (
                  <span className="animate-blip-pulse bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 border-[3px] border-white/70 text-xs text-white font-bold rounded-full shadow-md px-2 py-0.5">
                    +{notificationCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* HEADER Hero and Animated floating Search */}
      <header className="pt-32 sm:pt-36 relative z-10 w-full flex flex-col items-center">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-4 text-center animate-fade-in-up">
          <h1 className="text-5xl sm:text-5xl font-black tracking-tighter leading-tight bg-gradient-saas-logo bg-clip-text text-transparent drop-shadow-lg shadow-blue-700/10 mb-2 px-2.5 flex-wrap flex justify-center items-center">
            <span className="inline-flex items-center gap-2 pr-2 bg-gradient-to-r from-gray-800 via-gray-100 to-gray-800 bg-clip-text">Breathtaking</span>
            <span className="inline px-3 animate-gradient-move">Bookmark Cloud</span>
            <span className="bg-gradient-to-r from-amber-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent ml-2 font-extrabold">SaaS</span>
          </h1>
          <p className="max-w-[600px] mx-auto text-lg sm:text-2xl text-slate-800/50 dark:text-gray-400/90 font-bold leading-relaxed mb-6 mt-3 opacity-100 transition-colors duration-500">
            Discover, save, and share the web's premium resources in real-time.<br />
            <span className="text-cyan-500 dark:text-cyan-400 font-extrabold">Community curated. Blazing fast. Elegant as a dream.</span>
          </p>
        </div>

        {/* Animated Search Bar Floating */}
        <div className="w-full flex justify-center animate-slide-float-in mt-1">
          <div
            className={`saas-searchbar-float relative transition-all duration-400 ${
              searchFocused ? "active" : ""
            }`}
          >
            <label className="relative w-full block">
              <MagnifyingGlassIcon
                className="w-6 h-6 text-cyan-400 absolute left-3 top-[14px] pointer-events-none transition-transform duration-200"
              />
              <input
                type="text"
                placeholder="Search bookmarks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`pl-12 pr-5 py-4 rounded-full font-semibold text-blue-900 dark:text-gray-100 bg-white/90 dark:bg-gray-800/90 border-2 border-transparent focus:border-gradient-saas-search bg-gradient-saas-search dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700
                  placeholder-blue-300 dark:placeholder-gray-400 shadow-lg focus:shadow-saas-focus outline-none transition-all text-lg w-[300px] sm:w-[390px]
                  ${searchFocused ? "scale-105 bg-white/95 dark:bg-gray-700/95 backdrop-blur-lg" : ""}
                `}
                autoComplete="off"
                style={{ boxShadow: searchFocused ? '0 1px 24px 5px #7dd3fc36' : undefined }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </label>
            <span className="absolute -bottom-3 left-8 h-2 w-1/2 bg-gradient-to-r from-cyan-300/60 to-blue-100/0 rounded-full blur-[3px] opacity-60 animate-searchbar-glow" />
          </div>
        </div>

        {/* Categories with fancy pill & transitions */}
        <div className="mt-7 mb-2 flex flex-wrap justify-center gap-2 animate-fade-in-down">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all outline-none
                ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-blue-600 via-fuchsia-400 to-orange-300 text-white shadow-lg border-amber-200 scale-105 animate-pill-glow"
                    : "bg-white/75 dark:bg-gray-700/75 text-blue-900 dark:text-gray-100 border-blue-100 dark:border-gray-600 hover:bg-blue-100/65 dark:hover:bg-gray-600/65 hover:shadow-md border-opacity-50"
                }`}
              type="button"
              tabIndex={0}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Premium MAIN Content SPLIT */}
      <main className="flex-1 w-full z-10 relative max-w-7xl mx-auto px-2 md:px-6 py-10 pt-2 flex flex-col md:flex-row gap-16 md:gap-14 transition-transform duration-700 saas-page-fade-in">
        {/* Add Bookmark Form FLOATING SLIDE-IN */}
        <section
          className={`
            relative md:max-w-md w-full mx-auto md:mx-0 flex-shrink-0
            mb-14 md:mb-0
            flex flex-col items-center
            md:sticky md:top-[116px]
            z-30
            animate-slide-form-in
          `}
          id="add-bookmark-form"
        >
          {/* Animated Confetti on Success */}
          {<ConfettiBurst show={confetti} />}
          {/* Floating FAB */}
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`
              fixed bottom-9 right-8 md:static md:mb-8 md:right-auto md:bottom-auto z-50 transition focus:outline-none
              saas-fab 
              ${showForm ? "saas-fab-open" : ""}
            `}
            aria-label={showForm ? "Close Bookmark Form" : "Add Bookmark"}
            type="button"
          >
            <span className="relative flex items-center justify-center w-16 h-16 md:w-full transition-all">
              <span
                className={`
                  absolute inset-0 w-full h-full rounded-full
                  blur-3xl transition-all duration-200
                  ${showForm ? "bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 animate-fab-glow" : "bg-gradient-to-tr from-cyan-400/60 via-pink-200/50 to-blue-700/50"}
                `}
              />
              <span className={`
                relative flex items-center justify-center rounded-full 
                bg-gradient-to-br from-cyan-400 via-pink-400 to-amber-400
                shadow-lg p-5 border-4 border-white border-opacity-90
                ${showForm ? "scale-[1.15] rotate-45" : ""}
                transition-all
              `}>
                <PlusIcon className="w-8 h-8 text-white" />
              </span>
              <span className={`absolute text-blue-900 select-none font-extrabold transition-all duration-300 text-xs right-full mr-3.5 p-1 px-3 rounded-full shadow 
                ${showForm ? "bg-gradient-to-r from-fuchsia-100 to-blue-100/50" : "bg-white/75"}
                md:hidden`}
              >
                {showForm ? "Hide" : "Add"}
              </span>
              <span className="hidden md:inline-block ml-4 text-base font-semibold text-blue-900 bg-white/80 px-7 py-3 rounded-full shadow border border-sky-100 hover:bg-blue-50/80 transition-all">
                {showForm ? "Close Form" : "Add Bookmark"}
              </span>
            </span>
          </button>
          {/* Floating Slide-In Form (Glassmorphism) */}
          <div
            className={`
              mt-7 md:mt-0 w-full max-w-lg mx-auto
              rounded-3xl shadow-2xl border-t-4 border-r-2 border-opacity-60 
              border-gradient-saas-card backdrop-blur-2xl glass-bg dark:bg-gray-800/60
              px-7 py-8 md:sticky
              transition-all duration-400
              ${showForm ? "opacity-100 pointer-events-auto scale-100 translate-y-0 slidein-form-open shadow-amber-100/30 dark:shadow-gray-900/30" : "opacity-0 pointer-events-none scale-95 -translate-y-9"}
            `}
            style={{ zIndex: 35 }}
          >
            <form className="flex flex-col gap-6" onSubmit={handleSubmit} autoComplete="off">
              <h2 className="text-2xl md:text-3xl font-black text-cyan-700 dark:text-cyan-400 flex items-center gap-2 mb-2 animate-gradient-title transition-colors duration-500">
                <PlusIcon className="w-7 h-7 text-fuchsia-400 dark:text-fuchsia-300" />
                Add a public bookmark
              </h2>
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-semibold text-blue-950 dark:text-gray-100 mb-1 transition-colors duration-500"
                >
                  URL <span className="text-rose-400 dark:text-rose-300">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  required
                  autoComplete="off"
                  value={form.url}
                  onChange={handleFormChange}
                  placeholder="https://resource.com/…"
                  className="w-full rounded-xl border-2 border-transparent bg-gradient-saas-input dark:bg-gray-700/50 px-5 py-3 font-semibold text-blue-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gradient-saas search-form transition-shadow transition-colors duration-500"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-blue-950 dark:text-gray-100 mb-1 transition-colors duration-500"
                >
                  Title <span className="text-rose-400 dark:text-rose-300">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  autoComplete="off"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Bookmark title"
                  className="w-full rounded-xl border-2 border-transparent bg-gradient-saas-input dark:bg-gray-700/50 px-5 py-3 font-semibold text-blue-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gradient-saas search-form transition-shadow transition-colors duration-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-blue-950 dark:text-gray-100 mb-1 transition-colors duration-500"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Add a short description"
                  className="w-full rounded-xl border-2 border-transparent bg-gradient-saas-input dark:bg-gray-700/50 px-5 py-3 font-semibold text-blue-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gradient-saas search-form transition-shadow resize-none transition-colors duration-500"
                />
              </div>
              {error && (
                <div className="rounded bg-rose-400/15 text-rose-500 px-5 py-2 text-sm font-bold border border-rose-200/50 backdrop-blur shadow">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-400 to-cyan-300 hover:from-cyan-400 hover:to-blue-600 shadow-2xl text-white font-black text-lg px-8 py-3 ring-2 ring-white/30 focus:outline-none focus:ring-4 focus:ring-blue-200/80 flex items-center gap-2 transition-all animate-gradient-move tracking-wide active:scale-97 relative overflow-hidden"
              >
                {submitting ? (
                  <span className="flex items-center gap-1 animate-pulse">
                    <svg className="w-5 h-5 mr-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-50" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-95" fill="currentColor" d="M4 12A8 8 0 0112 4v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Adding…
                  </span>
                ) : (
                  <>
                    <PlusIcon className="w-6 h-6" /> Add Bookmark
                  </>
                )}
                {submitting && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 animate-gradient-move h-4 w-4 rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-300 opacity-70" />
                )}
              </button>
            </form>
            {successMsg && (
              <div className="absolute top-6 right-7 flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-pink-400 to-blue-400 text-white rounded-2xl px-5 py-3 shadow-lg font-bold text-base animate-fade-in-up z-50">
                <CheckCircleIcon className="w-6 h-6" /> {successMsg}
              </div>
            )}
          </div>
        </section>

        {/* Right: Bookmark display */}
        <section className="flex-1 min-w-0">
          <div
            className="
              grid sm:grid-cols-2 lg:grid-cols-3 gap-8
              transition-all
              pt-discov
              custom-scrollbar-premium
              "
            style={{ minHeight: 290 }}
          >
            {/* Loading skeletons with shimmer */}
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <BookmarkCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center text-slate-500 text-xl pt-16 pb-4 font-semibold animate-fade-in-up">
                <span className="mb-2">No bookmarks here.</span>
                <span className="text-sm text-slate-400 font-normal">
                  Try a different category or search!
                </span>
              </div>
            ) : (
              filtered.map((b, idx) => (
                <article
                  key={b.id}
                  ref={idx === 0 ? bookmarksEndRef : undefined}
                  className={`
                    group/saas
                    relative
                    p-7 overflow-hidden rounded-3xl
                    glass-bg border-3 shadow-[0_16px_48px_0_rgba(60,128,200,0.13)] dark:shadow-[0_16px_48px_0_rgba(0,0,0,0.3)]
                    animate-fade-in-up
                    bg-white/90 dark:bg-gray-800/90
                    transition-all
                    flex flex-col
                    mt-1
                    hover:scale-[1.045] 
                    hover:z-20 
                    hover:shadow-2xl 
                    duration-200
                    cursor-pointer
                    border-gradient-saas border-[3px]
                    ${b.url ? "before:opacity-85" : ""}
                  `}
                  tabIndex={0}
                  style={{
                    borderImage: `${getDomainAccent(b.url)} 1`,
                    animationDelay: `${idx * 21}ms`,
                  }}
                >
                  <div className="absolute -top-6 right-8 w-20 h-20 rounded-full blur-2xl bg-gradient-to-br from-cyan-200/20 via-fuchsia-200/30 to-amber-200/35 pointer-events-none animate-card-blob" />
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-black text-blue-800 dark:text-blue-200 leading-tight hover:underline hover:text-fuchsia-500 dark:hover:text-fuchsia-400 line-clamp-1 transition"
                      title={b.title}
                    >
                      {b.title}
                    </a>
                    <span
                      className="flex items-center px-4 py-1 rounded-full text-xs font-black border-2 border-sky-200/80 
                      bg-gradient-to-r from-blue-100/80 via-fuchsia-100/90 to-cyan-50 text-cyan-700 ml-2 whitespace-nowrap animate-pill-glow"
                    >
                      {getCategory(b)}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full mb-4"
                    style={{
                      background: getDomainAccent(b.url),
                      opacity: 0.18,
                    }}
                  />
                  <p className="text-slate-700 dark:text-gray-300 text-base opacity-92 line-clamp-2 mb-1 font-semibold transition-colors duration-500">
                    {b.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-3 text-xs text-slate-500 dark:text-gray-400 font-mono opacity-80 transition-colors duration-500">
                    <time dateTime={b.created_at}>
                      {new Date(b.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block ml-2 text-blue-600 bg-gradient-to-r from-sky-100/90 via-fuchsia-100/90 to-white/90 px-3.5 py-1 rounded-full font-extrabold text-xs border border-cyan-200 shadow hover:bg-cyan-100/90 hover:underline transition-all duration-150"
                    >
                      Visit
                    </a>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Premium SaaS FOOTER */}
      <footer className="w-full py-9 pb-10 md:pb-14 text-center text-base text-slate-500 dark:text-gray-400 font-semibold opacity-80 mt-14 tracking-wide relative z-10 border-t border-blue-100 dark:border-gray-700 bg-gradient-to-tr from-white/92 via-blue-50/95 to-blue-100/85 dark:from-gray-900/92 dark:via-gray-800/95 dark:to-gray-900/85 shadow-inner animate-fade-in-up transition-all duration-500">
        <div className="flex items-center gap-2 justify-center mx-auto flex-wrap text-base font-bold text-blue-900/80 dark:text-gray-200/80 transition-colors duration-500">
          &copy; {new Date().getFullYear()} <span className="font-bold text-cyan-700 dark:text-cyan-400">Bookmark Cloud</span>
          <span className="mx-2 text-fuchsia-300 dark:text-fuchsia-400">|</span>
          Built with Supabase
          <span className="mx-2 text-blue-300 dark:text-blue-400">•</span>
          <a
            href="https://github.com/my-mvp-factory"
            target="_blank"
            className="text-fuchsia-500 dark:text-fuchsia-400 font-extrabold hover:underline transition"
          >
            View on GitHub
          </a>
        </div>
      </footer>

      {/* --- GLOBAL SaaS $50/mo+ CSS --- */}
      <style>{`
        /* Gradient grid background animation */
        .bg-saas-grid {
          background: repeating-linear-gradient(120deg,#ddeeff20 0, #ddeeff20 1.7px, transparent 1.7px, transparent 80px), repeating-linear-gradient(145deg,#f3f8ff32 0, #ddeeff12 1px, transparent 1px, transparent 80px);
          pointer-events:none;
        }
        .animate-bg-grid {
          animation: animateBgGrid 16s linear infinite;
        }
        @keyframes animateBgGrid {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 120px 80px, 150px 130px; }
        }
        /* Main SaaS Animated Gradient background (fallback color) */
        .bg-gradient-saas {
          background: radial-gradient(ellipse at 41% 4%, #fcfaff 30%, #e0ecfb 57%, #f4d8fb 100%);
          min-height: 100vh;
        }
        .dark .bg-gradient-saas {
          background: radial-gradient(ellipse at 41% 4%, #0a0a0a 30%, #1a1a2e 57%, #16213e 100%);
        }
        .bg-gradient-saas-logo {
          background: linear-gradient(103deg,#0ea5e9 10%, #7d6ffe 48%, #f472b6 88%);
        }
        .text-gradient-logo {
          background: linear-gradient(91deg,#0ea5e9 19%, #818cf8 63%, #f472b6 95%);
        }
        .text-gradient-subtitle {
          background: linear-gradient(88deg,#818cf8 25%, #22d3ee 94%);
        }
        .text-gradient {
          background: linear-gradient(98deg,#38bdf8 15%, #f472b6 78%);
        }
        /* Focus Ring Gradient */
        .focus\\:ring-gradient-saas:focus-visible {
          box-shadow: 0 0 0 4px #818cf860 !important;
        }
        /* -- Glass bg/blur for cards and forms -- */
        .glass-bg {
          background: linear-gradient(120deg,rgba(255,255,255,0.86) 50%,rgba(228,245,255,0.96) 100%);
          backdrop-filter: blur(34px);
          -webkit-backdrop-filter: blur(34px);
          border-radius: 24px;
        }
        .dark .glass-bg {
          background: linear-gradient(120deg,rgba(26,26,26,0.86) 50%,rgba(38,38,38,0.96) 100%);
        }
        .saas-page-fade-in {
          animation: saasPageFadeIn 1.25s cubic-bezier(.19,1,.22,1) both;
        }
        @keyframes saasPageFadeIn {
          from { opacity: 0; transform: scale(.97) translateY(32px)}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }

        .saas-fade-in {
          animation: fadeInFancyPage .66s cubic-bezier(.45,0,.56,1.1) both;
        }
        @keyframes fadeInFancyPage {
          from { opacity: 0; filter: blur(17px);}
          to { opacity: 1; filter: blur(0);}
        }

        .glass-nav-glow {
          box-shadow: 0 10px 34px 2px #c7f0fc19, 0 1px 4px 0px #475fef08;
        }

        /* Morph Button Animation */
        .saas-fab {
          transition: all .44s cubic-bezier(.54,0,.32,1);
          scale: 1;
          outline: none;
        }
        .saas-fab-open {
          scale: 1.07;
          filter: drop-shadow(0 12px 44px #38bdf830);
        }
        .fab-morph {
          transition: all .36s cubic-bezier(.41,0,.54,1);
          background: linear-gradient(103deg,#818cf8 19%, #f472b6 91%);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: inline-flex;
          align-items: center; justify-content: center;
          filter: drop-shadow(0 1px 18px #38bdf850);
        }
        .fab-morph-open {
          background: linear-gradient(98deg,#818cf8,#f472b6,#fbbf24 91%);
          border-radius: 23px 40px 22px 44px;
          scale: 1.13;
          rotate: 20deg;
        }
        /* Animated Loading Skeleton Shimmer */
        @keyframes shimmerMove {
          0% { background-position: -170px 0; }
          100% { background-position: 230px 0; }
        }
        .animate-shimmer {
          background: linear-gradient(100deg,#dfe7ef 40%,#e9ebf3 60%,#e3eafb 100%);
          background-size: 400px 100%;
          animation: shimmerMove 1.6s linear infinite forwards;
        }
        .shimmer-block {
          background-size: 250px 100%;
        }
        /* Slide-in Form */
        .slidein-form-open {
          transform: none !important;
          animation: slideFormIn 0.4s cubic-bezier(.74,0,.28,1) both;
        }
        @keyframes slideFormIn {
          from { opacity: 0; transform: translateY(44px) scale(.93);}
          to { opacity: 1; transform: none;}
        }
        /* Gradient accent border for card */
        .border-gradient-saas {
          border-image: linear-gradient(98deg,#818cf8 12%, #f472b6 64%, #fbbf24 100%) 1;
        }
        .border-gradient-saas-card {
          border-image: linear-gradient(98deg,#bae6fd 26%,#5eead4 54%,#94a3fd 74%,#818cf8 100%) 1;
        }
        /* Animated Badge/Pill Glow */
        .animate-pill-glow {
          box-shadow: 0 2px 10px #fbbf2418, 0 1px 9px #0ea5e940;
          animation: pillGlow 2.3s ease-in-out infinite alternate;
        }
        @keyframes pillGlow {
          from {box-shadow:0 2px 14px #fbbf2420;}
          to   {box-shadow:0 4px 24px #38bdf860;}
        }
        .animate-card-blob {
          animation: cardBlob 4s infinite cubic-bezier(.6,0,.19,1) alternate;
        }
        @keyframes cardBlob {
          0% {top: -24px; right: 40px; scale:1;}
          100% {top: -10px; right: 30px; scale:1.11;}
        }
        .animate-gradient-title {
          background: linear-gradient(90deg,#818cf8 19%, #f472b6 91%);
          background-clip: text;
          color: transparent;
        }
        .animate-fade-in-up {
          animation: fadeInUpPremium 0.61s cubic-bezier(.76,0,.24,1) both;
        }
        @keyframes fadeInUpPremium {
          from { opacity: 0; transform: translateY(35px) scale(.99);}
          to   { opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-fade-in-down {
          animation: fadeInDownPremium 0.65s cubic-bezier(.56,0,.44,1.1) both;
        }
        @keyframes fadeInDownPremium {
          from { opacity: 0; transform: translateY(-35px) scale(.93);}
          to   { opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-searchbar-glow {
          animation: searchbarGlow 1.9s alternate infinite cubic-bezier(.76,0,.24,1);
        }
        @keyframes searchbarGlow {
          from {opacity: 0.44; filter: blur(5px);}
          to {opacity: 0.99; filter: blur(3px);}
        }
        /* Searchbar expand slide/focus */
        .saas-searchbar-float {
          background: linear-gradient(109deg,#fff 90%,#bae6fd 120%);
          box-shadow: 0 8px 38px #bae6fd24;
          border-radius: 44px;
          width: 94vw;
          max-width: 460px;
          margin: 0 auto;
          transition: box-shadow 0.26s cubic-bezier(.51,.03,.43,1.13), scale .19s cubic-bezier(.36,0,.62,1), background .7s;
        }
        .saas-searchbar-float.active {
          box-shadow: 0 10px 54px #bae6fd36, 0 2px 18px #818cf840; scale: 1.06;
          background: linear-gradient(109deg,#f3f9fd 80%,#bae6fd 100%);
        }
        .focus\:ring-gradient-saas-search:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px #818cf860;
        }
        .bg-gradient-saas-search {
          background: linear-gradient(92deg,#f1f9ff 90%,#f7e9fa 100%);
        }
        .border-gradient-saas-search {
          border-image: linear-gradient(91deg,#818cf8 19%, #f472b6 81%) 1 !important;
        }
        .shadow-saas-focus {
          box-shadow: 0 1px 20px #38bdf850;
        }
        .animate-fade-in-right {
          animation: fadeInRightPremium 1.1s cubic-bezier(.55,0,.19,1.01) both;
        }
        @keyframes fadeInRightPremium {
          from {opacity: 0; transform: translateX(-44px);}
          to {opacity: 1; transform: none;}
        }

        .animate-gradient-move {
          background: linear-gradient(
            100deg,
            #818cf8 16%,
            #f472b6 30%,
            #fbbf24 41%,
            #818cf8 80%
          );
          background-size: 400% 400%;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
          animation: gradientMove 6s linear infinite;
        }
        @keyframes gradientMove {
          0%{background-position:0% 50%;}
          100%{background-position:100% 50%;}
        }
        /* Confetti Burst Animation */
        @keyframes sparkleBurst {
          0% { opacity: 0; transform: scale(.8) translateY(16px);}
          25%{ opacity: 0.84; }
          60% { opacity: 1; transform: scale(1) translateY(-10px);}
          100%{ opacity: 0; transform: scale(.72) translateY(-30px);}
        }
        .animate-sparkle-burst {
          animation: sparkleBurst 1.25s cubic-bezier(.76,0,.24,1);
        }
        /* Blip badge wiggle for notification */
        .animate-blip-pulse {
          animation: blipPulse 1.2s infinite;
          filter: drop-shadow(0 2px 8px #34fbee54);
        }
        @keyframes blipPulse {
          0% {scale: 1; filter: none;}
          55% {scale: 1.18;}
          100%{scale: 1;}
        }
        /* Card hover 3D and smooth transitions */
        .group\\/saas:hover {
          box-shadow: 0 22px 64px 0 #818cf880, 0 4px 24px 0 #fbbf2424;
          transform: translateY(-7px) scale(1.035) perspective(900px) rotateX(5deg) rotateY(-7deg);
          transition: all .21s cubic-bezier(.31,0,.67,1.15);
          z-index: 23 !important;
        }
        .group\\/saas:hover .animate-card-blob {
          opacity: 1 !important;
          filter: blur(14px) brightness(1.19);
        }
        /* Premium Custom Scrollbar */
        .custom-scrollbar-premium::-webkit-scrollbar, ::-webkit-scrollbar {
          width: 12px;
          background: #f1f7fe;
        }
        .custom-scrollbar-premium::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb {
          background: linear-gradient(120deg, #818cf8 10%, #f472b6 30%, #fbbf24 93%);
          border-radius: 35px;
          min-height: 30px;
          border: 3.5px solid #f1f7fe;
        }
        /* Misc UX transitions */
        @media (max-width: 768px) {
          .saas-searchbar-float { max-width: 99vw; }
        }
        /* Animate logo orb rotation */
        .animate-rotate-gradient {
          animation: logoOrbRotate 3.4s linear infinite;
        }
        @keyframes logoOrbRotate {
          0% { transform: rotate(0deg);}
          100%{ transform: rotate(360deg);}
        }
        /* Logo Letter Bounce */
        .animate-bounce-slow { animation: logoBounceSlow 2.1s infinite alternate; }
        .animate-bounce-medium { animation: logoBounceMedium 1.3s infinite alternate-reverse;}
        @keyframes logoBounceSlow {
          from { transform: translateY(0);}
          to   { transform: translateY(8px);}
        }
        @keyframes logoBounceMedium {
          from { transform: translateY(-1px);}
          to   { transform: translateY(10px);}
        }
      `}</style>
    </div>
  );
}
