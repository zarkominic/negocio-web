/* web-lateral — el nivel es la web. Canvas propio: parallax, un alienígena que corre y salta, faros que abren secciones.
   Unidades del mundo: la altura de pantalla equivale a 720 px de mundo; el suelo está en y=600. */
(function(){
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.getElementById("mundo"), g = cv.getContext("2d");
  const ALTO = 720, SUELO_Y = 600, LARGO = 7600, K = 720/1080;   // K: la ventana del juego es 1920x1080 y aqui el mundo mide 720 de alto                  // largo del nivel en px de mundo
  let ancho = 1280, escala = 1;                                     // ancho visible en px de mundo
  function ajustar(){ const dpr = Math.min(devicePixelRatio||1, 2); cv.width = innerWidth*dpr; cv.height = innerHeight*dpr;
    escala = innerHeight/ALTO; ancho = innerWidth/escala; g.setTransform(dpr*escala, 0, 0, dpr*escala, 0, 0); g.imageSmoothingEnabled = true; }
  ajustar(); addEventListener("resize", ajustar);

  /* ── imágenes ── */
  const img = {}; const carga = n => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = "img/" + n; img[n.split(".")[0]] = i; });
  const FAROS = [1300, 2600, 3900, 5200, 6500];                    // x de mundo de cada sección
  // fragmentos de energía en arco (como en chunk_flat: 5 a -90,-150,-172,-150,-90) y plataformas, cada ~1100 px
  const GEMAS = [], PLATAFORMAS = [];
  for (let x = 900; x < LARGO - 900; x += 1100){ [[-192,-90],[-96,-150],[0,-172],[96,-150],[192,-90]].forEach(([dx,dy],k) => GEMAS.push({x:x+dx*K, y:SUELO_Y+dy*K, ok:false, t:k*.4}));
    PLATAFORMAS.push({x:x+380*K, y:SUELO_Y-135*K, w:150*K}); GEMAS.push({x:x+380*K, y:SUELO_Y-175*K, ok:false, t:2}); }
  // larvas que patrullan, y caparazones parados
  const LARVAS = [1700, 3300, 4700, 6100].map(x => ({x, a:x-160, b:x+160, dir:1, t:Math.random()*3}));
  const CAPARALES = [2400, 5600].map(x => ({x, a:x-200, b:x+200, dir:-1, t:Math.random()*3}));
  // decorado por ranuras con semilla fija: islas (scroll .6), colinas (.18), menhires (1.0)
  function rng(s){ return () => { s = (s*1664525 + 1013904223) >>> 0; return s/4294967296; }; }
  const R = rng(20260914);
  const ISLAS = [], COLINAS = [], MENHIRES = [];
  for (let x = 200; x < LARGO*.6 + 2000; x += 1700) ISLAS.push({x: x + R()*500, y: -30 + R()*150, e: .55 + R()*.35, v: R() < .5 ? "a" : "b"});
  const ISLITAS = []; for (let x = -200; x < LARGO*.4 + 2000; x += 700) if (R() < .8) ISLITAS.push({x: x + R()*300, y: 40 + R()*220, e: .35 + R()*.4, v: "abc"[Math.floor(R()*3)]});
  const LEJANAS = []; for (let x = -800; x < LARGO*.08 + 2400; x += 900) LEJANAS.push({x: x + R()*200, e: .9 + R()*.3, v: R() < .5 ? "a" : "b"});
  for (let x = -600; x < LARGO*.18 + 2200; x += 900) COLINAS.push({x: x + R()*300, e: .6 + R()*.3, v: R() < .5 ? "a" : "b", j: R()*20});
  for (let x = 500; x < LARGO; x += 1200) if (R() < .85) MENHIRES.push({x: x + R()*500, e: .5 + R()*.35, v: R() < .5 ? "a" : "b"});
  const NIEBLA = Array.from({length:9}, () => ({x:R()*LARGO, y:SUELO_Y - 60 - R()*90, w:280 + R()*260, a:.10 + R()*.10, v:8 + R()*10}));
  document.getElementById("gemasTotal").textContent = GEMAS.length;

  /* ── el alienígena ── */
  const al = {x:420, y:SUELO_Y, vx:0, vy:0, enSuelo:true, mira:1, estado:"idle", cuadro:0, tAnim:0, quieto:0};
  const ANIM = {idle:{n:7, fps:6}, run:{n:9, fps:14}, jump:{n:7, fps:12}, fall:{n:7, fps:12}};
  const AL_ESC = 2.5*K, AL_PIES = 77;                             // jugador: cuadro x2.5 en el juego                                   // el alien mide 50 px en el cuadro (filas 28-77); a x3 son 150, y los pies van al suelo                                              // alto del alienígena en px de mundo
  const teclas = {}; let objetivoX = null, ultimaRueda = 0;
  // cartel de inicio: se cierra con Empezar, o con el primer gesto que haga el visitante
  let cartel = true; const inicio = document.getElementById("inicio");
  function cierraCartel(){ if (!cartel) return; cartel = false; gsap.to(inicio, {opacity:0, duration:.35, onComplete(){ inicio.hidden = true; }}); }
  document.getElementById("empezar").addEventListener("click", cierraCartel);
  ["wheel","keydown","touchstart"].forEach(ev => addEventListener(ev, cierraCartel, {passive:true}));
  addEventListener("keydown", e => { teclas[e.key] = true; if (e.key === " " || e.key === "ArrowUp"){ e.preventDefault(); salta(); } if (["ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault(); });
  addEventListener("keyup", e => { teclas[e.key] = false; });
  // la rueda hace correr: cada tramo de rueda es un objetivo unos px más allá (como en el currículum de Leonardi)
  addEventListener("wheel", e => { e.preventDefault(); if (bloqueado || llegando >= 0) return; const d = e.deltaY || e.deltaX; objetivoX = Math.max(200, Math.min(LARGO - 300, (objetivoX ?? al.x) + d*1.6)); ultimaRueda = performance.now(); }, {passive:false});
  addEventListener("touchmove", e => { e.preventDefault(); }, {passive:false});
  function salta(){ if (al.enSuelo && !bloqueado){ al.vy = -900*K; al.enSuelo = false; } }
  const mando = (id, tecla) => { const b = document.getElementById(id); ["pointerdown","touchstart"].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); teclas[tecla] = true; }, {passive:false}));
    ["pointerup","pointerleave","touchend","touchcancel"].forEach(ev => b.addEventListener(ev, () => { teclas[tecla] = false; })); };
  mando("izq","ArrowLeft"); mando("der","ArrowRight"); document.getElementById("salta").addEventListener("pointerdown", e => { e.preventDefault(); salta(); });
  document.querySelectorAll(".mapa button").forEach(b => b.addEventListener("click", () => { objetivoX = FAROS[+b.dataset.faro] - 60; }));

  /* ── faros y paneles ── */
  const panel = document.getElementById("panel"), pT = document.getElementById("panelTitulo"), pC = document.getElementById("panelCuerpo");
  const TITULOS = ["[Sección 1]","[Sección 2]","[Sección 3]","[Sección 4]","[Sección 5]"];
  let faroAbierto = -1, bloqueado = false, llegando = -1; const encendidos = new Set();
  function abrePanel(i){ if (faroAbierto === i) return; faroAbierto = i; pT.textContent = TITULOS[i]; pC.innerHTML = ""; pC.appendChild(document.getElementById("s"+(i+1)).content.cloneNode(true));
    panel.hidden = false; gsap.fromTo(panel, {opacity:0, y:20}, {opacity:1, y:0, duration:.35, ease:"power2.out"}); encendidos.add(i);
    document.querySelectorAll(".mapa button")[i].classList.add("hecho"); }
  function cierraPanel(){ if (faroAbierto < 0) return; faroAbierto = -1; bloqueado = false; gsap.to(panel, {opacity:0, y:20, duration:.25, onComplete(){ panel.hidden = true; }}); }
  document.getElementById("cerrar").addEventListener("click", cierraPanel);
  function seguir(){ if (!bloqueado || faroAbierto < 0 || final) return; const i = faroAbierto; cierraPanel(); objetivoX = i < FAROS.length-1 ? FAROS[i+1] - 40 : LARGO - 330; }
  document.getElementById("seguir").addEventListener("click", seguir);
  addEventListener("keydown", e => { if (bloqueado && !final && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")){ e.preventDefault(); seguir(); } });
  addEventListener("pointerdown", e => { if (bloqueado && !final && !e.target.closest("a, .mapa, .hud, .cerrar")) seguir(); });

  /* ── el portal: al llegar, el alien entra, el portal se enciende y aparece el final ── */
  let final = false, portalBrillo = 0, alienDentro = 0;
  function activaPortal(){ final = true; bloqueado = true; al.vx = 0; objetivoX = null;
    const o = {v:0}; gsap.to(o, {v:1, duration:1.6, ease:"power2.in", onUpdate(){ alienDentro = o.v; portalBrillo = o.v; }});
    gsap.delayedCall(1.4, () => { const f = document.getElementById("final"); f.hidden = false; gsap.fromTo(f, {opacity:0}, {opacity:1, duration:.6}); }); }
  document.getElementById("reiniciar").addEventListener("click", () => { const f = document.getElementById("final"); gsap.to(f, {opacity:0, duration:.4, onComplete(){ f.hidden = true; }});
    final = false; bloqueado = false; alienDentro = 0; portalBrillo = 0; al.x = 420; camX = 0; objetivoX = null; encendidos.clear(); document.querySelectorAll(".mapa button").forEach(b => b.classList.remove("hecho")); });

  /* ── el dragón cruza el cielo de vez en cuando ── */
  const dragon = {activo:false, x:0, y:0, dir:1, t:0}; let proximoDragon = 8;
  function lanzaDragon(){ dragon.activo = true; dragon.dir = Math.random() < .5 ? 1 : -1; dragon.x = camX + (dragon.dir > 0 ? -300 : ancho + 300); dragon.y = 80 + Math.random()*160; dragon.t = 0; }

  /* ── cámara y bucle ── */
  let camX = 0, ultimo = performance.now(), listo = false;
  function paso(ahora){
    const dt = Math.min((ahora - ultimo)/1000, .05); ultimo = ahora;
    // entrada: teclas/botones mandan sobre la rueda; la rueda fija un objetivo y el alien corre hacia él
    let dir = (bloqueado || llegando >= 0) ? 0 : (teclas.ArrowRight ? 1 : 0) - (teclas.ArrowLeft ? 1 : 0);
    if (bloqueado) objetivoX = null;
    if (dir) objetivoX = null;
    if (!dir && objetivoX !== null){ const d = objetivoX - al.x; if (Math.abs(d) > 6) dir = Math.sign(d); else objetivoX = null; }
    const velMax = 340*K; al.vx += ((dir*velMax) - al.vx) * Math.min(1, dt*10);
    if (Math.abs(al.vx) < 4 && !dir) al.vx = 0;
    if (dir) al.mira = dir;
    al.x = Math.max(160, Math.min(LARGO - 330, al.x + al.vx*dt));
    if (!final && al.x >= LARGO - 335 && al.enSuelo){ activaPortal(); }
    // gravedad y suelo
    if (!al.enSuelo){ al.vy += 2200*K*dt; al.y += al.vy*dt; if (al.y >= SUELO_Y){ al.y = SUELO_Y; al.vy = 0; al.enSuelo = true; } }
    // estado y cuadro
    const est = !al.enSuelo ? (al.vy < 0 ? "jump" : "fall") : (Math.abs(al.vx) > 20 ? "run" : "idle");
    if (est !== al.estado){ al.estado = est; al.cuadro = 0; al.tAnim = 0; }
    al.tAnim += dt; const a = ANIM[al.estado]; al.cuadro = Math.floor(al.tAnim * a.fps) % a.n;
    // cámara: el alien al 38 % de la pantalla, suave
    const camObj = Math.max(0, Math.min(LARGO - ancho, al.x - ancho*.38)); camX += (camObj - camX) * Math.min(1, dt*6);
    // faros: cerca de uno, se enciende y abre su panel; lejos, se cierra
    let cerca = -1; FAROS.forEach((fx, i) => { if (Math.abs(al.x - fx) < 90) cerca = i; });
    if (cerca >= 0 && !encendidos.has(cerca)){
      const meta = FAROS[cerca] - 40;
      if (Math.abs(al.x - meta) > 6){ objetivoX = meta; llegando = cerca; }             // va andando hasta el faro, sin saltos
      else { al.x = meta; al.vx = 0; objetivoX = null; llegando = -1; bloqueado = true; abrePanel(cerca); }
    }
    else if (cerca >= 0 && !bloqueado && faroAbierto < 0 && Math.abs(al.vx) < 60) abrePanel(cerca);
    else if (cerca < 0 && faroAbierto >= 0 && !bloqueado) cierraPanel();
    if (faroAbierto >= 0){ const sx = (FAROS[faroAbierto] - camX) * escala; panel.style.left = Math.max(300, Math.min(innerWidth - 300, sx)) + "px"; }
    // gemas
    for (const ge of GEMAS){ ge.t += dt; if (!ge.ok && Math.abs(ge.x - al.x) < 30 && Math.abs(ge.y - (al.y - 45)) < 55){ ge.ok = true; document.getElementById("gemas").textContent = GEMAS.filter(q => q.ok).length; } }
    // larvas: patrullan entre dos puntos, como en el juego (70 px/s)
    for (const l of LARVAS){ l.x += l.dir*70*dt; l.t += dt; if (l.x > l.b){ l.x = l.b; l.dir = -1; } if (l.x < l.a){ l.x = l.a; l.dir = 1; } }
    for (const c of CAPARALES){ c.x += c.dir*60*dt; c.t += dt; if (c.x > c.b){ c.x = c.b; c.dir = -1; } if (c.x < c.a){ c.x = c.a; c.dir = 1; } }
    for (const n of NIEBLA){ n.x += n.v*dt; if (n.x > LARGO + 300) n.x = -300; }
    // dragón
    proximoDragon -= dt; if (!dragon.activo && proximoDragon <= 0) lanzaDragon();
    if (dragon.activo){ dragon.t += dt; dragon.x += dragon.dir*140*dt; dragon.y += Math.sin(dragon.t*1.5)*.4; if (dragon.x < camX - 400 || dragon.x > camX + ancho + 400){ dragon.activo = false; proximoDragon = 14 + Math.random()*14; } }
    // progreso y pista
    document.getElementById("barra").style.width = (al.x / LARGO * 100) + "%";
    if (cartel){ objetivoX = null; al.vx = 0; }
    pinta(ahora/1000);
    requestAnimationFrame(paso);
  }

  /* ── pintar: de atrás hacia delante ── */
  function capaRepetida(im, altoDestino, factor, yBase, alpha = 1, espejo = false){
    const w = im.width * (altoDestino / im.height), avance = camX*factor, periodo = espejo ? 2*w : w; const off = -(avance % periodo);
    g.globalAlpha = alpha;
    for (let x = off - periodo; x < ancho + periodo; x += w){
      const k = Math.round((x - off) / w), volteada = espejo && (k % 2 !== 0);
      if (volteada){ g.save(); g.translate(x + w, 0); g.scale(-1, 1); g.drawImage(im, 0, yBase, w + 1, altoDestino); g.restore(); }
      else g.drawImage(im, x, yBase, w + 1, altoDestino);
    }
    g.globalAlpha = 1;
  }
  function pinta(t){
    g.clearRect(0, 0, ancho, ALTO);
    // 1. cielo: fijo, estirado a cubrir (en el juego es un TextureRect con offset -350)
    { const im = img.lejos, s = Math.max(ancho/im.width, (ALTO+120)/im.height), w = im.width*s, h = im.height*s; g.drawImage(im, (ancho-w)/2, -110 + (ALTO+120-h)/2, w, h); }
    // 2. el planeta, fijo en pantalla
    g.drawImage(img.planeta, ancho - 330, 90, 210, 160);
    // 2b. colinas lejanas, muy lentas y claras, y las islitas altas al .4
    for (const c of LEJANAS){ const im = img["colina_"+c.v], sx = c.x - camX*.08, h = im.height*c.e*(ancho/1600)*.9, w = im.width/im.height*h; if (sx + w < 0 || sx > ancho) continue; g.save(); g.globalAlpha = .55; g.filter = "brightness(1.25) saturate(.6)"; g.drawImage(im, sx, SUELO_Y + 60 - h, w, h); g.restore(); }
    for (const i of ISLITAS){ const im = img["islita_"+i.v], sx = i.x - camX*.4, h = 360*i.e, w = im.width/im.height*h; if (sx + w < -50 || sx > ancho + 50) continue; g.save(); g.globalAlpha = .9; g.drawImage(im, sx, i.y + Math.sin(t*.6 + i.x)*6, w, h); g.restore(); }
    // 3. islas grandes flotando, scroll .6
    for (const i of ISLAS){ const im = img["isla_grande_"+i.v], sx = i.x - camX*.6, h = 700*i.e, w = im.width/im.height*h; if (sx + w < -50 || sx > ancho + 50) continue; g.drawImage(im, sx, i.y, w, h); }
    // 4. colinas del horizonte, scroll .18, ancladas al suelo (la base 130 px por debajo, tapada por el terreno)
    for (const c of COLINAS){ const im = img["colina_"+c.v], sx = c.x - camX*.18, h = im.height*c.e*(1600/im.width)*(ancho/1600)*.9, w = im.width/im.height*h; if (sx + w < 0 || sx > ancho) continue; g.drawImage(im, sx, SUELO_Y + 130 + c.j - h, w, h); }
    // 5. banda de bruma baja
    { const gr = g.createLinearGradient(0, SUELO_Y - 200, 0, SUELO_Y + 10); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.55, "rgba(255,255,255,.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, SUELO_Y - 200, ancho, 210); }
    // 6. el dragón cruza entre las colinas y el suelo
    if (dragon.activo){ const f = Math.floor(t*10) % 8, sx = dragon.x - camX; g.save(); g.translate(sx, dragon.y); if (dragon.dir < 0) g.scale(-1, 1); g.drawImage(img.dragon, f*250, 0, 250, 250, -90, -90, 180, 180); g.restore(); }
    // 7. menhires en el suelo, scroll 1, algo apagados
    for (const m of MENHIRES){ const im = img["menhir_"+m.v], sx = m.x - camX, h = 420*m.e, w = im.width/im.height*h; if (sx + w < -50 || sx > ancho + 50) continue; g.save(); g.globalAlpha = .9; g.filter = "saturate(.85) brightness(.95)"; g.drawImage(im, sx - w/2, SUELO_Y - h*.95, w, h); g.restore(); }
    // 8. niebla que deriva
    for (const n of NIEBLA){ const sx = n.x - camX; if (sx + n.w < 0 || sx > ancho) continue; const gr = g.createRadialGradient(sx + n.w/2, n.y, 0, sx + n.w/2, n.y, n.w/2); gr.addColorStop(0, `rgba(255,255,255,${n.a})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(sx + n.w/2, n.y, n.w/2, 40, 0, 0, 7); g.fill(); }
    // 9. el terreno: franja de hierba y tierra (el seamless del juego, tejas de 1024)
    { const im = img.suelo, RECORTE = 30, w = 1024, h = 192*K, sh = h * (im.width/w), off = -(camX % w); for (let x = off - w; x < ancho + w; x += w) g.drawImage(im, 0, RECORTE, im.width, sh, x, SUELO_Y - 24, w + 1, h); g.fillStyle = "#1b1410"; g.fillRect(0, SUELO_Y - 24 + h - 1, ancho, ALTO); }
    // 10. la nave estrellada al principio, sobre el terreno
    { const sx = 40 - camX; if (sx > -700 && sx < ancho) g.drawImage(img.nave, sx, SUELO_Y - 250, 420, 254); }
    // 11. plataformas tecnológicas y caparazones
    for (const p of PLATAFORMAS){ const sx = p.x - camX; if (sx < -200 || sx > ancho + 200) continue; g.drawImage(img.plataforma, sx - p.w/2, p.y, p.w, 23*K); }
    for (const ca of CAPARALES){ const sx = ca.x - camX; if (sx < -120 || sx > ancho + 120) continue; const s = 108*1.846*K, c = -48*K, f = Math.floor(ca.t*7) % 6;
      g.save(); g.translate(sx, SUELO_Y + c); if (ca.dir < 0) g.scale(-1, 1); g.drawImage(img.caparal_walk, f*108, 0, 108, 108, -s/2, -s/2, s, s); g.restore(); }
    // 12. faros y portal
    FAROS.forEach((fx, i) => { const sx = fx - camX; if (sx < -200 || sx > ancho + 200) return; const on = encendidos.has(i); g.save(); if (on){ g.shadowColor = "rgba(56,224,208,.9)"; g.shadowBlur = 30 + Math.sin(t*4)*10; } else g.globalAlpha = .85; g.drawImage(img.faro, sx - 16, SUELO_Y - 120, 32, 120); g.restore(); });
    { const sx = LARGO - 260 - camX; if (sx > -400 && sx < ancho + 400){ g.save(); g.globalAlpha = .9 + Math.sin(t*2)*.1; if (portalBrillo > 0){ g.shadowColor = "rgba(56,224,208,1)"; g.shadowBlur = 20 + portalBrillo*70; } g.drawImage(img.portal, sx - 52, SUELO_Y - 120*K - 70, 104, 140); g.restore(); } }
    // 13. fragmentos de energía: flotan
    for (const ge of GEMAS){ if (ge.ok) continue; const sx = ge.x - camX; if (sx < -40 || sx > ancho + 40) continue; g.drawImage(img.fragmento, sx - 8, ge.y - 12 + Math.sin(t*3 + ge.t)*4, 16, 23); }
    // 14. larvas
    for (const l of LARVAS){ const sx = l.x - camX; if (sx < -80 || sx > ancho + 80) continue; const f = Math.floor(l.t*8) % 6; g.save(); g.translate(sx, SUELO_Y); if (l.dir < 0) g.scale(-1, 1); { const s = 104*1.846*K, c = -46.2*K; g.drawImage(img.larva, f*104, 0, 104, 104, -s/2, c - s/2, s, s); } g.restore(); }
    // 15. el alienígena
    { const tira = img["alien_" + al.estado], sx = al.x - camX; g.save(); g.translate(sx + alienDentro*70, al.y - alienDentro*60); if (al.mira < 0) g.scale(-1, 1); if (alienDentro > 0){ g.globalAlpha = 1 - alienDentro; g.scale(1 - alienDentro*.8, 1 - alienDentro*.8); }
      g.drawImage(tira, al.cuadro*104, 0, 104, 104, -52*AL_ESC, -AL_PIES*AL_ESC, 104*AL_ESC, 104*AL_ESC); g.restore(); }
  }

  Promise.all(["lejos.webp","planeta.webp","islita_a.webp","islita_b.webp","islita_c.webp","isla_grande_a.webp","isla_grande_b.webp","colina_a.webp","colina_b.webp","menhir_a.webp","menhir_b.webp","nave.webp","suelo.jpg","plataforma.webp","caparal.webp","caparal_walk.webp","faro.webp","portal.webp","dragon.webp","fragmento.webp","larva.webp","alien_idle.webp","alien_run.webp","alien_jump.webp","alien_fall.webp"].map(carga))
    .then(() => { listo = true; ultimo = performance.now(); requestAnimationFrame(paso); });
})();
