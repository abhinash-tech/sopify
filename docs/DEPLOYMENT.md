# Complete Deployment Guide (No Custom Domain Required)

This guide provides step-by-step instructions to deploy **SOPify** to the cloud or a virtual server with **zero domain purchases or DNS configurations required**.

---

## 1. Architectural Analysis for No-Domain Deployment

A typical full-stack web application often separates frontend and backend across different ports and domains, which introduces CORS issues and DNS requirements.

To eliminate the need for a custom domain, **SOPify is architected for Unified Single-Port Serving**:
1. **Frontend Production Build**: `npm run build` compiles all React JSX, CSS, and assets into static files inside the `dist/` directory.
2. **Backend Static Mount**: FastAPI's `app.main:app` automatically detects the `dist/` directory and mounts it directly at the root (`/`), while serving API endpoints under `/api/*`.
3. **Single Port Execution**: Everything runs on a single port (e.g. `8000` or `$PORT` assigned by cloud providers).
4. **Zero CORS & Zero Domain Requirement**:
   - Cloud providers automatically provide free, secure **HTTPS URLs** (e.g. `https://sopify.onrender.com` or `https://sopify.up.railway.app`).
   - Alternatively, a Linux VPS (AWS EC2 / DigitalOcean) serves the complete app directly on its **Public IPv4 address** (e.g. `http://198.51.100.45:8000` or standard port `80`).

---

## 2. Deployment Option 1: Render.com (Recommended — 100% Free Cloud URL)

[Render](https://render.com) offers free web service hosting and automatically provisions a free `https://<your-service-name>.onrender.com` URL with SSL included.

### Step 1: Push Repository to GitHub
If your project is not yet in GitHub:
```bash
git init
git add .
git commit -m "Complete SOPify implementation"
git branch -M main
git remote add origin https://github.com/<your-username>/sopify.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select your `sopify` repository.
4. Configure the settings:
   - **Name**: `sopify-app` *(or any unique name)*
   - **Region**: Choose the closest region (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `sopify-react`
   - **Environment**: `Python`
   - **Build Command**:
     ```bash
     npm install && npm run build && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: `Free`

### Step 3: Configure Environment Variables
Scroll to **Environment Variables** and add:
- `PYTHONPATH`: `backend`
- `GEMINI_API_KEY`: *(paste your Google Gemini API key)*
- `GEMINI_MODEL`: `gemini-3.8-flash`
- `DATABASE_URL`: `sqlite:///./data/sopify.db`

### Step 4: Deploy
Click **Create Web Service**.  
In ~2–3 minutes, Render will build the frontend, install backend requirements, and start Uvicorn.  
Your public live URL will appear at the top:  
👉 `https://sopify-app.onrender.com` *(No domain required!)*

---

## 3. Deployment Option 2: Railway.app (1-Click Docker)

[Railway](https://railway.app) automatically detects the included `Dockerfile` and assigns a free `https://*.up.railway.app` URL.

### Step 1: Push to GitHub & Connect to Railway
1. Log in to [railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.

### Step 2: Configure Environment Variables
Click on the service → **Variables**:
- `GEMINI_API_KEY`: *(your Gemini key)*
- `GEMINI_MODEL`: `gemini-3.8-flash`
- `PORT`: `8000`

### Step 3: Generate Free Public Domain
1. In the project canvas, click on your service.
2. Go to **Settings** → **Networking** → **Public Networking**.
3. Click **Generate Domain**.
4. Railway instantly gives you a live public HTTPS address:  
👉 `https://sopify-production.up.railway.app`

---

## 4. Deployment Option 3: VPS / Cloud VM on Public IP (AWS EC2 / DigitalOcean / Linode)

If you have a Linux server (Ubuntu 22.04 / 24.04), you can access SOPify directly using the server's **Public IP address** without any domain.

### Step 1: Connect to your Server
```bash
ssh ubuntu@<YOUR_SERVER_PUBLIC_IP>
```

### Step 2: Install Node.js, Python, and Git
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Clone Project & Build
```bash
git clone https://github.com/<your-username>/sopify.git
cd sopify/sopify-react

# 1. Build the Frontend
npm install
npm run build

# 2. Setup the Python Virtual Environment
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Create .env configuration
cp .env.example .env
nano .env   # Enter your GEMINI_API_KEY and save (Ctrl+O, Enter, Ctrl+X)
```

### Step 4: Run as a Background Service (Systemd)
Create a persistent system service so SOPify runs 24/7 and restarts if the server reboots:

```bash
sudo nano /etc/systemd/system/sopify.service
```

Paste the following configuration:
```ini
[Unit]
Description=SOPify Application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/sopify/sopify-react/backend
Environment="PYTHONPATH=backend"
EnvironmentFile=/home/ubuntu/sopify/sopify-react/backend/.env
ExecStart=/home/ubuntu/sopify/sopify-react/backend/.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sopify
sudo systemctl start sopify
```

Check status:
```bash
sudo systemctl status sopify
```

### Step 5: Configure Firewall / Security Group
Ensure port `8000` (or port `80` if forwarded) is open in your cloud firewall (e.g. AWS Security Group Inbound Rule: Custom TCP, Port 8000, Source `0.0.0.0/0`).

Open in your browser:  
👉 `http://<YOUR_SERVER_PUBLIC_IP>:8000`

---

## 5. Deployment Option 4: Single Docker Command

Using the included multi-stage `Dockerfile`:

### Build Container
```bash
docker build -t sopify:latest .
```

### Run Container
```bash
docker run -d \
  -p 8000:8000 \
  -e GEMINI_API_KEY="your_api_key_here" \
  -e GEMINI_MODEL="gemini-3.8-flash" \
  --name sopify_app \
  sopify:latest
```

Access at `http://localhost:8000` (or `http://<SERVER_IP>:8000`).

---

## 6. Pre-Deployment Verification Checklist

Before pushing to production, verify the following:
- [x] `npm run build` succeeds locally without errors.
- [x] Backend `pytest` suite passes with 100% green tests.
- [x] `backend/data/` directory exists for SQLite database persistence.
- [x] `GEMINI_API_KEY` is provided as an environment variable (not hardcoded in files).
- [x] Fallback mode verified: app continues to function seamlessly if API key runs out of quota.
