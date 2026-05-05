let chartLoaded = false;

function initSidebarTradingView() {
  if (chartLoaded) return;
  if (typeof TradingView !== "undefined" && document.getElementById("sidebarTradingView")) {
    new TradingView.widget({
      "container_id": "sidebarTradingView",
      "width": "100%",
      "height": "100%",
      "symbol": "OANDA:XAUUSD",
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "zh_CN",
      "toolbar_bg": "#ffffff",
      "enable_publishing": false,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "studies": ["MACD@tv-basicstudies", "RSI@tv-basicstudies"]
    });
    chartLoaded = true;
  } else {
    setTimeout(initSidebarTradingView, 500);
  }
}

function openToolPanel(type) {
  const panel = document.getElementById("toolPanel");
  const overlay = document.getElementById("panelOverlay");
  if (!panel) return;
  panel.classList.add("open");
  overlay.classList.add("show");
  switchTool(type || "chart");
}

function closeToolPanel() {
  document.getElementById("toolPanel").classList.remove("open");
  document.getElementById("panelOverlay").classList.remove("show");
}

function switchTool(type) {
  const titles = { chart: "行情图表", chat: "在线客服" };
  document.getElementById("panelTitle").textContent = titles[type];
  ["Chart", "Chat"].forEach(name => {
    document.getElementById("content" + name).classList.remove("active");
    document.getElementById("tab" + name).classList.remove("active");
  });
  const map = { chart: "Chart", chat: "Chat" };
  document.getElementById("content" + map[type]).classList.add("active");
  document.getElementById("tab" + map[type]).classList.add("active");
  if (type === "chart") setTimeout(initSmartSidebarChart, 200);
}

function money(n) {
  if (!isFinite(n)) return "--";
  return "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function calcMargin() {
  const contract = parseFloat(document.getElementById("marginContract").value) || 0;
  const lots = parseFloat(document.getElementById("marginLots").value) || 0;
  const lev = parseFloat(document.getElementById("marginLev").value) || 1;
  const priceEl = document.getElementById("marginPrice");
  const price = priceEl ? (parseFloat(priceEl.value) || 1) : 1;
  const result = contract * lots * price / lev;
  document.getElementById("marginResult").innerHTML = "预计保证金：<br>" + money(result);
}

function calcProfit() {
  const pips = parseFloat(document.getElementById("profitPips").value) || 0;
  const lots = parseFloat(document.getElementById("profitLots").value) || 0;
  const pipValue = parseFloat(document.getElementById("profitPipValue").value) || 0;
  const result = pips * lots * pipValue;
  document.getElementById("profitResult").innerHTML = "预计盈亏：<br>" + money(result);
}

function calcPosition() {
  const balance = parseFloat(document.getElementById("posBalance").value) || 0;
  const risk = parseFloat(document.getElementById("posRisk").value) || 0;
  const sl = parseFloat(document.getElementById("posSL").value) || 1;
  const pipValue = parseFloat(document.getElementById("posPipValue").value) || 1;
  const riskAmount = balance * risk / 100;
  const lots = riskAmount / (sl * pipValue);
  document.getElementById("posResult").innerHTML = "建议仓位：<br>" + lots.toFixed(2) + " 标准手<br>风险金额：" + money(riskAmount);
}

function addMsg(text, type="bot") {
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
  addMsg("欢迎您 👍 如果您已经完成开户链接注册，请留下注册邮箱和微信联系方式。我们会为您确认开户链接归属，并安排专属客户经理协助账户激活、入金、ECN账户设置及MT4/MT5配置。");
  document.getElementById("leadEmail").required = true;
  document.getElementById("leadEmail").placeholder = "注册邮箱 / Email（必填）";
}

function notRegistered() {
  addMsg("还未开户", "user");
  addMsg("您可以先点击页面内“开通ECN裸点账户”完成注册。若开户过程中遇到问题，直接留下微信即可，我们会安排专属客户经理协助您完成整个流程。");
  document.getElementById("leadEmail").required = false;
  document.getElementById("leadEmail").placeholder = "注册邮箱 / Email（可选）";
}

function sendLead(e) {
  e.preventDefault();
  const wechat = document.getElementById("leadWechat").value.trim();
  const regEmail = document.getElementById("leadEmail").value.trim();
  const note = document.getElementById("leadNote").value.trim();
  const message = `您好，我来自TradeMax网站咨询。%0A微信：${encodeURIComponent(wechat)}%0A注册邮箱：${encodeURIComponent(regEmail || "未填写/未开户")}%0A备注：${encodeURIComponent(note || "无")}`;
  addMsg("信息已生成，正在跳转 WhatsApp 给客户经理。", "bot");
  window.open("https://wa.me/61424456407?text=" + message, "_blank");
}

setTimeout(() => {
  if (document.getElementById("toolPanel")) openToolPanel("chat");
}, 4500);


function askSmartQuestion() {
  const input = document.getElementById("smartQuestion");
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;
  addMsg(q, "user");
  input.value = "";
  const answer = getSmartAnswer(q);
  addMsg(answer, "bot");
}

function getSmartAnswer(q) {
  const text = q.toLowerCase();
  if (text.includes("ecn") || text.includes("裸点") || text.includes("0点差") || text.includes("点差")) {
    return "ECN 裸点账户点差低至 0 pip 起，适合高频、短线、EA 和重视成本的客户。STD 点差参考 0.32，PM 0.27，PRO 0.22。实际交易条件以平台显示为准。您可以点击页面中的 ECN 链接开户注册。";
  }
  if (text.includes("开户") || text.includes("注册") || text.includes("开户链接")) {
    return "您可以先通过页面中的开户链接自主注册。开户完成后，请留下注册邮箱和微信，我们会安排专属客户经理协助确认开户链接归属、账户激活、入金和平台设置。";
  }
  if (text.includes("mt4") || text.includes("mt5") || text.includes("下载") || text.includes("平台")) {
    return "MT4 更适合经典外汇和黄金交易，MT5 更适合多资产和更多订单/周期需求。您可以在 MT4/MT5 页面下载平台，如不确定服务器或登录方式，可以留下微信安排协助。";
  }
  if (text.includes("保证金") || text.includes("杠杆") || text.includes("margin")) {
    return "保证金通常按：合约大小 × 手数 × 产品价格 ÷ 杠杆 估算。网站的交易计算器页面已经加入黄金、外汇、BTC、ETH 等产品选项，可以直接输入参数计算。";
  }
  if (text.includes("黄金") || text.includes("xau") || text.includes("gold")) {
    return "黄金 XAUUSD 是较热门的交易品种，适合关注美元、利率、避险情绪和重大数据行情的客户。交易前建议控制仓位，并可使用计算器估算保证金和风险。";
  }
  if (text.includes("入金") || text.includes("出金") || text.includes("充值") || text.includes("提现")) {
    return "入金和出金方式需以客户后台显示为准。开户后请留下注册邮箱和微信，我们会安排客户经理协助您查看可用方式和注意事项。";
  }
  if (text.includes("代理") || text.includes("ib") || text.includes("返佣") || text.includes("合作")) {
    return "如果您有客户资源、交易社群、财经内容或教育渠道，可以咨询代理合作。请留下微信和合作背景，我们会安排负责人对接返佣、活动和开户链接方案。";
  }
  if (text.includes("微信") || text.includes("联系") || text.includes("客服")) {
    return "您可以直接在下方填写微信号；如果已经开户，也请填写注册邮箱。我们会尽快安排专属客户经理与您对接。";
  }
  return "我可以帮您解答开户、ECN点差、MT4/MT5下载、黄金交易、保证金计算、代理合作等问题。您也可以直接留下微信和注册邮箱，由专属客户经理为您一对一协助。";
}

function applyProductDefaults(type) {
  if (type === "margin") {
    const opt = document.getElementById("marginSymbol").selectedOptions[0];
    document.getElementById("marginContract").value = opt.dataset.contract || 100000;
    document.getElementById("marginPrice").value = opt.dataset.price || 1;
  }
  if (type === "profit") {
    const opt = document.getElementById("profitSymbol").selectedOptions[0];
    document.getElementById("profitPipValue").value = opt.dataset.pip || 10;
  }
  if (type === "position") {
    const opt = document.getElementById("posSymbol").selectedOptions[0];
    document.getElementById("posPipValue").value = opt.dataset.pip || 10;
  }
}



/* ===== Right-side chart only: REAL sources, no simulated market data ===== */
async function detectChartCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code || "";
  } catch (e) {
    return "";
  }
}

function renderChinaRealGoldChart(container) {
  container.innerHTML = `
    <div class="real-cn-chart">
      <div class="real-cn-head">
        <div>
          <small>真实第三方行情源</small>
          <h3>伦敦金 XAU</h3>
        </div>
        <a href="https://gu.sina.cn/ft/hq/hf.php?symbol=XAU" target="_blank" rel="noopener">打开原页面</a>
      </div>

      <iframe
        class="real-cn-iframe"
        src="https://gu.sina.cn/ft/hq/hf.php?symbol=XAU"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>

      <div class="real-cn-footer">
        <p>行情来源：新浪财经伦敦金 XAU 页面。交易报价、点差及成交请以 MT4 / MT5 实际显示为准。</p>
        <div class="real-cn-actions">
          <a href="https://gu.sina.cn/ft/hq/hf.php?symbol=XAU" target="_blank" rel="noopener">查看新浪行情</a>
          <a href="lead-form.html">联系客户经理</a>
        </div>
      </div>
    </div>
  `;
  chartLoaded = true;
}

async function initSmartSidebarChart() {
  const container = document.getElementById("sidebarTradingView");
  if (!container) return;

  const url = new URL(window.location.href);
  const forceChina = url.searchParams.get("chart") === "cn";
  const country = forceChina ? "CN" : await detectChartCountry();

  if (country === "CN") {
    renderChinaRealGoldChart(container);
    return;
  }

  if (typeof TradingView !== "undefined") {
    new TradingView.widget({
      "container_id": "sidebarTradingView",
      "width": "100%",
      "height": "100%",
      "symbol": "OANDA:XAUUSD",
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "zh_CN",
      "toolbar_bg": "#ffffff",
      "enable_publishing": false,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "studies": ["MACD@tv-basicstudies", "RSI@tv-basicstudies"]
    });
    chartLoaded = true;
  } else {
    renderChinaRealGoldChart(container);
  }
}
