# 🌐 Deploying Kivuli Resort to a FREE public domain

The easiest free path is **Render.com** (free tier, gives you an `*.onrender.com` URL
with HTTPS). Then you can optionally connect a real domain (.co.ke) later.

> ⚠️ **Important:** Free tiers of Render / Vercel / Railway **sleep after 15 minutes of
> inactivity** and lose their disk storage on every restart. That means bookings and
> messages stored in the JSON files will NOT persist between restarts. For sales demos
> this is fine. When the client pays, upgrade to a paid plan (~$5/month) and add a real
> database (MongoDB Atlas free tier is enough) — see notes at bottom.

---

## 🚀 Option A — Render.com (RECOMMENDED, easiest for Node.js)

### Step 1: Push the code to GitHub
1. Go to https://github.com and sign up / sign in (free).
2. Click **"+" → "New repository"**. Name it `kivuli-resort`. Leave it **Public**.
3. Open a terminal on your computer (or in this workspace) and run:
   ```bash
   cd /home/user/kivuli-resort
   git init
   git add .
   git config user.email "you@example.com"
   git config user.name "Your Name"
   git commit -m "Initial launch - Kivuli Resort website"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/kivuli-resort.git
   git push -u origin main
   ```
   *(Upload the project folder from your workspace to your machine first, or use the
   GitHub web upload — drag the entire kivuli-resort folder in.)*

### Step 2: Deploy on Render
1. Go to https://render.com/ and sign up with your GitHub account (free).
2. Click **"New +" → "Web Service"**.
3. Authorize Render to access your GitHub, then pick the `kivuli-resort` repo.
4. Fill in the form:
   - **Name:** `kivuli-resort` (your URL will be `kivuli-resort.onrender.com`)
   - **Region:** `Frankfurt (EU)` (closest to Kenya) or `Oregon`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free** ($0)
5. Click **"Advanced" → "Add Environment Variable"** and set:
   | Key | Value |
   |---|---|
   | `ADMIN_USER` | `admin` |
   | `ADMIN_PASS` | choose-a-strong-password |
   | `ADMIN_KEY` | a-long-random-string-like-`kivuli-2026-xyz` |
6. Click **"Create Web Service"**.
7. Wait ~3 minutes while it builds. You'll get a public URL like:
   **`https://kivuli-resort.onrender.com`** 🎉
8. Test it:
   - Open the URL in your browser
   - Visit `/admin` and login with `admin` / the password you set
   - Submit a booking form and confirm it shows in the admin

---

## 🆓 Option B — Railway.app (another free option)

1. Go to https://railway.app/ and sign up with GitHub.
2. Click **"+ New Project" → "Deploy from GitHub repo"**, select `kivuli-resort`.
3. Add environment variables same as above.
4. After deployment, go to **Settings → Networking → Generate Domain** to get a free
   `*.up.railway.app` URL. Free tier gives you $5 credit/month — enough to run this.

---

## 🆓 Option C — Vercel (static frontend only — no backend persistence)
Vercel is great for static sites but doesn't support long-running Node servers easily.
Because our backend uses Express, stick with Render or Railway.

---

## 🆓 Option D — Glitch.com (super fast, fun demo)
1. Go to https://glitch.com/, click **"New Project" → "Import from GitHub"**.
2. Paste your GitHub repo URL.
3. It builds and gives you a `*.glitch.me` URL instantly. Good for quick demos.

---

## 📱 Option E — Run on your own computer (local demo)
If you just want to demo from your laptop for a meeting, it's already running here at
port 3000. Use `ngrok` to tunnel it to a public URL for 2 hours free:
```bash
# install ngrok from https://ngrok.com
cd kivuli-resort && npm start &
ngrok http 3000
# You'll get a public URL like https://xxxx-xx-xx-xx-xx.ngrok-free.app
```
Perfect for a live sales pitch when you walk into Kivuli Resort.

---

## 🇰🇪 Adding a real .co.ke domain (after the client pays)

Once Kivuli agrees to the website, buy a Kenyan domain:
- **Truehost Kenya** (truehost.co.ke): ~KES 1,000/year for `.co.ke`
- **Sasahost** (sasahost.co.ke): ~KES 1,200/year
- **Kenya Web Experts**

Recommended domain: **`kivuliresort.co.ke`** (matches their old domain and is easy to say).

Then in Render/Railway:
1. Go to your service → **Custom Domains**
2. Add `kivuliresort.co.ke` and `www.kivuliresort.co.ke`
3. Copy the CNAME record they give you
4. In your domain host DNS panel, add the CNAME record pointing to Render
5. HTTPS is auto-provisioned in 5 minutes

---

## 🔧 Upgrading for production (when the client pays)

The free JSON-storage works for demos but data resets when the server restarts. Before
going "live" with the client, upgrade:

1. **Database:** Create a **free MongoDB Atlas** cluster (512MB free). Replace the
   `data/*.json` logic with Mongoose models. I can add that in ~10 minutes.
2. **Email alerts:** Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `OWNER_EMAIL` env vars
   (use Gmail App Password or Sendgrid/Mailgun free tier) so booking requests email
   the owner directly.
3. **SMS alerts:** Add Africa's Talking or Twilio for SMS booking confirmations
   (~KES 1 per SMS to Kenyan numbers).
4. **M-Pesa:** Add Daraja API (Safaricom M-Pesa STK Push) so guests can pay a deposit
   when booking. Free to set up via Safaricom Developer Portal.
5. **Custom photos:** After signing the client, visit the venue for a 2-hour photo
   shoot (or ask them for photos) and swap all `public/images/*.jpg` with real photos.

---

## 🎯 What to say to the client when you walk in

> "I've already built and launched your website. Here, let me show you —"
> *[open `kivuli-resort.onrender.com` on your phone/laptop]*
> "It's live right now. Guests can book rooms, order food, see your menu, your photos,
> your Google reviews and contact you directly, all from their phone. The booking
> requests come to a private admin dashboard where you can confirm them.
> I'm offering this to you for KES XX,000 including hosting for the first year,
> M-Pesa integration, a professional photo shoot at your venue, and training your
> staff to use the dashboard."

---

## ⚡ Quick start commands summary

```bash
# Test locally
cd kivuli-resort
npm install
npm start            # http://localhost:3000
```

For now — the website is fully built, functional, and you can demo it right here on
port 3000 using the live preview in this app.
