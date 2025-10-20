export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#1f2636] p-6">
      <main className="w-full max-w-2xl flex flex-col items-center justify-center gap-10 py-20">
        {/* Logo or brand can be included here as an Image if desired */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center drop-shadow-lg">
          From Idea to <span className="bg-gradient-to-r from-[#6ee7b7] to-[#3b82f6] bg-clip-text text-transparent">MVP in 10 Days</span>
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-slate-200 text-center max-w-xl">
          AI-augmented development for non-technical founders
        </p>

        <div className="flex flex-col items-center gap-6 w-full">
          <ul className="flex flex-wrap justify-center gap-3 text-base sm:text-lg font-medium text-slate-100">
            <li className="bg-white/10 rounded-full px-4 py-1 shadow-sm backdrop-blur-sm border border-white/15">
              Full-stack development
            </li>
            <li className="bg-white/10 rounded-full px-4 py-1 shadow-sm backdrop-blur-sm border border-white/15">
              Database integration
            </li>
            <li className="bg-white/10 rounded-full px-4 py-1 shadow-sm backdrop-blur-sm border border-white/15">
              Responsive design
            </li>
            <li className="bg-white/10 rounded-full px-4 py-1 shadow-sm backdrop-blur-sm border border-white/15">
              One-time fee
            </li>
          </ul>

          <a
            href="https://cal.com/your-discovery-call-link" // Replace with your booking URL
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-[#3b82f6] to-[#6ee7b7] hover:from-[#6ee7b7] hover:to-[#3b82f6] text-white font-semibold text-lg px-8 py-3 shadow-xl transition-all ring-2 ring-white/40 focus:outline-none focus:ring-4"
          >
            Book Discovery Call
          </a>
        </div>
      </main>
      <footer className="text-slate-400 text-sm opacity-70 py-6">
        &copy; {new Date().getFullYear()} My MVP Factory. All rights reserved.
      </footer>
    </div>
  );
}
