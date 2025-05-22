// Objeto principal de la aplicación
const App = {
    // Dependencias globales (GSAP, THREE.js, marked, hljs)
    gsap:                     window.gsap,
    ScrollToPlugin:           window.ScrollToPlugin,
    ScrollTrigger:            window.ScrollTrigger,
    THREE:                    window.THREE,
    marked:                   window.marked,
    hljs:                     window.hljs,

    // Configuración de la aplicación: selectores del DOM y parámetros
    config: {
        themeToggleButton:      document.getElementById("theme-toggle"),        // Botón para cambiar tema
        themes:                 ["light-paper", "dark-terminal"],               // Nombres de los temas disponibles
        themeIcons:             ["sun", "moon"],                                // Iconos para cada tema
        currentThemeIndex:      0,                                              // Índice del tema actual
        navbar:                 document.getElementById("main-header"),         // Elemento de la barra de navegación
        navbarLinksContainer:   document.querySelector(".navbar-links"),        // Contenedor de enlaces de la navbar
        preloader:              document.getElementById("preloader"),           // Elemento preloader
        preloaderLogo:          document.querySelector(".preloader-logo"),      // Logo del preloader
        preloaderLogoGlitch:    document.querySelector(".preloader-logo-glitch"), // Efecto glitch del logo
        preloaderStatusBar:     document.querySelector(".preloader-bar-inner"), // Barra de progreso interna
        preloaderStatusText:    document.querySelector(".preloader-status-text"), // Texto de estado del preloader
        preloaderPercentage:    document.querySelector(".preloader-percentage"),  // Porcentaje del preloader
        cursor:                 document.querySelector(".custom-cursor"),       // Cursor personalizado
        heroParticlesCanvas:    document.getElementById("hero-particles-canvas"), // Canvas para partículas del hero
        portfolioGrid:          document.querySelector(".portfolio-grid"),      // Contenedor de los items del portfolio
        portfolioModal:         document.getElementById("portfolio-modal"),     // Modal para detalles del portfolio
        modalCloseBtn:          document.querySelector("#portfolio-modal .modal-close"), // Botón de cierre del modal
        backToTopButton:        document.getElementById("back-to-top"),         // Botón de "volver arriba"
        asciiCanvas:            document.getElementById("ascii-canvas"),        // Canvas para la animación ASCII
        toggleAnimationBtn:     document.getElementById("toggle-animation-btn"),// Botón para pausar/reanudar animación ASCII
        navbarHeight:           60                                              // Altura de la barra de navegación en píxeles
    },

    // Estado de la aplicación
    state: {
        lastScrollTop:          0,                                              // Última posición de scroll
        isModalOpen:            false,                                          // Indica si el modal del portfolio está abierto
        heroScene:              null,                                           // Objeto para la escena de partículas del héroe (THREE.js)
        allPortfolioItems:      [],                                             // Array para almacenar todos los items del portfolio
        isPreloading:           true,                                           // Indica si el preloader está activo
        asciiAnimationId:       null,                                           // ID para el requestAnimationFrame de la animación ASCII
        isAsciiAnimationPaused: false                                           // Indica si la animación ASCII está pausada
    },

    /**
     * Inicializa la aplicación.
     * Verifica las dependencias y llama a las funciones de inicialización de los módulos.
     */
    init() {
        // Verifica si GSAP y sus plugins están cargados
        if (!this.gsap || !this.ScrollToPlugin || !this.ScrollTrigger) {
            console.error("GSAP or its plugins not loaded!");
            if (this.config.preloader) {                                        // Oculta el preloader si existe y GSAP falla
                this.config.preloader.style.display = "none";
            }
            this.state.isPreloading = false;
            this.onPreloaderComplete();                                         // Llama a la función de post-carga
            return;
        }

        // Registra los plugins de GSAP
        this.gsap.registerPlugin(this.ScrollToPlugin, this.ScrollTrigger);

        // Inicializa los diferentes módulos de la aplicación
        this.initPreloader();
        this.initTheme();
        this.initCustomCursor();
        this.initNavbar();
        this.initFeatherIcons();                                                // Inicializa los iconos Feather
        this.initPortfolioData();                                               // Carga y renderiza los datos del portfolio
        this.initBackToTop();
        this.initCopyButtons();

        if (this.config.asciiCanvas) {                                          // Inicializa la animación ASCII si el canvas existe
            this.initAsciiPlayground();
        }
    },

    /**
     * Inicializa los iconos Feather.
     * Reemplaza los elementos <i data-feather="..."></i> con los SVGs correspondientes.
     */
    initFeatherIcons() {
        if (typeof feather !== "undefined") {
            feather.replace({
                width: "1em",
                height: "1em",
                "stroke-width": 1.5
            });
        }
    },

    /**
     * Inicializa el preloader.
     * Muestra una animación de carga antes de mostrar el contenido principal.
     */
    initPreloader() {
        if (!this.config.preloader) {
            this.state.isPreloading = false;
            this.onPreloaderComplete();
            return;
        }

        document.body.style.overflow = "hidden";                                // Evita el scroll durante la precarga

        let timeline = this.gsap.timeline({
            onComplete: () => {
                this.state.isPreloading = false;
                this.onPreloaderComplete();                                     // Llama a esta función cuando la animación del preloader termina
            }
        });

        let progress = { value: 0 };                                            // Objeto para animar el progreso

        if (this.config.preloaderStatusText) {
            this.config.preloaderStatusText.textContent = "LOADING";
        }
        if (this.config.preloaderPercentage) {
            this.config.preloaderPercentage.textContent = "0%";
        }

        // Animación del logo, texto de estado y barra de progreso
        timeline
            .fromTo([this.config.preloaderLogo, this.config.preloaderLogoGlitch],
                { opacity: 0, scale: 0.7, rotate: -5 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.2)" },
                0.1
            )
            .fromTo([this.config.preloaderStatusText, this.config.preloaderPercentage],
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power1.out", stagger: 0.1 },
                0.4
            )
            .fromTo(this.config.preloader.querySelector(".preloader-bar"),
                { opacity: 0 },
                { opacity: 1, duration: 0.2 },
                0.6
            );

        // Animación de la barra de progreso y el porcentaje
        timeline.to(progress, {
            value: 100,
            duration: 1.5,
            ease: "power1.inOut",
            onUpdate: () => {
                if (this.config.preloaderStatusBar) {
                    this.config.preloaderStatusBar.style.width = `${progress.value}%`;
                }
                if (this.config.preloaderPercentage) {
                    this.config.preloaderPercentage.textContent = `${Math.round(progress.value)}%`;
                }
            }
        }, 0.7);

        // Animación de desaparición del preloader
        timeline
            .to(this.config.preloader, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
                delay: 0.3
            })
            .set(this.config.preloader, {
                display: "none"                                                 // Oculta el preloader completamente
            });
    },

    /**
     * Se ejecuta cuando el preloader ha terminado.
     * Restaura el scroll, inicia animaciones de entrada y otras inicializaciones post-carga.
     */
    onPreloaderComplete() {
        document.body.style.overflow = "";                                      // Restaura el scroll del body
        this.animateHeroIntro();                                                // Anima la entrada de la sección "hero"

        if (this.THREE && this.config.heroParticlesCanvas) {                    // Inicializa las partículas del "hero" si THREE.js y el canvas están disponibles
            this.initHeroParticles();
        }
        this.initScrollAnimations();                                            // Inicializa las animaciones que dependen del scroll

        if (this.config.asciiCanvas && this.state.asciiAnimationId === null && !this.state.isAsciiAnimationPaused) { // Inicia la animación ASCII si está configurada y no está pausada
            this.startAsciiAnimation();
        }
    },

    /**
     * Inicializa el sistema de temas (claro/oscuro).
     * Carga el tema guardado o el preferido por el sistema y configura el botón de cambio.
     */
    initTheme() {
        let savedTheme    = localStorage.getItem("caelok-ae-theme-v2");
        let prefersLight  = window.matchMedia("(prefers-color-scheme: light)").matches;
        let defaultTheme  = "light-paper";

        defaultTheme = savedTheme || (prefersLight ? "light-paper" : "dark-terminal");
        this.config.currentThemeIndex = this.config.themes.indexOf(defaultTheme);

        if (this.config.currentThemeIndex === -1) {                             // Si el tema guardado no es válido, usa el primero de la lista
            this.config.currentThemeIndex = 0;
        }

        this.applyCurrentTheme();

        if (this.config.themeToggleButton) {
            this.config.themeToggleButton.addEventListener("click", () => {
                this.config.currentThemeIndex = (this.config.currentThemeIndex + 1) % this.config.themes.length;
                this.applyCurrentTheme();
            });
        }
    },

    /**
     * Aplica el tema actual al body y actualiza el icono del botón.
     * Guarda el tema seleccionado en localStorage.
     */
    applyCurrentTheme() {
        let themeName = this.config.themes[this.config.currentThemeIndex];
        document.body.dataset.theme = themeName;
        localStorage.setItem("caelok-ae-theme-v2", themeName);

        if (this.config.themeToggleButton) {
            let iconName = this.config.themeIcons[this.config.currentThemeIndex];
            this.config.themeToggleButton.innerHTML = `<i data-feather="${iconName}" class="theme-icon"></i>`;
            this.initFeatherIcons();                                            // Re-inicializa los iconos Feather para el nuevo icono
        }

        // Actualiza variables CSS para colores RGB (usado por partículas y otros efectos)
        this.setBodyRgbVariable("--bg-color", "--bg-color-rgb", themeName === "light-paper" ? "240,239,230" : "10,10,10");
        this.setBodyRgbVariable("--accent-color", "--accent-rgb", themeName === "light-paper" ? "255,69,0" : "0,207,69");

        if (this.state.heroScene && this.state.heroScene.updateColors) {        // Actualiza colores en la escena de partículas si existe
            this.state.heroScene.updateColors();
        }
        if (this.config.asciiCanvas && this.state.asciiCube) {                  // Actualiza el carácter de la animación ASCII según el tema
            this.state.asciiCube.char = themeName === "light-paper" ? "@" : "*";
        }
    },

    /**
     * Establece una variable CSS con el valor RGB de otra variable de color.
     * @param {string} colorVarName - Nombre de la variable CSS de color (ej: --bg-color).
     * @param {string} rgbVarName - Nombre de la variable CSS para el RGB (ej: --bg-color-rgb).
     * @param {string} fallbackRgb - Valor RGB de fallback si la conversión falla.
     */
    setBodyRgbVariable(colorVarName, rgbVarName, fallbackRgb) {
        let colorValue = getComputedStyle(document.body).getPropertyValue(colorVarName).trim();
        try {
            if (colorValue.startsWith("#")) {
                const hexToRgb = (hex) => {                                     // Función para convertir HEX a RGB array
                    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;     // Para hex cortos como #RGB
                    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
                    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
                };
                document.documentElement.style.setProperty(rgbVarName, hexToRgb(colorValue).join(","));
            } else {                                                            // Si no es HEX, usa el fallback
                document.documentElement.style.setProperty(rgbVarName, fallbackRgb);
            }
        } catch (error) {
            console.warn(`Failed to parse ${colorVarName} for ${rgbVarName}`, error);
            document.documentElement.style.setProperty(rgbVarName, fallbackRgb);
        }
    },

    /**
     * Inicializa el cursor personalizado.
     * El cursor sigue el movimiento del mouse.
     */
    initCustomCursor() {
        if (this.config.cursor) {
            window.addEventListener("mousemove", (event) => {
                this.gsap.to(this.config.cursor, {
                    duration: 0.05,                                             // Muy rápido para una sensación de respuesta inmediata
                    x: event.clientX,
                    y: event.clientY,
                    ease: "none"
                });
            }, { passive: true });
        }
    },

    /**
     * Inicializa la barra de navegación.
     * Controla su visibilidad al hacer scroll y la navegación suave a secciones.
     */
    initNavbar() {
        if (!this.config.navbar) return;

        let lastScroll = 0;
        const navbarHeight = this.config.navbarHeight;

        window.addEventListener("scroll", () => {                               // Controla la visibilidad de la navbar al hacer scroll
            if (this.state.isPreloading) return;                                // No hacer nada si está precargando

            let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            this.config.navbar.classList.toggle("scrolled", currentScroll > 20); // Añade clase si se ha scrolleado un poco

            // Oculta la navbar al hacer scroll hacia abajo, la muestra al hacer scroll hacia arriba
            if (currentScroll > lastScroll && currentScroll > navbarHeight) {
                this.config.navbar.classList.add("hidden");
            } else if (currentScroll + window.innerHeight < document.documentElement.scrollHeight - navbarHeight / 2) { // Evita que se muestre al final de la página
                this.config.navbar.classList.remove("hidden");
            }
            lastScroll = currentScroll <= 0 ? 0 : currentScroll;                // Para Mobile o scroll hacia arriba
        }, { passive: true });

        const navLinks = document.querySelectorAll(".nav-item");                // Navegación suave al hacer clic en los enlaces de la navbar
        navLinks.forEach(link => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const targetId = link.getAttribute("href");
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    this.gsap.to(window, {
                        duration: 0.8,
                        scrollTo: {
                            y: targetElement,
                            offsetY: navbarHeight * 0.7                         // Ajuste del offset para la altura de la navbar
                        },
                        ease: "power2.inOut"
                    });
                }
            });
        });

        const sections = this.gsap.utils.toArray(".content-section, .hero-section"); // Resalta el enlace activo en la navbar según la sección visible
        sections.forEach(section => {
            this.ScrollTrigger.create({
                trigger: section,
                start: () => `top ${navbarHeight + (window.innerHeight * 0.2)}px`, // Un poco más abajo del top de la navbar
                end: () => `bottom ${navbarHeight + (window.innerHeight * 0.2)}px`,
                toggleClass: {
                    targets: `a[href="#${section.id}"]`,
                    className: "active"
                }
                // markers: true                                                 // Descomentar para depuración de ScrollTrigger
            });
        });
    },

    /**
     * Anima la entrada de los elementos de la sección "hero".
     */
    animateHeroIntro() {
        if (this.state.isPreloading) return;                                    // No animar si aún está precargando

        let timeline = this.gsap.timeline({ delay: 0.1 });
        timeline
            .from(".hero-logo-main", { opacity: 0, y: 40, scale: 0.7, duration: 1.2, ease: "elastic.out(0.8, 0.5)" })
            .from(".hero-title", { opacity: 0, y: 25, duration: 0.7, ease: "power2.out" }, "-=0.8")
            .from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.6")
            .from(".hero-cta", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.4")
            .from(".scroll-indicator-wrapper", { opacity: 0, y: 10, duration: 0.7, ease: "power1.out" }, "-=0.2");
    },

    /**
     * Inicializa la animación de partículas en la sección "hero" usando THREE.js.
     */
    initHeroParticles() {
        if (!this.THREE || !this.config.heroParticlesCanvas) return;

        const scene = new this.THREE.Scene();
        const camera = new this.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.8;

        const renderer = new this.THREE.WebGLRenderer({
            canvas: this.config.heroParticlesCanvas,
            alpha: true,                                                        // Fondo transparente
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));           // Optimiza para pantallas de alta densidad

        const numParticles = 3500;
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);
        const randomFactors = new Float32Array(numParticles);                   // Para variaciones por partícula

        const geometry = new this.THREE.BufferGeometry();

        const updateParticleProperties = () => {                                // Función para generar/actualizar las partículas (colores, posiciones)
            const accentColor = new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--accent-color").trim());
            const textColor = new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--text-color").trim());
            const mixedColor = accentColor.clone().lerp(textColor, 0.5);
            const particleColors = [accentColor, textColor, mixedColor];

            for (let i = 0; i < numParticles; i++) {
                positions[i * 3 + 0] = (Math.random() - 0.5) * 10;              // x
                positions[i * 3 + 1] = (Math.random() - 0.5) * 10;              // y
                positions[i * 3 + 2] = (Math.random() - 0.5) * 10;              // z

                const chosenColor = particleColors[Math.floor(Math.random() * particleColors.length)];
                colors[i * 3 + 0] = chosenColor.r;
                colors[i * 3 + 1] = chosenColor.g;
                colors[i * 3 + 2] = chosenColor.b;

                randomFactors[i] = Math.random() * 0.8 + 0.2;                   // Factor aleatorio entre 0.2 y 1.0
            }
            geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('randomFactor', new this.THREE.BufferAttribute(randomFactors, 1));

            if (geometry.attributes.position) geometry.attributes.position.needsUpdate = true; // Notifica a THREE.js que los atributos han cambiado
            if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;
            if (geometry.attributes.randomFactor) geometry.attributes.randomFactor.needsUpdate = true;
        };

        updateParticleProperties();                                             // Llama para la configuración inicial

        const particleTexture = new this.THREE.TextureLoader().load(            // Textura para las partículas (un simple círculo SVG)
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg=="
        );

        const material = new this.THREE.ShaderMaterial({                        // Material personalizado con shaders para las partículas
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: particleTexture }
            },
            vertexShader: `
                attribute vec3 color;
                attribute float randomFactor;
                uniform float time;
                varying vec3 vColor;
                varying float vRandomFactor;

                void main() {
                    vColor = color;
                    vRandomFactor = randomFactor;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float sizePulse = sin(time * randomFactor * 2.0 + randomFactor * 6.2831) * 0.3 + 0.7; // Tamaño pulsante (6.2831 es 2*PI)
                    gl_PointSize = (40.0 / -mvPosition.z) * randomFactor * sizePulse;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vRandomFactor;

                void main() {
                    float opacity = (sin(vRandomFactor * 10.0) * 0.2 + 0.6) * 0.8; // Opacidad variada
                    gl_FragColor = vec4(vColor, opacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            blending: this.THREE.AdditiveBlending,                              // Efecto de brillo al superponerse
            depthTest: false,                                                   // Para que no se oculten entre sí incorrectamente
            transparent: true
        });

        const particles = new this.THREE.Points(geometry, material);
        scene.add(particles);

        this.state.heroScene = {                                                // Guarda la escena para poder actualizarla
            updateColors: updateParticleProperties,                             // Función para recalcular colores
            particles: particles,
            material: material
        };

        const mouse = new this.THREE.Vector2();                                 // Control de la cámara con el mouse
        document.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        const clock = new this.THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            material.uniforms.time.value = elapsedTime;                         // Actualiza el tiempo para los shaders

            particles.position.x += (mouse.x * 0.05 - particles.position.x) * 0.015; // Movimiento sutil de las partículas con el mouse
            particles.position.y += (mouse.y * 0.05 - particles.position.y) * 0.015;
            particles.rotation.y = elapsedTime * 0.015;                         // Rotación lenta

            renderer.render(scene, camera);
        };

        animate();

        window.addEventListener('resize', () => {                               // Ajusta el tamaño del canvas y la cámara al redimensionar
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, { passive: true });
    },

    /**
     * Inicializa las animaciones de entrada para elementos al hacer scroll.
     */
    initScrollAnimations() {
        if (this.state.isPreloading) return;

        this.gsap.utils.toArray(".section-title").forEach(title => {            // Animación para los títulos de sección
            this.gsap.from(title, {
                opacity: 0,
                y: 25,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 90%",                                           // Se activa cuando el 90% superior del trigger entra en la vista
                    once: true                                                  // La animación solo ocurre una vez
                }
            });
        });

        const elementsToAnimate = this.gsap.utils.toArray(                      // Animación para otros elementos
            ".about-text p, .skills-list li, .portfolio-card, .connect-text p, .connect-email-link, .social-icons a, .crypto-item, .playground-container"
        );
        elementsToAnimate.forEach((element, index) => {
            this.gsap.from(element, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 92%",
                    once: true
                },
                delay: (index % 4) * 0.07                                       // Pequeño delay escalonado para grupos de 4
            });
        });
    },

    /**
     * Inicializa la animación del cubo ASCII en el playground.
     */
    initAsciiPlayground() {
        if (!this.config.asciiCanvas) return;

        const canvas = this.config.asciiCanvas;
        let angle = 0;                                                          // Ángulo de rotación

        const vertices = [                                                      // Vértices de un cubo
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const edges = [                                                         // Aristas del cubo
            [0, 1], [1, 2], [2, 3], [3, 0],                                     // Cara trasera
            [4, 5], [5, 6], [6, 7], [7, 4],                                     // Cara frontal
            [0, 4], [1, 5], [2, 6], [3, 7]                                      // Conexiones entre caras
        ];

        this.state.asciiCube = {                                                // Estado del cubo ASCII
            char: document.body.dataset.theme === "light-paper" ? "@" : "*"
        };

        const renderAsciiFrame = () => {
            if (this.state.isAsciiAnimationPaused) return;

            const rows = 20, cols = 40;
            let output = Array(rows).fill(null).map(() => Array(cols).fill(' ')); // Buffer de caracteres
            let zBuffer = Array(rows).fill(null).map(() => Array(cols).fill(Infinity)); // Buffer de profundidad

            angle += 0.02;                                                      // Incrementa el ángulo para la rotación
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            const projectedVertices = vertices.map(v => {                       // Proyecta los vértices 3D a 2D y los rota
                let x = v[0], y = v[1], z = v[2];
                let xRotY = x * cosA - z * sinA;                                // Rotación en Y
                let zRotY = x * sinA + z * cosA;
                let yRotX = y * cosA - zRotY * sinA;                            // Rotación en X
                let zRotX = y * sinA + zRotY * cosA;
                return [xRotY, yRotX, zRotX + 5];                               // Añade offset en Z para alejar el cubo
            });

            const projectToAscii = (x, y, z) => {                               // Convierte coordenadas 3D proyectadas a ASCII
                const perspectiveFactor = 2 / z;                                // Factor de perspectiva simple
                const screenX = Math.floor(x * perspectiveFactor * (cols / 4) + (cols / 2)); // Ajusta escala y centra
                const screenY = Math.floor(-y * perspectiveFactor * (rows / 4) + (rows / 2)); // Invierte Y y centra
                return [screenX, screenY];
            };

            const plotChar = (x, y, z, char) => {                               // Dibuja un carácter en el buffer si está más cerca
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    if (z < zBuffer[y][x]) {
                        output[y][x] = char;
                        zBuffer[y][x] = z;
                    }
                }
            };

            const drawLine = (p1, p2, z1, z2, char) => {                        // Algoritmo de Bresenham para dibujar líneas
                let x0 = p1[0], y0 = p1[1];
                let x1 = p2[0], y1 = p2[1];
                let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
                let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
                let err = dx + dy, e2;
                let currentZ;

                for (;;) {
                    let t = (x0 === x1 && y0 === y1) ? 0 : Math.sqrt(Math.pow(x0 - p1[0], 2) + Math.pow(y0 - p1[1], 2)) / Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)); // Interpola Z
                    currentZ = z1 * (1 - t) + z2 * t;
                    plotChar(x0, y0, currentZ, char);

                    if (x0 === x1 && y0 === y1) break;
                    e2 = 2 * err;
                    if (e2 >= dy) { err += dy; x0 += sx; }
                    if (e2 <= dx) { err += dx; y0 += sy; }
                }
            };

            const screenVertices = projectedVertices.map(v => projectToAscii(v[0], v[1], v[2]));

            edges.forEach(edge => {
                const v1 = screenVertices[edge[0]];
                const v2 = screenVertices[edge[1]];
                const z1 = projectedVertices[edge[0]][2];
                const z2 = projectedVertices[edge[1]][2];
                drawLine(v1, v2, z1, z2, this.state.asciiCube.char);
            });

            canvas.textContent = output.map(row => row.join('')).join('\n');
            this.state.asciiAnimationId = requestAnimationFrame(renderAsciiFrame);
        };

        this.startAsciiAnimation = () => {
            if (this.state.asciiAnimationId) cancelAnimationFrame(this.state.asciiAnimationId);
            this.state.isAsciiAnimationPaused = false;
            if (this.config.toggleAnimationBtn) this.config.toggleAnimationBtn.textContent = "> PAUSAR_ANIMACIÓN";
            renderAsciiFrame();
        };

        this.pauseAsciiAnimation = () => {
            if (this.state.asciiAnimationId) cancelAnimationFrame(this.state.asciiAnimationId);
            this.state.isAsciiAnimationPaused = true;
            if (this.config.toggleAnimationBtn) this.config.toggleAnimationBtn.textContent = "> REANUDAR_ANIMACIÓN";
        };

        if (this.config.toggleAnimationBtn) {
            this.config.toggleAnimationBtn.addEventListener("click", () => {
                this.state.isAsciiAnimationPaused ? this.startAsciiAnimation() : this.pauseAsciiAnimation();
            });
        }
    },

    /**
     * Carga los datos de los items del portfolio y los renderiza.
     * También inicializa los filtros del portfolio.
     */
    initPortfolioData() {
        this.state.allPortfolioItems = [
            {
                type: "proyecto",
                slug: "swosh",
                title: "Swosh",
                date: "2025-01-15",
                excerpt: "una base de datos nosql que hice en typescript. mola porque es súper ligera y para aprender está genial.",
                content_md: `## introducción
### ¡flipando con swosh!
oye. swosh es como mi pequeño monstruo de las bases de datos. la hice en typescript, que es como javascript pero con superpoderes. la idea era que fuera fácil de usar y rápida, sin rollos.

## ¿cómo funciona?
### ¿magia? casi
pues mira, swosh no es de esas bases de datos gigantes que necesitan un montón de cosas para funcionar. esta la puedes meter en tu proyecto y listo.
- **va que vuela**: no te va a ralentizar la web ni nada.
- **para tus cosas del navegador**: si haces una app web y quieres guardar datos sin complicarte, swosh te viene de perlas.
- **fácil, fácil**: si ya le pegas a javascript, usar swosh es pan comido.

imagina que quieres hacer una app que funcione aunque no tengas internet, o un juego pequeño. pues para eso swosh es la caña.

## conclusión
swosh es la prueba de que no hace falta algo súper complicado para ser útil. si estás aprendiendo y quieres ver cómo va una base de datos por dentro, échale un ojo. además, como está en typescript, puedes cotillear el código y aprender un montón.

## visita el proyecto
Source: [github.com/caelok/swosh](https://github.com/caelok/swosh)`,
                tags: ["TypeScript", "Node.js", "NoSQL", "Bases de Datos", "DIY"],
                links: [{ text: "Ver en GitHub", url: "https://github.com/caelok/swosh", icon: "github" }]
            },
            {
                type: "articulo",
                slug: "machine-learning-intro",
                title: "Machine Learning",
                date: "2025-05-20",
                excerpt: "te cuento qué es eso del machine learning de forma fácil. es como enseñarles trucos a los ordenadores.",
                content_md: `## introducción
### ¿qué es el machine learning? no es tan raro
el machine learning, o ml para los amigos, es una movida de la inteligencia artificial. en vez de decirle al ordenador "haz esto, luego esto...", le damos un montón de datos y que aprenda solo. como cuando aprendes a montar en bici, a base de práctica.

## ¿cómo funciona?
### hay varias formas de enseñarles
no hay una sola manera de que las máquinas aprendan, hay varias.
- **aprendizaje supervisado**: imagina que le das al ordenador un montón de fotos de perros y gatos y le dices cuál es cuál. al final, aprende a distinguirlos solo. eso es porque ya le diste las respuestas.
- **aprendizaje no supervisado**: aquí es más como "toma estos datos y búscate la vida". el ordenador intenta encontrar grupos o cosas raras en los datos sin que nadie le diga nada. como si ordenas tus cromos por equipos sin saber de qué equipo es cada uno, solo por los colores.
- **aprendizaje por refuerzo**: este es como los videojuegos. la máquina prueba cosas, y si lo hace bien, premio. si la lía, pues nada. así va aprendiendo qué funciona y qué no. como cuando intentas pasarte un nivel difícil.

## conclusión
### el ml está en todas partes
seguro que usas ml todos los días y ni te enteras. las recomendaciones de netflix o youtube. los filtros de instagram que te ponen orejas de perro. es una pasada cómo está cambiando todo. aprender de esto te puede molar mucho si te va la tecnología.

## referencias
- si quieres cotillear más, busca "machine learning explicacion para niños" en google, hay cosas chulas.
- también puedes ver vídeos en youtube, algunos lo explican súper bien.`,
                tags: ["ML", "IA", "Inteligencia Artificial", "Conceptos", "Tecnología"]
            },
            {
                type: "proyecto",
                slug: "skuld-malware-infostealer-go",
                title: "Skuld",
                date: "2025-05-22",
                excerpt: "skuld es un bichejo informático que hice en go. su misión: pillar toda la info que pueda de un ordenador.",
                content_md: `## introducción
### skuld, el espía digital
ojo con skuld. es un tipo de programa que se llama *infostealer*, que viene a ser como un ladrón de información. lo programé en go, que es un lenguaje que va como un tiro. la idea es que se cuele en un ordenador y zas, se lleve contraseñas, datos personales y todo lo que pille.

## ¿cómo funciona?
### así ataca skuld
este bicho no se anda con tonterías:
1.  **se cuela sin que te enteres**: entra en el ordenador a escondidas, como un ninja.
2.  **empieza a cotillear**: busca por todos lados archivos importantes y contraseñas guardadas. no se le escapa una.
3.  **envía el botín**: toda la información que roba la manda a los malos sin que el dueño del ordenador se dé cuenta. qué listillo.

## conclusión
### ¿para qué sirve saber esto?
aunque skuld sea para hacer el mal, entender cómo funcionan estos programas es súper importante. así aprendemos a proteger nuestros ordenadores y nuestra información. saber sus trucos nos ayuda a ser más listos que ellos. no hay que ser un genio para entender que es mejor prevenir.

## visita el proyecto
Source: [https://github.com/hackirby/skuld](https://github.com/hackirby/skuld)`,
                tags: ["Malware", "Infostealer", "Go", "Ciberseguridad", "Seguridad", "Hacking Ético"],
                links: [{ text: "Ver el código en GitHub", url: "https://github.com/hackirby/skuld", icon: "github" }]
            },
            {
                type: "articulo",
                slug: "lenguajes-poderosos",
                title: "Mis Lenguajes de Programación Favoritos",
                date: "2025-03-10",
                excerpt: "te cuento qué lenguajes de programación me molan más y para qué los uso. cada uno tiene su punto.",
                content_md: `## introducción
### a programar se ha dicho
cuando te pones a programar, es como tener una caja de herramientas. cada lenguaje es una herramienta diferente y sirve para unas cosas mejor que para otras. estos son algunos de los que más uso.

## ¿cómo funciona? (bueno, más bien, ¿cuáles uso?)
### mis herramientas estrella:
- **typescript**: es como javascript pero con esteroides. te ayuda a no cometer tantos errores y es genial para hacer páginas web y apps. lo uso un montón.
- **python**: este es súper fácil de aprender y sirve para casi todo. quieres hacer un script rápido para automatizar algo. python. analizar datos. python. meterte con machine learning. python también.
- **go (golang)**: si necesitas algo que sea muy muy rápido y que aguante mucha caña (como un servidor web con miles de visitas), go es tu amigo. es más simple de lo que parece.
- **rust**: este es para valientes. es un poco más difícil de pillar al principio, pero es una bestia. súper rápido, súper seguro y te da un control increíble. para cosas muy pros.

## conclusión
### ¿el mejor lenguaje? el que te sirva
no hay un lenguaje que sea el mejor para todo, sería aburrido. lo guay es conocer varios y usar el que mejor te venga para cada proyecto. a veces hasta mezclo varios. lo importante es entender la lógica y pasarlo bien programando.

## referencias
- para aprender más, busca tutoriales de cada lenguaje en sitios como freecodecamp o codecademy.
- y practica mucho. haz proyectitos pequeños para pillarles el truco.`,
                tags: ["TypeScript", "Python", "Go", "Rust", "Programación", "Desarrollo"],
            },
            {
                type: "articulo",
                slug: "lobster-lenguaje-juegos",
                title: "Lobster",
                date: "2025-05-23",
                excerpt: "conoces lobster. es un lenguaje de programación pensado para hacer videojuegos. te cuento un poco sobre él.",
                content_md: `## introducción
### ¿qué es lobster? no es un marisco
oye. cuando hablamos de lobster en informática, no es el bicho rojo con pinzas. es un lenguaje de programación que está hecho especialmente para crear videojuegos. mola, eh. la idea es que sea más fácil y divertido hacer tus propios juegos.

## ¿cómo funciona?
### ¿y cómo se usa para los juegos?
pues lobster intenta simplificar las cosas que suelen ser un rollo al programar juegos:
- **gráficos y sonido**: viene con herramientas para que dibujar cosas en pantalla o poner sonidos sea más sencillo.
- **rendimiento**: intenta ser rápido para que los juegos vayan fluidos, que no se queden pillados.
- **fácil de aprender**: aunque todos los lenguajes tienen su qué, lobster quiere ser amigable para la gente que empieza en esto de hacer juegos.

imagina que quieres hacer un juego de plataformas o uno de puzzles, pues lobster te da como los bloques de construcción ya preparados para que no empieces desde cero cero.

## conclusión
### ¿debería aprender lobster?
si te flipan los videojuegos y te gustaría intentar crear los tuyos, lobster puede ser una opción guay para empezar. no es tan famoso como otros, pero tiene una comunidad detrás y siempre se aprende algo nuevo. lo importante es que te diviertas creando.

## referencias
- página oficial de lobster (si la buscas, seguro que la encuentras, yo la busqué como "lobster programming language").
- foros y comunidades de desarrollo de videojuegos indie, ahí se habla de todo.`,
                tags: ["Lobster", "Programación", "Videojuegos", "GameDev", "IndieDev"]
            },
            {
                type: "articulo",
                slug: "deep-fakes-que-son",
                title: "Deep Fakes",
                date: "2025-05-24",
                excerpt: "los deep fakes son vídeos falsos que parecen súper reales. ¿magia? no, inteligencia artificial. te lo explico.",
                content_md: `## introducción
### ¿qué son los deep fakes? alucina
los deep fakes son como el photoshop pero para vídeos, y a lo bestia. usan inteligencia artificial para cambiar la cara de una persona en un vídeo por la de otra, y queda tan bien que parece de verdad. es una tecnología que flipas, pero también da un poco de yuyu.

## ¿cómo funciona?
### la magia de la ia
para hacer un deep fake, necesitas un montón de fotos y vídeos de las dos personas: la que quieres quitar y la que quieres poner. luego, un programa de inteligencia artificial, que es como un cerebro de ordenador súper listo, aprende cómo se mueve y gesticula cada cara.
después, el programa reconstruye el vídeo original poniendo la nueva cara, y lo hace fotograma a fotograma. es como si un dibujante increíblemente rápido y preciso redibujara cada instante del vídeo.

los programas que hacen esto se llaman gans (redes generativas antagónicas). son dos redes neuronales que compiten: una intenta crear el fake perfecto y la otra intenta pillarle. así van mejorando hasta que el fake es casi indetectable.

## conclusión
### guay pero peligroso
los deep fakes pueden ser divertidos para hacer memes o para el cine, pero también se pueden usar para cosas malas, como inventar noticias falsas o hacer creer que alguien dijo algo que nunca dijo. por eso hay que tener mucho ojo y no creerse todo lo que vemos en internet. hay que ser listos y pensar antes de compartir.

## referencias
- busca en youtube "cómo se hacen los deepfakes explicación", hay vídeos muy visuales.
- artículos sobre gans (redes generativas antagónicas) si te va lo técnico.`,
                tags: ["DeepFake", "IA", "Inteligencia Artificial", "Tecnología", "Vídeos", "Ética"]
            },
            {
                type: "articulo",
                slug: "game-engines-motores-juegos",
                title: "Game Engines",
                date: "2025-05-25",
                excerpt: "sabes qué es un game engine. es como la base sobre la que se construyen casi todos los juegos. te lo cuento.",
                content_md: `## introducción
### ¿qué es un game engine? el corazón de tu juego
un game engine o motor de videojuego es como una caja de herramientas gigante para los que hacen juegos. en vez de empezar de cero cada vez, los programadores usan estos motores que ya tienen un montón de cosas hechas. es como si para construir una casa ya tuvieras los planos de la electricidad, las tuberías y hasta algunas paredes.

## ¿cómo funciona?
### ¿qué traen estos motores?
pues traen de todo un poco para que hacer un juego sea más "fácil" (entre comillas, que sigue siendo un currazo):
- **gráficos 3d y 2d**: para que se vean los personajes, los escenarios... todo lo visual.
- **físicas**: para que las cosas se caigan, reboten o exploten de forma realista (o no, si quieres un juego loco).
- **sonido**: para la música, los efectos de disparos, los pasos...
- **inteligencia artificial (básica)**: para que los enemigos te persigan o los personajes no jugadores hagan cosas.
- **animaciones**: para que los personajes se muevan.
- **interfaz de usuario**: para los menús, los botones, la vida del personaje, etc.

algunos motores famosos son unity (que se usa para un montón de juegos indie y también grandes) y unreal engine (que es una pasada para gráficos súper realistas). pero hay muchos más.

## conclusión
### imprescindibles para crear
hoy en día, casi nadie hace un juego desde cero patatero. los game engines ahorran muchísimo tiempo y permiten a los creadores centrarse en lo divertido: la historia, el diseño de niveles y que el juego mole. si quieres hacer juegos, aprender a usar un motor es un paso casi obligatorio.

## referencias
- échale un ojo a las páginas de unity y unreal engine. tienen tutoriales y ejemplos que flipas.
- hay canales en youtube de gente que enseña a usar estos motores, busca "tutorial unity español" o "tutorial unreal engine español".`,
                tags: ["Game Engines", "Unity", "Unreal Engine", "Videojuegos", "Desarrollo de Juegos", "Programación"]
            },
            {
                type: "articulo",
                slug: "crear-nuevo-lenguaje-programacion",
                title: "¿Para Qué Crear un Nuevo Lenguaje de Programación?",
                date: "2025-05-26",
                excerpt: "por qué la gente se inventa lenguajes de programación nuevos si ya hay un montón. tiene su lógica, ya verás.",
                content_md: `## introducción
### ¿más lenguajes? en serio
seguro que has oído hablar de python, javascript, java... hay un montón de lenguajes de programación. entonces, ¿por qué alguien se pondría a crear uno nuevo? ¿no es complicarse la vida? pues... a veces tiene mucho sentido.

## ¿cómo funciona? (o sea, ¿por qué se crean?)
### razones para la aventura
crear un lenguaje nuevo es un currazo, pero la gente lo hace por varias razones:
1.  **resolver un problema específico**: a lo mejor los lenguajes que hay no son perfectos para una tarea muy concreta. por ejemplo, un lenguaje para controlar robots de una forma súper sencilla, o uno para música, o para hacer juegos como lobster.
2.  **hacerlo más fácil o seguro**: algunos lenguajes son un poco liosos o es fácil cometer errores con ellos. un lenguaje nuevo puede intentar ser más claro, más seguro (que no se rompa tanto) o más rápido de escribir.
3.  **probar ideas nuevas**: a los programadores les encanta experimentar. un lenguaje nuevo puede ser una forma de probar formas diferentes de decirle al ordenador lo que tiene que hacer. como inventar una nueva forma de cocinar.
4.  **aprender un montón**: crear un lenguaje, aunque sea simple, te enseña una barbaridad sobre cómo funcionan los ordenadores y la programación por dentro. es un desafío mental.

### ¿y qué necesita un lenguaje para empezar?
como mínimo, necesitas:
- **una sintaxis**: las reglas de cómo se escribe el código. como la gramática de un idioma.
- **un intérprete o compilador**: un programa que traduzca tu nuevo lenguaje a algo que el ordenador entienda (código máquina). el intérprete lo hace línea por línea, el compilador lo traduce todo de golpe.
- **funciones básicas**: para hacer cosas como sumar, guardar datos, mostrar mensajes...

## conclusión
### innovar mola
aunque ya tengamos muchas herramientas, siempre hay espacio para mejorar o para probar cosas nuevas. los lenguajes de programación evolucionan, y crear nuevos es parte de esa evolución. quién sabe si el próximo lenguaje súper famoso lo está creando ahora mismo alguien como tú.

## referencias
- busca "cómo crear tu propio lenguaje de programación", hay artículos y libros para los muy cafeteros.
- investiga sobre la historia de lenguajes como python o javascript, verás por qué se crearon.`,
                tags: ["Programación", "Lenguajes de Programación", "Compiladores", "Innovación", "Tecnología", "DIY"],
            }
        ];

        this.renderPortfolioItems("all");                                       // Renderiza todos los items inicialmente
        this.initPortfolioFilters();                                            // Inicializa los botones de filtro
    },

    /**
     * Renderiza los items del portfolio en el DOM según el filtro aplicado.
     * @param {string} filter - El tipo de item a mostrar ("all", "proyecto", "articulo").
     */
    renderPortfolioItems(filter) {
        if (!this.config.portfolioGrid) return;

        const currentCards = this.gsap.utils.toArray(this.config.portfolioGrid.children); // Animación de salida para los items actuales
        this.gsap.to(currentCards, {
            opacity: 0,
            y: -15,                                                             // Mover hacia arriba al desaparecer
            stagger: 0.05,
            duration: 0.3,
            ease: "power1.in",
            onComplete: () => {
                this.config.portfolioGrid.innerHTML = "";                       // Limpia el grid

                const filteredItems = filter === "all" ?                        // Filtra los items
                    this.state.allPortfolioItems :
                    this.state.allPortfolioItems.filter(item => item.type === filter);

                filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordena los items por fecha descendente


                if (filteredItems.length === 0) {
                    this.config.portfolioGrid.innerHTML = `<p class="no-items-message">no hay ${filter !== "all" ? filter + "s" : "elementos"} que coincidan.</p>`;
                    return;
                }

                filteredItems.forEach((item, index) => {                        // Crea y añade las nuevas tarjetas
                    const card = document.createElement("div");
                    card.className = "portfolio-card";

                    const tagsHTML = item.tags ? item.tags.map(tag => `<span class="card-tag">${tag}</span>`).join("") : "";
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

                    card.innerHTML = `
                        <span class="card-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-excerpt">${item.excerpt}</p>
                        ${dateFormatted ? `<p class="card-date">${dateFormatted}</p>` : ""}
                        ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ""}
                        <button class="card-cta-btn read-more-btn" data-slug="${item.slug}">> VER_DETALLES</button>
                    `;
                    this.config.portfolioGrid.appendChild(card);

                    this.gsap.from(card, {                                      // Animación de entrada para la nueva tarjeta
                        opacity: 0,
                        y: 15,                                                  // Mover hacia abajo al aparecer
                        duration: 0.4,
                        delay: index * 0.07,                                    // Delay escalonado
                        ease: "power1.out"
                    });
                });

                this.initFeatherIcons();                                        // Re-inicializa los iconos
                this.addPortfolioEventListeners();                              // Añade listeners a los nuevos botones "VER_DETALLES"
                this.ScrollTrigger.refresh();                                   // Actualiza ScrollTrigger
            }
        });
    },

    /**
     * Inicializa los botones de filtro del portfolio.
     */
    initPortfolioFilters() {
        const filterButtons = document.querySelectorAll(".filter-btn");
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener("click", () => {
                    filterButtons.forEach(btn => btn.classList.remove("active")); // Quita clase activa de todos
                    button.classList.add("active");                             // Añade clase activa al clicado
                    this.renderPortfolioItems(button.dataset.filter);           // Renderiza según el filtro
                });
            });
        }
    },

    /**
     * Añade event listeners a los botones "VER_DETALLES" de las tarjetas del portfolio.
     */
    addPortfolioEventListeners() {
        const readMoreButtons = this.config.portfolioGrid.querySelectorAll(".read-more-btn");
        readMoreButtons.forEach(button => {
            const newButton = button.cloneNode(true);                           // Clona y reemplaza para evitar listeners duplicados
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener("click", (event) => {
                event.preventDefault();
                const slug = newButton.dataset.slug;
                const item = this.state.allPortfolioItems.find(pItem => pItem.slug === slug);
                if (item) {
                    this.openPortfolioModal(item);
                }
            });
        });
    },

    /**
     * Abre el modal con los detalles de un item del portfolio.
     * @param {object} item - El objeto del item del portfolio a mostrar.
     */
    openPortfolioModal(item) {
        if (!this.config.portfolioModal || this.state.isModalOpen) return;

        this.state.isModalOpen = true;
        this.config.portfolioModal.querySelector("#modal-title").textContent = item.title;
        this.config.portfolioModal.querySelector("#modal-date").textContent = new Date(item.date).toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric"
        });
        this.config.portfolioModal.querySelector("#modal-type").textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);

        const modalBody = this.config.portfolioModal.querySelector("#modal-body");
        if (this.marked && this.hljs) {                                         // Parsea el contenido Markdown si marked.js y hljs están disponibles
            modalBody.innerHTML = this.marked.parse(item.content_md);
            modalBody.querySelectorAll("pre code").forEach(block => this.hljs.highlightElement(block));
        } else {                                                                // Fallback si no hay parser Markdown
            modalBody.innerHTML = `<p>${item.excerpt}</p><p>el contenido completo no está disponible (parser no cargado).</p>`;
        }

        const modalLinks = this.config.portfolioModal.querySelector("#modal-links");
        modalLinks.innerHTML = "";                                              // Limpia enlaces anteriores
        if (item.links && item.links.length > 0) {
            item.links.forEach(link => {
                const linkElement = document.createElement("a");
                linkElement.href = link.url;
                linkElement.target = "_blank";
                linkElement.rel = "noopener noreferrer";
                linkElement.innerHTML = `<span>${link.text}</span> ${link.icon ? `<i data-feather="${link.icon}"></i>` : '<i data-feather="external-link"></i>'}`;
                modalLinks.appendChild(linkElement);
            });
            this.initFeatherIcons();                                            // Para los iconos de los enlaces
        }

        this.config.portfolioModal.classList.add("active");
        document.body.style.overflow = "hidden";                                // Evita scroll del body mientras el modal está abierto

        this.gsap.fromTo(this.config.portfolioModal.querySelector(".modal-content"), // Animación de entrada del modal
            { opacity: 0, scale: 0.95, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power1.out" }
        );
    },

    /**
     * Cierra el modal del portfolio.
     */
    closePortfolioModal() {
        if (this.state.isModalOpen && this.config.portfolioModal) {
            this.gsap.to(this.config.portfolioModal.querySelector(".modal-content"), { // Animación de salida del modal
                opacity: 0,
                scale: 0.95,
                y: 15,
                duration: 0.25,
                ease: "power1.in",
                onComplete: () => {
                    this.config.portfolioModal.classList.remove("active");
                    document.body.style.overflow = "";                          // Restaura scroll del body
                    this.state.isModalOpen = false;
                }
            });
        }
    },

    /**
     * Inicializa el botón "volver arriba".
     * Muestra el botón cuando se ha hecho suficiente scroll.
     */
    initBackToTop() {
        if (this.config.backToTopButton) {
            window.addEventListener("scroll", () => {
                if (this.state.isPreloading) return;
                this.config.backToTopButton.classList.toggle("visible", window.pageYOffset > 250);
            }, { passive: true });

            this.config.backToTopButton.addEventListener("click", () => {
                this.gsap.to(window, {
                    duration: 0.7,
                    scrollTo: 0,
                    ease: "power1.inOut"
                });
            });
        }
    },

    /**
     * Inicializa los botones de copiar texto al portapapeles.
     * Busca elementos con la clase .copy-btn.
     */
    initCopyButtons() {
        document.querySelectorAll(".copy-btn").forEach(button => {
            const newButton = button.cloneNode(true);                           // Clona y reemplaza para evitar múltiples listeners
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener("click", (event) => {
                const targetElement = event.currentTarget.previousElementSibling; // Asume que el texto a copiar está justo antes
                const textToCopy = targetElement.dataset.address || targetElement.textContent;

                navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                    const originalHTML = newButton.innerHTML;
                    newButton.innerHTML = '<i data-feather="check"></i>';       // Icono de "copiado"
                    newButton.classList.add("copied");
                    this.initFeatherIcons();                                    // Actualiza el icono
                    setTimeout(() => {
                        newButton.innerHTML = originalHTML;
                        newButton.classList.remove("copied");
                        this.initFeatherIcons();                                // Restaura el icono original
                    }, 1500);
                }).catch(err => {
                    console.error("Error al copiar:", err);
                });
            });
        });
    }
};

// Inicializa la aplicación cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => App.init());

// Event listener global para la tecla Escape (cierra el modal)
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && App.state.isModalOpen) {
        App.closePortfolioModal();
    }
});

// Event listeners para cerrar el modal (botón de cierre y clic fuera del contenido)
if (App.config.modalCloseBtn) {
    App.config.modalCloseBtn.addEventListener("click", () => App.closePortfolioModal());
}
if (App.config.portfolioModal) {
    App.config.portfolioModal.addEventListener("click", (event) => {
        if (event.target === App.config.portfolioModal) {                       // Cierra si se hace clic en el fondo del modal
            App.closePortfolioModal();
        }
    });
}
