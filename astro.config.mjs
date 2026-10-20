import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// Automatically detect Vercel environment or default to standalone Node.js adapter
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isVercel ? vercel() : node({ mode: 'standalone' }),
  site: 'https://edgarvalle.com',
  server: {
    port: 4321,
    host: true
  },
  redirects: {
    '/listings': '/properties',
    '/military': '/va-loans',
    '/veterans': '/va-loans',
    '/fthb': '/first-time-homebuyer',
    '/flipping': '/fix-and-flip',
    '/investing': '/fix-and-flip',
    '/es/propiedades': '/properties',
    '/es/casas': '/properties'
  }
});
