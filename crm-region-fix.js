(function crmRegionFix(){
  const AU_TZ_PREFIX = "Australia/";
  const CN_TIMEZONES = ["Asia/Shanghai", "Asia/Chongqing", "Asia/Harbin", "Asia/Urumqi"];

  function text(value) { return String(value || "").trim(); }
  function code(value) { return text(value).toUpperCase(); }
  function tz() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }
    catch (e) { return ""; }
  }
  function language() { return (navigator.language || navigator.userLanguage || "").toLowerCase(); }

  function browserHint() {
    const timezone = tz();
    const lang = language();
    if (timezone.startsWith(AU_TZ_PREFIX) || lang.includes("en-au")) {
      return { country: "Australia", country_code: "AU", city: "", region: "browser timezone" };
    }
    if (CN_TIMEZONES.includes(timezone) || lang.includes("zh-cn")) {
      return { country: "China", country_code: "CN", city: "", region: "browser timezone" };
    }
    return { country: "unknown", country_code: "", city: "", region: "" };
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("geo request failed");
    return await res.json();
  }

  function isUsableGeo(x) {
    return x && x.ip && x.ip !== "unknown" && x.country_code;
  }

  function chooseGeo(results, hint) {
    const usable = results.filter(isUsableGeo);
    const au = usable.find(x => x.country_code === "AU");
    const cn = usable.find(x => x.country_code === "CN");

    // If the browser is clearly in Australia, do not allow a lone provider to mark it as China.
    if (hint.country_code === "AU") return au || { ...(usable[0] || {}), ...hint, ip: (usable[0] && usable[0].ip) || "unknown" };

    // Mainland China should only win when an IP provider also agrees.
    if (hint.country_code === "CN" && cn) return cn;

    // Provider agreement beats unknown browser hints.
    if (usable.length) {
      const counts = usable.reduce((acc, item) => {
        acc[item.country_code] = (acc[item.country_code] || 0) + 1;
        return acc;
      }, {});
      const winner = usable.slice().sort((a, b) => (counts[b.country_code] || 0) - (counts[a.country_code] || 0))[0];
      return winner;
    }

    return { ip: "unknown", ...hint };
  }

  window.getClientIP = async function getClientIPRegionFixed() {
    const hint = browserHint();
    const providers = [
      fetchJson("https://ipwho.is/").then(data => ({
        ip: data.ip || "unknown",
        country: data.country || hint.country,
        country_code: code(data.country_code || hint.country_code),
        city: data.city || hint.city,
        region: data.region || hint.region
      })),
      fetchJson("https://ipapi.co/json/").then(data => ({
        ip: data.ip || "unknown",
        country: data.country_name || hint.country,
        country_code: code(data.country_code || hint.country_code),
        city: data.city || hint.city,
        region: data.region || hint.region
      })),
      fetchJson("https://api.country.is/").then(data => ({
        ip: data.ip || "unknown",
        country: data.country === "AU" ? "Australia" : data.country === "CN" ? "China" : (hint.country || data.country || "unknown"),
        country_code: code(data.country || hint.country_code),
        city: hint.city,
        region: hint.region
      }))
    ];
    const settled = await Promise.allSettled(providers);
    const results = settled.filter(x => x.status === "fulfilled").map(x => x.value);
    const chosen = chooseGeo(results, hint);
    return {
      ip: chosen.ip || "unknown",
      country: chosen.country || hint.country || "unknown",
      country_code: code(chosen.country_code || hint.country_code),
      city: chosen.city || "",
      region: chosen.region || ""
    };
  };

  function isAustralia(x) {
    return code(x.country_code) === "AU" || text(x.country).toLowerCase().includes("australia") || text(x.timezone).startsWith(AU_TZ_PREFIX);
  }
  function isChina(x) {
    const timezone = text(x.timezone);
    if (isAustralia(x)) return false;
    return code(x.country_code) === "CN" || text(x.country).toLowerCase().includes("china") || CN_TIMEZONES.includes(timezone);
  }

  window.scoreLead = function scoreLeadRegionFixed(x) {
    let s = 0;
    if (x.wechat) s += 50;
    if (x.registered === "已开户") s += 30;
    if (x.email) s += 20;
    if ((x.visit_count || 0) >= 3) s += 10;
    if ((x.question_count || 0) >= 2) s += 10;
    if (isChina(x)) s += 20;
    if (isAustralia(x)) return Math.min(20, Math.max(0, s - 80));
    return Math.max(0, s);
  };

  window.priorityLabel = function priorityLabelRegionFixed(x) {
    const s = scoreLead(x);
    if (isAustralia(x)) return { label: "低优先-澳洲/疑似同行", cls: "row-low" };
    if (isChina(x) && s >= 70) return { label: "高优先-中国", cls: "row-hot" };
    if (s >= 80) return { label: "高优先", cls: "row-hot" };
    if (s >= 45) return { label: "中优先", cls: "row-mid" };
    return { label: "低优先", cls: "row-low" };
  };

  function viewGeoMap() {
    const map = {};
    try {
      (viewCache || []).forEach(v => {
        const reliable = code(v.country_code) && text(v.country).toLowerCase() !== "unknown";
        if (!reliable) return;
        if (v.visitor_id) map["visitor:" + v.visitor_id] = v;
        if (v.ip_address) map["ip:" + v.ip_address] = v;
      });
    } catch (e) {}
    return map;
  }

  function reconcileLeadGeo(lead, map) {
    const byVisitor = lead.visitor_id ? map["visitor:" + lead.visitor_id] : null;
    const byIp = lead.ip_address ? map["ip:" + lead.ip_address] : null;
    const v = byVisitor || byIp;
    if (!v) return lead;
    const leadCode = code(lead.country_code);
    const viewCode = code(v.country_code);
    if (viewCode && viewCode !== leadCode) {
      return {
        ...lead,
        country: v.country || lead.country,
        country_code: viewCode,
        city: v.city || lead.city,
        region: v.region || lead.region,
        ip_address: v.ip_address || lead.ip_address,
        geo_corrected: true
      };
    }
    return lead;
  }

  const baseLoadEnterpriseLeads = window.loadEnterpriseLeads;
  window.loadEnterpriseLeads = async function loadEnterpriseLeadsRegionFixed() {
    if (typeof supabaseSelect !== "function") return;
    leadCache = await supabaseSelect("leads", "select=*&order=created_at.desc&limit=1000");
    viewCache = await supabaseSelect("page_views", "select=visitor_id,ip_address,country,country_code,city,region,created_at&order=created_at.desc&limit=5000");
    chatCache = await supabaseSelect("chat_logs", "select=visitor_id,question&limit=5000");

    const vc = {};
    viewCache.forEach(v => { vc[v.visitor_id] = (vc[v.visitor_id] || 0) + 1; });
    const qc = {};
    chatCache.forEach(c => { qc[c.visitor_id] = (qc[c.visitor_id] || 0) + 1; });
    const geo = viewGeoMap();

    leadCache = leadCache.map(x => {
      const y = reconcileLeadGeo({ ...x, visit_count: vc[x.visitor_id] || 0, question_count: qc[x.visitor_id] || 0 }, geo);
      y.lead_score = scoreLead(y);
      return y;
    }).sort((a, b) => scoreLead(b) - scoreLead(a));

    if (typeof renderEnterpriseStats === "function") renderEnterpriseStats();
    if (typeof renderEnterpriseTable === "function") renderEnterpriseTable();
  };

  window.renderEnterpriseStats = function renderEnterpriseStatsRegionFixed() {
    const today = new Date().toISOString().slice(0, 10);
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText("statTotalLeads", leadCache.length);
    setText("statTodayLeads", leadCache.filter(x => (x.created_at || "").startsWith(today)).length);
    setText("statHotLeads", leadCache.filter(x => scoreLead(x) >= 70 && !isAustralia(x)).length);
    setText("statChinaLeads", leadCache.filter(x => isChina(x)).length);
    setText("statECNLeads", leadCache.filter(x => x.account_type === "ECN" || text(x.account_type).includes("ECN")).length);
    setText("statPendingLeads", leadCache.filter(x => !x.status || x.status === "新客户").length);
  };

  window.renderEnterpriseTable = function renderEnterpriseTableRegionFixed() {
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
      const corrected = x.geo_corrected ? "<br><span>已按访问记录校正</span>" : "";
      return `<tr class="${p.cls}">
        <td><b>${p.label}</b><br><span>${scoreLead(x)}分</span></td>
        <td>${fmt(x.created_at)}</td>
        <td>${esc(x.wechat) || "-"}</td>
        <td>${esc(x.email) || "-"}</td>
        <td>${esc(x.whatsapp) || "-"}</td>
        <td>${esc(x.country)}${corrected}<br><span>${esc(x.ip_address)}</span></td>
        <td>${esc(x.registered)}<br>${esc(x.account_type)}</td>
        <td>${esc(x.interest)}</td>
        <td>${x.visit_count || 0}</td>
        <td>${x.question_count || 0}</td>
        <td><select onchange="updateLeadStatus('${x.id}', this.value)">${["新客户","代理申请","福利申请","已联系","已开户","已入金","已激活","无效客户"].map(s => `<option ${x.status===s ? "selected" : ""}>${s}</option>`).join("")}</select></td>
        <td>${esc(x.notes)}</td>
      </tr>`;
    }).join("");
  };
})();
