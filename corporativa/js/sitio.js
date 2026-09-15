/* web-corporativa — movimiento contenido: revelados atados al scroll, las cifras cuentan una vez, el hero respira. */
(function(){
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducido){ document.querySelectorAll(".cifra b").forEach(b => b.textContent = b.dataset.n + (b.dataset.suf||"")); return; }
  gsap.registerPlugin(ScrollTrigger);

  // hero: entra una vez; la foto hace un zoom lento con el scroll
  gsap.timeline({defaults:{ease:"power3.out"}}).to(".hero .revela", {opacity:1, y:0, duration:1.2, stagger:.15, delay:.2});
  gsap.fromTo(".hero .foto img", {scale:1.06}, {scale:1.14, ease:"none", scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});

  // el resto se revela atado al scroll; si subes, se recoge
  document.querySelectorAll(".revela").forEach(el => { if (el.closest(".hero")) return;
    gsap.to(el, {opacity:1, y:0, ease:"none", scrollTrigger:{trigger:el, start:"top 92%", end:"top 68%", scrub:.6}}); });

  // las cifras cuentan desde 0 la primera vez que se ven. El valor va en data-n (los corchetes se ignoran).
  document.querySelectorAll(".cifra b").forEach(b => {
    const n = parseFloat(String(b.dataset.n).replace(/[^\d.]/g, "")) || 0, suf = b.dataset.suf || "", o = {v:0};
    ScrollTrigger.create({trigger:b, start:"top 85%", once:true, onEnter(){ gsap.to(o, {v:n, duration:1.6, ease:"power2.out", onUpdate(){ b.textContent = Math.round(o.v) + suf; }}); }});
  });

  // la cabecera se compacta al bajar
  ScrollTrigger.create({start:"top -80", toggleClass:{targets:".cab", className:"compacta"}});
})();
