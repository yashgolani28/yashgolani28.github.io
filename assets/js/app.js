(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");
  const year = document.getElementById("year");
  const copyEmail = document.getElementById("copyEmailBtn");

  // Mobile menu
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileMenuToggle && navLinks) {
    // Toggle menu
    mobileMenuToggle.addEventListener("click", () => {
      const isActive = navLinks.classList.toggle("active");
      mobileMenuToggle.classList.toggle("active");
      mobileMenuToggle.setAttribute("aria-expanded", isActive);
      mobileMenuToggle.setAttribute("aria-label", isActive ? "Close navigation menu" : "Open navigation menu");
    });

    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu when pressing Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        mobileMenuToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav") && navLinks.classList.contains("active")) {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Theme
  const saved = localStorage.getItem("theme") || "dark";
  root.setAttribute("data-theme", saved);

  if (toggle) {
    toggle.checked = saved === "light";
    if (label) label.textContent = toggle.checked ? "Light" : "Dark";

    toggle.addEventListener("change", () => {
      const next = toggle.checked ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      if (label) label.textContent = toggle.checked ? "Light" : "Dark";
    });
  }

  // Footer year
  if (year) year.textContent = new Date().getFullYear();

  // Copy email
  if (copyEmail) {
    copyEmail.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("yashgolani287@gmail.com");
        alert("Email copied");
      } catch (e) {
        alert("Copy failed");
      }
    });
  }

  // Scrollspy: highlight the nav link for the section in view
  (function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.navLinks a[href^="#"]'));
    if (!links.length) return;

    const byId = new Map();
    const sections = [];
    links.forEach(link => {
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const el = document.getElementById(id);
      if (el) {
        byId.set(id, link);
        sections.push(el);
      }
    });
    if (!sections.length) return;

    let activeId = null;
    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach(l => l.removeAttribute("aria-current"));
      const link = byId.get(id);
      if (link) link.setAttribute("aria-current", "page");
    }

    const observer = new IntersectionObserver((entries) => {
      // Pick the visible section nearest the top of the viewport.
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(s => observer.observe(s));

    // Default to Home until something else wins.
    setActive(sections[0].id);
  })();

  // Plausible analytics (only on the real domain)
  (function initPlausible() {
    const PLAUSIBLE_DOMAIN = "yashgolani28.github.io";
    if (location.hostname !== PLAUSIBLE_DOMAIN) return;

    const existing = document.querySelector('script[src="https://plausible.io/js/script.js"]');
    if (existing) return;

    const s = document.createElement("script");
    s.defer = true;
    s.dataset.domain = PLAUSIBLE_DOMAIN;
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  })();

  // Contact form AJAX submit (Formspree)
  (function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const statusEl = document.getElementById("formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (statusEl) statusEl.textContent = "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          form.reset();
          if (statusEl) statusEl.textContent = "✓ Message sent. I will get back to you soon.";
        } else {
          if (statusEl) statusEl.textContent = "Could not send right now. Please email me directly.";
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = "Network error. Please try again or email me directly.";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
        }
      }
    });
  })();

  // Scroll-to-top button
  (function initScrollTop() {
    const btn = document.createElement('button');
    btn.className = 'scrollTopBtn';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    document.body.appendChild(btn);

    // Coalesce to one class write per frame instead of one per scroll event.
    let ticking = false, shown = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const next = window.scrollY > 300;
        if (next !== shown) { shown = next; btn.classList.toggle('visible', next); }
      });
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  // Reveal UI on Scroll
  (function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    // threshold 0 so sections taller than the viewport still trigger
    // (10% of a full-page section can never be on screen at once).
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(el => observer.observe(el));
  })();

})();
