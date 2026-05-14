const TRADEMAX_CONTACT = {
  qq: "2564088251",
  email: "2564088251@qq.com",
  qqHref: "tencent://message/?uin=2564088251&Site=&Menu=yes"
};

(() => {
  const ready = fn => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  function updateTextNode(node) {
    node.nodeValue = node.nodeValue
      .replace(/1911310053@qq\.com/g, TRADEMAX_CONTACT.email)
      .replace(/1911310053/g, TRADEMAX_CONTACT.qq)
      .replace(/\+61\s*0424456407/g, "")
      .replace(/61424456407/g, "")
      .replace(/WhatsApp/g, "QQ");
  }

  window.applyContactCleanup = function applyContactCleanup() {
    if (window.CRM_CONFIG) {
      window.CRM_CONFIG.OWNER_QQ = TRADEMAX_CONTACT.qq;
      window.CRM_CONFIG.OWNER_EMAIL = TRADEMAX_CONTACT.email;
      window.CRM_CONFIG.OWNER_WHATSAPP = "";
    }

    document.querySelectorAll("a[href]").forEach(link => {
      const href = link.getAttribute("href") || "";
      const text = link.textContent || "";
      if (/wa\.me|whatsapp/i.test(href)) {
        link.remove();
        return;
      }
      if (href.includes("uin=1911310053") || /\bQQ\b/i.test(text)) {
        link.setAttribute("href", TRADEMAX_CONTACT.qqHref);
      }
      if (href.includes("1911310053@qq.com") || href.startsWith("mailto:")) {
        link.setAttribute("href", "mailto:" + TRADEMAX_CONTACT.email);
      }
    });

    document.querySelectorAll(".contact-card a").forEach(link => {
      const label = link.querySelector("span")?.textContent || "";
      const value = link.querySelector("b");
      if (/QQ/i.test(label) && value) value.textContent = TRADEMAX_CONTACT.qq;
      if (/Email|邮箱/i.test(label) && value) value.textContent = TRADEMAX_CONTACT.email;
    });

    document.querySelectorAll(".manager-box").forEach(box => {
      box.querySelectorAll("span").forEach(item => {
        if (/WhatsApp/i.test(item.textContent || "")) {
          item.remove();
          return;
        }
        if (/QQ/.test(item.textContent || "")) item.textContent = "QQ：" + TRADEMAX_CONTACT.qq;
        if (/Email|邮箱/.test(item.textContent || "")) item.textContent = "Email：" + TRADEMAX_CONTACT.email;
      });
    });

    document.querySelectorAll(".tool-note").forEach(note => {
      if (/WhatsApp|QQ/.test(note.textContent || "")) {
        note.textContent = "提交后客户经理会尽快联系您；静态网站不会单独存储客户资料。";
      }
    });

    document.querySelectorAll(".form-result").forEach(result => {
      if (/WhatsApp|QQ/.test(result.textContent || "")) {
        result.textContent = "信息已整理，请通过 QQ " + TRADEMAX_CONTACT.qq + " 或邮箱 " + TRADEMAX_CONTACT.email + " 联系客户经理。";
      }
    });

    document.querySelectorAll("label").forEach(label => {
      label.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /WhatsApp/i.test(node.nodeValue || "")) {
          node.nodeValue = node.nodeValue.replace(/WhatsApp\s*\/\s*手机|WhatsApp/g, "QQ");
        }
      });
    });

    if (document.body) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const tag = node.parentElement?.tagName;
          if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
          return /1911310053|1911310053@qq\.com|\+61\s*0424456407|61424456407|WhatsApp/.test(node.nodeValue || "")
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(updateTextNode);
    }
  };

  function applyAssetFixes() {
    document.querySelectorAll('nav a[href="lead-form.html"]').forEach(link => {
      const nav = link.closest("nav");
      if (nav && !nav.querySelector('a[href="ea.html"]')) {
        const eaLink = document.createElement("a");
        eaLink.href = "ea.html";
        eaLink.textContent = "EA技术";
        nav.insertBefore(eaLink, link);
      }
    });
    if (!document.querySelector('link[href="fix-assets.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "fix-assets.css";
      document.head.appendChild(link);
    }
    document.querySelectorAll('img[src="assets/metatrader-4-logo.png"]').forEach(img => {
      img.src = "assets/metatrader-4-logo.svg";
    });
    document.querySelectorAll('img[src="assets/metatrader-5-logo.png"]').forEach(img => {
      img.src = "assets/metatrader-5-logo.svg";
    });
    window.applyContactCleanup();
  }

  function installContactOverrides() {
    window.applyContactCleanup();

    if (typeof window.submitPartnerForm === "function" && !window.submitPartnerForm.__qqOnly) {
      const handler = function submitPartnerForm(event) {
        event.preventDefault();
        const result = document.getElementById("partnerFormResult");
        if (result) {
          result.textContent = "信息已整理，请通过 QQ " + TRADEMAX_CONTACT.qq + " 或邮箱 " + TRADEMAX_CONTACT.email + " 联系客户经理。";
          result.classList.add("show");
        }
        window.open(TRADEMAX_CONTACT.qqHref, "_blank");
      };
      handler.__qqOnly = true;
      window.submitPartnerForm = handler;
    }

    if (typeof window.submitLeadForm === "function" && !window.submitLeadForm.__qqCleanup) {
      const original = window.submitLeadForm;
      const wrapped = async function submitLeadForm(event) {
        await original.call(this, event);
        window.applyContactCleanup();
        const msg = document.getElementById("leadFormMessage");
        if (msg && msg.classList.contains("success")) {
          msg.innerHTML = '提交成功，客户经理会尽快联系您。<br><a class="mini-link" target="_blank" href="' + TRADEMAX_CONTACT.qqHref + '">点击这里通过 QQ 联系客户经理</a>';
        }
      };
      wrapped.__qqCleanup = true;
      window.submitLeadForm = wrapped;
    }
  }

  ready(applyAssetFixes);
  window.addEventListener("load", installContactOverrides);
  setTimeout(installContactOverrides, 600);
  setTimeout(installContactOverrides, 1600);
})();

function money(n) {
  if (!isFinite(n)) return "--";
  return "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function calcMargin() {
  const contract = parseFloat(document.getElementById("marginContract")?.value) || 0;
  const lots = parseFloat(document.getElementById("marginLots")?.value) || 0;
  const lev = parseFloat(document.getElementById("marginLev")?.value) || 1;
  const price = parseFloat(document.getElementById("marginPrice")?.value) || 1;
  const result = contract * lots * price / lev;
  const output = document.getElementById("marginResult");
  if (output) output.innerHTML = "预计保证金：<br>" + money(result);
}

function calcProfit() {
  const pips = parseFloat(document.getElementById("profitPips")?.value) || 0;
  const lots = parseFloat(document.getElementById("profitLots")?.value) || 0;
  const pipValue = parseFloat(document.getElementById("profitPipValue")?.value) || 0;
  const output = document.getElementById("profitResult");
  if (output) output.innerHTML = "预计盈亏：<br>" + money(pips * lots * pipValue);
}

function calcPosition() {
  const balance = parseFloat(document.getElementById("posBalance")?.value) || 0;
  const risk = parseFloat(document.getElementById("posRisk")?.value) || 0;
  const sl = parseFloat(document.getElementById("posSL")?.value) || 1;
  const pipValue = parseFloat(document.getElementById("posPipValue")?.value) || 1;
  const riskAmount = balance * risk / 100;
  const lots = riskAmount / (sl * pipValue);
  const output = document.getElementById("posResult");
  if (output) output.innerHTML = "建议仓位：<br>" + lots.toFixed(2) + " 标准手<br>风险金额：" + money(riskAmount);
}

function applyProductDefaults(type) {
  if (type === "margin") {
    const opt = document.getElementById("marginSymbol")?.selectedOptions[0];
    if (!opt) return;
    document.getElementById("marginContract").value = opt.dataset.contract || 100000;
    document.getElementById("marginPrice").value = opt.dataset.price || 1;
  }
  if (type === "profit") {
    const opt = document.getElementById("profitSymbol")?.selectedOptions[0];
    if (opt) document.getElementById("profitPipValue").value = opt.dataset.pip || 10;
  }
  if (type === "position") {
    const opt = document.getElementById("posSymbol")?.selectedOptions[0];
    if (opt) document.getElementById("posPipValue").value = opt.dataset.pip || 10;
  }
}

function addMsg(text, type = "bot") {
  const body = document.getElementById("chatBody");
  if (!body) return;
  const div = document.createElement("div");
  div.className = type + " msg";
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function alreadyRegistered() {
  addMsg("我已开户", "user");
  addMsg("欢迎您。如果已经完成开户链接注册，请留下注册邮箱和微信联系方式，我们会为您确认开户链接归属，并安排客户经理协助账户激活、入金、ECN账户设置及 MT4/MT5 配置。");
  const email = document.getElementById("leadEmail");
  if (email) {
    email.required = true;
    email.placeholder = "注册邮箱 / Email（必填）";
  }
}

function notRegistered() {
  addMsg("还未开户", "user");
  addMsg("您可以先点击页面内的“开通ECN裸点账户”完成注册。若开户过程中遇到问题，直接留下微信即可，我们会安排专属客户经理协助您完成整个流程。");
  const email = document.getElementById("leadEmail");
  if (email) {
    email.required = false;
    email.placeholder = "注册邮箱 / Email（可选）";
  }
}

function sendLead(e) {
  e.preventDefault();
  const wechat = document.getElementById("leadWechat")?.value.trim() || "";
  const regEmail = document.getElementById("leadEmail")?.value.trim() || "";
  const note = document.getElementById("leadNote")?.value.trim() || "";
  const message = "信息已生成，请通过 QQ " + TRADEMAX_CONTACT.qq + " 或邮箱 " + TRADEMAX_CONTACT.email + " 联系客户经理。";
  addMsg(message, "bot");
  window.open(TRADEMAX_CONTACT.qqHref, "_blank");
  console.info("TradeMax lead", { wechat, regEmail, note });
}

function askSmartQuestion() {
  const input = document.getElementById("smartQuestion");
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;
  addMsg(q, "user");
  input.value = "";
  addMsg(getSmartAnswer(q), "bot");
}

function getSmartAnswer(q) {
  const text = q.toLowerCase();
  if (text.includes("ea") || text.includes("自动化") || text.includes("智能交易") || text.includes("vps") || text.includes("指标") || text.includes("趋势")) {
    return "EA 是运行在 MT4/MT5 上的自动化交易工具。客户完成开户链接注册后，可以联系客户经理免费申请 EA 使用权限、趋势技术指标体验和免费 VPS 服务；具体开通资格、配置和持续使用条件以客户经理核实为准。";
  }
  if (text.includes("ecn") || text.includes("裸点") || text.includes("0点差") || text.includes("点差")) {
    return "ECN 裸点账户点差低至 0 pip 起，适合高频、短线、EA 和重视成本的客户。实际交易条件以平台显示为准，您可以点击页面中的 ECN 链接开户注册。";
  }
  if (text.includes("开户") || text.includes("注册") || text.includes("开户链接")) {
    return "您可以先通过页面中的开户链接自主注册。开户完成后，请留下注册邮箱和微信，我们会安排专属客户经理协助确认开户链接归属、账户激活、入金和平台设置。";
  }
  if (text.includes("mt4") || text.includes("mt5") || text.includes("下载") || text.includes("平台")) {
    return "MT4 更适合经典外汇和黄金交易，MT5 更适合多资产和更多订单/周期需求。您可以在 MT4/MT5 页面下载平台，如不确定服务器或登录方式，可以留下微信安排协助。";
  }
  if (text.includes("保证金") || text.includes("杠杆") || text.includes("margin")) {
    return "保证金通常按：合约大小 × 手数 × 产品价格 ÷ 杠杆估算。网站的交易计算器页面可以直接输入参数计算。";
  }
  if (text.includes("黄金") || text.includes("xau") || text.includes("gold")) {
    return "黄金 XAUUSD 是较热门的交易品种，适合关注美元、利率、避险情绪和重大数据行情的客户。交易前建议控制仓位，并使用计算器估算保证金和风险。";
  }
  if (text.includes("入金") || text.includes("出金") || text.includes("充值") || text.includes("提现")) {
    return "入金和出金方式需以客户后台显示为准。开户后请留下注册邮箱和微信，我们会安排客户经理协助您查看可用方式和注意事项。";
  }
  if (text.includes("代理") || text.includes("ib") || text.includes("返佣") || text.includes("合作")) {
    return "如果您有客户资源、交易社群、财经内容或教育渠道，可以咨询代理合作。请留下微信和合作背景，我们会安排负责人对接返佣、活动和开户链接方案。";
  }
  if (text.includes("微信") || text.includes("联系") || text.includes("客服") || text.includes("qq")) {
    return "您可以直接在下方填写微信号；也可以通过 QQ " + TRADEMAX_CONTACT.qq + " 或邮箱 " + TRADEMAX_CONTACT.email + " 联系客户经理。";
  }
  return "我可以帮您解答开户、ECN点差、MT4/MT5下载、黄金交易、保证金计算、EA技术、VPS、趋势指标和代理合作等问题。您也可以直接留下微信和注册邮箱，由专属客户经理为您一对一协助。";
}

function openToolPanel(type) {
  const panel = document.getElementById("toolPanel");
  const overlay = document.getElementById("panelOverlay");
  if (!panel) return;
  panel.classList.add("open");
  overlay?.classList.add("show");
  switchTool(type || "chart");
}

function closeToolPanel() {
  document.getElementById("toolPanel")?.classList.remove("open");
  document.getElementById("panelOverlay")?.classList.remove("show");
}

function switchTool(type) {
  const map = { chart: "Chart", chat: "Chat" };
  const key = map[type] || "Chart";
  ["Chart", "Chat"].forEach(name => {
    document.getElementById("content" + name)?.classList.remove("active");
    document.getElementById("tab" + name)?.classList.remove("active");
  });
  document.getElementById("content" + key)?.classList.add("active");
  document.getElementById("tab" + key)?.classList.add("active");
  const title = document.getElementById("panelTitle");
  if (title) title.textContent = type === "chat" ? "在线客服" : (document.getElementById("tabChart")?.textContent || "行情图表");
  if (type === "chart") setTimeout(initSidebarTradingViewFinal, 200);
}

let mainlandDetectionPromiseV2;

function readRegionOverrideV2() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("china") === "1" || params.get("gift") === "1") return true;
  if (params.get("tv") === "1") return false;
  return null;
}

async function fetchCountryCodeV2() {
  const endpoints = ["https://ipapi.co/json/", "https://ipwho.is/"];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const code = (data.country_code || data.countryCode || "").toUpperCase();
      if (code) return code;
    } catch (e) {}
  }
  return "";
}

async function detectChinaUser() {
  const override = readRegionOverrideV2();
  if (override !== null) return override;
  const countryCode = await fetchCountryCodeV2();
  if (countryCode === "CN") return true;
  if (countryCode && countryCode !== "CN") return false;
  try {
    const lang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.includes("zh-cn") || tz === "Asia/Shanghai") return true;
  } catch (e) {}
  return false;
}

function getMainlandDetectionV2() {
  if (!mainlandDetectionPromiseV2) mainlandDetectionPromiseV2 = detectChinaUser();
  return mainlandDetectionPromiseV2;
}

function renderToolRegionLoading(container) {
  container.innerHTML = '<div class="tool-region-loading"><b>正在为您匹配访问内容</b><span>请稍候...</span></div>';
}

function renderGiftOnly(container) {
  container.innerHTML = `
    <div class="final-tv-gift-wrap">
      <div id="giftFallback" class="gift-fallback show">
        <div class="gift-fallback-head">
          <span>TMGM CLIENT CAMPAIGN</span>
          <h3>5月回馈客户活动</h3>
        </div>
        <img class="gift-fallback-img" src="assets/may-gift.svg" alt="TMGM 入金礼物活动">
        <div class="gift-fallback-actions">
          <a href="lead-form.html" class="gift-primary">立即领取福利</a>
          <a href="contact.html" class="gift-secondary">联系客户经理</a>
        </div>
        <p class="gift-risk">活动详情、资格及最终解释请以客户经理确认为准。交易涉及风险。</p>
      </div>
    </div>
  `;
}

function renderTradingViewOnly(container) {
  container.innerHTML = `
    <div class="final-tv-gift-wrap">
      <iframe
        id="tvframe"
        src="https://s.tradingview.com/widgetembed/?symbol=OANDA:XAUUSD&interval=15&theme=light"
        width="100%"
        height="100%"
        frameborder="0"
        loading="lazy"
        style="border-radius:16px;">
      </iframe>
    </div>
  `;
}

async function initSidebarTradingViewFinal() {
  const container = document.getElementById("sidebarTradingView");
  if (!container || container.dataset.regionReady === "1") return;
  renderToolRegionLoading(container);
  const isChina = await getMainlandDetectionV2();
  const title = document.getElementById("panelTitle");
  if (isChina) {
    if (title) title.textContent = "入金礼物";
    renderGiftOnly(container);
  } else {
    if (title) title.textContent = "行情图表";
    renderTradingViewOnly(container);
    setTimeout(() => {
      try {
        const iframe = document.getElementById("tvframe");
        if (!iframe || !iframe.contentWindow) renderGiftOnly(container);
      } catch (e) {
        renderGiftOnly(container);
      }
    }, 4500);
  }
  container.dataset.regionReady = "1";
}

function initSidebarTradingView() {
  return initSidebarTradingViewFinal();
}

function applyMainlandGiftLabels() {
  getMainlandDetectionV2().then(isChina => {
    if (!isChina) return;
    document.querySelectorAll("[onclick*=\"openToolPanel('chart')\"]").forEach(el => {
      if (el.classList.contains("tool-open-top")) {
        el.textContent = "入金礼物";
        return;
      }
      const text = el.querySelector("b");
      const icon = el.querySelector("span");
      if (text) text.textContent = "入金礼物";
      if (icon) icon.textContent = "礼";
    });
    const tab = document.getElementById("tabChart");
    if (tab) tab.textContent = "入金礼物";
    const title = document.getElementById("panelTitle");
    if (title && document.getElementById("contentChart")?.classList.contains("active")) title.textContent = "入金礼物";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyMainlandGiftLabels);
} else {
  applyMainlandGiftLabels();
}

setTimeout(() => {
  if (document.getElementById("toolPanel")) openToolPanel("chat");
}, 4500);
