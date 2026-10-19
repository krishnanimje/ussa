import type { APIRoute } from 'astro';
import { createLogoutCookie } from '../../lib/auth';

export const prerender = false;

export const ALL: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': createLogoutCookie()
    }
  });
};
