import type { APIRoute } from 'astro';
import { isSupabaseConfigured, getSupabase } from '../../lib/supabase';
import { getProperties } from '../../lib/store';

export const prerender = false;

export const GET: APIRoute = async () => {
  const startTime = Date.now();
  let dbStatus = 'local_fallback';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    if (isSupabaseConfigured) {
      const client = getSupabase();
      if (client) {
        const { error } = await client.from('properties').select('id').limit(1);
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = error ? `degraded: ${error.message}` : 'healthy';
      }
    } else {
      // Local in-memory store test
      await getProperties();
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'healthy_in_memory';
    }
  } catch (err: any) {
    dbStatus = `error: ${err.message || 'unknown'}`;
  }

  const payload = {
    status: dbStatus.startsWith('error') ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    service: 'edgar-valle-real-estate',
    version: '1.0.0',
    totalResponseTimeMs: Date.now() - startTime,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: isSupabaseConfigured ? 'supabase_postgresql' : 'in_memory_catalog'
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: payload.status === 'healthy' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
};
