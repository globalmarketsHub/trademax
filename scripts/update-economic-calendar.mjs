import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const apiKey = process.env.TRADING_ECONOMICS_API_KEY || 'guest:guest';
const countries = [
  'united states',
  'china',
  'euro area',
  'united kingdom',
  'japan',
  'australia',
  'canada',
  'germany',
  'france',
  'italy',
  'spain',
  'switzerland',
  'new zealand'
];
const countryCodes = {
  'United States': 'US',
  China: 'CN',
  'Euro Area': 'EU',
  'United Kingdom': 'UK',
  Japan: 'JP',
  Australia: 'AU',
  Canada: 'CA',
  Germany: 'DE',
  France: 'FR',
  Italy: 'IT',
  Spain: 'ES',
  Switzerland: 'CH',
  'New Zealand': 'NZ'
};
const flags = {
  US: 'US',
  CN: 'CN',
  EU: 'EU',
  UK: 'UK',
  JP: 'JP',
  AU: 'AU',
  CA: 'CA',
  DE: 'DE',
  FR: 'FR',
  IT: 'IT',
  ES: 'ES',
  CH: 'CH',
  NZ: 'NZ'
};

function isoDate(offset) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function typeFromCategory(category = '', eventName = '') {
  const text = `${category} ${eventName}`.toLowerCase();
  if (/cpi|inflation|ppi|price|prices|deflator|pce/.test(text)) return '通胀';
  if (/job|employment|unemployment|payroll|wage|claims|labor|labour/.test(text)) return '就业';
  if (/fed|ecb|boe|boj|rba|rate|interest|central bank|fomc|minutes|speech/.test(text)) return '央行';
  if (/retail|consumer|confidence|spending|sales/.test(text)) return '消费';
  if (/oil|gas|crude|inventory|inventories|energy/.test(text)) return '能源';
  if (/trade|export|import|current account/.test(text)) return '贸易';
  if (/bond|bill|auction|treasury/.test(text)) return '债券';
  return '增长';
}

function impactFromImportance(value) {
  const num = Number(value);
  if (num >= 3) return 'high';
  if (num === 2) return 'medium';
  return 'low';
}

function clean(value) {
  return value === null || value === undefined || value === '' ? '--' : String(value);
}

function timeText(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return '--:--';
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}

function toCalendarEvent(item) {
  const code = countryCodes[item.Country] || (item.Currency || item.Country || 'GLB').slice(0, 3).toUpperCase();
  return {
    date: item.Date,
    t: timeText(item.Date),
    c: code,
    flag: flags[code] || code,
    type: typeFromCategory(item.Category, item.Event),
    i: impactFromImportance(item.Importance),
    n: clean(item.Event || item.Category),
    desc: clean([item.Category, item.Reference].filter(Boolean).join(' · ')),
    actual: clean(item.Actual),
    forecast: clean(item.Forecast || item.TEForecast),
    previous: clean(item.Previous),
    source: clean(item.Source),
    sourceUrl: clean(item.SourceURL)
  };
}

async function readExisting() {
  const file = path.join('data', 'economic-calendar-live.json');
  if (!existsSync(file)) return [];
  const content = await readFile(file, 'utf8');
  return JSON.parse(content).events || [];
}

async function main() {
  const start = isoDate(0);
  const end = isoDate(6);
  const countryQuery = countries.join(',');
  const endpoint = encodeURI(`https://api.tradingeconomics.com/calendar/country/${countryQuery}/${start}/${end}?c=${apiKey}&f=json`);
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Trading Economics API returned ${response.status}`);
  }

  const raw = await response.json();
  if (!Array.isArray(raw) || !raw.length) {
    throw new Error('Trading Economics API returned no events');
  }

  const events = raw
    .map(toCalendarEvent)
    .filter((event) => event.date && event.n !== '--')
    .sort((a, b) => new Date(a.date) - new Date(b.date) || a.t.localeCompare(b.t));

  await mkdir('data', { recursive: true });
  await writeFile(
    path.join('data', 'economic-calendar-live.json'),
    `${JSON.stringify({
      source: 'Trading Economics Calendar API',
      sourceUrl: 'https://docs.tradingeconomics.com/economic_calendar/country/',
      generatedAt: new Date().toISOString(),
      timezone: 'Australia/Sydney',
      range: { start, end },
      events
    }, null, 2)}\n`,
    'utf8'
  );

  console.log(`Saved ${events.length} economic calendar events from Trading Economics.`);
}

main().catch(async (error) => {
  console.error(error);
  const existing = await readExisting();
  if (existing.length) {
    console.log(`Keeping existing economic calendar cache with ${existing.length} events.`);
    return;
  }
  process.exitCode = 1;
});
