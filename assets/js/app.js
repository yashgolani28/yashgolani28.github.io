// Project grid layout logic
window.addEventListener("load", function () {
  var grid = document.querySelector('.grid2');
  if (grid) {
    function setGridColumns() {
      if (window.innerWidth > 900) {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '32px 24px';
      } else {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '1fr';
        grid.style.gap = '32px 24px';
      }
    }
    setGridColumns();
    window.addEventListener('resize', setGridColumns);
  }
});
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

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  (function initExperienceConstellation() {
    const container = document.getElementById('xpConstellation');
    if (!container) return;

    const nodesStage = document.getElementById('xpNodes');
    const edgesSvg = container.querySelector('.xpEdges');
    const nodes = container.querySelectorAll('.xpNode');
    const pills = container.querySelectorAll('.xpPill');
    const legendPills = container.querySelectorAll('.xpLegendPill');
    const projectTitle = document.getElementById('xpProjectTitle');
    const projectBlurb = document.getElementById('xpProjectBlurb');
    const PROJECTS = {
      overview: {
        title: "Overview",
        blurb: "Pick a project to reveal its tool flow.",
        nodes: ["python", "flask", "fastapi", "react", "opencv", "postgres", "docker", "kafka", "redis", "linux", "ffmpeg", "yolo", "vlm", "git", "pytorch", "celery", "sqlalchemy", "qdrant", "langchain", "leaflet", "gitlab"],
        layout: {
          // Central Vertical Spine (5 nodes)
          linux: { x: 50, y: 15, z: 10 },
          python: { x: 50, y: 32, z: 5 },
          docker: { x: 50, y: 50, z: 0 },
          react: { x: 50, y: 68, z: 5 },
          fastapi: { x: 50, y: 85, z: 10 },
          // Left Wing (8 nodes)
          gitlab: { x: 25, y: 20, z: -10 },
          git: { x: 35, y: 30, z: -5 },
          yolo: { x: 20, y: 40, z: -15 },
          ffmpeg: { x: 30, y: 50, z: -8 },
          opencv: { x: 20, y: 60, z: -12 },
          flask: { x: 35, y: 70, z: -5 },
          pytorch: { x: 25, y: 80, z: -10 },
          vlm: { x: 15, y: 50, z: -20 },
          // Right Wing (8 nodes)
          leaflet: { x: 75, y: 20, z: -10 },
          sqlalchemy: { x: 65, y: 30, z: -5 },
          kafka: { x: 80, y: 40, z: -15 },
          celery: { x: 70, y: 50, z: -8 },
          redis: { x: 80, y: 60, z: -12 },
          postgres: { x: 65, y: 70, z: -5 },
          langchain: { x: 75, y: 80, z: -10 },
          qdrant: { x: 85, y: 50, z: -20 }
        },
        edges: [
          ["python", "flask"], ["python", "fastapi"], ["python", "opencv"], ["python", "postgres"],
          ["fastapi", "docker"], ["docker", "linux"], ["kafka", "redis"], ["ffmpeg", "opencv"],
          ["celery", "redis"], ["langchain", "qdrant"], ["react", "leaflet"], ["python", "pytorch"]
        ]
      },
      radar: {
        title: "Radar and evidence",
        blurb: "Tracking stability, calibration alignment, evidence bundling.",
        nodes: ["ffmpeg", "opencv", "python", "flask", "postgres", "yolo", "kafka", "linux"],
        layout: {
          linux: { x: 12.5, y: 50, z: 0 },
          ffmpeg: { x: 27.5, y: 35, z: 5 },
          opencv: { x: 27.5, y: 65, z: -5 },
          yolo: { x: 42.5, y: 50, z: 10 },
          python: { x: 57.5, y: 50, z: 0 },
          kafka: { x: 72.5, y: 35, z: 5 },
          flask: { x: 72.5, y: 65, z: -5 },
          postgres: { x: 87.5, y: 50, z: 0 }
        },
        edges: [
          ["linux", "ffmpeg"], ["linux", "opencv"], ["ffmpeg", "yolo"], ["opencv", "yolo"], ["yolo", "python"], ["python", "kafka"], ["python", "flask"], ["python", "postgres"]
        ],
        focusSection: "ws-radar"
      },
      anpr: {
        title: "ANPR System",
        blurb: "RTSP ingest, OCR correctness, PTZ operational control.",
        nodes: ["ffmpeg", "opencv", "python", "postgres", "kafka", "redis", "gitlab", "docker", "fastapi", "pytorch"],
        layout: {
          gitlab: { x: 12.5, y: 30, z: -5 },
          docker: { x: 12.5, y: 70, z: 5 },
          ffmpeg: { x: 27.5, y: 50, z: 0 },
          opencv: { x: 42.5, y: 35, z: -10 },
          pytorch: { x: 42.5, y: 65, z: 10 },
          python: { x: 57.5, y: 50, z: 0 },
          fastapi: { x: 72.5, y: 30, z: 5 },
          kafka: { x: 72.5, y: 50, z: 0 },
          redis: { x: 72.5, y: 70, z: -5 },
          postgres: { x: 87.5, y: 50, z: 0 }
        },
        edges: [
          ["gitlab", "docker"], ["docker", "ffmpeg"], ["ffmpeg", "opencv"], ["ffmpeg", "pytorch"], ["opencv", "python"], ["pytorch", "python"], ["python", "fastapi"], ["python", "kafka"], ["kafka", "redis"], ["python", "postgres"]
        ],
        focusSection: "ws-anpr"
      },
      mlops: {
        title: "MLOps Platform",
        blurb: "Pipelines, job controls, dataset and ops hygiene.",
        nodes: ["kafka", "redis", "docker", "postgres", "git", "linux", "python", "fastapi", "celery", "sqlalchemy", "yolo"],
        layout: {
          git: { x: 12.5, y: 30, z: 0 },
          linux: { x: 12.5, y: 70, z: 0 },
          docker: { x: 27.5, y: 50, z: 5 },
          python: { x: 42.5, y: 50, z: 0 },
          yolo: { x: 42.5, y: 75, z: 10 },
          fastapi: { x: 57.5, y: 35, z: -5 },
          celery: { x: 57.5, y: 65, z: 5 },
          kafka: { x: 72.5, y: 35, z: 0 },
          redis: { x: 72.5, y: 65, z: 0 },
          sqlalchemy: { x: 72.5, y: 85, z: -5 },
          postgres: { x: 87.5, y: 60, z: 0 }
        },
        edges: [
          ["git", "docker"], ["linux", "docker"], ["docker", "python"], ["python", "fastapi"], ["python", "celery"], ["python", "yolo"], ["fastapi", "kafka"], ["fastapi", "sqlalchemy"], ["celery", "redis"], ["sqlalchemy", "postgres"]
        ],
        focusSection: "ws-mlops"
      },
      vlm: {
        title: "VLM CCTV search",
        blurb: "VLM pipeline, retrieval, latency control.",
        nodes: ["vlm", "python", "docker", "postgres", "fastapi", "qdrant", "langchain", "celery", "redis", "pytorch", "sqlalchemy"],
        layout: {
          pytorch: { x: 12.5, y: 30, z: -10 },
          vlm: { x: 12.5, y: 70, z: 10 },
          python: { x: 27.5, y: 50, z: 0 },
          langchain: { x: 42.5, y: 35, z: 5 },
          celery: { x: 42.5, y: 65, z: -5 },
          qdrant: { x: 57.5, y: 35, z: 15 },
          redis: { x: 57.5, y: 65, z: -15 },
          fastapi: { x: 72.5, y: 35, z: 5 },
          sqlalchemy: { x: 72.5, y: 65, z: -5 },
          postgres: { x: 87.5, y: 50, z: 0 },
          docker: { x: 27.5, y: 80, z: -5 }
        },
        edges: [
          ["pytorch", "python"], ["vlm", "python"], ["python", "langchain"], ["python", "celery"], ["langchain", "qdrant"], ["celery", "redis"], ["qdrant", "fastapi"], ["redis", "fastapi"], ["fastapi", "sqlalchemy"], ["sqlalchemy", "postgres"], ["docker", "python"]
        ],
        focusSection: "ws-vlm"
      },
      'command-centre': {
        title: "GIS & Command Centre",
        blurb: "Emergency response system dispatcher with real-time radio device tracking and GIS mapping.",
        nodes: ["python", "fastapi", "react", "postgres", "redis", "leaflet", "sqlalchemy"],
        layout: {
          react: { x: 14, y: 50, z: 10 },
          leaflet: { x: 29, y: 30, z: 0 },
          fastapi: { x: 44, y: 50, z: 0 },
          python: { x: 59, y: 50, z: 0 },
          sqlalchemy: { x: 74, y: 35, z: -5 },
          redis: { x: 74, y: 65, z: 5 },
          postgres: { x: 86, y: 50, z: 0 }
        },
        edges: [
          ["react", "leaflet"], ["leaflet", "fastapi"], ["fastapi", "python"], ["python", "sqlalchemy"], ["sqlalchemy", "postgres"], ["python", "redis"]
        ],
        focusSection: "ws-command-centre"
      }
    };


    let currentProject = 'overview';

    function createEdges(edgeList, isProjectMode) {
      // Keep definitions but clear old paths
      const markers = edgesSvg.querySelector('defs');
      edgesSvg.innerHTML = '';
      if (markers) edgesSvg.appendChild(markers);

      edgeList.forEach(([fromId, toId]) => {
        const fromNode = PROJECTS[currentProject].layout[fromId];
        const toNode = PROJECTS[currentProject].layout[toId];

        if (fromNode && toNode) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;

          const offset = 4;
          const qx = midX - (dy * offset / 100);
          const qy = midY + (dx * offset / 100);

          path.setAttribute('d', `M ${fromNode.x} ${fromNode.y} Q ${qx} ${qy} ${toNode.x} ${toNode.y}`);
          path.classList.add('xpEdge');
          if (isProjectMode) {
            path.classList.add('is-flow');
            path.setAttribute('marker-end', 'url(#xpArrow)');
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              path.classList.add('is-animate');
            }
          }
          edgesSvg.appendChild(path);
        }
      });
    }

    function renderConstellation(projectId) {
      currentProject = projectId;
      const project = PROJECTS[projectId];
      const isOverview = projectId === 'overview';

      container.classList.remove('mode-overview', 'mode-project');
      container.classList.add(isOverview ? 'mode-overview' : 'mode-project');
      container.dataset.mode = isOverview ? 'overview' : 'project';

      projectTitle.textContent = project.title;
      projectBlurb.textContent = project.blurb;

      pills.forEach(pill => {
        const isActive = pill.dataset.project === projectId;
        pill.classList.toggle('is-active', isActive);
        pill.setAttribute('aria-selected', isActive);
      });

      nodes.forEach(node => {
        const nodeId = node.dataset.node;
        const pos = project.layout[nodeId] || PROJECTS.overview.layout[nodeId];

        node.style.setProperty('--x', pos.x);
        node.style.setProperty('--y', pos.y);

        const isActive = project.nodes.includes(nodeId);
        node.classList.toggle('is-active', isActive && !isOverview);
        node.classList.toggle('is-dim', !isActive);

        if (isOverview) {
          node.style.display = 'flex';
        }
      });

      createEdges(project.edges, !isOverview);
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        renderConstellation(pill.dataset.project);
      });
    });

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        const nodeProject = node.dataset.cluster.split(' ')[0];
        if (currentProject === 'overview') {
          renderConstellation(nodeProject);
          const sectionId = PROJECTS[nodeProject].focusSection;
          document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        } else {
          const sectionId = PROJECTS[currentProject].focusSection;
          document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }
      });

      node.addEventListener('mouseenter', () => {
        if (node.classList.contains('is-dim')) return;
        node.style.zIndex = "20";
      });
      node.addEventListener('mouseleave', () => {
        node.style.zIndex = "";
      });
    });

    legendPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const targetId = pill.dataset.target;
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
      });
    });

    function handleResize() {
      const isMobile = window.innerWidth <= 820;
      const stage = container.querySelector('.xpConstellationStage');

      if (isMobile) {
        stage.classList.add('is-mobile-grid');
      } else {
        stage.classList.remove('is-mobile-grid');
      }

      renderConstellation(currentProject);
    }

    window.addEventListener('resize', () => {
      requestAnimationFrame(handleResize);
    });

    handleResize();
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
