const CRM_CONFIG = {
  SUPABASE_URL: "PASTE_YOUR_SUPABASE_URL_HERE",
  SUPABASE_ANON_KEY: "PASTE_YOUR_SUPABASE_ANON_KEY_HERE",
  ADMIN_PASSWORD: "980907",

  OWNER_WHATSAPP: "61424456407",
  OWNER_EMAIL: "1911310053@qq.com",
  BENEFIT_CODE_MTCOMMANDER: "TMGM2026",

  // 可选：EmailJS邮件提醒。不配置也能正常存CRM。
  EMAILJS_PUBLIC_KEY: "",
  EMAILJS_SERVICE_ID: "",
  EMAILJS_TEMPLATE_ID: ""
};

(function fixHomeHero() {
  var page = location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html') return;

  var css = `
    .hero-official{
      position:relative!important;
      display:grid!important;
      grid-template-columns:minmax(0,760px) minmax(420px,560px)!important;
      gap:clamp(32px,5vw,92px)!important;
      align-items:center!important;
      min-height:760px!important;
      padding:84px 7% 72px!important;
      overflow:hidden!important;
      isolation:isolate!important;
      background:#dcecff!important;
    }
    .hero-official .hero-video-bg{
      position:absolute!important;
      inset:0!important;
      z-index:0!important;
      overflow:hidden!important;
      background:#dcecff!important;
    }
    .hero-official .hero-video-bg video{
      width:100%!important;
      height:100%!important;
      object-fit:cover!important;
      object-position:63% center!important;
      filter:brightness(1.18) saturate(1.08)!important;
      opacity:.96!important;
    }
    .hero-official .hero-video-bg:after{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(90deg,rgba(7,25,58,.60) 0%,rgba(12,50,99,.30) 42%,rgba(255,255,255,.08) 82%);
      pointer-events:none;
    }
    .hero-official .hero-copy{
      position:relative!important;
      z-index:2!important;
      grid-column:1!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:flex-start!important;
      width:100%!important;
      max-width:760px!important;
      padding:0!important;
      color:#fff!important;
    }
    .hero-official .eyebrow,
    .hero-official .lead,
    .hero-official .risk-mini,
    .hero-official h1{
      color:#fff!important;
      text-shadow:0 8px 26px rgba(0,18,56,.30)!important;
    }
    .hero-official h1{
      width:100%!important;
      max-width:720px!important;
      font-size:clamp(48px,5vw,82px)!important;
      line-height:1.05!important;
      margin:18px 0 24px!important;
      letter-spacing:0!important;
    }
    .hero-official h1 span{
      color:#fff!important;
      background:none!important;
      -webkit-text-fill-color:#fff!important;
    }
    .hero-official .lead{
      width:100%!important;
      max-width:760px!important;
      font-size:22px!important;
      line-height:1.72!important;
      opacity:.94!important;
      margin:0!important;
    }
    .hero-official .cta-row{
      position:relative!important;
      z-index:4!important;
      display:flex!important;
      flex-wrap:wrap!important;
      width:100%!important;
      max-width:760px!important;
      margin:30px 0 0!important;
      padding:0!important;
      gap:14px!important;
      align-items:center!important;
      justify-content:flex-start!important;
      transform:none!important;
    }
    .hero-official .cta-row a{
      position:relative!important;
      transform:none!important;
      min-height:50px!important;
      white-space:nowrap!important;
    }
    .hero-official .primary-btn{
      background:#fff!important;
      color:#0753c7!important;
      box-shadow:0 18px 40px rgba(0,36,88,.18)!important;
    }
    .hero-official .ghost-btn{
      background:rgba(255,255,255,.16)!important;
      border:1px solid rgba(255,255,255,.42)!important;
      color:#fff!important;
      backdrop-filter:blur(10px)!important;
    }
    .hero-official .trust-row{
      position:relative!important;
      inset:auto!important;
      transform:none!important;
      grid-column:2!important;
      z-index:3!important;
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:16px!important;
      width:100%!important;
      max-width:560px!important;
      margin:0!important;
      padding:0!important;
      align-self:center!important;
      justify-self:end!important;
    }
    .hero-official .trust-row span{
      position:relative!important;
      inset:auto!important;
      transform:none!important;
      display:grid!important;
      width:auto!important;
      height:auto!important;
      min-width:0!important;
      min-height:108px!important;
      align-content:center!important;
      justify-items:center!important;
      border-radius:20px!important;
      padding:18px 14px!important;
      background:rgba(13,34,72,.38)!important;
      border:1px solid rgba(255,255,255,.34)!important;
      box-shadow:0 18px 42px rgba(0,30,80,.18)!important;
      color:#fff!important;
      font-size:28px!important;
      font-weight:950!important;
      line-height:1.08!important;
      text-align:center!important;
      backdrop-filter:blur(14px)!important;
      white-space:normal!important;
    }
    .hero-official .trust-row img{
      display:none!important;
    }
    .hero-official .trust-row small{
      display:block!important;
      margin-top:9px!important;
      color:rgba(255,255,255,.84)!important;
      font-size:13px!important;
      line-height:1.25!important;
      font-weight:850!important;
    }
    .hero-official .risk-mini{
      position:relative!important;
      width:100%!important;
      max-width:760px!important;
      margin:24px 0 0!important;
      font-size:15px!important;
      line-height:1.65!important;
      opacity:.86!important;
    }
    .hero-official .hero-terminal{
      display:none!important;
    }
    @media(max-width:1280px){
      .hero-official{grid-template-columns:minmax(0,1fr)!important;min-height:auto!important;padding:86px 5% 64px!important;}
      .hero-official .hero-copy{grid-column:1!important;max-width:760px!important;}
      .hero-official .trust-row{grid-column:1!important;justify-self:start!important;max-width:760px!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;margin-top:34px!important;}
      .hero-official .lead{font-size:18px!important;}
      .hero-official .trust-row span{min-height:92px!important;font-size:23px!important;}
      .hero-official .hero-video-bg video{object-position:64% center!important;}
      .hero-official .hero-video-bg:after{background:linear-gradient(90deg,rgba(7,25,58,.66),rgba(7,25,58,.26))!important;}
    }
    @media(max-width:760px){
      .hero-official{padding:72px 5% 48px!important;}
      .hero-official h1{font-size:42px!important;}
      .hero-official .cta-row{display:grid!important;}
      .hero-official .cta-row a{width:100%!important;white-space:normal!important;}
      .hero-official .trust-row{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;}
    }
    @media(max-width:480px){
      .hero-official .trust-row{grid-template-columns:1fr!important;}
    }
  `;

  var style = document.createElement('style');
  style.id = 'home-hero-layout-fix';
  style.textContent = css;
  document.head.appendChild(style);

  function dockHeroStats() {
    var hero = document.querySelector('.hero-official');
    var stats = document.querySelector('.trust-row');
    if (!hero || !stats) return;
    stats.classList.remove('home-stat-strip');
    if (stats.parentElement !== hero) hero.appendChild(stats);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dockHeroStats);
  } else {
    dockHeroStats();
  }
})();

(function loadEconomicCalendarApi() {
  var page = location.pathname.split('/').pop();
  if (page !== 'economic-calendar.html') return;
  if (document.getElementById('real-calendar-api-loader')) return;

  var script = document.createElement('script');
  script.id = 'real-calendar-api-loader';
  script.src = 'economic-calendar-api.js?v=real-api-only-20260506-2';
  document.body.appendChild(script);
})();

(function loadPartnerActivitySection() {
  var page = location.pathname.split('/').pop();
  if (page !== 'partners.html') return;
  if (document.getElementById('partner-activity-loader')) return;

  var script = document.createElement('script');
  script.id = 'partner-activity-loader';
  script.src = 'partner-activity.js?v=agent-activity-20260507';
  document.body.appendChild(script);
})();
