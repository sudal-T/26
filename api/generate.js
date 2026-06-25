export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'API 키가 설정되지 않았습니다.' } });
  }

  try {
    // body를 안전하게 문자열로 변환
    let bodyStr;
    if (typeof req.body === 'string') {
      bodyStr = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      bodyStr = req.body.toString('utf-8');
    } else {
      bodyStr = JSON.stringify(req.body);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: bodyStr,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: { message: '응답 파싱 오류: ' + text.slice(0, 200) } });
    }

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}
