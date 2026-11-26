// Sonyflowers — Arão Lende Web Design
(function(){
'use strict';

/* ---------- splash (apenas uma vez por sessão, só na página inicial) ---------- */
function splash(){
  const el = document.getElementById('splash');
  if(!el) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try{ seen = sessionStorage.getItem('sf_splash') === '1'; }catch(e){}
  if(seen || reduced){ el.remove(); return; }
  try{ sessionStorage.setItem('sf_splash','1'); }catch(e){}
  document.documentElement.style.overflow = 'hidden';
  setTimeout(()=>{
    el.classList.add('hide');
    document.documentElement.style.overflow = '';
    setTimeout(()=>el.remove(), 950);
  }, 2000);
}

/* ---------- nav ---------- */
function nav(){
  const btn = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav.primary');
  const header = document.querySelector('.site-header');
  if(btn && menu){
    btn.addEventListener('click', ()=>{
      const open = menu.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true':'false');
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
      menu.classList.remove('open'); btn.classList.remove('open');
    }));
  }
  if(header){
    const onScroll = ()=> header.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.primary a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path || (path==='' && href==='index.html')) a.classList.add('active');
  });
}

/* ---------- scroll reveal ---------- */
function reveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, {threshold:.14, rootMargin:'0px 0px -6% 0px'});
  items.forEach((it,i)=>{ it.style.setProperty('--i', i%8); io.observe(it); });
}

/* ---------- petals ---------- */
function petals(container){
  if(!container) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ffcfe1','#ffb0cd','#f98bb3'];
  const n = container.dataset.petals ? +container.dataset.petals : 10;
  for(let i=0;i<n;i++){
    const p = document.createElement('span');
    p.className = 'petal';
    const size = 8 + Math.random()*14;
    p.style.width = size+'px';
    p.style.height = size*0.8+'px';
    p.style.left = Math.random()*100+'%';
    p.style.top = (-10-Math.random()*20)+'%';
    p.style.background = colors[i%colors.length];
    p.style.setProperty('--dx', (Math.random()*80-40)+'px');
    p.style.animationDuration = (9+Math.random()*8)+'s';
    p.style.animationDelay = (Math.random()*8)+'s';
    container.appendChild(p);
  }
}

/* ---------- 3D gallery (arrasto + auto-rotação) ---------- */
function gallery3d(){
  const stage = document.querySelector('.gallery-stage');
  if(!stage) return;
  const track = stage.querySelector('.gallery-track');
  const items = Array.from(stage.querySelectorAll('.g-item'));
  const n = items.length;
  if(!n) return;
  let angle = 0;
  const step = 360/n;
  const radius = Math.max(260, stage.offsetWidth*0.46);
  items.forEach((it,i)=>{
    it.style.transform = `translate(-50%,-50%) rotateY(${i*step}deg) translateZ(${radius}px)`;
  });
  function render(){
    track.style.transform = `rotateY(${angle}deg)`;
    items.forEach((it,i)=>{
      const a = ((i*step + angle) % 360 + 360) % 360;
      const front = Math.min(a, 360-a);
      const depth = front/180; // 0 front .. 1 back
      it.style.opacity = String(1 - depth*0.75);
      it.style.filter = `brightness(${1 - depth*0.35}) blur(${depth*2}px)`;
      it.style.zIndex = String(Math.round((1-depth)*100));
    });
  }
  render();

  let auto = true, raf;
  function loop(){ if(auto){ angle += 0.06; render(); } raf = requestAnimationFrame(loop); }
  raf = requestAnimationFrame(loop);

  let dragging=false, startX=0, startAngle=0;
  const onDown = (x)=>{ dragging=true; auto=false; startX=x; startAngle=angle; stage.style.cursor='grabbing'; };
  const onMove = (x)=>{ if(!dragging) return; angle = startAngle + (x-startX)*0.35; render(); };
  const onUp = ()=>{ dragging=false; stage.style.cursor='grab'; setTimeout(()=>auto=true, 3200); };

  stage.addEventListener('mousedown', e=>onDown(e.clientX));
  window.addEventListener('mousemove', e=>onMove(e.clientX));
  window.addEventListener('mouseup', onUp);
  stage.addEventListener('touchstart', e=>onDown(e.touches[0].clientX), {passive:true});
  stage.addEventListener('touchmove', e=>onMove(e.touches[0].clientX), {passive:true});
  stage.addEventListener('touchend', onUp);

  const prev = document.querySelector('[data-g="prev"]');
  const next = document.querySelector('[data-g="next"]');
  if(prev) prev.addEventListener('click', ()=>{ auto=false; angle -= step; render(); setTimeout(()=>auto=true,3200); });
  if(next) next.addEventListener('click', ()=>{ auto=false; angle += step; render(); setTimeout(()=>auto=true,3200); });

  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop); });
}

/* ---------- tilt on hero stage cards ---------- */
function tilt(){
  const stage = document.querySelector('.hero-stage');
  if(!stage) return;
  if(matchMedia('(pointer: coarse)').matches) return;
  const cards = stage.querySelectorAll('.stage-card');
  stage.addEventListener('mousemove', e=>{
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left)/r.width - .5;
    const py = (e.clientY - r.top)/r.height - .5;
    cards.forEach((c,i)=>{
      const f = (i+1)*4;
      c.style.transform = `translate3d(${-px*f}px, ${-py*f}px, 0)`;
    });
  });
  stage.addEventListener('mouseleave', ()=> cards.forEach(c=> c.style.transform=''));
}

/* ---------- catalog filter ---------- */
function filters(){
  const chips = document.querySelectorAll('.chip[data-filter]');
  const cards = document.querySelectorAll('.grid [data-cat]');
  if(!chips.length) return;
  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      cards.forEach(card=>{
        const show = f==='all' || card.dataset.cat===f;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---------- year ---------- */
function year(){
  document.querySelectorAll('[data-year]').forEach(el=> el.textContent = new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', ()=>{
  splash(); nav(); reveal(); filters(); year(); tilt();
  gallery3d();
  document.querySelectorAll('[data-petals]').forEach(petals);
});
})();
