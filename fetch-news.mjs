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

const res = await fetch(RSS_URL, {
  headers: { 'user-agent': 'Mozilla/5.0' }
});

if (!res.ok) {
  throw new Error(`RSS fetch failed: ${res.status}`);
}

const xml = await res.text();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 2).map(m => m[1]);

const data = {
  title1: getTag(items[0] || '', 'title'),
  title2: getTag(items[1] || '', 'title'),
  updatedAt: new Date().toLocaleString('zh-HK', { hour12: false })
};

await writeFile('news.json', JSON.stringify(data, null, 2), 'utf8');
