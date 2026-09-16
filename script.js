/* ============================================================
   Starkly Healthcare — script.js
   Vanilla JS: nav, reveals, counters, sliders, filters,
   modals, accordions, ripple, parallax, page transitions.
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header state ---------- */
  const header = $(".site-header");
  const onScrollHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile navigation ---------- */
  const navToggle = $(".nav-toggle");
  const mainNav = $(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", mainNav).forEach((a) =>
      a.addEventListener("click", () => {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Text reveal: split into word masks ---------- */
  $$(".text-reveal").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (w, i) =>
          `<span class="w"><span style="--wi:${i}">${w}</span></span>`
      )
      .join(" ");
  });

  /* ---------- IntersectionObserver reveals ---------- */
  const revealTargets = $$("[data-reveal], [data-stagger], .text-reveal");
  $$("[data-stagger]").forEach((parent) =>
    [...parent.children].forEach((child, i) => child.style.setProperty("--i", i))
  );
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealTargets.forEach((t) => io.observe(t));
  } else {
    revealTargets.forEach((t) => t.classList.add("revealed"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const dur = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.classList.add("counted");
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !prefersReduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => {
      c.firstChild.nodeValue = c.dataset.count;
    });
  }

  /* ---------- Parallax backgrounds ---------- */
  const parallaxEls = $$("[data-parallax]");
  if (parallaxEls.length && !prefersReduced) {
    let ticking = false;
    const update = () => {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const rect = el.parentElement.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------- Button ripple ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn || prefersReduced) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      $$(".faq-item.open").forEach((other) => {
        other.classList.remove("open");
        $(".faq-a", other).style.maxHeight = null;
        $(".faq-q", other).setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Testimonial slider ---------- */
  const slider = $(".testimonial-slider");
  if (slider) {
    const slides = $$(".testimonial-slide", slider);
    const dotsWrap = $(".slider-dots");
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = $$("button", dotsWrap);

    function goTo(i, manual) {
      index = (i + slides.length) % slides.length;
      slider.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("active", j === index));
      if (manual) restart();
    }
    function restart() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(() => goTo(index + 1), 6000);
    }
    restart();

    const shell = slider.closest(".testimonial-shell");
    shell.addEventListener("mouseenter", () => clearInterval(timer));
    shell.addEventListener("mouseleave", restart);
  }

  /* ---------- Page transition veil ---------- */
  const veil = document.createElement("div");
  veil.className = "page-veil";
  document.body.appendChild(veil);
  if (!prefersReduced) {
    $$('a[href$=".html"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("http") || link.target === "_blank") return;
        e.preventDefault();
        veil.classList.add("active");
        setTimeout(() => (window.location.href = href), 380);
      });
    });
  }

  /* ---------- Forms (demo submit) ---------- */
  $$("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = $(".form-success", form);
      if (note) {
        note.classList.add("show");
        note.textContent =
          "Thank you! Your request has been received. Our team will contact you shortly.";
        form.reset();
        setTimeout(() => note.classList.remove("show"), 6000);
      }
    });
  });

  /* ---------- Footer year ---------- */
  $$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
