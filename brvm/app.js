(function () {
  "use strict";

  let data = window.BRVM_RADAR_DATA || { meta: {}, signals: [], companies: [] };
  let companies = data.companies || [];
  const signalOrder = ["achat_fort", "achat", "neutre", "vente", "vente_forte"];
  const signalColors = {
    achat_fort: "#00C896",
    achat: "#00A07A",
    neutre: "#F5A623",
    vente: "#FF4D6A",
    vente_forte: "#FF2050"
  };
  const sectorColors = ["#3D8EFF", "#00C896", "#F5A623", "#FF4D6A", "#8F7BFF", "#46D7FF"];

  const state = {
    tab: "scoring",
    signal: "all",
    sector: "all",
    minScore: 0,
    search: "",
    sortKey: "score",
    sortDirection: "desc",
    selectedTicker: null,
    detail: null
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.search = document.getElementById("global-search");
    els.sector = document.getElementById("sector-filter");
    els.score = document.getElementById("score-filter");
    els.scoreValue = document.getElementById("score-value");
    els.signalFilters = document.getElementById("signal-filters");
    els.tabs = document.querySelector(".tabs");
    els.kpiGrid = document.getElementById("kpi-grid");
    els.chartColumn = document.getElementById("chart-column");
    els.primaryPanel = document.getElementById("primary-panel");
    els.tabContent = document.getElementById("tab-content");
    els.emptyState = document.getElementById("empty-state");
    els.analysisDate = document.getElementById("analysis-date");
    els.updatedAt = document.getElementById("updated-at");

    Promise.resolve(window.BRVM_RADAR_LIVE_READY).catch(() => {}).then(() => {
      data = window.BRVM_RADAR_DATA || data;
      companies = data.companies || [];
      hydrateMeta();
      populateSectors();
      bindControls();
      render();
    });
  }

  function hydrateMeta() {
    if (els.analysisDate && data.meta.asOfDate) {
      els.analysisDate.textContent = `Analyse ${formatDate(data.meta.asOfDate)}`;
    }
    if (els.updatedAt && data.meta.updatedAt) {
      els.updatedAt.textContent = `Maj ${data.meta.updatedAt}`;
    }
  }

  function populateSectors() {
    const sectors = Array.from(new Set(companies.map((company) => company.secteur))).sort();
    sectors.forEach((sector) => {
      const option = document.createElement("option");
      option.value = sector;
      option.textContent = sector;
      els.sector.appendChild(option);
    });
  }

  function bindControls() {
    els.search.addEventListener("input", (event) => {
      state.search = event.target.value.trim().toLowerCase();
      render();
    });

    els.sector.addEventListener("change", (event) => {
      state.sector = event.target.value;
      render();
    });

    els.score.addEventListener("input", (event) => {
      state.minScore = Number(event.target.value);
      els.scoreValue.textContent = String(state.minScore);
      render();
    });

    els.signalFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-signal]");
      if (!button) {
        return;
      }
      state.signal = button.dataset.signal;
      document.querySelectorAll("[data-signal]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });

    els.tabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tab]");
      if (!button) {
        return;
      }
      state.tab = button.dataset.tab;
      state.sortKey = defaultSortForTab(state.tab);
      state.sortDirection = state.sortKey === "ticker" || state.sortKey === "secteur" ? "asc" : "desc";
      document.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });

    els.kpiGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-detail-type][data-detail-id]");
      if (!button) {
        return;
      }
      openDetail(button.dataset.detailType, button.dataset.detailId);
    });

    els.tabContent.addEventListener("click", (event) => {
      if (event.target.closest("[data-detail-close]")) {
        closeDetail();
      }
    });
  }

  function render() {
    clearDetail(false);
    if (state.tab === "scoring") {
      renderScoring();
    } else if (state.tab === "prix") {
      renderPrices();
    } else if (state.tab === "fondamentaux") {
      renderFundamentals();
    } else if (state.tab === "actualites") {
      renderNews();
    } else {
      renderPipeline();
    }
    bindTableInteractions();
  }

  function applyFilters(sourceCompanies) {
    return sourceCompanies.filter((company) => {
      const matchesSignal = state.signal === "all" || (isScorable(company) && company.score.signal === state.signal);
      const matchesSector = state.sector === "all" || company.secteur === state.sector;
      const currentScore = scoreGlobal(company);
      const matchesScore = state.minScore === 0 || (currentScore != null && currentScore >= state.minScore);
      const haystack = `${company.ticker} ${company.nom}`.toLowerCase();
      const matchesSearch = !state.search || haystack.includes(state.search);
      return matchesSignal && matchesSector && matchesScore && matchesSearch;
    });
  }

  function sortRows(rows, key) {
    const sortKey = key || state.sortKey;
    const direction = state.sortDirection === "asc" ? 1 : -1;
    return rows.slice().sort((a, b) => {
      const left = valueForSort(a, sortKey);
      const right = valueForSort(b, sortKey);
      if (left === right) {
        return a.ticker.localeCompare(b.ticker) * direction;
      }
      if (left == null) {
        return 1;
      }
      if (right == null) {
        return -1;
      }
      if (typeof left === "string") {
        return left.localeCompare(String(right)) * direction;
      }
      return (left - right) * direction;
    });
  }

  function valueForSort(row, key) {
    if (key === "ticker") {
      return row.ticker;
    }
    if (key === "nom") {
      return row.nom;
    }
    if (key === "secteur") {
      return row.secteur;
    }
    if (key === "score") {
      return scoreGlobal(row);
    }
    if (key === "variation") {
      return row.prix.variation;
    }
    if (key === "signal") {
      return isScorable(row) ? signalOrder.indexOf(row.score.signal) : null;
    }
    if (key === "prix") {
      return row.prix.cloture;
    }
    if (key === "volume") {
      return row.prix.volume;
    }
    if (key === "per") {
      return row.fondamentaux.per;
    }
    if (key === "rendement") {
      return row.fondamentaux.rendement_div;
    }
    return scoreGlobal(row);
  }

  function currentCompanies() {
    return sortRows(applyFilters(companies));
  }

  function isScorable(company) {
    return Boolean(company && company.pipeline && company.pipeline.scoring_ok);
  }

  function scorableRows(rows) {
    return rows.filter(isScorable);
  }

  function scoreGlobal(company) {
    return isScorable(company) ? company.score.global : null;
  }

  function averageScoreKpi() {
    const configuredAverage = data.meta.kpis && data.meta.kpis.averageScore;
    if (Number.isFinite(Number(configuredAverage))) {
      return Number(configuredAverage);
    }
    return average(scorableRows(companies).map(scoreGlobal));
  }

  function renderScoring() {
    const rows = currentCompanies();
    const visibleScorable = scorableRows(rows);
    const allScorable = scorableRows(companies);
    renderKpis([
      {
        id: "companies",
        label: "Societes analysees",
        value: String(companies.length),
        meta: `${visibleScorable.length} scorables visibles`,
        spark: [31, 42, 48, 62, 68, 74, 82]
      },
      {
        id: "average-score",
        label: "Score moyen",
        value: formatNumber(averageScoreKpi(), 1),
        meta: "Modele descriptif",
        spark: allScorable.map(scoreGlobal).slice(0, 8)
      },
      {
        id: "buy-signals",
        label: "Signaux achat",
        value: String(countSignals(allScorable, ["achat_fort", "achat"])),
        meta: `${countSignals(rows, ["achat_fort", "achat"])} visibles filtres`,
        spark: [8, 9, 11, 12, 14, 16, 18]
      },
      {
        id: "last-update",
        label: "Derniere maj",
        value: data.meta.updatedAt || "14h32",
        meta: data.meta.mode === "mock" ? "Donnees mock statiques" : "Donnees chargees",
        spark: [62, 64, 63, 67, 66, 69, 68]
      }
    ]);

    els.chartColumn.innerHTML = [
      renderScoreHistogram(rows),
      renderSectorDonut(rows),
      renderSignalDistribution(rows)
    ].join("");

    els.primaryPanel.innerHTML = renderCompanyTable(rows);
    setEmpty(rows.length === 0);
  }

  function renderPrices() {
    const rows = currentCompanies();
    const variations = rows.map((company) => company.prix.variation);
    const totalVolume = rows.reduce((total, company) => total + company.prix.volume, 0);
    renderKpis([
      {
        id: "loaded-tickers",
        label: "Tickers charges",
        value: String(rows.length),
        meta: "Derniers cours disponibles",
        spark: rows.map((company) => company.prix.volume).slice(0, 8)
      },
      {
        id: "recent-price-date",
        label: "Date recente",
        value: formatDate(mostRecent(rows.map((company) => company.prix.date))),
        meta: "Prix de cloture",
        spark: [1, 2, 3, 4, 4, 5, 5]
      },
      {
        id: "median-variation",
        label: "Variation mediane",
        value: formatPercent(median(variations)),
        meta: "Sous filtres actifs",
        spark: variations
      },
      {
        id: "total-volume",
        label: "Volume total",
        value: formatNumber(totalVolume),
        meta: "Titres echanges",
        spark: rows.map((company) => company.prix.volume).reverse().slice(0, 8)
      }
    ]);

    els.chartColumn.innerHTML = [
      renderVariationPanel(rows),
      renderVolumeLeaders(rows)
    ].join("");
    els.primaryPanel.innerHTML = renderPriceTable(rows);
    setEmpty(rows.length === 0);
  }

  function renderFundamentals() {
    const rows = currentCompanies();
    const complete = rows.filter((company) => coverageStatus(company).label === "Complet").length;
    const partial = rows.filter((company) => coverageStatus(company).label === "Partiel").length;
    const excluded = rows.filter((company) => coverageStatus(company).label === "Exclu").length;
    renderKpis([
      {
        id: "complete-coverage",
        label: "Couverture complete",
        value: String(complete),
        meta: "Fondamentaux + scoring",
        spark: [complete, complete + 1, complete, complete + 2]
      },
      {
        id: "partial-coverage",
        label: "Couverture partielle",
        value: String(partial),
        meta: "Donnees incompletes",
        spark: [partial, partial + 1, partial + 1, partial]
      },
      {
        id: "exclusions",
        label: "Exclusions",
        value: String(excluded),
        meta: "Hors scoring strict",
        spark: [excluded, excluded, excluded + 1, excluded]
      },
      {
        id: "median-yield",
        label: "Rendement median",
        value: formatPercent(median(rows.map((company) => company.fondamentaux.rendement_div))),
        meta: "Dividende declare",
        spark: rows.map((company) => company.fondamentaux.rendement_div)
      }
    ]);

    els.chartColumn.innerHTML = renderFundamentalCoverage(rows);
    els.primaryPanel.innerHTML = renderFundamentalTable(rows);
    setEmpty(rows.length === 0);
  }

  function renderNews() {
    const rows = currentCompanies();
    const news = rows.flatMap((company) => company.actualites.map((item) => ({ ...item, ticker: company.ticker, nom: company.nom })));
    renderKpis([
      {
        id: "news-count",
        label: "Articles rattaches",
        value: String(news.length),
        meta: data.meta.mode === "mock" ? "Donnees mock" : "Donnees Neon",
        spark: [2, 4, 5, 7, 9, news.length]
      },
      {
        id: "positive-news",
        label: "Sentiment positif",
        value: String(news.filter((item) => item.sentiment === "positif").length),
        meta: "Signal textuel",
        spark: [1, 2, 3, 4, 5]
      },
      {
        id: "neutral-news",
        label: "Sentiment neutre",
        value: String(news.filter((item) => item.sentiment === "neutre").length),
        meta: "Signal textuel",
        spark: [2, 2, 3, 3, 4]
      },
      {
        id: "negative-news",
        label: "Sentiment negatif",
        value: String(news.filter((item) => item.sentiment === "negatif").length),
        meta: "Signal textuel",
        spark: [1, 2, 2, 3, 4]
      }
    ]);

    els.chartColumn.innerHTML = renderSentimentPanel(news);
    els.primaryPanel.innerHTML = renderNewsTable(news);
    setEmpty(news.length === 0, "Aucune actualite ne correspond aux filtres actifs.");
  }

  function renderPipeline() {
    const rows = currentCompanies();
    renderKpis([
      {
        id: "price-flow",
        label: "Flux prix",
        value: coverageValue(rows, "prix_ok"),
        meta: "Export statique",
        spark: [8, 10, 12, 14, rows.length]
      },
      {
        id: "scoring-flow",
        label: "Flux scoring",
        value: coverageValue(rows, "scoring_ok"),
        meta: "Signal descriptif",
        spark: [7, 9, 11, 12, rows.filter((company) => company.pipeline.scoring_ok).length]
      },
      {
        id: "fundamentals-flow",
        label: "Fondamentaux",
        value: coverageValue(rows, "fondamentaux_ok"),
        meta: data.meta.mode === "mock" ? "Contrat Neon cible" : "Donnees Neon",
        spark: [6, 8, 12, 13, rows.length]
      },
      {
        id: "news-flow",
        label: "Actualites",
        value: coverageValue(rows, "actualites_ok"),
        meta: "Couverture rattachee",
        spark: [4, 7, 8, 9, rows.filter((company) => company.pipeline.actualites_ok).length]
      }
    ]);

    els.chartColumn.innerHTML = renderPipelineOverview(rows);
    els.primaryPanel.innerHTML = renderPipelineTable(rows);
    setEmpty(rows.length === 0);
  }

  function renderKpis(items) {
    els.kpiGrid.innerHTML = items.map((item) => `
      <article class="kpi-card" role="button" tabindex="0" data-detail-type="indicator" data-detail-id="${escapeHtml(item.id || slugify(item.label))}">
        <div class="kpi-label">${escapeHtml(item.label)}</div>
        <div class="kpi-value">${escapeHtml(item.value)}</div>
        <div class="kpi-meta">${escapeHtml(item.meta)}</div>
        ${renderSparkline(item.spark || [], item.color || "#3D8EFF")}
      </article>
    `).join("");
  }

  function renderSparkline(values, color) {
    const safeValues = values.filter((value) => Number.isFinite(Number(value))).map(Number);
    if (safeValues.length < 2) {
      return '<svg class="kpi-sparkline" viewBox="0 0 120 28" aria-hidden="true"></svg>';
    }
    const min = Math.min(...safeValues);
    const max = Math.max(...safeValues);
    const range = max - min || 1;
    const points = safeValues.map((value, index) => {
      const x = (index / (safeValues.length - 1)) * 116 + 2;
      const y = 24 - ((value - min) / range) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `
      <svg class="kpi-sparkline" viewBox="0 0 120 28" aria-hidden="true">
        <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>
      </svg>
    `;
  }

  function renderScoreHistogram(rows) {
    const scoringRows = scorableRows(rows);
    const buckets = Array.from({ length: 10 }, () => 0);
    scoringRows.forEach((company) => {
      const index = Math.min(9, Math.max(0, Math.floor(scoreGlobal(company) / 10)));
      buckets[index] += 1;
    });
    const max = Math.max(1, ...buckets);
    const bars = buckets.map((count, index) => {
      const width = 18;
      const gap = 8;
      const height = (count / max) * 98;
      const x = 18 + index * (width + gap);
      const y = 120 - height;
      return `
        <rect x="${x}" y="${y.toFixed(1)}" width="${width}" height="${height.toFixed(1)}" rx="5" fill="rgba(61,142,255,0.75)"></rect>
        <text x="${x + width / 2}" y="142" text-anchor="middle" class="axis-label">${index * 10}</text>
      `;
    }).join("");
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Distribution</div>
            <h2 class="panel-title">Scores globaux</h2>
          </div>
          <span class="panel-subtle">${scoringRows.length} lignes</span>
        </div>
        <svg class="chart-svg" viewBox="0 0 292 156" role="img" aria-label="Histogramme des scores">
          <line x1="14" y1="120" x2="280" y2="120" stroke="rgba(122,127,154,0.25)"></line>
          ${bars}
        </svg>
      </article>
    `;
  }

  function renderSectorDonut(rows) {
    const counts = countBy(rows, (company) => company.secteur);
    const entries = Object.entries(counts);
    const total = rows.length || 1;
    let offset = 0;
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const circles = entries.map(([sector, count], index) => {
      const dash = (count / total) * circumference;
      const circle = `
        <circle cx="66" cy="66" r="${radius}" fill="none" stroke="${sectorColors[index % sectorColors.length]}" stroke-width="18"
          stroke-dasharray="${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"
          transform="rotate(-90 66 66)"></circle>
      `;
      offset += dash;
      return circle;
    }).join("");
    const legend = entries.map(([sector, count], index) => `
      <div class="stack-row">
        <span>${escapeHtml(sector)}</span>
        <span class="stack-track"><span class="stack-fill" style="width:${Math.round((count / total) * 100)}%;background:${sectorColors[index % sectorColors.length]}"></span></span>
        <strong>${count}</strong>
      </div>
    `).join("");
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Secteurs</div>
            <h2 class="panel-title">Repartition radar</h2>
          </div>
        </div>
        <svg class="chart-svg" viewBox="0 0 132 132" role="img" aria-label="Repartition sectorielle">
          <circle cx="66" cy="66" r="${radius}" fill="none" stroke="rgba(42,45,62,0.95)" stroke-width="18"></circle>
          ${circles}
          <text x="66" y="62" text-anchor="middle" class="chart-label">Total</text>
          <text x="66" y="80" text-anchor="middle" fill="#F0F2FF" font-size="18" font-weight="800">${rows.length}</text>
        </svg>
        <div class="stack-list">${legend || emptyInline("Aucun secteur")}</div>
      </article>
    `;
  }

  function renderSignalDistribution(rows) {
    const scoringRows = scorableRows(rows);
    const total = scoringRows.length || 1;
    const rowsHtml = signalOrder.map((signal) => {
      const count = scoringRows.filter((company) => company.score.signal === signal).length;
      return `
        <div class="stack-row">
          <span>${signalLabel(signal)}</span>
          <span class="stack-track"><span class="stack-fill" style="width:${Math.round((count / total) * 100)}%;background:${signalColors[signal]}"></span></span>
          <strong>${count}</strong>
        </div>
      `;
    }).join("");
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Signal modele</div>
            <h2 class="panel-title">Cinq niveaux officiels</h2>
          </div>
        </div>
        <div class="stack-list">${rowsHtml}</div>
      </article>
    `;
  }

  function renderVariationPanel(rows) {
    const sorted = rows.slice().sort((a, b) => b.prix.variation - a.prix.variation).slice(0, 6);
    const rowsHtml = sorted.map((company) => {
      const value = Math.min(100, Math.abs(company.prix.variation) * 18);
      return `
        <div class="stack-row">
          <span>${escapeHtml(company.ticker)}</span>
          <span class="stack-track"><span class="stack-fill" style="width:${value}%;background:${company.prix.variation >= 0 ? "#00C896" : "#FF4D6A"}"></span></span>
          <strong class="${variationClass(company.prix.variation)}">${formatPercent(company.prix.variation)}</strong>
        </div>
      `;
    }).join("");
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Prix</div>
            <h2 class="panel-title">Variations recentes</h2>
          </div>
        </div>
        <div class="stack-list">${rowsHtml || emptyInline("Aucun prix")}</div>
      </article>
    `;
  }

  function renderVolumeLeaders(rows) {
    const sorted = rows.slice().sort((a, b) => b.prix.volume - a.prix.volume).slice(0, 7);
    const max = Math.max(1, ...sorted.map((company) => company.prix.volume));
    const rowsHtml = sorted.map((company) => `
      <div class="stack-row">
        <span>${escapeHtml(company.ticker)}</span>
        <span class="stack-track"><span class="stack-fill" style="width:${Math.round((company.prix.volume / max) * 100)}%;background:#3D8EFF"></span></span>
        <strong>${formatNumber(company.prix.volume)}</strong>
      </div>
    `).join("");
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Liquidite</div>
            <h2 class="panel-title">Volumes principaux</h2>
          </div>
        </div>
        <div class="stack-list">${rowsHtml || emptyInline("Aucun volume")}</div>
      </article>
    `;
  }

  function renderFundamentalCoverage(rows) {
    const labels = [
      ["Complet", rows.filter((company) => coverageStatus(company).label === "Complet").length, "#00C896"],
      ["Partiel", rows.filter((company) => coverageStatus(company).label === "Partiel").length, "#F5A623"],
      ["Exclu", rows.filter((company) => coverageStatus(company).label === "Exclu").length, "#FF4D6A"]
    ];
    const total = rows.length || 1;
    const coverage = labels.map(([label, count, color]) => `
      <div class="coverage-row">
        <span>${label}</span>
        <span class="stack-track"><span class="stack-fill" style="width:${Math.round((count / total) * 100)}%;background:${color}"></span></span>
        <strong>${count}</strong>
      </div>
    `).join("");
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Fondamentaux</div>
            <h2 class="panel-title">Couverture des champs</h2>
          </div>
        </div>
        <div class="coverage-grid">${coverage}</div>
      </article>
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Ratios</div>
            <h2 class="panel-title">PER et rendement</h2>
          </div>
        </div>
        <div class="stack-list">
          ${rows.slice(0, 7).map((company) => `
            <div class="stack-row">
              <span>${escapeHtml(company.ticker)}</span>
              <span>PER ${formatNullable(company.fondamentaux.per)}</span>
              <strong>${formatPercent(company.fondamentaux.rendement_div)}</strong>
            </div>
          `).join("") || emptyInline("Aucun ratio")}
        </div>
      </article>
    `;
  }

  function renderSentimentPanel(news) {
    const counts = countBy(news, (item) => item.sentiment);
    const total = news.length || 1;
    const labels = [
      ["positif", "#00C896"],
      ["neutre", "#F5A623"],
      ["negatif", "#FF4D6A"]
    ];
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Actualites</div>
            <h2 class="panel-title">Sentiment rattache</h2>
          </div>
        </div>
        <div class="stack-list">
          ${labels.map(([label, color]) => `
            <div class="stack-row">
              <span>${sentimentLabel(label)}</span>
              <span class="stack-track"><span class="stack-fill" style="width:${Math.round(((counts[label] || 0) / total) * 100)}%;background:${color}"></span></span>
              <strong>${counts[label] || 0}</strong>
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }

  function renderPipelineOverview(rows) {
    const priceOk = rows.filter((company) => company.pipeline.prix_ok).length;
    const scoringOk = rows.filter((company) => company.pipeline.scoring_ok).length;
    const fundamentalsOk = rows.filter((company) => company.pipeline.fondamentaux_ok).length;
    const newsOk = rows.filter((company) => company.pipeline.actualites_ok).length;
    const tiles = [
      ["Prix", "prix", priceOk, rows.length, "Donnees fraiches"],
      ["Scoring", "scoring", scoringOk, rows.length, "Signal descriptif"],
      ["Fondamentaux", "fondamentaux", fundamentalsOk, rows.length, "Couverture financiere"],
      ["Actualites", "actualites", newsOk, rows.length, "Articles rattaches"]
    ];
    return `
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Pipeline</div>
            <h2 class="panel-title">Flux de donnees</h2>
          </div>
          <span class="badge status-ok">${data.meta.mode === "mock" ? "Mock" : "Neon"}</span>
        </div>
        <div class="pipeline-grid">
          ${tiles.map(([name, flow, ok, total, note]) => `
            <div class="pipeline-tile">
              <div class="pipeline-title">
                <span>${name}</span>
                <span class="badge ${ok === total ? "status-ok" : "status-partial"}">${ok}/${total || 0}</span>
              </div>
              <span class="pipeline-meta">${note}<br>${formatDate(flowDate(flow))}</span>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="card">
        <div class="panel-header">
          <div>
            <div class="panel-eyebrow">Vigilances</div>
            <h2 class="panel-title">Exclusions et couverture</h2>
          </div>
        </div>
        <div class="stack-list">
          ${rows.filter((company) => company.pipeline.exclusion_reason).map((company) => `
            <div class="stack-row">
              <span>${escapeHtml(company.ticker)}</span>
              <span>${escapeHtml(company.pipeline.exclusion_reason)}</span>
              <strong>Exclu</strong>
            </div>
          `).join("") || emptyInline("Aucune exclusion sous filtres")}
        </div>
      </article>
    `;
  }

  function renderCompanyTable(rows) {
    return tableCard("Scoring", "Signal modele descriptif", `
      <table>
        <thead>
          <tr>
            ${sortableHeader("Ticker", "ticker")}
            ${sortableHeader("Nom", "nom")}
            ${sortableHeader("Secteur", "secteur")}
            ${sortableHeader("Score", "score")}
            ${sortableHeader("Signal modele", "signal")}
            ${sortableHeader("Prix", "prix")}
            ${sortableHeader("Variation", "variation")}
            <th>Fondamentaux</th>
            <th>Actualites</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((company) => `
            <tr data-row-ticker="${escapeHtml(company.ticker)}" class="${state.selectedTicker === company.ticker ? "is-selected" : ""}">
              <td class="ticker-cell">${escapeHtml(company.ticker)}</td>
              <td class="name-cell" title="${escapeHtml(company.nom)}">${escapeHtml(company.nom)}</td>
              <td>${escapeHtml(company.secteur)}</td>
              <td><span class="score-pill">${formatScore(company)}</span></td>
              <td>${scoringSignalBadge(company)}</td>
              <td>${formatCurrency(company.prix.cloture)}</td>
              <td class="${variationClass(company.prix.variation)}">${formatPercent(company.prix.variation)}</td>
              <td>${coverageBadge(company)}</td>
              <td>${company.actualites.length}</td>
            </tr>
          `).join("") || emptyRow(9)}
        </tbody>
      </table>
    `);
  }

  function renderPriceTable(rows) {
    const maxVolume = Math.max(1, ...rows.map((company) => company.prix.volume));
    return tableCard("Prix", "Derniers cours disponibles", `
      <table>
        <thead>
          <tr>
            ${sortableHeader("Ticker", "ticker")}
            ${sortableHeader("Nom", "nom")}
            <th>Secteur</th>
            <th>Date</th>
            ${sortableHeader("Prix cloture", "prix")}
            ${sortableHeader("Variation", "variation")}
            ${sortableHeader("Volume", "volume")}
            <th>Capitalisation</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((company) => `
            <tr data-row-ticker="${escapeHtml(company.ticker)}" class="${state.selectedTicker === company.ticker ? "is-selected" : ""}">
              <td class="ticker-cell">${escapeHtml(company.ticker)}</td>
              <td class="name-cell" title="${escapeHtml(company.nom)}">${escapeHtml(company.nom)}</td>
              <td>${escapeHtml(company.secteur)}</td>
              <td>${escapeHtml(formatDate(company.prix.date))}</td>
              <td>${formatCurrency(company.prix.cloture)}</td>
              <td class="${variationClass(company.prix.variation)}">${formatPercent(company.prix.variation)}</td>
              <td>
                <span class="metric-bar" aria-hidden="true"><span style="width:${Math.round((company.prix.volume / maxVolume) * 100)}%"></span></span>
                ${formatNumber(company.prix.volume)}
              </td>
              <td>${formatMarketCap(company.prix.capitalisation)}</td>
              <td>${escapeHtml(company.prix.source)}</td>
            </tr>
          `).join("") || emptyRow(9)}
        </tbody>
      </table>
    `);
  }

  function renderFundamentalTable(rows) {
    return tableCard("Fondamentaux", "Couverture et ratios publies", `
      <table>
        <thead>
          <tr>
            ${sortableHeader("Ticker", "ticker")}
            ${sortableHeader("Nom", "nom")}
            <th>Secteur</th>
            <th>Annee</th>
            <th>Periode</th>
            ${sortableHeader("PER", "per")}
            <th>Price book</th>
            <th>Dividende</th>
            ${sortableHeader("Rendement", "rendement")}
            <th>Resultat net</th>
            <th>Couverture</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((company) => `
            <tr data-row-ticker="${escapeHtml(company.ticker)}" class="${state.selectedTicker === company.ticker ? "is-selected" : ""}">
              <td class="ticker-cell">${escapeHtml(company.ticker)}</td>
              <td class="name-cell" title="${escapeHtml(company.nom)}">${escapeHtml(company.nom)}</td>
              <td>${escapeHtml(company.secteur)}</td>
              <td>${company.fondamentaux.annee}</td>
              <td>${escapeHtml(company.fondamentaux.periode)}</td>
              <td>${formatNullable(company.fondamentaux.per)}</td>
              <td>${formatNullable(company.fondamentaux.price_book)}</td>
              <td>${formatCurrency(company.fondamentaux.dividende)}</td>
              <td>${formatPercent(company.fondamentaux.rendement_div)}</td>
              <td>${formatMarketCap(company.fondamentaux.resultat_net)}</td>
              <td>${coverageBadge(company)}</td>
            </tr>
          `).join("") || emptyRow(11)}
        </tbody>
      </table>
    `);
  }

  function renderNewsTable(news) {
    const sorted = news.slice().sort((a, b) => b.date.localeCompare(a.date));
    return tableCard("Actualites", "Sentiment rattache aux societes filtrees", `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Ticker</th>
            <th>Source</th>
            <th>Sentiment</th>
            <th>Score sentiment</th>
            <th>Titre</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((item) => `
            <tr data-row-ticker="${escapeHtml(item.ticker)}" class="${state.selectedTicker === item.ticker ? "is-selected" : ""}">
              <td>${escapeHtml(formatDate(item.date))}</td>
              <td class="ticker-cell">${escapeHtml(item.ticker)}</td>
              <td>${escapeHtml(item.source)}</td>
              <td><span class="badge sentiment-${escapeHtml(item.sentiment)}">${sentimentLabel(item.sentiment)}</span></td>
              <td>${formatNumber(item.score_sent, 2)}</td>
              <td class="name-cell" title="${escapeHtml(item.titre)}">${escapeHtml(item.titre)}</td>
            </tr>
          `).join("") || emptyRow(6)}
        </tbody>
      </table>
    `);
  }

  function renderPipelineTable(rows) {
    return tableCard("Pipeline", "Statuts lecture seule par societe", `
      <table>
        <thead>
          <tr>
            ${sortableHeader("Ticker", "ticker")}
            ${sortableHeader("Nom", "nom")}
            <th>Prix</th>
            <th>Fondamentaux</th>
            <th>Actualites</th>
            <th>Scoring</th>
            <th>Couverture</th>
            <th>Vigilance</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((company) => `
            <tr data-row-ticker="${escapeHtml(company.ticker)}" class="${state.selectedTicker === company.ticker ? "is-selected" : ""}">
              <td class="ticker-cell">${escapeHtml(company.ticker)}</td>
              <td class="name-cell" title="${escapeHtml(company.nom)}">${escapeHtml(company.nom)}</td>
              <td>${statusWithDate(company.pipeline.prix_ok, flowDate("prix", company))}</td>
              <td>${statusWithDate(company.pipeline.fondamentaux_ok, flowDate("fondamentaux", company))}</td>
              <td>${statusWithDate(company.pipeline.actualites_ok, flowDate("actualites", company))}</td>
              <td>${scoringStatusWithDate(company)}</td>
              <td>${coverageBadge(company)}</td>
              <td>${escapeHtml(company.pipeline.exclusion_reason || "Aucune")}</td>
            </tr>
          `).join("") || emptyRow(8)}
        </tbody>
      </table>
    `);
  }

  function tableCard(title, caption, tableHtml) {
    return `
      <article class="table-card">
        <div class="panel-header">
          <div>
            <div class="table-caption">${escapeHtml(caption)}</div>
            <h2 class="panel-title">${escapeHtml(title)}</h2>
          </div>
          <span class="panel-subtle">${state.sortKey} ${state.sortDirection}</span>
        </div>
        <div class="table-wrap">${tableHtml}</div>
      </article>
    `;
  }

  function sortableHeader(label, key) {
    const marker = state.sortKey === key ? (state.sortDirection === "asc" ? "up" : "down") : "";
    return `<th><button type="button" data-sort="${key}">${escapeHtml(label)} <span>${marker}</span></button></th>`;
  }

  function bindTableInteractions() {
    els.primaryPanel.querySelectorAll("[data-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.sort;
        if (state.sortKey === key) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDirection = key === "ticker" || key === "nom" || key === "secteur" ? "asc" : "desc";
        }
        render();
      });
    });

    els.primaryPanel.querySelectorAll("[data-row-ticker]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedTicker = row.dataset.rowTicker;
        els.primaryPanel.querySelectorAll("[data-row-ticker]").forEach((item) => item.classList.toggle("is-selected", item === row));
        openDetail("company", row.dataset.rowTicker);
      });
    });
  }

  function openDetail(type, id) {
    state.detail = { type, id };
    if (type === "company") {
      state.selectedTicker = id;
    }
    renderDetail();
  }

  function closeDetail() {
    clearDetail(true);
  }

  function clearDetail(renderPanel) {
    state.detail = null;
    if (els.tabContent) {
      els.tabContent.innerHTML = "";
      els.tabContent.classList.remove("is-visible");
    }
    if (renderPanel) {
      els.primaryPanel.querySelectorAll("[data-row-ticker]").forEach((item) => item.classList.remove("is-selected"));
    }
  }

  function renderDetail() {
    if (!state.detail || !els.tabContent) {
      return;
    }
    const html = state.detail.type === "company"
      ? renderCompanyDetail(companies.find((company) => company.ticker === state.detail.id))
      : renderIndicatorDetail(indicatorDetail(state.detail.id));
    els.tabContent.innerHTML = html;
    els.tabContent.classList.add("is-visible");
  }

  function renderCompanyDetail(company) {
    if (!company) {
      return detailShell("Societe introuvable", "Aucune ligne ne correspond a cet identifiant.", "");
    }
    const fundamentals = company.fondamentaux || {};
    const price = company.prix || {};
    const pipeline = company.pipeline || {};
    const news = company.actualites || [];
    const scoreLabel = isScorable(company) ? signalLabel(company.score.signal) : "Exclu";
    const fmtBpa = fundamentals.bpa != null ? formatCurrency(fundamentals.bpa) : "n/d";
    const fmtRoe = fundamentals.roe != null ? formatPercent(fundamentals.roe) : "n/d";
    const fmtNbActions = fundamentals.nombre_actions != null ? formatNumber(fundamentals.nombre_actions) : "n/d";
    const fmtValCompt = fundamentals.valeur_comptable_action != null ? formatCurrency(fundamentals.valeur_comptable_action) : "n/d";
    const fmtPcf = fundamentals.p_cf != null ? formatNullable(fundamentals.p_cf) : "n/d";
    const anneeLabel = `${fundamentals.annee || "n.d."} — ${fundamentals.periode || "n.d."}`;
    return detailShell(
      `${company.ticker} - ${company.nom}`,
      `${company.secteur || "Secteur n.d."} / ${company.pays || "Pays n.d."}`,
      `
        <div class="detail-section">
          <h3>Fondamentaux <small>${escapeHtml(anneeLabel)}</small></h3>
          <div class="detail-grid">
            ${detailMetric("Score", formatScore(company), scoreLabel)}
            ${detailMetric("Prix", formatCurrency(price.cloture), `${formatDate(price.date)} / ${formatPercent(price.variation)}`)}
            ${detailMetric("PER", formatNullable(fundamentals.per), `PBR: ${formatNullable(fundamentals.price_book)}`)}
            ${detailMetric("BPA", fmtBpa, `ROE: ${fmtRoe}`)}
            ${detailMetric("Capitalisation", price.capitalisation ? formatMarketCap(price.capitalisation) : "n/d", `Vol: ${formatNumber(price.volume)}`)}
            ${detailMetric("Nb. actions", fmtNbActions, `Val. compt: ${fmtValCompt}`)}
            ${detailMetric("Resultat net", formatMarketCap(fundamentals.resultat_net), `Div: ${fundamentals.dividende != null ? formatCurrency(fundamentals.dividende) : "n/d"}`)}
            ${detailMetric("P/CF", fmtPcf, `Rend. div: ${formatPercent(fundamentals.rendement_div)}`)}
          </div>
        </div>
        <div class="detail-section">
          <h3>Actualites</h3>
          <div class="detail-list">${news.map((item) => `
            <div class="detail-row">
              <span>${escapeHtml(formatDate(item.date))}</span>
              <strong>${escapeHtml(item.source || "n.d.")}</strong>
              <span>${escapeHtml(item.titre || "Sans titre")}</span>
            </div>
          `).join("") || emptyInline("Aucune actualite rattachee")}</div>
        </div>
        <div class="detail-section">
          <h3>Pipeline</h3>
          <div class="detail-grid">
            ${detailMetric("Prix", pipeline.prix_ok ? "OK" : "Partiel", formatDate(flowDate("prix", company)))}
            ${detailMetric("Fondamentaux", pipeline.fondamentaux_ok ? "OK" : "Partiel", formatDate(flowDate("fondamentaux", company)))}
            ${detailMetric("Actualites", pipeline.actualites_ok ? "OK" : "Partiel", formatDate(flowDate("actualites", company)))}
            ${detailMetric("Scoring", pipeline.scoring_ok ? "OK" : "Exclu", pipeline.exclusion_reason || formatDate(flowDate("scoring", company)))}
          </div>
        </div>
      `
    );
  }

  function renderIndicatorDetail(detail) {
    return detailShell(
      detail.label,
      detail.note,
      `
        <div class="detail-grid">
          ${detailMetric("Valeur", detail.value, detail.meta)}
          ${detailMetric("Societes visibles", String(currentCompanies().length), "Sous filtres actifs")}
          ${detailMetric("Mode", data.meta.mode === "mock" ? "Mock" : "Neon", "Lecture seule")}
          ${detailMetric("Analyse", formatDate(data.meta.asOfDate), "Derniere date connue")}
        </div>
      `
    );
  }

  function indicatorDetail(id) {
    const rows = currentCompanies();
    const allScorable = scorableRows(companies);
    const details = {
      "companies": { label: "Societes analysees", value: String(companies.length), meta: `${scorableRows(rows).length} scorables visibles`, note: "Couverture du referentiel Radar." },
      "average-score": { label: "Score moyen", value: formatNumber(averageScoreKpi(), 1), meta: "Modele descriptif", note: "Moyenne des societes scorables." },
      "buy-signals": { label: "Signaux achat", value: String(countSignals(allScorable, ["achat_fort", "achat"])), meta: "Achat fort + achat", note: "Signal modele, sans decision automatique." },
      "recent-price-date": { label: "Date recente", value: formatDate(mostRecent(rows.map((company) => company.prix.date))), meta: "Prix de cloture", note: "Date prix la plus recente sous filtres." },
      "last-update": { label: "Derniere maj", value: data.meta.updatedAt || "n.d.", meta: "Chargement Radar", note: "Heure de generation des donnees." },
      "loaded-tickers": { label: "Tickers charges", value: String(rows.length), meta: "Sous filtres actifs", note: "Nombre de lignes prix visibles." },
      "median-variation": { label: "Variation mediane", value: formatPercent(median(rows.map((company) => company.prix.variation))), meta: "Sous filtres actifs", note: "Median des variations prix." },
      "total-volume": { label: "Volume total", value: formatNumber(rows.reduce((total, company) => total + company.prix.volume, 0)), meta: "Titres echanges", note: "Somme des volumes visibles." }
    };
    return details[id] || { label: id || "Indicateur", value: "n.d.", meta: "Identifiant inconnu", note: "Carte generique extensible." };
  }

  function detailShell(title, subtitle, body) {
    return `
      <article class="detail-panel">
        <div class="detail-actions">
          <div>
            <div class="panel-eyebrow">Detail</div>
            <h2 class="panel-title">${escapeHtml(title)}</h2>
            <p>${escapeHtml(subtitle)}</p>
          </div>
          <button type="button" data-detail-close>Retour</button>
        </div>
        ${body}
      </article>
    `;
  }

  function detailMetric(label, value, meta) {
    return `
      <div class="detail-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(meta)}</small>
      </div>
    `;
  }

  function setEmpty(show, message) {
    if (!els.emptyState) {
      return;
    }
    els.emptyState.hidden = !show;
    if (message) {
      els.emptyState.querySelector("span").textContent = message;
    } else {
      els.emptyState.querySelector("span").textContent = "Les filtres actifs ne retournent aucune societe.";
    }
  }

  function signalBadge(signal) {
    return `<span class="badge ${signalClass(signal)}">${signalLabel(signal)}</span>`;
  }

  function scoringSignalBadge(company) {
    if (!isScorable(company)) {
      return '<span class="badge status-ko">Exclu</span>';
    }
    return signalBadge(company.score.signal);
  }

  function signalLabel(signal) {
    const labels = {
      achat_fort: "Achat Fort",
      achat: "Achat",
      neutre: "Neutre",
      vente: "Vente",
      vente_forte: "Vente Forte"
    };
    return labels[signal] || signal;
  }

  function signalClass(signal) {
    return `signal-${signal}`;
  }

  function statusBadge(ok) {
    return ok ? '<span class="badge status-ok">OK</span>' : '<span class="badge status-partial">Partiel</span>';
  }

  function statusWithDate(ok, date) {
    return `${statusBadge(ok)}<span class="pipeline-date">${escapeHtml(formatDate(date))}</span>`;
  }

  function scoringStatusWithDate(company) {
    if (!isScorable(company)) {
      return '<span class="badge status-ko">Exclu</span><span class="pipeline-date">n.d.</span>';
    }
    return statusWithDate(true, flowDate("scoring", company));
  }

  function coverageBadge(company) {
    const status = coverageStatus(company);
    return `<span class="badge ${status.className}">${status.label}</span>`;
  }

  function coverageStatus(company) {
    if (!company.pipeline.scoring_ok) {
      return { label: "Exclu", className: "status-ko" };
    }
    const flags = ["prix_ok", "fondamentaux_ok", "actualites_ok", "scoring_ok"];
    const ok = flags.filter((key) => company.pipeline[key]).length;
    if (ok === flags.length) {
      return { label: "Complet", className: "status-ok" };
    }
    return { label: "Partiel", className: "status-partial" };
  }

  function variationClass(value) {
    if (value > 0) {
      return "variation-positive";
    }
    if (value < 0) {
      return "variation-negative";
    }
    return "variation-flat";
  }

  function sentimentLabel(sentiment) {
    const labels = {
      positif: "Positif",
      neutre: "Neutre",
      negatif: "Negatif"
    };
    return labels[sentiment] || sentiment;
  }

  function coverageValue(rows, key) {
    if (rows.length === 0) {
      return "0/0";
    }
    return `${rows.filter((company) => company.pipeline[key]).length}/${rows.length}`;
  }

  function flowDate(flow, company) {
    const dates = data.meta.fluxDates || {};
    if (company && flow === "prix") {
      return company.prix.date || dates.prix || "";
    }
    if (company && flow === "scoring") {
      return isScorable(company) ? (company.score.date || dates.scoring || "") : "";
    }
    if (company && flow === "fondamentaux") {
      return company.fondamentaux.updated_at || dates.fondamentaux || "";
    }
    if (company && flow === "actualites") {
      return mostRecent(company.actualites.map((item) => item.date)) || dates.actualites || "";
    }
    return dates[flow] || "";
  }

  function countSignals(rows, signals) {
    return rows.filter((company) => isScorable(company) && signals.includes(company.score.signal)).length;
  }

  function countBy(rows, getKey) {
    return rows.reduce((counts, row) => {
      const key = getKey(row);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }

  function average(values) {
    const numeric = values.filter((value) => Number.isFinite(Number(value))).map(Number);
    if (!numeric.length) {
      return 0;
    }
    return numeric.reduce((total, value) => total + value, 0) / numeric.length;
  }

  function median(values) {
    const numeric = values.filter((value) => Number.isFinite(Number(value))).map(Number).sort((a, b) => a - b);
    if (!numeric.length) {
      return 0;
    }
    const middle = Math.floor(numeric.length / 2);
    if (numeric.length % 2) {
      return numeric[middle];
    }
    return (numeric[middle - 1] + numeric[middle]) / 2;
  }

  function mostRecent(dates) {
    return dates.filter(Boolean).sort().at(-1);
  }

  function formatScore(company) {
    const value = scoreGlobal(company);
    if (value == null) {
      return "n.d.";
    }
    return formatNumber(value, 1);
  }

  function formatDate(value) {
    if (!value) {
      return "n.d.";
    }
    const text = String(value);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      return text;
    }
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  function formatNumber(value, digits) {
    if (!Number.isFinite(Number(value))) {
      return "n/d";
    }
    const maximumFractionDigits = digits == null ? 0 : digits;
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits,
      minimumFractionDigits: digits == null ? 0 : digits
    }).format(Number(value));
  }

  function formatCurrency(value) {
    if (!Number.isFinite(Number(value))) {
      return "n/d";
    }
    return `${formatNumber(value)} FCFA`;
  }

  function formatMarketCap(value) {
    if (!Number.isFinite(Number(value))) {
      return "n/d";
    }
    const absolute = Math.abs(Number(value));
    const sign = Number(value) < 0 ? "-" : "";
    if (absolute >= 1000000000000) {
      return `${sign}${formatNumber(absolute / 1000000000000, 2)} T FCFA`;
    }
    if (absolute >= 1000000000) {
      return `${sign}${formatNumber(absolute / 1000000000, 1)} Md FCFA`;
    }
    if (absolute >= 1000000) {
      return `${sign}${formatNumber(absolute / 1000000, 1)} M FCFA`;
    }
    return `${sign}${formatNumber(absolute)} FCFA`;
  }

  function formatPercent(value) {
    if (!Number.isFinite(Number(value))) {
      return "n/d";
    }
    const sign = Number(value) > 0 ? "+" : "";
    return `${sign}${formatNumber(value, 2)}%`;
  }

  function formatNullable(value) {
    if (value == null || !Number.isFinite(Number(value))) {
      return "n/d";
    }
    return formatNumber(value, 1);
  }

  function emptyRow(colspan) {
    return `<tr><td colspan="${colspan}">Aucun resultat sous filtres actifs.</td></tr>`;
  }

  function emptyInline(text) {
    return `<span class="panel-subtle">${escapeHtml(text)}</span>`;
  }

  function defaultSortForTab(tab) {
    const defaults = {
      scoring: "score",
      prix: "variation",
      fondamentaux: "rendement",
      actualites: "score",
      pipeline: "ticker"
    };
    return defaults[tab] || "score";
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "indicator";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.BRVM_RADAR_APP = {
    applyFilters,
    sortRows,
    renderScoring,
    renderPrices,
    renderFundamentals,
    renderNews,
    renderPipeline,
    renderScoreHistogram,
    renderSectorDonut,
    formatDate,
    openDetail,
    closeDetail,
    renderDetail,
    renderCompanyDetail,
    renderIndicatorDetail
  };
})();
