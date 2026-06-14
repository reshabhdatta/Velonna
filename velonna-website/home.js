// VELONNA — home.js
// Commerce home page. Mirrors main.js patterns (Lenis, GSAP, ScrollTrigger)
// but stays self-contained so the campaign page keeps its own script.

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
// HEADER — announcement + nav stack: hide on scroll down, reveal on scroll up
// ============================================================================
const initHeaderScroll = () => {
  const head = document.querySelector(".home-head");
  const nav = document.querySelector(".nav");
  if (!head) return;

  let lastY = 0;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const dir = y > lastY ? "down" : "up";
    if (y < 80) {
      head.classList.add("is-visible");
      nav?.classList.remove("is-scrolled");
    } else {
      nav?.classList.add("is-scrolled");
      if (dir === "down" && y > 200) head.classList.remove("is-visible");
      else head.classList.add("is-visible");
    }
    lastY = y;
    ticking = false;
  }

  setTimeout(() => head.classList.add("is-visible"), 100);

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
// ANNOUNCEMENT BAR — rotate messages, dismiss
// ============================================================================
const initAnnounce = () => {
  const head = document.querySelector(".home-head");
  const msgs = [...document.querySelectorAll(".announce-msg")];
  const closeBtn = document.querySelector(".announce-close");
  if (!msgs.length) return;

  if (!prefersReduced && msgs.length > 1) {
    let i = 0;
    setInterval(() => {
      msgs[i].classList.remove("active");
      i = (i + 1) % msgs.length;
      msgs[i].classList.add("active");
    }, 4200);
  }

  closeBtn?.addEventListener("click", () => {
    head?.classList.add("announce-hidden");
    ScrollTrigger.refresh();
  });
};

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
  const head = document.querySelector(".home-head");

  if (bgImage) gsap.set(bgImage, { scale: 1.2, opacity: 0 });
  // y: 0 wipes the px offset GSAP parses out of the CSS translateY(115%) pre-state
  gsap.set(heroLines, { y: 0, yPercent: 115 });
  gsap.set([heroSubtitle, heroCtaGroup], { y: 40, opacity: 0 });
  gsap.set(heroTextBg, { scale: 0.6, opacity: 0 });
  if (heroScrollCue) gsap.set(heroScrollCue, { opacity: 0 });
  if (head) gsap.set(head, { y: -110, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(bgImage, { scale: 1.05, opacity: 1, duration: 2.4 }, 0)
    .to(heroTextBg, { scale: 1, opacity: 1, duration: 1.6 }, "-=1.6")
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.15, ease: "power4.out" }, "-=1.2")
    .to(heroSubtitle, { y: 0, opacity: 1, duration: 1.0 }, "-=0.9")
    .to(heroCtaGroup, { y: 0, opacity: 1, duration: 1.0 }, "-=0.85")
    .to(
      head,
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        // hand control back to the .is-visible class — an inline transform
        // would override it and break hide-on-scroll
        onComplete: () => gsap.set(head, { clearProps: "transform,opacity" }),
      },
      "-=0.9"
    )
    .to(heroScrollCue, { opacity: 1, duration: 1.4, ease: "power2.out" }, "-=0.6");

  if (bgImage) {
    gsap.to(bgImage, {
      scale: 1.0,
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
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
// SECTION REVEALS — any .reveal-group staggers its [data-reveal] children in
// ============================================================================
const initReveals = () => {
  document.querySelectorAll(".reveal-group").forEach((group) => {
    const els = group.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    gsap.set(els, { y: 30, opacity: 0 });
    gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: group, start: "top 75%", toggleActions: "play none none reverse" },
    });
  });
};

// ============================================================================
// ATELIER — heritage ken-burns + stat count-up
// ============================================================================
const initAtelier = () => {
  if (document.querySelector(".heritage-bg-img")) {
    gsap.to(".heritage-bg-img", {
      scale: 1.12,
      scrollTrigger: { trigger: ".heritage", start: "top bottom", end: "bottom top", scrub: true },
    });
  }

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
// CAMPAIGN — slow settle on the banner image
// ============================================================================
const initCampaign = () => {
  const img = document.querySelector(".campaign-bg img");
  if (!img) return;
  gsap.fromTo(
    img,
    { scale: 1.12 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: ".campaign", start: "top bottom", end: "bottom top", scrub: true },
    }
  );
};

// ============================================================================
// WISHLIST — hearts toggle, live count in the nav
// ============================================================================
const initWishlist = () => {
  const count = document.getElementById("wish-count");
  let n = 0;
  document.querySelectorAll(".prod-heart").forEach((h) => {
    h.addEventListener("click", () => {
      const on = h.classList.toggle("active");
      h.setAttribute("aria-pressed", on ? "true" : "false");
      n += on ? 1 : -1;
      if (count) {
        count.textContent = n;
        count.classList.toggle("is-empty", n === 0);
      }
    });
  });
};

// ============================================================================
// CART DRAWER
// ============================================================================
const initDrawer = () => {
  const overlay = document.getElementById("cart-drawer");
  const openBtn = document.getElementById("cart-open");
  const closeBtn = document.getElementById("drawer-close");
  if (!overlay) return;

  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lenis?.stop();
    setTimeout(() => closeBtn?.focus(), 350);
  }
  function close() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lenis?.start();
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector(".drawer-link")?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) close();
  });
};

// ============================================================================
// MODAL — appointment booking (same markup contract as the campaign page)
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

  openTriggers.forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    })
  );
  closeBtn?.addEventListener("click", close);

  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("active")) close();
  });

  form?.addEventListener("submit", (e) => {
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
};

// ============================================================================
// ANCHORS — smooth in-page scroll via Lenis
// ============================================================================
const initAnchors = () => {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      if (!lenis) return; // reduced motion — native jump
      e.preventDefault();
      lenis.scrollTo(target, { offset: -40, duration: 1.3 });
    });
  });
};

// ============================================================================
// NEWSLETTER
// ============================================================================
const initNewsletter = () => {
  const form = document.getElementById("news-form");
  const ok = document.getElementById("news-success");
  form?.addEventListener("submit", (e) => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      e.preventDefault();
    }
    if (ok) {
      ok.classList.add("is-shown");
      setTimeout(() => {
        ok.classList.remove("is-shown");
        form.reset();
      }, 3200);
    }
  });
};

// ============================================================================
// VIDEOS — pause autoplay loops while offscreen
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
// TESTIMONIALS — 3D coverflow (center card largest, neighbours scaled + tucked)
// ============================================================================
const initStories = () => {
  const stage = document.querySelector(".cf-stage");
  if (!stage) return;
  const cards = [...stage.querySelectorAll(".cf-card")];
  const n = cards.length;
  if (!n) return;

  const caption = document.querySelector(".cf-caption");
  const quoteEl = caption?.querySelector(".cf-quote");
  const authorEl = caption?.querySelector(".cf-author");
  let active = Math.floor((n - 1) / 2);

  function updateCaption() {
    if (!quoteEl || !authorEl) return;
    const q = cards[active].dataset.quote || "";
    const a = cards[active].dataset.author || "";
    if (quoteEl.textContent === q) return; // no flash on first layout
    caption.classList.add("is-fading");
    setTimeout(() => {
      quoteEl.textContent = q;
      authorEl.textContent = a;
      caption.classList.remove("is-fading");
    }, prefersReduced ? 0 : 260);
  }

  function layout() {
    const cw = cards[0].offsetWidth || 240; // untransformed width
    const spacing = cw * 0.62;
    cards.forEach((card, i) => {
      let d = i - active;
      if (d > n / 2) d -= n; // shortest signed distance (wrap)
      if (d < -n / 2) d += n;
      const ad = Math.abs(d);
      const x = d === 0 ? 0 : Math.sign(d) * (spacing + (ad - 1) * spacing * 0.72);
      const s = Math.max(1 - ad * 0.16, 0.52);
      card.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${s}) rotateY(${-d * 4}deg)`;
      card.style.zIndex = String(100 - ad);
      card.style.opacity = ad > 2 ? "0" : ad === 0 ? "1" : ad === 1 ? "0.92" : "0.7";
      card.style.pointerEvents = ad > 2 ? "none" : "auto";
      card.classList.toggle("is-active", d === 0);
      card.setAttribute("aria-hidden", ad > 2 ? "true" : "false");
    });
    updateCaption();
  }

  const go = (dir) => {
    active = (active + dir + n) % n;
    layout();
  };

  document.querySelector(".cf-prev")?.addEventListener("click", () => go(-1));
  document.querySelector(".cf-next")?.addEventListener("click", () => go(1));
  cards.forEach((card, i) =>
    card.addEventListener("click", () => {
      if (i !== active) {
        active = i;
        layout();
      }
    })
  );

  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  });

  let sx = null;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    sx = null;
  });

  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  layout();
};

// ============================================================================
// BOOT
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initAnnounce();
  initWishlist();
  initDrawer();
  initModal();
  initAnchors();
  initNewsletter();
  initVideoPause();
  initStories();

  if (prefersReduced) return;

  initHeroAnimations();
  initReveals();
  initAtelier();
  initCampaign();

  setTimeout(() => ScrollTrigger.refresh(), 800);
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
