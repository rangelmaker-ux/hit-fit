export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const isCloudConfigured = Boolean(
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  );

  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'hit-fit-api',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      cloudConnected: isCloudConfigured,
      authType: 'pbkdf2_hmac_sha256',
      runtime: 'edge'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
