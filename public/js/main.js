// ========== Kivuli Resort — Front-end JavaScript ==========

// ---------- Register Service Worker for PWA / offline support ----------
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}

// ---------- Cookie banner ----------
if (!localStorage.getItem('kivuliCookies')) {
  setTimeout(() => { document.getElementById('cookieBanner').hidden = false; }, 1500);
}

// Year in footer
document.getElementById('yr').textContent = new Date().getFullYear();

// ---------- Navbar scroll effect ----------
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ---------- Mobile menu ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

// ---------- Count-up for stats ----------
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 50));
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target + '+'; return; }
        el.textContent = cur;
        requestAnimationFrame(tick);
      };
      tick();
      countIO.unobserve(el);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

// ---------- Gallery lightbox ----------
const lb = document.createElement('div');
lb.className = 'lightbox';
lb.innerHTML = `<button class="close" aria-label="Close">×</button><img alt="preview"/>`;
document.body.appendChild(lb);
const lbImg = lb.querySelector('img');
document.querySelectorAll('.g-item img').forEach(img => {
  img.addEventListener('click', () => { lbImg.src = img.src; lb.classList.add('open'); });
});
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('close')) lb.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('open'); });

// ---------- Reviews ----------
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n)}
function initials(name){return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
async function loadReviews(){
  try{
    const r = await fetch('/api/reviews'); const data = await r.json();
    const grid = document.getElementById('reviewsGrid');
    grid.innerHTML = data.slice(0,6).map(rev => `
      <div class="review-card">
        <div class="stars">${stars(rev.rating)}</div>
        <blockquote>"${rev.text}"</blockquote>
        <div class="who">
          <div class="avatar">${initials(rev.name)}</div>
          <div><b>${rev.name}</b><small>${rev.date ? new Date(rev.date).toLocaleDateString('en-KE',{year:'numeric',month:'long'}) : 'Guest'}</small></div>
        </div>
      </div>`).join('');
  }catch(e){ console.warn('Reviews:', e); }
}
loadReviews();

// ---------- Booking form ----------
const bkForm = document.getElementById('bookingForm');
const bkMsg = document.getElementById('bookingMsg');
bkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(bkForm));
  bkMsg.textContent = 'Sending...'; bkMsg.className = 'form-msg';
  try{
    const res = await fetch('/api/bookings', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(fd)});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Submit failed');
    bkMsg.textContent = `✅ Thank you ${fd.name}! Your request ${data.booking.id} has been received. We'll call you shortly to confirm.`;
    bkMsg.className = 'form-msg ok';
    bkForm.reset();
  }catch(err){ bkMsg.textContent = '❌ '+err.message; bkMsg.className='form-msg err'; }
});

// ---------- Contact form ----------
const ctForm = document.getElementById('contactForm');
const ctMsg = document.getElementById('contactMsg');
ctForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(ctForm));
  ctMsg.textContent='Sending...'; ctMsg.className='form-msg';
  try{
    const res = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(fd)});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Submit failed');
    ctMsg.textContent = '✅ Message sent! We will get back to you soon.';
    ctMsg.className = 'form-msg ok';
    ctForm.reset();
  }catch(err){ ctMsg.textContent='❌ '+err.message; ctMsg.className='form-msg err'; }
});

// ---------- Newsletter ----------
const nForm = document.getElementById('newsForm');
const nMsg = document.getElementById('newsMsg');
nForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(nForm));
  try{
    const res = await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fd)});
    const data = await res.json();
    nMsg.textContent = data.alreadySubscribed ? 'You are already subscribed ✅' : '🎉 Subscribed! Karibu.';
    nMsg.className='form-msg ok';
    nForm.reset();
  }catch(err){ nMsg.textContent='❌ '+err.message; nMsg.className='form-msg err'; }
});

// ---------- Review submission ----------
const rvForm = document.getElementById('reviewForm');
const rvMsg = document.getElementById('reviewMsg');
rvForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(rvForm));
  rvMsg.textContent='Submitting...'; rvMsg.className='form-msg';
  try{
    const res = await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fd)});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Submit failed');
    rvMsg.textContent='✅ Asante sana! Your review has been submitted and will appear once approved.';
    rvMsg.className='form-msg ok';
    rvForm.reset();
  }catch(err){ rvMsg.textContent='❌ '+err.message; rvMsg.className='form-msg err'; }
});

// Pre-fill default check-in/out dates
(function(){
  const inEl = bkForm.querySelector('[name=checkIn]');
  const outEl = bkForm.querySelector('[name=checkOut]');
  const t = new Date();
  const iso=d=>d.toISOString().slice(0,10);
  inEl.value = iso(t);
  const next = new Date(t); next.setDate(t.getDate()+1);
  outEl.value = iso(next);
})();
