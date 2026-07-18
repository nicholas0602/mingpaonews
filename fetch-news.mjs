import { writeFile } from 'node:fs/promises';

const RSS_URL = 'https://news.mingpao.com/rss/pns/s00001.xml';

function clean(s) {
  return (s || '')
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return clean(m ? m[1] : '');
}

console.log('Fetching RSS:', RSS_URL);

const res = await fetch(RSS_URL, {
  headers: { 'user-agent': 'Mozilla/5.0' }
});

console.log('Status:', res.status, res.statusText);

if (!res.ok) {
  const txt = await res.text().catch(() => '');
  console.log('Upstream body:', txt.slice(0, 500));
  throw new Error(`RSS fetch failed: ${res.status}`);
}

const xml = await res.text();
console.log('XML length:', xml.length);
console.log('XML head:', xml.slice(0, 300));

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 2).map(m => m[1]);
console.log('Items found:', items.length);

const data = {
  title1: getTag(items[0] || '', 'title') || '未有新聞',
  title2: getTag(items[1] || '', 'title'),
  updatedAt: new Date().toLocaleString('zh-HK', { hour12: false })
};

console.log('Data:', data);

await writeFile('news.json', JSON.stringify(data, null, 2), 'utf8');
console.log('news.json written');
