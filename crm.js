
function supabaseHeaders() {
  return {
    "apikey": CRM_CONFIG.SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + CRM_CONFIG.SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
}

function isConfigured() {
  return CRM_CONFIG.SUPABASE_URL && !CRM_CONFIG.SUPABASE_URL.includes("PASTE_");
}

function getVisitorId() {
  let id = localStorage.getItem("tm_visitor_id");
  if (!id) {
    id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
    localStorage.setItem("tm_visitor_id", id);
  }
  return id;
}

async function getClientIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      ip: data.ip || "unknown",
      country: data.country_name || "unknown",
      country_code: data.country_code || "",
      city: data.city || "",
      region: data.region || ""
    };
  } catch (e) {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return { ip: data.ip || "unknown", country: "unknown", country_code: "", city: "", region: "" };
    } catch (e2) {
      return { ip: "unknown", country: "unknown", country_code: "", city: "", region: "" };
    }
  }
}

function getDeviceInfo() {
  return {
    user_agent: navigator.userAgent,
    language: navigator.language,
    screen_size: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  };
}

async function supabaseInsert(table, payload) {
  if (!isConfigured()) {
    console.warn("Supabase not configured:", table, payload);
    return { error: "Supabase not configured" };
  }
  const res = await fetch(`${CRM_CONFIG.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { error: data || res.statusText };
  return { data };
}

async function supabaseSelect(table, query = "select=*") {
  if (!isConfigured()) return [];
  const res = await fetch(`${CRM_CONFIG.SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders()
  });
  if (!res.ok) return [];
  return await res.json();
}

async function supabasePatch(table, id, payload) {
  if (!isConfigured()) return null;
  const res = await fetch(`${CRM_CONFIG.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: supabaseHeaders(),
    body: JSON.stringify(payload)
  });
  return await res.json().catch(() => null);
}

function scoreLead(x) {
  let s = 0;
  if (x.wechat) s += 50;
  if (x.registered === "已开户") s += 30;
  if (x.email) s += 20;
  if ((x.visit_count || 0) >= 3) s += 10;
  if ((x.question_count || 0) >= 2) s += 10;
  if (x.country_code === "CN") s += 20;
  if (x.country_code === "AU") s -= 20;
  return Math.max(0, s);
}

function priorityLabel(x) {
  const s = scoreLead(x);
  if (x.country_code === "AU") return { label: "低优先-澳洲", cls: "row-low" };
  if (x.country_code === "CN" && s >= 70) return { label: "高优先-中国", cls: "row-hot" };
  if (s >= 80) return { label: "高优先", cls: "row-hot" };
  if (s >= 45) return { label: "中优先", cls: "row-mid" };
  return { label: "低优先", cls: "row-low" };
}

async function trackPageView() {
  if (location.pathname.includes("crm-")) return;
  const ip = await getClientIP();
  const d = getDeviceInfo();
  await supabaseInsert("page_views", {
    visitor_id: getVisitorId(),
    page: location.pathname.split("/").pop() || "index.html",
    full_url: location.href,
    referrer: document.referrer || "",
    ip_address: ip.ip,
    country: ip.country,
    country_code: ip.country_code,
    city: ip.city,
    region: ip.region,
    user_agent: d.user_agent,
    language: d.language,
    screen_size: d.screen_size,
    timezone: d.timezone
  });
}

async function notifyEmail(payload) {
  if (!CRM_CONFIG.EMAILJS_PUBLIC_KEY || !CRM_CONFIG.EMAILJS_SERVICE_ID || !CRM_CONFIG.EMAILJS_TEMPLATE_ID || !window.emailjs) return;
  try {
    emailjs.init(CRM_CONFIG.EMAILJS_PUBLIC_KEY);
    await emailjs.send(CRM_CONFIG.EMAILJS_SERVICE_ID, CRM_CONFIG.EMAILJS_TEMPLATE_ID, payload);
  } catch (e) {
    console.warn("EmailJS failed", e);
  }
}

// Public lead form: save CRM, optional email, NO forced WhatsApp jump
async function submitLeadForm(event) {
  event.preventDefault();
  const form = event.target;
  const msg = document.getElementById("leadFormMessage");
  if (msg) {
    msg.textContent = "正在提交...";
    msg.className = "form-message";
  }

  const ip = await getClientIP();
  const d = getDeviceInfo();
  const payload = {
    visitor_id: getVisitorId(),
    name: form.name?.value?.trim() || "",
    wechat: form.wechat?.value?.trim() || "",
    whatsapp: form.whatsapp?.value?.trim() || "",
    email: form.email?.value?.trim() || "",
    registered: form.registered?.value || "未填写",
    account_type: form.account_type?.value || "未填写",
    interest: form.interest?.value || "未填写",
    source_page: form.source_page?.value || location.pathname,
    notes: form.notes?.value?.trim() || "",
    status: "新客户",
    ip_address: ip.ip,
    country: ip.country,
    country_code: ip.country_code,
    city: ip.city,
    region: ip.region,
    user_agent: d.user_agent,
    language: d.language,
    screen_size: d.screen_size,
    timezone: d.timezone
  };
  payload.lead_score = scoreLead(payload);

  const result = await supabaseInsert("leads", payload);
  if (result.error) {
    if (msg) {
      msg.textContent = "提交失败：CRM数据库未配置或网络异常。请检查 Supabase 配置。";
      msg.className = "form-message error";
    }
    return;
  }

  await notifyEmail({
    subject: "新客户线索",
    wechat: payload.wechat,
    email: payload.email,
    whatsapp: payload.whatsapp,
    account_type: payload.account_type,
    interest: payload.interest,
    ip: payload.ip_address,
    country: payload.country,
    notes: payload.notes
  });

  if (msg) {
    msg.innerHTML = `提交成功，客户经理会尽快联系您。<br><a class="mini-link" target="_blank" href="https://wa.me/${CRM_CONFIG.OWNER_WHATSAPP}">如您方便，也可以点击这里 WhatsApp 联系客户经理</a>`;
    msg.className = "form-message success";
  }
  form.reset();
}

// Floating chat submit: save CRM, optional email, NO forced WhatsApp jump
async function sendLead(e) {
  e.preventDefault();
  const wechat = document.getElementById("leadWechat")?.value.trim() || "";
  const regEmail = document.getElementById("leadEmail")?.value.trim() || "";
  const note = document.getElementById("leadNote")?.value.trim() || "";
  const ip = await getClientIP();
  const d = getDeviceInfo();

  const payload = {
    visitor_id: getVisitorId(),
    wechat,
    email: regEmail,
    notes: note,
    source_page: location.pathname,
    status: "新客户",
    registered: regEmail ? "已开户" : "未开户",
    account_type: "ECN",
    interest: "在线客服",
    ip_address: ip.ip,
    country: ip.country,
    country_code: ip.country_code,
    city: ip.city,
    region: ip.region,
    user_agent: d.user_agent,
    language: d.language,
    screen_size: d.screen_size,
    timezone: d.timezone
  };
  payload.lead_score = scoreLead(payload);
  await supabaseInsert("leads", payload);
  await notifyEmail({ subject: "在线客服线索", wechat, email: regEmail, ip: ip.ip, country: ip.country, notes: note });

  if (typeof addMsg === "function") {
    addMsg("信息已提交成功。客户经理会尽快与您联系；如您方便，也可以点击联系方式主动联系。", "bot");
  }
}

function openBenefitModal(benefitName) {
  const modal = document.getElementById("benefitModal");
  const input = document.getElementById("benefitName");
  if (input) input.value = benefitName || "MTCommander 盈亏统计指标";
  if (modal) {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeBenefitModal() {
  const modal = document.getElementById("benefitModal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
}

function toggleBenefitCode() {
  const box = document.getElementById("benefitCodeBox");
  if (box) box.hidden = !box.hidden;
}

function unlockBenefitDownload() {
  const input = document.getElementById("benefitCodeInput");
  const msg = document.getElementById("benefitCodeMessage");
  const code = (input?.value || "").trim();
  const validCode = (CRM_CONFIG.BENEFIT_CODE_MTCOMMANDER || "").trim();
  if (!code || code !== validCode) {
    if (msg) {
      msg.textContent = "兑换码不正确，请联系客户经理确认。";
      msg.className = "error";
    }
    return;
  }
  if (msg) {
    msg.textContent = "验证成功，正在开始下载。";
    msg.className = "success";
  }
  const a = document.createElement("a");
  a.href = "assets/MTCommander-PnL-MT4-V5.05.ex4";
  a.download = "MTCommander-PnL-MT4-V5.05.ex4";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function submitBenefitRequest(event) {
  event.preventDefault();
  const form = event.target;
  const msg = document.getElementById("benefitFormMessage");
  if (msg) {
    msg.textContent = "正在提交申请...";
    msg.className = "form-message";
  }

  const benefit = form.benefit?.value || "MTCommander 盈亏统计指标";
  const ip = await getClientIP();
  const d = getDeviceInfo();
  const payload = {
    visitor_id: getVisitorId(),
    name: "",
    wechat: form.wechat?.value?.trim() || "",
    whatsapp: form.whatsapp?.value?.trim() || "",
    email: form.email?.value?.trim() || "",
    registered: "已开户",
    account_type: "ECN",
    interest: "开户客户福利",
    source_page: location.pathname,
    notes: `申请福利兑换码：${benefit}。${form.notes?.value?.trim() || ""}`,
    status: "福利申请",
    ip_address: ip.ip,
    country: ip.country,
    country_code: ip.country_code,
    city: ip.city,
    region: ip.region,
    user_agent: d.user_agent,
    language: d.language,
    screen_size: d.screen_size,
    timezone: d.timezone
  };
  payload.lead_score = scoreLead(payload);

  const result = await supabaseInsert("leads", payload);
  if (result.error) {
    if (msg) {
      msg.textContent = "提交失败：CRM 数据库未配置或网络异常，请稍后再试。";
      msg.className = "form-message error";
    }
    return;
  }

  await notifyEmail({
    subject: "开户客户福利兑换码申请",
    wechat: payload.wechat,
    email: payload.email,
    whatsapp: payload.whatsapp,
    account_type: payload.account_type,
    interest: payload.interest,
    ip: payload.ip_address,
    country: payload.country,
    notes: payload.notes
  });

  if (msg) {
    msg.textContent = "申请已提交，客户经理核实后会发送兑换码。";
    msg.className = "form-message success";
  }
  form.reset();
}

async function logQuestion(question, answer) {
  const ip = await getClientIP();
  const d = getDeviceInfo();
  await supabaseInsert("chat_logs", {
    visitor_id: getVisitorId(),
    page: location.pathname.split("/").pop() || "index.html",
    question,
    answer,
    ip_address: ip.ip,
    country: ip.country,
    country_code: ip.country_code,
    city: ip.city,
    region: ip.region,
    user_agent: d.user_agent,
    language: d.language
  });
}

// Override/upgrade old smart question function after script.js loads
(function(){
  const install = () => {
    window.askSmartQuestion = async function() {
      const input = document.getElementById("smartQuestion");
      if (!input) return;
      const q = input.value.trim();
      if (!q) return;
      if (typeof addMsg === "function") addMsg(q, "user");
      input.value = "";
      const answer = typeof getSmartAnswer === "function"
        ? getSmartAnswer(q)
        : "感谢咨询。请留下微信或邮箱，客户经理会尽快联系您。";
      if (typeof addMsg === "function") addMsg(answer, "bot");
      await logQuestion(q, answer);
    };
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();

function requireAdminLogin() {
  const ok = sessionStorage.getItem("crm_admin_ok") === "1";
  if (ok) return;
  const pwd = prompt("请输入CRM后台密码：");
  if (pwd === CRM_CONFIG.ADMIN_PASSWORD) {
    sessionStorage.setItem("crm_admin_ok", "1");
  } else {
    alert("密码错误");
    location.href = "index.html";
  }
}

function adminLogout() {
  sessionStorage.removeItem("crm_admin_ok");
  location.href = "index.html";
}

function fmt(s) { return s ? new Date(s).toLocaleString() : ""; }
function esc(v) {
  return String(v || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

let leadCache = [], viewCache = [], chatCache = [];

// Final lead dashboard
async function loadEnterpriseLeads() {
  leadCache = await supabaseSelect("leads", "select=*&order=created_at.desc&limit=1000");
  viewCache = await supabaseSelect("page_views", "select=visitor_id,ip_address,country_code&limit=5000");
  chatCache = await supabaseSelect("chat_logs", "select=visitor_id,question&limit=5000");

  const vc = {};
  viewCache.forEach(v => { vc[v.visitor_id] = (vc[v.visitor_id] || 0) + 1; });
  const qc = {};
  chatCache.forEach(c => { qc[c.visitor_id] = (qc[c.visitor_id] || 0) + 1; });

  leadCache = leadCache.map(x => {
    const y = { ...x, visit_count: vc[x.visitor_id] || 0, question_count: qc[x.visitor_id] || 0 };
    y.lead_score = scoreLead(y);
    return y;
  }).sort((a,b) => scoreLead(b) - scoreLead(a));

  renderEnterpriseStats();
  renderEnterpriseTable();
}

// Compatibility with old dashboard file
async function loadLeads() { return loadEnterpriseLeads(); }

function renderEnterpriseStats() {
  const today = new Date().toISOString().slice(0,10);
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText("statTotalLeads", leadCache.length);
  setText("statTodayLeads", leadCache.filter(x => (x.created_at || "").startsWith(today)).length);
  setText("statHotLeads", leadCache.filter(x => scoreLead(x) >= 70).length);
  setText("statChinaLeads", leadCache.filter(x => x.country_code === "CN").length);
  setText("statECNLeads", leadCache.filter(x => x.account_type === "ECN").length);
  setText("statPendingLeads", leadCache.filter(x => !x.status || x.status === "新客户").length);
}

function renderEnterpriseTable() {
  const q = (document.getElementById("leadSearch")?.value || "").toLowerCase();
  const status = document.getElementById("leadStatusFilter")?.value || "";
  const rows = leadCache.filter(x => {
    const hay = `${x.wechat||""} ${x.email||""} ${x.ip_address||""} ${x.notes||""} ${x.country||""} ${x.whatsapp||""}`.toLowerCase();
    return (!q || hay.includes(q)) && (!status || x.status === status);
  });
  const tbody = document.getElementById("leadTableBody");
  if (!tbody) return;
  tbody.innerHTML = rows.map(x => {
    const p = priorityLabel(x);
    return `<tr class="${p.cls}">
      <td><b>${p.label}</b><br><span>${scoreLead(x)}分</span></td>
      <td>${fmt(x.created_at)}</td>
      <td>${esc(x.wechat) || "-"}</td>
      <td>${esc(x.email) || "-"}</td>
      <td>${esc(x.whatsapp) || "-"}</td>
      <td>${esc(x.country)}<br><span>${esc(x.ip_address)}</span></td>
      <td>${esc(x.registered)}<br>${esc(x.account_type)}</td>
      <td>${esc(x.interest)}</td>
      <td>${x.visit_count || 0}</td>
      <td>${x.question_count || 0}</td>
      <td>
        <select onchange="updateLeadStatus('${x.id}', this.value)">
          ${["新客户","已联系","已开户","已入金","已激活","无效客户"].map(s => `<option ${x.status===s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td>${esc(x.notes)}</td>
    </tr>`;
  }).join("");
}

// Compatibility with old dashboard file
function renderLeadTable() { return renderEnterpriseTable(); }

async function updateLeadStatus(id, status) {
  await supabasePatch("leads", id, { status });
  await loadEnterpriseLeads();
}

// Final analytics dashboard
async function loadEnterpriseAnalytics() {
  const views = await supabaseSelect("page_views", "select=*&order=created_at.desc&limit=2000");
  const leads = await supabaseSelect("leads", "select=*&order=created_at.desc&limit=1000");
  const chats = await supabaseSelect("chat_logs", "select=*&order=created_at.desc&limit=1000");
  const today = new Date().toISOString().slice(0,10);
  const ips = new Set(views.map(v => v.ip_address).filter(Boolean));

  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText("statViews", views.length);
  setText("statUniqueIP", ips.size);
  setText("statTodayViews", views.filter(v => (v.created_at || "").startsWith(today)).length);
  setText("statQuestions", chats.length);
  setText("statConversion", views.length ? ((leads.length / views.length) * 100).toFixed(1) + "%" : "0%");

  const pc = {};
  views.forEach(v => pc[v.page || "unknown"] = (pc[v.page || "unknown"] || 0) + 1);
  const pageRank = document.getElementById("pageRank");
  if (pageRank) {
    pageRank.innerHTML = Object.entries(pc).sort((a,b) => b[1]-a[1]).slice(0,12)
      .map(([p,n]) => `<div class="rank-row"><span>${esc(p)}</span><b>${n}</b></div>`).join("");
  }

  const recent = document.getElementById("recentViews");
  if (recent) {
    recent.innerHTML = views.slice(0,40).map(v => 
      `<div class="view-row ${v.country_code === "CN" ? "china-ip" : v.country_code === "AU" ? "au-ip" : ""}">
        <b>${esc(v.ip_address)} · ${esc(v.country)}</b>
        <span>${esc(v.page)} · ${fmt(v.created_at)}</span>
      </div>`
    ).join("");
  }
}

// Compatibility with old dashboard file
async function loadAnalytics() { return loadEnterpriseAnalytics(); }
