import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ============ DATA ============ */
// const IMG = {
//   hero: "/images/hero.jpg", shop: "/images/shop.jpg",
//   fade: "/images/fade.jpg", beard: "/images/beard.jpg", texture: "/images/texture.jpg",
//   b1: "/images/barber-1.jpg", b2: "/images/barber-2.jpg", b3: "/images/barber-3.jpg",
// };
const IMG = {
  hero: `${import.meta.env.BASE_URL}images/hero.jpg`, 
  shop: `${import.meta.env.BASE_URL}images/shop.jpg`,
  fade: `${import.meta.env.BASE_URL}images/fade.jpg`, 
  beard: `${import.meta.env.BASE_URL}images/beard.jpg`, 
  texture: `${import.meta.env.BASE_URL}images/texture.jpg`,
  b1: `${import.meta.env.BASE_URL}images/barber-1.jpg`, 
  b2: `${import.meta.env.BASE_URL}images/barber-2.jpg`, 
  b3: `${import.meta.env.BASE_URL}images/barber-3.jpg`,
};


const ROUTES = ["home", "services", "gallery", "barbers", "booking", "contacts"] as const;
type Route = (typeof ROUTES)[number];
const LABEL: Record<Route, string> = { home: "Home", services: "Services", gallery: "Gallery", barbers: "Barbers", booking: "Booking", contacts: "Contacts" };
const SERVICES = [
  { title: "Skin Fade", img: IMG.fade, price: 35, time: "45 min", text: "A razor-clean blend from skin to length, finished by hand." },
  { title: "Beard Trim", img: IMG.beard, price: 25, time: "30 min", text: "Sculpted lines, hot towel and a conditioning oil finish." },
  { title: "Texture Styling", img: IMG.texture, price: 40, time: "50 min", text: "Cut, texture and styling tailored to your face shape." },
];
const MENU = [...SERVICES.map(s => ({ t: s.title, p: s.price, d: s.time, img: s.img })),
  { t: "Classic Shave", p: 30, d: "35 min", img: IMG.shop }, { t: "The Full District", p: 80, d: "90 min", img: IMG.hero }, { t: "Kids Cut", p: 22, d: "30 min", img: IMG.b2 }];
const BARBERS = [
  { name: "Marcus Hale", role: "Master Barber", img: IMG.b1, years: 12 },
  { name: "Elias Ward", role: "Fade Specialist", img: IMG.b2, years: 8 },
  { name: "Dante Rivas", role: "Beard Artist", img: IMG.b3, years: 10 },
];
const GALLERY = [IMG.hero, IMG.fade, IMG.shop, IMG.beard, IMG.b1, IMG.texture, IMG.b2, IMG.b3, IMG.shop];
const QUOTES = [["Best fade I’ve had in ten years. Marcus is an artist.", "Daniel R."], ["The hot towel shave alone is worth the trip.", "Samuel K."], ["Walked in tired, walked out a new man.", "Alex M."]];
const MANIFESTO = "A great cut is quiet confidence. Every fade is drawn by hand, every line checked twice, and every guest leaves sharper than he arrived.";
const SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const EASE = "ease-[cubic-bezier(.2,.7,.2,1)]";

/* ============ HOOKS ============ */
function useRoute(): [Route, (r: Route) => void] {
  const read = (): Route => ROUTES.find(r => r === location.hash.slice(2)) ?? "home";
  const [r, setR] = useState<Route>(read);
  useEffect(() => { const f = () => { setR(read()); scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }; addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  return [r, n => { location.hash = "/" + n; }];
}
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => { let raf = 0; const f = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setY(scrollY)); };
    addEventListener("scroll", f, { passive: true }); f(); return () => { removeEventListener("scroll", f); cancelAnimationFrame(raf); }; }, []);
  return y;
}
function useInView<T extends HTMLElement>(t = 0.2) {
  const ref = useRef<T>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: t }); io.observe(el); return () => io.disconnect(); }, [t]);
  return [ref, on] as const;
}

/* ============ BRAND ============ */
function Logo({ size = 40 }: { size?: number }) {
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
    <circle cx="24" cy="24" r="22" fill="none" stroke="#c69c5d" strokeWidth="1.4" pathLength={1} strokeDasharray="1" style={{ animation: "draw 1.6s ease both" }} />
    <circle cx="24" cy="24" r="18" fill="none" stroke="#c69c5d" strokeWidth=".6" opacity=".55" />
    <path d="M9 24h4M35 24h4" stroke="#c69c5d" strokeWidth="1" />
    <text x="24" y="29.5" textAnchor="middle" fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" fontSize="16" letterSpacing="-.5" fill="#f6edd3">FD</text>
  </svg>;
}
const Brand = ({ size = 38 }: { size?: number }) => <span className="flex items-center gap-3 text-left"><Logo size={size} />
  <span className="leading-none"><span className="block font-serif tracking-[0.16em] text-[#f6edd3]">FADE DISTRICT</span><span className="mt-1.5 block text-[8px] uppercase tracking-[0.55em] text-[#c69c5d]">Barber Co.</span></span></span>;
const Eyebrow = ({ children, left = false }: { children: ReactNode; left?: boolean }) => <p className={`mb-5 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-[#c69c5d] ${left ? "" : "justify-center"}`}>
  <i className="h-px w-8 bg-[#c69c5d]" />{children}{!left && <i className="h-px w-8 bg-[#c69c5d]" />}</p>;

/* ============ PRIMITIVES ============ */
function Reveal({ children, delay = 0, from = "up", className = "" }: { children: ReactNode; delay?: number; from?: "up" | "left" | "right"; className?: string }) {
  const [ref, on] = useInView<HTMLDivElement>(0.12);
  const hid = from === "up" ? "translate-y-10" : from === "left" ? "-translate-x-10" : "translate-x-10";
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-1000 ${EASE} motion-reduce:transition-none ${on ? "translate-x-0 translate-y-0 opacity-100" : `${hid} opacity-0`} ${className}`}>{children}</div>;
}
function Words({ text, className = "" }: { text: string; className?: string }) {
  const [ref, on] = useInView<HTMLHeadingElement>(0.3);
  return <h2 ref={ref} className={className}>{text.split(" ").map((w, i) => <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
    <span style={{ transitionDelay: `${i * 90}ms` }} className={`inline-block transition-transform duration-1000 ${EASE} ${on ? "translate-y-0" : "translate-y-full"}`}>{w}</span></span>)}</h2>;
}
function Photo({ src, label, className = "", style }: { src: string; label: string; className?: string; style?: CSSProperties }) {
  return <div role="img" aria-label={label} className={`bg-cover bg-center ${className}`} style={{ backgroundImage: `url(${src}), repeating-linear-gradient(135deg,rgba(198,156,93,.07) 0 14px,transparent 14px 28px), linear-gradient(135deg,#4a3320,#141414)`, ...style }} />;
}
function Parallax({ y, src, label, k = 0.12 }: { y: number; src: string; label: string; k?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [o, setO] = useState(0);
  useEffect(() => { const r = ref.current?.getBoundingClientRect(); if (r) setO((r.top + r.height / 2 - innerHeight / 2) * -k); }, [y, k]);
  return <div ref={ref} className="absolute inset-0 overflow-hidden"><Photo src={src} label={label} className="absolute inset-x-0 -top-[20%] h-[140%]" style={{ transform: `translateY(${o}px)` }} /></div>;
}
type V = "gold" | "dark" | "ghost";
const VAR: Record<V, string> = {
  gold: "border-[#c69c5d] bg-[#c69c5d] text-[#141414] hover:bg-transparent hover:text-[#c69c5d]",
  dark: "border-[#141414] bg-[#141414] text-[#f6edd3] hover:bg-transparent hover:text-[#141414]",
  ghost: "border-[#f3e9cf]/80 text-[#f6edd3] hover:bg-[#f3e9cf] hover:text-[#141414]",
};
/* Магнит: события ловит НЕподвижная обёртка, двигается только внутренняя кнопка — поэтому нет дрожания */
function Magnetic({ children, onClick, v = "gold", disabled = false }: { children: ReactNode; onClick?: () => void; v?: V; disabled?: boolean }) {
  const [p, setP] = useState({ x: 0, y: 0 });
  return <span className="-m-3 inline-block p-3"
    onMouseMove={e => { if (disabled) return; const r = e.currentTarget.getBoundingClientRect(); setP({ x: (e.clientX - r.left - r.width / 2) * 0.12, y: (e.clientY - r.top - r.height / 2) * 0.2 }); }}
    onMouseLeave={() => setP({ x: 0, y: 0 })}>
    <button disabled={disabled} onClick={onClick} style={{ transform: `translate(${p.x}px,${p.y}px)` }}
      className={`border px-8 py-3 font-serif text-lg transition-[transform,background-color,color,opacity] duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40 ${VAR[v]}`}>{children}</button></span>;
}
function Count({ to, suffix = "", dec = 0 }: { to: number; suffix?: string; dec?: number }) {
  const [ref, on] = useInView<HTMLSpanElement>(0.5); const [n, setN] = useState(0);
  useEffect(() => { if (!on) return; const t0 = performance.now(); let raf = 0;
    const f = (t: number) => { const k = Math.min((t - t0) / 1800, 1); setN(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [on, to]);
  return <span ref={ref}>{n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}{suffix}</span>;
}
function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer:fine)").matches) return;
    let x = -50, y = -50, cx = -50, cy = -50, s = 1, big = false, raf = 0;
    const mv = (e: MouseEvent) => { x = e.clientX; y = e.clientY; big = !!(e.target as HTMLElement).closest("a,button,[data-hover]"); };
    const loop = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; s += ((big ? 1.9 : 1) - s) * 0.15;
      if (el.current) el.current.style.transform = `translate(${cx - 18}px,${cy - 18}px) scale(${s})`; raf = requestAnimationFrame(loop); };
    addEventListener("mousemove", mv); raf = requestAnimationFrame(loop);
    return () => { removeEventListener("mousemove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={el} className="pointer-events-none fixed left-0 top-0 z-[200] hidden h-9 w-9 rounded-full border border-[#c69c5d] md:block" />;
}
const Loader = ({ done }: { done: boolean }) => <div className={`fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#141414] transition-transform duration-[1100ms] ease-[cubic-bezier(.77,0,.18,1)] ${done ? "-translate-y-full" : ""}`}>
  <Logo size={96} /><p className="mt-7 animate-[pageIn_1s_.4s_both] font-serif tracking-[0.45em] text-[#f6edd3]">FADE DISTRICT</p></div>;

/* ============ LAYOUT ============ */
function Nav({ route, go, y }: { route: Route; go: (r: Route) => void; y: number }) {
  const [open, setOpen] = useState(false);
  return <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${y > 40 ? "bg-[#141414]/90 py-3 backdrop-blur-md" : "py-6"}`}>
    <div className="flex items-center justify-between px-6 md:px-14">
      <button onClick={() => go("home")}><Brand /></button>
      <nav className="hidden items-center gap-9 text-[13px] text-[#f6edd3] md:flex">
        {ROUTES.filter(r => r !== "booking").map(r => <button key={r} onClick={() => go(r)} className={`relative py-1 transition-colors hover:text-[#c69c5d] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-[#c69c5d] after:transition-transform after:duration-300 ${route === r ? "text-[#c69c5d] after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`}>{LABEL[r]}</button>)}
      </nav>
      <button onClick={() => go("booking")} className="hidden rounded-full border border-white/30 px-5 py-1.5 text-[13px] text-[#f6edd3] transition-colors duration-300 hover:border-[#c69c5d] hover:bg-[#c69c5d] hover:text-[#141414] md:block">Book now</button>
      <button aria-label="Menu" onClick={() => setOpen(!open)} className="text-2xl text-[#f6edd3] md:hidden">{open ? "✕" : "☰"}</button>
    </div>
    <div className={`overflow-hidden bg-[#141414] transition-all duration-500 md:hidden ${open ? "max-h-96" : "max-h-0"}`}>
      {ROUTES.map(r => <button key={r} onClick={() => { go(r); setOpen(false); }} className="block w-full px-6 py-3 text-left font-serif text-xl text-[#f6edd3]">{LABEL[r]}</button>)}</div></header>;
}
const Footer = ({ go }: { go: (r: Route) => void }) => <footer className="bg-[#141414] px-6 py-16 text-[#f6edd3] md:px-14"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
  <div><Brand size={44} /><p className="mt-5 text-xs text-[#a79f88]">Sharp cuts. Honest craft. Since 2014.</p></div>
  <div className="text-xs">{ROUTES.map(r => <button key={r} onClick={() => go(r)} className="block py-1 text-[#a79f88] transition-colors hover:text-[#c69c5d]">{LABEL[r]}</button>)}</div>
  <div className="text-xs text-[#a79f88]"><p className="mb-2 text-[#f6edd3]">Hours</p><p>Mon–Fri 9:00–20:00</p><p>Sat 10:00–18:00</p><p>Sun closed</p></div>
  <div className="text-xs text-[#a79f88]"><p className="mb-2 text-[#f6edd3]">Contact</p><p>221 Mercer Street</p><p>hello@fadedistrict.org</p><p>+1 (555) 014-2290</p></div>
</div><p className="mt-14 text-center text-[10px] text-[#8a8370]">© 2026 Fade District. All rights reserved.</p></footer>;
const PageHead = ({ eyebrow, title }: { eyebrow: string; title: string }) => <section className="bg-[#141414] px-6 pb-20 pt-40 text-center md:px-14"><Eyebrow>{eyebrow}</Eyebrow><Words text={title} className="font-serif text-5xl font-bold text-[#f6edd3] md:text-7xl" /></section>;

/* ============ HOME ============ */
function Manifesto({ y }: { y: number }) {
  const ref = useRef<HTMLParagraphElement>(null); const [p, setP] = useState(0);
  useEffect(() => { const r = ref.current?.getBoundingClientRect(); if (r) setP(Math.min(Math.max((innerHeight * 0.85 - r.top) / (innerHeight * 0.55), 0), 1)); }, [y]);
  const w = MANIFESTO.split(" ");
  return <p ref={ref} className="mx-auto max-w-4xl text-center font-serif text-3xl leading-snug text-[#f6edd3] md:text-5xl">{w.map((x, i) => <span key={i} style={{ opacity: 0.18 + 0.82 * Math.min(Math.max(p * w.length * 1.15 - i, 0), 1) }}>{x} </span>)}</p>;
}
function Quotes() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(n => (n + 1) % QUOTES.length), 5000); return () => clearInterval(t); }, []);
  return <div className="mx-auto max-w-3xl text-center text-[#141414]"><div className="relative h-56">{QUOTES.map(([q, a], k) => <div key={k} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${i === k ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
    <p className="font-serif text-3xl italic leading-snug md:text-4xl">“{q}”</p><p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#a8814c]">{a}</p></div>)}</div>
    <div className="flex justify-center gap-3">{QUOTES.map((_, k) => <button key={k} aria-label={`Quote ${k + 1}`} onClick={() => setI(k)} className={`h-1 transition-all duration-500 ${i === k ? "w-10 bg-[#c69c5d]" : "w-5 bg-[#141414]/20"}`} />)}</div></div>;
}
function Home({ y, go, ready }: { y: number; go: (r: Route) => void; ready: boolean }) {
  const [m, setM] = useState({ x: 70, y: 30 });
  const a = (d: number) => ({ style: { animationDelay: `${d}s` }, className: ready ? "animate-[pageIn_1s_both]" : "opacity-0" });
  return <>
    <section onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setM({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }} className="relative grid min-h-screen overflow-hidden bg-[#141414] md:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-center px-6 pb-24 pt-36 md:px-14" style={{ transform: `translateY(${Math.min(y, 900) * -0.12}px)`, opacity: Math.max(1 - y / 700, 0) }}>
        <div {...a(0.1)}><Eyebrow left>Est. 2014 · Premium Barbershop</Eyebrow></div>
        <h1 className="font-serif text-6xl font-bold leading-[1.05] text-[#f6edd3] md:text-8xl">{["Sharp Style", "Starts Here"].map((l, i) => <span key={l} className="block overflow-hidden pb-1"><span style={{ animationDelay: `${0.25 + i * 0.18}s` }} className={`block ${ready ? "animate-[lineUp_1.2s_both_cubic-bezier(.2,.7,.2,1)]" : "translate-y-full"}`}>{l}</span></span>)}</h1>
        <p {...a(0.8)} className={`mt-8 max-w-md text-sm leading-relaxed text-[#cfc6ad] ${a(0.8).className}`}>Precision cuts, classic shaves and beard craft in a room built for ritual. Step in, sit back, leave sharper.</p>
        <div {...a(1)} className={`mt-10 flex flex-wrap gap-5 ${a(1).className}`}><Magnetic onClick={() => go("booking")}>Book Appointment</Magnetic><Magnetic v="ghost" onClick={() => go("services")}>Explore Styles</Magnetic></div>
      </div>
      <div className="relative hidden overflow-hidden md:block">
        <Photo src={IMG.hero} label="Barber crafting a fade" className="absolute inset-x-0 -top-[12%] h-[124%] will-change-transform" style={{ transform: `translateY(${Math.min(y, 900) * 0.12}px) scale(1.04)` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/15 to-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(520px circle at ${m.x}% ${m.y}%, rgba(198,156,93,.15), transparent 60%)` }} />
      <div className="absolute bottom-10 left-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.35em] text-[#c69c5d] md:left-14"><span className="h-px w-14 origin-left animate-[pulse_2s_infinite] bg-[#c69c5d]" />Scroll</div>
    </section>

    <div className="relative z-10 flex justify-center"><Reveal className="-mt-[72px]"><div className="bg-[#141414] p-2 shadow-2xl"><div className="flex h-36 w-36 flex-col items-center justify-center gap-2 border border-[#c69c5d]/60"><Logo size={52} /><span className="font-serif text-[13px] tracking-[0.2em] text-[#f6edd3]">DISTRICT</span></div></div></Reveal></div>

    <section className="bg-[#fbf3dc] px-6 pb-28 pt-24 md:px-14"><div className="mx-auto max-w-6xl">
      <div className="mb-14 text-[#141414]"><Eyebrow>Signature services</Eyebrow><Words text="Crafted, never rushed" className="text-center font-serif text-4xl font-bold md:text-5xl" /></div>
      <div className="grid gap-7 md:grid-cols-3">{SERVICES.map((s, i) => <Reveal key={s.title} delay={i * 150} className="group pb-4">
        <article onClick={() => go("services")} className="cursor-pointer overflow-hidden bg-[#fdf6dd] shadow-[0_18px_40px_-18px_rgba(60,40,10,.35)] transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_55px_-18px_rgba(60,40,10,.55)]">
          <div className="aspect-[4/3.6] overflow-hidden"><Photo src={s.img} label={s.title} className="h-full w-full transition-transform duration-[900ms] group-hover:scale-110" /></div>
          <div className="px-6 pb-8 pt-6 text-center"><h3 className="font-serif text-2xl font-bold text-[#141414]">{s.title}</h3><p className="mt-3 text-xs leading-relaxed text-[#5b5546]">{s.text}</p><p className="mt-4 font-serif text-lg text-[#a8814c]">from ${s.price}</p></div></article></Reveal>)}</div></div></section>

    <section className="relative overflow-hidden bg-[#141414] px-6 py-32 md:px-14">
      <div className="absolute inset-0 opacity-25"><Parallax y={y} src={IMG.shop} label="Shop interior" /></div>
      <div className="relative"><Manifesto y={y} />
        <div className="mx-auto mt-24 grid max-w-5xl gap-10 text-center md:grid-cols-4 text-[#f6edd3]">
          {([[12, "+", 0, "Years of craft"], [48000, "+", 0, "Fresh cuts"], [3, "", 0, "Master barbers"], [4.9, "", 1, "Average rating"]] as const).map(([n, s, d, l], i) => <Reveal key={l} delay={i * 120}>
            <p className="font-serif text-5xl font-bold text-[#c69c5d]"><Count to={n} suffix={s} dec={d} /></p><p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#cfc6ad]">{l}</p></Reveal>)}</div></div></section>

    <section className="bg-[#fbf3dc] px-6 py-28"><Reveal><Eyebrow>Kind words</Eyebrow><Quotes /></Reveal></section>

    <section className="bg-[#c69c5d] px-6 py-28 text-center text-[#141414]"><Reveal><p className="mb-5 text-xs uppercase tracking-[0.35em]">Your chair is waiting</p>
      <Words text="Ready for your sharpest look?" className="mx-auto max-w-3xl font-serif text-4xl font-bold md:text-6xl" /><div className="mt-10"><Magnetic v="dark" onClick={() => go("booking")}>Book Appointment</Magnetic></div></Reveal></section>
  </>;
}

/* ============ PAGES ============ */
function Services() {
  const [h, setH] = useState<{ i: number; x: number; y: number } | null>(null);
  return <><PageHead eyebrow="The menu" title="Services & Pricing" />
    <section className="bg-[#fbf3dc] px-6 py-24 md:px-14" onMouseLeave={() => setH(null)}><div className="mx-auto max-w-3xl">
      {MENU.map((m, i) => <Reveal key={m.t} delay={i * 70}><div data-hover onMouseMove={e => setH({ i, x: e.clientX, y: e.clientY })} className="group flex items-baseline gap-4 border-b border-[#141414]/15 py-6 text-[#141414] transition-[padding] duration-300 hover:pl-4">
        <h3 className="font-serif text-2xl font-bold transition-colors group-hover:text-[#a8814c]">{m.t}</h3><span className="text-xs text-[#5b5546]">{m.d}</span><span className="mx-2 flex-1 -translate-y-1 border-b border-dotted border-[#141414]/30" /><span className="font-serif text-2xl">${m.p}</span></div></Reveal>)}</div>
      <div className="pointer-events-none fixed z-40 hidden h-72 w-56 shadow-2xl md:block" style={{ left: h?.x ?? 0, top: h?.y ?? 0, opacity: h ? 1 : 0, transform: `translate(48px,-50%) scale(${h ? 1 : 0.85}) rotate(${h ? 3 : 0}deg)`, transition: "opacity .3s, transform .3s" }}>
        <Photo src={MENU[h?.i ?? 0].img} label="Preview" className="h-full w-full" /></div></section></>;
}
function Gallery() {
  const [sel, setSel] = useState<number | null>(null);
  return <><PageHead eyebrow="Our work" title="The Gallery" />
    <section className="bg-[#fbf3dc] px-6 py-24 md:px-14"><div className="mx-auto grid max-w-6xl auto-rows-[260px] gap-4 md:grid-cols-3">{GALLERY.map((g, i) => <Reveal key={i} delay={(i % 3) * 120} className={i % 4 === 0 ? "md:row-span-2" : ""}>
      <button onClick={() => setSel(i)} className="group relative block h-full w-full overflow-hidden"><Photo src={g} label={`Gallery ${i + 1}`} className="h-full w-full transition-transform duration-[900ms] group-hover:scale-110" />
        <span className="absolute inset-0 flex items-end bg-gradient-to-t from-[#141414]/80 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"><span className="font-serif text-lg text-[#f6edd3]">Fade District · {String(i + 1).padStart(2, "0")}</span></span></button></Reveal>)}</div></section>
    <div onClick={() => setSel(null)} className={`fixed inset-0 z-[120] flex items-center justify-center bg-[#141414]/95 p-6 transition-opacity duration-500 ${sel !== null ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {sel !== null && <Photo src={GALLERY[sel]} label="Preview" className="h-[80vh] w-full max-w-4xl animate-[pageIn_.6s_both]" />}<span className="absolute right-8 top-8 text-3xl text-[#f6edd3]">✕</span></div></>;
}
const Barbers = () => <><PageHead eyebrow="The crew" title="Meet Your Barbers" />
  <section className="bg-[#fbf3dc] px-6 py-24 md:px-14"><div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">{BARBERS.map((b, i) => <Reveal key={b.name} delay={i * 150} className="group pb-4">
    <div className="overflow-hidden bg-[#fdf6dd] text-center shadow-[0_18px_40px_-18px_rgba(60,40,10,.35)] transition-transform duration-500 group-hover:-translate-y-3"><div className="aspect-[3/4] overflow-hidden"><Photo src={b.img} label={b.name} className="h-full w-full transition-transform duration-[900ms] group-hover:scale-110" /></div>
      <div className="p-6 text-[#141414]"><h3 className="font-serif text-2xl font-bold">{b.name}</h3><p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a8814c]">{b.role}</p><p className="mt-3 text-xs text-[#5b5546]">{b.years} years behind the chair</p></div></div></Reveal>)}</div></section></>;

/* ---- Booking: кастомные select / календарь / слоты ---- */
const FIELD = "w-full border-b border-[#141414]/30 bg-transparent py-3 text-[#141414] outline-none transition-colors placeholder:text-[#8a8370] focus:border-[#c69c5d]";
function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [o, setO] = useState(false);
  return <div className="relative">{o && <div className="fixed inset-0 z-10" onClick={() => setO(false)} />}
    <button type="button" onClick={() => setO(!o)} className={`${FIELD} flex items-center justify-between text-left ${value ? "" : "text-[#8a8370]"}`}>{value || "Choose a service"}<span className={`text-xs transition-transform duration-300 ${o ? "rotate-180" : ""}`}>▼</span></button>
    <ul className={`absolute inset-x-0 top-full z-20 mt-2 origin-top border border-[#c69c5d]/40 bg-[#141414] shadow-2xl transition-all duration-300 ${o ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-90 opacity-0"}`}>
      {MENU.map(m => <li key={m.t}><button type="button" onClick={() => { onChange(m.t); setO(false); }} className="flex w-full justify-between px-5 py-3 text-left font-serif text-[#f6edd3] transition-colors hover:bg-[#c69c5d] hover:text-[#141414]"><span>{m.t}</span><span>${m.p}</span></button></li>)}</ul></div>;
}
function Calendar({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [m, setM] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const lead = (m.getDay() + 6) % 7, n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const cells = [...Array<null>(lead).fill(null), ...Array.from({ length: n }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1))];
  const atStart = m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth();
  const nav = "flex h-9 w-9 items-center justify-center rounded-full text-[#141414] transition-colors hover:bg-[#c69c5d] disabled:opacity-20 disabled:hover:bg-transparent";
  return <div className="bg-[#141414] p-6 text-[#f6edd3] shadow-[0_24px_50px_-20px_rgba(60,40,10,.6)]">
    <div className="mb-5 flex items-center justify-between"><button type="button" disabled={atStart} onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))} className={nav.replace("text-[#141414]", "text-[#f6edd3] hover:text-[#141414]")}>‹</button>
      <p className="font-serif text-xl">{m.toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
      <button type="button" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))} className={nav.replace("text-[#141414]", "text-[#f6edd3] hover:text-[#141414]")}>›</button></div>
    <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-[#c69c5d]">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <span key={d} className="py-2">{d}</span>)}
      {cells.map((d, i) => { if (!d) return <span key={i} />; const off = d < today || d.getDay() === 0; const sel = value?.toDateString() === d.toDateString();
        return <button key={i} type="button" disabled={off} onClick={() => onChange(d)} className={`aspect-square rounded-full text-sm transition-all duration-300 ${sel ? "bg-[#c69c5d] font-bold text-[#141414]" : off ? "text-[#f6edd3]/20" : "text-[#f6edd3] hover:bg-[#c69c5d]/25"}`}>{d.getDate()}</button>; })}</div></div>;
}
function Booking() {
  const [f, setF] = useState({ name: "", email: "", service: "" }); const [date, setDate] = useState<Date | null>(null); const [time, setTime] = useState(""); const [sent, setSent] = useState(false);
  const ok = f.name && /\S+@\S+/.test(f.email) && f.service && date && time;
  const fmt = date?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return <><PageHead eyebrow="Reserve your chair" title="Book Appointment" />
    <section className="bg-[#fbf3dc] px-6 py-24 md:px-14"><div className="mx-auto max-w-5xl">
      {sent ? <Reveal className="py-10 text-center text-[#141414]"><p className="font-serif text-5xl font-bold">See you soon, {f.name.split(" ")[0]}.</p>
        <p className="mt-6 font-serif text-xl text-[#a8814c]">{f.service} · {fmt} · {time}</p><p className="mt-3 text-sm text-[#5b5546]">A confirmation is on its way to {f.email}.</p>
        <div className="mt-10"><Magnetic v="dark" onClick={() => { setSent(false); setDate(null); setTime(""); setF({ name: "", email: "", service: "" }); }}>Book another</Magnetic></div></Reveal> :
        <div className="grid gap-14 md:grid-cols-2">
          <Reveal from="left" className="grid content-start gap-9"><input className={FIELD} placeholder="Full name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
            <input className={FIELD} type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><Select value={f.service} onChange={service => setF({ ...f, service })} />
            <div className="hidden pt-4 md:block"><Magnetic disabled={!ok} onClick={() => setSent(true)}>Confirm Booking</Magnetic></div></Reveal>
          <Reveal from="right"><Calendar value={date} onChange={d => { setDate(d); setTime(""); }} />
            <div className={`mt-5 grid grid-cols-3 gap-2 transition-all duration-500 ${date ? "opacity-100" : "pointer-events-none opacity-30"}`}>{SLOTS.map((s, i) => { const taken = date ? (date.getDate() + i) % 4 === 0 : false;
              return <button key={s} type="button" disabled={taken} onClick={() => setTime(s)} className={`border py-2.5 text-sm transition-all duration-300 ${time === s ? "border-[#c69c5d] bg-[#c69c5d] font-bold text-[#141414]" : taken ? "border-[#141414]/10 text-[#141414]/25 line-through" : "border-[#141414]/25 text-[#141414] hover:border-[#c69c5d] hover:text-[#a8814c]"}`}>{s}</button>; })}</div>
            <div className="mt-8 md:hidden"><Magnetic disabled={!ok} onClick={() => setSent(true)}>Confirm Booking</Magnetic></div></Reveal></div>}</div></section></>;
}
const Contacts = () => <><PageHead eyebrow="Find us" title="Visit The Shop" />
  <section className="bg-[#fbf3dc] px-6 py-24 text-[#141414] md:px-14"><div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
    <Reveal from="left"><Photo src={IMG.shop} label="Shop" className="aspect-[4/5] w-full" /></Reveal>
    <Reveal from="right" className="flex flex-col justify-center gap-8">{[["Address", "221 Mercer Street, Downtown"], ["Phone", "+1 (555) 014-2290"], ["Email", "hello@fadedistrict.org"], ["Hours", "Mon–Fri 9–20 · Sat 10–18 · Sun closed"]].map(([k, v]) => <div key={k}><p className="text-xs uppercase tracking-[0.3em] text-[#a8814c]">{k}</p><p className="mt-2 font-serif text-2xl">{v}</p></div>)}</Reveal></div></section></>;

/* ============ APP ============ */
export default function App() {
  const [route, go] = useRoute(); const y = useScrollY(); const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1900); return () => clearTimeout(t); }, []);
  const page = { home: <Home y={y} go={go} ready={ready} />, services: <Services />, gallery: <Gallery />, barbers: <Barbers />, booking: <Booking />, contacts: <Contacts /> }[route];
  return <div className="min-h-screen bg-[#141414] font-sans antialiased">
    <style>{`@keyframes pageIn{from{opacity:0;transform:translateY(18px)}}@keyframes lineUp{from{transform:translateY(110%)}}@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}html{scroll-behavior:smooth}::selection{background:#c69c5d;color:#141414}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#141414}::-webkit-scrollbar-thumb{background:#c69c5d55}`}</style>
    <Loader done={ready} /><Cursor />
    <div className="fixed left-0 top-0 z-[60] h-0.5 bg-[#c69c5d]" style={{ width: `${(y / Math.max(document.body.scrollHeight - innerHeight, 1)) * 100}%` }} />
    <Nav route={route} go={go} y={y} />
    <main key={route} className="animate-[pageIn_.7s_both]">{page}</main>
    <Footer go={go} />
  </div>;
}