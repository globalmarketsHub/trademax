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
      display:block!important;
      min-height:760px!important;
      padding:0 6%!important;
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
      object-position:center center!important;
      filter:brightness(1.18) saturate(1.08)!important;
      opacity:.96!important;
    }
    .hero-official .hero-video-bg:after{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(90deg,rgba(7,25,58,.50) 0%,rgba(12,50,99,.24) 38%,rgba(255,255,255,.06) 78%);
      pointer-events:none;
    }
    .hero-official .hero-copy{
      position:relative!important;
      z-index:2!important;
      max-width:1040px!important;
      padding:118px 0 74px!important;
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
      max-width:720px!important;
      font-size:clamp(46px,5vw,76px)!important;
      line-height:1.06!important;
      margin:18px 0 24px!important;
    }
    .hero-official h1 span{
      color:#fff!important;
      background:none!important;
      -webkit-text-fill-color:#fff!important;
    }
    .hero-official .lead{
      max-width:760px!important;
      font-size:22px!important;
      line-height:1.72!important;
      opacity:.94!important;
    }
    .hero-official .cta-row{
      position:relative!important;
      z-index:3!important;
      margin:26px 0 24px!important;
      gap:14px!important;
      align-items:center!important;
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
      display:grid!important;
      grid-template-columns:repeat(4,minmax(120px,1fr))!important;
      gap:14px!important;
      max-width:900px!important;
      margin:22px 0 18px!important;
      align-items:stretch!important;
    }
    .hero-official .trust-row span{
      display:grid!important;
      min-height:76px!important;
      align-content:center!important;
      justify-items:center!important;
      border-radius:18px!important;
      padding:12px 14px!important;
      background:rgba(255,255,255,.16)!important;
      border:1px solid rgba(255,255,255,.30)!important;
      box-shadow:0 14px 34px rgba(0,36,88,.12)!important;
      color:#fff!important;
      line-height:1.15!important;
      text-align:center!important;
      backdrop-filter:blur(10px)!important;
    }
    .hero-official .trust-row img{
      display:none!important;
    }
    .hero-official .trust-row small{
      display:block!important;
      margin-top:7px!important;
      color:rgba(255,255,255,.82)!important;
      font-size:12px!important;
      line-height:1.25!important;
    }
    .hero-official .risk-mini{
      max-width:900px!important;
      margin:14px 0 0!important;
      font-size:15px!important;
      line-height:1.65!important;
      opacity:.82!important;
    }
    .hero-official .hero-terminal{
      display:none!important;
    }
    @media(max-width:980px){
      .hero-official{min-height:auto!important;padding:0 5%!important;}
      .hero-official .hero-copy{padding:86px 0 54px!important;}
      .hero-official .lead{font-size:18px!important;}
      .hero-official .trust-row{grid-template-columns:repeat(2,minmax(0,1fr))!important;max-width:100%!important;}
      .hero-official .hero-video-bg:after{background:linear-gradient(90deg,rgba(7,25,58,.58),rgba(7,25,58,.20))!important;}
    }
    @media(max-width:560px){
      .hero-official .trust-row{grid-template-columns:1fr!important;}
      .hero-official .cta-row{display:grid!important;}
      .hero-official .cta-row a{width:100%!important;}
    }
  `;

  var style = document.createElement('style');
  style.id = 'home-hero-layout-fix';
  style.textContent = css;
  document.head.appendChild(style);
})();
