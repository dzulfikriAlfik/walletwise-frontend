/**
 * PM2 ecosystem config for WalletWise frontend
 * Run: pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'walletwise-frontend',
      script: './node_modules/.bin/serve',
      args: ['-s', 'dist', '-l', '3001'],
      cwd: __dirname,
      env: { NODE_ENV: 'production' },
      max_memory_restart: '200M',
    },
  ],
}
