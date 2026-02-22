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

    const PAGE_DESCRIPTIONS = {
        'index.html': "the Home page – an overview of Yash's Robotics & AI work and production impact.",
        'skills.html': "the Skills page – a deep dive into Yash's technical stack and tools.",
        'experience.html': "the Experience page – details on Yash's professional journey and workstreams.",
        'projects.html': "the Projects gallery – a showcase of Yash's key builds and research.",
        'education.html': "the Education page – Yash's academic background and Robotics degree details.",
        'contact.html': "the Contact page – ways to reach Yash via email, LinkedIn, or the form.",
        'resume.html': "the Resume page – a quick-glance version of Yash's professional CV."
    };

    const FAQ_DATA = [
        {
            keywords: ["who", "you", "yash", "bio"],
            reply: "I'm SASHA, Yash's Semantic Assistant. Yash is a Robotics & AI Engineer specializing in perception systems, MLOps, and Agentic AI. He builds complex pipelines for radar and camera vision.",
            actions: [{ label: "About Yash", href: "index.html" }]
        },
        {
            keywords: ["radar", "mmwave", "speed", "detection", "tracking", "60+ghz"],
            reply: "Yash has extensive experience with 60+GHz radar systems, building high-uptime tracking and evidence bundling for roadside enforcement. His systems achieved 50ms decision latency and 20 simultaneous target tracking.",
            actions: [{ label: "See Radar Work", href: "experience.html#sasha-radar-evidence-systems" }]
        },
        {
            keywords: ["anpr", "license", "plate", "ocr", "camera", "lpr", "vision"],
            reply: "The ANPR pipeline Yash built manages 1600+ cameras with a 10s end-to-end alert latency. It features multi-stream ingest and high OCR correctness in real-world conditions.",
            actions: [{ label: "View ANPR Projects", href: "experience.html#sasha-automatic-number-plate-recognition" }]
        },
        {
            keywords: ["vlm", "llm", "ai", "search", "qwen", "llava", "rag", "agent"],
            reply: "Yash integrates VLMs like Qwen2.5-VL for semantic CCTV search and scene understanding. He also builds RAG pipelines for technical documentation and technical decision support.",
            actions: [{ label: "Explore VLM", href: "experience.html#sasha-vlm-retrieval" }]
        },
        {
            keywords: ["plc", "scada", "automation", "industrial", "essi", "internship", "systems"],
            reply: "During his internship at ESSI Integrated Technologies, Yash worked on industrial automation including PLC programming and systems engineering for large-scale security deployments.",
            actions: [{ label: "Industrial Experience", href: "experience.html#sasha-essi-integrated-technologies" }]
        },
        {
            keywords: ["ros", "ros2", "turtlebot", "perception", "gazebo", "rviz", "simulation", "robotics"],
            reply: "Yash specializes in ROS/ROS2, notably for real-time object detection on Turtlebot 4 and building robust simulation environments using Gazebo and Rviz.",
            actions: [{ label: "Robotics Projects", href: "projects.html#sasha-object-detection-using-turtlebot-4" }]
        },
        {
            keywords: ["arduino", "esp32", "microcontroller", "embedded", "iot", "sensor", "firmware"],
            reply: "Yash builds embedded systems using ESP32 and Arduino, like his Smart Agriculture System and bio-inspired Spider Quadruped. He is fluent in Embedded C and Python-based IoT.",
            actions: [{ label: "Embedded Projects", href: "projects.html#sasha-smart-agriculture-system" }]
        },
        {
            keywords: ["agri", "agriculture", "hydroponics", "farm", "automated"],
            reply: "He developed an automated hydroponics system using ESP32 and Firebase, focusing on sensor-driven climate control and real-time data monitoring.",
            actions: [{ label: "Agri-Tech Project", href: "projects.html#sasha-smart-agriculture-system" }]
        },
        {
            keywords: ["finance", "loan", "stock", "sentiment", "trading", "fintech", "market"],
            reply: "Yash has applied ML to finance, building loan approval classifiers with XGBoost and stock predictors combining sentiment analysis with technical indicators.",
            actions: [
                { label: "Bank Loan Modelling", href: "projects.html#sasha-bank-loan-modelling" },
                { label: "Stock Predictor", href: "projects.html#sasha-stock-price-direction-predictor" }
            ]
        },
        {
            keywords: ["fitness", "openpose", "pose", "workout", "exercise", "coach"],
            reply: "Yash built an AI Fitness Trainer using OpenPose for computer vision-based pose estimation, providing personalized workout recommendations and real-time progress guidance.",
            actions: [{ label: "AI Fitness Trainer", href: "projects.html#sasha-ai-fitness-trainer" }]
        },
        {
            keywords: ["skills", "tech", "stack", "languages", "python", "c++", "docker", "fastapi"],
            reply: "Core tech: Python (FastAPI), Docker, ROS2, ML (PyTorch/TF), and Agentic AI (LangChain/RAG). He also works with C++ and Raspberry Pi/Jetson hardware.",
            actions: [{ label: "Full Skill Set", href: "skills.html" }]
        },
        {
            keywords: ["resume", "cv", "download", "hiring", "pdf", "job"],
            reply: "You can view Yash's resume online or download the official PDF version for his full work history and contact details.",
            actions: [
                { label: "View Resume", href: "resume.html" },
                { label: "Download PDF", href: "resume.pdf" }
            ]
        },
        {
            keywords: ["contact", "email", "linkedin", "reach", "message", "hire", "phone"],
            reply: "You can reach Yash via the contact form, LinkedIn (highly active), or email (yashgolani287@gmail.com). He's currently open to discussing Robotics & AI roles.",
            actions: [
                { label: "Contact Form", href: "contact.html" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/yash-golani-5556a424a" }
            ]
        },
        {
            keywords: ["projects", "portfolio", "project", "work", "build"],
            reply: "Yash has worked on diverse projects: Turtlebot object detection, Spider Mimic Quadruped, Smart Agriculture, and ML systems for Finance.",
            actions: [{ label: "View All Projects", href: "projects.html" }]
        },
        {
            keywords: ["education", "college", "degree", "university", "btech", "symbiosis", "study", "cgpa", "pune"],
            reply: "Yash is pursuing a B.Tech in Robotics and Automation at Symbiosis Institute of Technology, Pune (2022-2026) with a 7.51 CGPA.",
            actions: [{ label: "Education Details", href: "education.html" }]
        },
        {
            keywords: ["experience", "work", "history", "career", "job", "internship"],
            reply: "Yash has worked on perception systems, MLOps, and automation, including a Systems Engineering internship at ESSI and production radar deployments.",
            actions: [{ label: "Work Experience", href: "experience.html" }]
        },
        {
            keywords: ["where", "page", "current", "explain", "what", "this"],
            reply: "GENERIC_PAGE_DESCRIPTION", // Placeholder handled in routeQuery
            actions: []
        }
    ];

    const QUICK_ACTIONS = [
        { label: "Experience", href: "experience.html" },
        { label: "Education", href: "education.html" },
        { label: "Robotics Work", href: "projects.html#sasha-object-detection-using-turtlebot-4" },
        { label: "Radar Systems", href: "experience.html#sasha-radar-evidence-systems" },
        { label: "ANPR & Vision", href: "experience.html#sasha-automatic-number-plate-recognition" },
        { label: "MLOps & Platform", href: "experience.html#sasha-mlops-platform" },
        { label: "Contact Yash", href: "contact.html" }
    ];

    // --- STATE ---
    let isOpen = false;
    let history = [];
    let isTyping = false;
    let lastPage = "";

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
            lastPage = parsed.lastPage || "";
        }
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOpen, history, lastPage }));
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
          <button class="sasha-header-btn" id="sasha-clear" title="Clear Chat" aria-label="Clear Chat">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" fill="currentColor"/></svg>
          </button>
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
        panel.querySelector('#sasha-clear').onclick = clearChat;

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

    function clearChat() {
        if (confirm("Reset conversation history?")) {
            history = [];
            saveState();
            renderHistory();
            greet();
        }
    }

    function checkInitialState() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (isOpen) {
            panel.classList.add('active');
            input.focus();
        }

        if (history.length === 0 || lastPage !== currentPage) {
            greet();
            lastPage = currentPage;
            saveState();
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
        const pageDesc = PAGE_DESCRIPTIONS[currentPage];

        let greetingText = `Hi! I'm Sasha, Yash's AI assistant. I can help find specific projects, tech stack details, or navigate the site.`;

        if (pageDesc) {
            greetingText += `<br><br>You're currently on <strong>${pageDesc}</strong>`;
        }

        const greeting = `
            <div class="sasha-welcome">
                <img src="assets/images/img8.png" alt="Waving Bot" class="sasha-bot-wave">
                <div>${greetingText}<br><br>Quick Links:</div>
            </div>
        `;
        const actions = [
            { label: "Skills", href: "skills.html" },
            { label: "Experience", href: "experience.html" },
            { label: "Contact", href: "contact.html" }
        ];

        renderMessage('assistant', greeting, actions);
    }

    function handleUserInput(manualText) {
        const text = manualText || input.value.trim();
        if (!text) return;

        if (!manualText) input.value = '';
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
        const query = text.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;

        for (const item of FAQ_DATA) {
            let score = 0;
            item.keywords.forEach(k => {
                if (query === k) score += 10; // Exact match
                else if (query.includes(k)) score += 5; // Multi-word match
                else if (k.includes(query) && query.length > 3) score += 2; // Partial overlap
            });

            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch && maxScore >= 4) {
            if (bestMatch.reply === "GENERIC_PAGE_DESCRIPTION") {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const pageDesc = PAGE_DESCRIPTIONS[currentPage];
                return {
                    reply: pageDesc ? `You are looking at <strong>${pageDesc}</strong>` : "You're exploring Yash Golani's portfolio. I can help you find specific details about his work in Robotics and AI.",
                    actions: QUICK_ACTIONS
                };
            }
            return bestMatch;
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
