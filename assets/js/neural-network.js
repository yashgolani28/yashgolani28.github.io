/**
 * Neural Network 3D Background (Particle Style)
 * High-performance particle network with dynamic connections 
 * and mouse-responsive interactions.
 */
(function initNeuralNetwork() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Respect the user's motion preference - a decorative background is not
    // worth a continuous render loop for someone who asked for less motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // --- CONFIG ---
    // Scale the field to the device. The connection pass is O(cells), but the
    // per-frame integration and the GPU line upload still scale with count.
    const particleCount = window.innerWidth < 700 ? 160
        : window.innerWidth < 1200 ? 300
        : 460;
    const maxConnectionDistance = 6.5;
    const particleSize = 0.08;
    
    // Theme-based parameters
    const getThemeParams = () => {
        const root = document.documentElement;
        const isDark = root.getAttribute('data-theme') !== 'light';
        const rootStyle = getComputedStyle(root);
        let accent = rootStyle.getPropertyValue('--accent').trim() || (isDark ? '#e0e4eb' : '#20242c');
        
        return {
            color: new THREE.Color(accent),
            lineBlending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
            lineOpacity: isDark ? 0.12 : 0.08,
            particleOpacity: isDark ? 0.8 : 0.6
        };
    };

    let theme = getThemeParams();

    // --- SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 15; // Further back to see the giant network

    // Bounds derived from the camera frustum so the field always fills
    // the whole viewport (full width on wide screens, not just the center).
    const SPREAD_Z = 30;
    let boundX = 12, boundY = 12;
    function computeBounds() {
        const visibleH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
        boundY = (visibleH / 2) + 4;            // small margin past the edge
        boundX = (visibleH * camera.aspect / 2) + 4;
    }
    computeBounds();

    // --- OBJECTS ---
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2 * boundX;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * boundY;
        positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - (SPREAD_Z / 2);

        velocities.push({
            x: (Math.random() - 0.5) * 0.03,
            y: (Math.random() - 0.5) * 0.03,
            z: (Math.random() - 0.5) * 0.03
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: theme.color,
        size: particleSize,
        transparent: true,
        opacity: theme.particleOpacity
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const lineMaterial = new THREE.LineBasicMaterial({
        color: theme.color,
        transparent: true,
        opacity: theme.lineOpacity,
        blending: theme.lineBlending
    });
    
    // Single preallocated line buffer. The old code built a fresh
    // BufferGeometry every frame and disposed the previous one, which churned
    // the GC and re-uploaded a new GPU buffer 60x a second.
    const MAX_LINES = particleCount * 12;
    const linePositions = new Float32Array(MAX_LINES * 6);
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    if (THREE.DynamicDrawUsage !== undefined) linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute('position', linePosAttr);
    lineGeo.setDrawRange(0, 0);
    const lines = new THREE.LineSegments(lineGeo, lineMaterial);
    lines.frustumCulled = false;
    scene.add(lines);

    // --- SPATIAL HASH ---
    // Nearby-node search was a full O(n^2) sweep (~106k checks/frame at 460
    // particles). Bin into a uniform grid of maxConnectionDistance-sized cells
    // and only compare against the 13 forward neighbour cells.
    const CELL = maxConnectionDistance;
    const cellMap = new Map();
    const cellKey = (cx, cy, cz) => (cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791);
    const NEIGHBOURS = [];
    for (let ox = -1; ox <= 1; ox++)
        for (let oy = -1; oy <= 1; oy++)
            for (let oz = -1; oz <= 1; oz++)
                if (ox > 0 || (ox === 0 && (oy > 0 || (oy === 0 && oz >= 0)))) NEIGHBOURS.push([ox, oy, oz]);

    // --- INTERACTION ---
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        computeBounds();
    });

    // Theme Switch
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            // Tiny delay to ensure CSS variables have updated
            setTimeout(() => {
                theme = getThemeParams();
                
                material.color.set(theme.color);
                material.opacity = theme.particleOpacity;
                
                lineMaterial.color.set(theme.color);
                lineMaterial.blending = theme.lineBlending;
                lineMaterial.opacity = theme.lineOpacity;
                lineMaterial.needsUpdate = true;
            }, 50);
        });
    }

    // --- ANIMATION ---
    // Gate the loop: no work while the hero is scrolled away or the tab is
    // backgrounded. Previously this ran for the whole session on every page.
    let visible = true, running = false, rafId = 0;

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            visible ? start() : stop();
        }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : (visible && start());
    });

    function start() { if (!running) { running = true; rafId = requestAnimationFrame(animate); } }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    function animate() {
        if (!running) return;
        rafId = requestAnimationFrame(animate);

        const pos = particles.geometry.attributes.position.array;
        cellMap.clear();

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const v = velocities[i];

            pos[i3] += v.x;
            pos[i3 + 1] += v.y;
            pos[i3 + 2] += v.z;

            // Bounds check (aspect-aware so the field fills the viewport)
            if (pos[i3] > boundX || pos[i3] < -boundX) v.x *= -1;
            if (pos[i3 + 1] > boundY || pos[i3 + 1] < -boundY) v.y *= -1;
            if (pos[i3 + 2] > 0 || pos[i3 + 2] < -15) v.z *= -1;

            // Bin into the spatial hash for the connection pass below
            const key = cellKey(
                Math.floor(pos[i3] / CELL),
                Math.floor(pos[i3 + 1] / CELL),
                Math.floor(pos[i3 + 2] / CELL)
            );
            const bucket = cellMap.get(key);
            bucket ? bucket.push(i) : cellMap.set(key, [i]);
        }

        // Connect nearby nodes, own cell + forward-neighbour cells only
        const maxDistSq = maxConnectionDistance * maxConnectionDistance;
        let n = 0;

        for (const [, bucket] of cellMap) {
            for (let a = 0; a < bucket.length; a++) {
                const i = bucket[a], i3 = i * 3;
                const xi = pos[i3], yi = pos[i3 + 1], zi = pos[i3 + 2];
                const cx = Math.floor(xi / CELL), cy = Math.floor(yi / CELL), cz = Math.floor(zi / CELL);

                for (let nb = 0; nb < NEIGHBOURS.length; nb++) {
                    const o = NEIGHBOURS[nb];
                    const self = o[0] === 0 && o[1] === 0 && o[2] === 0;
                    const other = self ? bucket : cellMap.get(cellKey(cx + o[0], cy + o[1], cz + o[2]));
                    if (!other) continue;

                    for (let b = self ? a + 1 : 0; b < other.length; b++) {
                        const j3 = other[b] * 3;
                        const dx = xi - pos[j3], dy = yi - pos[j3 + 1], dz = zi - pos[j3 + 2];
                        if (dx * dx + dy * dy + dz * dz >= maxDistSq) continue;
                        if (n >= MAX_LINES) break;

                        const w = n * 6;
                        linePositions[w] = xi; linePositions[w + 1] = yi; linePositions[w + 2] = zi;
                        linePositions[w + 3] = pos[j3];
                        linePositions[w + 4] = pos[j3 + 1];
                        linePositions[w + 5] = pos[j3 + 2];
                        n++;
                    }
                }
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        linePosAttr.needsUpdate = true;
        lineGeo.setDrawRange(0, n * 2);

        // Mouse tilt
        targetRotationY = mouseX * 0.0003;
        targetRotationX = mouseY * 0.0003;

        scene.rotation.y += 0.05 * (targetRotationY - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetRotationX - scene.rotation.x);

        renderer.render(scene, camera);
    }

    start();
})();
