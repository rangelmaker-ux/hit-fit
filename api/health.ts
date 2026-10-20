import type { IncomingMessage, ServerResponse } from 'http';
import { isCloudConfigured } from '../lib/cloud-store';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'hit-fit-api',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      cloudConnected: isCloudConfigured(),
      authType: 'pbkdf2_hmac_sha256'
    })
  );
}
