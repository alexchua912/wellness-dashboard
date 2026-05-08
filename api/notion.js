export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Notion-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path || '';
  const notionUrl = 'https://api.notion.com/v1/' + path;

  // 拿 authorization header（headers 都是小寫的）
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  
  console.log('[Proxy] →', req.method, notionUrl);
  console.log('[Proxy] Auth present:', !!auth);

  if (!auth) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const fetchOptions = {
    method: req.method,
    headers: {
      'Authorization': auth,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  };

  if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.body) {
    fetchOptions.body = typeof req.body === 'string' 
      ? req.body 
      : JSON.stringify(req.body);
  }

  try {
    const notionResp = await fetch(notionUrl, fetchOptions);
    const data = await notionResp.json();
    console.log('[Proxy] ←', notionResp.status);
    return res.status(notionResp.status).json(data);
  } catch (err) {
    console.error('[Proxy] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
