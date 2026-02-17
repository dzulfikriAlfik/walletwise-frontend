# WalletWise Frontend — Build on Ubuntu Server (VPS)

Complete guide for building and deploying WalletWise frontend on Ubuntu server with PM2 and Nginx. Domain: **walletwise.pintarware.com**.

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Install Node.js](#2-install-nodejs)
3. [Install Nginx](#3-install-nginx)
4. [Clone & Setup Project](#4-clone--setup-project)
5. [Environment Configuration](#5-environment-configuration)
6. [Build Project](#6-build-project)
7. [Production: PM2 & Nginx](#7-production-pm2--nginx)
8. [SSL (Let's Encrypt)](#8-ssl-lets-encrypt)
9. [Update/Redeploy](#9-updateredeploy)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. System Requirements

| Requirement | Version |
|-------------|---------|
| Ubuntu | 20.04 LTS or 22.04 LTS |
| Node.js | 20.x or 22.x |
| Git | 2.x |
| Memory | Min. 256MB RAM |
| Backend | Ensure backend is running at `walletwise-backend.pintarware.com` |

---

## 2. Install Node.js

### Option A: NodeSource (recommended)

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

node -v   # v22.x.x
npm -v
```

### Option B: NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

---

## 3. Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Important:** After installing, Nginx serves a default "Welcome to nginx!" page. We will replace this by creating our site config and disabling the default site in [Step 7](#7-production-pm2--nginx).

---

## 4. Clone & Setup Project

```bash
# Create directory (use domain as folder name)
sudo mkdir -p /var/www/walletwise.pintarware.com
sudo chown $USER:$USER /var/www/walletwise.pintarware.com
cd /var/www/walletwise.pintarware.com

# Clone repository
git clone https://github.com/dzulfikriAlfik/walletwise-frontend.git .

# Install dependencies (includes devDependencies for build)
npm install
```

---

## 5. Environment Configuration

Create `.env.production` for production build. These values are baked into the bundle during `npm run build`.

```bash
cp .env.production.example .env.production
nano .env.production
```

Example `.env.production`:

```env
# Backend API - adjust to your production backend URL
VITE_API_BASE_URL=https://walletwise-backend.pintarware.com/api

# API request timeout (optional)
VITE_API_TIMEOUT=30000
```

> **Important:** Ensure the backend (`walletwise-backend.pintarware.com`) has CORS configured to allow `https://walletwise.pintarware.com`.

---

## 6. Build Project

```bash
cd /var/www/walletwise.pintarware.com

# Build production
npm run build
```

Build output will be in the `dist/` folder. Verify:

```bash
ls -la dist/
# Should contain: index.html, assets/
```

---

## 7. Production: PM2 & Nginx

### 7.1 Install PM2

```bash
sudo npm install -g pm2
```

### 7.2 Start the app with PM2

**Option A: Using ecosystem.config.js (recommended)**

The project includes `ecosystem.config.js` and `serve` as a local dependency. Run from project root:

```bash
cd /var/www/walletwise.pintarware.com

pm2 start ecosystem.config.js

# Save process list
pm2 save

# Auto-start on server reboot
pm2 startup
```

**Option B: Using global serve**

If you prefer the global `serve` package, PM2 needs the full path (it does not resolve global npm packages):

```bash
sudo npm install -g serve
cd /var/www/walletwise.pintarware.com
pm2 start $(which serve) --name walletwise-frontend -- -s dist -l 3001
pm2 save
pm2 startup
```

Test locally:

```bash
curl http://localhost:3001
# Should return HTML, not an error
```

### 7.3 Create Nginx site config

```bash
sudo nano /etc/nginx/sites-available/walletwise.pintarware.com
```

Paste this config:

```nginx
server {
    listen 80;
    server_name walletwise.pintarware.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 7.4 Enable site and disable default site

**Why you see "Welcome to nginx!":** Nginx has a default site enabled that catches all requests. You must disable it and enable your site.

```bash
# Enable our site
sudo ln -s /etc/nginx/sites-available/walletwise.pintarware.com /etc/nginx/sites-enabled/

# Disable the default site (this removes the "Welcome to nginx!" page)
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7.5 DNS

Ensure DNS for `walletwise.pintarware.com` points to your VPS IP:

| Type | Name | Value |
|------|------|-------|
| A | walletwise.pintarware.com | YOUR_VPS_IP |

After DNS propagates, open `http://walletwise.pintarware.com` — you should see the WalletWise app, not the default Nginx page.

---

## 8. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d walletwise.pintarware.com
```

Follow the on-screen prompts. Certbot will automatically update the Nginx config for HTTPS.

---

## 9. Update/Redeploy

Whenever there are code changes:

```bash
cd /var/www/walletwise.pintarware.com

git pull
npm install
npm run build
pm2 restart walletwise-frontend
```

---

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| `File ecosystem.config.js not found` | Run from project root: `cd /var/www/walletwise.pintarware.com` then `pm2 start ecosystem.config.js`. Ensure `npm install` was run (adds `serve` dep). |
| `Script not found: .../serve` | Run `npm install` to install local `serve`. Or use: `pm2 start $(which serve) --name walletwise-frontend -- -s dist -l 3001` with global serve. |
| Still see "Welcome to nginx!" | Disable default site: `sudo rm -f /etc/nginx/sites-enabled/default` then `sudo systemctl reload nginx`. Ensure your site is enabled: `ls -la /etc/nginx/sites-enabled/` |
| `403 Forbidden` | Check ownership: `sudo chown -R $USER:$USER /var/www/walletwise.pintarware.com` |
| `502 Bad Gateway` | Ensure PM2 is running: `pm2 status`, check port 3001: `curl http://localhost:3001` |
| Blank page / 404 on SPA routes | Ensure `serve` uses `-s` flag (SPA mode) |
| CORS error from backend | Add `https://walletwise.pintarware.com` to backend `CORS_ORIGIN` |
| Wrong `VITE_API_BASE_URL` | Rebuild: update `.env.production`, then `npm run build` and `pm2 restart` |
| Port 3001 already in use | Change port in PM2 and Nginx (e.g. 3002) |

---

## Quick Reference — Full Sequence

```bash
# 1. Node.js & Nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx

# 2. Clone & build
sudo mkdir -p /var/www/walletwise.pintarware.com
sudo chown $USER:$USER /var/www/walletwise.pintarware.com
cd /var/www/walletwise.pintarware.com
git clone https://github.com/dzulfikriAlfik/walletwise-frontend.git .
npm install
cp .env.production.example .env.production
nano .env.production   # Set VITE_API_BASE_URL
npm run build

# 3. PM2
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 4. Nginx
sudo nano /etc/nginx/sites-available/walletwise.pintarware.com
# (paste server config from Step 7.3)
sudo ln -s /etc/nginx/sites-available/walletwise.pintarware.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 5. SSL
sudo certbot --nginx -d walletwise.pintarware.com
```
