export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Notion-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const notionPath = req.url.replace('/api/notion', '');
  const notionUrl = 'https://api.notion.com' + notionPath;

  const response = await fetch(notionUrl, {
    method: req.method,
    headers: {
      'Authorization': req.headers.authorization,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
