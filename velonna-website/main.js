// VELONNA — main.js
// GSAP (UMD via <script>), ScrollTrigger, Lenis. Single entry point.
// All animations defined as initXxx() and called on DOMContentLoaded.

import Lenis from "lenis";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// -------------------- Lenis (smooth inertia scroll) --------------------
let lenis = null;
if (!prefersReduced) {
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    infinite: false,
    gestureOrientation: "vertical",
    normalizeWheel: true,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

// ============================================================================
// HERO — entrance timeline + scroll-driven parallax
// ============================================================================
const initHeroAnimations = () => {
  const bgImage = document.querySelector(".bg-image");
  const heroLines = document.querySelectorAll(".hero-title .line-inner");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroCtaGroup = document.querySelector(".hero-cta-group");
  const heroTextBg = document.querySelector(".hero-text-bg");
  const heroScrollCue = document.querySelector(".hero-scroll-cue");
  const nav = document.querySelector(".nav");

  if (bgImage) gsap.set(bgImage, { scale: 1.2, opacity: 0 });
  // y: 0 wipes the px offset GSAP parses out of the CSS translateY(115%)
  // pre-state — otherwise it survives the yPercent tween as a residual shift
  gsap.set(heroLines, { y: 0, yPercent: 115 });
  gsap.set([heroSubtitle, heroCtaGroup], { y: 40, opacity: 0 });
  gsap.set(heroTextBg, { scale: 0.6, opacity: 0 });
  if (heroScrollCue) gsap.set(heroScrollCue, { opacity: 0 });
  if (nav) gsap.set(nav, { y: -100, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(bgImage, { scale: 1.05, opacity: 1, duration: 2.4 }, 0)
    .to(heroTextBg, { scale: 1, opacity: 1, duration: 1.6 }, "-=1.6")
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.15, ease: "power4.out" }, "-=1.2")
    .to(heroSubtitle, { y: 0, opacity: 1, duration: 1.0 }, "-=0.9")
    .to(heroCtaGroup, { y: 0, opacity: 1, duration: 1.0 }, "-=0.85")
    .to(
      nav,
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        // Hand control back to the .is-visible / .is-scrolled classes —
        // a leftover inline transform overrides them and breaks hide-on-scroll
        onComplete: () => gsap.set(nav, { clearProps: "transform,opacity" }),
      },
      "-=0.9"
    )
    .to(heroScrollCue, { opacity: 1, duration: 1.4, ease: "power2.out" }, "-=0.6");

  // Scroll-driven hero parallax
  if (bgImage) {
    gsap.to(bgImage, {
      scale: 1.0,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  gsap.to(".hero-details", {
    y: -150,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  gsap.to(".hero-text-bg", {
    y: -250,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 },
  });
};

// ============================================================================
// PRODUCT REVEAL — entrance on scroll + scroll-driven rotation/scale
// ============================================================================
const initProductRevealAnimations = () => {
  const watchImg = document.querySelector(".product-reveal-watch");
  const title = document.querySelector(".product-reveal-title");
  const subtitle = document.querySelector(".product-reveal-subtitle");
  const ctaGroup = document.querySelector(".product-reveal-cta-group");

  if (!watchImg) return;

  gsap.set(watchImg, { y: 60, opacity: 0, rotation: -5 });
  gsap.set([title, subtitle, ctaGroup], { y: 40, opacity: 0 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".product-reveal",
        start: "top 60%",
        toggleActions: "play none none reverse",
      },
      defaults: { ease: "power3.out" },
    })
    .to(watchImg, { y: 0, opacity: 1, rotation: 0, duration: 1.2 })
    .to(title, { y: 0, opacity: 1, duration: 1.0 }, "-=0.9")
    .to(subtitle, { y: 0, opacity: 1, duration: 0.9 }, "-=0.8")
    .to(ctaGroup, { y: 0, opacity: 1, duration: 0.9 }, "-=0.8");

  // Scroll-driven scrub: rotate + slight zoom
  gsap.to(watchImg, {
    rotation: 12,
    scale: 1.15,
    scrollTrigger: {
      trigger: ".product-reveal",
      start: "top top",
      end: "bottom top",
      scrub: 1.5,
    },
  });

  gsap.to(".product-reveal-details", {
    y: -120,
    scrollTrigger: { trigger: ".product-reveal", start: "top top", end: "bottom top", scrub: true },
  });

  gsap.to(".product-reveal-text-bg", {
    y: -220,
    scrollTrigger: { trigger: ".product-reveal", start: "top top", end: "bottom top", scrub: 1.2 },
  });
};

// ============================================================================
// HERITAGE — entrance + subtle scroll parallax on bg
// ============================================================================
const initHeritageAnimations = () => {
  const els = document.querySelectorAll(
    ".heritage-eyebrow, .heritage-title, .heritage-divider, .heritage-body, .heritage-link, .heritage-stat"
  );
  if (!els.length) return;

  gsap.set(els, { y: 30, opacity: 0 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".heritage",
        start: "top 65%",
        toggleActions: "play none none reverse",
      },
      defaults: { ease: "power3.out", duration: 0.9 },
    })
    .to(".heritage-eyebrow", { y: 0, opacity: 1 })
    .to(".heritage-title", { y: 0, opacity: 1 }, "-=0.7")
    .to(".heritage-divider", { y: 0, opacity: 1, duration: 0.6 }, "-=0.6")
    .to(".heritage-body", { y: 0, opacity: 1, stagger: 0.12 }, "-=0.7")
    .to(".heritage-link", { y: 0, opacity: 1 }, "-=0.7")
    .to(".heritage-stat", { y: 0, opacity: 1, stagger: 0.1 }, "-=0.6");

  gsap.to(".heritage-bg-img", {
    scale: 1.12,
    scrollTrigger: { trigger: ".heritage", start: "top bottom", end: "bottom top", scrub: true },
  });

  // Stats count up from zero as they enter
  document.querySelectorAll(".stat-value").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    if (!Number.isFinite(target)) return;
    const counter = { v: 0 };
    gsap.to(counter, {
      v: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".heritage-stats",
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
      onUpdate: () => {
        el.textContent = Math.round(counter.v);
      },
    });
  });
};

// ============================================================================
// COLLECTION (ETHOS) — variant slider + scroll parallax on bg
// ============================================================================
const initEthosAnimations = () => {
  const variants = {
    bl: document.querySelector(".ethos-main.variant-bl"),
    rs: document.querySelector(".ethos-main.variant-rs"),
  };
  const bgs = {
    bl: document.querySelector(".ethos-bg-img.ethos-bg-bl"),
    rs: document.querySelector(".ethos-bg-img.ethos-bg-rs"),
  };

  if (!variants.bl || !variants.rs) return;

  let current = "bl";
  let animating = false;

  function switchTo(target) {
    if (animating || target === current) return;
    animating = true;
    const out = variants[current];
    const inEl = variants[target];

    const outText = out.querySelector(".ethos-text-side");
    const outImg = out.querySelector(".ethos-watch-img");
    const inText = inEl.querySelector(".ethos-text-side");
    const inImg = inEl.querySelector(".ethos-watch-img");

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut", duration: 0.7 },
      onComplete: () => {
        out.classList.remove("active");
        inEl.classList.add("active");
        bgs[current]?.classList.remove("active");
        bgs[target]?.classList.add("active");
        gsap.set(outText, { x: 0, opacity: 1 });
        gsap.set(outImg, { x: 0, opacity: 1 });
        current = target;
        animating = false;
      },
    });

    // Out
    tl.to(outText, { x: -100, opacity: 0 }, 0)
      .to(outImg, { x: -150, opacity: 0 }, 0);

    // Prepare in
    gsap.set(inText, { x: 100, opacity: 0 });
    gsap.set(inImg, { x: 150, opacity: 0 });
    inEl.classList.add("active");

    tl.to(inText, { x: 0, opacity: 1 }, "-=0.35")
      .to(inImg, { x: 0, opacity: 1 }, "-=0.7");
  }

  document.querySelectorAll(".ethos-next-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTo(btn.dataset.target));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        switchTo(btn.dataset.target);
      }
    });
  });

  // Bg parallax
  document.querySelectorAll(".ethos-bg-img").forEach((img) => {
    gsap.to(img, {
      scale: 1.12,
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: ".ethos", start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Section entrance
  gsap.from(".ethos-section-title", {
    y: 30, opacity: 0, duration: 1.0, ease: "power3.out",
    scrollTrigger: { trigger: ".ethos", start: "top 75%", toggleActions: "play none none reverse" },
  });
};

// ============================================================================
// CRAFTSMANSHIP (DISMANTLE) — pinned image with scroll-driven transform
// + sequential callout reveals (replaces 152-frame canvas)
// ============================================================================
const initDismantleAnimations = () => {
  const img = document.getElementById("dismantle-img");
  const header = document.querySelector(".dismantle-header");
  const callouts = document.querySelectorAll(".dismantle-callout");

  if (!img) return;

  // Gentle ken-burns scrub through the section — video stays full-bleed,
  // just a subtle scale push so the scroll feels alive without distorting the frame.
  gsap.set(img, { scale: 1.05 });
  gsap.to(img, {
    scale: 1.15,
    ease: "none",
    scrollTrigger: {
      trigger: ".dismantle",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
    },
  });

  // Sequential callout reveals — each callout fires at a specific scroll % through the section
  const triggerStarts = ["top 5%", "top -25%", "top -55%", "top -85%"];
  callouts.forEach((c, i) => {
    ScrollTrigger.create({
      trigger: ".dismantle",
      start: triggerStarts[i] || `top -${i * 30}%`,
      end: "bottom bottom",
      onEnter: () => c.classList.add("is-shown"),
      onLeaveBack: () => c.classList.remove("is-shown"),
    });
  });

  // Header slides out left + fades as you progress
  if (header) {
    gsap.to(header, {
      x: -120,
      opacity: 0,
      ease: "power2.in",
      scrollTrigger: {
        trigger: ".dismantle",
        start: "top 30%",
        end: "top -10%",
        scrub: 1,
      },
    });
  }
};

// ============================================================================
// SHOWCASE — entrance fade-ins
// ============================================================================
const initShowcaseAnimations = () => {
  const els = document.querySelectorAll(
    ".showcase-eyebrow, .showcase-headline, .showcase-body, .showcase-ig-link"
  );
  if (!els.length) return;
  gsap.set(els, { y: 30, opacity: 0 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".showcase",
        start: "top 65%",
        toggleActions: "play none none reverse",
      },
      defaults: { ease: "power3.out", duration: 0.95 },
    })
    .to(".showcase-eyebrow", { y: 0, opacity: 1 })
    .to(".showcase-headline", { y: 0, opacity: 1 }, "-=0.7")
    .to(".showcase-body", { y: 0, opacity: 1 }, "-=0.7")
    .to(".showcase-ig-link", { y: 0, opacity: 1 }, "-=0.7");

  // Background ken-burns
  gsap.to(".showcase-bg-img", {
    scale: 1.12,
    scrollTrigger: { trigger: ".showcase", start: "top bottom", end: "bottom top", scrub: true },
  });
};

// ============================================================================
// NAV — hide on scroll down, reveal on scroll up
// ============================================================================
const initNavScroll = () => {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  let lastY = 0;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const dir = y > lastY ? "down" : "up";
    if (y < 80) {
      nav.classList.add("is-visible");
      nav.classList.remove("is-scrolled");
    } else {
      nav.classList.add("is-scrolled");
      if (dir === "down" && y > 200) nav.classList.remove("is-visible");
      else nav.classList.add("is-visible");
    }
    lastY = y;
    ticking = false;
  }

  // Reveal nav at start (after entrance timeline finishes)
  setTimeout(() => nav.classList.add("is-visible"), 100);

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
};

// ============================================================================
// MODAL — open/close + smooth anchor links + form submit
// ============================================================================
const initModal = () => {
  const overlay = document.getElementById("reserve-modal");
  const closeBtn = document.getElementById("modal-close");
  const openTriggers = document.querySelectorAll(".open-reserve-modal");
  const form = document.getElementById("reserve-form");
  const success = document.getElementById("form-success");

  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    overlay?.classList.add("active");
    overlay?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lenis?.stop();
    setTimeout(() => overlay?.querySelector("input:not([type=hidden]), select, textarea")?.focus(), 480);
  }
  function close() {
    overlay?.classList.remove("active");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lenis?.start();
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  openTriggers.forEach((b) => b.addEventListener("click", open));
  closeBtn?.addEventListener("click", close);

  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("active")) close();
  });

  // Form submit — shows inline success (Netlify form attrs are wired up on the markup)
  form?.addEventListener("submit", (e) => {
    // If running on Netlify, the form submits to Netlify and we still show success
    // If running locally (e.g. python http.server), prevent default and show success
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      e.preventDefault();
    }
    if (success) {
      success.classList.add("is-shown");
      setTimeout(() => {
        success.classList.remove("is-shown");
        if (overlay?.classList.contains("active")) close();
        form.reset();
      }, 2400);
    }
  });

  // Smooth scroll for in-page anchors via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      if (!lenis) return; // reduced motion — let the browser jump natively
      e.preventDefault();
      lenis.scrollTo(target, { offset: -40, duration: 1.3 });
    });
  });
};

// ============================================================================
// VIDEOS — pause autoplay loops while they're offscreen
// ============================================================================
const initVideoPause = () => {
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      });
    },
    { rootMargin: "120px" }
  );
  document.querySelectorAll("video").forEach((v) => io.observe(v));
};

// ============================================================================
// BOOT
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initNavScroll();
  initModal();
  initVideoPause();

  if (prefersReduced) {
    // No tweens — show everything that scroll would otherwise reveal
    document.querySelectorAll(".dismantle-callout").forEach((c) => c.classList.add("is-shown"));
    return;
  }

  initHeroAnimations();
  initProductRevealAnimations();
  initHeritageAnimations();
  initEthosAnimations();
  initDismantleAnimations();
  initShowcaseAnimations();

  // Refresh ScrollTrigger once images settle so trigger points are accurate
  setTimeout(() => ScrollTrigger.refresh(), 800);
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
