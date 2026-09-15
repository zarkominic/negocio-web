/* web-cinematica — el movimiento.
   Todo atado al scroll salvo dos cosas: el texto que se escribe (a su ritmo,
   como en una novela visual) y la niebla, que respira sola. */
(function(){
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  /* ── niebla: unas pocas nubes suaves que derivan; se aparta un poco del ratón ── */
  const lienzo = document.getElementById("niebla"), ctx = lienzo.getContext("2d");
  let W, H, nubes = [], mx = -9999, my = -9999;
  function medir(){ W = lienzo.width = innerWidth; H = lienzo.height = innerHeight;
    nubes = Array.from({length: 7}, () => ({x:Math.random()*W, y:H*.35 + Math.random()*H*.7, r:180 + Math.random()*260, vx:.12 + Math.random()*.2, a:.05 + Math.random()*.06})); }
  medir(); addEventListener("resize", medir);
  addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
  (function pinta(){
    if (reducido) return;
    ctx.clearRect(0,0,W,H);
    for (const n of nubes){
      const dx = n.x - mx, dy = n.y - my, d = Math.hypot(dx,dy);
      if (d < n.r) { n.x += dx/d*.6; n.y += dy/d*.3; }
      n.x += n.vx; if (n.x - n.r > W) n.x = -n.r;
      const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
      g.addColorStop(0,`rgba(180,170,210,${n.a})`); g.addColorStop(1,"rgba(180,170,210,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,7); ctx.fill();
    }
    requestAnimationFrame(pinta);
  })();

  /* ── el texto se escribe solo, con cursor, cuando su escena entra ── */
  function escribe(p, texto, velocidad = 26){
    p.textContent = ""; const cur = document.createElement("i"); cur.className = "cursor-tipo"; p.appendChild(cur);
    let i = 0;
    (function paso(){
      if (i < texto.length){ cur.insertAdjacentText("beforebegin", texto[i++]);
        const t = texto[i-1]; setTimeout(paso, t === "." || t === ":" ? velocidad*8 : t === "," ? velocidad*3 : velocidad); }
      else setTimeout(() => cur.remove(), 1400);
    })();
  }

  if (reducido){
    document.querySelectorAll(".linea").forEach(p => p.textContent = p.dataset.texto);
    document.querySelector("header").style.opacity = 1; document.querySelector(".luna").style.opacity = 1;
    return;
  }

  var suave = ScrollSmoother.create({wrapper:"#smooth-wrapper", content:"#smooth-content", smooth:1.3, effects:true, normalizeScroll:true});
  // gancho de prueba: ?ir=hacemes&d=0.5 lleva a una seccion (y a una fraccion de su recorrido) sin tocar el raton
  const q = new URLSearchParams(location.search);
  if (q.get("ir")){ setTimeout(() => { const el = document.getElementById(q.get("ir")); if (el){ const y = suave.offset(el, "top top") + (parseFloat(q.get("d")||0) * innerHeight * 2); suave.scrollTo(y, false); ScrollTrigger.update(); } }, 800); }

  /* portada: entra sola, una vez */
  gsap.timeline({defaults:{ease:"power3.out"}})
    .to(".portada .revela", {opacity:1, y:0, duration:1.4, stagger:.25, delay:.3})
    .to("header, .luna", {opacity:1, duration:.8}, "-=.6");
  gsap.to(".portada .fondo img", {scale:1.08, ease:"none", scrollTrigger:{trigger:".portada", start:"top top", end:"bottom top", scrub:true}});

  /* la luna se llena con el scroll: de nueva a llena */
  gsap.to(".luna-sombra", {scaleX:0, ease:"none", scrollTrigger:{trigger:"#smooth-content", start:"top top", end:"bottom bottom", scrub:.4}});

  /* los titulos y capitulos se revelan atados al scroll */
  document.querySelectorAll(".revela").forEach(el => { if (el.closest(".portada")) return;
    gsap.to(el, {opacity:1, y:0, ease:"none", scrollTrigger:{trigger:el, start:"top 92%", end:"top 60%", scrub:.8}}); });

  /* cada dialogo: aparece, y su linea se escribe una sola vez al entrar */
  document.querySelectorAll(".dialogo:not(.paso-conv)").forEach(d => {
    gsap.from(d, {y:40, opacity:0, ease:"none", scrollTrigger:{trigger:d, start:"top 95%", end:"top 70%", scrub:.8}});
    const p = d.querySelector(".linea");
    ScrollTrigger.create({trigger:d, start:"top 78%", once:true, onEnter(){ escribe(p, p.dataset.texto); }});
    const items = d.querySelectorAll(".opciones li, .pasos li, .datos > div");
    if (items.length) gsap.to(items, {opacity:1, x:0, stagger:.15, ease:"none",
      scrollTrigger:{trigger:d, start:"top 70%", end:"top 35%", scrub:.8}});
  });

  /* LA TABERNA: la escena se fija y la conversacion avanza con el scroll, linea a linea.
     Cada tramo de rueda es un "clic" de novela visual: aparece el cuadro y se escribe su linea. */
  const taberna = document.querySelector(".posada"), pasos = gsap.utils.toArray(".posada .paso-conv");
  if (taberna){
    const tl = gsap.timeline({scrollTrigger:{trigger:taberna, start:"top top", end:"+=" + (pasos.length*60 + 40) + "%", pin:true, scrub:.6, anticipatePin:1,
      onUpdate(self){ gsap.to("#lluvia", {opacity: self.progress > .02 && self.progress < .98 ? .35 : 0, duration:.6}); }}});
    // primero entran los personajes: el dueno por la izquierda, quien llega por la derecha
    gsap.set(".posada .pj-izq", {xPercent:-40}); gsap.set(".posada .pj-der", {xPercent:40});
    tl.to(".posada .pj-izq", {opacity:1, xPercent:0, duration:1, ease:"power2.out"}, 0);
    tl.to(".posada .pj-der", {opacity:1, xPercent:0, duration:1, ease:"power2.out"}, .6);
    pasos.forEach((d, i) => {
      tl.to(d, {opacity:1, y:0, duration:1, ease:"none"}, 1.2 + i*1.6);
      tl.call(() => { const p = d.querySelector(".linea"); if (!p.dataset.hecho){ p.dataset.hecho = 1; escribe(p, p.dataset.texto, 30); } }, null, 1.2 + i*1.6 + .5);
      const items = d.querySelectorAll(".opciones li");
      if (items.length) tl.to(items, {opacity:1, x:0, stagger:.25, duration:.8, ease:"none"}, 1.2 + i*1.6 + 1.1);
    });
  }

  // las dos capas de la posada se separan con el raton: profundidad real
  addEventListener("mousemove", e => { const nx = e.clientX/innerWidth - .5, ny = e.clientY/innerHeight - .5;
    gsap.to(".posada .capa-fondo", {x:nx*-14, y:ny*-8, duration:1.2, ease:"power2.out"});
    gsap.to(".posada .capa-frente", {x:nx*-34, y:ny*-18, duration:1.2, ease:"power2.out"});
    gsap.to(".posada .personaje", {x:(i,el) => (el.classList.contains("pj-izq") ? -1 : 1) * nx * 10, duration:1.2, ease:"power2.out"}); });

  /* lluvia sobre la posada: lineas finas que caen, en canvas */
  const lienzoLluvia = document.getElementById("lluvia"), cl = lienzoLluvia.getContext("2d");
  let gotas = [];
  function medirLluvia(){ lienzoLluvia.width = innerWidth; lienzoLluvia.height = innerHeight;
    gotas = Array.from({length:160}, () => ({x:Math.random()*innerWidth, y:Math.random()*innerHeight, l:10+Math.random()*18, v:9+Math.random()*7})); }
  medirLluvia(); addEventListener("resize", medirLluvia);
  (function llueve(){ cl.clearRect(0,0,lienzoLluvia.width,lienzoLluvia.height); cl.strokeStyle = "rgba(220,225,245,.28)"; cl.lineWidth = 1;
    for (const g of gotas){ cl.beginPath(); cl.moveTo(g.x, g.y); cl.lineTo(g.x - 1.5, g.y + g.l); cl.stroke(); g.y += g.v; g.x -= .4; if (g.y > innerHeight){ g.y = -g.l; g.x = Math.random()*innerWidth; } }
    requestAnimationFrame(llueve); })();

  /* movimiento de camara en cada ilustracion fija: zoom lento y deriva, atado al scroll */
  document.querySelectorAll(".escena:not(.portada) .fondo img").forEach(img => {
    gsap.fromTo(img, {scale:1.04, yPercent:-2}, {scale:1.12, yPercent:2, ease:"none",
      scrollTrigger:{trigger:img.closest(".escena"), start:"top bottom", end:"bottom top", scrub:true}});
  });

  /* MUSICA: arranca con el primer gesto; las barritas siguen el audio de verdad */
  const audio = document.getElementById("fondo"), botonMusica = document.getElementById("musica"), barras = botonMusica.querySelectorAll("i");
  let musicaOn = true, acx = null, analizador = null;
  function arrancarMusica(){
    if (acx) return;
    try {
      audio.volume = 0; audio.play().then(() => { gsap.to(audio, {volume:.07, duration:3}); botonMusica.classList.add("sonando"); }).catch(() => { acx = null; });
      const AC = window.AudioContext || window.webkitAudioContext; acx = new AC();
      const src = acx.createMediaElementSource(audio); analizador = acx.createAnalyser(); analizador.fftSize = 64;
      src.connect(analizador); analizador.connect(acx.destination);
      const datos = new Uint8Array(analizador.frequencyBinCount);
      (function vu(){ analizador.getByteFrequencyData(datos); barras.forEach((b,i) => { b.style.height = (4 + datos[i*2+1]/255*22) + "px"; }); requestAnimationFrame(vu); })();
      botonMusica.style.opacity = 1;
    } catch(e){ audio.play().catch(()=>{}); botonMusica.style.opacity = 1; }
  }
  // Solo gestos que el navegador acepta para reproducir: clic, tecla, toque. La rueda NO lo es.
  // Activada por defecto: se intenta al cargar (el navegador solo lo permite si ya confia en el sitio),
  // y si lo rechaza, arranca con el primer gesto que haga el visitante, el que sea.
  arrancarMusica();
  ["pointerdown","keydown","touchend"].forEach(ev => addEventListener(ev, e => { if (e.target && e.target.closest && e.target.closest("#musica")) return; arrancarMusica(); }, {passive:true}));
  document.querySelector(".baja").addEventListener("click", () => { arrancarMusica(); suave.scrollTo("#quienes", true, "top top"); });
  botonMusica.addEventListener("click", e => { e.stopPropagation();
    if (!acx || audio.paused && musicaOn){ arrancarMusica(); return; }     // si aun no suena, el boton la ENCIENDE, no la apaga
    musicaOn = !musicaOn; botonMusica.classList.toggle("apagada", !musicaOn); botonMusica.setAttribute("aria-pressed", musicaOn);
    if (musicaOn){ audio.play().catch(()=>{}); gsap.to(audio, {volume:.07, duration:1}); } else gsap.to(audio, {volume:0, duration:.8, onComplete(){ audio.pause(); }}); });

  /* interludios: el video solo corre cuando se ve */
  document.querySelectorAll(".bucle").forEach(v => {
    ScrollTrigger.create({trigger:v, start:"top bottom", end:"bottom top",
      onEnter(){ v.play().catch(()=>{}); }, onEnterBack(){ v.play().catch(()=>{}); }, onLeave(){ v.pause(); }, onLeaveBack(){ v.pause(); }});
  });

  ScrollTrigger.refresh();
})();
