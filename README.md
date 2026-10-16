[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/patricknahashon27-wq/kivuli-resort)

# 🌴 Kivuli Resort, Bungoma — Premium Website

A complete, production-ready full-stack website built for **Kivuli Resort**
(Kanduyi, Bungoma, Kenya) — ready to demo and sell to the resort owners.

---

## ✨ What's Included

### 🎨 Front-end (premium, mobile-first)
- **Hero section** with cinematic resort image, live rating, 24/7 badge, CTA buttons
- **About** page telling the Kivuli ("shade") story with signature Google rating badge
- **Animated stats strip** (24/7, 144+ reviews, etc.)
- **Rooms** — Standard / Deluxe / Family cards with pricing
- **Dining** — full menu (nyama choma, tilapia, kuku choma, breakfast, drinks/cocktails)
- **Amenities** — Pool, Sauna, Gardens, Conference/Events, 24h Restaurant, Bar
- **Gallery** with click-to-enlarge lightbox (10 premium photos)
- **Reviews** pulled live from seeded Google reviews via API
- **Booking form** (name, phone, email, dates, guests, room type, notes) → REST API
- **Contact form** + embedded Google Map + WhatsApp float button + newsletter signup
- **Footer** with quick links, address, phone, socials
- Scroll-reveal animations, sticky nav with blur, smooth scroll, count-up numbers
- Fully responsive (desktop / tablet / mobile)
- Branding: deep forest green + gold luxury palette, Playfair Display + Inter typography
- Color scheme inspired by the "Kivuli" (shade) name

### ⚙️ Back-end (Node.js + Express REST API)
- `POST /api/bookings` — receive & persist booking requests
- `POST /api/contact` — receive contact messages
- `POST /api/subscribe` — newsletter sign-up
- `GET /api/reviews` — public review feed
- `POST /api/admin/login` — admin authentication
- Admin-protected endpoints (read/confirm/delete bookings & messages)
- JSON file persistence (works out-of-the-box; easy to swap for MongoDB/MySQL)
- Optional SMTP email notifications (set env vars in production)

### 🔐 Admin Dashboard (`/admin`)
- Secure login (default `admin` / `kivuli2025` — change via env vars)
- Overview with live stats (total bookings, pending, messages, unread)
- Bookings table with "Confirm" / "Delete" actions
- Messages inbox with quick reply (tel:/mailto:) and delete
- Mobile-responsive sidebar layout

### 🖼️ Images used
- **Hero + Restaurant interior (cover2.jpg):** scraped directly from the official Google Maps listing (authentic Kivuli photos)
- **All other visuals:** AI-generated to match Kivuli's actual casual Kenyan-resort aesthetic (nyama choma, Tusker, plastic chairs, green umbrellas, gardens) — these are placeholders the client will swap out after a professional photo shoot (built into your upsell).

### 📄 Other pages
- `/menu.html` — printable full menu (customers can click "Print / PDF" to save)
- `/proposal.html` — printable business proposal document for you to hand the owner
- `/admin` — staff dashboard

### 💬 Business integrations
- Floating **WhatsApp** button → `wa.me/254110096089`
- Floating **Book Now** button on mobile
- Embedded **Google Map** for Kivuli Resort location
- Clickable phone: `+254 110 096 089`
- Clickable email: `info@kivuliresort.co.ke`

### 📱 PWA / Installable
- `manifest.json` + service worker (`sw.js`) → "Add to Home Screen" on Android/iPhone
- Offline support for the core pages

### 🧩 SEO
- JSON-LD Schema.org structured data (Restaurant + LodgingBusiness)
- Open Graph / Twitter Card meta tags for social sharing

---

## 🏢 About the Resort (verified facts used on the site)

| Detail | Value |
|---|---|
| Name | **Kivuli Resort** |
| Location | Kanduyi (near African Institute), Bungoma, Kenya |
| Plus code | HH95+R9 Bungoma |
| Phone | **+254 110 096 089** |
| Rating | **4.1 ★** on Google (144+ reviews) |
| Hours | **Open 24 hours** every day |
| Services | Dine-in · Takeaway · Delivery |
| Amenities | Restaurant, Bar, Accommodation, Swimming pool, Sauna, Conference/Events, Free private parking, Gardens, Car/Bike hire |
| Keywords from reviews | "quiet environment", "relaxing", "sauna", "cool place", "hospitality" |
| Existing domain | kivuliresort.com (currently offline — strong sales argument!) |

---

## 🚀 Running locally

```bash
cd kivuli-resort
npm install
npm start
# then open http://localhost:3000
# admin at http://localhost:3000/admin  (admin / kivuli2025)
```

### Production environment variables (optional)
```
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=change-me
ADMIN_KEY=long-random-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
SMTP_FROM=website@kivuliresort.co.ke
OWNER_EMAIL=reservations@kivuliresort.co.ke
```

---

## 📁 Project structure

```
kivuli-resort/
├── package.json
├── README.md                    ← this file (sales pitch + docs)
├── server/
│   └── server.js                ← Express API + static serving
├── public/
│   ├── index.html               ← main site
│   ├── admin.html               ← admin dashboard
│   ├── css/style.css            ← premium styling
│   ├── css/admin.css            ← admin styling
│   ├── js/main.js               ← front-end logic
│   ├── js/admin.js              ← admin dashboard logic
│   └── images/                  ← 10 premium resort photos
└── data/                        ← JSON database (auto-created)
    ├── bookings.json
    ├── contacts.json
    ├── subscribers.json
    └── reviews.json
```

---

## 💼 Sales pitch to present to the resort

> *"I noticed your old domain kivuliresort.com is currently down, and there's no
> modern website taking bookings or showcasing Kivuli Resort online — yet you
> have a strong 4.1-star reputation and a fantastic 24-hour offering in Kanduyi.
> I've built a complete, premium website for you with online booking, a
> menu, photo gallery, Google Maps, a WhatsApp booking button, and a private
> admin dashboard where you can see and confirm customer reservations from your
> phone. The site works on every device, will drive you direct bookings without
> going through third-party agents, and gives your brand the professional online
> presence a resort of your calibre deserves."*

### Upsell opportunities you can offer the client later
1. Custom domain purchase + hosting setup (`kivuliresort.co.ke` / `.com`)
2. Professional photo shoot of their actual venue (replace AI placeholders)
3. Integrated M-Pesa / credit-card payments for online deposits
4. SMS booking confirmations (Africa's Talking / Twilio)
5. SEO for "Bungoma restaurants / hotels / accommodation" keywords
6. Social media auto-posting for events (karaoke, rhumba nights)
7. Kitchen-display / order-printing system (POS extension)
8. Monthly maintenance retainer
