// Kivuli Resort - Backend Server (Node.js / Express)
// Provides: REST API for bookings, contact messages, newsletter, admin login
// Data is persisted to JSON files in /data so the site works out-of-the-box
// without needing a database. Swap to MongoDB/MySQL when deploying to production.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static front-end from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- Data helpers ----------
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB = {
  bookings: path.join(DATA_DIR, 'bookings.json'),
  contacts: path.join(DATA_DIR, 'contacts.json'),
  subscribers: path.join(DATA_DIR, 'subscribers.json'),
  reviews: path.join(DATA_DIR, 'reviews.json'),
};

function load(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) {
      // Seed file if it doesn't exist (first run / fresh deploy)
      if (fallback && fallback.length) save(file, fallback);
      return fallback;
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}
function save(file, data) {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch(e){ /* ephemeral fs — fail silently */ }
}

// Seed reviews on first boot
const SEED_REVIEWS = [
  { name:'Prince Fessie', rating:5, text:'Zarah Juma served us that day, she was polite and humble and we really had a great day visiting the place for food and drinks.', date:'2024-10-12', approved:true },
  { name:'George Nakasangah', rating:5, text:'A beautiful quiet place in Kanduyi, Bungoma to relax and eat. They also offer affordable accommodation.', date:'2025-02-20', approved:true },
  { name:'Isaiah Barasa', rating:5, text:'Quiet place, very easy to reach. The environment is calm and the service is excellent.', date:'2023-07-04', approved:true },
];

// Seed a few sample reviews if empty
// Seed on first boot
load(DB.bookings, []);
load(DB.contacts, []);
load(DB.subscribers, []);
load(DB.reviews, SEED_REVIEWS);

// ---------- Email (best-effort; won't break the site if not configured) ----------
// To enable real email, set these env vars in production. If unset, messages are
// saved to disk and the admin dashboard shows them.
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function notifyOwner(subject, html) {
  if (!mailer) return;
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || 'website@kivuliresort.co.ke',
      to: process.env.OWNER_EMAIL || 'reservations@kivuliresort.co.ke',
      subject,
      html,
    });
  } catch (e) {
    console.error('Email send failed:', e.message);
  }
}

// ---------- Validators ----------
function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function isPhone(s) { return /^[+\d][\d\s\-()]{6,}$/.test(s); }

// ---------- API: Bookings ----------
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, checkIn, checkOut, guests, roomType, notes } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });
  if (email && !isEmail(email)) return res.status(400).json({ error: 'Invalid email address.' });
  if (!isPhone(phone)) return res.status(400).json({ error: 'Invalid phone number.' });

  const booking = {
    id: 'BK-' + Date.now().toString(36).toUpperCase(),
    name: name.trim(),
    email: (email || '').trim(),
    phone: phone.trim(),
    checkIn: checkIn || null,
    checkOut: checkOut || null,
    guests: Number(guests) || 1,
    roomType: roomType || 'Standard',
    notes: (notes || '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const bookings = load(DB.bookings);
  bookings.unshift(booking);
  save(DB.bookings, bookings);

  notifyOwner(
    'New Booking Request - Kivuli Resort',
    `<p><strong>${booking.name}</strong> requested a booking.</p>
     <ul><li>Phone: ${booking.phone}</li><li>Email: ${booking.email}</li>
     <li>Check-in: ${booking.checkIn}</li><li>Check-out: ${booking.checkOut}</li>
     <li>Guests: ${booking.guests}</li><li>Room: ${booking.roomType}</li>
     <li>Notes: ${booking.notes}</li></ul>`
  );

  res.json({ ok: true, booking });
});

app.get('/api/bookings', (req, res) => {
  // Admin gate (simple shared-secret for demo; upgrade to JWT/sessions in prod)
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(load(DB.bookings));
});

app.patch('/api/bookings/:id', (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const bookings = load(DB.bookings);
  const i = bookings.findIndex(b => b.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  bookings[i] = { ...bookings[i], ...req.body, id: bookings[i].id };
  save(DB.bookings, bookings);
  res.json({ ok: true, booking: bookings[i] });
});

app.delete('/api/bookings/:id', (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const bookings = load(DB.bookings).filter(b => b.id !== req.params.id);
  save(DB.bookings, bookings);
  res.json({ ok: true });
});

// ---------- API: Contact ----------
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};
  if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });
  if (email && !isEmail(email)) return res.status(400).json({ error: 'Invalid email address.' });

  const msg = {
    id: 'MSG-' + Date.now().toString(36).toUpperCase(),
    name: name.trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    subject: (subject || 'General Enquiry').trim(),
    message: message.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  const contacts = load(DB.contacts);
  contacts.unshift(msg);
  save(DB.contacts, contacts);

  notifyOwner(
    'New Contact Message - Kivuli Resort',
    `<p><strong>${msg.name}</strong> sent a message.</p>
     <p>Subject: ${msg.subject}</p><p>${msg.message}</p>
     <p>Reply to: ${msg.email || 'n/a'} / ${msg.phone || 'n/a'}</p>`
  );
  res.json({ ok: true, message: msg });
});

app.get('/api/contact', (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(load(DB.contacts));
});

app.delete('/api/contact/:id', (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  save(DB.contacts, load(DB.contacts).filter(m => m.id !== req.params.id));
  res.json({ ok: true });
});

// ---------- API: Newsletter ----------
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email.' });
  const subs = load(DB.subscribers);
  if (subs.some(s => s.email === email.toLowerCase())) {
    return res.json({ ok: true, alreadySubscribed: true });
  }
  subs.push({ email: email.toLowerCase(), createdAt: new Date().toISOString() });
  save(DB.subscribers, subs);
  res.json({ ok: true });
});

// ---------- API: Reviews (public) ----------
app.get('/api/reviews', (req, res) => {
  const all = load(DB.reviews);
  // Admin with key gets everything; public only sees approved
  if (req.query.key === process.env.ADMIN_KEY || req.get('X-Admin-Key') === process.env.ADMIN_KEY) {
    return res.json(all);
  }
  res.json(all.filter(r => r.approved !== false));
});

// Public: submit a new review (goes to moderation queue)
app.post('/api/reviews', (req, res) => {
  const { name, rating, text } = req.body || {};
  if (!name || !text || !rating) return res.status(400).json({ error: 'Name, rating and review text are required.' });
  const r = Number(rating);
  if (isNaN(r) || r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be 1–5.' });
  const review = {
    id: 'RV-' + Date.now().toString(36).toUpperCase(),
    name: String(name).trim().slice(0,60),
    rating: r,
    text: String(text).trim().slice(0,500),
    date: new Date().toISOString().slice(0,10),
    approved: false, // must be approved in admin before showing
    createdAt: new Date().toISOString(),
  };
  const all = load(DB.reviews);
  all.unshift(review);
  save(DB.reviews, all);
  res.json({ ok: true, review });
});

app.patch('/api/reviews/:id', (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const all = load(DB.reviews);
  const i = all.findIndex(r => r.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  all[i] = { ...all[i], ...req.body, id: all[i].id };
  save(DB.reviews, all);
  res.json({ ok: true, review: all[i] });
});

app.delete('/api/reviews/:id', (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY && req.get('X-Admin-Key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  save(DB.reviews, load(DB.reviews).filter(r => r.id !== req.params.id));
  res.json({ ok: true });
});

// ---------- Admin auth (simple demo) ----------
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'kivuli2025';
  const ADMIN_KEY = process.env.ADMIN_KEY || 'kivuli-admin-key-2025';
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ ok: true, key: ADMIN_KEY });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// ---------- SPA / admin routes ----------
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});
app.get(['/book', '/menu', '/rooms', '/gallery', '/contact', '/about'], (_req, res) => {
  // Single-page front-end - index.html handles routing client-side
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Health check
app.get('/health', (_req, res) => res.json({ ok:true, name:'Kivuli Resort', time:new Date().toISOString() }));

// 404 JSON for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌴 Kivuli Resort server running on http://0.0.0.0:${PORT}`);
});
