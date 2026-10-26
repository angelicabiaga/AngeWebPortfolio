import { useEffect, useRef, useState, Children, cloneElement, isValidElement } from "react";
import "./App.css";
import photo from "/photo.jpg";
import music from "/bg.mp4";
import pic1 from "/1.png";
import pdf1 from "/AMSA.pdf";
import amsa1 from "/amsa1.png";
import wedding from "/wedding.png";
import coffee from "/coffee.png";
import solace from "/solace.png";
import PUBMAT from "/PUBMAT.png";
import pdf2 from "/portfolio.pdf";
import resume from "/resume.pdf";

/* ------------------------------------------------------------------ */
/*  YOUR ASSETS                                                        */
/* ------------------------------------------------------------------ */

const PHOTO_SRC = photo;
const MUSIC_SRC = music;

/* Pictures, links and PDFs can be added from the editor (open the site with ?edit=1).
   You can also hardcode them here with img, url and pdf. */
const PROJECTS = [
  { id: "fs", art: "meadow", init: "Fs", title: "FranchiSync", role: "Capstone Project Manager & Frontend Developer", desc: "B2B web and mobile app for iFranchise, built with ReactJS and React Native.", img: pic1, url: "https://www.franchisync.business/" },
  { id: "pt", art: "cream", init: "Pt", title: "AMSA Point Tracker", role: "Frontend Developer", desc: "Point tracker for the UPHSD Medicine organization using ReactJS and Google Apps Script.", img: amsa1, pdf: pdf1 },
  { id: "wg", art: "sky", init: "Wg", title: "Digital Wedding Photo Album", role: "Freelance Web Developer", desc: "A wedding gallery that guests open by scanning an NFC tag.", img: wedding, url: "https://gina-sha-photos-h2uh.vercel.app/" },
  { id: "wi", art: "sky", init: "Wi", title: "Coffee Shop Management System", role: "WebProg Project", desc: "A coffee shop management system built with ReactJS.", img: coffee, url: "https://coffee-spot-web.vercel.app/login" },
  { id: "pb", art: "cream", init: "Pb", title: "Digital Photobooth", role: "Freelance Web Developer", desc: "A photobooth website built with JavaScript and CSS.", img: solace, url: "https://solace-studios-photobooth-solace-st.vercel.app/index.html" },
  { id: "pm", art: "meadow", init: "Pm", title: "Publication Materials", role: "Publications Material Committee Member", desc: "Event posters, DP Blast, and photo templates for the Junior Philippine Computer Society.", img: PUBMAT, pdf: pdf2 },
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
const ROLES = ["Looking for Internship", "App Dev Intern", "Software QA Tester", "Startup Tech Intern"];

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Load saved project pictures and links */
const loadSaved = () => {
  try { return JSON.parse(store.get("projects") || "{}") || {}; } catch { return {}; }
};

/* Editor starting values: saved value if any, otherwise what is hardcoded in PROJECTS */
const initialDraft = () => {
  const s = loadSaved();
  const out = {};
  PROJECTS.forEach((p) => {
    const x = s[p.id] || {};
    out[p.id] = { img: x.img || p.img || "", url: x.url || p.url || "" };
  });
  return out;
};

/* Tiny IndexedDB helper. PDFs are too big for localStorage, so they live here. */
const DB_NAME = "portfolio";
const DB_STORE = "pdfs";
const MAX_PDF_MB = 25;

const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const idbGet = async (key) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const q = db.transaction(DB_STORE).objectStore(DB_STORE).get(key);
    q.onsuccess = () => resolve(q.result);
    q.onerror = () => reject(q.error);
  });
};

const idbSet = async (key, value) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const idbDel = async (key) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

/* Read a picture file and shrink it so it fits in browser storage */
const fileToDataUrl = (file, maxW = 900) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const im = new Image();
      im.onerror = reject;
      im.onload = () => {
        const scale = Math.min(1, maxW / im.width);
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * scale);
        c.height = Math.round(im.height * scale);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

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
      { threshold: 0, rootMargin: "0px 0px -6% 0px" }
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
  const [edge, setEdge] = useState({ start: true, end: false });
  const [dragging, setDragging] = useState(false);
  const [muted, setMuted] = useState(() => store.get("muted") === "1");
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(store.get("vol"));
    return Number.isNaN(v) ? 0.5 : v;
  });

  /* project pictures, links and PDFs (saved) + editor draft */
  const editMode = new URLSearchParams(window.location.search).has("edit");
  const [saved, setSaved] = useState(loadSaved);
  const [draft, setDraft] = useState(initialDraft);
  const [savedPdf, setSavedPdf] = useState({}); // id -> { name, blob }
  const [draftPdf, setDraftPdf] = useState({});
  const [note, setNote] = useState("");

  const barRef = useRef(null);
  const heroGridRef = useRef(null);
  const photoRef = useRef(null);
  const trackRef = useRef(null);
  const audioRef = useRef(null);
  const dragRef = useRef({ down: false, x: 0, sl: 0, moved: false });

  /* saved values win, empty saved values fall back to what is hardcoded */
  const projects = PROJECTS.map((p) => {
    const s = saved[p.id] || {};
    return {
      ...p,
      img: s.img || p.img || "",
      url: s.url || p.url || "",
      hasPdf: Boolean(savedPdf[p.id] || p.pdf),
    };
  });

  /* load saved PDFs from IndexedDB */
  useEffect(() => {
    let alive = true;
    (async () => {
      const found = {};
      for (const p of PROJECTS) {
        try {
          const v = await idbGet(p.id);
          if (v && v.blob) found[p.id] = v;
        } catch { /* ignore */ }
      }
      if (alive) {
        setSavedPdf(found);
        setDraftPdf(found);
      }
    })();
    return () => { alive = false; };
  }, []);

  const setField = (id, field, value) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), [field]: value } }));

  const pickImage = async (id, file) => {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file);
      setField(id, "img", data);
      setNote("");
    } catch {
      setNote("Could not read that picture. Try another file.");
    }
  };

  const pickPdf = (id, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setNote("That is not a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setNote("PDF is too big. Max is " + MAX_PDF_MB + " MB.");
      return;
    }
    setDraftPdf((d) => ({ ...d, [id]: { name: file.name, blob: file } }));
    setNote("");
  };

  const removePdf = (id) =>
    setDraftPdf((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });

  /* Opens the PDF in a new tab */
  const openPdf = (p) => {
    const s = savedPdf[p.id];
    let href = "";
    let temp = false;
    if (s && s.blob) {
      href = URL.createObjectURL(s.blob);
      temp = true;
    } else if (p.pdf) {
      href = p.pdf;
    }
    if (!href) return;
    const w = window.open(href, "_blank");
    if (w) w.opener = null;
    else window.location.href = href; // popup blocked, open in this tab instead
    if (temp) setTimeout(() => URL.revokeObjectURL(href), 60000);
  };

  const saveChanges = async () => {
    const clean = {};
    PROJECTS.forEach((p) => {
      const d = draft[p.id] || {};
      clean[p.id] = { img: d.img || "", url: (d.url || "").trim() };
    });
    const okMain = store.set("projects", JSON.stringify(clean));

    let okPdf = true;
    try {
      for (const p of PROJECTS) {
        const d = draftPdf[p.id];
        if (d) await idbSet(p.id, d);
        else await idbDel(p.id);
      }
    } catch {
      okPdf = false;
    }

    if (okMain) setSaved(clean);
    if (okPdf) setSavedPdf(draftPdf);

    if (okMain && okPdf) setNote("Saved!");
    else if (!okMain) setNote("Not saved. Pictures are too big. Try smaller pictures.");
    else setNote("Pictures saved, but the PDFs could not be saved.");
    setTimeout(() => setNote(""), 3000);
  };

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
          <a className="btn p navcta" href="mailto:angelicabiaga4224@gmail.com">Contact me!</a>
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
                I’m looking for any IT role internship specifically in Application Development where I can contribute to real projects and keep growing.
              </p>
              <div className="btns">
                <a className="btn p" href="#projects">View my projects</a>
                <a className="btn l" href="#experience">See experience</a>
                <a className="btn o" href="resume.pdf">View Resume</a>
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
            <A:mail></A:mail> Motivated BSIT student with experience in application development, UI/UX design, and project management through academic and freelance projects. Skilled in ReactJS, Canva, and passionate about building responsive, user-friendly web and mobile applications. A quick learner who values teamwork, problem-solving, and continuous improvement, with a strong interest in exploring new technologies and developing practical solutions that meet user needs.
            </p>
            <p> </p>
          </Reveal>
        </div>
      </section>

      <section id="projects">
        <div className="wrap">
          <Reveal className="head">
            <small>Featured work</small>
            <h2><Split>Things I’ve <em>built</em></Split></h2>
          </Reveal>
          
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
          {projects.map((p) => {
            const inner = (
              <>
                <div className={"art " + p.art}>
                  {p.img ? (
                    <img className="art-img" src={p.img} alt={p.title + " preview"} draggable={false} />
                  ) : (
                    <span className="init">{p.init}</span>
                  )}
                </div>
                <div className="ptext">
                  <h3>{p.title}</h3>
                  <div className="role">{p.role}</div>
                  <p>{p.desc}</p>
                  <div className="pactions">
                    {p.url && <span className="cbtn">Visit website ↗</span>}
                    {p.hasPdf && (
                      <span
                        className="cbtn"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPdf(p); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            openPdf(p);
                          }
                        }}
                      >
                        View work ↗
                      </span>
                    )}
                  </div>
                </div>
              </>
            );
            return p.url ? (
              <a key={p.id} className="proj" href={p.url} target="_blank" rel="noopener noreferrer" draggable={false}>{inner}</a>
            ) : (
              <div key={p.id} className="proj nolink">{inner}</div>
            );
          })}
        </div>
        <div className="pnav">
          <button type="button" aria-label="Previous projects" disabled={edge.start} onClick={() => slide(-1)}>←</button>
          <button type="button" aria-label="Next projects" disabled={edge.end} onClick={() => slide(1)}>→</button>
        </div>

        {editMode && (
          <div className="wrap">
            <div className="editor">
              <h3>Edit projects</h3>
              <p className="hint">Add a picture, a website link and a PDF for each project, then click Save changes.</p>
              {PROJECTS.map((p) => {
                const d = draft[p.id] || {};
                const pdf = draftPdf[p.id];
                return (
                  <div className="erow" key={p.id}>
                    <div className="ethumb">
                      {d.img ? <img src={d.img} alt="" /> : <span>{p.init}</span>}
                    </div>
                    <div className="efields">
                      <strong>{p.title}</strong>
                      <input
                        type="url"
                        placeholder="https://your-website-link.com"
                        value={d.url || ""}
                        onChange={(e) => setField(p.id, "url", e.target.value)}
                      />
                      <div className="ebtns">
                        <label className="ebtn">
                          Choose picture
                          <input type="file" accept="image/*" hidden onChange={(e) => pickImage(p.id, e.target.files[0])} />
                        </label>
                        {d.img && (
                          <button type="button" className="ebtn" onClick={() => setField(p.id, "img", "")}>
                            Remove picture
                          </button>
                        )}
                        <label className="ebtn">
                          Choose PDF
                          <input
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={(e) => { pickPdf(p.id, e.target.files[0]); e.target.value = ""; }}
                          />
                        </label>
                        {pdf && (
                          <button type="button" className="ebtn" onClick={() => removePdf(p.id)}>
                            Remove PDF
                          </button>
                        )}
                      </div>
                      {pdf && <span className="epdf">PDF: {pdf.name}</span>}
                      {!pdf && p.pdf && <span className="epdf">PDF: built-in file</span>}
                    </div>
                  </div>
                );
              })}
              <div className="esave">
                <button type="button" className="btn p" onClick={saveChanges}>Save changes</button>
                {note && <span className="enote">{note}</span>}
              </div>
            </div>
          </div>
        )}
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
    </>
  );
}