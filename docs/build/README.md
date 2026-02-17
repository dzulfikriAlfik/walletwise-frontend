# Build Documentation

Build and deploy documentation for WalletWise frontend.

## Documents

| File | Description |
|------|-------------|
| [ubuntu-build-guide.md](./ubuntu-build-guide.md) | Complete build guide for Ubuntu Server (VPS) with PM2 & Nginx |

## Quick Summary

```bash
# Prerequisites: Node.js 20+ or 22+, domain: walletwise.pintarware.com
npm install
cp .env.production.example .env.production   # Edit VITE_API_BASE_URL
npm run build
pm2 start ecosystem.config.cjs
# Nginx: walletwise.pintarware.com → proxy to port 3001
# Disable default site: sudo rm -f /etc/nginx/sites-enabled/default
```
