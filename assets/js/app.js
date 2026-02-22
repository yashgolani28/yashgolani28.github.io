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
        nodes: ["python", "flask", "fastapi", "opencv", "postgres", "docker", "kafka", "redis", "linux", "ffmpeg", "yolo", "vlm", "git"],
        layout: {
          python: { x: 50, y: 50 },
          linux: { x: 50, y: 5 },
          vlm: { x: 82, y: 18 },
          kafka: { x: 95, y: 50 },
          postgres: { x: 82, y: 82 },
          fastapi: { x: 50, y: 95 },
          flask: { x: 18, y: 82 },
          ffmpeg: { x: 5, y: 50 },
          yolo: { x: 18, y: 18 },
          docker: { x: 73, y: 40 },
          redis: { x: 73, y: 60 },
          opencv: { x: 27, y: 60 },
          git: { x: 27, y: 40 }
        },
        edges: [
          ["python", "flask"], ["python", "fastapi"], ["python", "opencv"], ["python", "postgres"],
          ["fastapi", "docker"], ["docker", "linux"], ["kafka", "redis"], ["ffmpeg", "opencv"]
        ]
      },
      radar: {
        title: "Radar and evidence",
        blurb: "Tracking stability, calibration alignment, evidence bundling.",
        nodes: ["ffmpeg", "opencv", "python", "flask", "postgres", "yolo"],
        layout: {
          ffmpeg: { x: 18, y: 40 },
          opencv: { x: 34, y: 40 },
          yolo: { x: 34, y: 58 },
          python: { x: 52, y: 48 },
          flask: { x: 68, y: 40 },
          postgres: { x: 80, y: 52 }
        },
        edges: [
          ["ffmpeg", "opencv"], ["opencv", "python"], ["yolo", "python"], ["python", "flask"], ["python", "postgres"]
        ],
        focusSection: "ws-radar"
      },
      anpr: {
        title: "Multi-camera + PTZ + ANPR",
        blurb: "RTSP ingest, OCR correctness, PTZ operational control.",
        nodes: ["ffmpeg", "opencv", "python", "postgres", "kafka", "redis"],
        layout: {
          ffmpeg: { x: 18, y: 44 },
          opencv: { x: 34, y: 44 },
          python: { x: 50, y: 44 },
          postgres: { x: 72, y: 44 },
          kafka: { x: 50, y: 64 },
          redis: { x: 68, y: 64 }
        },
        edges: [
          ["ffmpeg", "opencv"], ["opencv", "python"], ["python", "postgres"], ["python", "kafka"], ["kafka", "redis"]
        ],
        focusSection: "ws-anpr"
      },
      mlops: {
        title: "Platform + MLOps",
        blurb: "Pipelines, job controls, dataset and ops hygiene.",
        nodes: ["kafka", "redis", "docker", "postgres", "git", "linux", "python", "fastapi"],
        layout: {
          git: { x: 18, y: 34 },
          linux: { x: 18, y: 54 },
          docker: { x: 34, y: 44 },
          python: { x: 50, y: 44 },
          fastapi: { x: 64, y: 44 },
          kafka: { x: 64, y: 62 },
          redis: { x: 80, y: 62 },
          postgres: { x: 80, y: 44 }
        },
        edges: [
          ["python", "fastapi"], ["fastapi", "kafka"], ["kafka", "redis"], ["fastapi", "postgres"],
          ["docker", "fastapi"], ["git", "docker"], ["linux", "docker"]
        ],
        focusSection: "ws-mlops"
      },
      vlm: {
        title: "VLM CCTV search",
        blurb: "VLM pipeline, retrieval, latency control.",
        nodes: ["vlm", "python", "docker", "postgres", "fastapi"],
        layout: {
          vlm: { x: 22, y: 46 },
          python: { x: 40, y: 46 },
          docker: { x: 56, y: 32 },
          fastapi: { x: 62, y: 46 },
          postgres: { x: 80, y: 46 }
        },
        edges: [
          ["vlm", "python"], ["python", "fastapi"], ["fastapi", "postgres"], ["docker", "fastapi"]
        ],
        focusSection: "ws-vlm"
      }
    };

    let currentProject = 'overview';

    function createEdges(edgeList, isProjectMode) {
      // Keep definitions but clear old paths
      const defs = edgesSvg.querySelector('defs');
      edgesSvg.innerHTML = '';
      if (defs) edgesSvg.appendChild(defs);

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
})();
