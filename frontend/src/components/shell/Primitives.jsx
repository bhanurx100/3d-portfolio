import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { A, ratio } from "@/data/assets";

export const STUDIO_EASE = [0.16, 1, 0.3, 1];

/** Doorway-shaped 'B' monogram icon matching the architectural corridor identity. */
export const Logo = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <path
      d="M14 54V26C14 15.5066 22.0589 7 32 7C41.9411 7 50 15.5066 50 26V54"
      stroke="var(--acc, #D8C08A)"
      strokeWidth="2.5"
    />
    <path
      d="M23 47V20H34.5C38.6421 20 42 23.134 42 27C42 29.7547 40.2923 32.1387 37.8135 33.2747C40.8407 34.3075 43 37.0493 43 40.25C43 44.2541 39.6421 47 35.5 47H23Z"
      stroke="var(--ink, #EDE9E0)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <line x1="23" y1="33.5" x2="36" y2="33.5" stroke="var(--acc, #D8C08A)" strokeWidth="2.5" />
  </svg>
);

/** Monospace eyebrow annotation for editorial sections. */
export const Note = ({ children, accent = false, className = "" }) => (
  <span className={`f-mono inline-block ${accent ? "c-acc" : "c-mut"} ${className}`}>
    {children}
  </span>
);

/** Subtle magnetic pointer attraction for key interactive controls. */
export const Magnetic = ({ children, strength = 0.18, className = "" }) => {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 20 });
  const y = useSpring(0, { stiffness: 220, damping: 20 });

  if (reduced) return <div className={`inline-block ${className}`}>{children}</div>;

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

/** Word-level staggered mask reveal per line with reduced-motion fallback. */
export const MaskLines = ({
  as: Tag = "div",
  lines = [],
  inView = true,
  delay = 0,
  className = "",
  style,
  ...rest
}) => {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <Tag className={className} style={style} {...rest}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  let runningWordIndex = 0;

  return (
    <Tag className={className} style={style} {...rest}>
      {lines.map((line, lineIdx) => {
        const words = String(line).split(" ").filter(Boolean);
        return (
          <span key={lineIdx} className="block">
            {words.map((word, wordIdx) => {
              const idx = runningWordIndex++;
              const isLast = wordIdx === words.length - 1;
              return (
                <span
                  key={`${lineIdx}-${wordIdx}`}
                  className={`inline-block overflow-hidden align-bottom pb-[0.06em] ${
                    isLast ? "" : "mr-[0.24em]"
                  }`}
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%", opacity: 0.001 }}
                    {...(inView
                      ? {
                          whileInView: { y: "0%", opacity: 1 },
                          viewport: { once: true, amount: "some" },
                        }
                      : {
                          animate: { y: "0%", opacity: 1 },
                        })}
                    transition={{
                      duration: 0.56,
                      delay: delay + idx * 0.032,
                      ease: STUDIO_EASE,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
};

/** Gentle fade-and-rise reveal with reduced-motion fallback. */
export const FadeUp = ({ children, delay = 0, className = "", style }) => {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.75, delay, ease: STUDIO_EASE }}
    >
      {children}
    </motion.div>
  );
};

/** Editorial pill link with directional arrow micro-interaction and subtle magnetic pull. */
export const ArrowLink = ({ to, href, onClick, children, testid, className = "" }) => {
  const inner = (
    <span className="group inline-flex items-center gap-3 rounded-full border border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_10%,transparent)] px-5 py-2.5 text-sm font-medium tracking-wide text-[var(--ink)] transition-all duration-300 hover:bg-[var(--acc)] hover:text-[#070809]">
      <span>{children}</span>
      <ArrowUpRight
        size={16}
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </span>
  );

  if (onClick) {
    return (
      <Magnetic>
        <button type="button" onClick={onClick} data-testid={testid} className={`inline-block ${className}`}>
          {inner}
        </button>
      </Magnetic>
    );
  }
  if (href) {
    return (
      <Magnetic>
        <a href={href} target="_blank" rel="noopener noreferrer" data-testid={testid} className={`inline-block ${className}`}>
          {inner}
        </a>
      </Magnetic>
    );
  }
  return (
    <Magnetic>
      <Link to={to} data-testid={testid} className={`inline-block ${className}`}>
        {inner}
      </Link>
    </Magnetic>
  );
};

const PLATE_VARIANTS = {
  curtain: {
    initial: { clipPath: "inset(0% 0% 18% 0%)", y: 18, scale: 1.035, opacity: 0.01 },
    animate: { clipPath: "inset(0% 0% 0% 0%)", y: 0, scale: 1, opacity: 1 },
    transition: { duration: 0.82, ease: STUDIO_EASE },
  },
  precision: {
    initial: { clipPath: "inset(0% 16% 0% 0%)", x: -12, scale: 1.02, opacity: 0.01 },
    animate: { clipPath: "inset(0% 0% 0% 0%)", x: 0, scale: 1, opacity: 1 },
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
  fluid: {
    initial: { clipPath: "inset(8% 4% 8% 4%)", y: 14, scale: 1.03, opacity: 0.65 },
    animate: { clipPath: "inset(0% 0% 0% 0%)", y: 0, scale: 1, opacity: 1 },
    transition: { duration: 0.88, ease: [0.25, 0.9, 0.3, 1] },
  },
};

/**
 * Clean photographic plate using strictly human-readable editorial labels
 * and product-tailored masked reveal choreography.
 * Never displays raw filenames, paths, or internal manifest keys.
 */
export const Plate = ({
  id,
  alt,
  caption,
  label = "Editorial Study",
  spec,
  className = "",
  priority = false,
  variant = "curtain",
}) => {
  const ar = ratio(id);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  const preset = PLATE_VARIANTS[variant] || PLATE_VARIANTS.curtain;

  return (
    <figure className={`group ${className}`}>
      {(label || spec) && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="f-mono c-acc">{label}</span>
          {spec && <span className="f-mono c-mut hidden sm:inline">{spec}</span>}
        </div>
      )}
      <div className="relative overflow-hidden border b-line bg-surface" style={{ aspectRatio: ar }}>
        {reduced ? (
          <img
            src={A(id)}
            alt={alt || caption || label}
            loading="eager"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
              loaded ? "opacity-100" : "opacity-95"
            }`}
          />
        ) : (
          <motion.div
            className="h-full w-full will-change-[clip-path,transform,opacity]"
            initial={preset.initial}
            whileInView={preset.animate}
            viewport={{ once: true, amount: "some" }}
            transition={preset.transition}
          >
            <img
              src={A(id)}
              alt={alt || caption || label}
              loading={priority ? "eager" : "eager"}
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.035] ${
                loaded ? "opacity-100" : "opacity-95"
              }`}
            />
          </motion.div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-20" />
      </div>
      {caption && (
        <figcaption className="mt-3 border-b b-line pb-3">
          <span className="f-serif block text-base text-[var(--ink)]/90">{caption}</span>
        </figcaption>
      )}
    </figure>
  );
};

/** Low-contrast editorial marquee ribbon with dot dividers. */
export const Marquee = ({ items = [], className = "" }) => {
  const strip = items.map((item, idx) => (
    <span key={idx} className="inline-flex items-center gap-6 px-4">
      <span className="f-serif text-xl italic text-[var(--ink)]/50 md:text-2xl">{item}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--acc)]/70" aria-hidden="true" />
    </span>
  ));
  return (
    <div className={`overflow-hidden border-y b-line py-4 select-none ${className}`} aria-hidden="true">
      <div className="marquee-track">
        <div className="flex shrink-0 items-center">{strip}</div>
        <div className="flex shrink-0 items-center">{strip}</div>
      </div>
    </div>
  );
};
