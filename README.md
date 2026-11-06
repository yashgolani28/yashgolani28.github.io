# Yash Golani — Portfolio

A static, scroll-driven portfolio for a Robotics & AI Engineer. The experience follows one continuous visual story through perception, distributed systems, applications, model research, professional experience, and personal projects.

## Local preview

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/. No application build or installation is needed. Local changes are not automatically committed or deployed.

## Active source

- `index.html`: semantic story, project links, career history, skills, education, and contact form.
- `assets/css/journey.css`: responsive editorial layout, red/blue light/dark palettes, sticky project reel, project briefs, technology badges, opening sequence, and Sasha panel.
- `assets/js/journey.js`: native-scroll progress, scene keyframes, project translation, theme preference, project dialogs, index menu, and contact form.
- `assets/js/journey-world.js`: one parametric sculpture that continuously morphs through metallic knots, orbits, waves, and feedback forms. Pointer deformation, orbiting, pulses, particle dispersion, and the Signal Lab controls share the same renderer.
- `assets/js/portfolio-data.js`: curated public facts, technologies, and algorithms shared by all eight project briefs and Sasha.
- `assets/js/tech.js`: technology badge rendering using the inline SVG symbols in `index.html`, derived from locally stored upstream marks.
- `assets/js/intro.js`: skippable opening tied to document/font readiness, with a maximum 3.5-second wait, keyboard dismissal, and reduced-motion/deep-link bypass.
- `assets/brand/`: custom Convergence logo, SVG favicon, PNG favicon, and Apple touch icon.
- `assets/icons/tech/`: original Devicon and Simple Icons brand shapes, source manifests, and upstream licences. Original SVG files are preserved; palette-only derivatives in `monochrome/` retain the upstream path geometry and provide consistent contrast in compact category cards on both themes.
- `assets/js/sasha.js`: local portfolio guide, contextual questions, topic/project retrieval, and source navigation. No remote AI service, API key, or chat history storage.
- `assets/images/projects/`: four generated concept illustrations, PNG originals, optimized WebP assets, and the complete prompt set in `generation.json`.
- `assets/vendor/three/`: local Three.js bundle and MIT license. No runtime 3D CDN dependency.
- `resume.html`: editable résumé source, with print styling.
- `resume.pdf`: its tagged, one-page A4 print export with selectable text and working links. Regenerate from the HTML source with browser headers and footers disabled after résumé edits. PDF links in `index.html` and `assets/js/portfolio-data.js` use the first 12 characters of the PDF SHA-256 as a `v` query parameter; refresh that version and the portfolio-data script URL whenever the PDF changes so mobile viewers request the current file.

Earlier layout styles/scripts are retained in the checkout but are not loaded by the active page. The existing section redirect pages still point into the portfolio.

## Scroll and accessibility

The browser retains normal scrolling: no wheel interception, scroll snapping, or forced chapter advancement. A single fixed canvas responds continuously to page position. The Signal Lab gives the sculpture its own scroll interval with selectable forms, energy control, pulses, and reset. The personal-project reel translates horizontally during its sticky interval, then returns to normal document flow.

Reduced-motion mode uses a static scene and a vertical project list. Ambient motion can also be paused manually. Rendering stops when the 3D scene fades out or the browser tab is hidden. WebGL failure retains a static visual; all text and project links remain readable without JavaScript. Keyboard focus brings off-screen project links into the reel viewport.

## Content boundaries

Employer contributions use generic VA, VMS, and ICCC terminology, without customer names, product imagery, or product performance promises. All artwork is illustrative. The personal-project reel uses newly generated concept illustrations, explicitly labelled as such, rather than photographs of actual builds. Images were created with the built-in image-generation tool; prompts and filenames are recorded in `assets/images/projects/generation.json`.

## Verification

Review desktop and mobile scrolling, every story-index anchor, the entire project reel, keyboard focus, pause/dispersion/pulse controls, Signal Lab form and energy controls, reduced-motion behavior, theme persistence, contribution accordions, project dialogs, Sasha answers and navigation, opening completion/skip/failure recovery, icon loading, every project’s algorithm list, and the résumé. Contact-form tests should mock the Formspree response rather than send a message.

The theme follows the system preference until a visitor explicitly chooses a theme; that choice is stored locally. All essential portfolio content is available in the page without opening Sasha. The project briefs provide optional additional detail.

## Content and visual refresh

Project technology details were checked against public READMEs, plus selected source files for TurtleBot, quadruped kinematics, MediaPipe fitness logic, and the agriculture notebook. Fitness copy reflects the implemented rule-based landmark classifier rather than the broader README claim of a trained classifier. Agriculture is attributed as a team project.

The résumé retains the actual Project Engineer title and employment dates. Its justified professional summary and experience bullets describe architecture and implementation scope without inventing a seniority title, performance figures, or deployment guarantees. The portfolio contains the broader project catalogue; the one-page résumé selects Jarvis, Traffic VLM, and TurtleBot.

The Convergence logo is a custom monochrome connected-node mark: two inputs meet at a diamond junction and continue to an output, representing the connection between perception, software, and action; the SVG is the editable source, with inline copies in the header and loader that inherit theme colours. Its favicon uses a white tile for contrast. Existing generated project illustrations remain concept artwork.

The current page omits the Signals & autonomy studies. The rabbit-hole projects use compact linked rows with technology and algorithm details in their dialogs. The engineering section replaces the skills card grid with an interactive, illustrative video-processing map. Its full toolkit remains available in a native disclosure. Tech stack & tools is linked in the story index and below those rows. Inline SVG symbols use explicit theme colours rather than image inversion filters.

The usability pass covered desktop and touch-mobile Chromium, including a 320 × 568 viewport, repeated project-fragment navigation, modal focus/Escape, the Signal Lab controls, theme persistence, Sasha at a keyboard-sized viewport, reduced motion, no JavaScript, and WebGL failure. Contact success and failure were mocked locally. The fixed header keeps a gradient backing, touch controls have larger hit areas, and archive links retain modified-click browser behaviour.

`assets/js/engineering-data.js` contains the public stage summaries and four project mechanism sketches. `engineering.js` handles keyboard-accessible layer selection, a finite flow trace, and project concept/mechanism switches; `assets/css/engineering.css` owns their presentation. The map is a simplified explanation of contributions, not a deployment diagram or live product telemetry. The trace stops offscreen, respects reduced motion, and does not publish performance figures.
