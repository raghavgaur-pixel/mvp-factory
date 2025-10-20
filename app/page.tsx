"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { CheckCircleIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type Bookmark = {
  id: number;
  url: string;
  title: string;
  description: string;
  created_at: string;
  public: boolean;
};

const categories = [
  "All",
  "Tech",
  "Design",
  "Productivity",
  "AI",
  "Business",
  "Learning",
];

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
  const bookmarksEndRef = useRef<HTMLDivElement>(null);

  // Fetch bookmarks
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
              // Upsert logic:
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
            }, 100); // smooth scroll to new card
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
      setTimeout(() => setSuccessMsg(null), 2400);
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

  return (
    <div className="min-h-screen relative font-sans bg-gradient-to-br from-[#142740] via-[#1e2d46] to-[#eef4fa] flex flex-col !scrollbar-thin">
      {/* Background pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-fixed bg-top left-0 bg-[radial-gradient(rgba(67,118,236,0.14)_1px,transparent_1.8px)] bg-[size:35px_35px]"
      />
      <header className="relative z-10 w-full">
        {/* Hero */}
        <div className="max-w-5xl w-full mx-auto px-4 pt-12 pb-8 flex flex-col gap-5 items-center text-center rounded-xl">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600/90 via-sky-400 to-cyan-300 text-white drop-shadow mb-4 tracking-wide shadow">
            <span className="inline-block animate-pulse">SaaS Demo</span>
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg shadow-blue-700/10 mb-2">
            The Modern Public <span className="inline-block">Bookmark Cloud</span>
          </h1>
          <p className="max-w-xl text-lg sm:text-2xl text-slate-700/85 font-medium leading-relaxed mb-1">
            Discover, save, and share the world’s best resources.<br />
            <span className="text-blue-500 font-semibold">Curated by the community, for everyone.</span>
          </p>
          {/* Bookmark count badge */}
          <span className="inline-flex items-center bg-white/60 border border-blue-200/60 shadow px-4 py-1 rounded-full text-blue-900 font-semibold text-sm mt-3 backdrop-blur-sm">
            <span className="mr-1 w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 animate-pulse"></span>
            <span>
              {bookmarks.length} Public Bookmark{bookmarks.length !== 1 ? "s" : ""}
            </span>
          </span>
        </div>

        {/* Search + Filters */}
        <div className="max-w-5xl mx-auto w-full px-5 space-y-2 pb-4 flex flex-col">
          <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <MagnifyingGlassIcon
                className="w-5 h-5 text-blue-500 absolute left-3 top-3.5 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold shadow focus:ring-2 focus:ring-blue-400 text-blue-900 bg-white bg-opacity-90 placeholder-slate-400 border border-white/80 transition"
                autoComplete="off"
              />
            </label>
          </div>
          {/* Categories */}
          <div className="flex flex-wrap gap-2 pt-1 whitespace-nowrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                  ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-blue-700/85 via-sky-500 to-cyan-400 text-white shadow-md border-blue-400 scale-105"
                      : "bg-white/65 text-blue-900 border-blue-100 hover:bg-blue-100/40 hover:shadow border-opacity-50"
                  }`}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content: Split layout */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-10 z-10 relative">
        {/* Left: Add bookmark form, floating card on desktop */}
        <section className={
          `relative md:max-w-md w-full mx-auto md:mx-0 flex-shrink-0 mb-12 md:mb-0
          ${showForm ? "z-20" : "z-0"}`
        }>
          {/* Floating FAB (mobile & desktop) */}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="fixed bottom-8 right-7 md:static md:mb-6 md:right-auto md:bottom-auto z-50 group transition focus:outline-none"
            aria-label="Add Bookmark"
            type="button"
          >
            <span className="relative flex items-center justify-center w-14 h-14 md:w-full md:h-auto">
              <span className="absolute w-full h-full rounded-full blur-2xl bg-gradient-to-tr from-cyan-400/70 via-blue-400/60 to-blue-700/50 animate-pulse transition duration-150" />
              <span className="relative flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-blue-400/40 shadow-xl p-4 md:w-full md:h-auto md:rounded-2xl border-4 border-white border-opacity-80 group-hover:scale-110 transition-all duration-150">
                <PlusIcon className="w-8 h-8 text-white font-bold" />
              </span>
            </span>
            <span className="md:hidden absolute right-full mr-2 text-blue-900 font-bold bg-white/80 rounded px-3 py-1 shadow transition">
              {showForm ? "Close" : "Add"}
            </span>
            <span className="hidden md:inline-block ml-3 text-lg font-semibold text-blue-900 bg-white/70 px-5 py-3 rounded-2xl shadow border border-sky-100 hover:bg-blue-50/50 transition-all">
              {showForm ? "Hide Form" : "Add Bookmark"}
            </span>
          </button>
          {/* Glassmorphic card for the add form */}
          <div
            className={`
              mt-8 md:mt-0
              ${showForm ? "opacity-100 pointer-events-auto scale-100 shadow-2xl" : "opacity-0 md:opacity-100 md:scale-100 md:pointer-events-auto pointer-events-none scale-95"}
              transition-all duration-300 ease-[cubic-bezier(.76,0,.24,1)]
              bg-gradient-to-tl from-blue-50/70 via-white/90 to-blue-100/80
              rounded-2xl shadow-xl border border-white/80 backdrop-blur-xl
              px-6 py-8
              md:sticky md:top-28
              z-20
            `}
          >
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <h2 className="text-2xl font-extrabold mb-1 text-blue-900 flex items-center gap-2">
                <PlusIcon className="w-6 h-6 inline-block text-sky-500" />
                Add a Bookmark
              </h2>
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-bold text-blue-900 mb-1"
                >
                  URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  required
                  autoComplete="off"
                  value={form.url}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-blue-100 bg-white/90 text-blue-900 px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 transition font-medium shadow"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-bold text-blue-900 mb-1"
                >
                  Title <span className="text-rose-400">*</span>
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
                  className="w-full rounded-lg border border-blue-100 bg-white/90 text-blue-900 px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 transition font-medium shadow"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-bold text-blue-900 mb-1"
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
                  className="w-full rounded-lg border border-blue-100 bg-white/90 text-blue-900 px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 transition font-medium shadow resize-none"
                />
              </div>
              {error && (
                <div className="rounded bg-rose-400/10 text-rose-400 px-5 py-2 text-sm font-semibold border border-rose-300/30 backdrop-blur">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="mt-2 rounded-full bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-300 hover:from-cyan-400 hover:to-blue-600 shadow-lg text-white font-bold text-lg px-7 py-3 ring-2 ring-white/30 focus:outline-none focus:ring-4 focus:ring-blue-200/70 active:scale-95 flex items-center gap-2 transition-all"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-1 animate-pulse">
                    <svg className="w-4 h-4 mr-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-50" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-95" fill="currentColor" d="M4 12A8 8 0 0112 4v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" /> Add Bookmark
                  </>
                )}
              </button>
            </form>
            {successMsg && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full px-4 py-2 shadow-xl shadow-blue-300/40 font-semibold text-base animate-fade-in-up">
                <CheckCircleIcon className="w-5 h-5" /> {successMsg}
              </div>
            )}
          </div>
        </section>

        {/* Right: Bookmark display */}
        <section className="flex-1 min-w-0">
          <div
            className="
              grid sm:grid-cols-2 lg:grid-cols-3 gap-7
              transition-all
              pt-1
              custom-scrollbar
            "
            style={{ minHeight: 280 }}
          >
            {loading ? (
              <div className="col-span-full min-h-[200px] flex justify-center items-center">
                <div className="text-blue-700 text-2xl font-bold animate-pulse flex items-center gap-3">
                  <svg className="w-6 h-6 stroke-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-40" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-90" fill="currentColor" d="M4 12A8 8 0 0112 4v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Loading bookmarks...
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center text-slate-500 text-xl pt-16 pb-4 font-semibold">
                <span className="mb-2">No bookmarks here.</span>
                <span className="text-sm text-slate-400 font-normal">
                  Try a different category or term!
                </span>
              </div>
            ) : (
              filtered.map((b, idx) => (
                <article
                  key={b.id}
                  ref={idx === 0 ? bookmarksEndRef : undefined}
                  className={`
                    group
                    bg-gradient-to-br from-white/80 via-blue-50/80 to-white/80 border border-blue-100/60
                    shadow-xl rounded-2xl p-6 flex flex-col gap-3 relative
                    hover:scale-[1.033] hover:shadow-2xl hover:z-10 transition-all duration-200 cursor-pointer
                    backdrop-blur-xl
                    glass-card animate-fade-in-up
                  `}
                  style={{
                    animationDelay: `${idx * 18}ms`
                  }}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-blue-800 leading-tight hover:underline hover:text-sky-500 line-clamp-1 transition"
                      title={b.title}
                    >
                      {b.title}
                    </a>
                    <span
                      className="flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100/80 text-blue-600 border border-blue-200 ml-2 whitespace-nowrap"
                    >
                      {getCategory(b)}
                    </span>
                  </div>
                  <p className="text-slate-700 text-base opacity-85 line-clamp-2 mb-1 font-medium">
                    {b.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-2 text-xs text-slate-500 font-mono opacity-90">
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
                      className="inline-block ml-2 text-blue-600 bg-gradient-to-r from-blue-100/70 via-cyan-100/80 to-white/60 px-2.5 py-0.5 rounded font-bold text-xs border border-blue-200 hover:bg-cyan-100/80 hover:underline"
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

      <footer className="w-full text-center py-8 text-slate-500 text-base opacity-80 mt-auto tracking-wide relative z-10 border-t border-blue-100 bg-gradient-to-tr from-white/85 via-blue-50/95 to-white/90 shadow-inner">
        &copy; {new Date().getFullYear()} <span className="font-semibold text-blue-700">Bookmark Cloud</span>
        <span className="mx-2 text-blue-300">|</span>
        <span className="opacity-80">Built with Supabase &ndash; <a href="https://github.com/my-mvp-factory" target="_blank" className="text-cyan-500 font-medium hover:underline transition">View on GitHub</a></span>
      </footer>
      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.8);
          box-shadow: 0 12px 32px 0 rgba(30,64,175,0.06), 0 2px 8px 0 rgba(30,64,175,0.04);
          border-radius: 22px;
          backdrop-filter: blur(8px);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.42s cubic-bezier(.76,0,.24,1) both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(35px) scale(.98);}
          to   { opacity: 1; transform: translateY(0) scale(1);}
        }
        /* Custom scrollbar styles */
        ::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar {
          width: 9px;
          background: #e9eef8;
        }
        ::-webkit-scrollbar-thumb, .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(120deg, #3b82f6 10%, #0ea5e9 90%);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
