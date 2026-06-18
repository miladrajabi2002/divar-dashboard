// PM2 process config for production. Start with:  pm2 start ecosystem.config.js
// (package.json has no "type":"module", so this file is treated as CommonJS.)
module.exports = {
  apps: [
    {
      name: "divar-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
