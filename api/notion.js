export default async function handler(req, res) {
  // CORS 設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Notion-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path || '';
  const notionUrl = 'https://api.notion.com/v1/' + path;

  // 🔥 關鍵修改：不再從 req.headers 抓取，而是直接讀取 Vercel 系統的環境變數
  const token = process.env.NOTION_TOKEN;
  
  if (!token) {
    console.error('[Proxy] Error: NOTION_TOKEN is not set in Vercel environment variables.');
    return res.status(500).json({ error: 'Server configuration error: Missing Token' });
  }

  const auth = `Bearer ${token}`;

  const fetchOptions = {
    method: req.method,
    headers: {
      'Authorization': auth,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
    },
  };

  if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.body) {
    fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    const notionResp = await fetch(notionUrl, fetchOptions);
    const data = await notionResp.json();
    
    // 如果 Notion 依然報錯，印出 log 方便除錯
    if (!notionResp.ok) {
      console.log('[Proxy] Notion API Error:', notionResp.status, data);
    }
    
    return res.status(notionResp.status).json(data);
  } catch (err) {
    console.error('[Proxy] Fetch Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
