// ========== Kivuli Resort — Admin Dashboard JS ==========

const KEY_KEY = 'kivuli_admin_key';
const USER_KEY = 'kivuli_admin_user';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function getKey(){ return localStorage.getItem(KEY_KEY); }
function setKey(k){ localStorage.setItem(KEY_KEY,k); }
function clearKey(){ localStorage.removeItem(KEY_KEY); localStorage.removeItem(USER_KEY); }

function show(sel){ $(sel).hidden=false; }
function hide(sel){ $(sel).hidden=true; }

// Tabs
$$('.sidebar nav button').forEach(b => {
  b.addEventListener('click', () => {
    $$('.sidebar nav button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const tab=b.dataset.tab;
    $$('.tab').forEach(t=>t.classList.remove('active'));
    $('#tab-'+tab).classList.add('active');
    $('#tabTitle').textContent = b.textContent.replace(/\d+/g,'').trim();
  });
});

// Login
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  $('#loginErr').textContent='';
  try{
    const res = await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fd)});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Login failed');
    setKey(data.key);
    localStorage.setItem(USER_KEY, fd.username);
    boot();
  }catch(err){ $('#loginErr').textContent = err.message; }
});

$('#logoutBtn').addEventListener('click', () => { clearKey(); location.reload(); });

async function api(path, opts={}){
  const key = getKey();
  const sep = path.includes('?')?'&':'?';
  const res = await fetch(path+sep+'key='+encodeURIComponent(key), {
    ...opts,
    headers:{'Content-Type':'application/json',...(opts.headers||{})}
  });
  if(res.status===401){ clearKey(); location.reload(); return; }
  return res.json();
}

async function loadAll(){
  const [bookings, contacts, allReviewsRaw] = await Promise.all([api('/api/bookings'), api('/api/contact'), api('/api/reviews')]);

  // Stats
  const pending = bookings.filter(b=>b.status==='pending').length;
  const unread = contacts.filter(m=>!m.read).length;
  const pendingReviews = Array.isArray(allReviewsRaw)? allReviewsRaw.filter(r=>r.approved===false) : [];
  $('#sBookings').textContent = bookings.length;
  $('#sPending').textContent = pending;
  $('#sMessages').textContent = contacts.length;
  $('#sUnread').textContent = unread;
  $('#bc').textContent = pending;
  $('#mc').textContent = unread;
  $('#rc').textContent = pendingReviews.length;

  // Short lists
  $('#bkShort').innerHTML = bookings.slice(0,5).map(b=>`
    <tr><td>${b.name}</td><td>${b.roomType}</td><td>${b.checkIn||'—'}</td>
    <td><span class="status ${b.status}">${b.status}</span></td></tr>`).join('') || '<tr><td colspan="4" style="color:#999">No bookings yet</td></tr>';

  $('#msgShort').innerHTML = contacts.slice(0,5).map(m=>`
    <li><b>${m.name}</b> — ${(m.subject||'').slice(0,40)}<br/><small style="color:#6b6b6b">${m.message.slice(0,70)}...</small></li>`).join('')
    || '<li style="color:#999">No messages yet</li>';

  // Bookings table
  $('#bkTable tbody').innerHTML = bookings.map(b=>`
    <tr>
      <td><code>${b.id}</code></td>
      <td><b>${b.name}</b><br/><small>${b.phone} ${b.email?'· '+b.email:''}</small></td>
      <td><a href="tel:${b.phone}" style="color:#0b3d2e">${b.phone}</a></td>
      <td>${b.roomType}<br/><small>${b.guests} guest(s)${b.notes?' · '+b.notes.slice(0,30):''}</small></td>
      <td>${b.checkIn||'—'}<br/><small>to ${b.checkOut||'—'}</small></td>
      <td>${b.guests}</td>
      <td><span class="status ${b.status}">${b.status}</span></td>
      <td class="row-act">
        <button onclick="updateBooking('${b.id}','confirmed')">Confirm</button>
        <button class="danger" onclick="delBooking('${b.id}')">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:#999;padding:2rem">No bookings yet — they will appear here.</td></tr>';

  // Messages
  $('#msgList').innerHTML = contacts.map(m=>`
    <div class="msg-item">
      <h4>${m.name} <small style="font-weight:400;color:#6b6b6b">— ${m.subject||'General Enquiry'}</small></h4>
      <div class="meta">${new Date(m.createdAt).toLocaleString('en-KE')} · ${m.email||'no email'} ${m.phone?'· '+m.phone:''}</div>
      <p>${m.message.replace(/</g,'&lt;')}</p>
      <div class="actions">
        <button onclick="reply('${m.phone||m.email}')">Reply ${m.phone?'(Call)':'(Email)'}</button>
        <button class="danger" onclick="delMsg('${m.id}')">Delete</button>
      </div>
    </div>`).join('') || '<p style="color:#999;text-align:center;padding:2rem">No messages yet.</p>';
}

  // Reviews moderation
  const pendingReviews = Array.isArray(allReviewsRaw)? allReviewsRaw.filter(r=>r.approved===false) : [];
  $('#revList').innerHTML = (allReviewsRaw||[]).map(r=>`
    <div class="msg-item" style="border-left-color:${r.approved===false?'#c9a961':'#117a4a'}">
      <h4>${r.name} <small style="font-weight:400;color:#6b6b6b">— ${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)} · ${r.date}</small>
        ${r.approved===false?'<span class="status pending" style="margin-left:.5rem">Pending</span>':'<span class="status confirmed" style="margin-left:.5rem">Approved</span>'}</h4>
      <p>${(r.text||'').replace(/</g,'&lt;')}</p>
      <div class="actions">
        ${r.approved===false?`<button onclick="approveReview('${r.id}')">Approve</button>`:''}
        <button class="danger" onclick="delReview('${r.id}')">Delete</button>
      </div>
    </div>`).join('') || '<p style="color:#999;text-align:center;padding:2rem">No reviews yet.</p>';
}

window.updateBooking = async (id,status)=>{ await api('/api/bookings/'+id,{method:'PATCH',body:JSON.stringify({status})}); loadAll(); };
window.approveReview = async id => { await api('/api/reviews/'+id,{method:'PATCH',body:JSON.stringify({approved:true})}); loadAll(); };
window.delReview = async id => { if(confirm('Delete this review?')){ await api('/api/reviews/'+id,{method:'DELETE'}); loadAll(); } };
window.delBooking = async id => { if(confirm('Delete this booking?')){ await api('/api/bookings/'+id,{method:'DELETE'}); loadAll(); } };
window.delMsg = async id => { if(confirm('Delete this message?')){ await api('/api/contact/'+id,{method:'DELETE'}); loadAll(); } };
window.reply = (c) => {
  if(c && c.startsWith('+')) location.href='tel:'+c;
  else if(c) location.href='mailto:'+c;
};

function boot(){
  if(getKey()){ hide('#loginView'); show('#dashView'); loadAll(); }
  else { show('#loginView'); hide('#dashView'); }
}
boot();
