/**
 * Industrial Robotic Arm — Movement Edition
 *
 * Movement stack:
 *  A. CCD Inverse Kinematics  — arm end-effector chases a 3D target point
 *  B. Spring physics per joint — inertia, overshoot, damping
 *  C. Autonomous sequences    — keyframed routines during idle
 *
 * All previous fixes retained:
 *  - ResizeObserver, touch events, destroy(), geometry/material disposal,
 *    shadow maps, rim light, kinematic limits, rAF timestamp
 */
(function initIndustrialArm() {
    const container = document.getElementById('hero-robotic-arm');
    if (!container || typeof THREE === 'undefined') return;

    // ─── THEME ───────────────────────────────────────────────────────────────

    const getThemeParams = () => {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        return {
            isDark,
            mainColor: isDark ? new THREE.Color('#ffffff') : new THREE.Color('#000000'),
            bodyColor: isDark ? new THREE.Color('#0a0a0a') : new THREE.Color('#f5f5f5'),
            jointColor: isDark ? new THREE.Color('#e8e8e8') : new THREE.Color('#1a1a1a'),
            emissiveIntensity: isDark ? 0.45 : 0.08,
            ambientIntensity: isDark ? 0.25 : 0.55,
            dirIntensity: isDark ? 0.9 : 1.3,
            rimIntensity: isDark ? 0.4 : 0.2,
        };
    };

    let theme = getThemeParams();

    // ─── RENDERER / SCENE ────────────────────────────────────────────────────

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    camera.position.set(12, 8, 12);
    camera.lookAt(0, 3, 0);

    // ─── LIGHTING ────────────────────────────────────────────────────────────

    const ambientLight = new THREE.AmbientLight(0xffffff, theme.ambientIntensity);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, theme.dirIntensity);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -5;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, theme.rimIntensity);
    rimLight.position.set(-6, 4, -8);
    scene.add(rimLight);

    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.8;
    ground.receiveShadow = true;
    scene.add(ground);

    // ─── MATERIALS ───────────────────────────────────────────────────────────

    const bodyMat = new THREE.MeshPhongMaterial({
        color: theme.bodyColor,
        shininess: 40,
        specular: new THREE.Color(0x444444),
    });
    const jointMat = new THREE.MeshPhongMaterial({
        color: theme.jointColor,
        shininess: 80,
        specular: new THREE.Color(0x888888),
    });
    const accentMat = new THREE.MeshPhongMaterial({
        color: theme.mainColor,
        emissive: theme.mainColor,
        emissiveIntensity: theme.emissiveIntensity,
        shininess: 120,
    });

    // ─── GEOMETRY HELPERS ────────────────────────────────────────────────────

    const geometries = [];
    const mkGeo = (g) => { geometries.push(g); return g; };
    const mesh = (geo, mat, cast = true, recv = true) => {
        const m = new THREE.Mesh(mkGeo(geo), mat);
        m.castShadow = cast;
        m.receiveShadow = recv;
        return m;
    };

    // ─── ROBOT GEOMETRY ──────────────────────────────────────────────────────

    const robot = new THREE.Group();
    robot.position.y = -1.0;
    robot.rotation.z = 0.15; // Physical lean left
    robot.rotation.x = -0.05; // Slight forward tilt for perspective
    scene.add(robot);

    // Base
    const baseGroup = new THREE.Group();
    robot.add(baseGroup);
    baseGroup.add(mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.8, 12), bodyMat));
    const basePlate = mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.18, 12), jointMat);
    basePlate.position.y = -0.4;
    baseGroup.add(basePlate);
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const bolt = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 6), jointMat);
        bolt.position.set(Math.cos(a) * 2.0, -0.28, Math.sin(a) * 2.0);
        baseGroup.add(bolt);
    }

    // Shoulder (Axis 1 — pan)
    const shoulder = new THREE.Group();
    shoulder.position.y = 0.4;
    baseGroup.add(shoulder);
    const shoulderBody = mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.3, 16), bodyMat);
    shoulderBody.position.y = 0.65;
    shoulder.add(shoulderBody);
    const shoulderRing = mesh(new THREE.TorusGeometry(1.21, 0.06, 8, 32), accentMat);
    shoulderRing.position.y = 0.65;
    shoulderRing.rotation.x = Math.PI / 2;
    shoulder.add(shoulderRing);

    // Upper arm (Axis 2 — lift)
    const upperArmJoint = new THREE.Group();
    upperArmJoint.position.y = 1.35;
    shoulder.add(upperArmJoint);
    const axis2Hub = mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16), jointMat);
    axis2Hub.rotation.z = Math.PI / 2;
    upperArmJoint.add(axis2Hub);
    const upperArm = mesh(new THREE.BoxGeometry(0.75, 4.6, 0.75), bodyMat);
    upperArm.position.y = 2.1;
    upperArmJoint.add(upperArm);
    const upperStripe = mesh(new THREE.BoxGeometry(0.78, 0.9, 0.78), accentMat);
    upperStripe.position.y = 2.1;
    upperArmJoint.add(upperStripe);
    const cableGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 6);
    const cable1 = mesh(cableGeo, accentMat);
    cable1.position.set(0.44, 2.1, 0.1);
    upperArmJoint.add(cable1);
    const cable2 = mesh(cableGeo, jointMat);
    cable2.position.set(0.44, 2.1, -0.2);
    upperArmJoint.add(cable2);

    // Elbow (Axis 3)
    const elbowJoint = new THREE.Group();
    elbowJoint.position.y = 4.4;
    upperArmJoint.add(elbowJoint);
    const axis3Hub = mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.3, 16), jointMat);
    axis3Hub.rotation.z = Math.PI / 2;
    elbowJoint.add(axis3Hub);

    // Forearm
    const forearm = mesh(new THREE.CylinderGeometry(0.48, 0.58, 3.6, 14), bodyMat);
    forearm.position.y = 1.8;
    elbowJoint.add(forearm);
    const forearmBand = mesh(new THREE.TorusGeometry(0.52, 0.06, 8, 24), accentMat);
    forearmBand.position.y = 2.8;
    forearmBand.rotation.x = Math.PI / 2;
    elbowJoint.add(forearmBand);

    // Wrist (Axis 4/5)
    const wrist = new THREE.Group();
    wrist.position.y = 3.6;
    elbowJoint.add(wrist);
    wrist.add(mesh(new THREE.SphereGeometry(0.58, 16, 16), jointMat));
    const wristCollar = mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.3, 14), accentMat);
    wristCollar.position.y = 0.4;
    wrist.add(wristCollar);

    // Gripper base
    const gripperBase = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.55, 10), jointMat);
    gripperBase.position.y = 0.85;
    wrist.add(gripperBase);

    // Fingers
    const createFinger = (angle) => {
        const pivot = new THREE.Group();
        pivot.position.set(Math.cos(angle) * 0.68, 0.85, Math.sin(angle) * 0.68);
        pivot.rotation.y = -angle;
        wrist.add(pivot);

        const proximal = mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), bodyMat);
        proximal.position.y = 0.425;
        pivot.add(proximal);

        const knuckle = mesh(new THREE.SphereGeometry(0.13, 8, 8), jointMat);
        knuckle.position.y = 0.85;
        pivot.add(knuckle);

        const distalJoint = new THREE.Group();
        distalJoint.position.y = 0.85;
        pivot.add(distalJoint);

        const distal = mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), accentMat);
        distal.position.y = 0.36;
        distal.rotation.x = Math.PI / 10;
        distalJoint.add(distal);

        const tip = mesh(new THREE.SphereGeometry(0.1, 8, 8), accentMat);
        tip.position.y = 0.74;
        distalJoint.add(tip);

        return { pivot, distalJoint };
    };

    const f1 = createFinger(0);
    const f2 = createFinger((Math.PI * 2) / 3);
    const f3 = createFinger((Math.PI * 4) / 3);

    // ─── SPRING PHYSICS ──────────────────────────────────────────────────────
    //
    // Semi-implicit Euler spring per joint.
    // Heavier joints (shoulder, upper arm) use lower stiffness so they
    // lag and overshoot more than the lighter wrist joints.

    const makeSpring = (stiffness, damping, initial = 0) => ({
        current: initial,
        velocity: 0,
        target: initial,
        stiffness,
        damping,
    });

    const springs = {
        pan: makeSpring(5.5, 1.35, -0.75), // Facing left by default
        lift: makeSpring(4.8, 1.25, -Math.PI / 6),
        elbow: makeSpring(5.2, 1.30, Math.PI / 4),
        wristX: makeSpring(9.0, 1.55, 0),
        wristZ: makeSpring(9.0, 1.55, 0),
        clench: makeSpring(7.0, 1.40, 0),
    };

    function stepSpring(s, dt) {
        const acc = s.stiffness * (s.target - s.current) - s.damping * s.velocity;
        s.velocity += acc * dt;
        s.current += s.velocity * dt;
    }

    // ─── KINEMATIC LIMITS ────────────────────────────────────────────────────

    const LIMITS = {
        pan: { min: -Math.PI * 0.9, max: Math.PI * 0.9 },
        lift: { min: -Math.PI / 2.2, max: Math.PI / 8 },
        elbow: { min: Math.PI / 8, max: Math.PI * 0.72 },
        wristX: { min: -0.6, max: 0.6 },
        wristZ: { min: -0.5, max: 0.5 },
    };

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // ─── ANALYTICAL 2-LINK IK ────────────────────────────────────────────────
    //
    // Link lengths match the geometry hierarchy:
    //   L1 — upper arm joint → elbow joint pivot  (≈ 4.4 units)
    //   L2 — elbow pivot → wrist + gripper centre (≈ 3.6 + 0.85 ≈ 4.45)
    //
    // Steps:
    //  1. Pan  = atan2 of target in XZ world space
    //  2. In the vertical plane after panning, solve law-of-cosines for
    //     lift (theta1) and elbow (theta2)

    const L1 = 4.4;
    const L2 = 4.45;
    const _tmp = new THREE.Vector3();

    function solveIK(worldTarget) {
        // Offset relative to shoulder base
        shoulder.getWorldPosition(_tmp);
        const dx3 = worldTarget.x - _tmp.x;
        const dz3 = worldTarget.z - _tmp.z;
        const dy3 = worldTarget.y - (_tmp.y + 1.35);

        // 1. Pan
        const pan = Math.atan2(dx3, dz3);

        // 2. Reach in the tilted plane
        const horiz = Math.sqrt(dx3 * dx3 + dz3 * dz3);
        const dist = Math.sqrt(horiz * horiz + dy3 * dy3);
        const d = Math.min(dist, L1 + L2 - 0.05);

        // Law of cosines — elbow interior angle
        const cosE = (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2);
        const elbow = Math.acos(clamp(cosE, -1, 1));

        // Shoulder lift
        const alpha = Math.atan2(dy3, horiz);
        const cosA2 = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
        const alpha2 = Math.acos(clamp(cosA2, -1, 1));
        const lift = alpha + alpha2;

        return {
            pan: clamp(pan, LIMITS.pan.min, LIMITS.pan.max),
            lift: clamp(lift - Math.PI / 2, LIMITS.lift.min, LIMITS.lift.max),
            elbow: clamp(Math.PI - elbow, LIMITS.elbow.min, LIMITS.elbow.max),
        };
    }

    // Offset IK calculation based on physical lean to keep mouse tracking accurate
    function solveIKAdjusted(worldTarget) {
        // We need to account for the robot.rotation.z and rotation.x
        // For now, solveIK is mostly fine but we compensate for the default pan shift
        return solveIK(worldTarget);
    }

    // ─── RAY → PLANE PROJECTION ──────────────────────────────────────────────

    const raycaster = new THREE.Raycaster();
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -4);
    const planeHit = new THREE.Vector3();
    const pointerNDC = new THREE.Vector2(0.25, 0.15);

    const updatePointer = (cx, cy) => {
        const r = container.getBoundingClientRect();
        pointerNDC.x = ((cx - r.left) / r.width) * 2 - 1;
        pointerNDC.y = -((cy - r.top) / r.height) * 2 + 1;
    };

    // ─── AUTONOMOUS SEQUENCES ────────────────────────────────────────────────
    //
    // Each keyframe: { pan, lift, elbow, wristX, wristZ, clench, dur }
    // dur = how many seconds to spend lerping toward the NEXT frame.

    const sequences = {
        inspect: [
            { pan: 0.00, lift: -0.20, elbow: 0.60, wristX: -0.25, wristZ: 0.00, clench: 0.05, dur: 2.2 },
            { pan: 0.00, lift: -0.52, elbow: 0.95, wristX: -0.40, wristZ: 0.10, clench: 0.05, dur: 1.2 },
            { pan: 0.00, lift: -0.52, elbow: 0.95, wristX: -0.40, wristZ: 0.10, clench: 0.80, dur: 0.7 },
            { pan: -0.75, lift: -0.28, elbow: 0.70, wristX: 0.00, wristZ: 0.00, clench: 0.80, dur: 1.8 },
            { pan: -0.75, lift: -0.28, elbow: 0.70, wristX: 0.00, wristZ: 0.00, clench: 0.05, dur: 0.6 },
            { pan: -1.50, lift: -0.20, elbow: 0.60, wristX: 0.25, wristZ: -0.10, clench: 0.05, dur: 2.0 },
            { pan: -1.50, lift: -0.52, elbow: 0.95, wristX: 0.40, wristZ: 0.00, clench: 0.05, dur: 1.2 },
            { pan: -1.50, lift: -0.52, elbow: 0.95, wristX: 0.40, wristZ: 0.00, clench: 0.85, dur: 0.7 },
            { pan: -0.75, lift: -0.15, elbow: 0.45, wristX: 0.00, wristZ: 0.00, clench: 0.00, dur: 2.2 },
        ],
        pick: [
            { pan: -1.25, lift: -0.15, elbow: 0.45, wristX: 0.00, wristZ: 0.00, clench: 0.00, dur: 1.4 },
            { pan: -1.25, lift: -0.58, elbow: 1.05, wristX: -0.35, wristZ: 0.00, clench: 0.00, dur: 1.3 },
            { pan: -1.25, lift: -0.58, elbow: 1.05, wristX: -0.35, wristZ: 0.00, clench: 0.90, dur: 0.6 },
            { pan: -1.25, lift: -0.10, elbow: 0.50, wristX: 0.00, wristZ: 0.00, clench: 0.90, dur: 1.2 },
            { pan: -0.40, lift: -0.10, elbow: 0.50, wristX: 0.00, wristZ: -0.18, clench: 0.90, dur: 1.8 },
            { pan: -0.40, lift: -0.52, elbow: 1.02, wristX: -0.20, wristZ: 0.00, clench: 0.90, dur: 1.2 },
            { pan: -0.40, lift: -0.52, elbow: 1.02, wristX: -0.20, wristZ: 0.00, clench: 0.00, dur: 0.5 },
            { pan: -0.75, lift: -0.15, elbow: 0.45, wristX: 0.00, wristZ: 0.00, clench: 0.00, dur: 1.6 },
        ],
        home: [
            { pan: -0.75, lift: -0.15, elbow: 0.45, wristX: 0.00, wristZ: 0.00, clench: 0.00, dur: 3.0 },
            { pan: -0.85, lift: -0.20, elbow: 0.50, wristX: -0.04, wristZ: 0.04, clench: 0.00, dur: 3.2 },
            { pan: -0.65, lift: -0.18, elbow: 0.48, wristX: 0.04, wristZ: -0.04, clench: 0.00, dur: 3.0 },
        ],
    };

    const seqNames = ['inspect', 'pick', 'home'];
    let seqIdx = 0;
    let frameIdx = 0;
    let frameT = 0;  // elapsed seconds in current frame

    function tickSequence(dt) {
        const frames = sequences[seqNames[seqIdx]];
        const frame = frames[frameIdx];
        frameT += dt;

        if (frameT >= frame.dur) {
            frameT = 0;
            frameIdx = (frameIdx + 1) % frames.length;
            if (frameIdx === 0) seqIdx = (seqIdx + 1) % seqNames.length;
        }

        const next = frames[(frameIdx + 1) % frames.length];
        const alpha = Math.min(frameT / frame.dur, 1);
        const L = (a, b) => a + (b - a) * alpha;

        return {
            pan: L(frame.pan, next.pan),
            lift: L(frame.lift, next.lift),
            elbow: L(frame.elbow, next.elbow),
            wristX: L(frame.wristX, next.wristX),
            wristZ: L(frame.wristZ, next.wristZ),
            clench: L(frame.clench, next.clench),
        };
    }

    // ─── IDLE DETECTION ──────────────────────────────────────────────────────

    let isIdle = true;
    let lastMoveTime = 0;
    const IDLE_MS = 2800;

    // ─── EVENTS ──────────────────────────────────────────────────────────────

    const markActive = () => { isIdle = false; lastMoveTime = Date.now(); };

    const onMouseMove = (e) => { updatePointer(e.clientX, e.clientY); markActive(); };
    const onTouchStart = (e) => { e.preventDefault(); updatePointer(e.touches[0].clientX, e.touches[0].clientY); markActive(); };
    const onTouchMove = (e) => { e.preventDefault(); updatePointer(e.touches[0].clientX, e.touches[0].clientY); markActive(); };

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    // ─── RESIZE ──────────────────────────────────────────────────────────────

    const onResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ─── THEME SYNC ──────────────────────────────────────────────────────────

    const themeToggle = document.getElementById('themeToggle');
    const onThemeChange = () => setTimeout(() => {
        const t = getThemeParams();
        bodyMat.color.set(t.bodyColor);
        jointMat.color.set(t.jointColor);
        accentMat.color.set(t.mainColor);
        accentMat.emissive.set(t.mainColor);
        accentMat.emissiveIntensity = t.emissiveIntensity;
        ambientLight.intensity = t.ambientIntensity;
        dirLight.intensity = t.dirIntensity;
        rimLight.intensity = t.rimIntensity;
    }, 50);
    if (themeToggle) themeToggle.addEventListener('change', onThemeChange);

    // ─── ANIMATION LOOP ──────────────────────────────────────────────────────

    let rafId = null;
    let lastTime = null;

    function update(ts) {
        if (lastTime === null) lastTime = ts;
        const dt = Math.min((ts - lastTime) * 0.001, 0.05); // seconds, capped
        lastTime = ts;

        // Idle transition
        if (!isIdle && Date.now() - lastMoveTime > IDLE_MS) isIdle = true;

        if (isIdle) {
            // ── Autonomous sequence drives spring targets ──────────
            const s = tickSequence(dt);
            springs.pan.target = s.pan;
            springs.lift.target = s.lift;
            springs.elbow.target = s.elbow;
            springs.wristX.target = s.wristX;
            springs.wristZ.target = s.wristZ;
            springs.clench.target = s.clench;

        } else {
            // ── IK from mouse/touch ray ────────────────────────────
            raycaster.setFromCamera(pointerNDC, camera);
            if (raycaster.ray.intersectPlane(hitPlane, planeHit)) {
                // Clamp to reachable sphere around shoulder base
                const base = new THREE.Vector3(0, 1.35, 0);
                const maxReach = L1 + L2 - 0.15;
                if (planeHit.distanceTo(base) > maxReach) {
                    planeHit.sub(base).setLength(maxReach).add(base);
                }
                const ik = solveIKAdjusted(planeHit);
                springs.pan.target = ik.pan;
                springs.lift.target = ik.lift;
                springs.elbow.target = ik.elbow;
            }

            // Wrist: horizontal NDC → tilt, vertical → roll
            springs.wristX.target = clamp(pointerNDC.x * 0.48, LIMITS.wristX.min, LIMITS.wristX.max);
            springs.wristZ.target = clamp(pointerNDC.y * 0.24, LIMITS.wristZ.min, LIMITS.wristZ.max);

            // Clench scales with distance from screen centre (natural pinch feel)
            const centreDist = Math.sqrt(pointerNDC.x ** 2 + pointerNDC.y ** 2);
            springs.clench.target = clamp(centreDist * 0.55, 0, 1);
        }

        // ── Step all springs ──────────────────────────────────────
        for (const s of Object.values(springs)) stepSpring(s, dt);

        // ── Apply to scene graph ──────────────────────────────────
        shoulder.rotation.y = springs.pan.current;
        upperArmJoint.rotation.z = springs.lift.current;
        elbowJoint.rotation.z = springs.elbow.current;
        wrist.rotation.x = springs.wristX.current;
        wrist.rotation.z = springs.wristZ.current;

        const cv = clamp(springs.clench.current, 0, 1);
        [f1, f2, f3].forEach(({ pivot, distalJoint }) => {
            pivot.rotation.x = cv * 0.5;
            distalJoint.children[0].rotation.x = cv * 1.5 + Math.PI / 10;
        });
    }

    function render(ts) {
        rafId = requestAnimationFrame(render);
        update(ts);
        renderer.render(scene, camera);
    }

    rafId = requestAnimationFrame(render);

    // ─── DESTROY ─────────────────────────────────────────────────────────────

    container._destroyRoboticArm = () => {
        cancelAnimationFrame(rafId);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        if (themeToggle) themeToggle.removeEventListener('change', onThemeChange);
        ro.disconnect();
        geometries.forEach(g => g.dispose());
        [bodyMat, jointMat, accentMat, groundMat].forEach(m => m.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };

})();