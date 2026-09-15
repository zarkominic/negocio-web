/* web-galeria — rejilla con filtros, y ficha con galería a pantalla completa (flechas, teclado, deslizar). */
(function(){
  const eur = n => n.toLocaleString("es-ES") + " €";
  const rejilla = document.getElementById("rejilla"), cuenta = document.getElementById("cuenta"), vacio = document.getElementById("vacio");
  const fTipo = document.getElementById("fTipo"), fZona = document.getElementById("fZona"), fPrecio = document.getElementById("fPrecio"), fHab = document.getElementById("fHab");
  [...new Set(PROPIEDADES.map(p => p.zona))].forEach(z => { const o = document.createElement("option"); o.textContent = z; fZona.appendChild(o); });

  function pinta(){
    const lista = PROPIEDADES.filter(p => (!fTipo.value || p.tipo === fTipo.value) && (!fZona.value || p.zona === fZona.value) && (!fPrecio.value || p.precio <= +fPrecio.value) && (!fHab.value || p.hab >= +fHab.value));
    rejilla.innerHTML = lista.map(p => `<button class="tarjeta" data-id="${p.id}" type="button">
      <div class="marco"><img src="img/${p.fotos[0]}" alt="" loading="lazy"><span class="n">${p.fotos.length} fotos</span></div>
      <div class="precio">${eur(p.precio)}</div><h3>${p.titulo}</h3>
      <div class="meta">${p.zona} · ${p.m2} m² · ${p.hab} hab · ${p.banos} baños</div></button>`).join("");
    cuenta.textContent = lista.length + (lista.length === 1 ? " propiedad" : " propiedades"); vacio.hidden = lista.length > 0;
    rejilla.querySelectorAll(".tarjeta").forEach(b => b.addEventListener("click", () => abre(b.dataset.id)));
    if (window.gsap) gsap.from(".tarjeta", {y:18, opacity:0, duration:.5, stagger:.06, ease:"power2.out", clearProps:"all"});
  }
  [fTipo, fZona, fPrecio, fHab].forEach(s => s.addEventListener("change", pinta));
  pinta();

  /* ── la ficha ── */
  const ficha = document.getElementById("ficha"), pista = document.getElementById("pista"), minis = document.getElementById("miniaturas"), contador = document.getElementById("contador");
  let actual = null, i = 0;
  function abre(id){
    actual = PROPIEDADES.find(p => p.id === id); i = 0;
    pista.innerHTML = actual.fotos.map(f => `<img src="img/${f}" alt="">`).join("");
    minis.innerHTML = actual.fotos.map((f, k) => `<img src="img/${f}" alt="" data-k="${k}">`).join("");
    minis.querySelectorAll("img").forEach(m => m.addEventListener("click", () => ir(+m.dataset.k)));
    document.getElementById("fZonaTxt").textContent = actual.zona + " · " + actual.tipo; document.getElementById("fTitulo").textContent = actual.titulo;
    document.getElementById("fDesc").textContent = actual.desc; document.getElementById("fPrecioTxt").textContent = eur(actual.precio);
    document.getElementById("fDatos").innerHTML = [["Superficie", actual.m2 + " m²"],["Habitaciones", actual.hab],["Baños", actual.banos],["Planta", actual.planta]].map(([k,v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");
    ficha.hidden = false; document.body.style.overflow = "hidden"; ficha.scrollTop = 0; ir(0);
    if (window.gsap) gsap.fromTo(ficha, {opacity:0}, {opacity:1, duration:.3});
    history.replaceState(null, "", "#" + id);
  }
  function cierra(){ if (!actual) return; actual = null; ficha.hidden = true; document.body.style.overflow = ""; history.replaceState(null, "", " "); }
  function ir(k){ const n = actual.fotos.length; i = (k + n) % n; pista.style.transform = `translateX(${-i*100}%)`; contador.textContent = (i+1) + " / " + n;
    minis.querySelectorAll("img").forEach((m, j) => m.classList.toggle("activa", j === i)); const a = minis.querySelector(".activa"); if (a) a.scrollIntoView({inline:"center", block:"nearest", behavior:"smooth"}); }
  document.getElementById("cerrar").addEventListener("click", cierra);
  document.getElementById("prev").addEventListener("click", () => ir(i-1)); document.getElementById("next").addEventListener("click", () => ir(i+1));
  addEventListener("keydown", e => { if (!actual) return; if (e.key === "Escape") cierra(); if (e.key === "ArrowLeft") ir(i-1); if (e.key === "ArrowRight") ir(i+1); });
  // deslizar en móvil
  let x0 = null; const gal = document.getElementById("galeria");
  gal.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, {passive:true});
  gal.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 40) ir(d < 0 ? i+1 : i-1); }, {passive:true});
  // enlace directo a una ficha: #p2
  if (location.hash && PROPIEDADES.some(p => "#" + p.id === location.hash)) abre(location.hash.slice(1));
})();
