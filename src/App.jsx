import { useEffect, useRef, useState, Children, cloneElement, isValidElement } from "react";
import "./App.css";
import photo from "/photo.jpg";
import music from "/bg.mp4";

/* ------------------------------------------------------------------ */
/*  YOUR ASSETS — fill these in                                        */
/* ------------------------------------------------------------------ */

// Your photo. Example:
//   import portrait from "./assets/portrait.jpg";
//   const PHOTO_SRC = portrait;
const PHOTO_SRC = photo;

// Your background music. Put the file in /public and use its path, e.g. "/music.mp3",
// or import it like the photo above.
const MUSIC_SRC = music;

/* Add each project's live website below to link its card directly. */
const PROJECTS = [
  { id: "fs", art: "meadow", init: "Fs", title: "FranchiSync", role: "Capstone Project Manager & Frontend Developer", desc: "B2B web and mobile app for iFranchise, built with ReactJS and React Native.", url: "" },
  { id: "pt", art: "cream", init: "Pt", title: "AMSA Point Tracker", role: "Frontend Developer", desc: "Point tracker for the UPHSD Medicine organization using ReactJS and Google Apps Script.", url: "" },
  { id: "wg", art: "sky", init: "Wg", title: "Digital Wedding Photo Album", role: "Freelance Web Developer", desc: "A wedding gallery that guests open by scanning an NFC tag.", url: "" },
  { id: "wi", art: "sky", init: "Wi", title: "Digital Wedding Invitation", role: "Freelance Web Developer", desc: "A personalized online invitation with the event details.", url: "" },
  { id: "pb", art: "cream", init: "Pb", title: "Digital Photobooth", role: "Freelance Web Developer", desc: "A photobooth website built with JavaScript and CSS.", url: "" },
];

const EXPERT = [
  ["Effective project planning and implementation", "Clear tasks and steady progress."],
  ["Creative design and innovative solutions", "Ideas that fit the user."],
  ["Analysis and creative solutions to challenges", "Finding the root of a problem."],
  ["Accessibility and responsive design", "Works on every screen."],
  ["Efficient project management", "Leading a team to deadlines."],
  ["Excellent communication and presentation skills", "Explaining my work clearly."],
];

const SKILLS = [
  ["Frontend development", ["ReactJS", "JavaScript", "CSS", "Standard designs"]],
  ["UI/UX design", ["Canva", "Figma", "Wireframing"]],
  ["Backend knowledge", ["Node.js", "REST API", "Google Apps Script"]],
  ["Software QA", ["Requirements validation", "Organized bug reporting", "Functional testing"]],
];

/* Words that orbit the hero skills ball */
const BALL = [
  "ReactJS", "React Native", "JavaScript", "CSS", "Figma", "Canva", "Wireframing",
  "Node.js", "REST API", "Google Apps Script", "Functional Testing", "Bug Reporting", "Requirements Validation",
];

const EXPERIENCE = [
  {
    title: "Capstone Project Manager, Frontend Developer, UI/UX Designer",
    meta: "February 2026 – September 2026",
    points: [
      "Developed FranchiSync, a business-to-business web and mobile app for iFranchise, using ReactJS and React Native.",
      "Designed user interfaces and built frontend features.",
      "Coordinated project tasks and tracked the team’s progress.",
    ],
  },
  {
    title: "Student Small Business Owner",
    meta: "Aroma Kandilaria Studios · Nov 2025 – June 2026",
    points: [
      "Founded a handcrafted scented candle brand and oversaw product planning and candle-making.",
      "Ran marketing strategies to grow brand visibility.",
      "Joined at least two pop-up markets per month for eight months.",
    ],
  },
  {
    title: "Student Freelance Web Developer",
    meta: "November 2024 – Present",
    points: [
      "Built a digital wedding invitation and a wedding photo album with an NFC tag.",
      "Built a point tracker for the UPHSD Medicine organization.",
      "Built a digital photobooth website with JavaScript and CSS.",
    ],
  },
  {
    title: "Publications Material Committee Member",
    meta: "Junior Philippine Computer Society · 2025 – 2026",
    points: ["Worked on event posters, DP Blast, and photo templates."],
  },
  {
    title: "President",
    meta: "Society of Young STEM Students · 2022 – 2023",
    points: [
      "Led the organization in planning student activities.",
      "Coordinated with school administrators on paperwork and with officers and members on projects.",
    ],
  },
];

const MARQUEE = ["ReactJS", "React Native", "JavaScript", "Figma", "Node.js", "REST API", "UI/UX Design", "Functional Testing", "Responsive Design"];
const ROLES = ["Frontend Developer Intern", "App Dev Intern", "Software QA Tester", "Startup Tech Intern"];

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Splits text into masked words for the slide-up reveal. Works with nested <em>. */
function Split({ children }) {
  let n = 0;
  const walk = (node) =>
    Children.map(node, (c) => {
      if (typeof c === "string") {
        return c.split(/(\s+)/).filter(Boolean).map((t, i) =>
          /^\s+$/.test(t) ? " " : (
            <span className="mk" key={i}>
              <i style={{ transitionDelay: n++ * 70 + "ms" }}>{t}</i>
            </span>
          )
        );
      }
      if (isValidElement(c)) return cloneElement(c, {}, walk(c.props.children));
      return c;
    });
  return <>{walk(children)}</>;
}

/* Fades/slides children in once they enter the viewport. */
function Reveal({ className = "", delay = 0, children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className} ${shown ? "in" : ""}`} style={delay ? { transitionDelay: delay + "ms" } : undefined}>
      {children}
    </div>
  );
}

/* Card that pops (scales up) on hover/focus/tap and reveals its detail line. */
function PopCard({ title, text }) {
  const [on, setOn] = useState(false);
  return (
    <button className={"pop" + (on ? " on" : "")} type="button" onClick={() => setOn((v) => !v)} onBlur={() => setOn(false)}>
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}

/* Rotating 3D ball of technical skills. Drag to spin it. */
function SkillBall() {
  const boxRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const box = boxRef.current;
    const els = itemRefs.current;
    const n = BALL.length;
    const calm = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    // spread points evenly over a sphere
    const pts = BALL.map((_, i) => {
      const k = (i + 0.5) / n;
      const phi = Math.acos(1 - 2 * k);
      const th = Math.PI * (1 + Math.sqrt(5)) * i;
      return [Math.cos(th) * Math.sin(phi), Math.sin(th) * Math.sin(phi), Math.cos(phi)];
    });

    let ax = -0.25, ay = 0, hover = false, drag = false, lx = 0, ly = 0, raf = 0;

    const draw = () => {
      const R = (box.clientWidth / 2) * 0.84;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      pts.forEach(([x, y, z], i) => {
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const k = (z2 + 1) / 2; // 0 = back, 1 = front
        const el = els[i];
        if (!el) return;
        el.style.transform = `translate(-50%,-50%) translate(${x1 * R}px,${y2 * R}px) scale(${0.68 + 0.5 * k})`;
        el.style.opacity = 0.28 + 0.72 * k;
        el.style.zIndex = Math.round(k * 100);
      });
    };

    const loop = () => {
      if (!drag) ay += hover ? 0.0012 : 0.0045;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const down = (e) => { drag = true; lx = e.clientX; ly = e.clientY; box.setPointerCapture?.(e.pointerId); };
    const move = (e) => {
      if (!drag) return;
      ay += (e.clientX - lx) * 0.008;
      ax = clamp(ax + (e.clientY - ly) * 0.008, -1, 1);
      lx = e.clientX; ly = e.clientY;
      if (calm) draw();
    };
    const up = () => { drag = false; };
    const enter = () => { hover = true; };
    const leave = () => { hover = false; drag = false; };

    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    box.addEventListener("pointerenter", enter);
    box.addEventListener("pointerleave", leave);
    window.addEventListener("resize", draw);

    if (calm) draw(); else loop();

    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
      box.removeEventListener("pointerenter", enter);
      box.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", draw);
    };
  }, []);

  return (
    <div className="ball" ref={boxRef} aria-hidden="true">
      <div className="orb"><span>Skills</span></div>
      {BALL.map((w, i) => (
        <span className="tag" key={w} ref={(el) => (itemRefs.current[i] = el)}>{w}</span>
      ))}
    </div>
  );
}

const SpeakerOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
const SpeakerOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
    <path d="m16 9 6 6M22 9l-6 6" />
  </svg>
);

export default function App() {
  const [loader, setLoader] = useState(true);
  const [typed, setTyped] = useState("");
  const [urls, setUrls] = useState(() =>
    Object.fromEntries(PROJECTS.map((p) => [p.id, p.url || store.get("url:" + p.id) || ""]))
  );
  const [pending, setPending] = useState(null);
  const [dlgUrl, setDlgUrl] = useState("");
  const [dlgNote, setDlgNote] = useState("Paste the address of this project. It opens in a new tab.");
  const [edge, setEdge] = useState({ start: true, end: false });
  const [dragging, setDragging] = useState(false);
  const [muted, setMuted] = useState(() => store.get("muted") === "1");
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(store.get("vol"));
    return Number.isNaN(v) ? 0.5 : v;
  });

  const barRef = useRef(null);
  const heroGridRef = useRef(null);
  const photoRef = useRef(null);
  const trackRef = useRef(null);
  const urlInputRef = useRef(null);
  const audioRef = useRef(null);
  const dragRef = useRef({ down: false, x: 0, sl: 0, moved: false });

  /* loader + ready state */
  useEffect(() => {
    const t1 = setTimeout(() => document.body.classList.add("ready"), 1500);
    const t2 = setTimeout(() => setLoader(false), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.classList.remove("ready");
    };
  }, []);

  /* typing roles */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      setTyped(ROLES[0]);
      return;
    }
    let w = 0, i = 0, del = false, timer;
    const tick = () => {
      const f = ROLES[w];
      i += del ? -1 : 1;
      setTyped(f.slice(0, i));
      let t = del ? 40 : 95;
      if (!del && i === f.length) { del = true; t = 1500; }
      else if (del && i === 0) { del = false; w = (w + 1) % ROLES.length; t = 300; }
      timer = setTimeout(tick, t);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  /* scroll effects: progress bar, hero fade, photo tilt */
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const bar = barRef.current, hg = heroGridRef.current, ph = photoRef.current;

    const frame = () => {
      const y = window.scrollY, vh = window.innerHeight, h = document.documentElement;
      bar.style.width = (y / (h.scrollHeight - vh || 1)) * 100 + "%";
      if (calm) return;
      const p = clamp(y / vh, 0, 1);
      hg.style.opacity = 1 - p * 1.1;
      hg.style.transform = `translateY(${-p * 70}px) scale(${1 - p * 0.05})`;
      const r = ph.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh * 0.8), 0, 1);
      ph.style.transform = `rotate(${-10 + 7.5 * t}deg) scale(${0.88 + 0.12 * t})`;
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; frame(); });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", frame);
    frame();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", frame);
    };
  }, []);

  /* projects scroller edges */
  const updateEdge = () => {
    const t = trackRef.current;
    if (!t) return;
    setEdge({ start: t.scrollLeft < 4, end: t.scrollLeft >= t.scrollWidth - t.clientWidth - 4 });
  };
  useEffect(() => {
    updateEdge();
    window.addEventListener("resize", updateEdge);
    return () => window.removeEventListener("resize", updateEdge);
  }, []);

  const slide = (dir) => {
    const t = trackRef.current;
    const card = t.querySelector(".proj");
    t.scrollBy({ left: dir * ((card ? card.offsetWidth : 340) + 18), behavior: "smooth" });
  };

  /* mouse drag to scroll the projects left/right (touch uses native swipe) */
  const onTrackDown = (e) => {
    if (e.pointerType !== "mouse") return;
    dragRef.current = { down: true, x: e.clientX, sl: trackRef.current.scrollLeft, moved: false };
  };
  const onTrackMove = (e) => {
    const d = dragRef.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) { d.moved = true; setDragging(true); }
    if (d.moved) trackRef.current.scrollLeft = d.sl - dx;
  };
  const endTrackDrag = () => {
    dragRef.current.down = false;
    setDragging(false);
    setTimeout(() => { dragRef.current.moved = false; }, 0);
  };
  const onTrackClickCapture = (e) => {
    if (dragRef.current.moved) { e.preventDefault(); e.stopPropagation(); }
  };

  /* project link dialog */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeDlg(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (pending) urlInputRef.current?.focus(); }, [pending]);

  const openDlg = (p) => {
    setPending(p);
    setDlgUrl("");
    setDlgNote("Paste the address of this project. It opens in a new tab.");
  };
  const closeDlg = () => setPending(null);
  const saveDlg = () => {
    const v = dlgUrl.trim();
    if (!/^https?:\/\//i.test(v)) {
      setDlgNote("Enter a full address that starts with https://");
      return;
    }
    store.set("url:" + pending.id, v);
    setUrls((u) => ({ ...u, [pending.id]: v }));
    closeDlg();
    window.open(v, "_blank", "noopener");
  };

  /* music */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
    store.set("vol", String(volume));
    store.set("muted", muted ? "1" : "0");
  }, [volume, muted]);

  // browsers block autoplay, so start on the first click or key press anywhere on the page
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !MUSIC_SRC) return;
    const events = ["click", "keydown"];
    const off = () => events.forEach((t) => window.removeEventListener(t, start));
    function start(e) {
      if (e.target?.closest?.(".music")) return;
      a.play().then(off).catch(() => {});
    }
    events.forEach((t) => window.addEventListener(t, start));
    return off;
  }, []);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setMuted(false);
      if (volume === 0) setVolume(0.5);
      return;
    }
    if (muted || volume === 0) {
      setMuted(false);
      if (volume === 0) setVolume(0.5);
    } else {
      setMuted(true);
    }
  };
  const onVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0 && muted) setMuted(false);
  };
  const silent = muted || volume === 0;

  const marquee = [...MARQUEE, ...MARQUEE];

  return (
    <>
      {loader && (
        <div className="loader" aria-hidden="true">
          <span><b>Angelica Biaga</b></span>
        </div>
      )}
      <div id="bar" ref={barRef} />

      <nav>
        <div className="wrap">
          <a href="#top" className="logo">Angelica<em>.</em></a>
          <div className="links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Toolbox</a>
            <a href="#expertise">Expertise</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="btn p navcta" href="mailto:angelicabiaga4224@gmail.com">Hire me</a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="wrap">
          <div className="hero-grid" ref={heroGridRef}>
            <div>
              <span className="chip">Open to any IT roles</span>
              <h1>
                <span><Split>Hi, I’m Angelica.</Split></span>
                <em><span>{typed}</span><span className="caret" /></em>
              </h1>
              <p className="lead">
                A BSIT student who loves working and discovering new things in web and mobile development.
              </p>
              <div className="btns">
                <a className="btn p" href="#projects">View my projects</a>
                <a className="btn l" href="#experience">See experience</a>
                <a className="btn o" href="#contact">Contact me</a>
              </div>
            </div>
            <SkillBall />
          </div>
        </div>
      </header>

      <div className="mq">
        <div>
          {marquee.map((w, i) => <span key={i}>{w} ✦</span>)}
        </div>
      </div>

      <section id="about" className="about">
        <div className="wrap">
          <Reveal>
            <div className="photo" ref={photoRef}>
              <div className="pic">
                {PHOTO_SRC ? <img src={PHOTO_SRC} alt="Portrait of Angelica Biaga" /> : <span>Your photo here</span>}
              </div>
            </div>
          </Reveal>
          <Reveal>
            <h2><Split>Always building, always <em>learning</em></Split></h2>
            <p>
              What I love most about this field is that I genuinely enjoy learning new things. Whenever someone teaches me a new tool or hands me a task I haven't done before, I find a way to have fun with it. That mindset makes it easy for me to pick things up quickly and help out wherever I'm needed.
            </p>
            <p> I’m looking for any IT role internship specifically Frontend Development where I can contribute to real projects and keep growing.</p>
          </Reveal>
        </div>
      </section>

      <section id="projects">
        <div className="wrap">
          <Reveal className="head">
            <small>Featured work</small>
            <h2><Split>Things I’ve <em>built</em></Split></h2>
          </Reveal>
          <p className="hint">Swipe, drag or use the arrows to browse. Select a card to open the live website.</p>
        </div>
        <div
          className={"ptrack" + (dragging ? " drag" : "")}
          ref={trackRef}
          onScroll={updateEdge}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={endTrackDrag}
          onPointerLeave={endTrackDrag}
          onClickCapture={onTrackClickCapture}
        >
          {PROJECTS.map((p) => {
            const url = urls[p.id];
            const inner = (
              <>
                <div className={"art " + p.art}><span className="init">{p.init}</span></div>
                <div className="ptext">
                  <h3>{p.title}</h3>
                  <div className="role">{p.role}</div>
                  <p>{p.desc}</p>
                  <span className="go">{url ? "Visit website ↗" : "Add website link"}</span>
                </div>
              </>
            );
            return url ? (
              <a key={p.id} className="proj" href={url} target="_blank" rel="noopener noreferrer" draggable={false}>{inner}</a>
            ) : (
              <button key={p.id} className="proj nolink" type="button" onClick={() => openDlg(p)}>{inner}</button>
            );
          })}
        </div>
        <div className="pnav">
          <button type="button" aria-label="Previous projects" disabled={edge.start} onClick={() => slide(-1)}>←</button>
          <button type="button" aria-label="Next projects" disabled={edge.end} onClick={() => slide(1)}>→</button>
        </div>
      </section>

      <section id="skills">
        <div className="wrap">
          <Reveal className="head">
            <small>Technical skills</small>
            <h2><Split>My <em>toolbox</em></Split></h2>
          </Reveal>
          <div className="grid">
            {SKILLS.map(([title, tags], i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="card">
                  <h3>{title}</h3>
                  <div className="stack">{tags.map((t) => <span key={t}>{t}</span>)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="expertise">
        <div className="wrap">
          <Reveal className="head">
            <small>Area of expertise</small>
            <h2><Split>What I <em>bring</em></Split></h2>
          </Reveal>
          <p className="hint">Hover or tap a card to pop it.</p>
          <div className="grid">
            {EXPERT.map((e, i) => (
              <Reveal key={e[0]} delay={i * 90}>
                <PopCard title={e[0]} text={e[1]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="experience">
        <div className="wrap">
          <Reveal className="head">
            <small>Experience &amp; leadership</small>
            <h2><Split>My <em>journey</em> so far</Split></h2>
          </Reveal>
          {EXPERIENCE.map((x) => (
            <Reveal key={x.title} className="row">
              <div>
                <h3>{x.title}</h3>
                <div className="meta">{x.meta}</div>
              </div>
              <ul>{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contact" className="contact">
        <Reveal className="wrap">
          <h2><Split>Let’s build something <em>meaningful.</em></Split></h2>
          <p>I’m open to a frontend internship where I can contribute to real projects and grow with a thoughtful team.</p>
          <div className="btns">
            <a className="btn p" href="mailto:angelicabiaga4224@gmail.com">Email me</a>
            <a className="btn o" href="https://www.linkedin.com/in/angelica-biaga-29b0b5401/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="btn o" href="https://github.com/angelicabiaga" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </Reveal>
      </section>

      <footer>© 2026 Angelica V. Biaga. Las Piñas City.</footer>

      <div className="music" role="group" aria-label="Background music">
        <audio ref={audioRef} src={MUSIC_SRC || undefined} loop preload="auto" />
        <button type="button" onClick={toggleMute} aria-label={silent ? "Unmute music" : "Mute music"} title={silent ? "Unmute" : "Mute"}>
          {silent ? <SpeakerOff /> : <SpeakerOn />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={onVolume}
          aria-label="Music volume"
        />
      </div>

      <div id="dlg" className={pending ? "open" : ""} role="dialog" aria-modal="true" aria-labelledby="dt">
        <div>
          <h3 id="dt">{pending ? "Link for " + pending.title : "Add the website link"}</h3>
          <p>{dlgNote}</p>
          <input
            ref={urlInputRef}
            type="url"
            placeholder="https://your-project.com"
            aria-label="Project website address"
            value={dlgUrl}
            onChange={(e) => setDlgUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveDlg(); }}
          />
          <div className="row2">
            <button className="btn o" type="button" onClick={closeDlg}>Cancel</button>
            <button className="btn p" type="button" onClick={saveDlg}>Save and open</button>
          </div>
        </div>
      </div>
    </>
  );
}