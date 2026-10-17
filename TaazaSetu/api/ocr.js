// Vercel serverless function: reads an expiry date from a package photo.
// Set ANTHROPIC_API_KEY or GEMINI_API_KEY in Vercel -> Settings -> Environment Variables.
// Without a key it returns 501 and the app falls back to on-device OCR.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { image, mimeType = 'image/jpeg' } = req.body || {};
  if (!image) return res.status(400).json({ error: 'image (base64) required' });

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Read the expiry / best-before / use-by date printed on this food package. Today is ${today}. ` +
    'If both manufacturing and expiry dates appear, return the expiry. Reply with only the date as YYYY-MM-DD, or NONE if unreadable.';

  try {
    let text = '';
    if (process.env.ANTHROPIC_API_KEY) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5', max_tokens: 30,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            { type: 'text', text: prompt }] }]
        })
      });
      text = (await r.json()).content?.[0]?.text || '';
    } else if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: image } }, { text: prompt }] }] })
      });
      text = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      return res.status(501).json({ error: 'No OCR API key configured' });
    }
    const m = text.trim().match(/\d{4}-\d{2}-\d{2}/);
    return res.status(200).json({ date: m ? m[0] : null, raw: text.trim().slice(0, 40) });
  } catch (e) {
    return res.status(502).json({ error: 'OCR provider failed' });
  }
}
