# Deployment & Production Guide — Brandon Urzua Luxury Real Estate

This platform is 100% production-ready. The frontend is pre-compiled via Vite 8 and React 19, and the backend is bundled into high-performance ESM via `esbuild`.

---

## ⚡ Quick Start (Local Production Test)

```bash
# 1. Install dependencies
npm install

# 2. Build both Client & Server
npm run build

# 3. Launch Production Server
npm start
```
The server will start at `http://localhost:3000` (or the port specified in `PORT`).
Health check status is available at: `http://localhost:3000/healthz`.

---

## ☁️ Deployment Options

### 1. Render.com (Recommended — 1-Click / Free Tier)

1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following settings (or Render will automatically detect [`render.yaml`](./render.yaml)):
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/healthz`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `ADMIN_EMAIL`: `admin@brandonurzua.com`
   - `ADMIN_PASSWORD`: `brandon2026` (or your chosen secure password)
   - `ADMIN_JWT_SECRET`: `any-long-random-secret-key-2026`
   - `GEMINI_API_KEY`: *(Optional) your Google Gemini AI key*
6. Click **Deploy Web Service**. Your live URL will be ready in under 2 minutes!

---

### 2. Railway.app (Automatic Blueprint)

1. Go to [Railway.app](https://railway.app/) and create a new project.
2. Select **Deploy from GitHub repo**.
3. Railway automatically detects [`railway.json`](./railway.json) and [`Procfile`](./Procfile).
4. Add the environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, etc.) in the Railway Variables tab.
5. Deployment will complete automatically.

---

### 3. Docker Container (Any Cloud / AWS / GCP / DigitalOcean)

A multi-stage, secure Alpine Linux `Dockerfile` is included.

```bash
# Build Docker image
docker build -t brandon-real-estate:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --name brandon-estates \
  -e NODE_ENV=production \
  -e ADMIN_EMAIL=admin@brandonurzua.com \
  -e ADMIN_PASSWORD=brandon2026 \
  -e ADMIN_JWT_SECRET=super-secret-salt-key \
  brandon-real-estate:latest
```

---

### 4. VPS / Ubuntu Linux (Nginx + PM2)

If deploying to an Ubuntu/Debian server (DigitalOcean Droplet, AWS EC2, Linode, etc.):

```bash
# 1. Clone repository & install dependencies
git clone <your-repo-url> /var/www/real-estate
cd /var/www/real-estate/ussa2-main
npm install

# 2. Build for production
npm run build

# 3. Start with PM2 (automatic restart on crash or reboot)
npm install -g pm2
pm2 start dist-server/server.js --name "brandon-estates" --env production
pm2 save
pm2 startup
```

#### Sample Nginx Reverse Proxy Config (`/etc/nginx/sites-available/default`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Environment Variables Reference

| Variable | Required | Default | Purpose |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | Yes | `production` | Enables production mode and static caching |
| `PORT` | No | `3000` | Port for the HTTP server to listen on |
| `ADMIN_EMAIL` | Yes | `admin@brandonurzua.com` | Email login for the Admin CMS panel |
| `ADMIN_PASSWORD` | Yes | `brandon2026` | Password for Admin CMS panel |
| `ADMIN_JWT_SECRET`| Yes | `brandon-urzua-luxury...` | Secret key for signing secure auth cookies |
| `SUPABASE_URL` | Yes | `https://oqoqgdlagroxwzoibgnf.supabase.co` | Supabase Project URL for Database & Storage CDN |
| `SUPABASE_ANON_KEY` | Yes | `eyJhbGci...` | Supabase Public Anonymous API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJhbGci...` | Supabase Service Role Key for Backend Admin Operations |
| `SUPABASE_STORAGE_BUCKET` | No | `property-media` | Public Storage Bucket name for property photography CDN |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for AI Concierge Advisor |
| `NOTIFICATION_EMAIL`| No | `brandon@brandonurzua.com` | Email destination for showing inquiries |

---

## 🗄️ Supabase Cloud Database & Storage Setup

1. **Storage Bucket (Automatic):**
   - The public storage bucket `property-media` is already created and verified.
   - All estate photos uploaded through the Admin Panel (`/admin`) will automatically upload to Supabase's high-speed global CDN (`https://oqoqgdlagroxwzoibgnf.supabase.co/storage/v1/object/public/property-media/...`).

2. **Database Tables Setup (1-Click SQL):**
   - Go to your Supabase project SQL Editor: [Supabase SQL Editor](https://supabase.com/dashboard/project/oqoqgdlagroxwzoibgnf/sql/new)
   - Copy the entire SQL content from [`supabase-schema.sql`](./supabase-schema.sql).
   - Paste it and click **"Run"**.
   - Then run in terminal:
     ```bash
     npm run supabase:sync
     ```
   - All 6 luxury estates, articles, and agent profiles will be automatically seeded into your Supabase PostgreSQL database!

---

## 🛡️ Admin Portal Quick Access

- **URL:** `https://your-domain.com/admin` (or click **"Admin"** in header or footer)
- **Default Email:** `admin@brandonurzua.com`
- **Default Password:** `brandon2026`
- **Features in Admin Panel:**
  - **Estates & Properties Tab (Tab 3):** Edit Property Image (with upload & live preview), Name (title), Price ($ USD), Location (Address, Neighborhood, City, State, Zip), Specifications (Beds, Baths, SqFt), and Status.
  - **Inquiries & Showings Tab (Tab 2):** View and manage private viewing requests and client tour bookings.
  - **Journal / Articles Tab (Tab 5):** Publish market intelligence dispatches.
  - **Agent Profile Tab (Tab 6):** Update biography, contact info, photo, and license details.
