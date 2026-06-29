/**
 * api/generate.js — Vercel Serverless Function
 *
 * 역할: OpenRouter API 프록시 (API 키 서버에서 보호)
 *
 * 환경변수 (Vercel 대시보드 → Settings → Environment Variables)
 *  OPENROUTER_API_KEY : OpenRouter API 키
 */

export default async function handler(req, res) {
  /* ── ✅ CORS 수정: * 대신 자신의 도메인만 허용 ── */
  const allowedOrigins = [
    'https://26-indol-two.vercel.app'
  ];

  const origin = req.headers.origin || '';
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : 'https://26-indol-two.vercel.app';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Access-Code');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  /* ── 인증 확인 전용 요청 ── */
  const body = req.body;
  if (body && body._auth_check) {
    return res.status(200).json({ ok: true });
  }

  /* ── OpenRouter API 호출 ── */
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://26-indol-two.vercel.app',
        'X-Title': '학생부 작성 도우미'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
