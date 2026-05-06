(function connectTradingEconomicsCalendar(){
  if (window.__economicCalendarApiLoaded) return;
  window.__economicCalendarApiLoaded = true;
  if (typeof events === 'undefined' || typeof renderEvents !== 'function') return;

  const TE_CLIENT = 'guest:guest';
  const COUNTRY_QUERY = [
    'united states','china','euro area','united kingdom','japan','australia','canada','germany','france','italy','spain','switzerland','new zealand'
  ].join(',');
  const countryCodes = {
    'United States':'US','China':'CN','Euro Area':'EU','United Kingdom':'UK','Japan':'JP','Australia':'AU','Canada':'CA','Germany':'DE','France':'FR','Italy':'IT','Spain':'ES','Switzerland':'CH','New Zealand':'NZ'
  };
  const flags = {US:'US',CN:'CN',EU:'EU',UK:'UK',JP:'JP',AU:'AU',CA:'CA',DE:'DE',FR:'FR',IT:'IT',ES:'ES',CH:'CH',NZ:'NZ'};
  const API_CACHE_URL = 'data/economic-calendar-live.json';

  events.splice(0, events.length);
  renderEvents();

  function isoDateFromDate(date){ return date.toISOString().slice(0,10); }
  function addDays(date, days){ const next = new Date(date); next.setDate(next.getDate()+days); return next; }
  function weekStartDate(){
    if (window.calendarStartDate) return new Date(`${window.calendarStartDate}T00:00:00`);
    const today = new Date();
    today.setHours(0,0,0,0);
    const daysSinceMonday = (today.getDay()+6)%7;
    return addDays(today, -daysSinceMonday);
  }
  function weekEndDate(){ return addDays(weekStartDate(), 13); }
  function dayOffset(dateText){
    const eventDate = new Date(dateText);
    const start = weekStartDate();
    const eventStart = new Date(eventDate); eventStart.setHours(0,0,0,0);
    return Math.round((eventStart-start)/86400000);
  }
  function timeText(dateText){
    const d = new Date(dateText);
    if (Number.isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
  }
  function typeFromCategory(category,eventName){
    const text = `${category||''} ${eventName||''}`.toLowerCase();
    if (/cpi|inflation|ppi|price|prices|deflator|pce/.test(text)) return '通胀';
    if (/job|employment|unemployment|payroll|wage|claims|labor|labour/.test(text)) return '就业';
    if (/fed|ecb|boe|boj|rba|rate|interest|central bank|fomc|minutes|speech/.test(text)) return '央行';
    if (/retail|consumer|confidence|spending|sales/.test(text)) return '消费';
    if (/oil|gas|crude|inventory|inventories|energy/.test(text)) return '能源';
    if (/trade|export|import|current account/.test(text)) return '贸易';
    if (/bond|bill|auction|treasury/.test(text)) return '债券';
    return '增长';
  }
  function impactFromImportance(value){
    const num = Number(value);
    if (num >= 3) return 'high';
    if (num === 2) return 'medium';
    return 'low';
  }
  function clean(value){ return value === null || value === undefined || value === '' ? '--' : String(value); }
  function showStatus(text, ok){
    const toolbar = document.querySelector('.event-toolbar');
    if (!toolbar) return;
    let badge = document.getElementById('apiStatusBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'apiStatusBadge';
      badge.style.cssText = 'display:inline-flex;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:950;background:#eef7ff;color:#075aff;border:1px solid #c8d8ef;';
      toolbar.appendChild(badge);
    }
    badge.textContent = text;
    badge.style.color = ok ? '#075aff' : '#92400e';
    badge.style.background = ok ? '#eef7ff' : '#fff7ed';
  }
  function showNoRealData(message){
    events.splice(0, events.length);
    renderEvents();
    showStatus(message, false);
  }
  function refreshDates(){ if (typeof initDates === 'function') initDates(); }
  function applyEvents(mapped, statusText){
    const usable = mapped
      .map(item => ({...item, d: Number.isInteger(item.d) ? item.d : dayOffset(item.date)}))
      .filter(item=>item.d>=0 && item.d<=13)
      .sort((a,b)=>a.d-b.d||String(a.t).localeCompare(String(b.t)));
    if (!usable.length) throw new Error('no usable events in selected range');
    events.splice(0, events.length, ...usable);
    refreshDates();
    renderEvents();
    showStatus(statusText.replace('{count}', usable.length), true);
  }
  async function loadSyncedCalendar(){
    showStatus('正在读取本周和下周官方 API 同步数据...', true);
    const response = await fetch(`${API_CACHE_URL}?v=${Date.now()}`, {cache:'no-store'});
    if (!response.ok) throw new Error(`calendar cache ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.events) || !payload.events.length) throw new Error('empty synced calendar');
    if (payload.range && payload.range.start) window.calendarStartDate = payload.range.start;
    applyEvents(payload.events, `真实 API 数据：${payload.source || '官方日历'} · 本周和下周 · {count} 条`);
  }
  async function loadDirectCalendar(){
    showStatus('正在尝试直连 Trading Economics API...', true);
    const start = isoDateFromDate(weekStartDate()), end = isoDateFromDate(weekEndDate());
    const url = encodeURI(`https://api.tradingeconomics.com/calendar/country/${COUNTRY_QUERY}/${start}/${end}?c=${TE_CLIENT}&f=json`);
    const response = await fetch(url, {headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error(`Trading Economics API ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('empty calendar response');
    const mapped = data.map(item=>{
      const c = countryCodes[item.Country] || (item.Currency || item.Country || 'GLB').slice(0,3).toUpperCase();
      return {date:item.Date,t:timeText(item.Date),c,flag:flags[c]||c,type:typeFromCategory(item.Category,item.Event),i:impactFromImportance(item.Importance),n:clean(item.Event||item.Category),desc:clean([item.Category,item.Reference].filter(Boolean).join(' · ')),actual:clean(item.Actual),forecast:clean(item.Forecast||item.TEForecast),previous:clean(item.Previous)};
    });
    applyEvents(mapped, `实时 API 数据：Trading Economics · 本周和下周 · {count} 条`);
  }

  loadSyncedCalendar()
    .catch(() => loadDirectCalendar())
    .catch(error=>{
      console.warn('Economic calendar API unavailable:', error);
      showNoRealData('真实 API 尚未连通，请配置 Trading Economics API key 后显示');
    });
})();
