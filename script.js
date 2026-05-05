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
  const titles = { chart: "Live Chart", chat: "Chatbot" };
  document.getElementById("panelTitle").textContent = titles[type];
  ["Chart", "Chat"].forEach(name => {
    document.getElementById("content" + name).classList.remove("active");
    document.getElementById("tab" + name).classList.remove("active");
  });
  const map = { chart: "Chart", chat: "Chat" };
  document.getElementById("content" + map[type]).classList.add("active");
  document.getElementById("tab" + map[type]).classList.add("active");
  if (type === "chart") setTimeout(initSidebarTradingView, 200);
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
