(function crmUpgrades(){
  const AU_TIMEZONES = ["Australia/", "Pacific/Auckland"];
  const CN_TIMEZONES = ["Asia/Shanghai", "Asia/Chongqing", "Asia/Harbin", "Asia/Urumqi"];

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeContact(value) {
    return normalizeText(value).toLowerCase().replace(/\s+/g, "");
  }

  function getTimezone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }
    catch (e) { return ""; }
  }

  function deviceCountryFallback() {
    const timezone = getTimezone();
    const language = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (CN_TIMEZONES.includes(timezone) || language.includes("zh-cn")) {
      return { country: "China", country_code: "CN", city: "", region: "timezone/language" };
    }
    if (AU_TIMEZONES.some(prefix => timezone.startsWith(prefix)) || language.includes("en-au")) {
      return { country: "Australia", country_code: "AU", city: "", region: "timezone/language" };
    }
    return { country: "unknown", country_code: "", city: "", region: "" };
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("geo failed");
    return await res.json();
  }

  window.getClientIP = async function getClientIPUpgraded() {
    const fallback = deviceCountryFallback();
    const providers = [
      async () => {
        const data = await fetchJson("https://ipapi.co/json/");
        return {
          ip: data.ip || "unknown",
          country: data.country_name || fallback.country,
          country_code: (data.country_code || fallback.country_code || "").toUpperCase(),
          city: data.city || fallback.city,
          region: data.region || fallback.region
        };
      },
      async () => {
        const data = await fetchJson("https://ipwho.is/");
        return {
          ip: data.ip || "unknown",
          country: data.country || fallback.country,
          country_code: (data.country_code || fallback.country_code || "").toUpperCase(),
          city: data.city || fallback.city,
          region: data.region || fallback.region
        };
      },
      async () => {
        const data = await fetchJson("https://api.ipify.org?format=json");
        return { ip: data.ip || "unknown", ...fallback };
      }
    ];
    for (const provider of providers) {
      try {
        const result = await provider();
        if (result.ip && result.ip !== "unknown") return result;
      } catch (e) {}
    }
    return { ip: "unknown", ...fallback };
  };

  function isAustraliaLead(x) {
    const code = normalizeText(x.country_code).toUpperCase();
    const country = normalizeText(x.country).toLowerCase();
    const timezone = normalizeText(x.timezone);
    return code === "AU" || country.includes("australia") || timezone.startsWith("Australia/");
  }

  function isChinaLead(x) {
    const code = normalizeText(x.country_code).toUpperCase();
    const country = normalizeText(x.country).toLowerCase();
    const timezone = normalizeText(x.timezone);
    return code === "CN" || country.includes("china") || CN_TIMEZONES.includes(timezone);
  }

  window.scoreLead = function scoreLeadUpgraded(x) {
    let s = 0;
    if (x.wechat) s += 50;
    if (x.registered === "已开户") s += 30;
    if (x.email) s += 20;
    if ((x.visit_count || 0) >= 3) s += 10;
    if ((x.question_count || 0) >= 2) s += 10;
    if (isChinaLead(x)) s += 20;
    if (isAustraliaLead(x)) return Math.min(20, Math.max(0, s - 80));
    return Math.max(0, s);
  };

  window.priorityLabel = function priorityLabelUpgraded(x) {
    const s = scoreLead(x);
    if (isAustraliaLead(x)) return { label: "低优先-澳洲/疑似同行", cls: "row-low" };
    if (isChinaLead(x) && s >= 70) return { label: "高优先-中国", cls: "row-hot" };
    if (s >= 80) return { label: "高优先", cls: "row-hot" };
    if (s >= 45) return { label: "中优先", cls: "row-mid" };
    return { label: "低优先", cls: "row-low" };
  };

  function encodeValue(value) {
    return encodeURIComponent(normalizeContact(value));
  }

  async function findExistingLead(payload) {
    if (typeof supabaseSelect !== "function" || typeof isConfigured !== "function" || !isConfigured()) return null;
    const checks = [];
    if (payload.wechat) checks.push(`wechat=eq.${encodeValue(payload.wechat)}`);
    if (payload.email) checks.push(`email=eq.${encodeValue(payload.email)}`);
    if (payload.whatsapp) checks.push(`whatsapp=eq.${encodeValue(payload.whatsapp)}`);
    if (payload.visitor_id) checks.push(`visitor_id=eq.${encodeURIComponent(payload.visitor_id)}`);
    for (const condition of checks) {
      try {
        const rows = await supabaseSelect("leads", `select=*&${condition}&order=created_at.desc&limit=1`);
        if (rows && rows.length) return rows[0];
      } catch (e) {}
    }
    return null;
  }

  function mergeLead(existing, payload) {
    const merged = { ...payload };
    ["name", "wechat", "whatsapp", "email", "registered", "account_type", "interest", "source_page", "status", "ip_address", "country", "country_code", "city", "region", "user_agent", "language", "screen_size", "timezone"].forEach(key => {
      if (!merged[key] && existing[key]) merged[key] = existing[key];
    });
    const oldNotes = normalizeText(existing.notes);
    const newNotes = normalizeText(payload.notes);
    merged.notes = oldNotes && newNotes && !oldNotes.includes(newNotes)
      ? `${oldNotes}\n---\n再次提交：${newNotes}`
      : (newNotes || oldNotes);
    merged.lead_score = scoreLead({ ...existing, ...merged });
    return merged;
  }

  window.saveLeadDeduped = async function saveLeadDeduped(payload) {
    payload.lead_score = scoreLead(payload);
    const existing = await findExistingLead(payload);
    if (existing && existing.id && typeof supabasePatch === "function") {
      const merged = mergeLead(existing, payload);
      await supabasePatch("leads", existing.id, merged);
      return { data: [merged], updated: true };
    }
    return await supabaseInsert("leads", payload);
  };

  window.submitLeadForm = async function submitLeadFormUpgraded(event) {
    event.preventDefault();
    const form = event.target;
    const msg = document.getElementById("leadFormMessage");
    if (msg) { msg.textContent = "正在提交..."; msg.className = "form-message"; }
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
    const result = await saveLeadDeduped(payload);
    if (result.error) {
      if (msg) { msg.textContent = "提交失败：CRM数据库未配置或网络异常。"; msg.className = "form-message error"; }
      return;
    }
    await notifyEmail({ subject: result.updated ? "客户线索更新" : "新客户线索", wechat: payload.wechat, email: payload.email, whatsapp: payload.whatsapp, account_type: payload.account_type, interest: payload.interest, ip: payload.ip_address, country: payload.country, notes: payload.notes });
    if (msg) {
      msg.innerHTML = (result.updated ? "信息已更新到已有客户线索。" : "提交成功，客户经理会尽快联系您。") + `<br><a class="mini-link" target="_blank" href="https://wa.me/${CRM_CONFIG.OWNER_WHATSAPP}">也可以点击这里 WhatsApp 联系客户经理</a>`;
      msg.className = "form-message success";
    }
    form.reset();
  };

  window.sendLead = async function sendLeadUpgraded(e) {
    e.preventDefault();
    const wechat = document.getElementById("leadWechat")?.value.trim() || "";
    const regEmail = document.getElementById("leadEmail")?.value.trim() || "";
    const note = document.getElementById("leadNote")?.value.trim() || "";
    const ip = await getClientIP();
    const d = getDeviceInfo();
    const payload = {
      visitor_id: getVisitorId(), wechat, email: regEmail, notes: note,
      source_page: location.pathname, status: "新客户",
      registered: regEmail ? "已开户" : "未开户", account_type: "ECN", interest: "在线客服",
      ip_address: ip.ip, country: ip.country, country_code: ip.country_code, city: ip.city, region: ip.region,
      user_agent: d.user_agent, language: d.language, screen_size: d.screen_size, timezone: d.timezone
    };
    await saveLeadDeduped(payload);
    await notifyEmail({ subject: "在线客服线索", wechat, email: regEmail, ip: ip.ip, country: ip.country, notes: note });
    if (typeof addMsg === "function") addMsg("信息已提交成功。若您之前已提交过，系统会更新同一条客户线索，不会重复生成。", "bot");
  };

  window.submitBenefitRequest = async function submitBenefitRequestUpgraded(event) {
    event.preventDefault();
    const form = event.target;
    const msg = document.getElementById("benefitFormMessage");
    if (msg) { msg.textContent = "正在提交申请..."; msg.className = "form-message"; }
    const benefit = form.benefit?.value || "MTCommander 盈亏统计指标";
    const ip = await getClientIP();
    const d = getDeviceInfo();
    const payload = {
      visitor_id: getVisitorId(), name: "", wechat: form.wechat?.value?.trim() || "", whatsapp: form.whatsapp?.value?.trim() || "", email: form.email?.value?.trim() || "",
      registered: "已开户", account_type: "ECN", interest: "开户客户福利", source_page: location.pathname,
      notes: `申请福利兑换码：${benefit}。${form.notes?.value?.trim() || ""}`, status: "福利申请",
      ip_address: ip.ip, country: ip.country, country_code: ip.country_code, city: ip.city, region: ip.region,
      user_agent: d.user_agent, language: d.language, screen_size: d.screen_size, timezone: d.timezone
    };
    const result = await saveLeadDeduped(payload);
    if (result.error) {
      if (msg) { msg.textContent = "提交失败：CRM 数据库未配置或网络异常。"; msg.className = "form-message error"; }
      return;
    }
    if (msg) { msg.textContent = result.updated ? "申请已更新到已有客户线索。" : "申请已提交，客户经理核实后会发送兑换码。"; msg.className = "form-message success"; }
    form.reset();
  };

  function getFilteredLeadRows() {
    const q = (document.getElementById("leadSearch")?.value || "").toLowerCase();
    const status = document.getElementById("leadStatusFilter")?.value || "";
    return (window.leadCache || leadCache || []).filter(x => {
      const hay = `${x.wechat||""} ${x.email||""} ${x.ip_address||""} ${x.notes||""} ${x.country||""} ${x.whatsapp||""}`.toLowerCase();
      return (!q || hay.includes(q)) && (!status || x.status === status);
    });
  }

  window.exportLeadsExcel = function exportLeadsExcel() {
    const rows = getFilteredLeadRows();
    const headers = ["意向度", "分数", "时间", "微信", "邮箱", "电话/WhatsApp", "国家", "城市", "IP", "开户状态", "账户", "兴趣", "访问次数", "提问次数", "状态", "备注"];
    const body = rows.map(x => {
      const p = priorityLabel(x);
      return [p.label, scoreLead(x), fmt(x.created_at), x.wechat, x.email, x.whatsapp, x.country, x.city, x.ip_address, x.registered, x.account_type, x.interest, x.visit_count || 0, x.question_count || 0, x.status, x.notes];
    });
    const table = `<html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${body.map(row => `<tr>${row.map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradeMax-CRM-${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  function addExportButton() {
    const actions = document.querySelector(".crm-actions");
    if (!actions || document.getElementById("exportLeadsBtn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "exportLeadsBtn";
    btn.className = "ghost";
    btn.textContent = "导出Excel";
    btn.onclick = exportLeadsExcel;
    actions.insertBefore(btn, actions.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addExportButton);
  else addExportButton();
})();
