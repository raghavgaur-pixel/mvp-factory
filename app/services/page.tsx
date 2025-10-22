"use client";

import React, { useRef, useEffect } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- 1. Custom Cursor with Trail Effect ---
function CursorTrail() {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cursor = cursorRef.current!;
    let lastX = window.innerWidth / 2,
      lastY = window.innerHeight / 2;
    let trail: HTMLDivElement[] = [];
    for (let i = 0; i < 8; ++i) {
      let node = document.createElement("div");
      node.className =
        "fixed z-[9999] pointer-events-none rounded-full bg-gradient-to-br from-pink-400 to-blue-400 opacity-40";
      node.style.width = `${8 + i * 3}px`;
      node.style.height = `${8 + i * 3}px`;
      node.style.left = `${lastX}px`;
      node.style.top = `${lastY}px`;
      node.style.transition = "all 0.15s cubic-bezier(.25,.46,.45,.94)";
      document.body.appendChild(node);
      trail.push(node);
    }
    const move = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      // Hide the main cursor circle
      cursor.style.display = "none";
      let tx = lastX,
        ty = lastY;
      for (let i = 0; i < trail.length; ++i) {
        // Remove random jitter for smoother cursor
        trail[i].style.left = `${tx - (trail.length - i) * 2}px`;
        trail[i].style.top = `${ty - (trail.length - i) * 2}px`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      trail.forEach((n) => n.remove());
    };
  }, []);
  return (
    <div
      ref={cursorRef}
      className="cursor-custom fixed z-[99999] pointer-events-none rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-pink-400 shadow-xl opacity-80 w-5 h-5 transition-all duration-75"
      style={{ left: -100, top: -100 }}
    />
  );
}

// --- 2. Animated Hero Gradient & Particles ---
function AnimatedParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let pCount = 28;
    let particles = Array.from({ length: pCount }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 19 + Math.random() * 38,
      o: 0.22 + Math.random() * 0.26,
      dx: -0.15 + Math.random() * 0.3,
      dy: -0.125 + Math.random() * 0.25,
      color: `hsla(${200 + Math.random() * 100},71%,${75 +
        Math.random() * 15}%,1)`
    }));
    let running = true;
    function draw() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(
          p.x * canvas.width,
          p.y * canvas.height,
          p.r * dpr,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.o;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 22 * dpr;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        // update
        p.x += p.dx * 0.0015;
        p.y += p.dy * 0.0012;
        if (p.x < 0 || p.x > 1) p.dx *= -1;
        if (p.y < 0 || p.y > 1) p.dy *= -1;
      });
      if (running) requestAnimationFrame(draw);
    }
    draw();
    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ filter: "blur(2px)" }}
    ></canvas>
  );
}

// --- 3. Floating 3D/Parallax Shapes ---
function Floating3DElements() {
  // SVG "abstract" 3D shapes
  return (
    <>
      <div
        className="absolute select-none left-1/4 top-16 xl:left-[20%] z-10"
        style={{
          transform: "translateZ(0) scale(1.1)",
          filter: "blur(0.5px)",
          pointerEvents: "none"
        }}
        aria-hidden
      >
        <svg width="100" height="86" viewBox="0 0 150 120" fill="none">
          <defs>
            <linearGradient id="shape1" x1="0" y1="0" x2="100%" y2="100%">
              <stop stopColor="#8db8fa" />
              <stop offset="1" stopColor="#fa89c2" />
            </linearGradient>
          </defs>
          <ellipse
            cx={75}
            cy={60}
            rx={60}
            ry={30}
            fill="url(#shape1)"
            opacity="0.6"
            style={{ filter: "blur(4px)" }}
          />
        </svg>
      </div>
      <div
        className="absolute right-14 bottom-32 z-10 select-none"
        style={{
          transform: "translateZ(0) scale(0.75) rotate(-12deg)",
          filter: "blur(1.5px)",
          pointerEvents: "none"
        }}
        aria-hidden
      >
        <svg width="105" height="96" viewBox="0 0 110 96" fill="none">
          <defs>
            <linearGradient
              id="shape2"
              x1="12"
              y1="11"
              x2="108"
              y2="91"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fff1eb" />
              <stop offset="1" stopColor="#ace0fa" />
            </linearGradient>
          </defs>
          <rect
            x="18"
            y="28"
            width="73"
            height="45"
            rx="18"
            fill="url(#shape2)"
            opacity="0.46"
          />
        </svg>
      </div>
    </>
  );
}

// --- 4. Typing Animation Headline ---
const TEXTS = [
  "From Idea to MVP in 10 Days",
  "Turning Vision into Stunning Reality",
  "Only $1500. Zero Compromise.",
];

function TypingHeadline() {
  const [display, setDisplay] = React.useState("");
  const [step, setStep] = React.useState(0);
  const [char, setChar] = React.useState(0);

  React.useEffect(() => {
    if (char < TEXTS[step].length) {
      const t = setTimeout(() => {
        setDisplay(TEXTS[step].slice(0, char + 1));
        setChar((c) => c + 1);
      }, 36 + Math.random() * 45);
      return () => clearTimeout(t);
    } else {
      const next =
        step + 1 >= TEXTS.length
          ? 0
          : step + 1;
      const t = setTimeout(() => {
        setChar(0);
        setDisplay("");
        setStep(next);
      }, 1550);
      return () => clearTimeout(t);
    }
  }, [char, step]);
  return (
    <h1 className="font-black mb-6 text-5xl sm:text-6xl tracking-tighter drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-[#418CFF] via-pink-500 to-[#e0e6f7] animate-gradient-bg transition-all duration-200 select-none"
        style={{
          lineHeight: 1.13,
          textShadow: "0 8px 32px #417aff88, 0 1px 1px #fff5"
        }}
    >
      {display}
      <span className="animate-blink text-blue-400 drop-shadow" style={{ marginLeft: "2px" }}>|</span>
        </h1>
  );
}

// --- 5. Glassmorphism Card Hero (with price, CTA) ---
function GlassHeroCard() {
  // TODO: Animations here
  return (
    <div
      className="relative z-20 p-10 px-8 sm:px-16 pt-14 pb-10 mx-auto bg-white/20 dark:bg-gray-800/20 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl max-w-2xl flex flex-col items-center glass-gradient animate-float transition-all duration-500"
      style={{
        boxShadow:
          "0 6px 32px 0 rgba(160,178,234,.18), 0 1.5px 7px #418cff22",
        border: "1.5px solid rgba(224,228,248,0.18)",
        background:
          "rgba(255,255,255,0.17) linear-gradient(135deg,#f0f4fa33 0%,#e0effb33 100%)",
        backdropFilter: "blur(24px)"
      }}
    >
      <div className="w-full flex flex-col items-center">
        <TypingHeadline />
        <div className="font-medium text-lg sm:text-xl text-slate-600 dark:text-gray-300 mt-2 mb-3 bg-white/30 dark:bg-gray-700/30 px-4 py-2 rounded-xl shadow-inner glass transition-colors duration-500">
          From Idea to MVP in <span className="font-black text-pink-500 dark:text-pink-400">10 Days</span>
          <span className="mx-3 px-2 py-1 text-lg bg-gradient-to-l from-blue-200/60 via-pink-100/50 to-blue-100/60 dark:from-blue-800/60 dark:via-pink-800/50 dark:to-blue-800/60 rounded-2xl font-extrabold text-pink-700 dark:text-pink-300 ml-6 shadow transition-all duration-500">Flat Fee <span className="text-blue-700 dark:text-blue-300">$1500</span></span>
        </div>
        <a
          href="#contact"
          className="group inline-block mt-6 px-10 py-4 rounded-full bg-gradient-to-br from-blue-600 via-pink-500 to-blue-500 text-white font-bold shadow-lg transition-all duration-200 border-2 border-white/30 ring-0 focus:outline-none focus:ring-4 focus:ring-blue-200 hover:scale-105 hover:shadow-2xl hover:from-pink-600 hover:to-blue-600 micro-interact"
          style={{
            fontSize: "1.33rem",
            letterSpacing: "0.01em",
          }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-white to-pink-200 animate-gradient-x">
          Start Your MVP
          </span>
        </a>
      </div>
    </div>
  );
}

// --- 6. 3D Parallax wrapper for hero section ---
function ParallaxHero({children}: {children: React.ReactNode}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const node = container.current;
    function handle(e: MouseEvent | TouchEvent) {
      const {left, top, width, height} = node.getBoundingClientRect();
      let x = 0, y = 0;
      if ("touches" in e && e.touches.length) {
        x = (e.touches[0].clientX - left - width/2) / width * 2;
        y = (e.touches[0].clientY - top - height/2) / height * 2;
      } else if ("clientX" in e) {
        x = (e.clientX - left - width/2) / width * 2;
        y = (e.clientY - top - height/2) / height * 2;
      }
      node.style.setProperty("--parallax-x", String(x));
      node.style.setProperty("--parallax-y", String(y));
    }
    node.addEventListener("mousemove", handle);
    node.addEventListener("touchmove", handle);
    return () => {
      node.removeEventListener("mousemove", handle);
      node.removeEventListener("touchmove", handle);
    };
  }, []);
  return (
    <div
      ref={container}
      className="relative w-full"
      style={{
        perspective: "980px"
      }}
    >
      <div
        className="relative"
        style={{
          transform:
            "rotateX(calc(var(--parallax-y,0)*6deg)) rotateY(calc(var(--parallax-x,0)*6deg))",
          transition: "transform .28s cubic-bezier(.65,.13,.35,.75)"
        }}
      >
        {children}
      </div>
    </div>
  );
}

// --- 7. Shimmer Gradient Border Animation Helper ---
function ShimmerGradientBorder({children, className='', style}: {children: React.ReactNode; className?: string; style?: React.CSSProperties}) {
  return (
    <div className={classNames(
      "relative group",
      className
    )} style={style}>
      <div className="absolute -inset-1.5 z-0 rounded-3xl shimmer-border pointer-events-none" />
      <div className="relative z-10">{children}</div>
      <style jsx>{`
        .shimmer-border {
          background:
            conic-gradient(
              from 90deg at 50% 50%,
              #fff 0deg, #a1c4fd 48deg, #ffb2da 120deg, #fbc2eb 167deg, #fad0c4 240deg, #a1c4fd 287deg, #fff 359deg
            );
          filter: blur(3px) saturate(1.6);
          opacity: 0.85;
          animation: shimmerRotate 2.8s linear infinite;
        }
        @keyframes shimmerRotate {
          0% { transform: rotateZ(0deg);}
          100% { transform: rotateZ(360deg);}
        }
      `}</style>
    </div>
  );
}

// --- 8. Service Card Flip (w/ AOS) ---
function FlippyServiceCard({
  title,
  icon,
  details,
  aosDelay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  details: React.ReactNode;
  aosDelay?: number;
}) {
  // Icon animation on hover, flip card
  return (
    <ShimmerGradientBorder className="w-full h-full aos-fade-up"
      style={{ transitionDelay: `${aosDelay}ms`, animationDelay: `${aosDelay}ms` }}>
      <div className="relative group perspective-1500 w-full h-full">
        <div className="flip-card-inner w-full h-full"
          tabIndex={0}
          aria-label={title + " details"}
        >
          {/* FRONT */}
          <div className="flip-card-front bg-white/60 dark:bg-gray-800/60 backdrop-blur-[6px] rounded-2xl px-7 py-10 flex flex-col items-center text-center min-h-[310px] shadow-2xl border border-transparent transition duration-500">
            <span
              className="service-icon mb-5 transition-transform duration-300 group-hover:scale-110"
            >
              {icon}
            </span>
            <h3 className="font-bold text-xl sm:text-2xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-pink-700 dark:from-blue-400 dark:to-pink-400 animate-gradient-x">{title}</h3>
            <p className="text-slate-700 dark:text-gray-300 text-base opacity-80 font-medium transition-colors duration-500">
              <span className="text-neutral-600/80 dark:text-gray-400/80">Hover for more</span>
            </p>
          </div>
          {/* BACK */}
          <div className="flip-card-back bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl flex flex-col items-center text-center min-h-[310px] p-8 shadow-2xl border border-neutral-200/40 dark:border-gray-600/40 justify-center transition-all duration-500">
            {details}
          </div>
        </div>
        <style jsx>{`
          .perspective-1500 { perspective: 1500px;}
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s cubic-bezier(.45,.21,.58,1);
            transform-style: preserve-3d;
          }
          .group:hover .flip-card-inner, .group:focus .flip-card-inner, .group:active .flip-card-inner {
            transform: rotateY(180deg);
          }
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0; top: 0;
            backface-visibility: hidden;
          }
          .flip-card-back { transform: rotateY(180deg);}
        `}</style>
      </div>
    </ShimmerGradientBorder>
  );
}

// --- 9. AOS wrapper for staggered fade-in on scroll ---
function useAOS() {
  // crude fade-up scroll effect via intersection observer
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".aos-fade-up");
    const reveal = (el: HTMLElement) => {
      el.classList.add("opacity-100", "translate-y-0");
      el.classList.remove("opacity-0", "translate-y-10");
    };
    const hide = (el: HTMLElement) => {
      el.classList.remove("opacity-100", "translate-y-0");
      el.classList.add("opacity-0", "translate-y-10");
    };
    const io = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.17 }
    );
    els.forEach((el) => {
      hide(el);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

// --- 10. Tech Stack Badge ---
function TechBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center bg-gradient-to-r from-blue-100/80 to-pink-100/60 px-3 py-1.5 rounded-lg font-semibold text-blue-700 border border-blue-300/40 shadow-md text-base leading-tight transition-all duration-150 hover:scale-105 hover:shadow-xl hover:bg-pink-100/80 cursor-pointer micro-interact mr-3 mb-2">
      <span className="mr-2 text-xl">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

// --- 11. Screenshot Carousel ---
function ScreenshotCarousel({
  images,
  altBase = "",
}: {
  images: { src: string; alt?: string }[];
  altBase?: string;
}) {
  const [idx, setIdx] = React.useState(0);
  // Autoplay
  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % images.length), 4200);
    return () => clearTimeout(t);
  }, [idx, images.length]);
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="h-0 pb-[63%] w-full" />
      <div className="absolute inset-0 w-full h-full">
        {images.map((img, i) => (
          <img
            src={img.src}
            alt={img.alt || `${altBase} Screenshot ${i + 1}`}
            key={img.src}
            className={classNames(
              "absolute left-0 top-0 w-full h-full object-cover rounded-xl shadow-lg transition-all duration-1000",
              (i === idx
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-90 z-0"),
            )}
            style={{ filter: i === idx ? "none" : "blur(2px)" }}
          />
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to screenshot ${i + 1}`}
            onClick={() => setIdx(i)}
            className={classNames(
              "w-3 h-3 rounded-full border-2 border-white/80 transition-all bg-white/70 hover:scale-125 hover:bg-blue-400",
              idx === i ? "bg-blue-500" : ""
            )}
            style={{
              boxShadow: idx === i ? "0 0 0 2px #80c5ff" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// --- 12. Live Demo Device Mockup Wrapper ---
function DeviceMockupCarousel({ children }: { children: React.ReactNode }) {
  // iPhone-mac hybrid look
  return (
    <div className="relative mx-auto rounded-[36px] border-[6px] border-blue-100 shadow-[0_16px_64px_0_#89a2d944,0_4px_24px_#d7e2fd88] bg-gradient-to-br from-blue-50/80 to-pink-100/50" style={{ maxWidth: 510 }}>
      <div className="relative rounded-[32px] overflow-hidden shadow-2xl min-h-[320px]">
        {children}
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-3 bg-gradient-to-r from-blue-200/40 via-pink-200/50 to-white/40 rounded-full blur-sm opacity-80"></div>
    </div>
  );
}

// --- 13. Premium Timeline Steps (vertical with progress) ---
const ProcessSteps: Array<{
  title: string;
  short: string;
  color: string;
  details: string;
  icon: React.ReactNode;
  illustration: React.ReactNode;
}> = [
  {
    title: "Discovery",
    short: "Vision, scope, and lightning-fast onboarding.",
    color: "from-blue-300 via-pink-200 to-pink-400",
    details: "We’ll jump on a rapid-fire discovery call, align on product vision and requirements inside hours, and share a living Notion doc with first-day wireframes. Real-world priorities, zero fluff.",
    icon: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="19" r="19" fill="#dbeafe"/>
        <path d="M11 23L19 15L27 23" stroke="#478cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    illustration: (
      <svg width="84" height="44" viewBox="0 0 84 44" fill="none">
        <ellipse cx="42" cy="22" rx="38" ry="12" fill="#dbeafe" />
        <rect x="31" y="8" width="22" height="28" rx="6" fill="#fff"/>
        <rect x="36" y="12" width="12" height="20" rx="2" fill="#b7e1fb"/>
      </svg>
    )
  },
  {
    title: "Development",
    short: "Daily progress, interactive demo, and true transparency.",
    color: "from-pink-300 via-blue-200 to-blue-400",
    details: "We ship in the open: you get video walkthroughs, live demo links, and honest feedback every day. All progress tracked transparently. Code is PR’d, tickets closed, features validated — no surprises, ever.",
    icon: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="19" r="19" fill="#fce7f3"/>
        <rect x="12.5" y="18" width="13" height="3" rx="1.5" fill="#f472b6"/>
        <rect x="15" y="15" width="8" height="3" rx="1.5" fill="#c026d3"/>
      </svg>
    ),
    illustration: (
      <svg width="70" height="46" viewBox="0 0 70 46" fill="none">
        <rect x="14" y="5" width="42" height="27" rx="6" fill="#fce7f3"/>
        <rect x="21" y="15" width="13" height="4" rx="2" fill="#fff"/>
        <rect x="36" y="23" width="8" height="2" rx="1" fill="#f472b6"/>
        <ellipse cx="35" cy="39" rx="23" ry="6" fill="#fbefff" />
      </svg>
    )
  },
  {
    title: "Deployment",
    short: "Full launch, all infra, and personal support.",
    color: "from-green-200 via-blue-100 to-pink-100",
    details: "We set up cloud, auth, database, and everything to deploy—then guide you hands-on through production launch. Afterwards? 7 days of bug-squashing and fast support, no extra fee.",
    icon: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="19" r="19" fill="#bbf7d0"/>
        <rect x="17" y="11" width="4" height="16" rx="2" fill="#34d399"/>
        <rect x="12" y="27" width="14" height="2" rx="1" fill="#2dd4bf"/>
      </svg>
    ),
    illustration: (
      <svg width="78" height="45" viewBox="0 0 78 45" fill="none">
        <rect x="19" y="10" width="40" height="20" rx="6" fill="#bbf7d0"/>
        <ellipse cx="39" cy="39" rx="28" ry="6" fill="#d1fae5"/>
        <rect x="34" y="4" width="10" height="9" rx="4" fill="#34d399"/>
      </svg>
    )
  }
];
function TimelineStep({
  index,
  open,
  onOpen,
}: {
  index: number;
  open: boolean;
  onOpen: (i: number) => void;
}) {
  const s = ProcessSteps[index];
  return (
    <div className="flex w-full">
      <div className="flex flex-col items-center z-20 pr-6">
        {/* The dot icon */}
        <button
          onClick={() => onOpen(index)}
          className={classNames(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-200 cursor-pointer micro-interact",
            open
              ? "border-pink-400 shadow-pink-200 scale-110"
              : "border-blue-200 shadow-blue-100 scale-100"
          )}
          style={{
            background:
              "linear-gradient(135deg,#fff 40%,#f9fafb88 100%)",
          }}
          tabIndex={0}
          aria-label={`${s.title} details`}
        >
          <span
            className="transition-transform duration-200"
            style={{ transform: open ? "rotateY(22deg) scale(1.28)" : "none" }}
          >
            {s.icon}
          </span>
        </button>
        {/* progress line below (if not last) */}
        {index < ProcessSteps.length - 1 && (
          <span
            className="h-24 md:h-28 w-2 rounded-full bg-gradient-to-b from-blue-200 via-pink-100 to-blue-300 mt-2 relative"
            style={{
              boxShadow: open
                ? "0px 0px 16px 2px #f472b633"
                : "0px 0px 8px #c1d6fa22"
            }}
          >
            <span
              className={classNames("absolute left-0 top-0 w-full bg-gradient-to-b from-blue-400 via-pink-500 to-pink-400 rounded-full transition-all duration-700")}
              style={{
                height: open ? "100%" : "18%",
                opacity: open ? 1 : 0.4,
                transition: "height .8s cubic-bezier(.49,.04,.76,.81), opacity 0.45s"
              }}
            ></span>
          </span>
        )}
      </div>
      <div className="w-full max-w-3xl mb-8">
        <div className={classNames(
          "relative bg-white/60 hover:bg-pink-50/80 hover:shadow-2xl transition-all duration-500 border border-pink-100/40 rounded-2xl p-8 px-12 flex flex-col shadow-lg",
          open ? "scale-[1.025] ring-2 ring-pink-300 z-30" : "z-10 opacity-85"
        )}>
          <div className="flex items-center mb-2">
            <div className="mr-3">{s.illustration}</div>
            <h4 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-pink-600 animate-gradient-x">
              {s.title}
            </h4>
          </div>
          <div className="text-base font-medium text-slate-600 mb-1">{s.short}</div>
          <div className={classNames(
            "text-pink-500 text-sm transition-all mt-0",
            open ? "opacity-95 max-h-40" : "opacity-0 h-0 overflow-hidden max-h-0"
          )}
            style={{
              transition: "opacity 0.5s, max-height 0.8s",
            }}
          >
            <div className="pt-4">{s.details}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function ServicesPage() {
  useAOS();

  // Timeline open state
  const [openStep, setOpenStep] = React.useState<number>(0);

  // Magnetic hover for portfolio button
  const magBtn = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const btn = magBtn.current;
    if (!btn) return;
    function follow(e: MouseEvent) {
      if (!btn) return;
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 16;
      const y = ((e.clientY - top) / height - 0.5) * 11.5;
      btn.style.transform = `translate(${x}px,${y}px) scale(1.065)`;
    }
    function reset() {
      if (!btn) return;
      btn.style.transform = "";
    }
    btn.addEventListener("mousemove", follow);
    btn.addEventListener("mouseleave", reset);
    return () => {
      btn.removeEventListener("mousemove", follow);
      btn.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f7f9fd] via-[#ebf0fa] to-[#ffe7f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-x-hidden transition-all duration-500"
      style={{
        WebkitTapHighlightColor: "transparent",
        cursor: "none"
      }}
    >
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Custom Cursor and Particle BG */}
      <CursorTrail />
      <section className="relative flex flex-col items-center justify-center min-h-[710px] text-center py-32 px-3 pt-[12vh] overflow-hidden">
        <AnimatedParticles />
        <Floating3DElements />
        <ParallaxHero>
          <GlassHeroCard />
        </ParallaxHero>
      </section>

      {/* SERVICES SECTION */}
      <section className="max-w-7xl mx-auto py-28 px-4 sm:px-10 z-40 relative">
        <h2 className="text-4xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 animate-gradient-x">Our Ultra-Premium Services</h2>
        <div className="grid gap-12 sm:grid-cols-3">
          <FlippyServiceCard
            title="MVP Development"
            aosDelay={75}
            icon={
              <span className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-100 via-blue-50 to-pink-50 rounded-full shadow-lg border-4 border-blue-200 group-hover:animate-pulse">
                <svg width="44" height="44" fill="none" viewBox="0 0 38 38">
                  <rect x="3" y="7" width="32" height="24" rx="6" className="fill-blue-200 group-hover:animate-icon-wiggle" />
                  <rect x="8" y="13" width="22" height="13" rx="3" className="fill-blue-600/60 group-hover:animate-icon-pop" />
              </svg>
              </span>
            }
            details={
              <div>
                <div className="font-bold text-lg mb-2 text-blue-700">Lightning Fast Launch</div>
                <ul className="text-base list-disc ml-6 text-pink-700">
                  <li>Launch-ready MVPs – from zero to hero in 10 days</li>
                  <li>Fast, agile, founder-focused execution</li>
                  <li>Transparent milestones + daily updates</li>
                </ul>
              </div>
            }
          />
          <FlippyServiceCard
            title="Full-Stack Apps"
            aosDelay={180}
            icon={
              <span className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-pink-100 via-pink-50 to-blue-50 rounded-full shadow-lg border-4 border-pink-200 group-hover:animate-pulse">
                <svg width="44" height="44" fill="none" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" className="fill-pink-100 group-hover:animate-icon-3d" />
                  <path d="M16 30V16l6-5 6 5v14" className="stroke-pink-600 group-hover:animate-icon-pop" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              </span>
            }
            details={
              <div>
                <div className="font-bold text-lg mb-2 text-pink-700">Modern, Scalable, Beautiful</div>
                <ul className="text-base list-disc ml-6 text-blue-700">
                  <li>Web, mobile, real-time backends</li>
                  <li>Fluid, responsive UI with pixel-perfect finish</li>
                  <li>Sane, maintainable, documented codebase</li>
                </ul>
              </div>
            }
          />
          <FlippyServiceCard
            title="Real-time Features"
            aosDelay={330}
            icon={
              <span className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-200 via-blue-100 to-pink-50 rounded-full shadow-lg border-4 border-blue-300 group-hover:animate-pulse">
                <svg width="44" height="44" fill="none" viewBox="0 0 44 44">
                  <rect x="7" y="17" width="30" height="9" rx="3" className="fill-blue-100 group-hover:animate-icon-3d" />
                  <path d="M12 22h20" className="stroke-blue-600 group-hover:animate-icon-pop" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              </span>
            }
            details={
              <div>
                <div className="font-bold text-lg mb-2 text-blue-700">Breathtaking Interactivity</div>
                <ul className="text-base list-disc ml-6 text-pink-700">
                  <li>Live chat, notifications, and collaborative editing</li>
                  <li>Analytics, dashboards, and real-time UX</li>
                  <li>Enterprise-level resilience & scaling</li>
                </ul>
              </div>
            }
          />
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="bg-gradient-to-br from-white/95 to-blue-50 via-pink-50 py-28 px-4 border-y border-blue-50 mt-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-14 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-pink-400 to-blue-700 animate-gradient-x">Portfolio Highlight</h2>
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Device Mockup with Carousel Demo */}
            <DeviceMockupCarousel>
              <ScreenshotCarousel
                images={[
                  { src: "/portfolio-bookmark-1.png", alt: "Bookmark app list" },
                  { src: "/portfolio-bookmark-2.png", alt: "Bookmark with tags" },
                  { src: "/portfolio-bookmark-3.png", alt: "Collaboration view" },
                ]}
                altBase="Bookmark App"
              />
            </DeviceMockupCarousel>
            <div className="flex flex-col items-start justify-center text-left">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-blue-600 to-pink-400 animate-gradient-x">Bookmark Web App</h3>
              <div className="text-lg mb-4 text-slate-700 font-medium leading-relaxed">
                Built for a SaaS founder in 10 days:<br />
                <span className="bg-blue-100/80 text-blue-800 rounded px-2 ml-1 font-bold shadow">Zero bugs post-launch.</span>
              </div>
              <ul className="list-none flex flex-wrap gap-2 mb-5">
                <TechBadge
                  label="Next.js"
                  icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="black"><circle cx="9" cy="9" r="9" fill="#fff" /><path d="M3 12l12-6" stroke="#478cf8" strokeWidth="2"/></svg>}
                />
                <TechBadge
                  label="Supabase"
                  icon={<svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 15l10-6-7-6z" fill="#12b886"/></svg>}
                />
                <TechBadge
                  label="Tailwind"
                  icon={<svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 12c1.5-4 8.5-4 10 0" stroke="#06b6d4" strokeWidth="2" fill="none"/></svg>}
                />
                <TechBadge
                  label="Typescript"
                  icon={<svg width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="16" rx="4" fill="#247bdb"/><text x="9" y="13" textAnchor="middle" fill="#fff" fontSize="7">TS</text></svg>}
                />
              </ul>
              <ul className="list-disc ml-6 mb-7 text-blue-800 text-[1.08rem] leading-relaxed">
                <li>Folders, tags, & real auth</li>
                <li>Real-time sync, per-user privacy</li>
                <li>Share/collaborate with ease</li>
                <li>Device-perfect responsive UI</li>
              </ul>
              <a 
                ref={magBtn}
                href="https://mvp-factory-ten.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block px-8 py-3 rounded-full bg-gradient-to-br from-blue-600 to-pink-600 text-white font-bold shadow-xl transition-all duration-200 border-2 border-white/50 hover:scale-105 hover:shadow-2xl hover:from-pink-800 hover:to-blue-500 focus-visible:ring-4 focus-visible:ring-blue-200 micro-interact"
                style={{
                  fontSize: "1.18rem",
                  letterSpacing: "0.01em",
                }}
              >
                <span className="transition-transform duration-150 group-hover:scale-105">View Live Demo →</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* PROCESS SECTION */}
      <section className="max-w-4xl mx-auto py-24 px-4 relative z-30">
        <h2 className="text-4xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-pink-500 to-blue-700 animate-gradient-x">Our Process</h2>
        <div className="flex flex-col w-full relative">
          {ProcessSteps.map((_, i) => (
            <TimelineStep
              key={i}
              index={i}
              open={openStep === i}
              onOpen={setOpenStep}
            />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-gradient-to-tr from-blue-50/80 via-white/80 to-pink-100/40 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-11 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-blue-500 to-pink-400 animate-gradient-x">Testimonials</h2>
          <div className="flex flex-col md:flex-row gap-12 md:gap-7 justify-center flex-wrap">
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[260px] max-w-md mx-auto bg-white/80 px-10 py-8 rounded-2xl shadow-2xl border-2 border-blue-100/40 transition hover:shadow-3xl hover:scale-105 hover:border-pink-200/70 aos-fade-up"
                style={{ animationDelay: `${300 + idx * 160}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shadow group-hover:scale-110 transition">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#e0e7ff"/>
                      <path d="M17 9l-5 5-3-3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-blue-700 animate-gradient-x">Founder Name</span>
                </div>
                <blockquote className="italic text-slate-600">
                  “Amazing speed and quality! [Your testimonial here…]”
                </blockquote>
              </div>
            ))}
          </div>
          <p className="text-slate-400 mt-10 text-base">Testimonials coming soon. Yours could be here!</p>
        </div>
      </section>

      {/* CONTACT / CTA SECTION */}
      <section id="contact" className="py-24 px-4 bg-gradient-to-br from-blue-50/90 via-white/80 to-pink-50/60">
        <div className="max-w-2xl mx-auto text-center mb-11">
          <h2 className="text-4xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-pink-500 to-blue-800 animate-gradient-x">Ready to Launch Your MVP?</h2>
          <p className="text-xl text-slate-700">
            Tell us your dream – we'll reply within 12 hours.
          </p>
        </div>
        <ContactForm />
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-slate-500 dark:text-gray-400 text-center text-base select-none transition-colors duration-500">
        &copy; {new Date().getFullYear()} My MVP Factory. All rights reserved.
      </footer>

      {/* --- CSS/Keyframes for special gradients, icon animation, blink, micro-interactions, etc --- */}
      <style jsx global>{`
        .animate-blink {
          animation: blink 1.07s infinite steps(1, end);
        }
        @keyframes blink { 0%,70%{opacity:1} 80%,100%{opacity:0} }
        .animate-gradient-x {
          background-size: 200%;
          animation: bg-x-move 3.4s ease-in-out infinite;
        }
        @keyframes bg-x-move {
          0% { background-position: 0% 50%;}
          50% { background-position: 100% 50%;}
          100% { background-position: 0% 50%;}
        }
        .animate-gradient-bg {
          background-size: 180% 180%;
          animation: gradientBG 9s alternate infinite;
        }
        @keyframes gradientBG {
          0% {background-position:0 22%;}
          23% {background-position:100% 55%;}
          65% {background-position:75% 80%;}
          100% {background-position: 0% 50%;}
        }
        .micro-interact {
          transition: box-shadow .2s cubic-bezier(.43,.41,.23,.92), transform .18s cubic-bezier(.8,1,.1,.94), background .15s;
        }
        .micro-interact:active, .micro-interact:focus {
          box-shadow: 0 7px 24px 0 #3b82f688,0 1.5px 6px #d946ef77;
          transform: scale(0.95);
        }
        /* Service card icon animation */
        .group:hover .service-icon>svg, .group:focus .service-icon>svg {
          filter: drop-shadow(0 0 14px #fa89e522);
          transform: scale(1.20) rotateZ(-6deg);
        }
        .group:hover .flip-card-front,
        .group:focus .flip-card-front { background: rgba(255,255,255,0.78);}
        /* Icon Animations */
        @keyframes icon-pop { 0%{transform:scale(1.1);} 70%{transform:scale(1.26);} 100%{transform:scale(1);} }
        @keyframes icon-3d { from{filter:drop-shadow(0 0 0 #fff);} 80%{filter:drop-shadow(0 2px 14px #478cffcc);} to{filter:none;} }
        @keyframes icon-wiggle { 
          0% {transform: rotate(-1deg);}
          30% {transform: rotate(7deg);}
          60% {transform: rotate(-6deg);}
          100% {transform: rotate(0);}
        }
        .group:hover .animate-icon-pop { animation: icon-pop 0.58s cubic-bezier(.41,1.14,.67,-0.52); }
        .group:hover .animate-icon-3d { animation: icon-3d 0.75s cubic-bezier(.23,.9,.45,.96); }
        .group:hover .animate-icon-wiggle {animation: icon-wiggle .78s cubic-bezier(.41,1.14,.67,-0.52);}
        /* AOS fade up effect */
        .aos-fade-up { opacity:0; transform:translateY(40px); transition: opacity .75s cubic-bezier(.33,.6,.32,1.08), transform .91s cubic-bezier(.19,.98,.56,.96);}
        .aos-fade-up.opacity-100 { opacity:1;}
        .aos-fade-up.translate-y-0 { transform: none; }
        @media (max-width:570px){
          .flip-card-front,.flip-card-back{min-height:210px;}
        }
        /* Hide desktop scrollbars for fancy look */
        ::-webkit-scrollbar {
          width: 8px; background:#f3f5fa;
        } ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg,#e7edfc 0%,#fadbf6 85%);
          border-radius: 8px;
        }
        /* -- Selection and highlight premium look -- */
        ::selection { background: #a7c2f9; color: #28143b;}
        .dark ::selection { background: #3b82f6; color: #ffffff;}
      `}</style>
    </div>
  );
}

// --- Contact Form with Glassmorphism & Animations ---
function ContactForm() {
  const [state, setState] = React.useState<"idle" | "loading" | "sent" | "error">("idle");
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      // Replace with real mail/send logic
      await new Promise(res => setTimeout(res, 1400));
      setState("sent");
    } catch (e) {
      setState("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-2xl border-2 border-blue-100/30 dark:border-gray-600/30 p-10 sm:p-11 max-w-2xl mx-auto backdrop-blur-lg aos-fade-up transition-all duration-500"
      style={{
        background:
          "rgba(255,255,255,0.43) linear-gradient(135deg,#f0f6ff22 0%,#f9e5f9 100%)",
        boxShadow:
          "0 7px 42px 0 #418cff15, 0 2px 9px #eabbe755"
      }}
    >
      <div className="grid gap-6 mb-2">
        <input
          className="border-2 border-blue-100/70 dark:border-gray-600/70 rounded-lg px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-400 bg-white/80 dark:bg-gray-700/80 font-semibold text-blue-900 dark:text-gray-100 text-lg shadow transition-all micro-interact"
          type="text"
          name="name"
          placeholder="Your Name"
          required
          value={form.name}
          onChange={handleChange}
          disabled={state === "loading" || state === "sent"}
        />
        <input
          className="border-2 border-blue-100/70 dark:border-gray-600/70 rounded-lg px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:focus:ring-gray-400 bg-white/80 dark:bg-gray-700/80 font-semibold text-blue-900 dark:text-gray-100 text-lg shadow transition-all micro-interact"
          type="email"
          name="email"
          placeholder="Your Email"
          required
          value={form.email}
          onChange={handleChange}
          disabled={state === "loading" || state === "sent"}
        />
        <textarea
          className="border-2 border-blue-100/70 dark:border-gray-600/70 rounded-lg px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-gray-400 bg-white/80 dark:bg-gray-700/80 font-semibold text-blue-900 dark:text-gray-100 text-lg shadow min-h-[110px] resize-vertical transition-all micro-interact"
          name="message"
          placeholder="Tell us about your MVP project…"
          required
          value={form.message}
          onChange={handleChange}
          disabled={state === "loading" || state === "sent"}
        />
      </div>
      <button
        type="submit"
        className={classNames(
          "w-full mt-6 py-3 rounded-xl font-extrabold text-lg transition micro-interact",
          state === "idle" &&
            "bg-gradient-to-r from-blue-600  via-pink-500 to-blue-600 text-white hover:from-pink-600 hover:to-blue-700 shadow hover:scale-[1.03]",
          state === "loading" &&
            "bg-gradient-to-r from-blue-200 to-pink-100 text-slate-500 cursor-not-allowed shadow-inner",
          state === "sent" &&
            "bg-gradient-to-r from-green-400 to-blue-300 text-white cursor-not-allowed"
        )}
        disabled={state !== "idle"}
        style={{ fontSize: "1.13rem" }}
      >
        {state === "idle" && "Send Message"}
        {state === "loading" && "Sending..."}
        {state === "sent" && "Sent! We'll be in touch."}
      </button>
      {state === "error" && (
        <p className="text-red-600 mt-4 text-base font-bold animate-blink">Oops! Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
