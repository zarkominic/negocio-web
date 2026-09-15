/* web-isometrica — la tienda que vive.
   Coordenadas siempre en el escenario de 768×1344 (el formato del juego). */
(function(){
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = 768, H = 1344;

  /* ── escalar el escenario para que quepa en la pantalla (contain) ── */
  const escenario = document.getElementById("escenario"), pantalla = escenario.parentElement;
  // ?captura=430x900 fija el tamano de pantalla: para hacer capturas del formato movil desde un navegador sin cabeza
  { const c = new URLSearchParams(location.search).get("captura"); if (c){ const [w,h] = c.split("x"); const tel = document.querySelector(".telefono"); tel.style.width = w+"px"; tel.style.height = h+"px"; tel.style.left = "0"; tel.style.top = "0"; tel.style.transform = "none"; } }
  function ajustar(){ const s = Math.min(pantalla.clientWidth / W, pantalla.clientHeight / H); escenario.style.transform = `translate(-50%,-50%) scale(${s})`; }
  ajustar(); addEventListener("resize", ajustar); addEventListener("load", ajustar); requestAnimationFrame(ajustar);   // tambien tras la carga: la primera medida puede llegar antes de que la pantalla tenga su tamano

  /* ── EL CIELO VIVO del menú: estrellas con semilla fija que parpadean de vez en cuando, y una fugaz ocasional ── */
  const cielo = document.getElementById("cielo"), cx = cielo.getContext("2d");
  function rng(semilla){ let s = semilla >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const fijo = rng(20260715), estrellas = [];
  for (let i = 0; i < 36; i++) estrellas.push({x: 24 + fijo()*672, y: 20 + fijo()*510, r: 1.3 + fijo()*1.3, a: .35, esc: 1, espera: .5 + Math.random()*7.5});
  const fugaces = []; let proximaFugaz = 6, ultimo = performance.now();
  function parpadea(e){ gsap.timeline().to(e, {a:1, esc:1.6, duration:.22, ease:"sine.inOut"}).to(e, {a:.35, esc:1, duration:.5, ease:"sine.inOut"}); }
  function fugaz(){
    const f = {x: 80 + Math.random()*540, y: 40 + Math.random()*240, a:0}, dx = Math.random() < .5 ? 1 : -1, dy = .35 + Math.random()*.25, n = Math.hypot(dx, dy);
    f.dx = dx/n; f.dy = dy/n; const dist = 240 + Math.random()*120, dur = .55 + Math.random()*.2;
    fugaces.push(f);
    gsap.to(f, {x: f.x + f.dx*dist, y: f.y + f.dy*dist, duration:dur, ease:"none"});
    gsap.to(f, {a:1, duration:dur*.25}); gsap.to(f, {a:0, duration:dur*.5, delay:dur*.5, onComplete(){ fugaces.splice(fugaces.indexOf(f), 1); }});
  }
  function pintaCielo(ahora){
    const dt = Math.min((ahora - ultimo)/1000, .1); ultimo = ahora;
    cx.clearRect(0, 0, W, H);
    for (const e of estrellas){
      e.espera -= dt; if (e.espera <= 0){ parpadea(e); e.espera = .5 + Math.random()*7.5; }
      cx.fillStyle = `rgba(255,247,224,${e.a})`; cx.beginPath();
      for (let k = 0; k < 8; k++){ const ang = k/8*Math.PI*2, rr = (k%2 ? e.r*.45 : e.r) * e.esc; cx.lineTo(e.x + Math.cos(ang)*rr, e.y + Math.sin(ang)*rr); }
      cx.closePath(); cx.fill();
    }
    proximaFugaz -= dt; if (proximaFugaz <= 0){ fugaz(); proximaFugaz = 4 + Math.random()*5; }
    for (const f of fugaces){ const g = cx.createLinearGradient(f.x, f.y, f.x - f.dx*36, f.y - f.dy*36); g.addColorStop(0, `rgba(255,250,230,${f.a*.95})`); g.addColorStop(1, "rgba(255,250,230,0)");
      cx.strokeStyle = g; cx.lineWidth = 2.5; cx.lineCap = "round"; cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(f.x - f.dx*36, f.y - f.dy*36); cx.stroke(); }
    if (!menuCerrado && !reducido) requestAnimationFrame(pintaCielo);
  }
  let menuCerrado = false;
  if (!reducido) requestAnimationFrame(pintaCielo);

  /* ── el dueño respira: escala Y con seno, anclada en los pies, y contrapeso en X ── */
  const duenoImg = document.querySelector("#duenoMenu img");
  if (!reducido) gsap.ticker.add(() => { const s = Math.sin(performance.now()/1000 * 2.2) * .5 + .5; duenoImg.style.transform = `translateX(-50%) scale(${1 - .004*s}, ${1 + .010*s})`; });

  /* ── LA TIENDA, montada como en el juego: muebles por código + personajes despiezados ── */
  const mundo = document.getElementById("mundo");
  // Mesas expositoras del tier 3: 12, en dos filas diagonales (base-centro, px del fondo). Ancho 122.
  const MESAS = [[242,624],[328,667],[414,710],[500,753],[586,796],[672,839],[156,838],[242,881],[328,924],[414,967],[500,1010],[586,1053]];
  const MESA_W = 122, MESA_H = Math.round(122*769/1008);
  const MOSTRADOR = {x:505, y:565, w:252, h:Math.round(252*835/1008)};
  function mueble(src, x, y, w, h, flip){ const im = document.createElement("img"); im.className = "mueble"; im.src = src;
    Object.assign(im.style, {left:(x - w/2)+"px", top:(y - h)+"px", width:w+"px", height:h+"px", zIndex:Math.round(y), transform: flip ? "scaleX(-1)" : ""}); mundo.appendChild(im); }
  function amueblar(){
    for (const [x,y] of MESAS) mueble("img/muebles/mesa.webp", x, y, MESA_W, MESA_H);
    mueble("img/muebles/mostrador.webp", MOSTRADOR.x, MOSTRADOR.y, MOSTRADOR.w, MOSTRADOR.h);
    mueble("img/muebles/kinko.webp", 700, 660, 111, Math.round(111*746/722), true);   // la caja fuerte, junto a la estantería, espejada
  }

  // Alturas del juego (px del fondo)
  const ALTURA = {owner:153, salaryman:131, lady:131, fashiongirl:127, otaku:130, streetboy:115};
  const NPCS = ["lady","salaryman","otaku","fashiongirl","streetboy"];
  /* ── NAVEGACIÓN, como en el juego: suelo transitable menos los muebles inflados con margen, y caminos por A*.
     Fue lo que más costó en Godot; aquí se hace con una rejilla de 12 px y se puede VER con ?debug=1. ── */
  const CELDA = 12, NAV_MARGEN = 20;
  // suelo: polígono del fondo del tier 3 (la zona de la puerta, x 220-560, se cierra en y=930 para que nadie pise el noren)
  const SUELO = [[390,440],[690,580],[768,760],[768,1170],[660,1140],[610,1010],[220,930],[40,850],[40,720],[300,610]];
  function dentroPoligono(x, y, P){ let d = false; for (let i = 0, j = P.length-1; i < P.length; j = i++){ const [xi,yi] = P[i], [xj,yj] = P[j];
    if ((yi > y) !== (yj > y) && x < (xj-xi)*(y-yi)/(yj-yi)+xi) d = !d; } return d; }
  // huella de un mueble en el suelo: rombo isométrico con el vértice inferior en su base, inflado con el margen
  function rombo(bx, by, w){ const h = w/2, m = NAV_MARGEN; return [[bx, by+m],[bx+h+m, by-h/2],[bx, by-h-m],[bx-h-m, by-h/2]]; }
  const OBSTACULOS = [...MESAS.map(([x,y]) => rombo(x, y, MESA_W)), rombo(MOSTRADOR.x, MOSTRADOR.y, MOSTRADOR.w), rombo(700, 660, 111)];
  const COLS = Math.ceil(W/CELDA), FILAS = Math.ceil(H/CELDA), libre = new Uint8Array(COLS*FILAS);
  for (let f = 0; f < FILAS; f++) for (let c = 0; c < COLS; c++){ const x = c*CELDA + CELDA/2, y = f*CELDA + CELDA/2;
    libre[f*COLS+c] = (dentroPoligono(x, y, SUELO) && !OBSTACULOS.some(o => dentroPoligono(x, y, o))) ? 1 : 0; }
  const celdasLibres = []; for (let i = 0; i < libre.length; i++) if (libre[i]) celdasLibres.push(i);
  function celda(x, y){ return {c:Math.floor(x/CELDA), f:Math.floor(y/CELDA)}; }
  function centro(i){ return {x:(i%COLS)*CELDA + CELDA/2, y:Math.floor(i/COLS)*CELDA + CELDA/2}; }
  function aEstrella(desde, hasta){   // A* con 8 vecinos sobre la rejilla
    const h = i => { const a = centro(i), b = centro(hasta); return Math.hypot(a.x-b.x, a.y-b.y); };
    const abierto = new Map([[desde, h(desde)]]), g = new Map([[desde, 0]]), padre = new Map(), cerrado = new Set();
    while (abierto.size){
      let actual = null, mejor = Infinity; for (const [i, f] of abierto) if (f < mejor){ mejor = f; actual = i; }
      if (actual === hasta){ const ruta = [actual]; while (padre.has(ruta[0])) ruta.unshift(padre.get(ruta[0])); return ruta; }
      abierto.delete(actual); cerrado.add(actual);
      const c = actual%COLS, f = Math.floor(actual/COLS);
      for (const [dc, df] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const nc = c+dc, nf = f+df; if (nc < 0 || nf < 0 || nc >= COLS || nf >= FILAS) continue;
        const v = nf*COLS+nc; if (!libre[v] || cerrado.has(v)) continue;
        if (dc && df && (!libre[f*COLS+nc] || !libre[nf*COLS+c])) continue;   // no cortar esquinas
        const ng = g.get(actual) + (dc && df ? 1.414 : 1);
        if (ng < (g.get(v) ?? Infinity)){ g.set(v, ng); padre.set(v, actual); abierto.set(v, ng + h(v)/CELDA); }
      }
    }
    return null;
  }
  function visible(a, b){ const n = Math.ceil(Math.hypot(b.x-a.x, b.y-a.y)/6); for (let k = 0; k <= n; k++){ const x = a.x + (b.x-a.x)*k/n, y = a.y + (b.y-a.y)*k/n; const {c,f} = celda(x,y); if (!libre[f*COLS+c]) return false; } return true; }
  function suaviza(puntos){ const r = [puntos[0]]; let i = 0; while (i < puntos.length-1){ let j = puntos.length-1; while (j > i+1 && !visible(puntos[i], puntos[j])) j--; r.push(puntos[j]); i = j; } return r; }
  function celdaLibreAleatoria(lejosDe){ for (let k = 0; k < 40; k++){ const i = celdasLibres[Math.floor(Math.random()*celdasLibres.length)], p = centro(i); if (!lejosDe || Math.hypot(p.x-lejosDe.x, p.y-lejosDe.y) > 140) return i; } return celdasLibres[0]; }
  // capa de depuración: ?debug=1 pinta las celdas transitables
  if (new URLSearchParams(location.search).get("debug")){ const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:5;opacity:.45";
    const g = cv.getContext("2d"); g.fillStyle = "#2f6"; for (const i of celdasLibres){ const p = centro(i); g.fillRect(p.x-CELDA/2+1, p.y-CELDA/2+1, CELDA-2, CELDA-2); }
    g.strokeStyle = "#f33"; g.lineWidth = 3; for (const o of OBSTACULOS){ g.beginPath(); o.forEach(([x,y],k) => k ? g.lineTo(x,y) : g.moveTo(x,y)); g.closePath(); g.stroke(); }
    document.getElementById("tienda").appendChild(cv); }

  const metas = {};
  async function cargaMeta(n){ if (!metas[n]) metas[n] = await fetch(`img/npc/${n}/meta.json`).then(r => r.json()); return metas[n]; }

  function creaNpc(nombre, meta, x, y){
    const el = document.createElement("div"); el.className = "npc"; el.dataset.nombre = nombre;
    el.innerHTML = `<span class="sombra"></span><img class="pL pierna" alt=""><img class="pR pierna" alt=""><img class="cuerpo" alt="">`;
    mundo.appendChild(el);
    const npc = {el, nombre, meta, x, y, dir:"south", fase:Math.random()*6, andando:false, t:0, alto:ALTURA[nombre] || 130, en:0};
    orienta(npc, "south"); coloca(npc); return npc;
  }
  function orienta(npc, dir){
    npc.dir = dir; const m = npc.meta[dir]; if (!m) return;
    const base = `img/npc/${npc.nombre}/${dir}_`;
    for (const [cls, parte] of [["cuerpo","body"],["pL","legL"],["pR","legR"]]){
      const img = npc.el.querySelector("."+cls), r = m[parte]; img.src = base + parte + ".webp";
      Object.assign(img.style, {left:r.x+"px", top:r.y+"px", width:r.w+"px", height:r.h+"px", transform:""});
      img.dataset.top = r.y;
    }
    // escala: la altura del personaje (cabeza a pies) debe medir ALTURA[nombre]; y el origen son los pies
    const cima = m.body.y, pies = Math.max(m.legL.y + m.legL.h, m.legR.y + m.legR.h);
    npc.escala = npc.alto / (pies - cima); npc.pies = pies;
    npc.el.querySelector(".sombra").style.bottom = (180 - pies - 4) + "px";
  }
  function coloca(npc){
    const s = npc.escala;
    npc.el.style.left = (npc.x - 90*s) + "px"; npc.el.style.top = (npc.y - npc.pies*s) + "px";
    npc.el.style.transform = `scale(${s})`; npc.el.style.transformOrigin = "0 0"; npc.el.style.zIndex = Math.round(npc.y);
  }
  function pasea(npc){
    const desde = celda(npc.x, npc.y), origen = desde.f*COLS+desde.c;
    const destino = celdaLibreAleatoria(npc);
    const ruta = libre[origen] ? aEstrella(origen, destino) : null;
    if (!ruta || ruta.length < 2){ const p = centro(destino); npc.x = p.x; npc.y = p.y; coloca(npc); return gsap.delayedCall(.8, () => pasea(npc)); }   // si estaba fuera, recolocar
    const puntos = suaviza(ruta.map(centro)); let k = 1;
    npc.andando = true;
    (function tramo(){
      if (k >= puntos.length){ npc.andando = false; reposo(npc); return gsap.delayedCall(1.5 + Math.random()*4, () => pasea(npc)); }
      const q = puntos[k++], dx = q.x - npc.x, dy = q.y - npc.y, dist = Math.hypot(dx, dy);
      orienta(npc, Math.abs(dx) > Math.abs(dy)*.8 ? (dx > 0 ? "east" : "west") : (dy > 0 ? "south" : "north"));
      gsap.to(npc, {x:q.x, y:q.y, duration: dist/62, ease:"none", onUpdate(){ coloca(npc); }, onComplete: tramo});
    })();
  }
  function reposo(npc){ for (const cls of ["pL","pR","cuerpo"]){ const im = npc.el.querySelector("."+cls); im.style.top = im.dataset.top + "px"; } }
  const npcs = [];
  // el andar del juego: las piernas se LEVANTAN alternándose (5 px de frente, 3 de perfil) y el cuerpo bota 1,5 px
  gsap.ticker.add((tiempo, dt) => { for (const n of npcs){ if (!n.andando) continue; n.t += dt/1000;
      const s = Math.sin(n.t / .44 * Math.PI*2), lift = (n.dir === "south" || n.dir === "north") ? 5 : 3;
      const pL = n.el.querySelector(".pL"), pR = n.el.querySelector(".pR"), cu = n.el.querySelector(".cuerpo");
      pL.style.top = (+pL.dataset.top - lift*Math.max(0, s)) + "px"; pR.style.top = (+pR.dataset.top - lift*Math.max(0, -s)) + "px";
      cu.style.top = (+cu.dataset.top - 1.5*Math.abs(s)) + "px"; } });

  async function poblar(){
    amueblar();
    const dueno = creaNpc("owner", await cargaMeta("owner"), 505, 440); coloca(dueno);   // detrás del mostrador, centrado, como en el juego
    for (const [i, n] of NPCS.entries()){ const p = centro(celdaLibreAleatoria()); const npc = creaNpc(n, await cargaMeta(n), p.x, p.y); npcs.push(npc); gsap.delayedCall(.6 + i*.9, () => pasea(npc)); }
    if (reducido) return;
    gsap.ticker.add(() => { const s = Math.sin(performance.now()/1000*2.2)*.5+.5; const cu = dueno.el.querySelector(".cuerpo"); cu.style.transform = `scale(${1-.004*s},${1+.01*s})`; cu.style.transformOrigin = "50% 100%"; });
  }

  /* ── entrar: el menú se funde y la tienda aparece; el dueño saluda ── */
  function escribe(p, texto, velocidad = 28){
    p.textContent = ""; const cur = document.createElement("i"); cur.className = "cursor-tipo"; p.appendChild(cur); let i = 0;
    (function paso(){ if (i < texto.length){ cur.insertAdjacentText("beforebegin", texto[i++]); const t = texto[i-1]; setTimeout(paso, t === "." ? velocidad*8 : t === "," ? velocidad*3 : velocidad); } else setTimeout(() => cur.remove(), 1400); })();
  }
  const menu = document.getElementById("menu"), tienda = document.getElementById("tienda"), bocadillo = document.getElementById("bocadillo");
  let poblado = false;
  document.getElementById("entrar").addEventListener("click", async () => {
    if (!poblado){ poblado = true; await poblar(); }
    tienda.hidden = false; gsap.set(tienda, {opacity:0});
    gsap.timeline().to(menu, {opacity:0, duration:.5}).set(menu, {display:"none"}).call(() => { menuCerrado = true; })
      .to(tienda, {opacity:1, duration:.6}, "-=.2")
      .to(bocadillo, {opacity:1, y:0, duration:.4, delay:.4, onStart(){ escribe(bocadillo.querySelector(".linea"), bocadillo.querySelector(".linea").dataset.texto); }})
      .to(bocadillo, {opacity:0, y:-12, duration:.4, delay:7});
  });

  /* ── paneles: suben desde abajo; se cierran tocando fuera, con el asa, o con Escape ── */
  const velo = document.getElementById("veloPanel"); let abierto = null;
  function abre(id){
    const p = document.getElementById(id); if (!p) return;
    if (abierto && abierto !== p){ const prev = abierto; gsap.to(prev, {y:"105%", duration:.3, onComplete(){ prev.style.visibility = "hidden"; }}); }
    abierto = p; gsap.to(velo, {opacity:1, duration:.3}); velo.style.pointerEvents = "auto";
    p.style.visibility = "visible"; gsap.fromTo(p, {y:"105%"}, {y:"0%", duration:.45, ease:"power3.out"});
    document.querySelectorAll(".pestanas button").forEach(b => b.classList.toggle("activa", b.dataset.panel === id));
  }
  function cierra(){ if (!abierto) return; const p = abierto; gsap.to(p, {y:"105%", duration:.35, ease:"power2.in", onComplete(){ p.style.visibility = "hidden"; }}); gsap.to(velo, {opacity:0, duration:.3}); velo.style.pointerEvents = "none"; abierto = null;
    document.querySelectorAll(".pestanas button").forEach(b => b.classList.remove("activa")); }
  document.querySelectorAll("[data-panel]").forEach(b => b.addEventListener("click", () => abre(b.dataset.panel)));
  velo.addEventListener("click", cierra);
  document.querySelectorAll(".panel .asa").forEach(a => a.addEventListener("click", cierra));
  addEventListener("keydown", e => { if (e.key === "Escape") cierra(); });
  // arrastrar el panel hacia abajo lo cierra (gesto móvil)
  document.querySelectorAll(".panel").forEach(p => { let y0 = null;
    p.addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, {passive:true});
    p.addEventListener("touchmove", e => { if (y0 !== null && e.touches[0].clientY - y0 > 70 && p.scrollTop <= 0){ y0 = null; cierra(); } }, {passive:true}); });
})();
