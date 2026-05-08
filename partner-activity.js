(function addPartnerActivitySection(){
  var page = location.pathname.split('/').pop();
  if (page !== 'partners.html') return;
  if (document.getElementById('agent-activity')) return;

  var style = document.createElement('style');
  style.textContent = `
    .agent-activity-section{padding:92px 7%;background:linear-gradient(180deg,#fff 0%,#f7fbff 100%);position:relative;overflow:hidden}
    .agent-activity-section:before{content:"";position:absolute;right:-160px;top:60px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(22,119,255,.14),transparent 64%);pointer-events:none}
    .agent-activity-wrap{max-width:1500px;margin:auto;position:relative;z-index:1}
    .agent-activity-head{display:flex;justify-content:space-between;gap:28px;align-items:end;margin-bottom:30px}
    .agent-activity-head h2{font-size:54px;line-height:1.1;margin:0;color:#081428;letter-spacing:0}.agent-activity-head h2 span{color:#1677ff}.agent-activity-head p{max-width:610px;font-size:19px;line-height:1.7;color:#69768d;margin:0;font-weight:700}
    .agent-activity-grid{display:grid;grid-template-columns:1.1fr .9fr .9fr;gap:22px}
    .agent-campaign{position:relative;overflow:hidden;border-radius:28px;padding:30px;min-height:260px;color:#fff;background:#101928;box-shadow:0 28px 76px rgba(7,28,66,.14);transition:.28s}.agent-campaign:hover{transform:translateY(-8px)}
    .agent-campaign.main{grid-row:span 2;min-height:548px;background:radial-gradient(circle at 70% 72%,rgba(126,184,255,.46),transparent 34%),linear-gradient(145deg,#1c4f9f,#075fe0 58%,#071d49)}
    .agent-campaign.gold{background:radial-gradient(circle at 82% 70%,rgba(255,214,92,.38),transparent 30%),linear-gradient(145deg,#111c2f,#06101f)}
    .agent-campaign.blue{background:radial-gradient(circle at 82% 70%,rgba(34,199,255,.34),transparent 30%),linear-gradient(145deg,#061a46,#0b57d2)}
    .agent-campaign.dark{background:radial-gradient(circle at 78% 70%,rgba(255,255,255,.16),transparent 30%),linear-gradient(145deg,#101928,#050b16)}
    .agent-campaign h3{font-size:34px;margin:0 0 12px;color:#fff}.agent-campaign p{font-size:17px;line-height:1.62;color:#edf6ff;max-width:620px}.agent-campaign .tag{display:inline-flex;border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:8px 12px;font-weight:950;color:#fff;margin-bottom:18px}.agent-campaign a{position:relative;z-index:2;display:inline-flex;margin-top:18px;color:#fff;font-weight:950}.agent-campaign .big-number{position:absolute;right:26px;bottom:18px;font-size:96px;font-weight:950;color:rgba(255,255,255,.14);line-height:1}
    .campaign-points{display:grid;gap:12px;margin-top:26px}.campaign-points span{display:flex;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:14px;background:rgba(255,255,255,.08);font-weight:850}.campaign-points i{width:10px;height:10px;border-radius:50%;background:#22c7ff;box-shadow:0 0 0 6px rgba(34,199,255,.12)}
    @media(max-width:1180px){.agent-activity-head{display:grid}.agent-activity-grid{grid-template-columns:1fr 1fr}.agent-campaign.main{grid-row:auto;grid-column:1/-1;min-height:360px}}
    @media(max-width:720px){.agent-activity-section{padding:64px 5%}.agent-activity-head h2{font-size:36px}.agent-activity-head p{font-size:16px}.agent-activity-grid{grid-template-columns:1fr}.agent-campaign.main{grid-column:auto}.agent-campaign h3{font-size:28px}}
  `;
  document.head.appendChild(style);

  var menu = document.querySelector('.partner-menu');
  if (menu && !menu.querySelector('a[href="#agent-activity"]')) {
    var item = document.createElement('div');
    item.className = 'menu-item';
    item.innerHTML = '<a href="#agent-activity">代理活动 <span class="chev">⌄</span></a><div class="dropdown"><a href="#agent-activity">本月代理激励</a><a href="#agent-activity-deposit">入金转化活动</a><a href="#agent-activity-contest">交易比赛推广</a></div>';
    menu.insertBefore(item, menu.firstElementChild);
  }

  var section = document.createElement('section');
  section.className = 'agent-activity-section';
  section.id = 'agent-activity';
  section.innerHTML = `
    <div class="agent-activity-wrap reveal visible">
      <div class="agent-activity-head">
        <div><p class="eyebrow">PARTNER CAMPAIGNS</p><h2>代理活动<br><span>帮你把客户带起来</span></h2></div>
        <p>把之前的代理活动重新放回代理页，并放在福利之前。代理可以先看活动节奏，再根据客户阶段选择入金福利、低点差账户、跟单社区或交易比赛。</p>
      </div>
      <div class="agent-activity-grid">
        <article class="agent-campaign main" id="agent-activity-deposit">
          <span class="tag">重点活动</span>
          <h3>新客入金转化活动</h3>
          <p>面向刚注册、已开真实账户但还没有完成首次入金的客户。代理可配合客户经理，用入金福利、账户优势和一对一跟进提高首入转化。</p>
          <div class="campaign-points"><span><i></i>适合新客户首入、二次跟进和社群集中转化</span><span><i></i>可结合低点差账户、黄金外汇热门品种一起介绍</span><span><i></i>客户提交信息后由客户经理确认具体活动资格</span></div>
          <a href="#register">咨询本月代理活动 ↗</a><b class="big-number">01</b>
        </article>
        <article class="agent-campaign gold">
          <span class="tag">返佣支持</span><h3>代理返佣激励</h3><p>针对有稳定客户来源的代理，按客户质量、交易量和合作模式评估返佣方案。</p><a href="#register">申请返佣方案 ↗</a><b class="big-number">02</b>
        </article>
        <article class="agent-campaign blue">
          <span class="tag">社群运营</span><h3>跟单社区推广</h3><p>用策略社区帮助客户持续关注市场，适合微信群、社群和内容型代理做长期留存。</p><a href="https://portal.tmgm.com/copy-trading/markets" target="_blank">打开跟单社区 ↗</a><b class="big-number">03</b>
        </article>
        <article class="agent-campaign dark" id="agent-activity-contest">
          <span class="tag">活跃拉新</span><h3>交易比赛活动</h3><p>通过比赛排名、奖励和限时活动制造参与感，用于短周期拉新、促活和客户回访。</p><a href="https://portal.tmgm.com/trading-competition/9" target="_blank">查看交易比赛 ↗</a><b class="big-number">04</b>
        </article>
        <article class="agent-campaign dark">
          <span class="tag">老活动恢复</span><h3>活动资料整合</h3><p>之前代理页里的活动入口已恢复到这里，后续可以继续把每月活动海报、规则和报名入口加进来。</p><a href="#register">提交活动需求 ↗</a><b class="big-number">05</b>
        </article>
      </div>
    </div>`;

  var products = document.getElementById('products');
  if (products && products.parentNode) products.parentNode.insertBefore(section, products);
})();

(function connectPartnerRegistration(){
  var page = location.pathname.split('/').pop();
  if (page !== 'partners.html') return;

  var OPEN_ACCOUNT_URL = 'https://portal.cnfxhero.com/register?node=MjE4NjI0&language=zh-Hans';
  var OWNER_EMAIL = (window.CRM_CONFIG && CRM_CONFIG.OWNER_EMAIL) || '1911310053@qq.com';
  var OWNER_WHATSAPP = (window.CRM_CONFIG && CRM_CONFIG.OWNER_WHATSAPP) || '61424456407';

  function value(id) {
    var el = document.getElementById(id);
    return el && el.value ? el.value.trim() : '';
  }

  function buildPartnerLeadPayload(ip, device) {
    var name = (value('pfLast') + ' ' + value('pfFirst')).trim();
    var note = value('pfNote');
    var source = '代理注册页 / partners.html';
    return {
      visitor_id: typeof getVisitorId === 'function' ? getVisitorId() : ('partner_' + Date.now()),
      name: name,
      wechat: value('pfWechat'),
      whatsapp: value('pfPhone'),
      email: value('pfEmail'),
      registered: '代理申请',
      account_type: 'ECN / 代理合作',
      interest: value('pfInterest') || '成为代理',
      source_page: source,
      notes: '代理合作申请。国家/城市：' + value('pfCountry') + ' / ' + value('pfCity') + '。公司/网站：' + (value('pfCompany') || '未填写') + ' / ' + (value('pfWebsite') || '未填写') + '。客户资源规模：' + (value('pfScale') || '未填写') + '。备注：' + (note || '无'),
      status: '代理申请',
      ip_address: ip.ip || 'unknown',
      country: ip.country || value('pfCountry') || 'unknown',
      country_code: ip.country_code || '',
      city: ip.city || value('pfCity') || '',
      region: ip.region || '',
      user_agent: device.user_agent || navigator.userAgent,
      language: device.language || navigator.language,
      screen_size: device.screen_size || (screen.width + 'x' + screen.height),
      timezone: device.timezone || (Intl.DateTimeFormat().resolvedOptions().timeZone || '')
    };
  }

  function leadText(payload) {
    return [
      'TradeMax 代理合作申请',
      '姓名：' + payload.name,
      '国家/地区：' + payload.country + ' ' + payload.city,
      '电话：' + payload.whatsapp,
      '邮箱：' + payload.email,
      '微信：' + (payload.wechat || '未填写'),
      '意向：' + payload.interest,
      'IP：' + payload.ip_address,
      '备注：' + payload.notes
    ].join('\n');
  }

  async function submitToFormSubmit(payload) {
    try {
      var res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(OWNER_EMAIL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'TradeMax 代理合作申请',
          name: payload.name,
          email: payload.email,
          phone: payload.whatsapp,
          wechat: payload.wechat,
          country: payload.country,
          city: payload.city,
          interest: payload.interest,
          ip: payload.ip_address,
          message: payload.notes
        })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  function backupLocally(payload) {
    try {
      var list = JSON.parse(localStorage.getItem('tm_partner_leads') || '[]');
      list.unshift({ created_at: new Date().toISOString(), payload: payload });
      localStorage.setItem('tm_partner_leads', JSON.stringify(list.slice(0, 50)));
    } catch (e) {}
  }

  function renderResult(resultEl, savedToCrm, sentEmail, payload) {
    var body = encodeURIComponent(leadText(payload));
    var subject = encodeURIComponent('TradeMax 代理合作申请 - ' + payload.name);
    var waText = encodeURIComponent(leadText(payload));
    resultEl.innerHTML = '信息已整理完成。' +
      (savedToCrm ? '已写入 CRM。' : 'CRM 当前未配置 Supabase，已启用邮件/本地备用记录。') +
      (sentEmail ? '邮件通知已尝试发送。' : '') +
      '<br><a class="mini-link" target="_blank" href="' + OPEN_ACCOUNT_URL + '">打开真实 ECN 开户注册入口</a>' +
      ' · <a class="mini-link" href="mailto:' + OWNER_EMAIL + '?subject=' + subject + '&body=' + body + '">邮件发送给客户经理</a>' +
      ' · <a class="mini-link" target="_blank" href="https://wa.me/' + OWNER_WHATSAPP + '?text=' + waText + '">WhatsApp 发送给客户经理</a>';
    resultEl.className = 'form-result show';
  }

  window.submitPartnerForm = async function(event) {
    event.preventDefault();
    var form = event.target;
    var resultEl = document.getElementById('partnerFormResult');
    if (resultEl) {
      resultEl.textContent = '正在提交代理申请...';
      resultEl.className = 'form-result show';
    }

    var ip = typeof getClientIP === 'function' ? await getClientIP() : { ip: 'unknown', country: value('pfCountry'), country_code: '', city: value('pfCity'), region: '' };
    var device = typeof getDeviceInfo === 'function' ? getDeviceInfo() : {};
    var payload = buildPartnerLeadPayload(ip, device);
    if (typeof scoreLead === 'function') payload.lead_score = scoreLead(payload);

    var savedToCrm = false;
    if (typeof isConfigured === 'function' && isConfigured() && typeof supabaseInsert === 'function') {
      var crmResult = await supabaseInsert('leads', payload);
      savedToCrm = !crmResult.error;
    }

    if (typeof notifyEmail === 'function') {
      await notifyEmail({
        subject: 'TradeMax 代理合作申请',
        wechat: payload.wechat,
        email: payload.email,
        whatsapp: payload.whatsapp,
        account_type: payload.account_type,
        interest: payload.interest,
        ip: payload.ip_address,
        country: payload.country,
        notes: payload.notes
      });
    }

    var sentEmail = await submitToFormSubmit(payload);
    backupLocally(payload);
    if (resultEl) renderResult(resultEl, savedToCrm, sentEmail, payload);
    form.reset();
  };
})();
