const App = {
    gsap: window.gsap, ScrollToPlugin: window.ScrollToPlugin, ScrollTrigger: window.ScrollTrigger, THREE: window.THREE, marked: window.marked, hljs: window.hljs,
    config: {
        themeToggleButton: document.getElementById("theme-toggle"), themes: ["light-paper", "dark-terminal"], themeIcons: ["sun", "moon"], currentThemeIndex: 0,
        navbar: document.getElementById("main-header"), navbarLinksContainer: document.querySelector(".navbar-links"), preloader: document.getElementById("preloader"),
        preloaderLogo: document.querySelector(".preloader-logo"), preloaderLogoGlitch: document.querySelector(".preloader-logo-glitch"),
        preloaderStatusBar: document.querySelector(".preloader-bar-inner"), preloaderStatusText: document.querySelector(".preloader-status-text"),
        preloaderPercentage: document.querySelector(".preloader-percentage"), cursor: document.querySelector(".custom-cursor"),
        heroParticlesCanvas: document.getElementById("hero-particles-canvas"), portfolioGrid: document.querySelector(".portfolio-grid"),
        portfolioModal: document.getElementById("portfolio-modal"), modalCloseBtn: document.querySelector("#portfolio-modal .modal-close"),
        backToTopButton: document.getElementById("back-to-top"), asciiCanvas: document.getElementById("ascii-canvas"),
        toggleAnimationBtn: document.getElementById("toggle-animation-btn"), navbarHeight: 60
    },
    state: { lastScrollTop: 0, isModalOpen: false, heroScene: null, allPortfolioItems: [], isPreloading: true, asciiAnimationId: null, isAsciiAnimationPaused: false },

    init() {
        if (!this.gsap || !this.ScrollToPlugin || !this.ScrollTrigger) {
            console.error("GSAP or its plugins not loaded!");
            if (this.config.preloader) this.config.preloader.style.display = "none";
            this.state.isPreloading = false; this.onPreloaderComplete(); return;
        }
        this.gsap.registerPlugin(this.ScrollToPlugin, this.ScrollTrigger);
        this.initPreloader(); this.initTheme(); this.initCustomCursor(); this.initNavbar();
        this.initFeatherIcons(); this.initPortfolioData(); this.initBackToTop(); this.initCopyButtons();
        if (this.config.asciiCanvas) this.initAsciiPlayground();
    },
    initFeatherIcons() { if (typeof feather !== "undefined") feather.replace({ width: "1em", height: "1em", "stroke-width": 1.5 }); },
    initPreloader() {
        if (!this.config.preloader) { this.state.isPreloading = false; this.onPreloaderComplete(); return; }
        document.body.style.overflow = "hidden";
        let tl = this.gsap.timeline({ onComplete: () => { this.state.isPreloading = false; this.onPreloaderComplete(); } });
        let p = { value: 0 };
        if (this.config.preloaderStatusText) this.config.preloaderStatusText.textContent = "LOADING";
        if (this.config.preloaderPercentage) this.config.preloaderPercentage.textContent = "0%";
        tl.fromTo([this.config.preloaderLogo, this.config.preloaderLogoGlitch], { opacity:0, scale:0.7, rotate:-5 }, { opacity:1, scale:1, rotate:0, duration:0.7, ease:"back.out(1.2)" }, 0.1)
          .fromTo([this.config.preloaderStatusText, this.config.preloaderPercentage], { opacity:0, y:10 }, { opacity:1, y:0, duration:0.4, ease:"power1.out", stagger:0.1 }, 0.4)
          .fromTo(this.config.preloader.querySelector(".preloader-bar"), { opacity:0 }, { opacity:1, duration:0.2 }, 0.6)
          .to(p, { value:100, duration:1.5, ease:"power1.inOut", onUpdate: () => {
              if(this.config.preloaderStatusBar) this.config.preloaderStatusBar.style.width = `${p.value}%`;
              if(this.config.preloaderPercentage) this.config.preloaderPercentage.textContent = `${Math.round(p.value)}%`;
          }}, 0.7)
          .to(this.config.preloader, { opacity:0, duration:0.6, ease:"power2.in", delay:0.3 })
          .set(this.config.preloader, { display:"none" });
    },
    onPreloaderComplete() {
        document.body.style.overflow = ""; this.animateHeroIntro();
        if (this.THREE && this.config.heroParticlesCanvas) this.initHeroParticles();
        this.initScrollAnimations();
        if (this.config.asciiCanvas && this.state.asciiAnimationId === null && !this.state.isAsciiAnimationPaused) this.startAsciiAnimation();
    },
    initTheme() {
        let sT = localStorage.getItem("caelok-ae-theme-v2"), pL = window.matchMedia("(prefers-color-scheme: light)").matches;
        let dT = sT || (pL ? "light-paper" : "dark-terminal");
        this.config.currentThemeIndex = this.config.themes.indexOf(dT);
        if (this.config.currentThemeIndex === -1) this.config.currentThemeIndex = 0;
        this.applyCurrentTheme();
        if (this.config.themeToggleButton) this.config.themeToggleButton.addEventListener("click", () => {
            this.config.currentThemeIndex = (this.config.currentThemeIndex + 1) % this.config.themes.length; this.applyCurrentTheme();
        });
    },
    applyCurrentTheme() {
        let tN = this.config.themes[this.config.currentThemeIndex]; document.body.dataset.theme = tN; localStorage.setItem("caelok-ae-theme-v2", tN);
        if (this.config.themeToggleButton) {
            let iN = this.config.themeIcons[this.config.currentThemeIndex];
            this.config.themeToggleButton.innerHTML = `<i data-feather="${iN}" class="theme-icon"></i>`; this.initFeatherIcons();
        }
        this.setBodyRgbVariable("--bg-color", "--bg-color-rgb", tN === "light-paper" ? "240,239,230" : "10,10,10");
        this.setBodyRgbVariable("--accent-color", "--accent-rgb", tN === "light-paper" ? "255,69,0" : "0,207,69");
        if (this.state.heroScene && this.state.heroScene.updateColors) this.state.heroScene.updateColors();
        if (this.config.asciiCanvas && this.state.asciiCube) this.state.asciiCube.char = tN === "light-paper" ? "@" : "*";
    },
    setBodyRgbVariable(cVN, rVN, fR) {
        let cV = getComputedStyle(document.body).getPropertyValue(cVN).trim();
        try {
            if (cV.startsWith("#")) {
                const hTR = (h) => { let sR = /^#?([a-f\d])([a-f\d])([a-f\d])$/i; h = h.replace(sR, (m,r,g,b) => r+r+g+g+b+b); let res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return res ? [parseInt(res[1],16), parseInt(res[2],16), parseInt(res[3],16)] : null; };
                document.documentElement.style.setProperty(rVN, hTR(cV).join(","));
            } else document.documentElement.style.setProperty(rVN, fR);
        } catch (e) { console.warn(`Failed to parse ${cVN} for ${rVN}`,e); document.documentElement.style.setProperty(rVN, fR); }
    },
    initCustomCursor() { if (this.config.cursor) window.addEventListener("mousemove", (e) => { this.gsap.to(this.config.cursor, { duration:0.05, x:e.clientX, y:e.clientY, ease:"none" }); }, {passive:true}); },
    initNavbar() {
        if (!this.config.navbar) return; let lS = 0; const nH = this.config.navbarHeight;
        window.addEventListener("scroll", () => {
            if (this.state.isPreloading) return; let cS = window.pageYOffset || document.documentElement.scrollTop;
            this.config.navbar.classList.toggle("scrolled", cS > 20);
            if (cS > lS && cS > nH) this.config.navbar.classList.add("hidden");
            else if (cS + window.innerHeight < document.documentElement.scrollHeight - nH/2) this.config.navbar.classList.remove("hidden");
            lS = cS <= 0 ? 0 : cS;
        }, {passive:true});
        document.querySelectorAll(".nav-item").forEach(l => {
            l.addEventListener("click", (e) => {
                e.preventDefault(); const tI = l.getAttribute("href"), tE = document.querySelector(tI);
                if (tE) this.gsap.to(window, { duration:0.8, scrollTo:{ y:tE, offsetY:nH*0.7 }, ease:"power2.inOut" });
            });
        });
        this.gsap.utils.toArray(".content-section, .hero-section").forEach(s => {
            this.ScrollTrigger.create({ trigger:s, start:()=>`top ${nH+(window.innerHeight*0.2)}px`, end:()=>`bottom ${nH+(window.innerHeight*0.2)}px`, toggleClass:{targets:`a[href="#${s.id}"]`,className:"active"} });
        });
    },
    animateHeroIntro() {
        if(this.state.isPreloading) return;
        this.gsap.timeline({delay:0.1})
            .from(".hero-logo-main", {opacity:0,y:40,scale:0.7,duration:1.2,ease:"elastic.out(0.8,0.5)"})
            .from(".hero-title", {opacity:0,y:25,duration:0.7,ease:"power2.out"}, "-=0.8")
            .from(".hero-subtitle", {opacity:0,y:20,duration:0.6,ease:"power2.out"}, "-=0.6")
            .from(".hero-cta", {opacity:0,y:15,duration:0.5,ease:"power2.out"}, "-=0.4")
            .from(".scroll-indicator-wrapper", {opacity:0,y:10,duration:0.7,ease:"power1.out"},"-=0.2");
    },
    initHeroParticles() {
        if (!this.THREE || !this.config.heroParticlesCanvas) return;
        const sc = new this.THREE.Scene(), cam = new this.THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000); cam.position.z=2.8;
        const rend = new this.THREE.WebGLRenderer({canvas:this.config.heroParticlesCanvas,alpha:true,antialias:true}); rend.setSize(window.innerWidth,window.innerHeight); rend.setPixelRatio(Math.min(window.devicePixelRatio,2));
        const nP=3500, pos=new Float32Array(nP*3), col=new Float32Array(nP*3), rF=new Float32Array(nP); const geo=new this.THREE.BufferGeometry();
        const uPP = () => {
            const aC=new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--accent-color").trim()), tC=new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--text-color").trim());
            const mC=aC.clone().lerp(tC,0.5), pC=[aC,tC,mC];
            for(let i=0;i<nP;i++){ pos[i*3+0]=(Math.random()-0.5)*10; pos[i*3+1]=(Math.random()-0.5)*10; pos[i*3+2]=(Math.random()-0.5)*10; const cC=pC[Math.floor(Math.random()*pC.length)]; col[i*3+0]=cC.r; col[i*3+1]=cC.g; col[i*3+2]=cC.b; rF[i]=Math.random()*0.8+0.2; }
            geo.setAttribute('position',new this.THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new this.THREE.BufferAttribute(col,3)); geo.setAttribute('randomFactor',new this.THREE.BufferAttribute(rF,1));
            if(geo.attributes.position)geo.attributes.position.needsUpdate=true; if(geo.attributes.color)geo.attributes.color.needsUpdate=true; if(geo.attributes.randomFactor)geo.attributes.randomFactor.needsUpdate=true;
        }; uPP();
        const pT=new this.THREE.TextureLoader().load("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==");
        const mat=new this.THREE.ShaderMaterial({uniforms:{time:{value:0},pointTexture:{value:pT}}, vertexShader:`attribute vec3 color;attribute float randomFactor;uniform float time;varying vec3 vColor;varying float vRandomFactor;void main(){vColor=color;vRandomFactor=randomFactor;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);float sizePulse=sin(time*randomFactor*2.0+randomFactor*6.2831)*0.3+0.7;gl_PointSize=(40.0/-mvPosition.z)*randomFactor*sizePulse;gl_Position=projectionMatrix*mvPosition;}`, fragmentShader:`uniform sampler2D pointTexture;varying vec3 vColor;varying float vRandomFactor;void main(){float opacity=(sin(vRandomFactor*10.0)*0.2+0.6)*0.8;gl_FragColor=vec4(vColor,opacity)*texture2D(pointTexture,gl_PointCoord);}`, blending:this.THREE.AdditiveBlending,depthTest:false,transparent:true});
        const parts=new this.THREE.Points(geo,mat); sc.add(parts); this.state.heroScene={updateColors:uPP,particles:parts,material:mat};
        const mse=new this.THREE.Vector2(); document.addEventListener('mousemove',(e)=>{mse.x=(e.clientX/window.innerWidth)*2-1;mse.y=-(e.clientY/window.innerHeight)*2+1;},{passive:true});
        const clk=new this.THREE.Clock(); const anim=()=>{requestAnimationFrame(anim);const eT=clk.getElapsedTime();mat.uniforms.time.value=eT;parts.position.x+=(mse.x*0.05-parts.position.x)*0.015;parts.position.y+=(mse.y*0.05-parts.position.y)*0.015;parts.rotation.y=eT*0.015;rend.render(sc,cam);}; anim();
        window.addEventListener('resize',()=>{cam.aspect=window.innerWidth/window.innerHeight;cam.updateProjectionMatrix();rend.setSize(window.innerWidth,window.innerHeight);},{passive:true});
    },
    initScrollAnimations() {
        if(this.state.isPreloading) return;
        this.gsap.utils.toArray(".section-title").forEach(t=>{this.gsap.from(t,{opacity:0,y:25,duration:0.7,ease:"power2.out",scrollTrigger:{trigger:t,start:"top 90%",once:true}});});
        this.gsap.utils.toArray(".about-text p, .skills-list li, .portfolio-card, .connect-text p, .connect-email-link, .social-icons a, .crypto-item, .playground-container").forEach((el,i)=>{this.gsap.from(el,{opacity:0,y:20,duration:0.5,ease:"power1.out",scrollTrigger:{trigger:el,start:"top 92%",once:true},delay:(i%4)*0.07});});
    },
    initAsciiPlayground() {
        if(!this.config.asciiCanvas)return; const canv=this.config.asciiCanvas; let ang=0;
        const verts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
        const edgs=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
        this.state.asciiCube={char:document.body.dataset.theme==="light-paper"?"@":"*"};
        const rAF=()=>{
            if(this.state.isAsciiAnimationPaused)return; const r=20,c=40; let out=Array(r).fill(null).map(()=>Array(c).fill(' ')); let zB=Array(r).fill(null).map(()=>Array(c).fill(Infinity));
            ang+=0.02; const cosA=Math.cos(ang),sinA=Math.sin(ang);
            const pV=verts.map(v=>{let x=v[0],y=v[1],z=v[2];let xRY=x*cosA-z*sinA,zRY=x*sinA+z*cosA;let yRX=y*cosA-zRY*sinA,zRX=y*sinA+zRY*cosA;return[xRY,yRX,zRX+5];});
            const pTA=(x,y,z)=>{const pF=2/z;const sX=Math.floor(x*pF*(c/4)+(c/2));const sY=Math.floor(-y*pF*(r/4)+(r/2));return[sX,sY];};
            const pC=(x,y,z,ch)=>{if(x>=0&&x<c&&y>=0&&y<r){if(z<zB[y][x]){out[y][x]=ch;zB[y][x]=z;}}};
            const dL=(p1,p2,z1,z2,ch)=>{let x0=p1[0],y0=p1[1],x1=p2[0],y1=p2[1];let dx=Math.abs(x1-x0),sx=x0<x1?1:-1;let dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy,e2,cZ;for(;;){let t=(x0===x1&&y0===y1)?0:Math.sqrt(Math.pow(x0-p1[0],2)+Math.pow(y0-p1[1],2))/Math.sqrt(Math.pow(p2[0]-p1[0],2)+Math.pow(p2[1]-p1[1],2));cZ=z1*(1-t)+z2*t;pC(x0,y0,cZ,ch);if(x0===x1&&y0===y1)break;e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}};
            const sV=pV.map(v=>pTA(v[0],v[1],v[2]));
            edgs.forEach(e=>{const v1=sV[e[0]],v2=sV[e[1]];const z_1=pV[e[0]][2],z_2=pV[e[1]][2];dL(v1,v2,z_1,z_2,this.state.asciiCube.char);});
            canv.textContent=out.map(rw=>rw.join('')).join('\n'); this.state.asciiAnimationId=requestAnimationFrame(rAF);
        };
        this.startAsciiAnimation=()=>{if(this.state.asciiAnimationId)cancelAnimationFrame(this.state.asciiAnimationId);this.state.isAsciiAnimationPaused=false;if(this.config.toggleAnimationBtn)this.config.toggleAnimationBtn.textContent="> PAUSAR_ANIMACIÓN";rAF();};
        this.pauseAsciiAnimation=()=>{if(this.state.asciiAnimationId)cancelAnimationFrame(this.state.asciiAnimationId);this.state.isAsciiAnimationPaused=true;if(this.config.toggleAnimationBtn)this.config.toggleAnimationBtn.textContent="> REANUDAR_ANIMACIÓN";};
        if(this.config.toggleAnimationBtn)this.config.toggleAnimationBtn.addEventListener("click",()=>{this.state.isAsciiAnimationPaused?this.startAsciiAnimation():this.pauseAsciiAnimation();});
    },
    initPortfolioData() {
        this.state.allPortfolioItems = [
            { type: "proyecto", slug: "swosh", title: "Swosh", date: "2025-01-15", excerpt: "una base de datos nosql que hice en typescript. mola porque es súper ligera y para aprender está genial.", content_md: "## introducción\n### ¡flipando con swosh!\noye. swosh es como mi pequeño monstruo de las bases de datos...", tags: ["TypeScript", "Node.js", "NoSQL", "Bases de Datos", "DIY"], links: [{ text: "Ver en GitHub", url: "https://github.com/caelok/swosh", icon: "github" }] },
            { type: "articulo", slug: "machine-learning-intro", title: "Machine Learning", date: "2025-05-20", excerpt: "te cuento qué es eso del machine learning de forma fácil. es como enseñarles trucos a los ordenadores.", content_md: "## introducción\n### ¿qué es el machine learning? no es tan raro\nel machine learning, o ml para los amigos, es una movida de la inteligencia artificial...", tags: ["ML", "IA", "Inteligencia Artificial", "Conceptos", "Tecnología"] },
            { type: "proyecto", slug: "skuld-malware-infostealer-go", title: "Skuld", date: "2025-05-22", excerpt: "skuld es un bichejo informático que hice en go. su misión: pillar toda la info que pueda de un ordenador.", content_md: "## introducción\n### skuld, el espía digital\nojo con skuld. es un tipo de programa que se llama *infostealer*...", tags: ["Malware", "Infostealer", "Go", "Ciberseguridad", "Seguridad", "Hacking Ético"], links: [{ text: "Ver el código en GitHub", url: "https://github.com/hackirby/skuld", icon: "github" }] },
            { type: "articulo", slug: "lenguajes-poderosos", title: "Mis Lenguajes de Programación Favoritos", date: "2025-03-10", excerpt: "te cuento qué lenguajes de programación me molan más y para qué los uso. cada uno tiene su punto.", content_md: "## introducción\n### a programar se ha dicho\ncuando te pones a programar, es como tener una caja de herramientas...", tags: ["TypeScript", "Python", "Go", "Rust", "Programación", "Desarrollo"], },
            { type: "articulo", slug: "lobster-lenguaje-juegos", title: "Lobster", date: "2025-05-23", excerpt: "conoces lobster. es un lenguaje de programación pensado para hacer videojuegos. te cuento un poco sobre él.", content_md: "## introducción\n### ¿qué es lobster? no es un marisco\noye. cuando hablamos de lobster en informática, no es el bicho rojo con pinzas...", tags: ["Lobster", "Programación", "Videojuegos", "GameDev", "IndieDev"] },
            { type: "articulo", slug: "deep-fakes-que-son", title: "Deep Fakes", date: "2025-05-24", excerpt: "los deep fakes son vídeos falsos que parecen súper reales. ¿magia? no, inteligencia artificial. te lo explico.", content_md: "## introducción\n### ¿qué son los deep fakes? alucina\nlos deep fakes son como el photoshop pero para vídeos, y a lo bestia...", tags: ["DeepFake", "IA", "Inteligencia Artificial", "Tecnología", "Vídeos", "Ética"] },
            { type: "articulo", slug: "game-engines-motores-juegos", title: "Game Engines", date: "2025-05-25", excerpt: "sabes qué es un game engine. es como la base sobre la que se construyen casi todos los juegos. te lo cuento.", content_md: "## introducción\n### ¿qué es un game engine? el corazón de tu juego\nun game engine o motor de videojuego es como una caja de herramientas gigante...", tags: ["Game Engines", "Unity", "Unreal Engine", "Videojuegos", "Desarrollo de Juegos", "Programación"] },
            { type: "articulo", slug: "crear-nuevo-lenguaje-programacion", title: "¿Para Qué Crear un Nuevo Lenguaje de Programación?", date: "2025-05-26", excerpt: "por qué la gente se inventa lenguajes de programación nuevos si ya hay un montón. tiene su lógica, ya verás.", content_md: "## introducción\n### ¿más lenguajes? en serio\nseguro que has oído hablar de python, javascript, java...", tags: ["Programación", "Lenguajes de Programación", "Compiladores", "Innovación", "Tecnología", "DIY"], }
        ];
        this.renderPortfolioItems("all"); this.initPortfolioFilters();
    },
    renderPortfolioItems(filter) {
        if (!this.config.portfolioGrid) return;
        const currentCards = this.gsap.utils.toArray(this.config.portfolioGrid.children);
        this.gsap.to(currentCards, { opacity:0, y:-15, stagger:0.05, duration:0.3, ease:"power1.in", onComplete: () => {
            this.config.portfolioGrid.innerHTML = "";
            const filteredItems = filter === "all" ? this.state.allPortfolioItems : this.state.allPortfolioItems.filter(item => item.type === filter);
            filteredItems.sort((a,b) => new Date(b.date) - new Date(a.date));
            if (filteredItems.length === 0) { this.config.portfolioGrid.innerHTML = `<p class="no-items-message">no hay ${filter !== "all" ? filter+"s" : "elementos"} que coincidan.</p>`; return; }
            filteredItems.forEach((item, index) => {
                const card = document.createElement("div"); card.className = "portfolio-card";
                const tagsHTML = item.tags ? item.tags.map(tag => `<span class="card-tag">${tag}</span>`).join("") : "";
                const dateFormatted = item.date ? new Date(item.date).toLocaleDateString("es-ES", {day:'2-digit',month:'2-digit',year:'numeric'}) : "";
                card.innerHTML = `<span class="card-type">${item.type.charAt(0).toUpperCase()+item.type.slice(1)}</span><h3 class="card-title">${item.title}</h3><p class="card-excerpt">${item.excerpt}</p>${dateFormatted?`<p class="card-date">${dateFormatted}</p>`:''}${tagsHTML?`<div class="card-tags">${tagsHTML}</div>`:''}<button class="card-cta-btn read-more-btn" data-slug="${item.slug}">> VER_DETALLES</button>`;
                this.config.portfolioGrid.appendChild(card);
                this.gsap.from(card, { opacity:0, y:15, duration:0.4, delay:index*0.07, ease:"power1.out" });
            });
            this.initFeatherIcons(); this.addPortfolioEventListeners(); this.ScrollTrigger.refresh();
        }});
    },
    initPortfolioFilters() {
        const filterButtons = document.querySelectorAll(".filter-btn");
        if (filterButtons.length > 0) filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active")); button.classList.add("active");
                this.renderPortfolioItems(button.dataset.filter);
            });
        });
    },
    addPortfolioEventListeners() {
        this.config.portfolioGrid.querySelectorAll(".read-more-btn").forEach(button => {
            const newButton = button.cloneNode(true); button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener("click", (event) => {
                event.preventDefault(); const slug = newButton.dataset.slug;
                const item = this.state.allPortfolioItems.find(pItem => pItem.slug === slug);
                if (item) this.openPortfolioModal(item);
            });
        });
    },
    openPortfolioModal(item) {
        if (!this.config.portfolioModal || this.state.isModalOpen) return; this.state.isModalOpen = true;
        this.config.portfolioModal.querySelector("#modal-title").textContent = item.title;
        this.config.portfolioModal.querySelector("#modal-date").textContent = new Date(item.date).toLocaleDateString("es-ES", {year:'numeric',month:'long',day:'numeric'});
        this.config.portfolioModal.querySelector("#modal-type").textContent = item.type.charAt(0).toUpperCase()+item.type.slice(1);
        const modalBody = this.config.portfolioModal.querySelector("#modal-body");
        if (this.marked && this.hljs) { modalBody.innerHTML = this.marked.parse(item.content_md); modalBody.querySelectorAll("pre code").forEach(block => this.hljs.highlightElement(block)); }
        else { modalBody.innerHTML = `<p>${item.excerpt}</p><p>Contenido completo no disponible (parser no cargado).</p>`; }
        const modalLinks = this.config.portfolioModal.querySelector("#modal-links"); modalLinks.innerHTML = "";
        if (item.links && item.links.length > 0) {
            item.links.forEach(link => { const linkEl = document.createElement("a"); linkEl.href = link.url; linkEl.target = "_blank"; linkEl.rel = "noopener noreferrer"; linkEl.innerHTML = `<span>${link.text}</span> ${link.icon?`<i data-feather="${link.icon}"></i>`:'<i data-feather="external-link"></i>'}`; modalLinks.appendChild(linkEl); });
            this.initFeatherIcons();
        }
        this.config.portfolioModal.classList.add("active"); document.body.style.overflow = "hidden";
        this.gsap.fromTo(this.config.portfolioModal.querySelector(".modal-content"), {opacity:0,scale:0.95,y:15}, {opacity:1,scale:1,y:0,duration:0.35,ease:"power1.out"});
    },
    closePortfolioModal() {
        if (this.state.isModalOpen && this.config.portfolioModal) {
            this.gsap.to(this.config.portfolioModal.querySelector(".modal-content"), { opacity:0,scale:0.95,y:15,duration:0.25,ease:"power1.in", onComplete: () => {
                this.config.portfolioModal.classList.remove("active"); document.body.style.overflow = ""; this.state.isModalOpen = false;
            }});
        }
    },
    initBackToTop() {
        if (this.config.backToTopButton) {
            window.addEventListener("scroll", () => { if(this.state.isPreloading)return; this.config.backToTopButton.classList.toggle("visible", window.pageYOffset > 250); }, {passive:true});
            this.config.backToTopButton.addEventListener("click", () => { this.gsap.to(window, {duration:0.7,scrollTo:0,ease:"power1.inOut"}); });
        }
    },
    initCopyButtons() {
        document.querySelectorAll(".copy-btn").forEach(button => {
            const newButton = button.cloneNode(true); button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener("click", (event) => {
                const targetEl = event.currentTarget.previousElementSibling; const textToCopy = targetEl.dataset.address || targetEl.textContent;
                navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                    const originalHTML = newButton.innerHTML; newButton.innerHTML = '<i data-feather="check"></i>'; newButton.classList.add("copied"); this.initFeatherIcons();
                    setTimeout(() => { newButton.innerHTML = originalHTML; newButton.classList.remove("copied"); this.initFeatherIcons(); }, 1500);
                }).catch(err => console.error("Error al copiar:", err));
            });
        });
    }
};
document.addEventListener("DOMContentLoaded", () => App.init());
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && App.state.isModalOpen) App.closePortfolioModal(); });
if (App.config.modalCloseBtn) App.config.modalCloseBtn.addEventListener("click", () => App.closePortfolioModal());
if (App.config.portfolioModal) App.config.portfolioModal.addEventListener("click", (e) => { if (e.target === App.config.portfolioModal) App.closePortfolioModal(); });
