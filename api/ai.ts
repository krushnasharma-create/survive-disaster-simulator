// api/ai.ts
// Vercel Serverless Function entry point for the Secure AI Gateway.
// Receives sanitized simulation context from the browser, isolates provider credentials,
// and enforces the Safety Architecture Firewall before returning output.

import { handleGatewayRequest } from '../src/ai/gateway/gatewayCore.js';

/**
 * Web Standard POST handler (Vercel Edge & Node.js 18+ Serverless).
 */
export async function POST(request: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  try {
    const rawBody = await request.json();
    const result = await handleGatewayRequest(rawBody, process.env);

    return new Response(JSON.stringify(result.body), {
      status: result.statusCode,
      headers,
    });
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Invalid gateway request',
        deterministicFallbackUsed: true,
      }),
      { status: 400, headers }
    );
  }
}

/**
 * Web Standard GET handler for gateway health & status checks.
 */
export async function GET(): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  const result = await handleGatewayRequest({ action: 'status' }, process.env);
  return new Response(JSON.stringify(result.body), {
    status: result.statusCode,
    headers,
  });
}

/**
 * Node.js / Express style handler fallback for traditional Vercel serverless runtime.
 */
export default async function handler(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    if (req.method === 'GET') {
      const result = await handleGatewayRequest({ action: 'status' }, process.env);
      res.status(result.statusCode).json(result.body);
      return;
    }

    if (req.method === 'POST') {
      const rawBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const result = await handleGatewayRequest(rawBody, process.env);
      res.status(result.statusCode).json(result.body);
      return;
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: unknown) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Invalid request',
      deterministicFallbackUsed: true,
    });
  }
}
