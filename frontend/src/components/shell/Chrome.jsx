import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, Copy, Download, Send } from "lucide-react";
import { Logo, MaskLines, Note, FadeUp } from "./Primitives";
import { A } from "@/data/assets";
import { PRODUCTS, ORDER } from "@/data/products";
import { CONTACT_CONFIG, getResumeDownloadMeta } from "@/data/siteConfig";
import { trackEvent } from "@/lib/analytics";

gsap.registerPlugin(ScrollTrigger);

export const scrollToY = (y) =>
  window.__lenis
    ? window.__lenis.scrollTo(y, { duration: 1.3 })
    : window.scrollTo({ top: y, behavior: "smooth" });

export const SmoothScroll = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const l = new Lenis({ lerp: 0.095 });
    window.__lenis = l;
    l.on("scroll", ScrollTrigger.update);
    let id;
    const raf = (t) => {
      l.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      l.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    const go = () => {
      const el = hash ? document.querySelector(hash) : null;
      const y = el ? el.getBoundingClientRect().top + window.scrollY : 0;
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      ScrollTrigger.refresh();
    };
    const t = setTimeout(go, hash ? 260 : 30);
    return () => clearTimeout(t);
  }, [pathname, hash]);

  return null;
};

const accentFor = (path) => Object.values(PRODUCTS).find((p) => p.route === path)?.theme.acc || "#D8C08A";

export const DoorTransition = () => {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const firstRender = useRef(true);
  const [animKey, setAnimKey] = useState(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setAnimKey(pathname);
  }, [pathname]);

  if (reduced || !animKey) return null;
  const c = accentFor(pathname);
  return (
    <div key={animKey} className="pointer-events-none fixed inset-0 z-[90] flex" aria-hidden="true">
      {[-1, 1].map((d) => (
        <motion.div
          key={d}
          className="h-full w-1/2"
          style={{
            background: "#050506",
            [d < 0 ? "borderRight" : "borderLeft"]: `1px solid ${c}`,
            boxShadow: `0 0 90px ${c}44`,
          }}
          initial={{ x: 0 }}
          animate={{ x: `${d * 102}%` }}
          transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1], delay: 0.06 }}
        />
      ))}
    </div>
  );
};

const LINKS = [
  { to: "/", label: "Home", tag: "01 · Hero" },
  { to: "/#about", label: "About", tag: "02 · About Me" },
  { to: "/#journey", label: "Journey", tag: "03 · Experience" },
  { to: "/#projects", label: "Work", tag: "04 · Product Apps" },
  ...ORDER.map((k) => ({ to: PRODUCTS[k].route, label: PRODUCTS[k].name, tag: PRODUCTS[k].domain })),
  { to: "/#contact", label: "Contact", tag: "05 · Terminus" },
];

const HEADER_LINKS = [
  { to: "/#about", label: "About", id: "about" },
  { to: "/#journey", label: "Journey", id: "journey" },
  { to: "/#projects", label: "Work", id: "projects" },
  { to: "/#contact", label: "Contact", id: "contact" },
];

export const Nav = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const resumeMeta = getResumeDownloadMeta();

  useEffect(() => setOpen(false), [pathname, hash]);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.__lenis?.stop?.();
    } else {
      document.body.style.overflow = "";
      window.__lenis?.start?.();
    }
    return () => {
      document.body.style.overflow = "";
      window.__lenis?.start?.();
    };
  }, [open]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return undefined;
    }
    const ids = ["hero", "about", "journey", "projects", "contact"];
    const observers = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveSection(id);
          });
        },
        { rootMargin: "-35% 0px -45% 0px", threshold: 0.01 },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
  }, [pathname]);

  const handleLinkClick = (e, to) => {
    setOpen(false);
    document.body.style.overflow = "";
    window.__lenis?.start?.();
    if (to.startsWith("/#")) {
      const targetId = to.slice(2);
      e.preventDefault();
      if (pathname === "/") {
        const el = document.getElementById(targetId);
        if (el) {
          requestAnimationFrame(() => {
            scrollToY(el.getBoundingClientRect().top + window.scrollY);
          });
        }
      } else {
        navigate(to);
      }
    } else if (to === "/" && pathname === "/") {
      e.preventDefault();
      requestAnimationFrame(() => scrollToY(0));
    }
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center justify-between px-5 backdrop-blur-md md:px-10"
        style={{
          background: "rgba(7,8,9,.68)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          color: "#EDE9E0",
        }}
        data-testid="site-header"
      >
        <Link
          to="/"
          onClick={(e) => handleLinkClick(e, "/")}
          className="flex items-center gap-3"
          data-testid="nav-logo-link"
          style={{ "--ink": "#EDE9E0", "--acc": accentFor(pathname) }}
        >
          <Logo />
          <span className="f-mono hidden text-[10px] tracking-[0.2em] sm:block">Bhanuprasad L</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {HEADER_LINKS.map((l) => {
            const active = pathname === "/" && (activeSection === l.id || hash === `#${l.id}`);
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={(e) => handleLinkClick(e, l.to)}
                data-testid={`nav-${l.label.toLowerCase()}-link`}
                className={`f-mono link-line pb-0.5 !text-[10px] tracking-[0.2em] transition-opacity duration-300 hover:opacity-100 ${
                  active ? "opacity-100 text-[var(--acc)]" : "opacity-65"
                }`}
                style={{ "--acc": accentFor(pathname) }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#EDE9E0] transition-colors hover:border-white/30 active:scale-95"
          data-testid="nav-menu-toggle"
          aria-expanded={open}
          aria-controls="site-index-overlay"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300 ${
                open ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6.5px] h-px w-5 bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-300 ${
                open ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-index-overlay"
            data-testid="nav-menu-overlay"
            data-lenis-prevent
            className="fixed inset-0 z-[55] flex flex-col justify-between overflow-y-auto px-5 pb-10 pt-24 md:px-10"
            style={{ background: "#050506", color: "#EDE9E0" }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: reduced ? 0.12 : 0.36, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {LINKS.map((l, i) => (
                <li key={l.to} className="border-b border-white/10">
                  <Link
                    to={l.to}
                    onClick={(e) => handleLinkClick(e, l.to)}
                    data-testid={`menu-${l.label.toLowerCase()}-link`}
                    className="group flex items-baseline justify-between gap-6 py-3 md:py-3.5"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="f-mono opacity-50">0{i + 1}</span>
                      <motion.span
                        className="f-display block text-4xl transition-transform duration-500 group-hover:translate-x-4 sm:text-6xl md:text-7xl"
                        initial={reduced ? false : { y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: reduced ? 0 : 0.15 + i * 0.04, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {l.label}
                      </motion.span>
                    </span>
                    <span className="f-mono opacity-60 text-right">{l.tag}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <span className="f-mono c-mut">Bhanuprasad L · Product Engineer</span>
              <a
                href={resumeMeta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#D8C08A]/50 bg-[#D8C08A]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D8C08A] transition-colors hover:bg-[#D8C08A] hover:text-[#070809]"
                data-testid="menu-view-resume"
              >
                <span>View Resume</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const TOPICS = ["General Inquiry", "StayEase", "StockPilot", "Splitfin"];

export const Closing = () => {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("General Inquiry");
  const [sender, setSender] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [errorField, setErrorField] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const formattedDraft = `Subject: ${topic}\nName: ${sender.trim()}\nEmail: ${replyTo.trim()}\n\n${message.trim()}`;

  const handleLinkClick = (e, to) => {
    if (to.startsWith("/#")) {
      const targetId = to.slice(2);
      e.preventDefault();
      if (pathname === "/") {
        const el = document.getElementById(targetId);
        if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY);
      } else {
        navigate(to);
      }
    } else if (to === "/" && pathname === "/") {
      e.preventDefault();
      scrollToY(0);
    }
  };

  const hasDirectFormTool = Boolean(
    (CONTACT_CONFIG.formEndpoint || "").trim() || (CONTACT_CONFIG.web3formsAccessKey || "").trim(),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorField("");
    if (!sender.trim()) {
      setErrorField("sender");
      setStatus("Please enter your name before preparing your inquiry.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo.trim())) {
      setErrorField("replyTo");
      setStatus("Please enter a valid email address so replies reach you.");
      return;
    }
    if (message.trim().length < 8) {
      setErrorField("message");
      setStatus("Please add a brief note (at least a few words).");
      return;
    }

    const endpoint = (CONTACT_CONFIG.formEndpoint || "").trim();
    const web3Key = (CONTACT_CONFIG.web3formsAccessKey || "").trim();

    if (endpoint || web3Key) {
      setSending(true);
      setStatus("Sending your message...");
      try {
        const targetUrl = endpoint || "https://api.web3forms.com/submit";
        const payload = endpoint
          ? {
              name: sender.trim(),
              email: replyTo.trim(),
              subject: `[Portfolio · ${topic}] From ${sender.trim()}`,
              topic,
              message: message.trim(),
            }
          : {
              access_key: web3Key,
              subject: `[Portfolio · ${topic}] From ${sender.trim()}`,
              from_name: sender.trim(),
              replyto: replyTo.trim(),
              message: `${message.trim()}\n\nTopic: ${topic}\nReply-To: ${replyTo.trim()}`,
            };

        const res = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        trackEvent("contact_submit", { method: "api", topic });
        setSender("");
        setReplyTo("");
        setMessage("");
        setStatus("Message delivered — thank you! I'll reply soon.");
        return;
      } catch {
        setStatus("Direct delivery failed — use Email or Copy Draft below.");
        return;
      } finally {
        setSending(false);
      }
    }

    if (CONTACT_CONFIG.email) {
      trackEvent("contact_submit", { method: "mailto", topic });
      const mailto = `mailto:${encodeURIComponent(CONTACT_CONFIG.email)}?subject=${encodeURIComponent(`[Portfolio · ${topic}] From ${sender.trim()}`)}&body=${encodeURIComponent(formattedDraft)}`;
      window.location.href = mailto;
      setStatus("Opening your email client with the prepared message draft.");
      return;
    }

    setStatus("Draft validated — copy your formatted note below or configure CONTACT_CONFIG.email in siteConfig.js.");
  };

  const handleCopy = async () => {
    if (!message.trim()) {
      setErrorField("message");
      setStatus("Write a brief note first before copying.");
      return;
    }
    try {
      await navigator.clipboard.writeText(formattedDraft);
      setCopied(true);
      setStatus("Prepared draft copied to clipboard.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setStatus("Clipboard access unavailable — select and copy the message directly.");
    }
  };

  const channels = [
    {
      label: "Email",
      href: CONTACT_CONFIG.email ? `mailto:${CONTACT_CONFIG.email}` : null,
      text: CONTACT_CONFIG.email || "Configurable in siteConfig",
    },
    {
      label: "LinkedIn",
      href: CONTACT_CONFIG.linkedinUrl || null,
      text: CONTACT_CONFIG.linkedinUrl ? "Open profile" : "Configurable in siteConfig",
    },
    {
      label: "GitHub",
      href: CONTACT_CONFIG.githubUrl || null,
      text: CONTACT_CONFIG.githubUrl ? "Open repositories" : "Configurable in siteConfig",
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      data-testid="closing-section"
      className="relative overflow-hidden border-t border-white/10 px-5 pb-20 pt-24 md:px-12 md:pb-24 md:pt-32 lg:px-16"
      style={{
        background: "linear-gradient(180deg, rgba(5,6,8,0.28) 0%, rgba(5,6,8,0.86) 100%)",
        color: "#EDE9E0",
        "--ink": "#EDE9E0",
        "--mut": "#8b8f98",
        "--acc": "#D8C08A",
        "--line": "rgba(255,255,255,.12)",
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={A("home_terminus")}
          alt=""
          className="h-full w-full object-cover opacity-[0.14]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(5,6,8,0.38) 0%, rgba(5,6,8,0.94) 78%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <Note accent>05 // Obsidian Terminus</Note>
        <MaskLines
          lines={["Let's build", "something", "worth using."]}
          className="f-display mt-4 text-[clamp(2.3rem,7.8vw,5.8rem)] leading-[0.92]"
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <FadeUp className="space-y-8 lg:col-span-5">
            <p className="f-serif text-xl leading-snug text-[#EDE9E0]/90 md:text-2xl">
              Have a product problem that needs end-to-end engineering, or want to collaborate on a build? Leave a note here.
            </p>

            <div className="border-t b-line pt-6">
              <span className="f-mono c-acc mb-4 block">Direct Links</span>
              <ul>
                {channels.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between border-b b-line py-3.5"
                    data-testid={`contact-${item.label.toLowerCase()}-status`}
                  >
                    <span className="f-serif text-xl">{item.label}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.label === "Email" ? undefined : "_blank"}
                        rel={item.label === "Email" ? undefined : "noopener noreferrer"}
                        className="f-mono c-acc inline-flex items-center gap-1.5 hover:underline"
                      >
                        <span>{item.text}</span>
                        <ArrowUpRight size={13} />
                      </a>
                    ) : (
                      <span className="f-mono c-mut">{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <FadeUp delay={0.12} className="lg:col-span-6 lg:col-start-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="border border-white/15 bg-[#080a0e]/82 p-6 backdrop-blur-xl md:p-8"
              data-testid="contact-composer-form"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b b-line pb-4">
                <span className="f-mono c-acc">Inquiry Terminus</span>
                <span className="f-mono c-mut">Client-Side Draft Composer</span>
              </div>

              <div className="mt-5">
                <span className="f-mono c-mut mb-2.5 block">Subject</span>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      data-testid={`contact-topic-${t.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`f-mono rounded-full border px-3.5 py-1.5 transition-all active:scale-95 ${
                        topic === t
                          ? "border-[var(--acc)] bg-[var(--acc)] text-[#070809]"
                          : "border-white/15 text-white/75 hover:border-white/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="f-mono c-mut mb-1.5 block">Name</span>
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    aria-invalid={errorField === "sender"}
                    placeholder="Alex Rivera"
                    data-testid="contact-name-input"
                    className={`w-full border bg-black/50 px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-white/25 focus-visible:border-[var(--acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--acc)] ${
                      errorField === "sender" ? "border-amber-400" : "border-white/15"
                    }`}
                  />
                </label>
                <label className="block">
                  <span className="f-mono c-mut mb-1.5 block">Email</span>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    aria-invalid={errorField === "replyTo"}
                    placeholder="name@domain.com"
                    data-testid="contact-reply-input"
                    className={`w-full border bg-black/50 px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-white/25 focus-visible:border-[var(--acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--acc)] ${
                      errorField === "replyTo" ? "border-amber-400" : "border-white/15"
                    }`}
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="f-mono c-mut mb-1.5 block">Message</span>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-invalid={errorField === "message"}
                  placeholder="Share what caught your eye or the problem you are exploring..."
                  data-testid="contact-message-input"
                  className={`w-full resize-y border bg-black/50 px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-white/25 focus-visible:border-[var(--acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--acc)] ${
                    errorField === "message" ? "border-amber-400" : "border-white/15"
                  }`}
                />
              </label>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="contact-prepare-btn"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--acc)] bg-[var(--acc)] px-5 py-2 text-sm font-medium text-[#070809] transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                >
                  <Send size={14} />
                  <span>
                    {sending
                      ? "Sending..."
                      : hasDirectFormTool
                        ? "Send Message"
                        : CONTACT_CONFIG.email
                          ? "Compose Email"
                          : "Prepare Draft"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  data-testid="contact-copy-btn"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-[var(--ink)] transition-all hover:border-[var(--acc)] active:scale-95"
                >
                  {copied ? <Check size={14} className="text-[var(--acc)]" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy Draft"}</span>
                </button>
              </div>

              {status && (
                <p
                  className="f-mono c-acc mt-4"
                  role={errorField ? "alert" : "status"}
                  data-testid="contact-status-msg"
                >
                  {status}
                </p>
              )}
            </form>
          </FadeUp>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t b-line pt-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={(e) => handleLinkClick(e, l.to)}
                className="f-mono link-line pb-1"
                data-testid={`footer-${l.label.toLowerCase()}-link`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="f-mono c-mut max-w-md md:text-right">
            Bhanuprasad L, 2026 · Interactive mobile product showcases use illustrative sample data.
          </p>
        </div>
      </div>
    </section>
  );
};
