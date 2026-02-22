/**
 * SASHA: Semantic Assistant for Search, Help, and Actions
 * A vanilla JS chatbot for portfolio FAQ and navigation.
 */

(function () {
    // --- CONFIG & DATA ---
    const BOT_NAME = "SASHA";
    const FULL_NAME = "Semantic Assistant for Search, Help, and Actions";
    const TAGLINE = "Site Guide & FAQ";
    const STORAGE_KEY = "sasha_data";
    const MAX_HISTORY = 30;

    const FAQ_DATA = [
        {
            keywords: ["who", "you", "about"],
            reply: "I'm SASHA, Yash's Semantic Assistant. Yash is a Robotics & AI Engineer specializing in perception systems, MLOps, and Agentic AI.",
            actions: [{ label: "About Yash", href: "index.html" }]
        },
        {
            keywords: ["radar", "mmwave", "speed", "detection", "tracking"],
            reply: "Yash has extensive experience with radar systems, specifically building high-uptime tracking and evidence bundling for roadside enforcement. His systems achieved 50ms decision latency.",
            actions: [{ label: "See Radar Work", href: "experience.html#sasha-radar-and-evidence-systems" }]
        },
        {
            keywords: ["anpr", "license", "plate", "ocr", "camera"],
            reply: "The ANPR pipeline Yash built manages 1600+ cameras with a 10s end-to-end alert latency. It includes PTZ control and high OCR correctness.",
            actions: [{ label: "View ANPR Projects", href: "experience.html#sasha-automatic-number-plate-recognition" }]
        },
        {
            keywords: ["vlm", "llm", "ai", "search", "qwen", "llava"],
            reply: "Yash integrates VLMs like Qwen2.5-VL for semantic CCTV search and scene understanding, focusing on bounded latency and retrieval accuracy.",
            actions: [{ label: "Explore VLM", href: "experience.html#sasha-vlm-and-retrieval" }]
        },
        {
            keywords: ["skills", "tech", "stack", "languages", "python"],
            reply: "Core tech: Python, FastAPI, Docker, ROS2, ML (PyTorch/TF), and Agentic AI (LangChain/RAG).",
            actions: [{ label: "Full Skill Set", href: "skills.html" }]
        },
        {
            keywords: ["resume", "cv", "download", "hiring"],
            reply: "You can view Yash's resume online or download the PDF version.",
            actions: [
                { label: "View Resume", href: "resume.html" },
                { label: "Download PDF", href: "resume.pdf" }
            ]
        },
        {
            keywords: ["contact", "email", "linkedin", "reach", "message"],
            reply: "You can reach Yash via the contact form, LinkedIn, or email (yashgolani287@gmail.com).",
            actions: [
                { label: "Contact Form", href: "contact.html" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/yash-golani-5556a424a" }
            ]
        },
        {
            keywords: ["projects", "portfolio", "project"],
            reply: "Yash has worked on diverse projects: Turtlebot object detection, Spider Mimic Quadruped, Smart Agriculture, and more.",
            actions: [{ label: "View All Projects", href: "projects.html" }]
        },
        {
            keywords: ["education", "college", "degree", "university", "btech", "symbiosis", "study", "cgpa"],
            reply: "Yash is pursuing a B.Tech in Robotics and Automation at Symbiosis Institute of Technology, Pune (2022-2026). He has a CGPA of 7.51.",
            actions: [{ label: "Education Details", href: "education.html" }]
        },
        {
            keywords: ["experience", "work", "history", "career", "job", "essi", "essi integrated technologies", "internship"],
            reply: "Yash has worked on perception systems, MLOps, and automation, including a Systems Engineering internship at ESSI Integrated Technologies.",
            actions: [{ label: "Work Experience", href: "experience.html" }]
        }
    ];

    const QUICK_ACTIONS = [
        { label: "Experience", href: "experience.html" },
        { label: "Education", href: "education.html" },
        { label: "Best projects", href: "projects.html" },
        { label: "Show radar work", href: "experience.html#sasha-radar-and-evidence-systems" },
        { label: "Show ANPR", href: "experience.html#sasha-automatic-number-plate-recognition" },
        { label: "Download resume", href: "resume.pdf" },
        { label: "Contact Yash", href: "contact.html" }
    ];

    // --- STATE ---
    let isOpen = false;
    let history = [];
    let isTyping = false;

    // --- UI ELEMENTS ---
    let fab, panel, messagesContainer, input, sendBtn;

    // --- INITIALIZATION ---
    function init() {
        loadState();
        ensureHeadingIds();
        createUI();
        renderHistory();
        checkInitialState();
        handleHashHighlight();
    }

    function loadState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            isOpen = parsed.isOpen || false;
            history = parsed.history || [];
        }
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOpen, history }));
    }

    function ensureHeadingIds() {
        const main = document.querySelector('main');
        if (!main) return;
        const headings = main.querySelectorAll('h1, h2, h3');
        headings.forEach(h => {
            if (!h.id) {
                const slug = h.innerText.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();
                h.id = `sasha-${slug}`;
            }
        });
    }

    function createUI() {
        // FAB
        fab = document.createElement('button');
        fab.className = 'sasha-fab';
        fab.setAttribute('aria-label', 'Open SASHA Assistant');
        fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M22,9L22,9c0-1.1-0.9-2-2-2h-3c0-2.21-1.79-4-4-4S9,4.79,9,7H6C4.9,7,4,7.9,4,9L4,9c-1.1,0-2,0.9-2,2v2c0,1.1,0.9,2,2,2v4 c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-4c1.1,0,2-0.9,2-2v-2C24,9.9,23.1,9,22,9z M12,5c1.1,0,2,0.9,2,2h-4C10,5.9,10.9,5,12,5z M18,17H6v-6h12V17z M9,12c-0.55,0-1,0.45-1,1s0.45,1,1,1s1-0.45,1-1S9.55,12,9,12z M15,12c-0.55,0-1,0.45-1,1s0.45,1,1,1s1-0.45,1-1S15.55,12,15,12z M6,12 c-0.55,0-1,0.45-1,1c0,0.55,0.45,1,1,1h0c0.55,0,1-0.45,1-1C7,12.45,6.55,12,6,12z M18,12c-0.55,0-1,0.45-1,1c0,0.55,0.45,1,1,1h0 c0.55,0,1-0.45,1-1C19,12.45,18.55,12,18,12z"/></svg>`;
        fab.onclick = toggle;
        document.body.appendChild(fab);

        // Panel
        panel = document.createElement('div');
        panel.className = 'sasha-panel';
        panel.innerHTML = `
      <div class="sasha-header">
        <div class="sasha-header-info">
          <span class="sasha-name">${BOT_NAME}</span>
          <span class="sasha-acronym" title="${FULL_NAME}">${TAGLINE}</span>
        </div>
        <div class="sasha-header-actions">
          <button class="sasha-header-btn" id="sasha-close" aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>
      <div class="sasha-messages" id="sasha-messages"></div>
      <div class="sasha-typing" id="sasha-typing">Sasha is thinking...</div>
      <form class="sasha-input-area" id="sasha-form">
        <input type="text" class="sasha-input" id="sasha-input" placeholder="Ask about Yash or site sections..." autocomplete="off">
        <button type="submit" class="sasha-send" id="sasha-send" disabled aria-label="Send">
          <svg viewBox="0 0 24 24" width="24" height="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/></svg>
        </button>
      </form>
      <div class="sasha-footer">
        <span class="sasha-fullname">${FULL_NAME}</span>
      </div>
    `;
        document.body.appendChild(panel);

        messagesContainer = panel.querySelector('#sasha-messages');
        input = panel.querySelector('#sasha-input');
        sendBtn = panel.querySelector('#sasha-send');
        const form = panel.querySelector('#sasha-form');

        panel.querySelector('#sasha-close').onclick = close;

        input.oninput = () => { sendBtn.disabled = !input.value.trim(); };
        form.onsubmit = (e) => {
            e.preventDefault();
            handleUserInput();
        };

        // Accessibility: Esc key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) close();
        });
    }

    function checkInitialState() {
        if (isOpen) {
            panel.classList.add('active');
            input.focus();
        }
        if (history.length === 0) {
            greet();
        }
    }

    function toggle() {
        isOpen ? close() : open();
    }

    function open() {
        isOpen = true;
        panel.classList.add('active');
        input.focus();
        saveState();
    }

    function close() {
        isOpen = false;
        panel.classList.remove('active');
        saveState();
    }

    function greet() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        let greeting = "Hi! I'm Sasha, Yash's AI assistant. I can help find specific projects, tech stack details, or navigate you to the right page.";
        let actions = [...QUICK_ACTIONS];

        if (currentPage === 'projects.html') {
            greeting = "Hi! You're viewing Yash's projects. Want to see something specific like 'Robotics', 'Computer Vision', or 'ML'?";
            actions = [
                { label: "Robotics Projects", href: "projects.html#sasha-object-detection-using-turtlebot-4" },
                { label: "Vision Projects", href: "projects.html#sasha-traffic-vlm" },
                ...QUICK_ACTIONS.slice(2)
            ];
        } else if (currentPage === 'experience.html') {
            greeting = "Hi! Exploring Yash's work experience? I can jump you to specific workstreams like Radar, ANPR, or MLOps.";
            actions = [
                { label: "Radar Workstream", href: "experience.html#sasha-radar-and-evidence-systems" },
                { label: "ANPR Workstream", href: "experience.html#sasha-automatic-number-plate-recognition" },
                ...QUICK_ACTIONS.slice(2)
            ];
        }

        renderMessage('assistant', greeting, actions);
    }

    function handleUserInput() {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        sendBtn.disabled = true;
        renderMessage('user', text);

        // Process query
        showTyping(true);
        setTimeout(() => {
            const response = routeQuery(text);
            showTyping(false);
            renderMessage('assistant', response.reply, response.actions);
        }, 600);
    }

    function routeQuery(text) {
        text = text.toLowerCase();

        // Simple keyword matching
        for (const item of FAQ_DATA) {
            if (item.keywords.some(k => text.includes(k))) {
                return item;
            }
        }

        return {
            reply: "I'm not quite sure about that. Try asking about 'radar', 'ANPR', 'projects', or Yash's 'tech stack'.",
            actions: QUICK_ACTIONS
        };
    }

    function renderMessage(role, text, actions = []) {
        const msg = { role, text, actions, timestamp: Date.now() };
        if (role !== 'system') { // history only for user/assistant
            history.push(msg);
            if (history.length > MAX_HISTORY) history.shift();
            saveState();
        }

        appendMessageToUI(msg);
    }

    function appendMessageToUI(msg) {
        const msgEl = document.createElement('div');
        msgEl.className = `sasha-msg sasha-msg-${msg.role}`;
        msgEl.innerHTML = `<div>${msg.text}</div>`;

        if (msg.actions && msg.actions.length > 0) {
            const actionsEl = document.createElement('div');
            actionsEl.className = 'sasha-actions';
            msg.actions.forEach(act => {
                const btn = document.createElement('button');
                btn.className = 'sasha-action-btn';
                btn.innerText = act.label;
                btn.onclick = () => handleAction(act);
                actionsEl.appendChild(btn);
            });
            msgEl.appendChild(actionsEl);
        }

        messagesContainer.appendChild(msgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function renderHistory() {
        messagesContainer.innerHTML = '';
        history.forEach(appendMessageToUI);
    }

    function showTyping(show) {
        isTyping = show;
        panel.querySelector('#sasha-typing').classList.toggle('active', show);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function handleAction(action) {
        if (action.href.startsWith('http') || action.href.endsWith('.pdf')) {
            window.open(action.href, '_blank');
            return;
        }

        const [page, hash] = action.href.split('#');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (page && page !== currentPage) {
            window.location.href = action.href;
        } else if (hash) {
            navigateToHash(hash);
        }
    }

    function navigateToHash(hash) {
        const target = document.getElementById(hash);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            target.classList.add('sasha-highlight');
            setTimeout(() => target.classList.remove('sasha-highlight'), 2000);
            if (!window.location.hash.includes(hash)) {
                history.replaceState(null, null, `#${hash}`);
            }
        }
    }

    function handleHashHighlight() {
        const hash = window.location.hash.substring(1);
        if (hash && hash.startsWith('sasha-')) {
            setTimeout(() => navigateToHash(hash), 500);
        }
    }

    // --- START ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
