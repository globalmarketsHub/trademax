(function customerCopyFix(){
  const GENERIC_SUCCESS = "信息已提交成功，请耐心等待客户经理联系您。";
  const GENERIC_APPLY_SUCCESS = "申请已提交成功，请耐心等待客户经理联系您。";
  const GENERIC_ERROR = "提交暂时未成功，请稍后再试，或直接联系客户经理。";

  function setCustomerFacingCopy() {
    document.querySelectorAll(".tool-note").forEach(el => {
      el.textContent = "提交后客户经理会尽快与您联系，请保持联系方式畅通。";
    });
    document.querySelectorAll(".crm-form-copy p:not(.eyebrow)").forEach(el => {
      if (el.textContent.includes("CRM") || el.textContent.includes("WhatsApp") || el.textContent.includes("后台")) {
        el.textContent = "请留下您的联系方式与需求，客户经理会尽快与您联系，为您协助开户、账户设置、平台下载及后续服务。";
      }
    });
  }

  function getIpAndDevice() {
    return Promise.all([
      typeof getClientIP === "function" ? getClientIP() : Promise.resolve({ ip: "unknown", country: "unknown", country_code: "", city: "", region: "" }),
      Promise.resolve(typeof getDeviceInfo === "function" ? getDeviceInfo() : {})
    ]);
  }

  async function savePayload(payload) {
    if (typeof saveLeadDeduped === "function") return await saveLeadDeduped(payload);
    if (typeof supabaseInsert === "function") return await supabaseInsert("leads", payload);
    return { error: "CRM unavailable" };
  }

  function notifySafe(payload, subject) {
    if (typeof notifyEmail !== "function") return Promise.resolve();
    return notifyEmail({
      subject,
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

  window.submitLeadForm = async function submitLeadFormCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const msg = document.getElementById("leadFormMessage");
    if (msg) { msg.textContent = "正在提交，请稍候..."; msg.className = "form-message"; }
    const [ip, d] = await getIpAndDevice();
    const payload = {
      visitor_id: typeof getVisitorId === "function" ? getVisitorId() : "",
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
      user_agent: d.user_agent || navigator.userAgent,
      language: d.language || navigator.language,
      screen_size: d.screen_size || `${screen.width}x${screen.height}`,
      timezone: d.timezone || (Intl.DateTimeFormat().resolvedOptions().timeZone || "")
    };
    const result = await savePayload(payload);
    if (result.error) {
      if (msg) { msg.textContent = GENERIC_ERROR; msg.className = "form-message error"; }
      return;
    }
    await notifySafe(payload, "客户信息提交");
    if (msg) { msg.textContent = GENERIC_SUCCESS; msg.className = "form-message success"; }
    form.reset();
  };

  window.sendLead = async function sendLeadCustomer(event) {
    event.preventDefault();
    const wechat = document.getElementById("leadWechat")?.value.trim() || "";
    const email = document.getElementById("leadEmail")?.value.trim() || "";
    const note = document.getElementById("leadNote")?.value.trim() || "";
    const [ip, d] = await getIpAndDevice();
    const payload = {
      visitor_id: typeof getVisitorId === "function" ? getVisitorId() : "",
      wechat,
      email,
      notes: note,
      source_page: location.pathname,
      status: "新客户",
      registered: email ? "已开户" : "未开户",
      account_type: "ECN",
      interest: "在线客服",
      ip_address: ip.ip,
      country: ip.country,
      country_code: ip.country_code,
      city: ip.city,
      region: ip.region,
      user_agent: d.user_agent || navigator.userAgent,
      language: d.language || navigator.language,
      screen_size: d.screen_size || `${screen.width}x${screen.height}`,
      timezone: d.timezone || (Intl.DateTimeFormat().resolvedOptions().timeZone || "")
    };
    await savePayload(payload);
    await notifySafe(payload, "在线客服提交");
    if (typeof addMsg === "function") addMsg(GENERIC_SUCCESS, "bot");
  };

  window.submitBenefitRequest = async function submitBenefitRequestCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const msg = document.getElementById("benefitFormMessage");
    if (msg) { msg.textContent = "正在提交，请稍候..."; msg.className = "form-message"; }
    const benefit = form.benefit?.value || "客户福利";
    const [ip, d] = await getIpAndDevice();
    const payload = {
      visitor_id: typeof getVisitorId === "function" ? getVisitorId() : "",
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
      user_agent: d.user_agent || navigator.userAgent,
      language: d.language || navigator.language,
      screen_size: d.screen_size || `${screen.width}x${screen.height}`,
      timezone: d.timezone || (Intl.DateTimeFormat().resolvedOptions().timeZone || "")
    };
    const result = await savePayload(payload);
    if (result.error) {
      if (msg) { msg.textContent = GENERIC_ERROR; msg.className = "form-message error"; }
      return;
    }
    await notifySafe(payload, "客户福利申请");
    if (msg) { msg.textContent = GENERIC_APPLY_SUCCESS; msg.className = "form-message success"; }
    form.reset();
  };

  window.submitPartnerForm = async function submitPartnerFormCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const resultEl = document.getElementById("partnerFormResult");
    if (resultEl) { resultEl.textContent = "正在提交，请稍候..."; resultEl.className = "form-result show"; }
    const get = id => document.getElementById(id)?.value?.trim() || "";
    const [ip, d] = await getIpAndDevice();
    const payload = {
      visitor_id: typeof getVisitorId === "function" ? getVisitorId() : "",
      name: `${get("pfLast")} ${get("pfFirst")}`.trim(),
      wechat: get("pfWechat"),
      whatsapp: get("pfPhone"),
      email: get("pfEmail"),
      registered: "代理申请",
      account_type: "ECN / 代理合作",
      interest: get("pfInterest") || "成为代理",
      source_page: "代理注册页 / partners.html",
      notes: `代理合作申请。国家/城市：${get("pfCountry")} / ${get("pfCity")}。公司/网站：${get("pfCompany") || "未填写"} / ${get("pfWebsite") || "未填写"}。客户资源规模：${get("pfScale") || "未填写"}。备注：${get("pfNote") || "无"}`,
      status: "代理申请",
      ip_address: ip.ip,
      country: ip.country || get("pfCountry"),
      country_code: ip.country_code,
      city: ip.city || get("pfCity"),
      region: ip.region,
      user_agent: d.user_agent || navigator.userAgent,
      language: d.language || navigator.language,
      screen_size: d.screen_size || `${screen.width}x${screen.height}`,
      timezone: d.timezone || (Intl.DateTimeFormat().resolvedOptions().timeZone || "")
    };
    const result = await savePayload(payload);
    if (result.error) {
      if (resultEl) { resultEl.textContent = GENERIC_ERROR; resultEl.className = "form-result show"; }
      return;
    }
    await notifySafe(payload, "代理合作申请");
    if (resultEl) resultEl.textContent = GENERIC_SUCCESS;
    form.reset();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setCustomerFacingCopy);
  else setCustomerFacingCopy();
})();
