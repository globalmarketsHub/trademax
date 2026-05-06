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
      min-height:720px!important;
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
      object-position:60% center!important;
      filter:brightness(1.18) saturate(1.08)!important;
      opacity:.96!important;
    }
    .hero-official .hero-video-bg:after{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(90deg,rgba(7,25,58,.58) 0%,rgba(12,50,99,.30) 42%,rgba(255,255,255,.06) 82%);
      pointer-events:none;
    }
    .hero-official .hero-copy{
      position:relative!important;
      z-index:2!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:flex-start!important;
      width:min(760px,100%)!important;
      max-width:760px!important;
      padding:104px 0 72px!important;
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
      font-size:clamp(46px,5vw,76px)!important;
      line-height:1.06!important;
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
      position:static!important;
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
      position:static!important;
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
    .hero-official .risk-mini{
      position:static!important;
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
    .home-stat-strip{
      position:relative!important;
      z-index:5!important;
      display:grid!important;
      grid-template-columns:repeat(4,minmax(150px,1fr))!important;
      gap:16px!important;
      width:min(1440px,88%)!important;
      margin:-48px auto 0!important;
      padding:22px!important;
      background:#fff!important;
      border:1px solid #dfe8f5!important;
      border-radius:26px!important;
      box-shadow:0 28px 80px rgba(7,28,66,.16)!important;
    }
    .home-stat-strip span{
      display:grid!important;
      min-height:96px!important;
      align-content:center!important;
      justify-items:center!important;
      border-radius:18px!important;
      padding:16px 14px!important;
      background:linear-gradient(180deg,#f7fbff,#eef5ff)!important;
      border:1px solid #dbe6f4!important;
      color:#071428!important;
      font-size:26px!important;
      font-weight:950!important;
      line-height:1.1!important;
      text-align:center!important;
      white-space:normal!important;
    }
    .home-stat-strip img{
      display:none!important;
    }
    .home-stat-strip small{
      display:block!important;
      margin-top:8px!important;
      color:#68758b!important;
      font-size:13px!important;
      line-height:1.25!important;
      font-weight:850!important;
    }
    @media(max-width:980px){
      .hero-official{min-height:auto!important;padding:0 5%!important;}
      .hero-official .hero-copy{width:100%!important;max-width:720px!important;padding:86px 0 64px!important;}
      .hero-official .lead{font-size:18px!important;}
      .hero-official .hero-video-bg video{object-position:64% center!important;}
      .hero-official .hero-video-bg:after{background:linear-gradient(90deg,rgba(7,25,58,.66),rgba(7,25,58,.26))!important;}
      .home-stat-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;width:90%!important;margin:24px auto 0!important;}
    }
    @media(max-width:560px){
      .hero-official .hero-copy{padding:72px 0 48px!important;}
      .hero-official h1{font-size:42px!important;}
      .hero-official .cta-row{display:grid!important;}
      .hero-official .cta-row a{width:100%!important;white-space:normal!important;}
      .home-stat-strip{grid-template-columns:1fr!important;padding:16px!important;border-radius:20px!important;}
    }
  `;

  var style = document.createElement('style');
  style.id = 'home-hero-layout-fix';
  style.textContent = css;
  document.head.appendChild(style);

  function moveHeroStats() {
    var hero = document.querySelector('.hero-official');
    var stats = document.querySelector('.hero-official .trust-row');
    if (!hero || !stats || stats.classList.contains('home-stat-strip')) return;
    stats.classList.add('home-stat-strip');
    hero.insertAdjacentElement('afterend', stats);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', moveHeroStats);
  } else {
    moveHeroStats();
  }
})();
