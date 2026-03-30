/**
 * Neural Network 3D Background (Particle Style)
 * High-performance particle network with dynamic connections 
 * and mouse-responsive interactions.
 */
(function initNeuralNetwork() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // --- CONFIG ---
    const particleCount = 400; // More particles to fill the larger volume
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

    // --- OBJECTS ---
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const SPREAD_X = 50; 
    const SPREAD_Y = 50;
    const SPREAD_Z = 30;

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;     
        positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y; 
        positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - (SPREAD_Z/2); 
        
        velocities.push({
            x: (Math.random() - 0.5) * 0.03, // Slightly faster for larger volume
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
    
    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    // --- INTERACTION ---
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
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
    function animate() {
        requestAnimationFrame(animate);

        const positionsArray = particles.geometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particleCount; i++) {
            // Update positions
            positionsArray[i * 3] += velocities[i].x;
            positionsArray[i * 3 + 1] += velocities[i].y;
            positionsArray[i * 3 + 2] += velocities[i].z;
            
            // Bounds check
            if (positionsArray[i * 3] > 10 || positionsArray[i * 3] < -10) velocities[i].x *= -1;
            if (positionsArray[i * 3 + 1] > 10 || positionsArray[i * 3 + 1] < -10) velocities[i].y *= -1;
            if (positionsArray[i * 3 + 2] > 0 || positionsArray[i * 3 + 2] < -15) velocities[i].z *= -1;

            // Connect nearby nodes
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positionsArray[i * 3] - positionsArray[j * 3];
                const dy = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
                const dz = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < maxConnectionDistance * maxConnectionDistance) {
                    linePositions.push(
                        positionsArray[i * 3], positionsArray[i * 3 + 1], positionsArray[i * 3 + 2],
                        positionsArray[j * 3], positionsArray[j * 3 + 1], positionsArray[j * 3 + 2]
                    );
                }
            }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;

        // Efficiently update lines
        if (linesGroup.children.length > 0) {
            linesGroup.children[0].geometry.dispose();
            linesGroup.remove(linesGroup.children[0]);
        }
        
        if (linePositions.length > 0) {
            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            const lines = new THREE.LineSegments(lineGeo, lineMaterial);
            linesGroup.add(lines);
        }

        // Mouse tilt
        targetRotationY = mouseX * 0.0003;
        targetRotationX = mouseY * 0.0003;
        
        scene.rotation.y += 0.05 * (targetRotationY - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetRotationX - scene.rotation.x);

        renderer.render(scene, camera);
    }

    animate();
})();
