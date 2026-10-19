import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
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
