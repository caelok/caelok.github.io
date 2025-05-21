const App = {
    gsap: window.gsap,
    ScrollToPlugin: window.ScrollToPlugin,
    ScrollTrigger: window.ScrollTrigger,
    THREE: window.THREE,
    marked: window.marked,
    hljs: window.hljs,
    config: {
        themeToggleButton: document.getElementById("theme-toggle"),
        themes: ["light-paper", "dark-terminal"],
        themeIcons: ["sun", "moon"],
        currentThemeIndex: 0,
        navbar: document.getElementById("main-header"),
        navbarLinksContainer: document.querySelector(".navbar-links"),
        preloader: document.getElementById("preloader"),
        preloaderLogo: document.querySelector(".preloader-logo"),
        preloaderLogoGlitch: document.querySelector(".preloader-logo-glitch"),
        preloaderStatusBar: document.querySelector(".preloader-bar-inner"),
        preloaderStatusText: document.querySelector(".preloader-status-text"),
        preloaderPercentage: document.querySelector(".preloader-percentage"),
        cursor: document.querySelector(".custom-cursor"),
        heroParticlesCanvas: document.getElementById("hero-particles-canvas"),
        portfolioGrid: document.querySelector(".portfolio-grid"),
        portfolioModal: document.getElementById("portfolio-modal"),
        modalCloseBtn: document.querySelector("#portfolio-modal .modal-close"),
        backToTopButton: document.getElementById("back-to-top"),
        asciiCanvas: document.getElementById("ascii-canvas"),
        toggleAnimationBtn: document.getElementById("toggle-animation-btn"),
        navbarHeight: 60
    },
    state: {
        lastScrollTop: 0,
        isModalOpen: !1,
        heroScene: null,
        allPortfolioItems: [],
        isPreloading: !0,
        asciiAnimationId: null,
        isAsciiAnimationPaused: !1
    },
    init() {
        if (!this.gsap || !this.ScrollToPlugin || !this.ScrollTrigger) {
            console.error("GSAP or its plugins not loaded!"), this.config.preloader && (this.config.preloader.style.display = "none"), this.state.isPreloading = !1, this.onPreloaderComplete();
            return
        }
        this.gsap.registerPlugin(this.ScrollToPlugin, this.ScrollTrigger), this.initPreloader(), this.initTheme(), this.initCustomCursor(), this.initNavbar(), this.initFeatherIcons(), this.initPortfolioData(), this.initBackToTop(), this.initCopyButtons(), this.config.asciiCanvas && this.initAsciiPlayground()
    },
    initFeatherIcons() {
        "undefined" != typeof feather && feather.replace({
            width: "1em",
            height: "1em",
            "stroke-width": 1.5
        })
    },
    initPreloader() {
        if (!this.config.preloader) {
            this.state.isPreloading = !1, this.onPreloaderComplete();
            return
        }
        document.body.style.overflow = "hidden";
        let e = this.gsap.timeline({
            onComplete: () => {
                this.state.isPreloading = !1, this.onPreloaderComplete()
            }
        }),
            t = {
                value: 0
            };
        this.config.preloaderStatusText && (this.config.preloaderStatusText.textContent = "LOADING"), this.config.preloaderPercentage && (this.config.preloaderPercentage.textContent = "0%"), e.fromTo([this.config.preloaderLogo, this.config.preloaderLogoGlitch], {
            opacity: 0,
            scale: .7,
            rotate: -5
        }, {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: .7,
            ease: "back.out(1.2)"
        }, .1).fromTo([this.config.preloaderStatusText, this.config.preloaderPercentage], {
            opacity: 0,
            y: 10
        }, {
            opacity: 1,
            y: 0,
            duration: .4,
            ease: "power1.out",
            stagger: .1
        }, .4).fromTo(this.config.preloader.querySelector(".preloader-bar"), {
            opacity: 0
        }, {
            opacity: 1,
            duration: .2
        }, .6), e.to(t, {
            value: 100,
            duration: 1.5,
            ease: "power1.inOut",
            onUpdate: () => {
                this.config.preloaderStatusBar && (this.config.preloaderStatusBar.style.width = `${t.value}%`), this.config.preloaderPercentage && (this.config.preloaderPercentage.textContent = `${Math.round(t.value)}%`)
            }
        }, .7), e.to(this.config.preloader, {
            opacity: 0,
            duration: .6,
            ease: "power2.in",
            delay: .3
        }).set(this.config.preloader, {
            display: "none"
        })
    },
    onPreloaderComplete() {
        document.body.style.overflow = "", this.animateHeroIntro(), this.THREE && this.config.heroParticlesCanvas && this.initHeroParticles(), this.initScrollAnimations(), this.config.asciiCanvas && null === this.state.asciiAnimationId && !this.state.isAsciiAnimationPaused && this.startAsciiAnimation()
    },
    initTheme() {
        let e = localStorage.getItem("caelok-ae-theme-v2"),
            t = window.matchMedia("(prefers-color-scheme: light)").matches,
            o = "light-paper";
        o = e || (t ? "light-paper" : "dark-terminal"), this.config.currentThemeIndex = this.config.themes.indexOf(o), -1 === this.config.currentThemeIndex && (this.config.currentThemeIndex = 0), this.applyCurrentTheme(), this.config.themeToggleButton && this.config.themeToggleButton.addEventListener("click", () => {
            this.config.currentThemeIndex = (this.config.currentThemeIndex + 1) % this.config.themes.length, this.applyCurrentTheme()
        })
    },
    applyCurrentTheme() {
        let e = this.config.themes[this.config.currentThemeIndex];
        if (document.body.dataset.theme = e, localStorage.setItem("caelok-ae-theme-v2", e), this.config.themeToggleButton) {
            let t = this.config.themeIcons[this.config.currentThemeIndex];
            this.config.themeToggleButton.innerHTML = `<i data-feather="${t}" class="theme-icon"></i>`, this.initFeatherIcons()
        }
        this.setBodyRgbVariable("--bg-color", "--bg-color-rgb", "light-paper" === e ? "240,239,230" : "10,10,10"), this.setBodyRgbVariable("--accent-color", "--accent-rgb", "light-paper" === e ? "255,69,0" : "0,207,69"), this.state.heroScene && this.state.heroScene.updateColors && this.state.heroScene.updateColors(), this.config.asciiCanvas && this.state.asciiCube && (this.state.asciiCube.char = "light-paper" === e ? "@" : "*")
    },
    setBodyRgbVariable(e, t, o) {
        let i = getComputedStyle(document.body).getPropertyValue(e).trim();
        try {
            i.startsWith("#") ? document.documentElement.style.setProperty(t, (function e(t) {
                3 === (t = t.replace(/^#/, "")).length && (t = t.split("").map(e => e + e).join(""));
                let o = parseInt(t, 16);
                return [o >> 16 & 255, o >> 8 & 255, 255 & o]
            })(i).join(",")) : document.documentElement.style.setProperty(t, o)
        } catch (a) {
            console.warn(`Failed to parse ${e} for ${t}`, a), document.documentElement.style.setProperty(t, o)
        }
    },
    initCustomCursor() {
        this.config.cursor && window.addEventListener("mousemove", e => {
            this.gsap.to(this.config.cursor, {
                duration: .05,
                x: e.clientX,
                y: e.clientY,
                ease: "none"
            })
        }, {
            passive: !0
        })
    },
    initNavbar() {
        if (!this.config.navbar) return;
        let e = 0,
            t = this.config.navbarHeight;
        window.addEventListener("scroll", () => {
            if (this.state.isPreloading) return;
            let o = window.pageYOffset || document.documentElement.scrollTop;
            this.config.navbar.classList.toggle("scrolled", o > 20), o > e && o > t ? this.config.navbar.classList.add("hidden") : o + window.innerHeight < document.documentElement.scrollHeight - t / 2 && this.config.navbar.classList.remove("hidden"), e = o <= 0 ? 0 : o
        }, {
            passive: !0
        });
        let o = document.querySelectorAll(".nav-item");
        o.forEach(e => {
            e.addEventListener("click", o => {
                o.preventDefault();
                let i = e.getAttribute("href"),
                    a = document.querySelector(i);
                a && this.gsap.to(window, {
                    duration: .8,
                    scrollTo: {
                        y: a,
                        offsetY: .7 * t
                    },
                    ease: "power2.inOut"
                })
            })
        });
        let i = this.gsap.utils.toArray(".content-section, .hero-section");
        i.forEach(e => {
            this.ScrollTrigger.create({
                trigger: e,
                start: () => `top ${t + .2 * window.innerHeight}px`,
                end: () => `bottom ${t + .2 * window.innerHeight}px`,
                toggleClass: {
                    targets: `a[href="#${e.id}"]`,
                    className: "active"
                }
            })
        })
    },
    animateHeroIntro() {
        if (this.state.isPreloading) return;
        let e = this.gsap.timeline({
            delay: .1
        });
        e.from(".hero-logo-main", {
            opacity: 0,
            y: 40,
            scale: .7,
            duration: 1.2,
            ease: "elastic.out(0.8, 0.5)"
        }).from(".hero-title", {
            opacity: 0,
            y: 25,
            duration: .7,
            ease: "power2.out"
        }, "-=0.8").from(".hero-subtitle", {
            opacity: 0,
            y: 20,
            duration: .6,
            ease: "power2.out"
        }, "-=0.6").from(".hero-cta", {
            opacity: 0,
            y: 15,
            duration: .5,
            ease: "power2.out"
        }, "-=0.4").from(".scroll-indicator-wrapper", {
            opacity: 0,
            y: 10,
            duration: .7,
            ease: "power1.out"
        }, "-=0.2")
    },
    initHeroParticles() {
        if (!this.THREE || !this.config.heroParticlesCanvas) return;
        let e = new this.THREE.Scene,
            t = new this.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1e3);
        t.position.z = 2.8;
        let o = new this.THREE.WebGLRenderer({
            canvas: this.config.heroParticlesCanvas,
            alpha: !0,
            antialias: !0
        });
        o.setSize(window.innerWidth, window.innerHeight), o.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        let i = new Float32Array(10500),
            a = new Float32Array(10500),
            n = new Float32Array(3500),
            r = new this.THREE.BufferGeometry,
            s = () => {
                let e = new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--accent-color").trim()),
                    t = new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--text-color").trim()),
                    o = [e, t, e.clone().lerp(t, .5)];
                for (let s = 0; s < 3500; s++) {
                    i[3 * s] = (Math.random() - .5) * 10, i[3 * s + 1] = (Math.random() - .5) * 10, i[3 * s + 2] = (Math.random() - .5) * 10;
                    let l = o[Math.floor(Math.random() * o.length)];
                    a[3 * s] = l.r, a[3 * s + 1] = l.g, a[3 * s + 2] = l.b, n[s] = .8 * Math.random() + .2
                }
                r.setAttribute("position", new this.THREE.BufferAttribute(i, 3)), r.setAttribute("color", new this.THREE.BufferAttribute(a, 3)), r.setAttribute("randomFactor", new this.THREE.BufferAttribute(n, 1)), r.attributes.position && (r.attributes.position.needsUpdate = !0), r.attributes.color && (r.attributes.color.needsUpdate = !0), r.attributes.randomFactor && (r.attributes.randomFactor.needsUpdate = !0)
            };
        s();
        let l = new this.THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 0
                },
                pointTexture: {
                    value: new this.THREE.TextureLoader().load("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==")
                }
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
                     // Pulsating size based on randomFactor and time
                     float sizePulse = sin(time * randomFactor * 2.0 + randomFactor * 6.28) * 0.3 + 0.7;
                     gl_PointSize = (40.0 / -mvPosition.z) * randomFactor * sizePulse;
                     gl_Position = projectionMatrix * mvPosition;
                 }
             `,
            fragmentShader: `
                 uniform sampler2D pointTexture;
                 varying vec3 vColor;
                 varying float vRandomFactor; // Use this for opacity or other effects
                 void main() {
                     float opacity = (sin(vRandomFactor * 10.0) * 0.2 + 0.6) * 0.8; // Varied opacity
                     gl_FragColor = vec4(vColor, opacity) * texture2D(pointTexture, gl_PointCoord);
                 }
             `,
            blending: this.THREE.AdditiveBlending,
            depthTest: !1,
            transparent: !0
        }),
            c = new this.THREE.Points(r, l);
        e.add(c), this.state.heroScene = {
            updateColors: s,
            particles: c,
            material: l
        };
        let d = new this.THREE.Vector2;
        document.addEventListener("mousemove", e => {
            d.x = e.clientX / window.innerWidth * 2 - 1, d.y = -(2 * (e.clientY / window.innerHeight)) + 1
        }, {
            passive: !0
        });
        let p = new this.THREE.Clock,
            h = () => {
                requestAnimationFrame(h);
                let i = p.getElapsedTime();
                l.uniforms.time.value = i, c.position.x += (.05 * d.x - c.position.x) * .015, c.position.y += (.05 * d.y - c.position.y) * .015, c.rotation.y = .015 * i, o.render(e, t)
            };
        h(), window.addEventListener("resize", () => {
            t.aspect = window.innerWidth / window.innerHeight, t.updateProjectionMatrix(), o.setSize(window.innerWidth, window.innerHeight)
        }, {
            passive: !0
        })
    },
    initScrollAnimations() {
        this.state.isPreloading || (this.gsap.utils.toArray(".section-title").forEach(e => {
            this.gsap.from(e, {
                opacity: 0,
                y: 25,
                duration: .7,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: e,
                    start: "top 90%",
                    once: !0
                }
            })
        }), this.gsap.utils.toArray(".about-text p, .skills-list li, .portfolio-card, .connect-text p, .connect-email-link, .social-icons a, .crypto-item, .playground-container").forEach((e, t) => {
            this.gsap.from(e, {
                opacity: 0,
                y: 20,
                duration: .5,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: e,
                    start: "top 92%",
                    once: !0
                },
                delay: t % 4 * .07
            })
        }))
    },
    initAsciiPlayground() {
        if (!this.config.asciiCanvas) return;
        let e = this.config.asciiCanvas,
            t = 0,
            o = [
                [-1, -1, -1],
                [1, -1, -1],
                [1, 1, -1],
                [-1, 1, -1],
                [-1, -1, 1],
                [1, -1, 1],
                [1, 1, 1],
                [-1, 1, 1]
            ],
            i = [
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 0],
                [4, 5],
                [5, 6],
                [6, 7],
                [7, 4],
                [0, 4],
                [1, 5],
                [2, 6],
                [3, 7]
            ];
        this.state.asciiCube = {
            char: "light-paper" === document.body.dataset.theme ? "@" : "*"
        };
        let a = () => {
            if (this.state.isAsciiAnimationPaused) return;
            let n = Array(20).fill(null).map(() => Array(40).fill(" ")),
                r = Array(20).fill(null).map(() => Array(40).fill(1 / 0));
            t += .02;
            let s = Math.cos(t),
                l = Math.sin(t),
                c = o.map(e => {
                    let t = e[0],
                        o = e[1],
                        i = e[2],
                        a = t * l + i * s,
                        n = o * s - a * l;
                    return a = o * l + a * s, [t * s - i * l, n, a + 5]
                }),
                d = (e, t, o) => {
                    let i = 2 / o;
                    return [Math.floor(e * i * 10 + 20), Math.floor(-t * i * 10 + 10)]
                },
                p = (e, t, o, i) => {
                    e >= 0 && e < 40 && t >= 0 && t < 20 && o < r[t][e] && (n[t][e] = i, r[t][e] = o)
                },
                h = (e, t, o, i, a) => {
                    let n = e[0],
                        r = e[1],
                        s = t[0],
                        l = t[1],
                        c = Math.abs(s - n),
                        d = n < s ? 1 : -1,
                        h = -Math.abs(l - r),
                        g = r < l ? 1 : -1,
                        u = c + h,
                        m, f;
                    for (; ;) {
                        let $ = n === s && r === l ? 0 : Math.sqrt(Math.pow(n - e[0], 2) + Math.pow(r - e[1], 2)) / Math.sqrt(Math.pow(s - e[0], 2) + Math.pow(l - e[1], 2));
                        if (p(n, r, f = o * (1 - $) + i * $, a), n === s && r === l) break;
                        (m = 2 * u) >= h && (u += h, n += d), m <= c && (u += c, r += g)
                    }
                },
                g = c.map(e => d(e[0], e[1], e[2]));
            i.forEach(e => {
                let t = g[e[0]],
                    o = g[e[1]],
                    i = c[e[0]][2],
                    a = c[e[1]][2];
                h(t, o, i, a, this.state.asciiCube.char)
            }), e.textContent = n.map(e => e.join("")).join("\n"), this.state.asciiAnimationId = requestAnimationFrame(a)
        };
        this.startAsciiAnimation = () => {
            this.state.asciiAnimationId && cancelAnimationFrame(this.state.asciiAnimationId), this.state.isAsciiAnimationPaused = !1, this.config.toggleAnimationBtn && (this.config.toggleAnimationBtn.textContent = "> PAUSAR_ANIMACI\xd3N"), a()
        }, this.pauseAsciiAnimation = () => {
            this.state.asciiAnimationId && cancelAnimationFrame(this.state.asciiAnimationId), this.state.isAsciiAnimationPaused = !0, this.config.toggleAnimationBtn && (this.config.toggleAnimationBtn.textContent = "> REANUDAR_ANIMACI\xd3N")
        }, this.config.toggleAnimationBtn && this.config.toggleAnimationBtn.addEventListener("click", () => {
            this.state.isAsciiAnimationPaused ? this.startAsciiAnimation() : this.pauseAsciiAnimation()
        })
    },
    initPortfolioData() {
        this.state.allPortfolioItems = [{
            type: "proyecto",
            slug: "swosh",
            title: "Swosh",
            date: "2024-Ongoing",
            excerpt: "Base de datos NoSQL experimental, escrita puramente en TypeScript, enfocada en estructuras de datos flexibles y un API simple. Proyecto personal de aprendizaje.",
            content_md: "### Proyecto Personal: Swosh (TypeScript)\n\nSwosh es una base de datos NoSQL de tipo clave-valor que estoy desarrollando en TypeScript como un proyecto personal. El objetivo principal es profundizar en los conceptos de dise\xf1o de bases de datos, la programaci\xf3n as\xedncrona en Node.js/TypeScript y la creaci\xf3n de APIs de bajo nivel.\n\n**Caracter\xedsticas Actuales/Planeadas:**\n\n* **Core en TypeScript con Node.js:** Aprovechando el tipado est\xe1tico y el ecosistema de Node.js.\n* **Modelo Clave-Valor:** Almacenamiento en memoria de pares clave-valor.\n* **Soporte para Tipos de Datos:** Strings, Listas (con operaciones como PUSH, POP, RANGE).\n* **Protocolo TCP:** Un protocolo simple basado en texto sobre TCP para la comunicaci\xf3n cliente-servidor.\n* **Persistencia (Futura):** Mecanismos como AOF (Append-Only File) o snapshots.\n* **Pruebas Unitarias:** Utilizando Jest o similar para asegurar la fiabilidad.\n\n**Motivaci\xf3n y Aprendizaje:**\n\nEste proyecto naci\xf3 de mi curiosidad por entender c\xf3mo funcionan internamente las bases de datos como Redis. Desarrollar Swosh me est\xe1 permitiendo explorar:\n\n* Manejo de buffers y streams en Node.js.\n* Dise\xf1o de un parser para un lenguaje de comandos simple.\n* Estrategias de concurrencia y manejo de estado en una aplicaci\xf3n de servidor.\n* La importancia de una API bien definida y testeada.\n\nSwosh es un campo de pruebas y aprendizaje continuo. El c\xf3digo y progreso se encuentran en [github.com/caelok/swosh](https://github.com/caelok/swosh).",
            tags: ["TypeScript", "Node.js", "NoSQL", "Bases de Datos", "Open Source", "Personal"],
            links: [{
                text: "Ver en GitHub",
                url: "https://github.com/caelok/swosh",
                icon: "github"
            }]
        }, {
            type: "articulo",
            slug: "machine-learning-intro",
            title: "Explorando el Machine Learning",
            date: "2025-05-20",
            excerpt: "Una introducci\xf3n a los conceptos b\xe1sicos del Machine Learning, sus tipos y c\xf3mo est\xe1 cambiando el mundo.",
            content_md: `## Explorando el Machine Learning
 
 El Machine Learning (ML) es una rama fascinante de la inteligencia artificial. En lugar de programar expl\xedcitamente una computadora para cada tarea, le damos datos y dejamos que aprenda patrones para tomar decisiones o hacer predicciones.
 
 ### Tipos Comunes:
 
 * **Aprendizaje Supervisado:** Entrenamos al modelo con datos que ya tienen la "respuesta correcta". Como aprender con ejemplos resueltos.
     * *Ejemplo:* Clasificar correos como spam o no spam.
 * **Aprendizaje No Supervisado:** El modelo busca patrones en datos sin etiquetar. Como encontrar grupos naturales en una colecci\xf3n de objetos.
     * *Ejemplo:* Agrupar clientes con comportamientos de compra similares.
 * **Aprendizaje por Refuerzo:** El modelo aprende interactuando con un entorno, recibiendo recompensas o castigos por sus acciones. Como entrenar a una mascota.
     * *Ejemplo:* Un programa que aprende a jugar ajedrez ganando o perdiendo partidas.
 
 El ML ya est\xe1 en muchos lugares: sistemas de recomendaci\xf3n (Netflix, Spotify), reconocimiento de voz (Siri, Alexa) y mucho m\xe1s. Es un campo con un potencial enorme.`,
            tags: ["ML", "IA", "Python", "Conceptos"]
        }, {
            type: "articulo",
            slug: "lenguajes-poderosos",
            title: "Go, Rust, Python, TS: Mis Herramientas",
            date: "2025-03-10",
            excerpt: "Un vistazo a algunos de los lenguajes que uso y por qu\xe9 me parecen interesantes para diferentes tipos de proyectos.",
            content_md: `## Go, Rust, Python, TS: Mis Herramientas
 
 Como programador, tener un buen conjunto de herramientas es clave. Estos son algunos de los lenguajes con los que he trabajado y me gustan:
 
 * **TypeScript (TS):** Es JavaScript con superpoderes. El tipado est\xe1tico me ayuda a evitar muchos errores antes de ejecutar el c\xf3digo. Lo uso mucho para desarrollo web (frontend con React/Vue, backend con Node.js) y proyectos como Swosh.
 
 * **Python:** S\xfaper vers\xe1til y f\xe1cil de aprender. Genial para scripting r\xe1pido, an\xe1lisis de datos, Machine Learning y desarrollo web con frameworks como Django o Flask.
 
 * **Go (Golang):** Me gusta por su simplicidad y eficiencia para construir servicios de red y herramientas de l\xednea de comandos. Su manejo de concurrencia con goroutines es muy potente.
 
 * **Rust:** Es un lenguaje que me atrae mucho por su enfoque en la seguridad de memoria sin un recolector de basura, y su rendimiento. Ideal para programaci\xf3n de sistemas o cuando necesitas velocidad y control total.
 
 Cada lenguaje tiene sus fortalezas. Elegir el adecuado depende del problema que quieras resolver. A menudo, la mejor soluci\xf3n implica combinar varios.`,
            tags: ["TypeScript", "Python", "Go", "Rust", "Dev"]
        },], this.renderPortfolioItems("all"), this.initPortfolioFilters()
    },
    renderPortfolioItems(e) {
        if (!this.config.portfolioGrid) return;
        let t = this.gsap.utils.toArray(this.config.portfolioGrid.children);
        this.gsap.to(t, {
            opacity: 0,
            y: -15,
            stagger: .05,
            duration: .3,
            ease: "power1.in",
            onComplete: () => {
                this.config.portfolioGrid.innerHTML = "";
                let t = "all" === e ? this.state.allPortfolioItems : this.state.allPortfolioItems.filter(t => t.type === e);
                if (0 === t.length) {
                    this.config.portfolioGrid.innerHTML = `<p class="no-items-message">No hay ${"all" !== e ? e + "s" : "elementos"} que coincidan.</p>`;
                    return
                }
                t.forEach((e, t) => {
                    let o = document.createElement("div");
                    o.className = "portfolio-card";
                    let i = e.tags ? e.tags.map(e => `<span class="card-tag">${e}</span>`).join("") : "";
                    o.innerHTML = `
                         <span class="card-type">${e.type}</span>
                         <h3 class="card-title">${e.title}</h3>
                         <p class="card-excerpt">${e.excerpt}</p>
                         ${e.date ? `<p class="card-date">${new Date(e.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>` : ""}
                         ${i ? `<div class="card-tags">${i}</div>` : ""}
                         <button class="card-cta-btn read-more-btn" data-slug="${e.slug}">> VER_DETALLES</button>
                     `, this.config.portfolioGrid.appendChild(o), this.gsap.from(o, {
                        opacity: 0,
                        y: 15,
                        duration: .4,
                        delay: .07 * t,
                        ease: "power1.out"
                    })
                }), this.initFeatherIcons(), this.addPortfolioEventListeners(), this.ScrollTrigger.refresh()
            }
        })
    },
    initPortfolioFilters() {
        let e = document.querySelectorAll(".filter-btn");
        e.length > 0 && e.forEach(t => {
            t.addEventListener("click", () => {
                e.forEach(e => e.classList.remove("active")), t.classList.add("active"), this.renderPortfolioItems(t.dataset.filter)
            })
        })
    },
    addPortfolioEventListeners() {
        this.config.portfolioGrid.querySelectorAll(".read-more-btn").forEach(e => {
            e.addEventListener("click", t => {
                t.preventDefault();
                let o = e.dataset.slug,
                    i = this.state.allPortfolioItems.find(e => e.slug === o);
                i && this.openPortfolioModal(i)
            })
        })
    },
    openPortfolioModal(e) {
        if (!this.config.portfolioModal || this.state.isModalOpen) return;
        this.state.isModalOpen = !0, this.config.portfolioModal.querySelector("#modal-title").textContent = e.title, this.config.portfolioModal.querySelector("#modal-date").textContent = new Date(e.date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }), this.config.portfolioModal.querySelector("#modal-type").textContent = e.type.charAt(0).toUpperCase() + e.type.slice(1);
        let t = this.config.portfolioModal.querySelector("#modal-body");
        this.marked && this.hljs ? (t.innerHTML = this.marked.parse(e.content_md), t.querySelectorAll("pre code").forEach(e => this.hljs.highlightElement(e))) : t.innerHTML = `<p>${e.excerpt}</p><p>El contenido completo no est\xe1 disponible.</p>`;
        let o = this.config.portfolioModal.querySelector("#modal-links");
        o.innerHTML = "", e.links && e.links.length > 0 && (e.links.forEach(e => {
            let t = document.createElement("a");
            t.href = e.url, t.target = "_blank", t.rel = "noopener noreferrer", t.innerHTML = `<span>${e.text}</span> ${e.icon ? `<i data-feather="${e.icon}"></i>` : '<i data-feather="external-link"></i>'}`, o.appendChild(t)
        }), this.initFeatherIcons()), this.config.portfolioModal.classList.add("active"), document.body.style.overflow = "hidden", this.gsap.fromTo(this.config.portfolioModal.querySelector(".modal-content"), {
            opacity: 0,
            scale: .95,
            y: 15
        }, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: .35,
            ease: "power1.out"
        })
    },
    closePortfolioModal() {
        this.state.isModalOpen && this.config.portfolioModal && this.gsap.to(this.config.portfolioModal.querySelector(".modal-content"), {
            opacity: 0,
            scale: .95,
            y: 15,
            duration: .25,
            ease: "power1.in",
            onComplete: () => {
                this.config.portfolioModal.classList.remove("active"), document.body.style.overflow = "", this.state.isModalOpen = !1
            }
        })
    },
    initBackToTop() {
        this.config.backToTopButton && (window.addEventListener("scroll", () => {
            this.state.isPreloading || this.config.backToTopButton.classList.toggle("visible", window.pageYOffset > 250)
        }, {
            passive: !0
        }), this.config.backToTopButton.addEventListener("click", () => {
            this.gsap.to(window, {
                duration: .7,
                scrollTo: 0,
                ease: "power1.inOut"
            })
        }))
    },
    initCopyButtons() {
        document.querySelectorAll(".copy-btn").forEach(e => {
            let t = e.cloneNode(!0);
            e.parentNode.replaceChild(t, e), t.addEventListener("click", e => {
                let o = e.currentTarget.previousElementSibling,
                    i = o.dataset.address || o.textContent;
                navigator.clipboard.writeText(i.trim()).then(() => {
                    let e = t.innerHTML;
                    t.innerHTML = '<i data-feather="check"></i>', t.classList.add("copied"), this.initFeatherIcons(), setTimeout(() => {
                        t.innerHTML = e, t.classList.remove("copied"), this.initFeatherIcons()
                    }, 1500)
                }).catch(e => console.error("Error al copiar:", e))
            })
        })
    }
};
document.addEventListener("DOMContentLoaded", () => App.init()), window.addEventListener("keydown", e => {
    "Escape" === e.key && App.state.isModalOpen && App.closePortfolioModal()
}), App.config.modalCloseBtn && App.config.modalCloseBtn.addEventListener("click", () => App.closePortfolioModal()), App.config.portfolioModal && App.config.portfolioModal.addEventListener("click", e => {
    e.target === App.config.portfolioModal && App.closePortfolioModal()
});