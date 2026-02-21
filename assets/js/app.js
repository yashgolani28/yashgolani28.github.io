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

  // Highlight current nav item
  const path = location.pathname.split("/").pop() || "index.html";
  const current = document.querySelector(`.navLinks a[href="${path}"]`);
  if (current) current.setAttribute("aria-current", "page");

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
          if (statusEl) statusEl.textContent = "Message sent. I will get back to you soon.";
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

  // Reveal UI on Scroll
  (function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
  })();

  // Magnetic Buttons
  (function initMagnetic() {
    const wrappers = document.querySelectorAll(".magnetic-wrap");
    wrappers.forEach(wrap => {
      const btn = wrap.querySelector(".btn");
      if (!btn) return;

      wrap.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = wrap.getBoundingClientRect();
        const x = (e.clientX - (left + width / 2)) * 0.35;
        const y = (e.clientY - (top + height / 2)) * 0.35;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });

      wrap.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  })();
})();
