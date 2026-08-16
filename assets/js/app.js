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

  // Bento pointer spotlight (tracks the cursor across each tile)
  (function initBentoSpotlight() {
    const tiles = document.querySelectorAll('.bentoTile');
    if (!tiles.length) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
    tiles.forEach(tile => {
      // pointermove fires far faster than the display refreshes; writing a
      // custom property per event forced a style recalc + repaint each time.
      let pending = null, frame = 0;
      tile.addEventListener('pointermove', (e) => {
        pending = e;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = tile.getBoundingClientRect();
          tile.style.setProperty('--mx', (pending.clientX - r.left) + 'px');
          tile.style.setProperty('--my', (pending.clientY - r.top) + 'px');
        });
      }, { passive: true });
    });
  })();

  // Spline Intro Animation Logic
  (function initSplineIntro() {
    const splineBox = document.getElementById('spline-floating-box');
    const targetBox = document.getElementById('hero-spline-target');
    const enterBtn = document.getElementById('enter-site-btn');
    const loader = document.getElementById('spline-loader');
    const viewer = document.querySelector('spline-viewer');

    const STORAGE_KEY = 'has_seen_spline_intro';

    // Helper to position spline box correctly in its hero target
    const positionInHero = (animate = true) => {
      if (!targetBox) return;
      const r = targetBox.getBoundingClientRect();
      const scrollTop = window.scrollY;

      if (!animate) splineBox.style.transition = 'none';

      splineBox.classList.add('in-footer'); // Keeping the class name as it likely has styles associated
      splineBox.style.top = (scrollTop + r.top) + 'px';
      splineBox.style.height = r.height + 'px';

      if (!animate) {
        // Force reflow and restore transition for future resizes
        splineBox.offsetHeight;
        splineBox.style.transition = '';
      }
      document.body.style.overflow = '';
    };

    // Global dismissal function called from index.html button or scroll
    window.dismissSplineIntro = function () {
      if (!splineBox || !targetBox) return;

      localStorage.setItem(STORAGE_KEY, 'true');

      // Ensure the greeting is visible and positioned correctly
      const greeting = document.getElementById('spline-greeting');
      if (greeting) {
        greeting.style.opacity = '1';
        greeting.style.transform = 'translateX(-50%) translateY(0)';
      }

      // Hide the loader immediately if it's still there
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 600);
      }

      positionInHero(true);

      // Clean up scroll/wheel listeners
      window.removeEventListener('wheel', handleScrollDismiss);
      window.removeEventListener('touchmove', handleScrollDismiss);
    };

    function handleScrollDismiss(e) {
      if (e.deltaY > 5 || (e.touches && e.touches[0])) {
        window.dismissSplineIntro();
      }
    }

    if (splineBox && targetBox) {
      // Check if user has already seen the intro
      if (localStorage.getItem(STORAGE_KEY)) {
        // Instant skip
        splineBox.style.transition = 'none';
        splineBox.classList.add('in-footer');
        if (loader) loader.style.display = 'none';

        // Wait for initial layout to settle then snap to target with the greeting visible
        setTimeout(() => {
          const greeting = document.getElementById('spline-greeting');
          if (greeting) {
            greeting.style.transition = 'none';
            greeting.style.opacity = '1';
            greeting.style.transform = 'translateX(-50%) translateY(0)';
          }
          positionInHero(false);
        }, 50);

        return;
      }

      // --- FIRST VISIT LOGIC ---
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);

      // Add scroll/wheel listeners to dismiss intro
      window.addEventListener('wheel', handleScrollDismiss, { passive: true });
      window.addEventListener('touchmove', handleScrollDismiss, { passive: true });

      if (viewer && loader) {
        // Biography facts to cycle through
        const bioFacts = [
          "Robotics & AI Engineer",
          "Expert in Multi-Camera Analytics",
          "Applied AI Developer (Python, ROS2, ML)",
          "Specialist in High-Uptime Systems"
        ];
        let factIndex = 0;
        const factElement = document.getElementById('loader-fact');

        const factInterval = setInterval(() => {
          if (!factElement || loader.style.display === 'none') {
            clearInterval(factInterval);
            return;
          }
          factElement.classList.add('fade');
          setTimeout(() => {
            factIndex = (factIndex + 1) % bioFacts.length;
            factElement.textContent = bioFacts[factIndex];
            factElement.classList.remove('fade');
          }, 400);
        }, 2500);

        viewer.addEventListener('load', () => {
          // Trigger transition once loaded
          startDismissal();
        });

        // Safety fallback: Dismiss loader after 4 seconds even if load event missed
        setTimeout(startDismissal, 4000);

        function startDismissal() {
          if (loader.dataset.dismissed) return;
          loader.dataset.dismissed = 'true';

          // 1. Start fading out loader elements
          const loaderInfo = document.getElementById('loader-info');
          const dino = document.querySelector('.dino-container');

          if (loaderInfo) {
            loaderInfo.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            loaderInfo.style.opacity = '0';
            loaderInfo.style.transform = 'translateY(-20px)';
          }
          if (dino) {
            dino.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            dino.style.opacity = '0';
            dino.style.transform = 'translateY(-20px)';
          }

          // 2. Bridge to greeting quickly (150ms overlap)
          setTimeout(() => {
            clearInterval(factInterval);

            const greeting = document.getElementById('spline-greeting');
            if (greeting) {
              greeting.style.opacity = '1';
              greeting.style.transform = 'translateX(-50%) translateY(0)';
            }

            // 3. Final fade of the dark overlay
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 1200);
          }, 150);
        }
        // Safety fallback
        setTimeout(() => {
          if (loader.style.display !== 'none') {
            clearInterval(factInterval);
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 600);
          }
        }, 10000);
      }

      // Handle resize even when in hero
      window.addEventListener('resize', () => {
        if (splineBox.classList.contains('in-footer')) {
          const r = targetBox.getBoundingClientRect();
          splineBox.style.top = (window.scrollY + r.top) + 'px';
          splineBox.style.height = r.height + 'px';
        }
      });
    }
  })();
})();
