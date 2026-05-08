export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Notion-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const notionPath = req.url.replace('/api/notion', '');
  const notionUrl = 'https://api.notion.com' + notionPath;

  const fetchOptions = {
    method: req.method,
    headers: {
      'Authorization': req.headers['authorization'],
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  };

  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const notionResp = await fetch(notionUrl, fetchOptions);
    const data = await notionResp.json();
    return res.status(notionResp.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
