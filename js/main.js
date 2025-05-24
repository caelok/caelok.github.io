const App={gsap:window.gsap,ScrollToPlugin:window.ScrollToPlugin,ScrollTrigger:window.ScrollTrigger,THREE:window.THREE,marked:window.marked,hljs:window.hljs,config:{themeToggleButton:document.getElementById("theme-toggle"),themes:["light-paper","dark-terminal"],themeIcons:["sun","moon"],currentThemeIndex:0,navbar:document.getElementById("main-header"),navbarLinksContainer:document.querySelector(".navbar-links"),preloader:document.getElementById("preloader"),preloaderLogo:document.querySelector(".preloader-logo"),preloaderLogoGlitch:document.querySelector(".preloader-logo-glitch"),preloaderStatusBar:document.querySelector(".preloader-bar-inner"),preloaderStatusText:document.querySelector(".preloader-status-text"),preloaderPercentage:document.querySelector(".preloader-percentage"),cursor:document.querySelector(".custom-cursor"),heroParticlesCanvas:document.getElementById("hero-particles-canvas"),portfolioGrid:document.querySelector(".portfolio-grid"),portfolioModal:document.getElementById("portfolio-modal"),modalCloseBtn:document.querySelector("#portfolio-modal .modal-close"),backToTopButton:document.getElementById("back-to-top"),asciiCanvas:document.getElementById("ascii-canvas"),toggleAnimationBtn:document.getElementById("toggle-animation-btn"),navbarHeight:60},state:{lastScrollTop:0,isModalOpen:!1,heroScene:null,allPortfolioItems:[],isPreloading:!0,asciiAnimationId:null,isAsciiAnimationPaused:!1},init(){if(!this.gsap||!this.ScrollToPlugin||!this.ScrollTrigger){console.error("GSAP or its plugins not loaded!"),this.config.preloader&&(this.config.preloader.style.display="none"),this.state.isPreloading=!1,this.onPreloaderComplete();return}this.gsap.registerPlugin(this.ScrollToPlugin,this.ScrollTrigger),this.initPreloader(),this.initTheme(),this.initCustomCursor(),this.initNavbar(),this.initFeatherIcons(),this.initPortfolioData(),this.initBackToTop(),this.initCopyButtons(),this.config.asciiCanvas&&this.initAsciiPlayground()},initFeatherIcons(){"undefined"!=typeof feather&&feather.replace({width:"1em",height:"1em","stroke-width":1.5})},initPreloader(){if(!this.config.preloader){this.state.isPreloading=!1,this.onPreloaderComplete();return}document.body.style.overflow="hidden";let e=this.gsap.timeline({onComplete:()=>{this.state.isPreloading=!1,this.onPreloaderComplete()}}),a={value:0};this.config.preloaderStatusText&&(this.config.preloaderStatusText.textContent="LOADING"),this.config.preloaderPercentage&&(this.config.preloaderPercentage.textContent="0%"),e.fromTo([this.config.preloaderLogo,this.config.preloaderLogoGlitch],{opacity:0,scale:.7,rotate:-5},{opacity:1,scale:1,rotate:0,duration:.7,ease:"back.out(1.2)"},.1).fromTo([this.config.preloaderStatusText,this.config.preloaderPercentage],{opacity:0,y:10},{opacity:1,y:0,duration:.4,ease:"power1.out",stagger:.1},.4).fromTo(this.config.preloader.querySelector(".preloader-bar"),{opacity:0},{opacity:1,duration:.2},.6),e.to(a,{value:100,duration:1.5,ease:"power1.inOut",onUpdate:()=>{this.config.preloaderStatusBar&&(this.config.preloaderStatusBar.style.width=`${a.value}%`),this.config.preloaderPercentage&&(this.config.preloaderPercentage.textContent=`${Math.round(a.value)}%`)}},.7),e.to(this.config.preloader,{opacity:0,duration:.6,ease:"power2.in",delay:.3}).set(this.config.preloader,{display:"none"})},onPreloaderComplete(){document.body.style.overflow="",this.animateHeroIntro(),this.THREE&&this.config.heroParticlesCanvas&&this.initHeroParticles(),this.initScrollAnimations(),this.config.asciiCanvas&&null===this.state.asciiAnimationId&&!this.state.isAsciiAnimationPaused&&this.startAsciiAnimation()},initTheme(){let e=localStorage.getItem("caelok-ae-theme-v2"),a=window.matchMedia("(prefers-color-scheme: light)").matches,o="light-paper";o=e||(a?"light-paper":"dark-terminal"),this.config.currentThemeIndex=this.config.themes.indexOf(o),-1===this.config.currentThemeIndex&&(this.config.currentThemeIndex=0),this.applyCurrentTheme(),this.config.themeToggleButton&&this.config.themeToggleButton.addEventListener("click",()=>{this.config.currentThemeIndex=(this.config.currentThemeIndex+1)%this.config.themes.length,this.applyCurrentTheme()})},applyCurrentTheme(){let e=this.config.themes[this.config.currentThemeIndex];if(document.body.dataset.theme=e,localStorage.setItem("caelok-ae-theme-v2",e),this.config.themeToggleButton){let a=this.config.themeIcons[this.config.currentThemeIndex];this.config.themeToggleButton.innerHTML=`<i data-feather="${a}" class="theme-icon"></i>`,this.initFeatherIcons()}this.setBodyRgbVariable("--bg-color","--bg-color-rgb","light-paper"===e?"240,239,230":"10,10,10"),this.setBodyRgbVariable("--accent-color","--accent-rgb","light-paper"===e?"255,69,0":"0,207,69"),this.state.heroScene&&this.state.heroScene.updateColors&&this.state.heroScene.updateColors(),this.config.asciiCanvas&&this.state.asciiCube&&(this.state.asciiCube.char="light-paper"===e?"@":"*")},setBodyRgbVariable(e,a,o){let t=getComputedStyle(document.body).getPropertyValue(e).trim();try{if(t.startsWith("#")){var s;let i;document.documentElement.style.setProperty(a,(s=(s=t).replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(e,a,o,t)=>a+a+o+o+t+t),(i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s))?[parseInt(i[1],16),parseInt(i[2],16),parseInt(i[3],16)]:null).join(","))}else document.documentElement.style.setProperty(a,o)}catch(r){console.warn(`Failed to parse ${e} for ${a}`,r),document.documentElement.style.setProperty(a,o)}},initCustomCursor(){this.config.cursor&&window.addEventListener("mousemove",e=>{this.gsap.to(this.config.cursor,{duration:.05,x:e.clientX,y:e.clientY,ease:"none"})},{passive:!0})},initNavbar(){if(!this.config.navbar)return;let e=0,a=this.config.navbarHeight;window.addEventListener("scroll",()=>{if(this.state.isPreloading)return;let o=window.pageYOffset||document.documentElement.scrollTop;this.config.navbar.classList.toggle("scrolled",o>20),o>e&&o>a?this.config.navbar.classList.add("hidden"):o+window.innerHeight<document.documentElement.scrollHeight-a/2&&this.config.navbar.classList.remove("hidden"),e=o<=0?0:o},{passive:!0});let o=document.querySelectorAll(".nav-item");o.forEach(e=>{e.addEventListener("click",o=>{o.preventDefault();let t=e.getAttribute("href"),s=document.querySelector(t);s&&this.gsap.to(window,{duration:.8,scrollTo:{y:s,offsetY:.7*a},ease:"power2.inOut"})})});let t=this.gsap.utils.toArray(".content-section, .hero-section");t.forEach(e=>{this.ScrollTrigger.create({trigger:e,start:()=>`top ${a+.2*window.innerHeight}px`,end:()=>`bottom ${a+.2*window.innerHeight}px`,toggleClass:{targets:`a[href="#${e.id}"]`,className:"active"}})})},animateHeroIntro(){if(!this.state.isPreloading)this.gsap.timeline({delay:.1}).from(".hero-logo-main",{opacity:0,y:40,scale:.7,duration:1.2,ease:"elastic.out(0.8, 0.5)"}).from(".hero-title",{opacity:0,y:25,duration:.7,ease:"power2.out"},"-=0.8").from(".hero-subtitle",{opacity:0,y:20,duration:.6,ease:"power2.out"},"-=0.6").from(".hero-cta",{opacity:0,y:15,duration:.5,ease:"power2.out"},"-=0.4").from(".scroll-indicator-wrapper",{opacity:0,y:10,duration:.7,ease:"power1.out"},"-=0.2")},initHeroParticles(){if(!this.THREE||!this.config.heroParticlesCanvas)return;let e=new this.THREE.Scene,a=new this.THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3);a.position.z=2.8;let o=new this.THREE.WebGLRenderer({canvas:this.config.heroParticlesCanvas,alpha:!0,antialias:!0});o.setSize(window.innerWidth,window.innerHeight),o.setPixelRatio(Math.min(window.devicePixelRatio,2));let t=new Float32Array(10500),s=new Float32Array(10500),i=new Float32Array(3500),r=new this.THREE.BufferGeometry,n=()=>{let e=new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--accent-color").trim()),a=new this.THREE.Color(getComputedStyle(document.body).getPropertyValue("--text-color").trim()),o=e.clone().lerp(a,.5),n=[e,a,o];for(let l=0;l<3500;l++){t[3*l+0]=(Math.random()-.5)*10,t[3*l+1]=(Math.random()-.5)*10,t[3*l+2]=(Math.random()-.5)*10;let c=n[Math.floor(Math.random()*n.length)];s[3*l+0]=c.r,s[3*l+1]=c.g,s[3*l+2]=c.b,i[l]=.8*Math.random()+.2}r.setAttribute("position",new this.THREE.BufferAttribute(t,3)),r.setAttribute("color",new this.THREE.BufferAttribute(s,3)),r.setAttribute("randomFactor",new this.THREE.BufferAttribute(i,1)),r.attributes.position&&(r.attributes.position.needsUpdate=!0),r.attributes.color&&(r.attributes.color.needsUpdate=!0),r.attributes.randomFactor&&(r.attributes.randomFactor.needsUpdate=!0)};n();let l=new this.THREE.TextureLoader().load("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg=="),c=new this.THREE.ShaderMaterial({uniforms:{time:{value:0},pointTexture:{value:l}},vertexShader:`
                attribute vec3 color;
                attribute float randomFactor;
                uniform float time;
                varying vec3 vColor;
                varying float vRandomFactor;

                void main() {
                    vColor = color;
                    vRandomFactor = randomFactor;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float sizePulse = sin(time * randomFactor * 2.0 + randomFactor * 6.2831) * 0.3 + 0.7; // Tama\xf1o pulsante (6.2831 es 2*PI)
                    gl_PointSize = (40.0 / -mvPosition.z) * randomFactor * sizePulse;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,fragmentShader:`
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vRandomFactor;

                void main() {
                    float opacity = (sin(vRandomFactor * 10.0) * 0.2 + 0.6) * 0.8; // Opacidad variada
                    gl_FragColor = vec4(vColor, opacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,blending:this.THREE.AdditiveBlending,depthTest:!1,transparent:!0}),d=new this.THREE.Points(r,c);e.add(d),this.state.heroScene={updateColors:n,particles:d,material:c};let u=new this.THREE.Vector2;document.addEventListener("mousemove",e=>{u.x=e.clientX/window.innerWidth*2-1,u.y=-(2*(e.clientY/window.innerHeight))+1},{passive:!0});let p=new this.THREE.Clock,g=()=>{requestAnimationFrame(g);let t=p.getElapsedTime();c.uniforms.time.value=t,d.position.x+=(.05*u.x-d.position.x)*.015,d.position.y+=(.05*u.y-d.position.y)*.015,d.rotation.y=.015*t,o.render(e,a)};g(),window.addEventListener("resize",()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)},{passive:!0})},initScrollAnimations(){if(this.state.isPreloading)return;this.gsap.utils.toArray(".section-title").forEach(e=>{this.gsap.from(e,{opacity:0,y:25,duration:.7,ease:"power2.out",scrollTrigger:{trigger:e,start:"top 90%",once:!0}})});let e=this.gsap.utils.toArray(".about-text p, .skills-list li, .portfolio-card, .connect-text p, .connect-email-link, .social-icons a, .crypto-item, .playground-container");e.forEach((e,a)=>{this.gsap.from(e,{opacity:0,y:20,duration:.5,ease:"power1.out",scrollTrigger:{trigger:e,start:"top 92%",once:!0},delay:a%4*.07})})},initAsciiPlayground(){if(!this.config.asciiCanvas)return;let e=this.config.asciiCanvas,a=0,o=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],t=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];this.state.asciiCube={char:"light-paper"===document.body.dataset.theme?"@":"*"};let s=()=>{if(this.state.isAsciiAnimationPaused)return;let i=Array(20).fill(null).map(()=>Array(40).fill(" ")),r=Array(20).fill(null).map(()=>Array(40).fill(1/0));a+=.02;let n=Math.cos(a),l=Math.sin(a),c=o.map(e=>{let a=e[0],o=e[1],t=e[2],s=a*l+t*n;return[a*n-t*l,o*n-s*l,o*l+s*n+5]}),d=(e,a,o)=>{let t=2/o;return[Math.floor(e*t*10+20),Math.floor(-a*t*5+10)]},u=(e,a,o,t)=>{e>=0&&e<40&&a>=0&&a<20&&o<r[a][e]&&(i[a][e]=t,r[a][e]=o)},p=(e,a,o,t,s)=>{let i=e[0],r=e[1],n=a[0],l=a[1],c=Math.abs(n-i),d=i<n?1:-1,p=-Math.abs(l-r),g=r<l?1:-1,m=c+p,h,f;for(;;){let y=i===n&&r===l?0:Math.sqrt(Math.pow(i-e[0],2)+Math.pow(r-e[1],2))/Math.sqrt(Math.pow(a[0]-e[0],2)+Math.pow(a[1]-e[1],2));if(u(i,r,f=o*(1-y)+t*y,s),i===n&&r===l)break;(h=2*m)>=p&&(m+=p,i+=d),h<=c&&(m+=c,r+=g)}},g=c.map(e=>d(e[0],e[1],e[2]));t.forEach(e=>{let a=g[e[0]],o=g[e[1]],t=c[e[0]][2],s=c[e[1]][2];p(a,o,t,s,this.state.asciiCube.char)}),e.textContent=i.map(e=>e.join("")).join("\n"),this.state.asciiAnimationId=requestAnimationFrame(s)};this.startAsciiAnimation=()=>{this.state.asciiAnimationId&&cancelAnimationFrame(this.state.asciiAnimationId),this.state.isAsciiAnimationPaused=!1,this.config.toggleAnimationBtn&&(this.config.toggleAnimationBtn.textContent="> PAUSAR_ANIMACI\xd3N"),s()},this.pauseAsciiAnimation=()=>{this.state.asciiAnimationId&&cancelAnimationFrame(this.state.asciiAnimationId),this.state.isAsciiAnimationPaused=!0,this.config.toggleAnimationBtn&&(this.config.toggleAnimationBtn.textContent="> REANUDAR_ANIMACI\xd3N")},this.config.toggleAnimationBtn&&this.config.toggleAnimationBtn.addEventListener("click",()=>{this.state.isAsciiAnimationPaused?this.startAsciiAnimation():this.pauseAsciiAnimation()})},initPortfolioData(){this.state.allPortfolioItems=[{type:"proyecto",slug:"swosh",title:"Swosh DB",date:"2025-01-15",excerpt:"una base de datos nosql que hice en typescript. mola porque es s\xfaper ligera y para aprender est\xe1 genial.",content_md:`## introducci\xf3n
### \xa1flipando con swosh!
oye. swosh es como mi peque\xf1o monstruo de las bases de datos. la hice en typescript, que es como javascript pero con superpoderes. la idea era que fuera f\xe1cil de usar y r\xe1pida, sin rollos.

## \xbfc\xf3mo funciona?
### \xbfmagia? casi
pues mira, swosh no es de esas bases de datos gigantes que necesitan un mont\xf3n de cosas para funcionar. esta la puedes meter en tu proyecto y listo.
- **va que vuela**: no te va a ralentizar la web ni nada.
- **para tus cosas del navegador**: si haces una app web y quieres guardar datos sin complicarte, swosh te viene de perlas.
- **f\xe1cil, f\xe1cil**: si ya le pegas a javascript, usar swosh es pan comido.

imagina que quieres hacer una app que funcione aunque no tengas internet, o un juego peque\xf1o. pues para eso swosh es la ca\xf1a.

## conclusi\xf3n
### \xbfmola o qu\xe9?
swosh es la prueba de que no hace falta algo s\xfaper complicado para ser \xfatil. si est\xe1s aprendiendo y quieres ver c\xf3mo va una base de datos por dentro, \xe9chale un ojo. adem\xe1s, como est\xe1 en typescript, puedes cotillear el c\xf3digo y aprender un mont\xf3n.

## visita el proyecto
si te pica la curiosidad, puedes ver todo el c\xf3digo y c\xf3mo funciona en mi github: [github.com/caelok/swosh](https://github.com/caelok/swosh)`,tags:["TypeScript","Node.js","NoSQL","Bases de Datos","DIY"],links:[{text:"Ver en GitHub",url:"https://github.com/caelok/swosh",icon:"github"}]},{type:"articulo",slug:"machine-learning-intro",title:"Machine Learning: \xa1Que las m\xe1quinas aprendan!",date:"2025-05-20",excerpt:"te cuento qu\xe9 es eso del machine learning de forma f\xe1cil. es como ense\xf1arles trucos a los ordenadores.",content_md:`## introducci\xf3n
### \xbfqu\xe9 es el machine learning? no es tan raro
el machine learning, o ml para los amigos, es una movida de la inteligencia artificial. en vez de decirle al ordenador "haz esto, luego esto...", le damos un mont\xf3n de datos y que aprenda solo. como cuando aprendes a montar en bici, a base de pr\xe1ctica.

## \xbfc\xf3mo funciona?
### hay varias formas de ense\xf1arles
no hay una sola manera de que las m\xe1quinas aprendan, hay varias.
- **aprendizaje supervisado**: imagina que le das al ordenador un mont\xf3n de fotos de perros y gatos y le dices cu\xe1l es cu\xe1l. al final, aprende a distinguirlos solo. eso es porque ya le diste las respuestas.
- **aprendizaje no supervisado**: aqu\xed es m\xe1s como "toma estos datos y b\xfascate la vida". el ordenador intenta encontrar grupos o cosas raras en los datos sin que nadie le diga nada. como si ordenas tus cromos por equipos sin saber de qu\xe9 equipo es cada uno, solo por los colores.
- **aprendizaje por refuerzo**: este es como los videojuegos. la m\xe1quina prueba cosas, y si lo hace bien, premio. si la l\xeda, pues nada. as\xed va aprendiendo qu\xe9 funciona y qu\xe9 no. como cuando intentas pasarte un nivel dif\xedcil.

## conclusi\xf3n
### el ml est\xe1 en todas partes
seguro que usas ml todos los d\xedas y ni te enteras. las recomendaciones de netflix o youtube. los filtros de instagram que te ponen orejas de perro. es una pasada c\xf3mo est\xe1 cambiando todo. aprender de esto te puede molar mucho si te va la tecnolog\xeda.

## referencias
- si quieres cotillear m\xe1s, busca "machine learning explicacion para ni\xf1os" en google, hay cosas chulas.
- tambi\xe9n puedes ver v\xeddeos en youtube, algunos lo explican s\xfaper bien.`,tags:["ML","IA","Inteligencia Artificial","Conceptos","Tecnolog\xeda"]},{type:"proyecto",slug:"skuld-malware-infostealer-go",title:"Skuld: El Caza-Infos",date:"2025-05-22",excerpt:"skuld es un bichejo inform\xe1tico que hice en go. su misi\xf3n: pillar toda la info que pueda de un ordenador.",content_md:`## introducci\xf3n
### skuld, el esp\xeda digital
ojo con skuld. es un tipo de programa que se llama *infostealer*, que viene a ser como un ladr\xf3n de informaci\xf3n. lo program\xe9 en go, que es un lenguaje que va como un tiro. la idea es que se cuele en un ordenador y zas, se lleve contrase\xf1as, datos personales y todo lo que pille.

## \xbfc\xf3mo funciona?
### as\xed ataca skuld
este bicho no se anda con tonter\xedas:
1.  **se cuela sin que te enteres**: entra en el ordenador a escondidas, como un ninja.
2.  **empieza a cotillear**: busca por todos lados archivos importantes y contrase\xf1as guardadas. no se le escapa una.
3.  **env\xeda el bot\xedn**: toda la informaci\xf3n que roba la manda a los malos sin que el due\xf1o del ordenador se d\xe9 cuenta. qu\xe9 listillo.

## conclusi\xf3n
### \xbfpara qu\xe9 sirve saber esto?
aunque skuld sea para hacer el mal, entender c\xf3mo funcionan estos programas es s\xfaper importante. as\xed aprendemos a proteger nuestros ordenadores y nuestra informaci\xf3n. saber sus trucos nos ayuda a ser m\xe1s listos que ellos. no hay que ser un genio para entender que es mejor prevenir.

## visita el proyecto
si te atreves y quieres verle las tripas a skuld (bajo tu responsabilidad, eh), est\xe1 en github: [https://github.com/hackirby/skuld](https://github.com/hackirby/skuld)

*esto lo document\xe9 bas\xe1ndome en la info de caelok.*`,tags:["Malware","Infostealer","Go","Ciberseguridad","Seguridad","Hacking \xc9tico"],links:[{text:"Ver el c\xf3digo en GitHub",url:"https://github.com/hackirby/skuld",icon:"github"}]},{type:"articulo",slug:"lenguajes-poderosos",title:"Mis Lenguajes de Programaci\xf3n Favoritos",date:"2025-03-10",excerpt:"te cuento qu\xe9 lenguajes de programaci\xf3n me molan m\xe1s y para qu\xe9 los uso. cada uno tiene su punto.",content_md:`## introducci\xf3n
### a programar se ha dicho
cuando te pones a programar, es como tener una caja de herramientas. cada lenguaje es una herramienta diferente y sirve para unas cosas mejor que para otras. estos son algunos de los que m\xe1s uso.

## \xbfc\xf3mo funciona? (bueno, m\xe1s bien, \xbfcu\xe1les uso?)
### mis herramientas estrella:
- **typescript**: es como javascript pero con esteroides. te ayuda a no cometer tantos errores y es genial para hacer p\xe1ginas web y apps. lo uso un mont\xf3n.
- **python**: este es s\xfaper f\xe1cil de aprender y sirve para casi todo. quieres hacer un script r\xe1pido para automatizar algo. python. analizar datos. python. meterte con machine learning. python tambi\xe9n.
- **go (golang)**: si necesitas algo que sea muy muy r\xe1pido y que aguante mucha ca\xf1a (como un servidor web con miles de visitas), go es tu amigo. es m\xe1s simple de lo que parece.
- **rust**: este es para valientes. es un poco m\xe1s dif\xedcil de pillar al principio, pero es una bestia. s\xfaper r\xe1pido, s\xfaper seguro y te da un control incre\xedble. para cosas muy pros.

## conclusi\xf3n
### \xbfel mejor lenguaje? el que te sirva
no hay un lenguaje que sea el mejor para todo, ser\xeda aburrido. lo guay es conocer varios y usar el que mejor te venga para cada proyecto. a veces hasta mezclo varios. lo importante es entender la l\xf3gica y pasarlo bien programando.

## referencias
- para aprender m\xe1s, busca tutoriales de cada lenguaje en sitios como freecodecamp o codecademy.
- y practica mucho. haz proyectitos peque\xf1os para pillarles el truco.`,tags:["TypeScript","Python","Go","Rust","Programaci\xf3n","Desarrollo"]},{type:"articulo",slug:"lobster-lenguaje-juegos",title:"Lobster: \xa1Un Lenguaje para Crear Juegos!",date:"2025-05-23",excerpt:"conoces lobster. es un lenguaje de programaci\xf3n pensado para hacer videojuegos. te cuento un poco sobre \xe9l.",content_md:`## introducci\xf3n
### \xbfqu\xe9 es lobster? no es un marisco
oye. cuando hablamos de lobster en inform\xe1tica, no es el bicho rojo con pinzas. es un lenguaje de programaci\xf3n que est\xe1 hecho especialmente para crear videojuegos. mola, eh. la idea es que sea m\xe1s f\xe1cil y divertido hacer tus propios juegos.

## \xbfc\xf3mo funciona?
### \xbfy c\xf3mo se usa para los juegos?
pues lobster intenta simplificar las cosas que suelen ser un rollo al programar juegos:
- **gr\xe1ficos y sonido**: viene con herramientas para que dibujar cosas en pantalla o poner sonidos sea m\xe1s sencillo.
- **rendimiento**: intenta ser r\xe1pido para que los juegos vayan fluidos, que no se queden pillados.
- **f\xe1cil de aprender**: aunque todos los lenguajes tienen su qu\xe9, lobster quiere ser amigable para la gente que empieza en esto de hacer juegos.

imagina que quieres hacer un juego de plataformas o uno de puzzles, pues lobster te da como los bloques de construcci\xf3n ya preparados para que no empieces desde cero cero.

## conclusi\xf3n
### \xbfdeber\xeda aprender lobster?
si te flipan los videojuegos y te gustar\xeda intentar crear los tuyos, lobster puede ser una opci\xf3n guay para empezar. no es tan famoso como otros, pero tiene una comunidad detr\xe1s y siempre se aprende algo nuevo. lo importante es que te diviertas creando.

## referencias
- p\xe1gina oficial de lobster (si la buscas, seguro que la encuentras, yo la busqu\xe9 como "lobster programming language").
- foros y comunidades de desarrollo de videojuegos indie, ah\xed se habla de todo.`,tags:["Lobster","Programaci\xf3n","Videojuegos","GameDev","IndieDev"]},{type:"articulo",slug:"deep-fakes-que-son",title:"Deep Fakes: \xa1V\xeddeos que Enga\xf1an!",date:"2025-05-24",excerpt:"los deep fakes son v\xeddeos falsos que parecen s\xfaper reales. \xbfmagia? no, inteligencia artificial. te lo explico.",content_md:`## introducci\xf3n
### \xbfqu\xe9 son los deep fakes? alucina
los deep fakes son como el photoshop pero para v\xeddeos, y a lo bestia. usan inteligencia artificial para cambiar la cara de una persona en un v\xeddeo por la de otra, y queda tan bien que parece de verdad. es una tecnolog\xeda que flipas, pero tambi\xe9n da un poco de yuyu.

## \xbfc\xf3mo funciona?
### la magia de la ia
para hacer un deep fake, necesitas un mont\xf3n de fotos y v\xeddeos de las dos personas: la que quieres quitar y la que quieres poner. luego, un programa de inteligencia artificial, que es como un cerebro de ordenador s\xfaper listo, aprende c\xf3mo se mueve y gesticula cada cara.
despu\xe9s, el programa reconstruye el v\xeddeo original poniendo la nueva cara, y lo hace fotograma a fotograma. es como si un dibujante incre\xedblemente r\xe1pido y preciso redibujara cada instante del v\xeddeo.

los programas que hacen esto se llaman gans (redes generativas antag\xf3nicas). son dos redes neuronales que compiten: una intenta crear el fake perfecto y la otra intenta pillarle. as\xed van mejorando hasta que el fake es casi indetectable.

## conclusi\xf3n
### guay pero peligroso
los deep fakes pueden ser divertidos para hacer memes o para el cine, pero tambi\xe9n se pueden usar para cosas malas, como inventar noticias falsas o hacer creer que alguien dijo algo que nunca dijo. por eso hay que tener mucho ojo y no creerse todo lo que vemos en internet. hay que ser listos y pensar antes de compartir.

## referencias
- busca en youtube "c\xf3mo se hacen los deepfakes explicaci\xf3n", hay v\xeddeos muy visuales.
- art\xedculos sobre gans (redes generativas antag\xf3nicas) si te va lo t\xe9cnico.`,tags:["DeepFake","IA","Inteligencia Artificial","Tecnolog\xeda","V\xeddeos","\xc9tica"]},{type:"articulo",slug:"game-engines-motores-juegos",title:"Game Engines: \xa1Los Motores de los Videojuegos!",date:"2025-05-25",excerpt:"sabes qu\xe9 es un game engine. es como la base sobre la que se construyen casi todos los juegos. te lo cuento.",content_md:`## introducci\xf3n
### \xbfqu\xe9 es un game engine? el coraz\xf3n de tu juego
un game engine o motor de videojuego es como una caja de herramientas gigante para los que hacen juegos. en vez de empezar de cero cada vez, los programadores usan estos motores que ya tienen un mont\xf3n de cosas hechas. es como si para construir una casa ya tuvieras los planos de la electricidad, las tuber\xedas y hasta algunas paredes.

## \xbfc\xf3mo funciona?
### \xbfqu\xe9 traen estos motores?
pues traen de todo un poco para que hacer un juego sea m\xe1s "f\xe1cil" (entre comillas, que sigue siendo un currazo):
- **gr\xe1ficos 3d y 2d**: para que se vean los personajes, los escenarios... todo lo visual.
- **f\xedsicas**: para que las cosas se caigan, reboten o exploten de forma realista (o no, si quieres un juego loco).
- **sonido**: para la m\xfasica, los efectos de disparos, los pasos...
- **inteligencia artificial (b\xe1sica)**: para que los enemigos te persigan o los personajes no jugadores hagan cosas.
- **animaciones**: para que los personajes se muevan.
- **interfaz de usuario**: para los men\xfas, los botones, la vida del personaje, etc.

algunos motores famosos son unity (que se usa para un mont\xf3n de juegos indie y tambi\xe9n grandes) y unreal engine (que es una pasada para gr\xe1ficos s\xfaper realistas). pero hay muchos m\xe1s.

## conclusi\xf3n
### imprescindibles para crear
hoy en d\xeda, casi nadie hace un juego desde cero patatero. los game engines ahorran much\xedsimo tiempo y permiten a los creadores centrarse en lo divertido: la historia, el dise\xf1o de niveles y que el juego mole. si quieres hacer juegos, aprender a usar un motor es un paso casi obligatorio.

## referencias
- \xe9chale un ojo a las p\xe1ginas de unity y unreal engine. tienen tutoriales y ejemplos que flipas.
- hay canales en youtube de gente que ense\xf1a a usar estos motores, busca "tutorial unity espa\xf1ol" o "tutorial unreal engine espa\xf1ol".`,tags:["Game Engines","Unity","Unreal Engine","Videojuegos","Desarrollo de Juegos","Programaci\xf3n"]},{type:"articulo",slug:"crear-nuevo-lenguaje-programacion",title:"\xbfPara Qu\xe9 Crear un Nuevo Lenguaje de Programaci\xf3n?",date:"2025-05-26",excerpt:"por qu\xe9 la gente se inventa lenguajes de programaci\xf3n nuevos si ya hay un mont\xf3n. tiene su l\xf3gica, ya ver\xe1s.",content_md:`## introducci\xf3n
### \xbfm\xe1s lenguajes? en serio
seguro que has o\xeddo hablar de python, javascript, java... hay un mont\xf3n de lenguajes de programaci\xf3n. entonces, \xbfpor qu\xe9 alguien se pondr\xeda a crear uno nuevo? \xbfno es complicarse la vida? pues... a veces tiene mucho sentido.

## \xbfc\xf3mo funciona? (o sea, \xbfpor qu\xe9 se crean?)
### razones para la aventura
crear un lenguaje nuevo es un currazo, pero la gente lo hace por varias razones:
1.  **resolver un problema espec\xedfico**: a lo mejor los lenguajes que hay no son perfectos para una tarea muy concreta. por ejemplo, un lenguaje para controlar robots de una forma s\xfaper sencilla, o uno para m\xfasica, o para hacer juegos como lobster.
2.  **hacerlo m\xe1s f\xe1cil o seguro**: algunos lenguajes son un poco liosos o es f\xe1cil cometer errores con ellos. un lenguaje nuevo puede intentar ser m\xe1s claro, m\xe1s seguro (que no se rompa tanto) o m\xe1s r\xe1pido de escribir.
3.  **probar ideas nuevas**: a los programadores les encanta experimentar. un lenguaje nuevo puede ser una forma de probar formas diferentes de decirle al ordenador lo que tiene que hacer. como inventar una nueva forma de cocinar.
4.  **aprender un mont\xf3n**: crear un lenguaje, aunque sea simple, te ense\xf1a una barbaridad sobre c\xf3mo funcionan los ordenadores y la programaci\xf3n por dentro. es un desaf\xedo mental.

### \xbfy qu\xe9 necesita un lenguaje para empezar?
como m\xednimo, necesitas:
- **una sintaxis**: las reglas de c\xf3mo se escribe el c\xf3digo. como la gram\xe1tica de un idioma.
- **un int\xe9rprete o compilador**: un programa que traduzca tu nuevo lenguaje a algo que el ordenador entienda (c\xf3digo m\xe1quina). el int\xe9rprete lo hace l\xednea por l\xednea, el compilador lo traduce todo de golpe.
- **funciones b\xe1sicas**: para hacer cosas como sumar, guardar datos, mostrar mensajes...

## conclusi\xf3n
### innovar mola
aunque ya tengamos muchas herramientas, siempre hay espacio para mejorar o para probar cosas nuevas. los lenguajes de programaci\xf3n evolucionan, y crear nuevos es parte de esa evoluci\xf3n. qui\xe9n sabe si el pr\xf3ximo lenguaje s\xfaper famoso lo est\xe1 creando ahora mismo alguien como t\xfa.

## referencias
- busca "c\xf3mo crear tu propio lenguaje de programaci\xf3n", hay art\xedculos y libros para los muy cafeteros.
- investiga sobre la historia de lenguajes como python o javascript, ver\xe1s por qu\xe9 se crearon.`,tags:["Programaci\xf3n","Lenguajes de Programaci\xf3n","Compiladores","Innovaci\xf3n","Tecnolog\xeda","DIY"]}],this.renderPortfolioItems("all"),this.initPortfolioFilters()},renderPortfolioItems(e){if(!this.config.portfolioGrid)return;let a=this.gsap.utils.toArray(this.config.portfolioGrid.children);this.gsap.to(a,{opacity:0,y:-15,stagger:.05,duration:.3,ease:"power1.in",onComplete:()=>{this.config.portfolioGrid.innerHTML="";let a="all"===e?this.state.allPortfolioItems:this.state.allPortfolioItems.filter(a=>a.type===e);if(a.sort((e,a)=>new Date(a.date)-new Date(e.date)),0===a.length){this.config.portfolioGrid.innerHTML=`<p class="no-items-message">no hay ${"all"!==e?e+"s":"elementos"} que coincidan.</p>`;return}a.forEach((e,a)=>{let o=document.createElement("div");o.className="portfolio-card";let t=e.tags?e.tags.map(e=>`<span class="card-tag">${e}</span>`).join(""):"",s=e.date?new Date(e.date).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"";o.innerHTML=`
                        <span class="card-type">${e.type.charAt(0).toUpperCase()+e.type.slice(1)}</span>
                        <h3 class="card-title">${e.title}</h3>
                        <p class="card-excerpt">${e.excerpt}</p>
                        ${s?`<p class="card-date">${s}</p>`:""}
                        ${t?`<div class="card-tags">${t}</div>`:""}
                        <button class="card-cta-btn read-more-btn" data-slug="${e.slug}">> VER_DETALLES</button>
                    `,this.config.portfolioGrid.appendChild(o),this.gsap.from(o,{opacity:0,y:15,duration:.4,delay:.07*a,ease:"power1.out"})}),this.initFeatherIcons(),this.addPortfolioEventListeners(),this.ScrollTrigger.refresh()}})},initPortfolioFilters(){let e=document.querySelectorAll(".filter-btn");e.length>0&&e.forEach(a=>{a.addEventListener("click",()=>{e.forEach(e=>e.classList.remove("active")),a.classList.add("active"),this.renderPortfolioItems(a.dataset.filter)})})},addPortfolioEventListeners(){let e=this.config.portfolioGrid.querySelectorAll(".read-more-btn");e.forEach(e=>{let a=e.cloneNode(!0);e.parentNode.replaceChild(a,e),a.addEventListener("click",e=>{e.preventDefault();let o=a.dataset.slug,t=this.state.allPortfolioItems.find(e=>e.slug===o);t&&this.openPortfolioModal(t)})})},openPortfolioModal(e){if(!this.config.portfolioModal||this.state.isModalOpen)return;this.state.isModalOpen=!0,this.config.portfolioModal.querySelector("#modal-title").textContent=e.title,this.config.portfolioModal.querySelector("#modal-date").textContent=new Date(e.date).toLocaleDateString("es-ES",{year:"numeric",month:"long",day:"numeric"}),this.config.portfolioModal.querySelector("#modal-type").textContent=e.type.charAt(0).toUpperCase()+e.type.slice(1);let a=this.config.portfolioModal.querySelector("#modal-body");this.marked&&this.hljs?(a.innerHTML=this.marked.parse(e.content_md),a.querySelectorAll("pre code").forEach(e=>this.hljs.highlightElement(e))):a.innerHTML=`<p>${e.excerpt}</p><p>el contenido completo no est\xe1 disponible (parser no cargado).</p>`;let o=this.config.portfolioModal.querySelector("#modal-links");o.innerHTML="",e.links&&e.links.length>0&&(e.links.forEach(e=>{let a=document.createElement("a");a.href=e.url,a.target="_blank",a.rel="noopener noreferrer",a.innerHTML=`<span>${e.text}</span> ${e.icon?`<i data-feather="${e.icon}"></i>`:'<i data-feather="external-link"></i>'}`,o.appendChild(a)}),this.initFeatherIcons()),this.config.portfolioModal.classList.add("active"),document.body.style.overflow="hidden",this.gsap.fromTo(this.config.portfolioModal.querySelector(".modal-content"),{opacity:0,scale:.95,y:15},{opacity:1,scale:1,y:0,duration:.35,ease:"power1.out"})},closePortfolioModal(){this.state.isModalOpen&&this.config.portfolioModal&&this.gsap.to(this.config.portfolioModal.querySelector(".modal-content"),{opacity:0,scale:.95,y:15,duration:.25,ease:"power1.in",onComplete:()=>{this.config.portfolioModal.classList.remove("active"),document.body.style.overflow="",this.state.isModalOpen=!1}})},initBackToTop(){this.config.backToTopButton&&(window.addEventListener("scroll",()=>{this.state.isPreloading||this.config.backToTopButton.classList.toggle("visible",window.pageYOffset>250)},{passive:!0}),this.config.backToTopButton.addEventListener("click",()=>{this.gsap.to(window,{duration:.7,scrollTo:0,ease:"power1.inOut"})}))},initCopyButtons(){document.querySelectorAll(".copy-btn").forEach(e=>{let a=e.cloneNode(!0);e.parentNode.replaceChild(a,e),a.addEventListener("click",e=>{let o=e.currentTarget.previousElementSibling,t=o.dataset.address||o.textContent;navigator.clipboard.writeText(t.trim()).then(()=>{let e=a.innerHTML;a.innerHTML='<i data-feather="check"></i>',a.classList.add("copied"),this.initFeatherIcons(),setTimeout(()=>{a.innerHTML=e,a.classList.remove("copied"),this.initFeatherIcons()},1500)}).catch(e=>{console.error("Error al copiar:",e)})})})}};document.addEventListener("DOMContentLoaded",()=>App.init()),window.addEventListener("keydown",e=>{"Escape"===e.key&&App.state.isModalOpen&&App.closePortfolioModal()}),App.config.modalCloseBtn&&App.config.modalCloseBtn.addEventListener("click",()=>App.closePortfolioModal()),App.config.portfolioModal&&App.config.portfolioModal.addEventListener("click",e=>{e.target===App.config.portfolioModal&&App.closePortfolioModal()});
