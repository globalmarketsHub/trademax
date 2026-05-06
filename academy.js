function termLetter(name) {
  const match = name.match(/[（(]([A-Za-z])/);
  if (match) return match[1].toUpperCase();
  const first = name.trim()[0] || "#";
  return /[A-Za-z]/.test(first) ? first.toUpperCase() : "#";
}

function buildLetterOptions() {
  const select = document.getElementById("termLetter");
  if (!select || select.dataset.ready) return;
  const letters = [...new Set(ACADEMY_TERMS.map(t => termLetter(t.name)))].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  letters.forEach(letter => {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter === "#" ? "中文/其他" : letter;
    select.appendChild(option);
  });
  select.dataset.ready = "1";
}

function renderAcademyTerms() {
  const grid = document.getElementById("termGrid");
  const count = document.getElementById("termCount");
  if (!grid) return;

  const q = (document.getElementById("termSearch")?.value || "").trim().toLowerCase();
  const letter = document.getElementById("termLetter")?.value || "";
  const filtered = ACADEMY_TERMS.filter(term => {
    const text = `${term.name} ${term.desc}`.toLowerCase();
    const matchesQuery = !q || text.includes(q);
    const matchesLetter = !letter || termLetter(term.name) === letter;
    return matchesQuery && matchesLetter;
  });

  if (count) count.textContent = `当前显示 ${filtered.length} / ${ACADEMY_TERMS.length} 条术语`;
  grid.innerHTML = filtered.map(term => `
    <article class="term-card">
      <b>${term.name}</b>
      <p>${term.desc}</p>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  buildLetterOptions();
  renderAcademyTerms();
});
