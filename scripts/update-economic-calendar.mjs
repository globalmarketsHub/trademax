import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const teApiKey = process.env.TRADING_ECONOMICS_API_KEY || 'guest:guest';
const fmpApiKey = process.env.FMP_API_KEY || 'demo';
const countries = ['united states','china','euro area','united kingdom','japan','australia','canada','germany','france','italy','spain','switzerland','new zealand'];
const countryCodes = {'United States':'US',China:'CN','Euro Area':'EU','United Kingdom':'UK',Japan:'JP',Australia:'AU',Canada:'CA',Germany:'DE',France:'FR',Italy:'IT',Spain:'ES',Switzerland:'CH','New Zealand':'NZ'};
const currencyCountries = {USD:'US',CNY:'CN',EUR:'EU',GBP:'UK',JPY:'JP',AUD:'AU',CAD:'CA',CHF:'CH',NZD:'NZ'};
const flags = {US:'US',CN:'CN',EU:'EU',UK:'UK',JP:'JP',AU:'AU',CA:'CA',DE:'DE',FR:'FR',IT:'IT',ES:'ES',CH:'CH',NZ:'NZ'};

function isoDate(offset) { const d = new Date(); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0, 10); }
function clean(value) { return value === null || value === undefined || value === '' ? '--' : String(value); }
function timeText(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return '--:--';
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
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
  const text = String(value || '').toLowerCase();
  if (text.includes('high')) return 'high';
  if (text.includes('medium')) return 'medium';
  const num = Number(value);
  if (num >= 3) return 'high';
  if (num === 2) return 'medium';
  return 'low';
}
function toTeEvent(item) {
  const code = countryCodes[item.Country] || (item.Currency || item.Country || 'GLB').slice(0, 3).toUpperCase();
  return {date:item.Date,t:timeText(item.Date),c:code,flag:flags[code]||code,type:typeFromCategory(item.Category,item.Event),i:impactFromImportance(item.Importance),n:clean(item.Event||item.Category),desc:clean([item.Category,item.Reference].filter(Boolean).join(' · ')),actual:clean(item.Actual),forecast:clean(item.Forecast||item.TEForecast),previous:clean(item.Previous),source:clean(item.Source),sourceUrl:clean(item.SourceURL)};
}
function toFmpEvent(item) {
  const currency = String(item.currency || item.Currency || '').toUpperCase();
  const country = clean(item.country || item.Country);
  const code = countryCodes[country] || currencyCountries[currency] || country.slice(0,3).toUpperCase();
  const name = item.event || item.Event || item.name || item.title;
  const category = item.category || item.Category || item.type || '';
  return {date:item.date||item.Date,t:timeText(item.date||item.Date),c:code,flag:flags[code]||code,type:typeFromCategory(category,name),i:impactFromImportance(item.impact||item.Importance||item.importance),n:clean(name),desc:clean([country,category].filter(Boolean).join(' · ')),actual:clean(item.actual||item.Actual),forecast:clean(item.estimate||item.forecast||item.Forecast||item.consensus),previous:clean(item.previous||item.Previous),source:'Financial Modeling Prep',sourceUrl:'https://financialmodelingprep.com/stable/economic-calendar'};
}
async function readExisting() {
  const file = path.join('data', 'economic-calendar-live.json');
  if (!existsSync(file)) return [];
  const content = await readFile(file, 'utf8');
  return JSON.parse(content).events || [];
}
async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) throw new Error(`empty response ${url}`);
  return data;
}
async function fetchTradingEconomics(start, end) {
  const endpoint = encodeURI(`https://api.tradingeconomics.com/calendar/country/${countries.join(',')}/${start}/${end}?c=${teApiKey}&f=json`);
  return { source: 'Trading Economics Calendar API', sourceUrl: 'https://docs.tradingeconomics.com/economic_calendar/country/', events: (await fetchJson(endpoint)).map(toTeEvent) };
}
async function fetchFmp(start, end) {
  const urls = [`https://financialmodelingprep.com/stable/economic-calendar?from=${start}&to=${end}&apikey=${fmpApiKey}`, `https://financialmodelingprep.com/api/v3/economic_calendar?from=${start}&to=${end}&apikey=${fmpApiKey}`];
  let lastError;
  for (const url of urls) {
    try { return { source: 'Financial Modeling Prep Economic Calendar API', sourceUrl: 'https://financialmodelingprep.com/stable/economic-calendar', events: (await fetchJson(url)).map(toFmpEvent) }; }
    catch (error) { lastError = error; }
  }
  throw lastError;
}
async function main() {
  const start = isoDate(0), end = isoDate(6);
  let payload;
  try { payload = await fetchTradingEconomics(start, end); }
  catch (error) { console.warn(error.message); payload = await fetchFmp(start, end); }
  const events = payload.events.filter((event) => event.date && event.n !== '--').sort((a, b) => new Date(a.date) - new Date(b.date) || a.t.localeCompare(b.t));
  if (!events.length) throw new Error('No usable calendar events');
  await mkdir('data', { recursive: true });
  await writeFile(path.join('data', 'economic-calendar-live.json'), `${JSON.stringify({...payload, generatedAt:new Date().toISOString(), timezone:'Australia/Sydney', range:{start,end}, events}, null, 2)}\n`, 'utf8');
  console.log(`Saved ${events.length} economic calendar events from ${payload.source}.`);
}
main().catch(async (error) => {
  console.error(error);
  const existing = await readExisting();
  if (existing.length) { console.log(`Keeping existing economic calendar cache with ${existing.length} events.`); return; }
  process.exitCode = 1;
});
